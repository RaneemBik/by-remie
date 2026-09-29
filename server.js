import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();

const {
  getSupabaseAdmin,
  normalizeEmail,
  isValidEmail,
  inviteAdmin,
  createAndSendLink,
  MIN_PASSWORD_LENGTH,
} = await import('./server/admin.js');

const app = express();
const port = Number(process.env.PORT || 3001);
const isProd = process.env.NODE_ENV === 'production';

// Behind a hosting proxy (Render, Railway, Fly, Nginx…) — needed for correct client IPs.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProd) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '10kb' }));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

if (isProd) {
  const missing = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'SITE_URL'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const bearer = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
};

/** Resolves the Supabase user for the request's access token. */
async function getUserFromRequest(req) {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/** Only ACTIVE admins (password set + approved) get through. */
async function requireAdmin(req, res, next) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: 'Please sign in.' });

    const { data: row } = await getSupabaseAdmin()
      .from('admin_users')
      .select('email, status, role, user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!row || row.status !== 'active') return res.status(403).json({ message: 'Admin access required.' });
    req.adminUser = user;
    req.adminRow = { ...row, role: row.role || 'admin' };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// Small in-memory limiter for the public forgot-password endpoint.
const hits = new Map();
function tooMany(key, limit = 3, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

// --- Invite another admin (active admins only) -------------------------------
app.post('/api/admin/invite', requireAdmin, async (req, res) => {
  try {
    const requestedRole = String(req.body?.role || 'admin').toLowerCase();
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(requestedRole)) return res.status(400).json({ message: 'Select a valid admin role.' });
    if (req.adminRow.role !== 'super_admin' && requestedRole === 'super_admin') {
      return res.status(403).json({ message: 'Only a super admin can invite another super admin.' });
    }

    const result = await inviteAdmin({ email: req.body?.email, invitedBy: req.adminRow.email, role: requestedRole });
    res.status(result.status || 200).json({ message: result.message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Could not send the invitation.' });
  }
});

// --- Invitee (or admin resetting) sets the password --------------------------
// The caller holds a session obtained from the emailed one-time link.
// The password is set here, on the server, BEFORE the account is marked active,
// so nobody can become an active admin without having chosen a password.
app.post('/api/admin/complete-setup', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: 'This link has expired. Ask for a new invitation.' });

    const password = String(req.body?.password || '');
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase.from('admin_users').select('email, status, role').eq('user_id', user.id).maybeSingle();
    if (!row) return res.status(403).json({ message: 'This account has not been invited as an admin.' });

    const { error: pwError } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (pwError) return res.status(400).json({ message: pwError.message || 'The password could not be saved.' });

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        status: 'active',
        password_set_at: new Date().toISOString(),
        role: row.role || 'admin',
      })
      .eq('user_id', user.id);
    if (updateError) return res.status(500).json({ message: updateError.message });

    res.json({ message: 'Password saved. Please sign in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- Forgot password (public, never reveals whether an email is an admin) ----
app.post('/api/admin/forgot-password', async (req, res) => {
  const generic = { message: 'If that email belongs to an admin, a link has been sent.' };
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email) || tooMany(`${req.ip}:${email}`)) return res.json(generic);

    const { data: row } = await getSupabaseAdmin().from('admin_users').select('status').eq('email', email).maybeSingle();
    if (row) {
      const result = await createAndSendLink({ email, kind: row.status === 'active' ? 'reset' : 'invite' });
      if (!result.ok) console.error('forgot-password:', result.message);
    }
  } catch (err) {
    console.error(err);
  }
  res.json(generic);
});

// --- Admin management --------------------------------------------------------
app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from('admin_users')
      .select('email, status, role, user_id, invited_by, invited_at, password_set_at')
      .order('invited_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });

    const users = await Promise.all(
      rows.map(async (row) => {
        let lastSignInAt = null;
        if (row.user_id) {
          const { data } = await supabase.auth.admin.getUserById(row.user_id);
          lastSignInAt = data?.user?.last_sign_in_at || null;
        }
        return {
          email: row.email,
          status: row.status,
          role: row.role || 'admin',
          invitedBy: row.invited_by,
          invitedAt: row.invited_at,
          passwordSetAt: row.password_set_at,
          lastSignInAt,
        };
      }),
    );
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.patch('/api/admin/users/role', requireAdmin, async (req, res) => {
  try {
    if (req.adminRow.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the super admin can change roles.' });
    }

    const targetEmail = normalizeEmail(req.body?.email);
    const nextRole = String(req.body?.role || 'admin').toLowerCase();
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(nextRole)) return res.status(400).json({ message: 'Choose a valid role.' });

    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase.from('admin_users').select('email, role').eq('email', targetEmail).maybeSingle();
    if (!row) return res.status(404).json({ message: 'Admin not found.' });

    const { error } = await supabase.from('admin_users').update({ role: nextRole }).eq('email', targetEmail);
    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: `${targetEmail} is now a ${nextRole === 'super_admin' ? 'super admin' : 'admin'}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (email === normalizeEmail(req.adminRow.email)) {
      return res.status(400).json({ message: 'You cannot remove your own admin access.' });
    }
    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase.from('admin_users').select('user_id, role').eq('email', email).maybeSingle();
    if (!row) return res.status(404).json({ message: 'Admin not found.' });
    if (row.role === 'super_admin') {
      return res.status(403).json({ message: 'Super admins cannot be removed.' });
    }

    const { error } = await supabase.from('admin_users').delete().eq('email', email);
    if (error) return res.status(500).json({ message: error.message });
    if (row.user_id) await supabase.auth.admin.deleteUser(row.user_id).catch(() => {});
    res.json({ message: `${email} no longer has admin access.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- Serve the built site (npm run build, then npm start) ---------------------
// Unknown /api routes return JSON 404; every other path falls back to the React app.
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found.' }));
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use('/assets', (_req, res) => res.status(404).end());
  app.use(express.static(dist, { maxAge: '1h' }));
  app.get('/{*splat}', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// Last-resort error handler (bad JSON bodies etc.)
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request.' });
  console.error(err);
  res.status(500).json({ message: 'Server error.' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.warn('⚠ SUPABASE_SERVICE_ROLE_KEY is not set — admin invitations will fail.');
});

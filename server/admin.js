import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const MIN_PASSWORD_LENGTH = 8;

let cached;
export function getSupabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or Supabase URL) in .env — see .env.example.');
  }
  cached = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}

const siteUrl = () => (process.env.SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

/** Sends through any SMTP account (Gmail, Outlook, Brevo, Zoho, your hosting's mailbox, …). */
export async function sendEmail({ to, subject, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    return { ok: false, message: 'Email is not configured on the server (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env).' };
  }
  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error('SMTP error:', err.message);
    return { ok: false, message: 'The email could not be sent. Check the SMTP settings on the server.' };
  }
}

function emailTemplate({ heading, lines, buttonLabel, link }) {
  const safeLink = escapeHtml(link);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #352820; max-width: 520px;">
      <h2 style="margin-bottom: 16px;">${heading}</h2>
      ${lines.map((l) => `<p>${l}</p>`).join('')}
      <p style="margin: 24px 0;">
        <a href="${safeLink}" style="display: inline-block; background: #352820; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: 600;">${buttonLabel}</a>
      </p>
      <p style="font-size: 13px; color: #7a6a60;">This link can be used once and expires soon. If you weren't expecting this email, you can ignore it.</p>
    </div>`;
}

/** Creates (or refreshes) the Supabase Auth user, records the invite and emails the set-password link. */
export async function createAndSendLink({ email, kind, invitedBy, role = 'admin' }) {
  const supabase = getSupabaseAdmin();
  const selectedRole = String(role || 'admin').toLowerCase();

  // Create the auth user without a password. If it already exists, that's fine.
  const created = await supabase.auth.admin.createUser({ email, email_confirm: true });
  if (created.error && created.error.code !== 'email_exists' && created.error.status !== 422) {
    return { ok: false, status: 500, message: created.error.message || 'Could not create the user.' };
  }

  const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email });
  if (error || !data?.properties?.hashed_token) {
    return { ok: false, status: 500, message: error?.message || 'Could not generate the secure link.' };
  }

  if (kind === 'invite') {
    const { error: upsertError } = await supabase.from('admin_users').upsert(
      {
        email,
        user_id: data.user.id,
        status: 'invited',
        role: selectedRole,
        ...(invitedBy ? { invited_by: invitedBy } : {}),
        invited_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );
    if (upsertError) return { ok: false, status: 500, message: upsertError.message };
  }

  const link = `${siteUrl()}/admin/set-password?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&flow=${kind}`;

  const html =
    kind === 'invite'
      ? emailTemplate({
          heading: 'You’re invited to be an admin on BY.REMIE',
          lines: ['Hi,', 'You have been invited to become an admin on BY.REMIE.', 'Set your password to activate your account. You’ll then sign in with your email and that password.'],
          buttonLabel: 'Set your password',
          link,
        })
      : emailTemplate({
          heading: 'Reset your BY.REMIE admin password',
          lines: ['Hi,', 'We received a request to reset the password for your admin account.'],
          buttonLabel: 'Reset password',
          link,
        });

  const sent = await sendEmail({
    to: email,
    subject: kind === 'invite' ? 'Your BY.REMIE admin invitation' : 'Reset your BY.REMIE admin password',
    html,
  });
  if (!sent.ok) return { ok: false, status: 502, message: sent.message };
  return { ok: true };
}

export async function inviteAdmin({ email, invitedBy, role = 'admin' }) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return { ok: false, status: 400, message: 'Enter a valid email address.' };
  const selectedRole = String(role || 'admin').toLowerCase();
  if (!['admin', 'super_admin'].includes(selectedRole)) return { ok: false, status: 400, message: 'Choose a valid admin role.' };

  const supabase = getSupabaseAdmin();
  const { data: existing, error } = await supabase.from('admin_users').select('email, status, role').eq('email', normalized).maybeSingle();
  if (error) return { ok: false, status: 500, message: error.message };
  if (existing?.status === 'active') {
    return { ok: false, status: 409, message: 'That person is already an active admin.' };
  }

  const result = await createAndSendLink({ email: normalized, kind: 'invite', invitedBy, role: selectedRole });
  if (!result.ok) return result;
  return { ok: true, status: 200, message: `Invitation email sent to ${normalized}.` };
}

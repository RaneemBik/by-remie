# BY.REMIE Beauty Catalog

React + Vite storefront (catalog only, no checkout) with an admin dashboard. Data, images and admin
logins live in **Supabase**; a small Node/Express server (`server.js`) sends admin invitation emails
through any **SMTP** mailbox and serves the built site.

## Database

| Table | Purpose |
|---|---|
| `admin_users` | Who may open the dashboard (`email`, `user_id` → Supabase Auth, `status` invited/active). No passwords here. |
| `categories` | `name`, `tagline`, `accent` |
| `products` | `category_id`, `name`, `description`, `price`, `stock` (in/low/out), `quantity`, `images[]`, `is_featured`, `featured_at`, `deleted_at` (Trash) |
| Storage bucket `product-images` | Product photos (public read, admin-only write) |

Row Level Security: visitors can only read categories and non-trashed products; only **active** admins can write.

## One-time setup

1. **Supabase → SQL Editor**: run `supabase/schema.sql`. (Optional demo catalog: `supabase/seed_demo.sql`.)
2. **Supabase → Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
3. **Supabase → Project Settings → API**: copy the `service_role` key.
4. Copy `.env.example` to `.env` and fill in `SUPABASE_SERVICE_ROLE_KEY`, the `SMTP_*` settings, `EMAIL_FROM`, `SITE_URL`.
5. **Email**: use any mailbox that supports SMTP. Easiest free option is Gmail: enable 2-Step Verification, create an
   App password (Google Account → Security → App passwords) and use it as `SMTP_PASS`. Business mailboxes, Outlook, Zoho or Brevo also work.
6. `npm install`, then create the first admin: `npm run invite-admin -- you@email.com`, open the email and set your password.
   From then on, invite more admins in **Admin users**.

## Run locally

```bash
npm install
npm run dev        # site on http://localhost:5173, API on :3001
```

## Deploy (site + API in one Node service)

```bash
npm install --include=dev
npm run build
npm start          # serves dist/ and /api on $PORT
```

Set the same variables from `.env.example` in your host's dashboard (`NODE_ENV=production`, `SITE_URL=https://your-domain`).
`render.yaml` is included for Render; Railway, Fly.io or any VPS also work. Health check: `/healthz`.

Admin flow: admin invites → email with one-time link → invitee sets password → redirected to `/admin` login → dashboard.
Nobody can open the dashboard until they have set a password and signed in.

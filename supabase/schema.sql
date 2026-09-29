-- =====================================================================
-- BY.REMIE — complete database setup
-- Supabase Dashboard → SQL Editor → paste this whole file → Run.
--
-- Creates: admin_users, categories, products, the product-images storage
-- bucket, and all Row Level Security (RLS) rules.
--
-- NOTE: this DROPS and recreates admin_users (it was empty). It does NOT
-- drop categories/products, so it is safe to re-run once those exist.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Shared helper: keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1) admin_users — who may open the dashboard
--    Passwords live in Supabase Auth (hashed), NOT in this table.
--    status: 'invited' (email sent, password not set) → 'active' (password set)
-- ---------------------------------------------------------------------
drop table if exists public.admin_users cascade;

create table public.admin_users (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique,
  user_id          uuid unique references auth.users (id) on delete set null,
  status           text not null default 'invited' check (status in ('invited', 'active')),
  role             text not null default 'admin' check (role in ('admin', 'super_admin')),
  invited_by       text,
  invited_at       timestamptz not null default now(),
  password_set_at  timestamptz,
  created_at       timestamptz not null default now(),
  constraint admin_users_email_lowercase check (email = lower(email))
);

create index if not exists admin_users_role_idx on public.admin_users (role);

-- ---------------------------------------------------------------------
-- Is the current logged-in user an ACTIVE admin?
-- SECURITY DEFINER so policies on other tables can call it safely.
-- ---------------------------------------------------------------------
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and status = 'active'
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to anon, authenticated;

alter table public.admin_users enable row level security;

-- An admin may read only their own row. All writes go through the server (service role).
create policy "admin reads own row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.admin_users from anon;
revoke insert, update, delete on public.admin_users from authenticated;

-- ---------------------------------------------------------------------
-- 2) categories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  tagline     text not null default '' check (char_length(tagline) <= 160),
  accent      text not null default 'blush' check (accent in ('blush', 'gold', 'sage')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists categories_name_unique on public.categories (lower(btrim(name)));

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) products  (Trash = rows with deleted_at set; Featured = is_featured)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete cascade,
  name         text not null check (char_length(btrim(name)) between 1 and 160),
  description  text not null default '' check (char_length(description) <= 4000),
  price        numeric(10, 2) not null check (price >= 0),
  stock        text not null default 'in' check (stock in ('in', 'low', 'out')),
  quantity     integer not null default 0 check (quantity >= 0),
  images       text[] not null default '{}',   -- public image URLs; first one is the cover
  is_featured  boolean not null default false,
  featured_at  timestamptz,                    -- orders the homepage "Featured" section
  deleted_at   timestamptz,                    -- set = in Trash
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- No two ACTIVE products may share a name (trashed ones don't count).
create unique index if not exists products_name_unique_active
  on public.products (lower(btrim(name))) where deleted_at is null;
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_deleted_idx  on public.products (deleted_at);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) Row Level Security
--    Visitors: read categories + non-trashed products.
--    Active admins: full access (including Trash).
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

drop policy if exists "categories: public read"  on public.categories;
drop policy if exists "categories: admin insert" on public.categories;
drop policy if exists "categories: admin update" on public.categories;
drop policy if exists "categories: admin delete" on public.categories;

create policy "categories: public read"  on public.categories for select to anon, authenticated using (true);
create policy "categories: admin insert" on public.categories for insert to authenticated with check (public.is_active_admin());
create policy "categories: admin update" on public.categories for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "categories: admin delete" on public.categories for delete to authenticated using (public.is_active_admin());

drop policy if exists "products: public read"  on public.products;
drop policy if exists "products: admin insert" on public.products;
drop policy if exists "products: admin update" on public.products;
drop policy if exists "products: admin delete" on public.products;

create policy "products: public read"  on public.products for select to anon, authenticated
  using (deleted_at is null or public.is_active_admin());
create policy "products: admin insert" on public.products for insert to authenticated with check (public.is_active_admin());
create policy "products: admin update" on public.products for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "products: admin delete" on public.products for delete to authenticated using (public.is_active_admin());

revoke insert, update, delete on public.categories from anon;
revoke insert, update, delete on public.products   from anon;

-- ---------------------------------------------------------------------
-- 5) Storage bucket for product photos (public read, admin-only write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "product-images: admin insert" on storage.objects;
drop policy if exists "product-images: admin update" on storage.objects;
drop policy if exists "product-images: admin delete" on storage.objects;

create policy "product-images: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_active_admin());
create policy "product-images: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_active_admin());
create policy "product-images: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_active_admin());

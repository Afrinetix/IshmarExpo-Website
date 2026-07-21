-- ============================================================================
-- ISHMAR EXPO — Supabase schema (migration 1 of 3: tables, types, triggers)
-- Run this FIRST in the Supabase SQL editor (or via `supabase db push`),
-- then storage-setup.sql, then policies.sql.
--
-- This entire file is safe to run more than once — every statement either
-- uses IF NOT EXISTS, replaces cleanly, or is wrapped to skip "already
-- exists" errors, so re-running it after a partial failure (or just to be
-- sure) won't error out on objects created by an earlier attempt.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------
-- 'pending' is the default for a brand-new signup — they have no admin access
-- until a super_admin promotes them from the Users admin page.
-- (Postgres has no CREATE TYPE IF NOT EXISTS, hence the DO block.)
do $$
begin
  create type public.user_role as enum (
    'pending',
    'viewer',
    'media_manager',
    'event_manager',
    'editor',
    'admin',
    'super_admin'
  );
exception
  when duplicate_object then null;
end
$$;

-- ----------------------------------------------------------------------------
-- users — 1:1 with auth.users. Never insert into this manually from the
-- client; it is populated by the handle_new_user() trigger below.
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text not null,
  role       public.user_role not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Admin-panel identities. Role gates every RLS policy in policies.sql.';

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  slug                   text unique,
  description            text,
  image                  text,
  -- Free-text category used by the events.html filter tabs (e.g. 'halal',
  -- 'empowerment', 'certification', 'corporate'). Not a spec-required
  -- column, but the existing filter UI on events.html needs it to keep
  -- working once events come from Supabase instead of hardcoded HTML.
  category               text,
  start_date             timestamptz not null,
  end_date               timestamptz not null,
  venue                  text,
  venue_map_url          text,
  registration_link      text,
  registration_deadline  timestamptz,
  featured               boolean not null default false,
  published              boolean not null default false,
  created_by             uuid references public.users (id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint events_dates_valid check (end_date >= start_date)
);

create index if not exists events_published_start_idx on public.events (published, start_date);
create index if not exists events_featured_idx on public.events (featured) where featured = true;

-- ----------------------------------------------------------------------------
-- gallery
-- ----------------------------------------------------------------------------
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  category    text,
  caption     text,
  featured    boolean not null default false,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists gallery_category_idx on public.gallery (category);
create index if not exists gallery_featured_idx on public.gallery (featured) where featured = true;

-- ----------------------------------------------------------------------------
-- videos
-- ----------------------------------------------------------------------------
create table if not exists public.videos (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  youtube_url    text,
  instagram_url  text,
  thumbnail      text,
  featured       boolean not null default false,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint videos_has_a_source check (youtube_url is not null or instagram_url is not null)
);

-- ----------------------------------------------------------------------------
-- registrations — public INSERT only (event registration form). Reading and
-- managing is admin-only (see policies.sql).
-- ----------------------------------------------------------------------------
create table if not exists public.registrations (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  company        text,
  position       text,
  email          text not null,
  phone          text,
  country        text,
  event_id       uuid references public.events (id) on delete cascade,
  ticket_type    text,
  payment_status text not null default 'pending'
                 check (payment_status in ('pending', 'paid', 'waived', 'cancelled')),
  created_at     timestamptz not null default now(),
  constraint registrations_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists registrations_event_idx on public.registrations (event_id);
create index if not exists registrations_email_idx on public.registrations (email);

-- ----------------------------------------------------------------------------
-- sponsors / partners
-- ----------------------------------------------------------------------------
create table if not exists public.sponsors (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  logo         text,
  website      text,
  level        text,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.partners (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  logo         text,
  website      text,
  description  text,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  client_name  text not null,
  company      text,
  photo        text,
  testimonial  text not null,
  featured     boolean not null default false,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- media (press mentions)
-- ----------------------------------------------------------------------------
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  image      text,
  link       text,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- contact_messages — public INSERT only (contact form).
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     text not null default 'unread'
             check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists contact_messages_status_idx on public.contact_messages (status);

-- ----------------------------------------------------------------------------
-- settings — flexible key/value store for everything editable site-wide.
-- The admin Settings page reads/writes known keys; the public pages read
-- them to render hero text, stats, contact info, social links, footer, SEO.
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users (id) on delete set null
);

-- Seed defaults so the public site has sane content before an admin edits
-- anything, and so the Settings admin page has a known key list to render.
insert into public.settings (key, value) values
  ('hero', jsonb_build_object(
    'eyebrow', 'Africa''s Leading Halal Expo & Empowerment Company',
    'title_line1', 'Where Africa',
    'title_line2', 'Meets the Halal World',
    'subtitle', 'Connecting African SMEs, youth, and women entrepreneurs to the global Halal economy through world-class exhibitions, Halal certification support, and business empowerment programs.'
  )),
  ('stats', jsonb_build_array(
    jsonb_build_object('label', 'Events Organized', 'value', 48, 'suffix', '+'),
    jsonb_build_object('label', 'Total Attendees', 'value', 10000, 'suffix', '+'),
    jsonb_build_object('label', 'Youth & Entrepreneurs Trained', 'value', 1000, 'suffix', '+'),
    jsonb_build_object('label', 'Businesses Halal Certified', 'value', 50, 'suffix', '+')
  )),
  ('contact', jsonb_build_object(
    'phone_primary', '+254 715 685 550',
    'phone_secondary', '+254 715 685 550',
    'email_general', 'ishmarhalaltradersexpoltd@gmail.com',
    'email_events', 'ishmarhalaltradersexpoltd@gmail.com',
    'whatsapp', '254715685550',
    'address', 'Parklands, Nairobi (Head Office) / GPO, Mombasa (Branch), Kenya',
    'google_maps_embed', ''
  )),
  ('social_links', jsonb_build_object(
    'instagram', 'https://www.instagram.com/ishmar_expo_limited?utm_source=qr',
    'facebook', 'https://www.facebook.com/ishmarexpo',
    'youtube', 'https://www.youtube.com/@ishmarexpo',
    'linkedin', 'https://www.linkedin.com/company/ishmarexpo',
    'tiktok', 'https://www.tiktok.com/@ishmar_expo_limited?_r=1&_t=ZS-98Du5CrZv0i',
    'snapchat', 'https://snapchat.com/t/e4RPcgCK'
  )),
  ('footer', jsonb_build_object(
    'description', 'Africa''s leading Halal exhibition and empowerment company — connecting African SMEs, youth, and women entrepreneurs to the global Halal economy since 2023.',
    'copyright', '© 2026 Ishmar Expo Limited. All rights reserved.'
  )),
  ('seo', jsonb_build_object(
    'default_title', 'Ishmar Halal Traders Expo Ltd | Halal Exhibitions & Business Empowerment in Kenya',
    'default_description', 'Africa''s leading Halal exhibition and empowerment company. Connecting African SMEs to the global Halal economy through expos, certification, and entrepreneurship.',
    'og_image', '',
    'twitter_handle', '',
    'google_analytics_id', '',
    'google_site_verification', ''
  ))
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- Triggers: updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.gallery;
create trigger set_updated_at before update on public.gallery
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.videos;
create trigger set_updated_at before update on public.videos
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.sponsors;
create trigger set_updated_at before update on public.sponsors
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.partners;
create trigger set_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.media;
create trigger set_updated_at before update on public.media
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.contact_messages;
create trigger set_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.settings;
create trigger set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: auto-create a public.users row for every new auth signup.
-- New users default to role='pending' — no admin access until promoted.
-- SECURITY DEFINER is required because this runs on the auth.users table,
-- which the client never has direct insert/update rights on.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helper: slugify a title into a URL-safe slug (used by the events admin UI
-- as a suggestion; the client still sends the final slug explicitly).
-- ----------------------------------------------------------------------------
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

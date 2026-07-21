-- ============================================================================
-- ISHMAR EXPO — Team Members migration (run AFTER schema.sql/storage-setup.sql/
-- policies.sql have already been applied to your project).
--
-- Adds a `team_members` table so leadership/staff bios on about.html can be
-- managed from /admin instead of hardcoded in HTML. Reuses the existing
-- `team` storage bucket and its policies (already created by
-- storage-setup.sql/policies.sql) for photo uploads — no new bucket needed.
--
-- Safe to re-run: every statement uses IF NOT EXISTS / DROP ... IF EXISTS
-- guards, same convention as schema.sql/policies.sql.
-- ============================================================================

create table if not exists public.team_members (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  role           text not null,
  photo          text,
  -- 'none' | 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'email' | 'website'
  -- drives which icon renders in the card overlay; social_url is the href.
  social_platform text not null default 'none',
  social_url     text,
  display_order  integer not null default 0,
  active         boolean not null default true,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists team_members_active_order_idx on public.team_members (active, display_order);

drop trigger if exists set_updated_at on public.team_members;
create trigger set_updated_at before update on public.team_members
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS — same shape as sponsors/partners/testimonials: public reads active
-- members only; super_admin/admin/editor can write; delete is admin+ only.
-- ----------------------------------------------------------------------------
alter table public.team_members enable row level security;

drop policy if exists team_members_public_read on public.team_members;
create policy team_members_public_read
  on public.team_members for select
  to anon, authenticated
  using (active = true);

drop policy if exists team_members_staff_read_all on public.team_members;
create policy team_members_staff_read_all
  on public.team_members for select
  to authenticated
  using (public.has_role('super_admin', 'admin', 'editor', 'media_manager', 'event_manager', 'viewer'));

drop policy if exists team_members_staff_write on public.team_members;
create policy team_members_staff_write
  on public.team_members for insert
  to authenticated
  with check (public.is_full_admin() or public.has_role('editor'));

drop policy if exists team_members_staff_update on public.team_members;
create policy team_members_staff_update
  on public.team_members for update
  to authenticated
  using (public.is_full_admin() or public.has_role('editor'))
  with check (public.is_full_admin() or public.has_role('editor'));

drop policy if exists team_members_staff_delete on public.team_members;
create policy team_members_staff_delete
  on public.team_members for delete
  to authenticated
  using (public.is_full_admin());

-- ----------------------------------------------------------------------------
-- Seed with the current real leadership team (photo paths point at the
-- existing site images already committed under assets/images/ — no need to
-- re-upload them into Storage; the admin can replace with a Storage-hosted
-- photo any time via the Team admin page). Halima has no photo on file yet,
-- so it's left null — the public page falls back to the company logo until
-- one is uploaded.
-- ----------------------------------------------------------------------------
-- Guarded by "table is currently empty" rather than an ON CONFLICT target,
-- since full_name has no unique constraint (two staff could share a name) —
-- this still makes the seed safe to re-run without ever double-inserting.
insert into public.team_members (full_name, role, photo, social_platform, social_url, display_order)
select v.full_name, v.role, v.photo, v.social_platform, v.social_url, v.display_order
from (values
  ('Aisha Omar Said', 'Founder & Director', 'assets/images/WhatsApp Image 2025-06-03 at 00.11.42_6ece1c3b.jpg', 'whatsapp', 'https://wa.me/254721639164', 1),
  ('Hamisi Ramadhani Kiwaka', 'CEO & Managing Director', 'assets/images/WhatsApp Image 2025-06-03 at 00.11.42_98827fb1.jpg', 'whatsapp', 'https://wa.me/254729627162', 2),
  ('Asma Omar Said', 'Financial Controller', 'assets/images/WhatsApp Image 2026-02-03 at 16.45.01.jpg', 'email', 'contact.html', 3),
  ('Halima Liyayi', 'Social Media Manager', null, 'instagram', 'https://www.instagram.com/ishmarexpo', 4)
) as v(full_name, role, photo, social_platform, social_url, display_order)
where not exists (select 1 from public.team_members);

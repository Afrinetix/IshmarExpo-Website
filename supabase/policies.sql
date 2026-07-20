-- ============================================================================
-- ISHMAR EXPO — Row Level Security policies (migration 3 of 3)
-- Run AFTER schema.sql and storage-setup.sql.
--
-- Model: every table has RLS enabled and DENY-BY-DEFAULT (Postgres RLS
-- default). Access is granted back explicitly, table by table, via the
-- permissive policies below. Role checks go through has_role(), a
-- SECURITY DEFINER function, so policies never query public.users directly
-- (which would otherwise risk recursive-RLS evaluation on that same table).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- has_role(): true if the current authenticated user's public.users.role is
-- one of the given roles. Returns false for anonymous/unauthenticated
-- requests (auth.uid() is null) and for users somehow missing a users row.
-- ----------------------------------------------------------------------------
create or replace function public.has_role(variadic roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role::text = any(roles)
  );
$$;

comment on function public.has_role is
  'SECURITY DEFINER role check used by every RLS policy in this file. Never grant EXECUTE beyond authenticated/anon defaults.';

-- Convenience group: content staff who may manage general marketing content
-- (events, gallery, videos, sponsors, partners, testimonials, media).
create or replace function public.is_full_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('super_admin', 'admin');
$$;

-- ============================================================================
-- users
-- ============================================================================
alter table public.users enable row level security;

create policy users_select_own
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy users_select_admin
  on public.users for select
  to authenticated
  using (public.is_full_admin());

-- Users may update their own profile, but cannot change their own role —
-- the WITH CHECK re-reads the *current* stored role and requires it be
-- unchanged unless the actor is a super_admin (see next policy).
create policy users_update_own_profile
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select u2.role from public.users u2 where u2.id = auth.uid())
  );

create policy users_update_admin
  on public.users for update
  to authenticated
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

create policy users_delete_admin
  on public.users for delete
  to authenticated
  using (public.has_role('super_admin'));

-- No INSERT policy is defined on purpose: rows are created exclusively by
-- the handle_new_user() trigger (SECURITY DEFINER), so direct client-side
-- inserts into public.users are always rejected.

-- ============================================================================
-- events
-- ============================================================================
alter table public.events enable row level security;

create policy events_public_read
  on public.events for select
  to anon, authenticated
  using (published = true);

create policy events_staff_read_all
  on public.events for select
  to authenticated
  using (public.has_role('super_admin', 'admin', 'editor', 'event_manager', 'media_manager', 'viewer'));

create policy events_staff_write
  on public.events for insert
  to authenticated
  with check (public.has_role('super_admin', 'admin', 'editor', 'event_manager'));

create policy events_staff_update
  on public.events for update
  to authenticated
  using (public.has_role('super_admin', 'admin', 'editor', 'event_manager'))
  with check (public.has_role('super_admin', 'admin', 'editor', 'event_manager'));

create policy events_staff_delete
  on public.events for delete
  to authenticated
  using (public.has_role('super_admin', 'admin', 'event_manager'));

-- ============================================================================
-- gallery
-- ============================================================================
alter table public.gallery enable row level security;

create policy gallery_public_read
  on public.gallery for select
  to anon, authenticated
  using (true);

create policy gallery_staff_write
  on public.gallery for insert
  to authenticated
  with check (public.has_role('super_admin', 'admin', 'editor', 'media_manager'));

create policy gallery_staff_update
  on public.gallery for update
  to authenticated
  using (public.has_role('super_admin', 'admin', 'editor', 'media_manager'))
  with check (public.has_role('super_admin', 'admin', 'editor', 'media_manager'));

create policy gallery_staff_delete
  on public.gallery for delete
  to authenticated
  using (public.has_role('super_admin', 'admin', 'media_manager'));

-- ============================================================================
-- videos
-- ============================================================================
alter table public.videos enable row level security;

create policy videos_public_read
  on public.videos for select
  to anon, authenticated
  using (true);

create policy videos_staff_write
  on public.videos for insert
  to authenticated
  with check (public.has_role('super_admin', 'admin', 'editor', 'media_manager'));

create policy videos_staff_update
  on public.videos for update
  to authenticated
  using (public.has_role('super_admin', 'admin', 'editor', 'media_manager'))
  with check (public.has_role('super_admin', 'admin', 'editor', 'media_manager'));

create policy videos_staff_delete
  on public.videos for delete
  to authenticated
  using (public.has_role('super_admin', 'admin', 'media_manager'));

-- ============================================================================
-- sponsors / partners / testimonials / media — identical shape, general
-- content staff (super_admin, admin, editor) manage all four.
-- ============================================================================
alter table public.sponsors enable row level security;
alter table public.partners enable row level security;
alter table public.testimonials enable row level security;
alter table public.media enable row level security;

create policy sponsors_public_read on public.sponsors for select to anon, authenticated using (true);
create policy sponsors_staff_write on public.sponsors for insert to authenticated with check (public.is_full_admin() or public.has_role('editor'));
create policy sponsors_staff_update on public.sponsors for update to authenticated using (public.is_full_admin() or public.has_role('editor')) with check (public.is_full_admin() or public.has_role('editor'));
create policy sponsors_staff_delete on public.sponsors for delete to authenticated using (public.is_full_admin());

create policy partners_public_read on public.partners for select to anon, authenticated using (true);
create policy partners_staff_write on public.partners for insert to authenticated with check (public.is_full_admin() or public.has_role('editor'));
create policy partners_staff_update on public.partners for update to authenticated using (public.is_full_admin() or public.has_role('editor')) with check (public.is_full_admin() or public.has_role('editor'));
create policy partners_staff_delete on public.partners for delete to authenticated using (public.is_full_admin());

create policy testimonials_public_read on public.testimonials for select to anon, authenticated using (true);
create policy testimonials_staff_write on public.testimonials for insert to authenticated with check (public.is_full_admin() or public.has_role('editor'));
create policy testimonials_staff_update on public.testimonials for update to authenticated using (public.is_full_admin() or public.has_role('editor')) with check (public.is_full_admin() or public.has_role('editor'));
create policy testimonials_staff_delete on public.testimonials for delete to authenticated using (public.is_full_admin());

create policy media_public_read on public.media for select to anon, authenticated using (true);
create policy media_staff_write on public.media for insert to authenticated with check (public.is_full_admin() or public.has_role('editor'));
create policy media_staff_update on public.media for update to authenticated using (public.is_full_admin() or public.has_role('editor')) with check (public.is_full_admin() or public.has_role('editor'));
create policy media_staff_delete on public.media for delete to authenticated using (public.is_full_admin());

-- ============================================================================
-- registrations — public can only INSERT their own registration (and only
-- with the default 'pending' payment status); reading/managing is
-- event-staff-only. No public SELECT policy exists, so registrants cannot
-- read other attendees' data.
-- ============================================================================
alter table public.registrations enable row level security;

create policy registrations_public_insert
  on public.registrations for insert
  to anon, authenticated
  with check (payment_status = 'pending');

create policy registrations_staff_read
  on public.registrations for select
  to authenticated
  using (public.has_role('super_admin', 'admin', 'event_manager'));

create policy registrations_staff_update
  on public.registrations for update
  to authenticated
  using (public.has_role('super_admin', 'admin', 'event_manager'))
  with check (public.has_role('super_admin', 'admin', 'event_manager'));

create policy registrations_staff_delete
  on public.registrations for delete
  to authenticated
  using (public.has_role('super_admin', 'admin', 'event_manager'));

-- ============================================================================
-- contact_messages — public can only INSERT (status forced to 'unread');
-- reading/managing is admin-only.
-- ============================================================================
alter table public.contact_messages enable row level security;

create policy contact_messages_public_insert
  on public.contact_messages for insert
  to anon, authenticated
  with check (status = 'unread');

create policy contact_messages_staff_read
  on public.contact_messages for select
  to authenticated
  using (public.is_full_admin());

create policy contact_messages_staff_update
  on public.contact_messages for update
  to authenticated
  using (public.is_full_admin())
  with check (public.is_full_admin());

create policy contact_messages_staff_delete
  on public.contact_messages for delete
  to authenticated
  using (public.is_full_admin());

-- ============================================================================
-- settings — publicly readable (the public site renders from it), writable
-- only by super_admin/admin.
-- ============================================================================
alter table public.settings enable row level security;

create policy settings_public_read
  on public.settings for select
  to anon, authenticated
  using (true);

create policy settings_staff_write
  on public.settings for insert
  to authenticated
  with check (public.is_full_admin());

create policy settings_staff_update
  on public.settings for update
  to authenticated
  using (public.is_full_admin())
  with check (public.is_full_admin());

create policy settings_staff_delete
  on public.settings for delete
  to authenticated
  using (public.is_full_admin());

-- ============================================================================
-- Storage — bucket-level policies on storage.objects.
-- Every bucket is publicly readable (created as `public` in
-- storage-setup.sql); writes are role-gated here. File size and MIME type
-- are enforced automatically by Supabase Storage from each bucket's
-- file_size_limit / allowed_mime_types set in storage-setup.sql.
-- ============================================================================

create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('gallery','videos','documents','sponsors','partners','team','media'));

create policy storage_gallery_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and public.has_role('super_admin','admin','editor','media_manager'));
create policy storage_gallery_update
  on storage.objects for update to authenticated
  using (bucket_id = 'gallery' and public.has_role('super_admin','admin','editor','media_manager'))
  with check (bucket_id = 'gallery' and public.has_role('super_admin','admin','editor','media_manager'));
create policy storage_gallery_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and public.has_role('super_admin','admin','media_manager'));

create policy storage_videos_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.has_role('super_admin','admin','editor','media_manager'));
create policy storage_videos_update
  on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.has_role('super_admin','admin','editor','media_manager'))
  with check (bucket_id = 'videos' and public.has_role('super_admin','admin','editor','media_manager'));
create policy storage_videos_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.has_role('super_admin','admin','media_manager'));

create policy storage_documents_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.has_role('super_admin','admin','editor','event_manager'));
create policy storage_documents_update
  on storage.objects for update to authenticated
  using (bucket_id = 'documents' and public.has_role('super_admin','admin','editor','event_manager'))
  with check (bucket_id = 'documents' and public.has_role('super_admin','admin','editor','event_manager'));
create policy storage_documents_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and public.has_role('super_admin','admin','event_manager'));

create policy storage_sponsors_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sponsors' and public.is_full_admin());
create policy storage_sponsors_update
  on storage.objects for update to authenticated
  using (bucket_id = 'sponsors' and public.is_full_admin())
  with check (bucket_id = 'sponsors' and public.is_full_admin());
create policy storage_sponsors_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'sponsors' and public.is_full_admin());

create policy storage_partners_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'partners' and public.is_full_admin());
create policy storage_partners_update
  on storage.objects for update to authenticated
  using (bucket_id = 'partners' and public.is_full_admin())
  with check (bucket_id = 'partners' and public.is_full_admin());
create policy storage_partners_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'partners' and public.is_full_admin());

create policy storage_team_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'team' and public.is_full_admin());
create policy storage_team_update
  on storage.objects for update to authenticated
  using (bucket_id = 'team' and public.is_full_admin())
  with check (bucket_id = 'team' and public.is_full_admin());
create policy storage_team_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'team' and public.is_full_admin());

create policy storage_media_write
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_full_admin());
create policy storage_media_update
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_full_admin())
  with check (bucket_id = 'media' and public.is_full_admin());
create policy storage_media_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_full_admin());

-- ============================================================================
-- Bootstrap: promote the FIRST admin.
-- There is no client-safe way to create a super_admin (that would let
-- anyone self-promote). After your first signup via admin/login.html's
-- "create account" flow (or the Supabase dashboard), run this once with
-- your account's email to become the first Super Admin:
--
--   update public.users set role = 'super_admin' where email = 'you@example.com';
--
-- Every subsequent admin can then be promoted from the Users admin page —
-- no SQL or service_role key required after this one-time step.
-- ============================================================================

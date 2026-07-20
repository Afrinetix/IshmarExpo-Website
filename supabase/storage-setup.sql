-- ============================================================================
-- ISHMAR EXPO — Supabase storage buckets (migration 2 of 3)
-- Run AFTER schema.sql, BEFORE policies.sql.
-- All buckets are public-READ (assets are public marketing content served on
-- the website) — write access is locked down entirely by the storage
-- policies in policies.sql, not by bucket visibility.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',   'gallery',   true, 10485760,  array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('videos',    'videos',    true, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','video/webm']),
  ('documents', 'documents', true, 20971520,  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('sponsors',  'sponsors',  true, 5242880,   array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('partners',  'partners',  true, 5242880,   array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('team',      'team',      true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('media',     'media',     true, 10485760,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

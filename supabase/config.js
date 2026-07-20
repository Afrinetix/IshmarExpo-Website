/**
 * Supabase project configuration.
 *
 * The anon/public key is DESIGNED to be shipped in client-side code — it is
 * useless without the Row Level Security policies in policies.sql, which are
 * what actually protect the data. Never put a service_role key in this file
 * or anywhere else under version control.
 *
 * Replace the two values below with your project's values from
 * Supabase Dashboard → Project Settings → API, then see README.md.
 */
export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-PUBLIC-ANON-KEY';

/** Storage bucket ids — must match supabase/storage-setup.sql exactly. */
export const BUCKETS = {
  GALLERY: 'gallery',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
  SPONSORS: 'sponsors',
  PARTNERS: 'partners',
  TEAM: 'team',
  MEDIA: 'media',
};

/** Role list — must match the public.user_role enum in schema.sql exactly. */
export const ROLES = {
  PENDING: 'pending',
  VIEWER: 'viewer',
  MEDIA_MANAGER: 'media_manager',
  EVENT_MANAGER: 'event_manager',
  EDITOR: 'editor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

/** Roles allowed to sign in to /admin at all (pending users are blocked). */
export const ADMIN_PANEL_ROLES = [
  ROLES.VIEWER,
  ROLES.MEDIA_MANAGER,
  ROLES.EVENT_MANAGER,
  ROLES.EDITOR,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

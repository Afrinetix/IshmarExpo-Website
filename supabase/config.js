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
export const SUPABASE_URL = 'https://aycznyfebwczrcjaurfc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y3pueWZlYndjenJjamF1cmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MzcyNzIsImV4cCI6MjEwMDExMzI3Mn0.b37D_Lecl97St7yCKGbQ1VeYMys2wPruT-OIHDv5g3c';

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

/**
 * Authentication + authorization helpers shared by every admin page.
 *
 * Server-side enforcement always happens via the RLS policies in
 * policies.sql — nothing here is a security boundary by itself. This module
 * exists to (a) gate which HTML the admin panel renders per role, and
 * (b) give every admin page a one-line `requireAuth()` guard.
 */
import { supabase } from './client.js';
import { ADMIN_PANEL_ROLES, ROLES } from './config.js';

/** resource -> action -> roles allowed. Mirrors policies.sql exactly. */
const PERMISSIONS = {
  events:        { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.EVENT_MANAGER], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EVENT_MANAGER] },
  gallery:       { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.MEDIA_MANAGER], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MEDIA_MANAGER] },
  videos:        { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.MEDIA_MANAGER], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MEDIA_MANAGER] },
  sponsors:      { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  partners:      { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  testimonials:  { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  media:         { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  registrations: { read:  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EVENT_MANAGER], write: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EVENT_MANAGER], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EVENT_MANAGER] },
  messages:      { read:  [ROLES.SUPER_ADMIN, ROLES.ADMIN], write: [ROLES.SUPER_ADMIN, ROLES.ADMIN], delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  settings:      { write: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  users:         { write: [ROLES.SUPER_ADMIN] },
};

let cachedProfile = null;

/** Current auth session, or null if signed out. */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Current user's public.users row (id, full_name, email, role). Cached for
 * the lifetime of the page load; pass `force: true` to refetch (e.g. after
 * a role change).
 */
export async function getCurrentUserProfile({ force = false } = {}) {
  if (cachedProfile && !force) return cachedProfile;
  const session = await getSession();
  if (!session) {
    cachedProfile = null;
    return null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, created_at')
    .eq('id', session.user.id)
    .single();
  if (error) throw error;
  cachedProfile = data;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  cachedProfile = null;
  return data;
}

/** Creates a new account with role='pending' (set by the DB trigger). A super_admin must promote it before it can access anything in /admin. */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  cachedProfile = null;
  if (error) throw error;
}

/**
 * Guard for the top of every admin page (except login.html). Redirects to
 * login if signed out, and to the "no access" state if the account exists
 * but is still 'pending' (unapproved) or not in the allowed role list.
 * Returns the caller's profile on success.
 */
export async function requireAuth({ allowedRoles = ADMIN_PANEL_ROLES, redirectTo = 'login.html' } = {}) {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  const profile = await getCurrentUserProfile();
  if (!profile || !allowedRoles.includes(profile.role)) {
    window.location.href = `${redirectTo}?denied=1`;
    return null;
  }
  return profile;
}

/** Client-side permission check for showing/hiding UI. RLS is the real gate. */
export function hasPermission(resource, action, role) {
  const entry = PERMISSIONS[resource];
  if (!entry || !entry[action]) return false;
  return entry[action].includes(role);
}

export { PERMISSIONS };

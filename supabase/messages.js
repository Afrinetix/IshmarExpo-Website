/**
 * Contact messages — public INSERT only (the contact form on contact.html),
 * everything else (read/update status/delete) is admin-only per
 * PERMISSIONS.messages in supabase/auth.js and enforced server-side by
 * policies.sql.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, full_name, email, phone, subject, message, status, created_at, updated_at';

/**
 * Public-facing insert used by the contact form. status is intentionally
 * omitted — the column default ('unread') is what the RLS insert policy
 * requires (contact_messages_public_insert checks status = 'unread').
 */
export async function submitContactMessage(payload) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({ ...payload, status: 'unread' })
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

/** Admin inbox listing, newest first, optionally filtered by status/search. */
export async function getAllMessagesForAdmin({ status, search } = {}) {
  let query = supabase.from('contact_messages').select(SELECT_FIELDS).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  if (search) {
    const term = `%${search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Unread count, for the sidebar/dashboard badge. */
export async function getUnreadMessageCount() {
  const { count, error } = await supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'unread');
  if (error) throw error;
  return count ?? 0;
}

export async function updateMessageStatus(id, status) {
  const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}

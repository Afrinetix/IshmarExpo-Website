/**
 * Registrations — public INSERT only (the event registration form on
 * events.html), everything else (read/update/delete) is admin-only per
 * PERMISSIONS.registrations in supabase/auth.js and enforced server-side by
 * policies.sql. This module never exposes a "read" function to the public
 * pages — there is intentionally no getRegistrations() usable by anon.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, full_name, company, position, email, phone, country, event_id, ticket_type, payment_status, created_at';

// Pulls the parent event's title/start_date alongside each registration via
// the events_id foreign key, so the admin table can show "which event" and
// the CSV/Excel export doesn't need a second round trip per row.
const SELECT_WITH_EVENT = `${SELECT_FIELDS}, events ( title, start_date )`;

/**
 * Public-facing insert used by the registration form embedded on
 * events.html. payment_status is intentionally omitted from the payload —
 * the column default ('pending') is what the RLS insert policy requires
 * (registrations_public_insert checks payment_status = 'pending'), so never
 * pass a payment_status here even if the form somehow included one.
 */
export async function submitRegistration(payload) {
  const { data, error } = await supabase
    .from('registrations')
    .insert({ ...payload, payment_status: 'pending' })
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

/** Admin listing, newest first, with the parent event's title/date joined in. */
export async function getAllRegistrationsForAdmin({ eventId, paymentStatus, search } = {}) {
  let query = supabase.from('registrations').select(SELECT_WITH_EVENT).order('created_at', { ascending: false });
  if (eventId) query = query.eq('event_id', eventId);
  if (paymentStatus) query = query.eq('payment_status', paymentStatus);
  if (search) {
    const term = `%${search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term},company.ilike.${term}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateRegistration(id, payload) {
  const { data, error } = await supabase.from('registrations').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteRegistration(id) {
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw error;
}

/** Every published event, for the registration-form dropdown and the admin filter — id/title/dates only. */
export async function getEventsForRegistrationPicker() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, start_date')
    .eq('published', true)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

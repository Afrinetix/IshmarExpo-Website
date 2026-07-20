/**
 * Events CRUD + public-facing queries. "Upcoming" vs "Past" is computed at
 * query time from end_date vs now() — no cron job or status column needed,
 * so an event always classifies correctly the instant its end_date passes.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, title, slug, description, image, category, start_date, end_date, venue, venue_map_url, registration_link, registration_deadline, featured, published, created_at, updated_at';

/** Published, upcoming events (end_date in the future), soonest first. */
export async function getUpcomingEvents({ limit } = {}) {
  let query = supabase
    .from('events')
    .select(SELECT_FIELDS)
    .eq('published', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Published, past events (end_date already passed), most recent first. */
export async function getPastEvents({ limit } = {}) {
  let query = supabase
    .from('events')
    .select(SELECT_FIELDS)
    .eq('published', true)
    .lt('end_date', new Date().toISOString())
    .order('start_date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** The featured upcoming event, if any, else the single soonest upcoming event, else null. */
export async function getFeaturedEvent() {
  const { data: featured, error: featuredError } = await supabase
    .from('events')
    .select(SELECT_FIELDS)
    .eq('published', true)
    .eq('featured', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(1);
  if (featuredError) throw featuredError;
  if (featured?.length) return featured[0];

  const upcoming = await getUpcomingEvents({ limit: 1 });
  return upcoming[0] ?? null;
}

/** Every published event (upcoming + past together), soonest-first — used by events.html, which renders both into one grid and lets the page's own filter tabs split them client-side by data-status. */
export async function getAllPublishedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(SELECT_FIELDS)
    .eq('published', true)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

/** Admin listing — every event regardless of published state, newest first. */
export async function getAllEventsForAdmin() {
  const { data, error } = await supabase
    .from('events')
    .select(SELECT_FIELDS)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEventById(id) {
  const { data, error } = await supabase.from('events').select(SELECT_FIELDS).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createEvent(payload) {
  const { data, error } = await supabase.from('events').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, payload) {
  const { data, error } = await supabase.from('events').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

/** Live-updates the public events feed. Returns an unsubscribe function. */
export function subscribeToEvents(callback) {
  const channel = supabase
    .channel('public:events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

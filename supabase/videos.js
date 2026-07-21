/**
 * Videos CRUD + public-facing queries. Mirrors events.js's structure.
 * A video always has at least one of youtube_url/instagram_url (enforced by
 * the `videos_has_a_source` DB check constraint) — youtube_url stores just
 * the bare 11-char video ID (not a full URL), matching what the public-page
 * lightbox in assets/js/main.js expects for `data-video`.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, title, youtube_url, instagram_url, thumbnail, featured, created_by, created_at, updated_at';

/** Featured videos, newest first. */
export async function getFeaturedVideos({ limit } = {}) {
  let query = supabase
    .from('videos')
    .select(SELECT_FIELDS)
    .eq('featured', true)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** All videos (featured or not), newest first — fallback when there aren't enough featured ones. */
export async function getAllVideos({ limit } = {}) {
  let query = supabase
    .from('videos')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Admin listing — every video, newest first. */
export async function getAllVideosForAdmin() {
  const { data, error } = await supabase
    .from('videos')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getVideoById(id) {
  const { data, error } = await supabase.from('videos').select(SELECT_FIELDS).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createVideo(payload) {
  const { data, error } = await supabase.from('videos').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateVideo(id, payload) {
  const { data, error } = await supabase.from('videos').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteVideo(id) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

/** Live-updates the public videos feed. Returns an unsubscribe function. */
export function subscribeToVideos(callback) {
  const channel = supabase
    .channel('public:videos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

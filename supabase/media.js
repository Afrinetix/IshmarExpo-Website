/**
 * Media / press-mention CRUD + public-facing queries. Intentionally minimal
 * schema — title, image, and an optional outbound link, nothing more.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, title, image, link, created_by, created_at, updated_at';

/** Public press-mentions grid, newest first. */
export async function getAllMedia({ limit } = {}) {
  let query = supabase
    .from('media')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Admin listing — every media row, newest first. */
export async function getAllMediaForAdmin() {
  const { data, error } = await supabase
    .from('media')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createMedia(payload) {
  const { data, error } = await supabase.from('media').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateMedia(id, payload) {
  const { data, error } = await supabase.from('media').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteMedia(id) {
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw error;
}

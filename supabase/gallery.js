/**
 * Gallery CRUD + public-facing queries.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, image_url, category, caption, featured, uploaded_by, created_at';

/** Public gallery grid, optionally filtered by category or featured-only. */
export async function getGalleryImages({ category, featuredOnly = false, limit } = {}) {
  let query = supabase.from('gallery').select(SELECT_FIELDS).order('created_at', { ascending: false });
  if (category && category !== 'all') query = query.eq('category', category);
  if (featuredOnly) query = query.eq('featured', true);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Distinct categories currently in use, for building the filter tabs. */
export async function getGalleryCategories() {
  const { data, error } = await supabase.from('gallery').select('category').not('category', 'is', null);
  if (error) throw error;
  return [...new Set(data.map((row) => row.category).filter(Boolean))].sort();
}

export async function getAllGalleryForAdmin() {
  const { data, error } = await supabase.from('gallery').select(SELECT_FIELDS).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Insert one gallery row (call after supabase/storage.js#uploadFile). */
export async function createGalleryImage(payload) {
  const { data, error } = await supabase.from('gallery').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

/** Insert many gallery rows at once — used by the bulk-upload flow. */
export async function bulkCreateGalleryImages(rows) {
  const { data, error } = await supabase.from('gallery').insert(rows).select(SELECT_FIELDS);
  if (error) throw error;
  return data;
}

export async function updateGalleryImage(id, payload) {
  const { data, error } = await supabase.from('gallery').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryImage(id) {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
}

/** Live-updates the public gallery. Returns an unsubscribe function. */
export function subscribeToGallery(callback) {
  const channel = supabase
    .channel('public:gallery')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

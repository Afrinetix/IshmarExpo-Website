/**
 * Sponsors CRUD + public-facing queries.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, company_name, logo, website, level, created_by, created_at, updated_at';

/** Public sponsor list, oldest first (earliest-partnered first reads better for a logo strip). */
export async function getAllSponsors() {
  const { data, error } = await supabase.from('sponsors').select(SELECT_FIELDS).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Admin listing — every sponsor, newest first. */
export async function getAllSponsorsForAdmin() {
  const { data, error } = await supabase.from('sponsors').select(SELECT_FIELDS).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSponsor(payload) {
  const { data, error } = await supabase.from('sponsors').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateSponsor(id, payload) {
  const { data, error } = await supabase.from('sponsors').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteSponsor(id) {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
}

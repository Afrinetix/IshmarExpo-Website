/**
 * Partners CRUD + public-facing queries.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, company_name, logo, website, description, created_by, created_at, updated_at';

/** Public partner list, oldest first (earliest-partnered first reads better for a logo strip). */
export async function getAllPartners() {
  const { data, error } = await supabase.from('partners').select(SELECT_FIELDS).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Admin listing — every partner, newest first. */
export async function getAllPartnersForAdmin() {
  const { data, error } = await supabase.from('partners').select(SELECT_FIELDS).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPartner(payload) {
  const { data, error } = await supabase.from('partners').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updatePartner(id, payload) {
  const { data, error } = await supabase.from('partners').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deletePartner(id) {
  const { error } = await supabase.from('partners').delete().eq('id', id);
  if (error) throw error;
}

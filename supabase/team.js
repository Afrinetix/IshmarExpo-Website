/**
 * Team members (leadership bios on about.html) CRUD + public queries.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, full_name, role, photo, social_platform, social_url, display_order, active, created_at, updated_at';

/** Public about.html grid — active members only, in display order. */
export async function getActiveTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select(SELECT_FIELDS)
    .eq('active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllTeamMembersForAdmin() {
  const { data, error } = await supabase
    .from('team_members')
    .select(SELECT_FIELDS)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTeamMember(payload) {
  const { data, error } = await supabase.from('team_members').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateTeamMember(id, payload) {
  const { data, error } = await supabase.from('team_members').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteTeamMember(id) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

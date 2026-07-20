/**
 * Site-wide settings — a flexible key/value store (see the `settings` seed
 * data in schema.sql for the known keys: hero, stats, contact, social_links,
 * footer, seo). Public pages read these to render dynamic content; only
 * super_admin/admin can write (enforced in policies.sql).
 */
import { supabase } from './client.js';

/** Returns every setting as a plain object: { hero: {...}, stats: [...], ... }. */
export async function getAllSettings() {
  const { data, error } = await supabase.from('settings').select('key, value, updated_at');
  if (error) throw error;
  return data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function getSetting(key, fallback = null) {
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data ? data.value : fallback;
}

export async function updateSetting(key, value, updatedBy) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_by: updatedBy }, { onConflict: 'key' });
  if (error) throw error;
}

/** Writes several settings at once, e.g. { hero: {...}, contact: {...} }. */
export async function updateSettings(entries, updatedBy) {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_by: updatedBy }));
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

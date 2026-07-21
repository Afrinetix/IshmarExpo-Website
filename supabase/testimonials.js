/**
 * Testimonials CRUD + public-facing queries.
 */
import { supabase } from './client.js';

const SELECT_FIELDS = 'id, client_name, company, photo, testimonial, featured, created_by, created_at, updated_at';

/** Public homepage carousel — featured testimonials, newest first. */
export async function getFeaturedTestimonials({ limit } = {}) {
  let query = supabase
    .from('testimonials')
    .select(SELECT_FIELDS)
    .eq('featured', true)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Every testimonial, newest first — fallback for when there aren't enough featured ones. */
export async function getAllTestimonials({ limit } = {}) {
  let query = supabase
    .from('testimonials')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Admin listing — every testimonial, newest first. */
export async function getAllTestimonialsForAdmin() {
  const { data, error } = await supabase
    .from('testimonials')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTestimonial(payload) {
  const { data, error } = await supabase.from('testimonials').insert(payload).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function updateTestimonial(id, payload) {
  const { data, error } = await supabase.from('testimonials').update(payload).eq('id', id).select(SELECT_FIELDS).single();
  if (error) throw error;
  return data;
}

export async function deleteTestimonial(id) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

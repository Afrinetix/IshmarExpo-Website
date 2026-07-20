/**
 * Single shared Supabase client instance. Every other module in /supabase
 * and every admin/public page imports `supabase` from here — never call
 * createClient() anywhere else, so there is exactly one auth session in
 * memory per page.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

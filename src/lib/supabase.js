import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Invitation / reset links carry a one-time token_hash that the set-password
    // page verifies explicitly, so we don't want Supabase to parse the URL itself.
    detectSessionInUrl: false,
  },
});

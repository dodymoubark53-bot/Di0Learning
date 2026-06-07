import { createClient } from '@supabase/supabase-js';

// Read from env or localStorage fallback
const getSupabaseCredentials = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';
  return { url: url.trim(), key: key.trim() };
};

const credentials = getSupabaseCredentials();

export const supabase = (credentials.url && credentials.key)
  ? createClient(credentials.url, credentials.key)
  : null;

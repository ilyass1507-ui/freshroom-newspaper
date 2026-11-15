// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://ywzvihgdftjmoffflvjt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SJsUWkN7bHVhuUcivNv9QQ_x1iSYPnM';

// Named "db" to avoid clashing with the global window.supabase library
let db = null;
try {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase unavailable, running in offline mode.', e);
}
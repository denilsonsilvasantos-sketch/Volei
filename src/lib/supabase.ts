import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. App will run in demo mode with local storage.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Helper to check if Supabase is actually configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }
  try {
    // We'll just try to fetch something to see if we can connect.
    // Even if the table doesn't exist, if we get an error that isn't a connection error, it means we connected.
    const { error } = await supabase.from('_test_connection').select('*').limit(1);
    
    // If we get an error, check if it's a connection error.
    if (error) {
      // PGRST116 means the table doesn't exist, which is fine for a connection test.
      // 404 is also fine.
      if (error.code === 'PGRST116') {
        return { success: true, message: 'Connected to Supabase (Table not found, but connection established).' };
      }
      throw error;
    }
    return { success: true, message: 'Connected to Supabase successfully.' };
  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    return { success: false, message: error.message || 'Unknown error connecting to Supabase' };
  }
}

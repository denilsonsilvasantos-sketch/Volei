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
    // Use getSession() to test connectivity without needing a specific table
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      // If we get an auth error, it might still mean we connected to Supabase
      // but the key/URL might have issues with Auth.
      // However, usually getSession() just returns null session if not logged in.
      throw error;
    }
    
    return { success: true, message: 'Connected to Supabase successfully.' };
  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    // If it's a network error, it's a real failure.
    // If it's an API error, it means we at least reached Supabase.
    return { success: false, message: error.message || 'Unknown error connecting to Supabase' };
  }
}

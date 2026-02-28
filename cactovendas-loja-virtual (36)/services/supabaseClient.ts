
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Reads Supabase credentials from the config.ts file.
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
    !!supabaseUrl && 
    !!supabaseAnonKey && 
    !supabaseUrl.includes('your-project-url') && 
    !supabaseAnonKey.includes('your-public-anon-key');

if (!isSupabaseConfigured) {
    console.warn('Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in the config.ts file.');
}

export const supabase = isSupabaseConfigured 
    ? createClient(supabaseUrl!, supabaseAnonKey!) 
    : null;

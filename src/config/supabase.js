/**
 * Supabase Client Configuration
 */

import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. " +
        "Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file."
    );
}

/**
 * Supabase client instance
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

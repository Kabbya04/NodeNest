import { createClient } from '@supabase/supabase-js';

// These should be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Use PKCE flow for better security (tokens won't be in URL)
        flowType: 'pkce',
    },
});

// Helper function to get the current base URL for OAuth redirects
export const getRedirectUrl = () => {
    // Use a specific env var for the redirect URL if it exists, otherwise default to the current origin
    return import.meta.env.VITE_REDIRECT_URL || window.location.origin;
};

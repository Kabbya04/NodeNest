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
    // In production, the redirect URL is determined by the deployment's origin.
    // In development, it falls back to the VITE_REDIRECT_URL from your .env file.
    if (import.meta.env.PROD) {
        return window.location.origin;
    }
    return import.meta.env.VITE_REDIRECT_URL || window.location.origin;
};
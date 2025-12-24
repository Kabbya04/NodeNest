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
    // Check for VITE_REDIRECT_URL key in environment variables first
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
    if (redirectUrl && redirectUrl.trim() !== '') {
        return redirectUrl;
    }

    // Fallback to the current origin (e.g., window.location.origin)
    return window.location.origin;
};
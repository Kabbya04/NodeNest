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
// Helper function to get the current base URL for OAuth redirects
export const getRedirectUrl = () => {
    // Check for VITE_SITE_URL or VITE_REDIRECT_URL in environment variables
    const siteUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_REDIRECT_URL;

    if (siteUrl && siteUrl.trim() !== '') {
        return siteUrl;
    }

    // Fallback to the current origin (e.g., window.location.origin)
    return window.location.origin;
};
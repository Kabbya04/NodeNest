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
    // Allow manual override via environment variable (works in both dev and prod)
    // If VITE_REDIRECT_URL is set (e.g. in Vercel/Netlify dashboard), use it.
    // Otherwise fallback to the current origin.
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

    // Check if redirectUrl is a non-empty string
    if (redirectUrl && redirectUrl.trim() !== '') {
        return redirectUrl;
    }

    return window.location.origin;
};
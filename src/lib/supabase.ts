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
    // In production, ALWAYS use runtime detection (window.location.origin)
    // This ensures the redirect URL is correct regardless of build-time env vars
    // Vite env vars are embedded at build time, so if VITE_REDIRECT_URL was set to
    // localhost during build, it would be hardcoded in the production bundle
    if (import.meta.env.PROD) {
        return window.location.origin;
    }

    // In development, use env var if set, otherwise fall back to current origin
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
    if (redirectUrl && redirectUrl.trim() !== '') {
        return redirectUrl;
    }

    // Default to the current origin (e.g., http://localhost:3000)
    return window.location.origin;
};
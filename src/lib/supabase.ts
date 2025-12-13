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
    let redirectUrl = import.meta.env.VITE_REDIRECT_URL;

    // In production, prevent using localhost if it was explicitly set in environment variables
    // This fixes the issue where a production deployment redirects to localhost because 
    // the VITE_REDIRECT_URL env var was copied from dev to prod.
    if (import.meta.env.PROD && redirectUrl?.includes('localhost')) {
        redirectUrl = null;
    }

    // Check if redirectUrl is a non-empty string
    if (redirectUrl && redirectUrl.trim() !== '') {
        return redirectUrl;
    }

    // Default to the current origin (e.g., https://my-app.vercel.app)
    return window.location.origin;
};
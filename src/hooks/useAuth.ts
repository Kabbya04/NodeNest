import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cleanUrl = () => {
            const url = new URL(window.location.href);
            let cleaned = false;

            // Clear hash if it contains auth info (Implicit flow / Recovery)
            if (url.hash && (url.hash.includes('access_token') || url.hash.includes('refresh_token') || url.hash.includes('type=recovery'))) {
                url.hash = '';
                cleaned = true;
            }

            // Clear query params used for auth (PKCE flow code, errors)
            const paramsToClear = ['code', 'error', 'error_description', 'error_code'];
            paramsToClear.forEach(param => {
                if (url.searchParams.has(param)) {
                    url.searchParams.delete(param);
                    cleaned = true;
                }
            });

            if (cleaned) {
                window.history.replaceState(null, '', url.toString());
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
            cleanUrl();
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false); // Make sure loading is false
            cleanUrl();
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return { user, loading, signIn, signUp, signOut };
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the OAuth callback
        const handleCallback = async () => {
            try {
                // Supabase client automatically handles the code exchange 
                // when configured with flowType: 'pkce'
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (session) {
                    // Successful login
                    navigate('/', { replace: true });
                } else {
                    // No session found, redirect to login
                    // This might happen if the code is invalid or expired
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                navigate('/', { replace: true });
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted-foreground">Completing authentication...</p>
            </div>
        </div>
    );
};

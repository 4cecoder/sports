'use client';

import { createClient } from '@/lib/supabase/client';

export function useGoogleOAuth(
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
) {
  const signInWithGoogle = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return { signInWithGoogle };
}

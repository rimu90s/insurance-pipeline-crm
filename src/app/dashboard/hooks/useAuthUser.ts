'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function useAuthUser() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const applyUser = useCallback(
    (user: { id: string; email?: string | null } | null) => {
      if (!user) {
        setUserEmail(null);
        setUserId(null);
        setLoadingUser(false);
        router.push('/auth');
        return;
      }

      setUserEmail(user.email ?? null);
      setUserId(user.id);
      setLoadingUser(false);
    },
    [router]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoadingUser(true);

        const { data, error } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error || !data.user) {
          applyUser(null);
          return;
        }

        applyUser({ id: data.user.id, email: data.user.email });
      } catch {
        if (!mounted) return;
        applyUser(null);
      }
    };

    init();

    // Listen perubahan session (logout / expired / login)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const u = session?.user ?? null;
      if (!u) {
        applyUser(null);
        return;
      }

      applyUser({ id: u.id, email: u.email });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [applyUser]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // apapun hasilnya, arahkan ke auth
      router.push('/auth');
    }
  }, [router]);

  return {
    loadingUser,
    userEmail,
    userId,
    logout,
  };
}

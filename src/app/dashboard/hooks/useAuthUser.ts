'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function useAuthUser() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/auth');
        return;
      }

      setUserEmail(data.user.email ?? null);
      setUserId(data.user.id);
      setLoadingUser(false);
    };

    init();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return {
    loadingUser,
    userEmail,
    userId,
    logout,
  };
}
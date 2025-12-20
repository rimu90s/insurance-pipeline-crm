'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Args = {
  userId: string | null | undefined;
  onChange: () => void | Promise<void>;
};

type OwnerRow = {
  owner_id: string | null;
};

function hasOwnerId(value: unknown): value is OwnerRow {
  if (!value || typeof value !== 'object') return false;
  return 'owner_id' in value;
}

export function usePipelinesRealtime({ userId, onChange }: Args) {
  useEffect(() => {
    if (!userId) return;

    let alive = true;

    const channel = supabase
      .channel(`pipelines-owner-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipelines' },
        (payload: RealtimePostgresChangesPayload<OwnerRow>) => {
          if (!alive) return;

          const newOwner = hasOwnerId(payload.new) ? payload.new.owner_id : null;
          const oldOwner = hasOwnerId(payload.old) ? payload.old.owner_id : null;

          if (newOwner === userId || oldOwner === userId) {
            void onChange();
          }
        }
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, onChange]);
}

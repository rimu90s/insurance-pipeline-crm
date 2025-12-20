'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Args = {
  userId: string | null | undefined;
  onChange: () => void | Promise<void>;
  debounceMs?: number; // default 500ms
};

type OwnerRow = {
  owner_id: string | null;
};

function hasOwnerId(value: unknown): value is OwnerRow {
  if (!value || typeof value !== 'object') return false;
  return 'owner_id' in value;
}

export function usePipelinesRealtime({ userId, onChange, debounceMs = 500 }: Args) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    let alive = true;

    const scheduleReload = () => {
      if (!alive) return;

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void onChange();
      }, debounceMs);
    };

    const channel = supabase
      .channel(`pipelines-owner-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipelines' },
        (payload: RealtimePostgresChangesPayload<OwnerRow>) => {
          if (!alive) return;

          const newOwner = hasOwnerId(payload.new) ? payload.new.owner_id : null;
          const oldOwner = hasOwnerId(payload.old) ? payload.old.owner_id : null;

          // hanya reload kalau row milik user ini
          if (newOwner === userId || oldOwner === userId) {
            scheduleReload();
          }
        }
      )
      .subscribe();

    return () => {
      alive = false;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [userId, onChange, debounceMs]);
}

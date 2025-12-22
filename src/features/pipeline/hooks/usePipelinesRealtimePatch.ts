// src/features/pipeline/hooks/usePipelinesRealtimePatch.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { PipelineRow } from '@/types/pipeline';

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type Args = {
  userId: string | null | undefined;
  setPipelines: React.Dispatch<React.SetStateAction<PipelineRow[]>>;
  onTouchedId?: (id: string) => void;
  onStatusChange?: (status: RealtimeStatus) => void;
};

function hasId(value: unknown): value is { id: string } {
  if (!value || typeof value !== 'object') return false;
  return 'id' in value && typeof (value as { id?: unknown }).id === 'string';
}

function isPipelineRow(value: unknown): value is PipelineRow {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.product_id === 'string' &&
    typeof v.customer_name === 'string'
  );
}

function sortByPipelineDateDesc(a: PipelineRow, b: PipelineRow) {
  const ad = a.pipeline_date ?? '';
  const bd = b.pipeline_date ?? '';
  if (ad === bd) return 0;
  if (!ad) return 1;
  if (!bd) return -1;
  return bd.localeCompare(ad);
}

export function usePipelinesRealtimePatch({
  userId,
  setPipelines,
  onTouchedId,
  onStatusChange,
}: Args) {
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');

  useEffect(() => {
    if (!userId) return;

    let alive = true;

    // Hindari setState sync di body effect (supaya tidak kena rule react-hooks/set-state-in-effect)
    queueMicrotask(() => {
      if (!alive) return;
      setStatus('connecting');
      onStatusChange?.('connecting');
    });

    const channel = supabase
      .channel(`pipelines-patch-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipelines',
          // ✅ kunci utama: filter level channel
          // jadi event yang masuk sudah pasti milik userId
          filter: `owner_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<PipelineRow>) => {
          if (!alive) return;

          const event = payload.eventType;
          const newRaw = payload.new;
          const oldRaw = payload.old;

          const newRow = isPipelineRow(newRaw) ? newRaw : null;

          // touchedId wajib ada untuk DELETE yang payload.old sering minim
          const touchedId =
            event === 'DELETE'
              ? (hasId(oldRaw) ? oldRaw.id : null)
              : (newRow?.id ?? (hasId(newRaw) ? newRaw.id : null));

          if (!touchedId) return;

          onTouchedId?.(touchedId);

          setPipelines((prev) => {
            // ✅ DELETE: cukup remove by id. Karena prev hanya berisi data user ini.
            if (event === 'DELETE') {
              return prev.filter((p) => p.id !== touchedId);
            }

            // INSERT / UPDATE butuh newRow yang valid
            if (!newRow) return prev;

            const idx = prev.findIndex((p) => p.id === newRow.id);

            // upsert
            if (idx === -1) {
              const next = [newRow, ...prev];
              next.sort(sortByPipelineDateDesc);
              return next;
            }

            // replace
            const next = [...prev];
            next[idx] = newRow;
            next.sort(sortByPipelineDateDesc);
            return next;
          });
        }
      )
      .subscribe((s) => {
        if (!alive) return;

        const nextStatus: RealtimeStatus =
          s === 'SUBSCRIBED'
            ? 'connected'
            : s === 'CHANNEL_ERROR' || s === 'TIMED_OUT'
              ? 'error'
              : s === 'CLOSED'
                ? 'disconnected'
                : 'connecting';

        setStatus(nextStatus);
        onStatusChange?.(nextStatus);
      });

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, setPipelines, onTouchedId, onStatusChange]);

  return status;
}

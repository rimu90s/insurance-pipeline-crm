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
    typeof v.customer_name === 'string' &&
    'owner_id' in v
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

  // Kalau userId hilang (logout / belum login), pastikan status ikut turun
  useEffect(() => {
    if (!userId && status !== 'disconnected') {
      setStatus('disconnected');
      onStatusChange?.('disconnected');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let alive = true;

    // jangan setState sync di body effect → pakai microtask
    queueMicrotask(() => {
      if (!alive) return;
      setStatus('connecting');
      onStatusChange?.('connecting');
    });

    const channel = supabase
      .channel(`pipelines-patch-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipelines' },
        (payload: RealtimePostgresChangesPayload<PipelineRow>) => {
          if (!alive) return;

          const event = payload.eventType;
          const newRaw = payload.new;
          const oldRaw = payload.old;

          const newRow = isPipelineRow(newRaw) ? newRaw : null;
          const oldRow = isPipelineRow(oldRaw) ? oldRaw : null;

          const newOwner = newRow
            ? (((newRow as unknown as { owner_id?: string | null }).owner_id) ?? null)
            : null;

          const oldOwner = oldRow
            ? (((oldRow as unknown as { owner_id?: string | null }).owner_id) ?? null)
            : null;

          if (newOwner !== userId && oldOwner !== userId) return;

          const touchedId =
            event === 'DELETE'
              ? oldRow?.id ?? (hasId(oldRaw) ? oldRaw.id : null)
              : newRow?.id ?? (hasId(newRaw) ? newRaw.id : null);

          if (!touchedId) return;

          onTouchedId?.(touchedId);

          setPipelines((prev) => {
            // DELETE
            if (event === 'DELETE') {
              return prev.filter((p) => p.id !== touchedId);
            }

            // INSERT / UPDATE
            if (!newRow) return prev;

            // kalau row pindah owner dan sekarang bukan punya user → remove
            if (newOwner !== userId) {
              return prev.filter((p) => p.id !== newRow.id);
            }

            const idx = prev.findIndex((p) => p.id === newRow.id);

            if (idx === -1) {
              const next = [newRow, ...prev];
              next.sort(sortByPipelineDateDesc);
              return next;
            }

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

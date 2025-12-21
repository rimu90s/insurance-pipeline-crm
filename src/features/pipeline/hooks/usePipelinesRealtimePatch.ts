'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { PipelineRow } from '@/types/pipeline';

type Args = {
  userId: string | null | undefined;
  setPipelines: React.Dispatch<React.SetStateAction<PipelineRow[]>>;
};

// payload.new / payload.old bisa {} → kita perlu type guard
function hasId(value: unknown): value is { id: string } {
  if (!value || typeof value !== 'object') return false;
  return 'id' in value && typeof (value as { id?: unknown }).id === 'string';
}

function isPipelineRow(value: unknown): value is PipelineRow {
  // minimal check: punya id, owner_id, product_id, customer_name
  if (!value || typeof value !== 'object') return false;

  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    // owner_id ada di table kamu (dipakai di query .eq('owner_id', userId))
    ('owner_id' in v) &&
    typeof v.product_id === 'string' &&
    typeof v.customer_name === 'string'
  );
}

function sortByPipelineDateDesc(a: PipelineRow, b: PipelineRow) {
  // null dianggap paling bawah
  const ad = a.pipeline_date ?? '';
  const bd = b.pipeline_date ?? '';
  if (ad === bd) return 0;
  if (!ad) return 1;
  if (!bd) return -1;
  // format YYYY-MM-DD → string compare aman
  return bd.localeCompare(ad);
}

export function usePipelinesRealtimePatch({ userId, setPipelines }: Args) {
  useEffect(() => {
    if (!userId) return;

    let alive = true;

    const channel = supabase
      .channel(`pipelines-patch-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipelines' },
        (payload: RealtimePostgresChangesPayload<PipelineRow>) => {
          if (!alive) return;

          const event = payload.eventType;

          // Ambil kandidat row dari payload
          const newRowRaw = payload.new;
          const oldRowRaw = payload.old;

          const newRow = isPipelineRow(newRowRaw) ? newRowRaw : null;
          const oldRow = isPipelineRow(oldRowRaw) ? oldRowRaw : null;

          // owner_id ada di row DB (kamu pakai di query). Kita akses aman via Record.
          const newOwner =
            newRow && (newRow as unknown as { owner_id?: string | null }).owner_id
              ? (newRow as unknown as { owner_id?: string | null }).owner_id
              : null;

          const oldOwner =
            oldRow && (oldRow as unknown as { owner_id?: string | null }).owner_id
              ? (oldRow as unknown as { owner_id?: string | null }).owner_id
              : null;

          // Kita patch hanya kalau menyangkut user ini
          const touchesMe = newOwner === userId || oldOwner === userId;
          if (!touchesMe) return;

          setPipelines((prev) => {
            // DELETE: payload.old biasanya berisi row
            if (event === 'DELETE') {
              if (!oldRow && hasId(oldRowRaw)) {
                return prev.filter((p) => p.id !== oldRowRaw.id);
              }
              if (oldRow) return prev.filter((p) => p.id !== oldRow.id);
              return prev;
            }

            // INSERT / UPDATE
            if (!newRow && hasId(newRowRaw)) {
              // tidak bisa patch detail kalau row tidak lengkap → skip (jarang)
              return prev;
            }

            if (!newRow) return prev;

            // Kalau row pindah owner (misal update owner_id), dan sekarang bukan milik user ini → hapus dari state
            if (newOwner !== userId) {
              return prev.filter((p) => p.id !== newRow.id);
            }

            const idx = prev.findIndex((p) => p.id === newRow.id);

            // INSERT (atau UPDATE tapi belum ada di state): upsert
            if (idx === -1) {
              const next = [newRow, ...prev];
              next.sort(sortByPipelineDateDesc);
              return next;
            }

            // UPDATE: replace row
            const next = [...prev];
            next[idx] = newRow;
            next.sort(sortByPipelineDateDesc);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, setPipelines]);
}

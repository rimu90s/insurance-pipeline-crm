'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { PipelineRow } from '@/types/pipeline';

type Args = {
  userId: string | null | undefined;
  setPipelines: React.Dispatch<React.SetStateAction<PipelineRow[]>>;

  // optional: untuk highlight row di UI (PipelinePage)
  onTouchedId?: (id: string) => void;
};

// payload.new / payload.old kadang bertipe {} → type guard minimal
function hasId(value: unknown): value is { id: string } {
  if (!value || typeof value !== 'object') return false;
  return 'id' in value && typeof (value as { id?: unknown }).id === 'string';
}

// validasi minimal bentuk PipelineRow (supaya aman dari {} / partial)
function isPipelineRow(value: unknown): value is PipelineRow {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === 'string' &&
    typeof v.product_id === 'string' &&
    typeof v.customer_name === 'string' &&
    // owner_id harus ada di tabel kamu, karena query kamu pakai owner_id
    'owner_id' in v
  );
}

// sort: tanggal terbaru di atas (null paling bawah)
function sortByPipelineDateDesc(a: PipelineRow, b: PipelineRow) {
  const ad = a.pipeline_date ?? '';
  const bd = b.pipeline_date ?? '';

  if (ad === bd) return 0;
  if (!ad) return 1;
  if (!bd) return -1;

  // YYYY-MM-DD → string compare aman
  return bd.localeCompare(ad);
}

export function usePipelinesRealtimePatch({ userId, setPipelines, onTouchedId }: Args) {
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

          const newRaw = payload.new;
          const oldRaw = payload.old;

          const newRow = isPipelineRow(newRaw) ? newRaw : null;
          const oldRow = isPipelineRow(oldRaw) ? oldRaw : null;

          const newOwner =
            newRow && typeof (newRow as unknown as { owner_id?: unknown }).owner_id !== 'undefined'
              ? ((newRow as unknown as { owner_id?: string | null }).owner_id ?? null)
              : null;

          const oldOwner =
            oldRow && typeof (oldRow as unknown as { owner_id?: unknown }).owner_id !== 'undefined'
              ? ((oldRow as unknown as { owner_id?: string | null }).owner_id ?? null)
              : null;

          // hanya patch kalau event menyangkut user ini
          const touchesMe = newOwner === userId || oldOwner === userId;
          if (!touchesMe) return;

          // id yang “tersentuh” untuk highlight (opsional)
          const touchedId =
            (event === 'DELETE'
              ? oldRow?.id ?? (hasId(oldRaw) ? oldRaw.id : null)
              : newRow?.id ?? (hasId(newRaw) ? newRaw.id : null)) ?? null;

          if (touchedId) onTouchedId?.(touchedId);

          setPipelines((prev) => {
            // DELETE
            if (event === 'DELETE') {
              if (oldRow) return prev.filter((p) => p.id !== oldRow.id);
              if (hasId(oldRaw)) return prev.filter((p) => p.id !== oldRaw.id);
              return prev;
            }

            // INSERT / UPDATE
            if (!newRow) {
              // jika payload.new tidak lengkap → skip (jarang terjadi)
              return prev;
            }

            // Kalau row pindah owner dan sekarang bukan milik user ini → remove
            if (newOwner !== userId) {
              return prev.filter((p) => p.id !== newRow.id);
            }

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
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, setPipelines, onTouchedId]);
}

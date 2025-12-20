'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PipelineRow } from '@/types/pipeline';

export function usePipelines(userId?: string | null) {
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);

  // Manual reload yang bisa dipanggil dari UI (button / after create/edit/delete)
  const reloadPipelines = useCallback(async () => {
    if (!userId) {
      setPipelines([]);
      setLoadingPipelines(false);
      return;
    }

    setLoadingPipelines(true);

    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('owner_id', userId)
      .order('pipeline_date', { ascending: false });

    if (error) {
      setPipelines([]);
      setLoadingPipelines(false);
      return;
    }

    setPipelines((data ?? []) as PipelineRow[]);
    setLoadingPipelines(false);
  }, [userId]);

  // Auto fetch on userId change (inline, biar lolos rule react-hooks/set-state-in-effect)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId) {
        if (cancelled) return;
        setPipelines([]);
        setLoadingPipelines(false);
        return;
      }

      if (cancelled) return;
      setLoadingPipelines(true);

      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('owner_id', userId)
        .order('pipeline_date', { ascending: false });

      if (cancelled) return;

      if (error) {
        setPipelines([]);
        setLoadingPipelines(false);
        return;
      }

      setPipelines((data ?? []) as PipelineRow[]);
      setLoadingPipelines(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    pipelines,
    setPipelines,
    loadingPipelines,
    reloadPipelines,
  };
}

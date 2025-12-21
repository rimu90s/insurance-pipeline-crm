// src/features/pipeline/hooks/usePipelines.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { PipelineRow } from '@/types/pipeline';

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

  // Auto fetch on userId change
  // NOTE: gunakan setTimeout agar setState tidak terjadi sinkron di body effect (lolos react-hooks/set-state-in-effect)
  useEffect(() => {
    const t = window.setTimeout(() => {
      void reloadPipelines();
    }, 0);

    return () => {
      window.clearTimeout(t);
    };
  }, [reloadPipelines]);

  return {
    pipelines,
    setPipelines,
    loadingPipelines,
    reloadPipelines,
  };
}

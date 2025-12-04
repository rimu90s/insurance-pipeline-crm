'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PipelineRow } from '@/types/pipeline';

export function usePipelines(userId?: string | null) {
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);

  const fetchPipelines = useCallback(async () => {
    if (!userId) return;

    setLoadingPipelines(true);

    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('owner_id', userId)
      .order('pipeline_date', { ascending: false });

    if (!error) setPipelines(data || []);

    setLoadingPipelines(false);
  }, [userId]);

//   useEffect(() => {
//     fetchPipelines();
//   }, [fetchPipelines]);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchPipelines();
}, [fetchPipelines]);
 

  return {
    pipelines,
    setPipelines,
    loadingPipelines,
    reloadPipelines: fetchPipelines,
  };
}

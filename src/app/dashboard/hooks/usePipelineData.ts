'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PipelineRow } from '@/types/pipeline';

// Tipe lokal untuk dropdown
type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

const PIPELINE_SELECT = `
  id,
  product_id,
  marketer_id,
  customer_name,
  branch,
  class,
  ape_idr,
  ape_usd,
  execution_plan,
  quadrant,
  remarks,
  priority_flag,
  pipeline_date,
  status,
  lead_source,
  expected_closing_date,
  last_contact_date,
  next_action,
  risk_tag
`;

export function usePipelineData(userId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const fetchAll = useCallback(async () => {
    if (!userId) return;

    setLoadingData(true);

    try {
      const [
        { data: productsData },
        { data: marketersData },
        { data: pipelinesData },
      ] = await Promise.all([
        supabase.from('products').select('id, name').order('name'),
        supabase
          .from('marketers')
          .select('id, name, branch')
          .order('name'),
        supabase
          .from('pipelines')
          .select(PIPELINE_SELECT)
          .eq('owner_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      setProducts(productsData ?? []);
      setMarketers(marketersData ?? []);
      setPipelines((pipelinesData ?? []) as PipelineRow[]);
    } finally {
      setLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    products,
    marketers,
    pipelines,
    setPipelines,
    loadingData,
    reloadPipelines: fetchAll,
  };
}

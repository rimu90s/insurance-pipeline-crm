'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { MarketerMaster } from '@/types/pipeline';

export function useMarketers() {
const [marketers, setMarketers] = useState<MarketerMaster[]>([]);
const [loadingMarketers, setLoadingMarketers] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoadingMarketers(true);

      const { data, error } = await supabase
        .from('marketers')
        .select('*')
        .order('name');

      if (!error) setMarketers(data || []);

      setLoadingMarketers(false);
    };

    fetch();
  }, []);

  return { marketers, loadingMarketers };
}

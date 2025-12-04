'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useMarketers() {

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const [marketers, setMarketers] = useState<any[]>([]);
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

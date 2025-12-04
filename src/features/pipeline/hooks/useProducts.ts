'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ProductMaster } from '@/types/pipeline';

export function useProducts() {
    const [products, setProducts] = useState<ProductMaster[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (!error) setProducts(data || []);

      setLoadingProducts(false);
    };

    fetch();
  }, []);

  return { products, loadingProducts };
}

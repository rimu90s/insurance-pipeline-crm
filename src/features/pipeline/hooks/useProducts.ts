'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useProducts() {
    type Product = {
    id: string;
    name: string;
      // field lain boleh ada, tapi tidak kita pakai di frontend scope ini
    [key: string]: unknown;
    };
    const [products, setProducts] = useState<Product[]>([]);
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

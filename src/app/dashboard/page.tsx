'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // kalau tidak ada user, balik ke /auth
        router.push('/auth');
        return;
      }

      setUserEmail(data.user.email ?? null);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-600">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard Pipeline</h1>
            <p className="text-sm text-slate-600">
              Logged in as <span className="font-medium">{userEmail}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-sm border bg-white hover:bg-slate-100"
          >
            Logout
          </button>
        </header>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-slate-700">
            Ini placeholder Dashboard. Nantinya di sini akan ada:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 mt-2">
            <li>Form input pipeline nasabah</li>
            <li>Daftar pipeline berdasarkan produk</li>
            <li>Tombol export Excel sesuai format kantor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

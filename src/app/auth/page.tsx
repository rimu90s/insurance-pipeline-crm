'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Kalau user sudah login, langsung lempar ke dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    if (mode === 'register' && password !== confirmPwd) {
      setErrorMsg('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
      } else {
        // REGISTER
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
      }

      // kalau sukses login / register → ke dashboard
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrorMsg(null);
    setPassword('');
    setConfirmPwd('');
  };

  const title =
    mode === 'login'
      ? 'Masuk ke Sales Pipeline'
      : 'Daftar akun Sales Pipeline';

  const subtitle =
    mode === 'login'
      ? 'Kelola dan laporkan pipeline dalam format yang disukai atasan.'
      : 'Buat akun untuk mulai menyimpan dan mengelola data pipeline Anda.';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-[1.3fr,1fr] bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        {/* LEFT PANEL (brand / elevator pitch) */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 text-slate-50 p-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-50/10 border border-slate-700 flex items-center justify-center text-xs font-bold">
                SP
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Sales Pipeline
                </p>
                <p className="text-sm font-semibold">Untuk Sales Asuransi</p>
              </div>
            </div>

            <h1 className="text-xl font-semibold mb-3">
              Laporan pipeline rapi, sesuai format atasan.
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Input pipeline harian, filter per produk & kuadran, export ke
              Excel, dan copy format WhatsApp dalam sekali klik. Dibuat khusus
              untuk kebutuhan sales asuransi yang butuh laporan cepat dan
              profesional.
            </p>
          </div>

          <div className="mt-8 space-y-1 text-[11px] text-slate-400">
            <p>• Multi-user ready (satu akun per sales)</p>
            <p>• Format export mengikuti template laporan pipeline</p>
            <p>• Data Anda aman di Supabase</p>
          </div>
        </div>

        {/* RIGHT PANEL (form) */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          {/* Brand kecil untuk layar kecil */}
          <div className="md:hidden mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              SP
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Sales Pipeline
              </p>
              <p className="text-xs text-slate-700">
                Untuk sales asuransi
              </p>
            </div>
          </div>

          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 mb-4">{subtitle}</p>

          {errorMsg && (
            <div className="mb-3 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 text-xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 text-xs"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading
                ? mode === 'login'
                  ? 'Memproses...'
                  : 'Membuat akun...'
                : mode === 'login'
                ? 'Masuk'
                : 'Daftar'}
            </button>
          </form>

          <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {mode === 'login'
                ? 'Belum punya akun?'
                : 'Sudah punya akun?'}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-[11px] font-medium text-slate-900 hover:underline"
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk saja'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

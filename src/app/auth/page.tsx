'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi.');
      }

      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        setMessage('Registrasi berhasil. Silakan login dengan akun tersebut.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Terjadi kesalahan.');
      } else {
        setError('Terjadi kesalahan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white w-10 h-10 text-lg font-bold shadow-md">
            SP
          </div>
          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            Sales Pipeline
          </h1>
          <p className="text-sm text-slate-500">
            CRM ringan untuk sales asuransi – kelola pipeline & laporan dengan rapi.
          </p>
        </div>

        {/* Card Auth */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5">
          {/* Toggle Login / Register */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setMessage(null);
              }}
              className={`px-4 py-1.5 rounded-full border text-sm transition ${
                mode === 'login'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setMessage(null);
              }}
              className={`px-4 py-1.5 rounded-full border text-sm transition ${
                mode === 'register'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan email kerja Anda. Satu akun untuk seluruh pipeline.
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-sm outline-none bg-slate-50/60"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-sm outline-none bg-slate-50/60"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading
                ? mode === 'login'
                  ? 'Sedang login...'
                  : 'Sedang mendaftar...'
                : mode === 'login'
                ? 'Login'
                : 'Register'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Dengan masuk, Anda menyetujui bahwa data pipeline akan disimpan dengan aman.
          </p>
        </div>
      </div>
    </div>
  );
}

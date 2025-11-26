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

  const handleSubmit = async (e: FormEvent) => {
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

        setMessage('Registrasi berhasil. Silakan login.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // setelah login sukses, arahkan ke dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">
          {mode === 'login' ? 'Login' : 'Register'} – Sales Pipeline
        </h1>

        <div className="flex justify-center space-x-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setMessage(null);
            }}
            className={`px-3 py-1 rounded-full border ${
              mode === 'login' ? 'bg-slate-900 text-white' : 'bg-white'
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
            className={`px-3 py-1 rounded-full border ${
              mode === 'register' ? 'bg-slate-900 text-white' : 'bg-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-md text-sm font-medium bg-slate-900 text-white disabled:opacity-60"
          >
            {loading
              ? mode === 'login'
                ? 'Sedang login...'
                : 'Sedang register...'
              : mode === 'login'
              ? 'Login'
              : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

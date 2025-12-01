'use client';

import Link from 'next/link';

type DashboardTopBarProps = {
  userEmail: string | null;
  onLogout: () => void;
};

export default function DashboardTopBar({
  userEmail,
  onLogout,
}: DashboardTopBarProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            SP
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Sales Pipeline
            </h1>
            <p className="text-[11px] text-slate-500">
              Pipeline & reporting untuk sales asuransi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Masuk sebagai</p>
            <p className="text-xs font-medium text-slate-800">
              {userEmail}
            </p>
          </div>
          <Link
            href="/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
          >
            Settings
          </Link>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

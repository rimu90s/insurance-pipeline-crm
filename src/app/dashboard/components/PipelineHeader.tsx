'use client';

import Link from 'next/link';

type PipelineHeaderProps = {
  userEmail: string | null;
  onLogout: () => void;
};

export default function PipelineHeader({ userEmail, onLogout }: PipelineHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand + context */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-[11px] font-semibold tracking-tight text-white shadow-sm">
            SP
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-900">
                Sales Pipeline CRM
              </h1>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Private beta
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Monitoring pipeline asuransi, APE, dan progres closing harian.
            </p>
          </div>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] text-slate-500">Masuk sebagai</p>
            <p className="max-w-[200px] truncate text-[11px] font-medium text-slate-800">
              {userEmail}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:inline-flex"
            >
              Settings
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

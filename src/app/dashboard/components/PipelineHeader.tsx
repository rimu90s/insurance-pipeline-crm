'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { RealtimeStatus } from '@/features/pipeline/hooks/usePipelinesRealtimePatch';

type PipelineHeaderProps = {
  userEmail: string | null;
  onLogout: () => void;

  // optional badge realtime
  realtimeStatus?: RealtimeStatus;
};

function statusLabel(s: RealtimeStatus) {
  switch (s) {
    case 'connected':
      return 'Realtime: ON';
    case 'connecting':
      return 'Realtime: Connecting';
    case 'error':
      return 'Realtime: Error';
    case 'disconnected':
    default:
      return 'Realtime: OFF';
  }
}

function statusClass(s: RealtimeStatus) {
  // jangan ribet: warna text & background beda tipis
  switch (s) {
    case 'connected':
      return 'border-emerald-100 bg-emerald-50 text-emerald-700';
    case 'connecting':
      return 'border-amber-100 bg-amber-50 text-amber-700';
    case 'error':
      return 'border-rose-100 bg-rose-50 text-rose-700';
    case 'disconnected':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

export default function PipelineHeader({
  userEmail,
  onLogout,
  realtimeStatus,
}: PipelineHeaderProps) {
  const pathname = usePathname();

  const isPipeline = pathname === '/dashboard';
  const isReport = pathname === '/dashboard/report';

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

              {realtimeStatus && (
                <span
                  title={statusLabel(realtimeStatus)}
                  className={[
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    statusClass(realtimeStatus),
                  ].join(' ')}
                >
                  {statusLabel(realtimeStatus)}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Monitoring pipeline asuransi, APE, dan progres closing harian.
            </p>
          </div>
        </div>

        {/* Middle nav: Pipeline / Report */}
        <nav className="hidden md:flex items-center gap-1 text-[11px] font-medium">
          <Link
            href="/dashboard"
            className={[
              'rounded-lg px-3 py-1.5 transition-colors',
              isPipeline
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            Pipeline
          </Link>
          <Link
            href="/dashboard/report"
            className={[
              'rounded-lg px-3 py-1.5 transition-colors',
              isReport
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            Daily report
          </Link>
        </nav>

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

      {/* Mobile nav */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-1 px-4 pb-2 pt-1 md:hidden">
        <Link
          href="/dashboard"
          className={[
            'flex-1 rounded-lg px-3 py-1.5 text-center text-[11px] font-medium transition-colors',
            isPipeline
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200',
          ].join(' ')}
        >
          Pipeline
        </Link>
        <Link
          href="/dashboard/report"
          className={[
            'flex-1 rounded-lg px-3 py-1.5 text-center text-[11px] font-medium transition-colors',
            isReport
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200',
          ].join(' ')}
        >
          Daily report
        </Link>
      </div>
    </header>
  );
}

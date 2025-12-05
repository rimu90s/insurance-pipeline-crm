'use client';

import { useAuthUser } from '../hooks/useAuthUser';
import {
  usePipelines,
} from '@/features/pipeline';
import PipelineHeader from '../components/PipelineHeader';
import { useDailyReport, WeeklyRow } from '@/features/pipeline/hooks/useDailyReport';

function formatCurrencyIdr(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatCurrencyUsd(value: number) {
  return `$ ${value.toLocaleString('en-US')}`;
}

export default function DailyReportPage() {
  const { loadingUser, userEmail, userId, logout } = useAuthUser();

  const {
    pipelines,
    loadingPipelines,
  } = usePipelines(userId);

  const loading = loadingUser || loadingPipelines;

  const report = useDailyReport(pipelines);

  if (loading) {
    return (
      <div className="min-h-screen">
        <PipelineHeader userEmail={userEmail} onLogout={logout} />
        <main className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-sm text-slate-600">
            Memuat laporan harian…
          </p>
        </main>
      </div>
    );
  }

  const { today, weekly } = report;

  return (
    <div className="min-h-screen">
      <PipelineHeader userEmail={userEmail} onLogout={logout} />

      <main className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        {/* Title */}
        <section className="space-y-1">
          <h1 className="text-base font-semibold text-slate-900">
            Daily pipeline report
          </h1>
          <p className="text-[11px] text-slate-500">
            Ringkasan performa pipeline hari ini dan tren 7 hari terakhir.
          </p>
        </section>

        {/* TODAY SUMMARY */}
        <section className="grid gap-4 md:grid-cols-4 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              Pipeline hari ini
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
              {today.totalPipeline}
            </h2>
            <p className="text-[11px] text-slate-500">
              Jumlah pipeline dengan tanggal pipeline hari ini.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              APE IDR hari ini
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
              {formatCurrencyIdr(today.apeIdr)}
            </h2>
            <p className="text-[11px] text-slate-500">
              Total APE IDR dari pipeline dengan tanggal hari ini.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              APE USD hari ini
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
              {formatCurrencyUsd(today.apeUsd)}
            </h2>
            <p className="text-[11px] text-slate-500">
              Total APE USD dari pipeline dengan tanggal hari ini.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              Aktivitas hari ini
            </p>
            <div className="text-[11px] text-slate-700 space-y-0.5">
              <p>
                <span className="font-semibold">{today.newPipelines}</span>{' '}
                pipeline baru
              </p>
              <p>
                <span className="font-semibold">{today.followUps}</span>{' '}
                follow up
              </p>
              <p>
                <span className="font-semibold">{today.won}</span> won •{' '}
                <span className="font-semibold">{today.lost}</span> lost
              </p>
            </div>
          </div>
        </section>

        {/* WEEKLY TABLE */}
        <section className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Tren 7 hari terakhir
              </h2>
              <p className="text-[11px] text-slate-500">
                Rekap jumlah pipeline, APE, dan status won/lost berdasarkan tanggal pipeline.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Tanggal
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Pipeline
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    APE IDR
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    APE USD
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Won
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Lost
                  </th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((row: WeeklyRow) => (
                  <tr key={row.date} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {row.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {row.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-slate-700">
                      {row.totalPipeline}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-slate-700">
                      {formatCurrencyIdr(row.apeIdr)}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-slate-700">
                      {formatCurrencyUsd(row.apeUsd)}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-emerald-700">
                      {row.won}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-rose-700">
                      {row.lost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

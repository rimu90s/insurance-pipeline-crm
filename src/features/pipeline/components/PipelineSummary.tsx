'use client';

type PipelineSummaryProps = {
  totalCount: number;
  totalApeIdr: number;
  totalApeUsd: number;
  loading: boolean;
};

export default function PipelineSummary({
  totalCount,
  totalApeIdr,
  totalApeUsd,
  loading,
}: PipelineSummaryProps) {
  // Skeleton mode saat data masih di-load
  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-pulse"
          >
            <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
            <div className="h-6 w-32 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </section>
    );
  }

  // Normal mode (data siap)
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
        <p className="text-[11px] font-medium text-slate-500">
          Total pipeline (terfilter)
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
          {totalCount}
        </h2>
        <p className="text-[11px] text-slate-500">
          Jumlah nasabah dalam pipeline sesuai filter aktif.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
        <p className="text-[11px] font-medium text-slate-500">
          APE IDR (sum, terfilter)
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
          Rp {totalApeIdr.toLocaleString('id-ID')}
        </h2>
        <p className="text-[11px] text-slate-500">
          Total APE IDR dari data yang sedang ditampilkan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
        <p className="text-[11px] font-medium text-slate-500">
          APE USD (sum, terfilter)
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
          ${totalApeUsd.toLocaleString('en-US')}
        </h2>
        <p className="text-[11px] text-slate-500">
          Total APE USD dari data yang sedang ditampilkan.
        </p>
      </div>
    </section>
  );
}

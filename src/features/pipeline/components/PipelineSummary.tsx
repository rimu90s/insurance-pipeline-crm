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
  // Skeleton saat loading
  if (loading) {
    return (
      <section className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-slate-100 mb-2" />
            <div className="h-6 w-32 rounded bg-slate-100 mb-2" />
            <div className="h-3 w-40 rounded bg-slate-100" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {/* Total pipeline */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">
          Total pipeline (terfilter)
        </p>
        <div className="mt-1 mb-1">
          <p className="text-[26px] font-semibold leading-tight text-slate-900">
            {totalCount}
          </p>
        </div>
        <p className="text-[11px] text-slate-500">
          Jumlah nasabah dalam pipeline sesuai filter aktif.
        </p>
      </div>

      {/* APE IDR */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">
          APE IDR (sum, terfilter)
        </p>
        <div className="mt-1 mb-1">
          <p className="text-[24px] font-semibold leading-tight text-slate-900 text-right md:text-left">
            {`Rp ${totalApeIdr.toLocaleString('id-ID')}`}
          </p>
        </div>
        <p className="text-[11px] text-slate-500">
          Total APE IDR dari data yang sedang ditampilkan.
        </p>
      </div>

      {/* APE USD */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">
          APE USD (sum, terfilter)
        </p>
        <div className="mt-1 mb-1">
          <p className="text-[24px] font-semibold leading-tight text-slate-900 text-right md:text-left">
            {`$${totalApeUsd.toLocaleString('en-US')}`}
          </p>
        </div>
        <p className="text-[11px] text-slate-500">
          Total APE USD dari data yang sedang ditampilkan.
        </p>
      </div>
    </section>
  );
}

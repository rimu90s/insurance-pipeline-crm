'use client';

type PipelineSummaryProps = {
  totalCount: number;
  totalApeIdr: number;
  totalApeUsd: number;
  loading: boolean;
};

function SummaryCard({
  title,
  value,
  context,
  hint,
  alignRightOnMobile = false,
}: {
  title: string;
  value: React.ReactNode;
  context: string;
  hint: string;
  alignRightOnMobile?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-[11px] font-medium text-slate-500">{title}</p>

        <div className="mt-1 mb-1">
          <p
            className={[
              'text-[24px] font-semibold leading-tight text-slate-900 md:text-left',
              alignRightOnMobile ? 'text-right' : 'text-left',
            ].join(' ')}
          >
            {value}
          </p>
        </div>

        <p className="text-[11px] text-slate-500">{context}</p>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

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
      <SummaryCard
        title="Pipeline aktif"
        value={totalCount}
        context="Sesuai filter & periode terpilih"
        hint="Jumlah nasabah dalam pipeline sesuai data yang sedang ditampilkan."
      />

      <SummaryCard
        title="Total APE IDR"
        value={`Rp ${totalApeIdr.toLocaleString('id-ID')}`}
        context="Akumulasi pipeline aktif"
        hint="Penjumlahan APE IDR dari pipeline yang sesuai filter."
        alignRightOnMobile
      />

      <SummaryCard
        title="Total APE USD"
        value={`$${totalApeUsd.toLocaleString('en-US')}`}
        context="Akumulasi pipeline aktif"
        hint="Penjumlahan APE USD dari pipeline yang sesuai filter."
        alignRightOnMobile
      />
    </section>
  );
}

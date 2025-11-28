'use client';

type SumaryProps = {
    totalCount: number;
    totalApeIdr: number;
    totalApeUsd: number;
}

export default function PipelineSumary({totalCount, totalApeIdr, totalApeUsd}: SumaryProps){
    return (
        // cards ringkas atas
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
            <p className="text-[11px] font-medium text-slate-500">Total pipeline (terfilter)</p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">{totalCount}</h2>
            <p className="text-[11px] text-slate-500">Jumlah nasabah dalam pipeline sesuai filter aktif.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">APE IDR (sum, terfilter)</p>
            <h2 className="text-2xl font-semibold text-slate-900">Rp {totalApeIdr.toLocaleString('id-ID')}</h2>
            <p className="text-xs text-slate-500">Total APE IDR dari data yang sedang ditampilkan.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">APE USD (sum, terfilter)</p>
            <h2 className="text-2xl font-semibold text-slate-900">${totalApeUsd.toLocaleString('en-US')}</h2>
            <p className="text-xs text-slate-500">Total APE USD dari data yang sedang ditampilkan.</p>
          </div>
        </section>
    )
}
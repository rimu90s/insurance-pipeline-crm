'use client';
import { PipelineRow } from '@/types/pipeline';


import React from 'react';

type Product = { id: string; name: string };
type Marketer = { id: string; name: string };
// type PipelineRow = {
//   id: string;
//   customer_name: string;
//   branch: string | null;
//   class: string | null;
//   ape_idr: number | null;
//   ape_usd: number | null;
//   execution_plan: string | null;
//   quadrant: string | null;
//   remarks: string | null;
//   priority_flag: boolean;
//   pipeline_date: string | null;
//   product_id: string;
//   marketer_id: string;
// };

type Props = {
  filteredPipelines: PipelineRow[];
  filterProductId: string;
  setFilterProductId: (v: string) => void;
  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  products: Product[];
  marketers: Marketer[];

  exportExcel: () => void;
  openDetailModal: (row: PipelineRow) => void;
};

export default function PipelineTable({
  filteredPipelines,
  filterProductId,
  setFilterProductId,
  filterQuadrant,
  setFilterQuadrant,

  products,
  marketers,

  exportExcel,
  openDetailModal,
}: Props) {
  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? '-';

  const getMarketerName = (id: string) =>
    marketers.find((m) => m.id === id)?.name ?? '-';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Data pipeline
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        Filter, lihat detail, export Excel, dan kelola pipeline Anda.
      </p>

      {/* FILTER + EXPORT */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select
          className="border text-xs border-slate-200 rounded-lg px-3 py-2"
          value={filterProductId}
          onChange={(e) => setFilterProductId(e.target.value)}
        >
          <option value="">Semua produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="border text-xs border-slate-200 rounded-lg px-3 py-2"
          value={filterQuadrant}
          onChange={(e) => setFilterQuadrant(e.target.value)}
        >
          <option value="">Semua quadrant</option>
          <option value="k1">k1</option>
          <option value="k2">k2</option>
          <option value="k3">k3</option>
          <option value="k4">k4</option>
        </select>

        <button
          onClick={exportExcel}
          className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2 w-20">Produk</th>
                <th className="px-3 py-2 min-w-[140px]">Nasabah</th>
                <th className="px-3 py-2 w-[120px]">Marketer</th>
                <th className="px-3 py-2 text-right w-[110px]">APE IDR</th>
                <th className="px-3 py-2 w-[70px]">Plan</th>
                <th className="px-3 py-2 w-[60px]">Kdr</th>
                <th className="px-3 py-2 text-center w-[70px]">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredPipelines.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 transition-colors ${
                    row.priority_flag
                      ? 'bg-yellow-50 hover:bg-yellow-100'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-3 py-2 align-top">
                    <span className="font-medium text-slate-900">
                      {getProductName(row.product_id)}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        {row.priority_flag && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/90 text-[9px] font-semibold text-white px-1.5 py-px">
                            PRIO
                          </span>
                        )}
                        <span className="font-medium text-slate-900">
                          {row.customer_name}
                        </span>
                      </div>

                      {row.remarks && (
                        <span className="text-[10px] text-slate-500 line-clamp-2">
                          {row.remarks}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2 align-top text-slate-700">
                    {getMarketerName(row.marketer_id)}
                  </td>

                  <td className="px-3 py-2 text-right align-top tabular-nums">
                    {row.ape_idr
                      ? row.ape_idr.toLocaleString('id-ID')
                      : '-'}
                  </td>

                  <td className="px-3 py-2 align-top">
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700 bg-slate-50">
                      {row.execution_plan ?? '-'}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-top uppercase">
                    <span className="inline-flex items-center justify-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800 bg-white">
                      {row.quadrant ?? '-'}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-center align-top">
                    <button
                      onClick={() => openDetailModal(row)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPipelines.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-[11px] text-slate-500 py-6"
                  >
                    Tidak ada data pipeline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

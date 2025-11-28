'use client';

import React from 'react';
import { PipelineRow } from '@/types/pipeline';

type Product = { id: string; name: string };
type Marketer = { id: string; name: string; branch: string | null };

type Props = {
  filteredPipelines: PipelineRow[];
  filterProductId: string;
  setFilterProductId: (v: string) => void;
  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  products: Product[];
  marketers: Marketer[];

  exportExcel: () => void;

  // Aksi dari tabel
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
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
  onEditRow,
  onDeleteRow,
  onCopyWARow,
}: Props) {
  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? '-';

  const getMarketerName = (id: string | null) =>
    id ? marketers.find((m) => m.id === id)?.name ?? '-' : '-';

  const getBranchClass = (row: PipelineRow) => {
    const parts = [
      row.branch ? row.branch : null,
      row.class ? `Class ${row.class}` : null,
    ].filter(Boolean);
    return parts.join(' • ') || '-';
  };

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
          <option value="all">Semua produk</option>
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
          <option value="all">Semua quadrant</option>
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

      {/* TABLE WRAPPER */}
      <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden">
        {/* 
          - relative + overflow-x-auto → kalau kolom banyak, muncul horizontal scroll
          - min-w-[900px] → biar tabel nggak terlalu gepeng di layar besar
        */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[11px] table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2">Produk</th>
                <th className="px-3 py-2">Nasabah</th>
                <th className="px-3 py-2">Marketer / Branch / Class</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">
                  APE (IDR / USD)
                </th>
                <th className="px-3 py-2 whitespace-nowrap">
                  Plan / Tanggal
                </th>
                <th className="px-3 py-2">Kdr</th>
                {/* Action sticky di kanan */}
                <th className="px-3 py-2 text-center sticky right-0 bg-slate-50 z-10">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPipelines.map((row) => {
                const isPrio = !!row.priority_flag;

                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 transition-colors ${
                      isPrio
                        ? 'bg-yellow-50 hover:bg-yellow-100'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Produk */}
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      <span className="font-medium text-slate-900">
                        {getProductName(row.product_id)}
                      </span>
                    </td>

                    {/* Nasabah + Remarks + badge PRIO */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          {isPrio && (
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

                    {/* Marketer + Branch + Class */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800">
                          {getMarketerName(row.marketer_id)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {getBranchClass(row)}
                        </span>
                      </div>
                    </td>

                    {/* APE IDR + USD */}
                    <td className="px-3 py-2 text-right align-top whitespace-nowrap">
                      <div className="tabular-nums text-slate-900">
                        {row.ape_idr
                          ? 'Rp ' + row.ape_idr.toLocaleString('id-ID')
                          : '-'}
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {row.ape_usd
                          ? '$ ' + row.ape_usd.toLocaleString('en-US')
                          : ''}
                      </div>
                    </td>

                    {/* Plan + Tanggal */}
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700 bg-slate-50">
                        {row.execution_plan ?? '-'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {row.pipeline_date ?? ''}
                      </div>
                    </td>

                    {/* Quadrant */}
                    <td className="px-3 py-2 align-top uppercase whitespace-nowrap">
                      <span className="inline-flex items-center justify-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800 bg-white">
                        {row.quadrant ?? '-'}
                      </span>
                    </td>

                    {/* ACTION ICONS – sticky di kanan */}
                    <td
                      className={`px-3 py-2 text-center align-top sticky right-0 z-10 border-l border-slate-100 ${
                        isPrio ? 'bg-yellow-50' : 'bg-white'
                      }`}
                    >
                      <div className="inline-flex items-center gap-1">
                        {/* Detail */}
                        <button
                          onClick={() => openDetailModal(row)}
                          className="px-1.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
                          title="Lihat detail"
                        >
                          <span className="text-[11px]">🔍</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditRow(row)}
                          className="px-1.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
                          title="Edit"
                        >
                          <span className="text-[11px]">✏️</span>
                        </button>

                        {/* Copy WA */}
                        <button
                          onClick={() => onCopyWARow(row)}
                          className="px-1.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
                          title="Copy ke WhatsApp"
                        >
                          <span className="text-[11px]">📋</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteRow(row)}
                          className="px-1.5 py-1 rounded-md border border-red-200 bg-white hover:bg-red-50"
                          title="Hapus"
                        >
                          <span className="text-[11px] text-red-600">
                            🗑️
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

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

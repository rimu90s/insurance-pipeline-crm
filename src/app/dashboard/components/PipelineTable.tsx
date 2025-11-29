'use client';

import React, { useState } from 'react';
import { PipelineRow } from '@/types/pipeline';

type Product = { id: string; name: string };
type Marketer = { id: string; name: string; branch: string | null };

type PipelineTableProps = {
  filteredPipelines: PipelineRow[];
  filterProductId: string;
  setFilterProductId: (v: string) => void;
  filterPlan: string;
  setFilterPlan: (v: string) => void;
  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  products: Product[];
  marketers: Marketer[];

  exportExcel: () => void;

  loading: boolean;

  // Aksi dari tabel
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
};

type SortKey = 'product' | 'customer' | 'ape_idr' | 'plan' | 'quadrant' | null;

export default function PipelineTable({
  filteredPipelines,
  filterProductId,
  setFilterProductId,
  filterPlan,
  setFilterPlan,
  filterQuadrant,
  setFilterQuadrant,
  products,
  marketers,
  exportExcel,
  loading,
  openDetailModal,
  onEditRow,
  onDeleteRow,
  onCopyWARow,
}: PipelineTableProps) {
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

  //
  // SORTING STATE
  //
  const [sortBy, setSortBy] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      // toggle asc <-> desc
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortBy !== key) return null;
    return (
      <span className="text-[9px] text-slate-500">
        {sortDir === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  //
  // APPLY SORTING ke data yang sudah difilter
  //
  const sortedPipelines = (() => {
    const rows = [...filteredPipelines];

    if (!sortBy) return rows;

    return rows.sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';

      switch (sortBy) {
        case 'product':
          va = getProductName(a.product_id).toLowerCase();
          vb = getProductName(b.product_id).toLowerCase();
          break;
        case 'customer':
          va = (a.customer_name ?? '').toLowerCase();
          vb = (b.customer_name ?? '').toLowerCase();
          break;
        case 'ape_idr':
          va = a.ape_idr ?? 0;
          vb = b.ape_idr ?? 0;
          break;
        case 'plan':
          va = (a.execution_plan ?? '').toLowerCase();
          vb = (b.execution_plan ?? '').toLowerCase();
          break;
        case 'quadrant':
          va = (a.quadrant ?? '').toLowerCase();
          vb = (b.quadrant ?? '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      {/* Toolbar atas: filter + export */}
      <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
        {/* Kiri: filter */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-2 py-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>🔍</span>
              <span>Filter</span>
            </span>
            <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
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

            <span className="h-3 w-px bg-slate-200" />

            {/* Filter plan */}
            <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="all">Semua plan</option>
              <option value="week 1">week 1</option>
              <option value="week 2">week 2</option>
              <option value="week 3">week 3</option>
              <option value="week 4">week 4</option>
            </select>

            <span className="h-3 w-px bg-slate-200" />

            <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterQuadrant}
              onChange={(e) => setFilterQuadrant(e.target.value)}
            >
              <option value="all">Semua quadrant</option>
              <option value="k1">k1</option>
              <option value="k2">k2</option>
              <option value="k3">k3</option>
              <option value="k4">k4</option>
            </select>
          </div>
        </div>

        {/* Kanan: Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            <span>⬇️</span>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[11px] table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                {/* PRODUCT (sortable) */}
                <th className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleSort('product')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Produk</span>
                    {renderSortIcon('product')}
                  </button>
                </th>

                {/* CUSTOMER (sortable) */}
                <th className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleSort('customer')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Nasabah</span>
                    {renderSortIcon('customer')}
                  </button>
                </th>

                {/* MARKETER info (tidak disort dulu) */}
                <th className="px-3 py-2">
                  Marketer / Branch / Class
                </th>

                {/* APE (sortable by IDR) */}
                <th className="px-3 py-2 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('ape_idr')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>APE (IDR / USD)</span>
                    {renderSortIcon('ape_idr')}
                  </button>
                </th>

                {/* PLAN (sortable) */}
                <th className="px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('plan')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Plan / Tanggal</span>
                    {renderSortIcon('plan')}
                  </button>
                </th>

                {/* QUADRANT (sortable) */}
                <th className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleSort('quadrant')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Kdr</span>
                    {renderSortIcon('quadrant')}
                  </button>
                </th>

                {/* ACTION – sticky kanan, tidak di-sort */}
                <th className="px-3 py-2 text-center sticky right-0 bg-slate-50 z-10">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING STATE */}
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-4">
                    <div className="flex flex-col gap-2 animate-pulse">
                      <div className="h-3 w-40 bg-slate-100 rounded" />
                      <div className="h-3 w-64 bg-slate-100 rounded" />
                      <div className="h-3 w-52 bg-slate-100 rounded" />
                    </div>
                  </td>
                </tr>
              )}

              {/* DATA STATE */}
              {!loading &&
                sortedPipelines.map((row) => {
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
                            ? 'Rp ' +
                              row.ape_idr.toLocaleString('id-ID')
                            : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums">
                          {row.ape_usd
                            ? '$ ' +
                              row.ape_usd.toLocaleString('en-US')
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

              {/* EMPTY STATE */}
              {!loading && sortedPipelines.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-[11px] text-slate-500 py-6"
                  >
                    Belum ada data pipeline. Klik{' '}
                      <span className="font-semibold">Tambah pipeline</span> untuk
                      mulai mengisi.
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

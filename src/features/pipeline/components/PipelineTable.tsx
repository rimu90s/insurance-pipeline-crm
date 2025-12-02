'use client';

import { useMemo, useState } from 'react';
import type { PipelineRow } from '@/types/pipeline';

// Tipe sederhana untuk master data
type Product = { id: string; name: string };
type Marketer = { id: string; name: string };

interface PipelineTableProps {
  filteredPipelines: PipelineRow[];
  products: Product[];
  marketers: Marketer[];
  loading: boolean;

  filterProductId: string;
  setFilterProductId: (v: string) => void;

  filterPlan: string;
  setFilterPlan: (v: string) => void;

  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  filterMarketerId: string;
  setFilterMarketerId: (v: string) => void;

  filterPriority: string;
  setFilterPriority: (v: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  filterLeadSource: string;
  setFilterLeadSource: (v: string) => void;

  exportExcel: () => void;

  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;

  onResetFilters: () => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function getProductName(products: Product[], id: string) {
  const p = products.find((prod) => prod.id === id);
  return p ? p.name : '-';
}

function getMarketerName(marketers: Marketer[], id: string | null) {
  if (!id) return '-';
  const m = marketers.find((mk) => mk.id === id);
  return m ? m.name : '-';
}

function formatIdr(value: number | null | undefined) {
  if (!value) return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatUsd(value: number | null | undefined) {
  if (!value) return '$ 0';
  return `$ ${value.toLocaleString('en-US')}`;
}

export default function PipelineTable(props: PipelineTableProps) {
  const {
    filteredPipelines,
    products,
    marketers,
    loading,

    filterProductId,
    setFilterProductId,

    filterPlan,
    setFilterPlan,

    filterQuadrant,
    setFilterQuadrant,

    filterMarketerId,
    setFilterMarketerId,

    filterPriority,
    setFilterPriority,

    filterStatus,
    setFilterStatus,

    filterLeadSource,
    setFilterLeadSource,

    exportExcel,

    openDetailModal,
    onEditRow,
    onDeleteRow,
    onCopyWARow,

    onResetFilters,
  } = props;

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Reset halaman ke 1 setiap filter/search berubah
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const withPageReset =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const filteredBySearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredPipelines;

    return filteredPipelines.filter((row) => {
      const productName = getProductName(products, row.product_id).toLowerCase();
      const marketerName = getMarketerName(
        marketers,
        row.marketer_id ?? null
      ).toLowerCase();

      return (
        row.customer_name.toLowerCase().includes(q) ||
        (row.branch ?? '').toLowerCase().includes(q) ||
        productName.includes(q) ||
        marketerName.includes(q)
      );
    });
  }, [searchQuery, filteredPipelines, products, marketers]);

  const totalItems = filteredBySearch.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pagedPipelines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredBySearch.slice(start, end);
  }, [filteredBySearch, currentPage, pageSize]);

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-3">
      {/* FILTER + SEARCH BAR */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        {/* Row atas: judul + search + export */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-[11px] font-medium text-slate-600">
            Filter & segmentasi pipeline
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari nasabah, branch, marketer…"
                className="h-8 w-[220px] rounded-lg border border-slate-200 bg-white pl-7 pr-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-slate-400"
              />
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[11px] text-slate-400">
                🔍
              </span>
            </div>

            <button
              type="button"
              onClick={exportExcel}
              className="h-8 rounded-lg bg-slate-900 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Row bawah: grid filter */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {/* Produk */}
          <select
            value={filterProductId}
            onChange={(e) => withPageReset(setFilterProductId)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Semua produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Marketer */}
          <select
            value={filterMarketerId}
            onChange={(e) => withPageReset(setFilterMarketerId)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Semua marketer</option>
            {marketers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Plan */}
          <select
            value={filterPlan}
            onChange={(e) => withPageReset(setFilterPlan)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Plan: semua</option>
            <option value="week 1">Week 1</option>
            <option value="week 2">Week 2</option>
            <option value="week 3">Week 3</option>
            <option value="week 4">Week 4</option>
          </select>

          {/* Quadrant */}
          <select
            value={filterQuadrant}
            onChange={(e) => withPageReset(setFilterQuadrant)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Quadrant: semua</option>
            <option value="k1">K1</option>
            <option value="k2">K2</option>
            <option value="k3">K3</option>
            <option value="k4">K4</option>
          </select>

          {/* Prioritas */}
          <select
            value={filterPriority}
            onChange={(e) => withPageReset(setFilterPriority)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Prioritas: semua</option>
            <option value="priority">Prioritas</option>
            <option value="normal">Normal</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => withPageReset(setFilterStatus)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Status: semua</option>
            <option value="prospecting">Prospecting</option>
            <option value="followup">Follow up</option>
            <option value="won">Won / Deal</option>
            <option value="lost">Lost / Drop</option>
          </select>

          {/* Lead Source */}
          <select
            value={filterLeadSource}
            onChange={(e) => withPageReset(setFilterLeadSource)(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
          >
            <option value="">Source: semua</option>
            <option value="referral">Referral</option>
            <option value="direct">Direct</option>
            <option value="event">Event</option>
            <option value="online">Online</option>
            <option value="telemarketing">Telemarketing</option>
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              setSearchQuery('');
              setPage(1);
            }}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset filter
          </button>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Nasabah
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Produk
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Branch
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500">
                  APE (IDR)
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500">
                  APE (USD)
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Plan / Quadrant
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Marketer
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Status / Source
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500">
                  Prioritas
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-[11px] text-slate-500"
                  >
                    Memuat data pipeline…
                  </td>
                </tr>
              )}

              {!loading && pagedPipelines.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-[11px] text-slate-500"
                  >
                    Tidak ada data pipeline sesuai filter dan pencarian.
                  </td>
                </tr>
              )}

              {!loading &&
                pagedPipelines.map((row) => {
                  const productName = getProductName(products, row.product_id);
                  const marketerName = getMarketerName(
                    marketers,
                    row.marketer_id ?? null
                  );

                  const isPriority = !!row.priority_flag;

                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-t border-slate-100 bg-white hover:bg-slate-50"
                      onClick={() => openDetailModal(row)}
                    >
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-slate-900">
                            {row.customer_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {row.class ?? '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 align-middle text-[11px] text-slate-700">
                        {productName}
                      </td>

                      <td className="px-3 py-2 align-middle text-[11px] text-slate-700">
                        {row.branch ?? '-'}
                      </td>

                      <td className="px-3 py-2 align-middle text-right text-[11px] font-medium text-slate-900">
                        {formatIdr(row.ape_idr)}
                      </td>

                      <td className="px-3 py-2 align-middle text-right text-[11px] text-slate-700">
                        {formatUsd(row.ape_usd)}
                      </td>

                      <td className="px-3 py-2 align-middle text-[11px] text-slate-700">
                        {(row.execution_plan ?? 'Week 1')}{' '}
                        {row.quadrant ? `• ${row.quadrant.toUpperCase()}` : ''}
                      </td>

                      <td className="px-3 py-2 align-middle text-[11px] text-slate-700">
                        {marketerName}
                      </td>

                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-700">
                            {row.status ?? 'prospecting'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {row.lead_source ?? '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 align-middle">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isPriority
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {isPriority ? 'PRIORITAS' : 'Normal'}
                        </span>
                      </td>

                      <td
                        className="px-3 py-2 align-middle text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onCopyWARow(row)}
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                          >
                            WA
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditRow(row)}
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRow(row)}
                            className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-600 hover:bg-rose-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* FOOTER: pagination info */}
        <div className="flex flex-col items-start justify-between gap-2 border-t border-slate-100 px-3 py-2.5 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">
              {fromItem}-{toItem}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-slate-700">
              {totalItems}
            </span>{' '}
            pipeline
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <span className="px-1">
                Page{' '}
                <span className="font-semibold text-slate-700">
                  {currentPage}
                </span>{' '}
                / {pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(pageCount, p + 1))
                }
                disabled={currentPage >= pageCount}
                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

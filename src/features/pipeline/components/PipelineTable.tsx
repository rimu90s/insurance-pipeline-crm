'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { PipelineRow } from '@/types/pipeline';

// Tipe sederhana untuk dropdown
type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

type PipelineTableProps = {
  filteredPipelines: PipelineRow[];
  products: Product[];
  marketers: Marketer[];
  loading: boolean;

  // filters
  filterProductId: string;
  setFilterProductId: (value: string) => void;
  filterPlan: string;
  setFilterPlan: (value: string) => void;
  filterQuadrant: string;
  setFilterQuadrant: (value: string) => void;
  filterMarketerId: string;
  setFilterMarketerId: (value: string) => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterLeadSource: string;
  setFilterLeadSource: (value: string) => void;

  exportExcel: () => void;
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
  onResetFilters: () => void;
};

const pageSize = 25;

// ──────────────────────────────
// Helper format lokal
// ──────────────────────────────

const formatCurrencyIdr = (value: number) => {
  if (!value) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyUsd = (value: number) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const prettyPlan = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'week 1':
      return 'Week 1';
    case 'week 2':
      return 'Week 2';
    case 'week 3':
      return 'Week 3';
    case 'week 4':
      return 'Week 4';
    default:
      return plan || '-';
  }
};

const prettyQuadrant = (q: string) => {
  const key = q?.toLowerCase();
  if (!key) return '-';
  switch (key) {
    case 'k1':
      return 'K1';
    case 'k2':
      return 'K2';
    case 'k3':
      return 'K3';
    case 'k4':
      return 'K4';
    default:
      return q;
  }
};

const prettyPriority = (flag: boolean) => (flag ? 'Prioritas' : 'Normal');

const prettyStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'prospecting':
      return 'Prospecting';
    case 'proposal':
      return 'Proposal';
    case 'closing':
      return 'Closing';
    case 'lost':
      return 'Lost';
    default:
      return status || '-';
  }
};

const prettyLeadSource = (src: string) => {
  switch (src?.toLowerCase()) {
    case 'referral':
      return 'Referral';
    case 'walk-in':
      return 'Walk-in';
    case 'digital':
      return 'Digital';
    case 'event':
      return 'Event';
    case 'other':
      return 'Other';
    default:
      return src || '-';
  }
};

// ──────────────────────────────
// Komponen utama
// ──────────────────────────────

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

  // Search & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const searchedPipelines = useMemo(() => {
    if (!searchQuery.trim()) return filteredPipelines;

    const q = searchQuery.toLowerCase();

    return filteredPipelines.filter((row) => {
      return (
        (row.customer_name ?? '').toLowerCase().includes(q) ||
        (row.branch ?? '').toLowerCase().includes(q) ||
        (row.class ?? '').toLowerCase().includes(q) ||
        (row.remarks ?? '').toLowerCase().includes(q)
      );
    });
  }, [filteredPipelines, searchQuery]);

  const totalItems = searchedPipelines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedPipelines = searchedPipelines.slice(startIndex, endIndex);

  const getProductName = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    return p ? p.name : '-';
  };

  const getMarketerName = (marketerId: string | null) => {
    if (!marketerId) return '-';
    const m = marketers.find((mk) => mk.id === marketerId);
    return m ? m.name : '-';
  };

  const handleChangeProduct = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterProductId(e.target.value);
    setPage(1);
  };

  const handleChangePlan = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterPlan(e.target.value);
    setPage(1);
  };

  const handleChangeQuadrant = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterQuadrant(e.target.value);
    setPage(1);
  };

  const handleChangeMarketer = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterMarketerId(e.target.value);
    setPage(1);
  };

  const handleChangePriority = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterPriority(e.target.value);
    setPage(1);
  };

  const handleChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleChangeLeadSource = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterLeadSource(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    onResetFilters();
    setSearchQuery('');
    setPage(1);
  };

  const handleChangeSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 md:p-4 space-y-3">
      {/* Top controls: filter + search + export */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* Filter group */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterProductId}
            onChange={handleChangeProduct}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Semua produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterPlan}
            onChange={handleChangePlan}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Plan: semua</option>
            <option value="week 1">{prettyPlan('week 1')}</option>
            <option value="week 2">{prettyPlan('week 2')}</option>
            <option value="week 3">{prettyPlan('week 3')}</option>
            <option value="week 4">{prettyPlan('week 4')}</option>
          </select>

          <select
            value={filterQuadrant}
            onChange={handleChangeQuadrant}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Quadrant: semua</option>
            <option value="k1">{prettyQuadrant('k1')}</option>
            <option value="k2">{prettyQuadrant('k2')}</option>
            <option value="k3">{prettyQuadrant('k3')}</option>
            <option value="k4">{prettyQuadrant('k4')}</option>
          </select>

          <select
            value={filterMarketerId}
            onChange={handleChangeMarketer}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Semua marketer</option>
            {marketers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.branch ? ` (${m.branch})` : ''}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={handleChangePriority}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Prioritas: semua</option>
            <option value="prio">{prettyPriority(true)}</option>
            <option value="nonprio">{prettyPriority(false)}</option>
          </select>

          <select
            value={filterStatus}
            onChange={handleChangeStatus}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Status: semua</option>
            <option value="prospecting">
              {prettyStatus('prospecting')}
            </option>
            <option value="proposal">{prettyStatus('proposal')}</option>
            <option value="closing">{prettyStatus('closing')}</option>
            <option value="lost">{prettyStatus('lost')}</option>
          </select>

          <select
            value={filterLeadSource}
            onChange={handleChangeLeadSource}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">Source: semua</option>
            <option value="referral">
              {prettyLeadSource('referral')}
            </option>
            <option value="walk-in">
              {prettyLeadSource('walk-in')}
            </option>
            <option value="digital">
              {prettyLeadSource('digital')}
            </option>
            <option value="event">{prettyLeadSource('event')}</option>
            <option value="other">{prettyLeadSource('other')}</option>
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            Reset filter
          </button>
        </div>

        {/* Search + Export */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleChangeSearch(e.target.value)}
              placeholder="Cari nasabah, branch, catatan…"
              className="w-full sm:w-56 md:w-64 h-8 rounded-lg border border-slate-200 bg-white pl-3 pr-7 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[12px] text-slate-400">
              🔍
            </span>
          </div>

          <button
            type="button"
            onClick={exportExcel}
            disabled={loading || totalItems === 0}
            className="h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Table area */}
      <div className="mt-1 overflow-x-auto rounded-lg border border-slate-100">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">Nasabah</th>
              <th className="px-2 py-2 text-left font-semibold">Produk</th>
              <th className="px-2 py-2 text-left font-semibold hidden md:table-cell">
                Branch
              </th>
              <th className="px-2 py-2 text-left font-semibold">
                APE (IDR)
              </th>
              <th className="px-2 py-2 text-left font-semibold hidden lg:table-cell">
                APE (USD)
              </th>
              <th className="px-2 py-2 text-left font-semibold hidden sm:table-cell">
                Plan / Quadrant
              </th>
              <th className="px-2 py-2 text-left font-semibold hidden sm:table-cell">
                Marketer
              </th>
              <th className="px-2 py-2 text-left font-semibold hidden md:table-cell">
                Status / Source
              </th>
              <th className="px-2 py-2 text-left font-semibold hidden sm:table-cell">
                Prioritas
              </th>
              <th className="px-2 py-2 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  Memuat data pipeline…
                </td>
              </tr>
            )}

            {!loading && totalItems === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  Tidak ada data untuk filter & pencarian saat ini.
                </td>
              </tr>
            )}

            {!loading &&
              pagedPipelines.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Nasabah + info ringkas */}
                  <td
                    className="px-2 py-2 align-top cursor-pointer"
                    onClick={() => openDetailModal(row)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {row.customer_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {row.class || '-'}
                      </span>

                      {/* Info ringkas untuk mobile */}
                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 sm:hidden">
                        <span>{getProductName(row.product_id)}</span>
                        <span>• {row.branch || '-'}</span>
                        <span>• {prettyStatus(row.status ?? '')}</span>
                      </div>
                    </div>
                  </td>

                  {/* Produk */}
                  <td className="px-2 py-2 align-top hidden sm:table-cell">
                    <span className="text-slate-800">
                      {getProductName(row.product_id)}
                    </span>
                  </td>

                  {/* Branch */}
                  <td className="px-2 py-2 align-top hidden md:table-cell">
                    <span className="text-slate-800">
                      {row.branch || '-'}
                    </span>
                  </td>

                  {/* APE IDR */}
                  <td className="px-2 py-2 align-top">
                    <span className="font-medium">
                      {formatCurrencyIdr(row.ape_idr ?? 0)}
                    </span>
                  </td>

                  {/* APE USD */}
                  <td className="px-2 py-2 align-top hidden lg:table-cell">
                    <span className="font-medium">
                      {formatCurrencyUsd(row.ape_usd ?? 0)}
                    </span>
                  </td>

                  {/* Plan / Quadrant */}
                  <td className="px-2 py-2 align-top hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-800">
                        {prettyPlan(row.execution_plan ?? '')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {prettyQuadrant(row.quadrant ?? '')}
                      </span>
                    </div>
                  </td>

                  {/* Marketer */}
                  <td className="px-2 py-2 align-top hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-800">
                        {getMarketerName(row.marketer_id ?? null)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {row.pipeline_date || '-'}
                      </span>
                    </div>
                  </td>

                  {/* Status / Source */}
                  <td className="px-2 py-2 align-top hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-800">
                        {prettyStatus(row.status ?? '')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {prettyLeadSource(row.lead_source ?? '')}
                      </span>
                    </div>
                  </td>

                  {/* Prioritas */}
                  <td className="px-2 py-2 align-top hidden sm:table-cell">
                    {row.priority_flag ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        PRIORITAS
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        Normal
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-2 py-2 align-top text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onCopyWARow(row)}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                      >
                        WA
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditRow(row)}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRow(row)}
                        className="rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[10px] text-red-600 hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500">
        <div>
          {totalItems === 0 ? (
            <span>Gunakan tombol &quot;Tambah pipeline&quot; untuk mulai.</span>
          ) : (
            <span>
              Menampilkan{' '}
              <span className="font-medium">
                {startIndex + 1}
              </span>
              {'–'}
              <span className="font-medium">
                {Math.min(endIndex, totalItems)}
              </span>{' '}
              dari{' '}
              <span className="font-medium">{totalItems}</span> baris.
            </span>
          )}
        </div>

        {totalItems > 0 && (
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              ← Sebelumnya
            </button>
            <span>
              Halaman{' '}
              <span className="font-semibold">{page}</span> /{' '}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

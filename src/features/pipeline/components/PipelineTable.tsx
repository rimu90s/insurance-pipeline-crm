'use client';

import React from 'react';
import { PipelineRow } from '@/types/pipeline';

// Tipe lokal untuk data dropdown
type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

// Helper sederhana (tanpa bergantung utils lain)
const formatCurrencyIdr = (value?: number | null) => {
  if (!value || value <= 0) return '-';
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatCurrencyUsd = (value?: number | null) => {
  if (!value || value <= 0) return '$0';
  return `$ ${value.toLocaleString('en-US')}`;
};

const prettyPlan = (plan?: string | null) => {
  if (!plan) return '-';
  const lower = plan.toLowerCase();
  if (lower.startsWith('week 1')) return 'Week 1';
  if (lower.startsWith('week 2')) return 'Week 2';
  if (lower.startsWith('week 3')) return 'Week 3';
  if (lower.startsWith('week 4')) return 'Week 4';
  return plan;
};

const prettyQuadrant = (q?: string | null) => {
  if (!q) return '-';
  const lower = q.toLowerCase();
  if (lower === 'k1') return 'K1';
  if (lower === 'k2') return 'K2';
  if (lower === 'k3') return 'K3';
  if (lower === 'k4') return 'K4';
  return q.toUpperCase();
};

const statusBadgeClass = (status?: string | null) => {
  const s = (status || '').toLowerCase();
  if (!s || s === 'prospecting') {
    return 'bg-sky-50 text-sky-700 border-sky-100';
  }
  if (s.includes('follow')) {
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }
  if (s.includes('won') || s.includes('deal')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
  if (s.includes('lost') || s.includes('drop')) {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }
  return 'bg-slate-50 text-slate-700 border-slate-100';
};

const priorityBadge = (flag?: boolean | null) => {
  if (!flag) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-[2px] text-[10px] font-medium text-slate-600">
        Normal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-[2px] text-[10px] font-semibold text-amber-700">
      PRIORITAS
    </span>
  );
};

interface Props {
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

  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  openDetailModal: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;

  onResetFilters: () => void;
}

export default function PipelineTable({
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
  onEditRow,
  onDeleteRow,
  onCopyWARow,
  openDetailModal,

  onResetFilters,
}: Props) {
  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name || '-';

  const getMarketerName = (id: string | null) =>
    marketers.find((m) => m.id === id)?.name || '-';

  return (
    <div className="space-y-3">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Produk */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
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

        {/* Plan */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="all">Plan: semua</option>
          <option value="week 1">Week 1</option>
          <option value="week 2">Week 2</option>
          <option value="week 3">Week 3</option>
          <option value="week 4">Week 4</option>
        </select>

        {/* Quadrant */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterQuadrant}
          onChange={(e) => setFilterQuadrant(e.target.value)}
        >
          <option value="all">Quadrant: semua</option>
          <option value="k1">K1</option>
          <option value="k2">K2</option>
          <option value="k3">K3</option>
          <option value="k4">K4</option>
        </select>

        {/* Marketer */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterMarketerId}
          onChange={(e) => setFilterMarketerId(e.target.value)}
        >
          <option value="all">Semua marketer</option>
          {marketers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Prioritas: semua</option>
          <option value="prio">Prioritas saja</option>
          <option value="nonprio">Non-prioritas</option>
        </select>

        {/* Status */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Status: semua</option>
          <option value="prospecting">Prospecting</option>
          <option value="follow_up">Follow up</option>
          <option value="won">Won / Deal</option>
          <option value="lost">Lost / Drop</option>
        </select>

        {/* Lead source */}
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={filterLeadSource}
          onChange={(e) => setFilterLeadSource(e.target.value)}
        >
          <option value="all">Source: semua</option>
          <option value="referral">Referral</option>
          <option value="direct">Direct</option>
          <option value="event">Event</option>
          <option value="online">Online</option>
          <option value="telemarketing">Telemarketing</option>
        </select>

        <button
          onClick={onResetFilters}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
        >
          Reset filter
        </button>

        <button
          onClick={exportExcel}
          className="ml-auto flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="text-left">
              <th className="p-3 font-semibold text-slate-600">Nasabah</th>
              <th className="p-3 font-semibold text-slate-600">Produk</th>
              <th className="p-3 font-semibold text-slate-600">Branch</th>
              <th className="p-3 text-right font-semibold text-slate-600">
                APE (IDR)
              </th>
              <th className="p-3 text-right font-semibold text-slate-600">
                APE (USD)
              </th>
              <th className="p-3 font-semibold text-slate-600">
                Plan / Quadrant
              </th>
              <th className="p-3 font-semibold text-slate-600">Marketer</th>
              <th className="p-3 font-semibold text-slate-600">Status</th>
              <th className="p-3 font-semibold text-slate-600">Prioritas</th>
              <th className="p-3 text-right font-semibold text-slate-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={10}
                  className="p-4 text-center text-[11px] text-slate-400"
                >
                  Memuat data pipeline…
                </td>
              </tr>
            )}

            {!loading &&
              filteredPipelines.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  {/* Nasabah */}
                  <td className="p-3 text-slate-700">
                    <button
                      onClick={() => openDetailModal(row)}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {row.customer_name}
                    </button>
                    <div className="text-[10px] text-slate-400">
                      {row.class || '-'}
                    </div>
                  </td>

                  {/* Produk */}
                  <td className="p-3">{getProductName(row.product_id)}</td>

                  {/* Branch */}
                  <td className="p-3">{row.branch || '-'}</td>

                  {/* APE IDR */}
                  <td className="p-3 text-right font-medium">
                    {formatCurrencyIdr(row.ape_idr)}
                  </td>

                  {/* APE USD */}
                  <td className="p-3 text-right font-medium">
                    {formatCurrencyUsd(row.ape_usd)}
                  </td>

                  {/* Plan / Quadrant */}
                  <td className="p-3">
                    {prettyPlan(row.execution_plan)} /{' '}
                    {prettyQuadrant(row.quadrant)}
                  </td>

                  {/* Marketer */}
                  <td className="p-3">{getMarketerName(row.marketer_id)}</td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-medium ${statusBadgeClass(
                        row.status
                      )}`}
                    >
                      {row.status || 'Prospecting'}
                    </span>
                  </td>

                  {/* Prioritas */}
                  <td className="p-3">{priorityBadge(row.priority_flag)}</td>

                  {/* Action */}
                  <td className="space-x-2 p-3 text-right">
                    <button
                      onClick={() => onCopyWARow(row)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] hover:bg-slate-100"
                    >
                      WA
                    </button>
                    <button
                      onClick={() => onEditRow(row)}
                      className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[10px] text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRow(row)}
                      className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] text-rose-700 hover:bg-rose-100"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredPipelines.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="p-4 text-center text-slate-500 italic"
                >
                  Tidak ada data pipeline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

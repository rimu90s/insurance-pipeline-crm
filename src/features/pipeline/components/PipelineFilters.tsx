'use client';

import React from 'react';

type Product = { id: string; name: string };
type Marketer = { id: string; name: string; branch: string | null };

type PipelineFiltersProps = {
  products: Product[];
  marketers: Marketer[];

  filterProductId: string;
  setFilterProductId: (v: string) => void;

  filterPlan: string;
  setFilterPlan: (v: string) => void;

  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  filterMarketerId: string;
  setFilterMarketerId: (v: string) => void;

  filterPriority: string; // 'all' | 'prio' | 'nonprio'
  setFilterPriority: (v: string) => void;

  // ⚠️ pakai nama yang sekarang dipakai di PipelineTable
  filterStatus: string;
  setFilterStatus: (v: string) => void;

  filterLeadSource: string;
  setFilterLeadSource: (v: string) => void;

  onResetFilters: () => void;
  onResetSort: () => void;
  onExportExcel: () => void;
  onCopyWAFiltered: () => void;
};

export default function PipelineFilters({
  products,
  marketers,
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
  onResetFilters,
  onResetSort,
  onExportExcel,
  onCopyWAFiltered,
}: PipelineFiltersProps) {
  return (
    <div className="mb-4 space-y-3">
      {/* BARIS ATAS: judul filter + tombol aksi */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Kiri: label filter */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5">
          <span>🔍</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-medium text-slate-700">
              Filter data pipeline
            </span>
            <span className="text-[10px] text-slate-500">
              Sesuaikan produk, plan, marketer, status, sumber, dan prioritas.
            </span>
          </div>
        </div>

        {/* Kanan: tombol aksi global */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            ⟳ Reset filter
          </button>

          <button
            type="button"
            onClick={onResetSort}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            ⇅ Reset sort
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            ⬇️ Export Excel
          </button>

          <button
            type="button"
            onClick={onCopyWAFiltered}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            📲 Copy WA (filter)
          </button>
        </div>
      </div>

      {/* BARIS BAWAH: GRID FILTER */}
      <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Produk */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Produk
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
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
        </div>

        {/* Plan (week) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Plan (week)
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
          >
            <option value="all">Semua plan</option>
            <option value="week 1">week 1</option>
            <option value="week 2">week 2</option>
            <option value="week 3">week 3</option>
            <option value="week 4">week 4</option>
          </select>
        </div>

        {/* Quadrant */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Quadrant
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
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

        {/* Marketer */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Marketer
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
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
        </div>

        {/* Prioritas */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Prioritas
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Semua prioritas</option>
            <option value="prio">Prioritas saja</option>
            <option value="nonprio">Non-prioritas</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Status
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua status</option>
            <option value="prospecting">Prospecting</option>
            <option value="approach">Approach</option>
            <option value="presentation">Presentation</option>
            <option value="follow_up">Follow up</option>
            <option value="negotiation">Negotiation</option>
            <option value="closing">Closing</option>
            <option value="closed_lost">Closed lost</option>
          </select>
        </div>

        {/* Lead source */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-600">
            Sumber (leadsource)
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
            value={filterLeadSource}
            onChange={(e) => setFilterLeadSource(e.target.value)}
          >
            <option value="all">Semua sumber</option>
            <option value="referral">Referral</option>
            <option value="bank">Bank</option>
            <option value="digital_ads">Digital ads</option>
            <option value="walk_in">Walk-in</option>
            <option value="agent_referral">Agent referral</option>
            <option value="existing_customer">Existing customer</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// src/features/pipeline/components/pipelineTable/PipelineTableToolbar.tsx
'use client';

import React from 'react';
import type { ProductMaster, MarketerMaster } from '@/types/pipeline';
import { Chip, PresetButton } from './tableParts';
import type { PresetId } from './types';

type Props = {
  products: ProductMaster[];
  marketers: MarketerMaster[];

  // state
  search: string;
  onChangeSearch: (v: string) => void;

  // filters
  filterProductId: string;
  setFilterProductId: (v: string) => void;

  filterMarketerId: string;
  setFilterMarketerId: (v: string) => void;

  filterPlan: string;
  setFilterPlan: (v: string) => void;

  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  filterPriority: string;
  setFilterPriority: (v: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  filterLeadSource: string;
  setFilterLeadSource: (v: string) => void;

  // preset + chips
  activePreset: PresetId | null;
  onApplyPreset: (p: PresetId) => void;
  activeChips: Array<{ key: string; label: string; clear: () => void }>;
  onResetAll: () => void;

  // export
  onExportView: () => void;
  onExportRaw: () => void;

  totalRows: number;
};

export default function PipelineTableToolbar(props: Props) {
  const {
    products,
    marketers,
    search,
    onChangeSearch,

    filterProductId,
    setFilterProductId,
    filterMarketerId,
    setFilterMarketerId,
    filterPlan,
    setFilterPlan,
    filterQuadrant,
    setFilterQuadrant,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterLeadSource,
    setFilterLeadSource,

    activePreset,
    onApplyPreset,
    activeChips,
    onResetAll,

    onExportView,
    onExportRaw,
    totalRows,
  } = props;

  return (
    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-slate-600">Filter &amp; segmentasi pipeline</p>
          <p className="text-[10px] text-slate-500">
            <span className="font-medium text-slate-700">Export tampilan</span> mengikuti filter + search + sort.{' '}
            <span className="font-medium text-slate-700">Export raw</span> menggunakan export legacy (dari parent).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Cari nasabah, branch, marketer…"
              className="w-64 rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={onExportView}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
            title="Export tampilan (filter + search + sort)"
          >
            Export tampilan
          </button>

          <button
            type="button"
            onClick={onExportRaw}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            title="Export raw (versi legacy dari parent)"
          >
            Export raw
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium text-slate-600">Preset:</p>

          <PresetButton
            label="Hari ini · Semua"
            active={activePreset === 'today_all'}
            onClick={() => onApplyPreset('today_all')}
          />
          <PresetButton
            label="7 hari · Semua"
            active={activePreset === '7d_all'}
            onClick={() => onApplyPreset('7d_all')}
          />
          <PresetButton
            label="Hari ini · Prioritas"
            active={activePreset === 'today_priority'}
            onClick={() => onApplyPreset('today_priority')}
          />
          <PresetButton
            label="7 hari · Closing"
            active={activePreset === '7d_closing'}
            onClick={() => onApplyPreset('7d_closing')}
          />
          <PresetButton
            label="7 hari · Won"
            active={activePreset === '7d_won'}
            onClick={() => onApplyPreset('7d_won')}
          />
        </div>

        <button
          type="button"
          onClick={onResetAll}
          className="text-[11px] font-medium text-slate-600 underline-offset-2 hover:text-slate-800 hover:underline"
          title="Reset semua filter + search + sort"
        >
          Reset semua
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeChips.length === 0 ? (
          <p className="text-[11px] text-slate-500">Tidak ada filter aktif.</p>
        ) : (
          <>
            <p className="text-[11px] text-slate-500">Aktif:</p>
            {activeChips.map((c) => (
              <Chip key={c.key} label={c.label} onClear={c.clear} />
            ))}
          </>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-7">
        <select
          value={filterProductId}
          onChange={(e) => setFilterProductId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Semua produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filterMarketerId}
          onChange={(e) => setFilterMarketerId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Semua marketer</option>
          {marketers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Plan: semua</option>
          <option value="week 1">Week 1</option>
          <option value="week 2">Week 2</option>
          <option value="week 3">Week 3</option>
          <option value="week 4">Week 4</option>
        </select>

        <select
          value={filterQuadrant}
          onChange={(e) => setFilterQuadrant(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Quadrant: semua</option>
          <option value="k1">K1</option>
          <option value="k2">K2</option>
          <option value="k3">K3</option>
          <option value="k4">K4</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Prioritas: semua</option>
          <option value="priority">Prioritas</option>
          <option value="normal">Normal</option>
        </select>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="">Status: semua</option>
            <option value="prospecting">Prospecting</option>
            <option value="followup">Follow up</option>
            <option value="closing">Closing</option>
            <option value="won">Won / Deal</option>
            <option value="lost">Lost / Drop</option>
          </select>

          <select
            value={filterLeadSource}
            onChange={(e) => setFilterLeadSource(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="">Source: semua</option>
            <option value="referral">Referral</option>
            <option value="direct">Direct</option>
            <option value="event">Event</option>
            <option value="online">Online</option>
            <option value="telemarketing">Telemarketing</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onResetAll}
          className="text-[11px] text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
          Reset filter
        </button>

        <p className="text-[11px] text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{totalRows}</span> pipeline (sebelum pagination)
        </p>
      </div>
    </div>
  );
}

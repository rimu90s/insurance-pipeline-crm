'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PipelineRow, ProductMaster, MarketerMaster } from '@/types/pipeline';
import type { DatePreset } from '../hooks/usePipelineFilters';

interface PipelineTableProps {
  filteredPipelines: PipelineRow[];
  products: ProductMaster[];
  marketers: MarketerMaster[];
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

  // Dipakai hanya untuk empty-state CTA "lihat 7 hari terakhir"
  datePreset: DatePreset;
  setDatePreset: (v: DatePreset) => void;

  exportExcel: () => void;
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
  onResetFilters: () => void;

  // highlight row realtime
  recentIds?: Record<string, number>;
}

const PAGE_SIZE = 10;

const formatCurrencyIdr = (value: number | null) => {
  if (!value) return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatCurrencyUsd = (value: number | null) => {
  if (!value) return '$ 0';
  return `$ ${value.toLocaleString('en-US')}`;
};

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700 shadow-sm">
      <span className="max-w-[240px] truncate">{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[12px] leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Hapus filter: ${label}`}
        title="Hapus filter"
      >
        ×
      </button>
    </span>
  );
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

    datePreset,
    setDatePreset,

    exportExcel,
    openDetailModal,
    onEditRow,
    onDeleteRow,
    onCopyWARow,
    onResetFilters,

    recentIds,
  } = props;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  // Step 5: close menu on scroll container
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // Step 4 + Step 5: Close menu on outside click + Esc + scroll + resize
  useEffect(() => {
    if (!openMenuId) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const insideMenuRoot = target.closest('[data-action-menu-root="pipeline"]');
      if (insideMenuRoot) return;

      setOpenMenuId(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };

    const onScrollAny = () => {
      setOpenMenuId(null);
    };

    const onResize = () => {
      setOpenMenuId(null);
    };

    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);

    // close ketika window scroll (misal user scroll page)
    window.addEventListener('scroll', onScrollAny, true);

    // close ketika resize
    window.addEventListener('resize', onResize);

    // close ketika scroll container tabel (horizontal/vertical)
    const el = tableScrollRef.current;
    if (el) el.addEventListener('scroll', onScrollAny, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);

      window.removeEventListener('scroll', onScrollAny, true);
      window.removeEventListener('resize', onResize);

      if (el) el.removeEventListener('scroll', onScrollAny);
    };
  }, [openMenuId]);

  // maps biar tidak find() terus menerus
  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => {
      if (p?.id) map[p.id] = p.name ?? '';
    });
    return map;
  }, [products]);

  const marketerMap = useMemo(() => {
    const map: Record<string, string> = {};
    marketers.forEach((m) => {
      if (m?.id) map[m.id] = m.name ?? '';
    });
    return map;
  }, [marketers]);

  const getProductName = (id: string) => productMap[id] ?? '-';

  const getMarketerName = (id: string | null) => {
    if (!id) return '-';
    return marketerMap[id] ?? '-';
  };

  const rowsAfterSearch = (() => {
    if (!search.trim()) return filteredPipelines;

    const q = search.toLowerCase();

    return filteredPipelines.filter((row) => {
      const productName = getProductName(row.product_id).toLowerCase();
      const marketerName = getMarketerName(row.marketer_id).toLowerCase();
      const customer = row.customer_name.toLowerCase();
      const branch = (row.branch ?? '').toLowerCase();

      return productName.includes(q) || marketerName.includes(q) || customer.includes(q) || branch.includes(q);
    });
  })();

  const totalRows = rowsAfterSearch.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rowsAfterSearch.slice(start, start + PAGE_SIZE);
  }, [rowsAfterSearch, currentPage]);

  const handleChangePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setOpenMenuId(null);
  };

  // Active filter chips (tanpa ubah logic filter)
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];

    if (filterProductId) {
      const name = productMap[filterProductId];
      chips.push({
        key: 'product',
        label: `Produk: ${name || filterProductId}`,
        clear: () => {
          setFilterProductId('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterMarketerId) {
      const name = marketerMap[filterMarketerId];
      chips.push({
        key: 'marketer',
        label: `Marketer: ${name || filterMarketerId}`,
        clear: () => {
          setFilterMarketerId('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterPlan) {
      chips.push({
        key: 'plan',
        label: `Plan: ${filterPlan}`,
        clear: () => {
          setFilterPlan('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterQuadrant) {
      chips.push({
        key: 'quadrant',
        label: `Quadrant: ${filterQuadrant.toUpperCase()}`,
        clear: () => {
          setFilterQuadrant('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterPriority) {
      const nice =
        filterPriority === 'priority' ? 'Prioritas' : filterPriority === 'normal' ? 'Normal' : filterPriority;

      chips.push({
        key: 'priority',
        label: `Prioritas: ${nice}`,
        clear: () => {
          setFilterPriority('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterStatus) {
      chips.push({
        key: 'status',
        label: `Status: ${filterStatus}`,
        clear: () => {
          setFilterStatus('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (filterLeadSource) {
      chips.push({
        key: 'source',
        label: `Source: ${filterLeadSource}`,
        clear: () => {
          setFilterLeadSource('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    if (search.trim()) {
      const q = search.trim();
      chips.push({
        key: 'search',
        label: `Search: ${q.length > 30 ? `${q.slice(0, 30)}…` : q}`,
        clear: () => {
          setSearch('');
          setPage(1);
          setOpenMenuId(null);
        },
      });
    }

    return chips;
  }, [
    filterProductId,
    filterMarketerId,
    filterPlan,
    filterQuadrant,
    filterPriority,
    filterStatus,
    filterLeadSource,
    search,
    productMap,
    marketerMap,
    setFilterProductId,
    setFilterMarketerId,
    setFilterPlan,
    setFilterQuadrant,
    setFilterPriority,
    setFilterStatus,
    setFilterLeadSource,
  ]);

  const confirmDelete = (row: PipelineRow) => {
    const marketer = getMarketerName(row.marketer_id);
    const product = getProductName(row.product_id);

    const ok = window.confirm(
      `Hapus pipeline ini?\n\nNasabah: ${row.customer_name}\nProduk: ${product}\nMarketer: ${marketer}\n\nAksi ini tidak bisa dibatalkan.`
    );

    if (!ok) return;

    onDeleteRow(row);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-slate-600">Filter &amp; segmentasi pipeline</p>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  setOpenMenuId(null);
                }}
                placeholder="Cari nasabah, branch, marketer…"
                className="w-64 rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={exportExcel}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.length === 0 ? (
            <p className="text-[11px] text-slate-500">Tidak ada filter aktif.</p>
          ) : (
            <>
              <p className="text-[11px] text-slate-500">Filter aktif:</p>
              {activeChips.map((c) => (
                <Chip key={c.key} label={c.label} onClear={c.clear} />
              ))}
            </>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-7">
          <select
            value={filterProductId}
            onChange={(e) => {
              setFilterProductId(e.target.value);
              setPage(1);
              setOpenMenuId(null);
            }}
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
            onChange={(e) => {
              setFilterMarketerId(e.target.value);
              setPage(1);
              setOpenMenuId(null);
            }}
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
            onChange={(e) => {
              setFilterPlan(e.target.value);
              setPage(1);
              setOpenMenuId(null);
            }}
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
            onChange={(e) => {
              setFilterQuadrant(e.target.value);
              setPage(1);
              setOpenMenuId(null);
            }}
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
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setPage(1);
              setOpenMenuId(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="">Prioritas: semua</option>
            <option value="priority">Prioritas</option>
            <option value="normal">Normal</option>
          </select>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
                setOpenMenuId(null);
              }}
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
              onChange={(e) => {
                setFilterLeadSource(e.target.value);
                setPage(1);
                setOpenMenuId(null);
              }}
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
            onClick={() => {
              onResetFilters();
              setSearch('');
              setPage(1);
              setOpenMenuId(null);
            }}
            className="text-[11px] text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            Reset filter
          </button>

          <p className="text-[11px] text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{totalRows}</span> pipeline (sebelum pagination)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto" ref={tableScrollRef}>
        <table className="min-w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 min-w-[230px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Nasabah
              </th>

              <th
                scope="col"
                className="min-w-[200px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Produk
              </th>

              <th
                scope="col"
                className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Branch
              </th>

              <th
                scope="col"
                className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                APE (IDR)
              </th>

              <th
                scope="col"
                className="min-w-[110px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                APE (USD)
              </th>

              <th
                scope="col"
                className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Plan / Quadrant
              </th>

              <th
                scope="col"
                className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Marketer
              </th>

              <th
                scope="col"
                className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Status / Source
              </th>

              <th
                scope="col"
                className="min-w-[110px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Prioritas
              </th>

              <th
                scope="col"
                className="sticky right-0 z-20 min-w-[70px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="border-b border-slate-100 px-3 py-6 text-center text-[11px] text-slate-500">
                  Memuat data pipeline…
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="border-b border-slate-100 px-3 py-6 text-center text-[11px] text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[11px] text-slate-500">
                      {datePreset === 'today'
                        ? 'Belum ada pipeline untuk hari ini.'
                        : 'Tidak ada data pipeline yang cocok dengan filter.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDatePreset('7d')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Lihat 7 hari terakhir
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onResetFilters();
                          setOpenMenuId(null);
                        }}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
                      >
                        Reset semua filter
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const productName = getProductName(row.product_id);
                const marketerName = getMarketerName(row.marketer_id);
                const isPrioritas = !!row.priority_flag;

                const isRecent = !!recentIds?.[row.id];

                return (
                  <tr
                    key={row.id}
                    className={
                      'border-b border-slate-100 text-xs transition-colors hover:bg-slate-50 ' +
                      (isRecent ? 'bg-amber-50/80 animate-pulse-once' : '')
                    }
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 align-top">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold text-slate-900">{row.customer_name}</span>
                        <span className="text-[11px] text-slate-500">{row.class ? `Segment ${row.class}` : '—'}</span>
                      </div>
                    </td>

                    <td className="min-w-[200px] px-3 py-2 align-top">
                      <p className="text-[12px] text-slate-900">{productName}</p>
                    </td>

                    <td className="px-3 py-2 align-top text-[11px] text-slate-700">{row.branch ?? '—'}</td>

                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-slate-900">
                      {formatCurrencyIdr(row.ape_idr ?? 0)}
                    </td>

                    <td className="px-3 py-2 align-top text-right text-[11px] text-slate-700">
                      {formatCurrencyUsd(row.ape_usd ?? 0)}
                    </td>

                    <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                      <span className="font-medium">{row.execution_plan ?? 'Week 1'}</span> •{' '}
                      <span className="uppercase">{row.quadrant ?? 'k1'}</span>
                    </td>

                    <td className="px-3 py-2 align-top text-[11px] text-slate-700">{marketerName}</td>

                    <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-medium capitalize text-slate-800">{row.status ?? 'prospecting'}</span>
                        <span className="text-slate-500 capitalize">{row.lead_source ?? '—'}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={
                          isPrioritas
                            ? 'inline-flex items-center rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-0.5 text-[11px] font-medium text-amber-700'
                            : 'inline-flex items-center rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-0.5 text-[11px] font-medium text-slate-600'
                        }
                      >
                        {isPrioritas ? 'PRIORITAS' : 'Normal'}
                      </span>
                    </td>

                    <td className="sticky right-0 z-10 bg-white/95 px-3 py-2 text-right align-top backdrop-blur">
                      <div className="relative inline-flex" data-action-menu-root="pipeline">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/70 bg-white text-[14px] leading-none text-slate-500 shadow-sm hover:bg-slate-50"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === row.id}
                        >
                          ⋮
                        </button>

                        {openMenuId === row.id && (
                          <div
                            className="absolute right-0 top-8 z-30 w-40 rounded-xl border border-slate-200 bg-white py-1 text-left text-[11px] shadow-lg"
                            role="menu"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                openDetailModal(row);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                              role="menuitem"
                            >
                              Lihat detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEditRow(row);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                              role="menuitem"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onCopyWARow(row);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                              role="menuitem"
                            >
                              Copy WA
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                confirmDelete(row);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50"
                              role="menuitem"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
        <p>
          Halaman <span className="font-semibold text-slate-800">{currentPage}</span> dari{' '}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

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

  datePreset: DatePreset;
  setDatePreset: (v: DatePreset) => void;

  exportExcel: () => void;
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
  onResetFilters: () => void;

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

type MenuPlacement = 'down-right' | 'up-right' | 'down-left' | 'up-left';

function getMenuPlacement(anchorRect: DOMRect, menuWidth = 160, menuHeight = 160): MenuPlacement {
  const margin = 12;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const spaceBelow = viewportH - anchorRect.bottom;
  const spaceAbove = anchorRect.top;

  const openUp = spaceBelow < menuHeight + margin && spaceAbove >= menuHeight + margin;

  const wouldOverflowRight = anchorRect.left + menuWidth > viewportW - margin;
  const openLeft = wouldOverflowRight;

  if (openUp && openLeft) return 'up-left';
  if (openUp && !openLeft) return 'up-right';
  if (!openUp && openLeft) return 'down-left';
  return 'down-right';
}

type SortKey = 'customer' | 'product' | 'ape_idr' | 'ape_usd' | 'marketer';
type SortDir = 'asc' | 'desc';

function SortTh({
  label,
  active,
  dir,
  onClick,
  className,
  align = 'left',
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className: string;
  align?: 'left' | 'right';
}) {
  return (
    <th scope="col" className={className}>
      <button
        type="button"
        onClick={onClick}
        className={[
          'group inline-flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-wide',
          align === 'right' ? 'justify-end' : 'justify-start',
        ].join(' ')}
        title="Klik untuk urutkan"
      >
        <span>{label}</span>
        <span
          className={[
            'text-[10px] leading-none',
            active ? 'text-slate-700' : 'text-slate-300 group-hover:text-slate-500',
          ].join(' ')}
          aria-hidden="true"
        >
          {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

type PresetId = 'today_all' | '7d_all' | 'today_priority' | '7d_closing' | '7d_won';

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors',
        active
          ? 'border-slate-300 bg-white text-slate-800'
          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-800',
      ].join(' ')}
    >
      {label}
    </button>
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

  // Step 8: sort state
  const [sortKey, setSortKey] = useState<SortKey>('customer');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const setSort = (key: SortKey) => {
    setPage(1);
    setOpenMenuId(null);

    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDir('asc');
      return key;
    });
  };

  // Step 5: close menu on scroll container
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // Step 6: adaptive placement + keep refs to trigger buttons
  const actionBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [menuPlacement, setMenuPlacement] = useState<MenuPlacement>('down-right');

  // Step 7: focus management
  const lastOpenedTriggerIdRef = useRef<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const computePlacementForOpenMenu = () => {
    if (!openMenuId) return;

    const btn = actionBtnRefs.current[String(openMenuId)];
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    setMenuPlacement(getMenuPlacement(rect, 160, 160));
  };

  const focusFirstMenuItem = () => {
    const menu = menuContainerRef.current;
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'));
    if (items.length === 0) return;
    items[0].focus();
  };

  const restoreFocusToLastTrigger = () => {
    const id = lastOpenedTriggerIdRef.current;
    if (!id) return;
    const btn = actionBtnRefs.current[id];
    if (btn) btn.focus();
    lastOpenedTriggerIdRef.current = null;
  };

  useEffect(() => {
    if (!openMenuId) {
      restoreFocusToLastTrigger();
      return;
    }

    computePlacementForOpenMenu();
    window.setTimeout(() => focusFirstMenuItem(), 0);

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
      computePlacementForOpenMenu();
    };

    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);

    window.addEventListener('scroll', onScrollAny, true);
    window.addEventListener('resize', onResize);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMenuId]);

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

  // Step 9: preset helpers (1 click)
  const applyPreset = (preset: PresetId) => {
    // always reset UX states
    setSearch('');
    setPage(1);
    setOpenMenuId(null);

    // reset “non-date” filters first (safe & predictable)
    setFilterProductId('');
    setFilterMarketerId('');
    setFilterPlan('');
    setFilterQuadrant('');
    setFilterStatus('');
    setFilterLeadSource('');
    setFilterPriority('');

    // keep sort as-is (biar user preference), tapi kalau mau dipaksa default:
    // setSortKey('customer'); setSortDir('asc');

    if (preset === 'today_all') {
      setDatePreset('today');
      return;
    }

    if (preset === '7d_all') {
      setDatePreset('7d');
      return;
    }

    if (preset === 'today_priority') {
      setDatePreset('today');
      setFilterPriority('priority');
      return;
    }

    if (preset === '7d_closing') {
      setDatePreset('7d');
      setFilterStatus('closing');
      return;
    }

    // 7d_won
    setDatePreset('7d');
    setFilterStatus('won');
  };

  // highlight which preset is “currently matching”
  const activePreset: PresetId | null = useMemo(() => {
    const noOtherFilters =
      !filterProductId &&
      !filterMarketerId &&
      !filterPlan &&
      !filterQuadrant &&
      !filterLeadSource;

    if (datePreset === 'today' && noOtherFilters && !filterStatus && !filterPriority) return 'today_all';
    if (datePreset === '7d' && noOtherFilters && !filterStatus && !filterPriority) return '7d_all';

    if (datePreset === 'today' && noOtherFilters && !filterStatus && filterPriority === 'priority') return 'today_priority';
    if (datePreset === '7d' && noOtherFilters && filterStatus === 'closing' && !filterPriority) return '7d_closing';
    if (datePreset === '7d' && noOtherFilters && filterStatus === 'won' && !filterPriority) return '7d_won';

    return null;
  }, [
    datePreset,
    filterProductId,
    filterMarketerId,
    filterPlan,
    filterQuadrant,
    filterLeadSource,
    filterStatus,
    filterPriority,
  ]);

  const rowsAfterSearch = useMemo(() => {
    if (!search.trim()) return filteredPipelines;

    const q = search.toLowerCase();

    return filteredPipelines.filter((row) => {
      const productName = getProductName(row.product_id).toLowerCase();
      const marketerName = getMarketerName(row.marketer_id).toLowerCase();
      const customer = row.customer_name.toLowerCase();
      const branch = (row.branch ?? '').toLowerCase();

      return productName.includes(q) || marketerName.includes(q) || customer.includes(q) || branch.includes(q);
    });
  }, [filteredPipelines, search, productMap, marketerMap]);

  const sortedRows = useMemo(() => {
    const withIndex = rowsAfterSearch.map((r, idx) => ({ r, idx }));

    const getValue = (row: PipelineRow): string | number => {
      if (sortKey === 'customer') return (row.customer_name ?? '').toLowerCase();
      if (sortKey === 'product') return getProductName(row.product_id).toLowerCase();
      if (sortKey === 'marketer') return getMarketerName(row.marketer_id).toLowerCase();
      if (sortKey === 'ape_idr') return row.ape_idr ?? 0;
      return row.ape_usd ?? 0;
    };

    withIndex.sort((a, b) => {
      const va = getValue(a.r);
      const vb = getValue(b.r);

      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), 'id');
      }

      if (cmp === 0) return a.idx - b.idx; // stable
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return withIndex.map((x) => x.r);
  }, [rowsAfterSearch, sortKey, sortDir, productMap, marketerMap]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, currentPage]);

  const handleChangePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setOpenMenuId(null);
  };

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

    chips.push({
      key: 'sort',
      label: `Sort: ${sortKey.toUpperCase()} (${sortDir.toUpperCase()})`,
      clear: () => {
        setSortKey('customer');
        setSortDir('asc');
        setPage(1);
        setOpenMenuId(null);
      },
    });

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
    sortKey,
    sortDir,
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

  const menuPositionClass =
    menuPlacement === 'down-right'
      ? 'right-0 top-8'
      : menuPlacement === 'up-right'
        ? 'right-0 bottom-8'
        : menuPlacement === 'down-left'
          ? 'left-0 top-8'
          : 'left-0 bottom-8';

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menu = menuContainerRef.current;
    if (!menu) return;

    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'));
    if (items.length === 0) return;

    const active = document.activeElement as HTMLButtonElement | null;
    const idx = active ? items.indexOf(active) : -1;

    const focusAt = (nextIndex: number) => {
      const safe = Math.max(0, Math.min(items.length - 1, nextIndex));
      items[safe]?.focus();
    };

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusAt(idx >= 0 ? idx + 1 : 0);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusAt(idx >= 0 ? idx - 1 : items.length - 1);
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      focusAt(0);
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      focusAt(items.length - 1);
      return;
    }

    if (e.key === 'Tab') {
      const first = items[0];
      const last = items[items.length - 1];
      if (!active) return;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
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

        {/* Step 9: Preset views */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium text-slate-600">Preset:</p>

            <PresetButton
              label="Hari ini · Semua"
              active={activePreset === 'today_all'}
              onClick={() => applyPreset('today_all')}
            />
            <PresetButton
              label="7 hari · Semua"
              active={activePreset === '7d_all'}
              onClick={() => applyPreset('7d_all')}
            />
            <PresetButton
              label="Hari ini · Prioritas"
              active={activePreset === 'today_priority'}
              onClick={() => applyPreset('today_priority')}
            />
            <PresetButton
              label="7 hari · Closing"
              active={activePreset === '7d_closing'}
              onClick={() => applyPreset('7d_closing')}
            />
            <PresetButton
              label="7 hari · Won"
              active={activePreset === '7d_won'}
              onClick={() => applyPreset('7d_won')}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onResetFilters();
              setSearch('');
              setPage(1);
              setOpenMenuId(null);
            }}
            className="text-[11px] font-medium text-slate-600 underline-offset-2 hover:text-slate-800 hover:underline"
            title="Reset semua filter"
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
              <SortTh
                label="Nasabah"
                active={sortKey === 'customer'}
                dir={sortDir}
                onClick={() => setSort('customer')}
                className="sticky left-0 z-20 min-w-[230px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
                align="left"
              />

              <SortTh
                label="Produk"
                active={sortKey === 'product'}
                dir={sortDir}
                onClick={() => setSort('product')}
                className="min-w-[200px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
                align="left"
              />

              <th
                scope="col"
                className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Branch
              </th>

              <SortTh
                label="APE (IDR)"
                active={sortKey === 'ape_idr'}
                dir={sortDir}
                onClick={() => setSort('ape_idr')}
                className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-600"
                align="right"
              />

              <SortTh
                label="APE (USD)"
                active={sortKey === 'ape_usd'}
                dir={sortDir}
                onClick={() => setSort('ape_usd')}
                className="min-w-[110px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-600"
                align="right"
              />

              <th
                scope="col"
                className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              >
                Plan / Quadrant
              </th>

              <SortTh
                label="Marketer"
                active={sortKey === 'marketer'}
                dir={sortDir}
                onClick={() => setSort('marketer')}
                className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
                align="left"
              />

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
                          ref={(el) => {
                            actionBtnRefs.current[String(row.id)] = el;
                          }}
                          onClick={() => {
                            lastOpenedTriggerIdRef.current = String(row.id);
                            setOpenMenuId((prev) => (prev === row.id ? null : row.id));
                            window.setTimeout(() => computePlacementForOpenMenu(), 0);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/70 bg-white text-[14px] leading-none text-slate-500 shadow-sm hover:bg-slate-50"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === row.id}
                        >
                          ⋮
                        </button>

                        {openMenuId === row.id && (
                          <div
                            ref={menuContainerRef}
                            className={[
                              'absolute z-30 w-40 rounded-xl border border-slate-200 bg-white py-1 text-left text-[11px] shadow-lg',
                              menuPositionClass,
                            ].join(' ')}
                            role="menu"
                            tabIndex={-1}
                            onKeyDown={handleMenuKeyDown}
                            aria-label="Menu aksi pipeline"
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

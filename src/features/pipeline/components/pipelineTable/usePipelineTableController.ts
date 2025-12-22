// src/features/pipeline/components/pipelineTable/usePipelineTableController.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PipelineRow, ProductMaster, MarketerMaster } from '@/types/pipeline';
import type { DatePreset } from '../../hooks/usePipelineFilters';

import type { MenuPlacement, PresetId, SortDir, SortKey } from './types';
import { getMenuPlacement } from './menuPlacement';
import { PAGE_SIZE } from './tableUtils';

type Args = {
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

  onResetFilters: () => void;

  recentIds?: Record<string, number>;
};

export function usePipelineTableController(args: Args) {
  const {
    filteredPipelines,
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

    datePreset,
    setDatePreset,

    onResetFilters,
  } = args;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // action menu state
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const actionBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [menuPlacement, setMenuPlacement] = useState<MenuPlacement>('down-right');
  const lastOpenedTriggerIdRef = useRef<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>('customer');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

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

  const getProductName = useCallback((id: string) => productMap[id] ?? '-', [productMap]);

  const getMarketerName = useCallback(
    (id: string | null) => (id ? marketerMap[id] ?? '-' : '-'),
    [marketerMap]
  );

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

  const computePlacementForOpenMenu = useCallback(() => {
    if (!openMenuId) return;

    const btn = actionBtnRefs.current[String(openMenuId)];
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    setMenuPlacement(getMenuPlacement(rect, 160, 160));
  }, [openMenuId]);

  const focusFirstMenuItem = useCallback(() => {
    const menu = menuContainerRef.current;
    if (!menu) return;

    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'));
    if (items.length === 0) return;

    items[0].focus();
  }, []);

  const restoreFocusToLastTrigger = useCallback(() => {
    const id = lastOpenedTriggerIdRef.current;
    if (!id) return;

    const btn = actionBtnRefs.current[id];
    if (btn) btn.focus();

    lastOpenedTriggerIdRef.current = null;
  }, []);

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

    const onScrollAny = () => setOpenMenuId(null);
    const onResize = () => computePlacementForOpenMenu();

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
  }, [openMenuId, computePlacementForOpenMenu, focusFirstMenuItem, restoreFocusToLastTrigger]);

  const rowsAfterSearch = useMemo(() => {
    if (!search.trim()) return filteredPipelines;

    const q = search.toLowerCase();

    return filteredPipelines.filter((row) => {
      const productName = getProductName(row.product_id).toLowerCase();
      const marketerName = getMarketerName(row.marketer_id).toLowerCase();
      const customer = (row.customer_name ?? '').toLowerCase();
      const branch = (row.branch ?? '').toLowerCase();

      return productName.includes(q) || marketerName.includes(q) || customer.includes(q) || branch.includes(q);
    });
  }, [filteredPipelines, search, getProductName, getMarketerName]);

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

      if (cmp === 0) return a.idx - b.idx;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return withIndex.map((x) => x.r);
  }, [rowsAfterSearch, sortKey, sortDir, getProductName, getMarketerName]);

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

  /**
   * IMPORTANT:
   * Sumber reset filter utama ada di parent (usePipelineFilters).
   * Di controller, kita hanya "meminta" reset itu via onResetFilters(),
   * lalu apply preset/extra-filter yang relevan.
   */
  const applyPreset = (preset: PresetId) => {
    // reset UI local
    setSearch('');
    setPage(1);
    setOpenMenuId(null);

    // reset filter parent (ini yang paling aman, biar tidak miss)
    onResetFilters();

    // apply preset
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

    // default fallback: 7d_won
    setDatePreset('7d');
    setFilterStatus('won');
  };

  const activePreset: PresetId | null = useMemo(() => {
    // Agar preset terbaca benar, "noOtherFilters" harus include status+priority juga
    const noOtherFilters =
      !filterProductId &&
      !filterMarketerId &&
      !filterPlan &&
      !filterQuadrant &&
      !filterLeadSource &&
      !filterStatus &&
      !filterPriority;

    if (datePreset === 'today' && noOtherFilters) return 'today_all';
    if (datePreset === '7d' && noOtherFilters) return '7d_all';

    // varian preset yang boleh punya status/priority tertentu
    const baseFiltersOnly =
      !filterProductId && !filterMarketerId && !filterPlan && !filterQuadrant && !filterLeadSource;

    if (datePreset === 'today' && baseFiltersOnly && !filterStatus && filterPriority === 'priority') return 'today_priority';
    if (datePreset === '7d' && baseFiltersOnly && filterStatus === 'closing' && !filterPriority) return '7d_closing';
    if (datePreset === '7d' && baseFiltersOnly && filterStatus === 'won' && !filterPriority) return '7d_won';

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

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];

    const clearBase = () => {
      setPage(1);
      setOpenMenuId(null);
    };

    if (filterProductId) {
      const name = productMap[filterProductId];
      chips.push({
        key: 'product',
        label: `Produk: ${name || filterProductId}`,
        clear: () => {
          setFilterProductId('');
          clearBase();
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
          clearBase();
        },
      });
    }

    if (filterPlan) {
      chips.push({
        key: 'plan',
        label: `Plan: ${filterPlan}`,
        clear: () => {
          setFilterPlan('');
          clearBase();
        },
      });
    }

    if (filterQuadrant) {
      chips.push({
        key: 'quadrant',
        label: `Quadrant: ${filterQuadrant.toUpperCase()}`,
        clear: () => {
          setFilterQuadrant('');
          clearBase();
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
          clearBase();
        },
      });
    }

    if (filterStatus) {
      chips.push({
        key: 'status',
        label: `Status: ${filterStatus}`,
        clear: () => {
          setFilterStatus('');
          clearBase();
        },
      });
    }

    if (filterLeadSource) {
      chips.push({
        key: 'source',
        label: `Source: ${filterLeadSource}`,
        clear: () => {
          setFilterLeadSource('');
          clearBase();
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
          clearBase();
        },
      });
    }

    chips.push({
      key: 'sort',
      label: `Sort: ${sortKey.toUpperCase()} (${sortDir.toUpperCase()})`,
      clear: () => {
        setSortKey('customer');
        setSortDir('asc');
        clearBase();
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

  const resetAll = () => {
    onResetFilters();
    setSearch('');
    setSortKey('customer');
    setSortDir('asc');
    setPage(1);
    setOpenMenuId(null);
  };

  const menuPositionClass =
    menuPlacement === 'down-right'
      ? 'right-0 top-8'
      : menuPlacement === 'up-right'
        ? 'right-0 bottom-8'
        : menuPlacement === 'down-left'
          ? 'left-0 top-8'
          : 'left-0 bottom-8';

  return {
    // maps + helpers
    productMap,
    marketerMap,
    getProductName,
    getMarketerName,

    // list
    sortedRows,
    pagedRows,
    totalRows,
    totalPages,
    currentPage,

    // search/page
    search,
    setSearch,
    page,
    setPage,
    handleChangePage,

    // sorting
    sortKey,
    sortDir,
    setSort,

    // presets + chips
    applyPreset,
    activePreset,
    activeChips,
    resetAll,

    // menu wiring
    openMenuId,
    setOpenMenuId,
    actionBtnRefs,
    lastOpenedTriggerIdRef,
    menuContainerRef,
    tableScrollRef,
    menuPositionClass,
    computePlacementForOpenMenu,
  };
}

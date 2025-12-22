'use client';

import React from 'react';
import type { PipelineRow } from '@/types/pipeline';
import type { SortDir, SortKey } from './types';
import { SortTh } from './tableParts';
import PipelineTableRow from './PipelineTableRow';
import type { DatePreset } from '../../hooks/usePipelineFilters';

type Props = {
  loading: boolean;
  datePreset: string;
  pagedRows: PipelineRow[];

  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;

  tableScrollRef: React.RefObject<HTMLDivElement | null>;

  getProductName: (id: string) => string;
  getMarketerName: (id: string | null) => string;

  recentIds?: Record<string, number>;

  // action handlers
  openMenuId: string | number | null;
  setOpenMenuId: (v: string | number | null) => void;

  actionBtnRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  lastOpenedTriggerIdRef: React.MutableRefObject<string | null>;
  menuContainerRef: React.RefObject<HTMLDivElement | null>;
  menuPositionClass: string;
  computePlacementForOpenMenu: () => void;

  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;

  onResetFilters: () => void;
  setDatePreset: (v: DatePreset) => void;
};

export default function PipelineTableGrid(props: Props) {
  const {
    loading,
    datePreset,
    pagedRows,

    sortKey,
    sortDir,
    onSort,

    tableScrollRef,

    getProductName,
    getMarketerName,
    recentIds,

    openMenuId,
    setOpenMenuId,
    actionBtnRefs,
    lastOpenedTriggerIdRef,
    menuContainerRef,
    menuPositionClass,
    computePlacementForOpenMenu,

    openDetailModal,
    onEditRow,
    onCopyWARow,
    onDeleteRow,

    onResetFilters,
    setDatePreset,
  } = props;

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
    <div className="overflow-x-auto" ref={tableScrollRef}>
      <table className="min-w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <SortTh
              label="Nasabah"
              active={sortKey === 'customer'}
              dir={sortDir}
              onClick={() => onSort('customer')}
              className="sticky left-0 z-20 min-w-[230px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
              align="left"
            />
            <SortTh
              label="Produk"
              active={sortKey === 'product'}
              dir={sortDir}
              onClick={() => onSort('product')}
              className="min-w-[200px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
              align="left"
            />
            <th className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Branch
            </th>
            <SortTh
              label="APE (IDR)"
              active={sortKey === 'ape_idr'}
              dir={sortDir}
              onClick={() => onSort('ape_idr')}
              className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-600"
              align="right"
            />
            <SortTh
              label="APE (USD)"
              active={sortKey === 'ape_usd'}
              dir={sortDir}
              onClick={() => onSort('ape_usd')}
              className="min-w-[110px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-600"
              align="right"
            />
            <th className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Plan / Quadrant
            </th>
            <SortTh
              label="Marketer"
              active={sortKey === 'marketer'}
              dir={sortDir}
              onClick={() => onSort('marketer')}
              className="min-w-[130px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600"
              align="left"
            />
            <th className="min-w-[140px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Status / Source
            </th>
            <th className="min-w-[110px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Prioritas
            </th>
            <th className="sticky right-0 z-20 min-w-[70px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
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
                      onClick={onResetFilters}
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
              const isRecent = false;

              return (
                <PipelineTableRow
                  key={row.id}
                  row={row}
                  productName={productName}
                  marketerName={marketerName}
                  isPrioritas={isPrioritas}
                  isRecent={isRecent || !!recentIds?.[row.id]}
                  open={openMenuId === row.id}
                  menuPositionClass={menuPositionClass}
                  setTriggerRef={(el) => {
                    actionBtnRefs.current[String(row.id)] = el;
                  }}
                  onToggleMenu={() => {
                    lastOpenedTriggerIdRef.current = String(row.id);
                    setOpenMenuId(openMenuId === row.id ? null : row.id);
                    window.setTimeout(() => computePlacementForOpenMenu(), 0);
                  }}
                  menuContainerRef={menuContainerRef}
                  onMenuKeyDown={handleMenuKeyDown}
                  onView={() => {
                    openDetailModal(row);
                    setOpenMenuId(null);
                  }}
                  onEdit={() => {
                    onEditRow(row);
                    setOpenMenuId(null);
                  }}
                  onCopyWA={() => {
                    onCopyWARow(row);
                    setOpenMenuId(null);
                  }}
                  onDelete={() => {
                    confirmDelete(row);
                    setOpenMenuId(null);
                  }}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

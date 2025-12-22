'use client';

import React from 'react';
import type { PipelineRow } from '@/types/pipeline';
import { formatCurrencyIdr, formatCurrencyUsd } from './tableUtils';

type Props = {
  row: PipelineRow;

  productName: string;
  marketerName: string;

  isRecent: boolean;
  isPrioritas: boolean;

  // action menu wiring
  open: boolean;
  menuPositionClass: string;

  setTriggerRef: (el: HTMLButtonElement | null) => void;
  onToggleMenu: () => void;

  menuContainerRef: React.RefObject<HTMLDivElement | null>;
  onMenuKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;

  onView: () => void;
  onEdit: () => void;
  onCopyWA: () => void;
  onDelete: () => void;
};

export default function PipelineTableRow(props: Props) {
  const {
    row,
    productName,
    marketerName,
    isRecent,
    isPrioritas,

    open,
    menuPositionClass,
    setTriggerRef,
    onToggleMenu,

    menuContainerRef,
    onMenuKeyDown,

    onView,
    onEdit,
    onCopyWA,
    onDelete,
  } = props;

  return (
    <tr
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

      <td className="px-3 py-2 align-top text-right text-[11px] text-slate-700">{formatCurrencyUsd(row.ape_usd ?? 0)}</td>

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
            ref={setTriggerRef}
            onClick={onToggleMenu}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/70 bg-white text-[14px] leading-none text-slate-500 shadow-sm hover:bg-slate-50"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            ⋮
          </button>

          {open && (
            <div
              ref={menuContainerRef}
              className={[
                'absolute z-30 w-40 rounded-xl border border-slate-200 bg-white py-1 text-left text-[11px] shadow-lg',
                menuPositionClass,
              ].join(' ')}
              role="menu"
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              aria-label="Menu aksi pipeline"
            >
              <button type="button" onClick={onView} className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50" role="menuitem">
                Lihat detail
              </button>
              <button type="button" onClick={onEdit} className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50" role="menuitem">
                Edit
              </button>
              <button type="button" onClick={onCopyWA} className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50" role="menuitem">
                Copy WA
              </button>
              <button type="button" onClick={onDelete} className="flex w-full items-center px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50" role="menuitem">
                Hapus
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

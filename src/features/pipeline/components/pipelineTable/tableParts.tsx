'use client';

import React from 'react';
import type { PresetId, SortDir } from './types';

export function Chip({ label, onClear }: { label: string; onClear: () => void }) {
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

export function SortTh({
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

export function PresetButton({
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

// (opsional) biar IDE gampang autocomplete
export type { PresetId };

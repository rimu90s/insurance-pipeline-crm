import type { DatePreset } from '../../hooks/usePipelineFilters';

export const PAGE_SIZE = 10;

export function formatCurrencyIdr(value: number | null): string {
  if (!value) return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatCurrencyUsd(value: number | null): string {
  if (!value) return '$ 0';
  return `$ ${value.toLocaleString('en-US')}`;
}

export function formatPresetLabel(preset: DatePreset): string {
  if (preset === 'today') return 'Hari ini';
  if (preset === '7d') return '7 hari terakhir';
  if (preset === '30d') return '30 hari terakhir';
  if (preset === 'custom') return 'Custom range';
  return String(preset);
}

export function nowLocalTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

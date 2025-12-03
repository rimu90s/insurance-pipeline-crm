'use client';

import { useState } from 'react';
import { PipelineRow } from '@/types/pipeline';
import type { DateRangePreset } from '../components/DateRangePicker';

// Preset tanggal yang dipakai di seluruh sistem (HARUS sama dengan DateRangePicker)
export type DatePreset = DateRangePreset;

export function usePipelineFilters(pipelines: PipelineRow[]) {
  const [filterProductId, setFilterProductId] = useState<string>('');
  const [filterPlan, setFilterPlan] = useState<string>('');
  const [filterQuadrant, setFilterQuadrant] = useState<string>('');
  const [filterMarketerId, setFilterMarketerId] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLeadSource, setFilterLeadSource] = useState<string>('');

  // Date filter
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(''); // YYYY-MM-DD
  const [customEndDate, setCustomEndDate] = useState<string>(''); // YYYY-MM-DD

  // Helper util: YYYY-MM-DD hari ini
  const todayStr = new Date().toISOString().slice(0, 10);

  function isInDatePreset(row: PipelineRow): boolean {
    const dateStr = row.pipeline_date; // kolom tanggal: 'pipeline_date' (YYYY-MM-DD atau null)

    // Kalau tidak ada tanggal → kita exclude saja dari semua preset
    if (!dateStr) return false;

    if (datePreset === 'custom') {
      // custom tanpa input apapun → jangan filter (anggap "semua tanggal")
      if (!customStartDate && !customEndDate) return true;

      const d = new Date(dateStr + 'T00:00:00');
      const start = customStartDate
        ? new Date(customStartDate + 'T00:00:00')
        : null;
      const end = customEndDate
        ? new Date(customEndDate + 'T23:59:59')
        : null;

      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    }

    // Untuk preset harian / rolling N hari
    if (datePreset === 'today') {
      return dateStr === todayStr;
    }

    const d = new Date(dateStr);
    const today = new Date(todayStr);

    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (datePreset) {
      case 'yesterday':
        return diffDays === 1;
      case '7d':
        // last 7 days (termasuk hari ini) → 0..6
        return diffDays >= 0 && diffDays <= 6;
      case '14d':
        return diffDays >= 0 && diffDays <= 13;
      case '30d':
        return diffDays >= 0 && diffDays <= 29;
      case '90d':
        return diffDays >= 0 && diffDays <= 89;
      default:
        // fallback kalau ada preset baru nanti
        return true;
    }
  }

  const filteredPipelines = pipelines.filter((row) => {
    if (filterProductId && row.product_id !== filterProductId) {
      return false;
    }

    if (filterPlan && (row.execution_plan ?? '') !== filterPlan) {
      return false;
    }

    if (filterQuadrant && (row.quadrant ?? '') !== filterQuadrant) {
      return false;
    }

    if (filterMarketerId && row.marketer_id !== filterMarketerId) {
      return false;
    }

    if (filterPriority) {
      const isPrioritas = !!row.priority_flag;
      if (filterPriority === 'prioritas' && !isPrioritas) return false;
      if (filterPriority === 'normal' && isPrioritas) return false;
    }

    if (filterStatus && (row.status ?? '') !== filterStatus) {
      return false;
    }

    if (filterLeadSource && (row.lead_source ?? '') !== filterLeadSource) {
      return false;
    }

    // filter tanggal terakhir
    if (!isInDatePreset(row)) return false;

    return true;
  });

  const totalApeIdr = filteredPipelines.reduce(
    (sum, row) => sum + (row.ape_idr ?? 0),
    0
  );
  const totalApeUsd = filteredPipelines.reduce(
    (sum, row) => sum + (row.ape_usd ?? 0),
    0
  );

  const resetFilters = () => {
    setFilterProductId('');
    setFilterPlan('');
    setFilterQuadrant('');
    setFilterMarketerId('');
    setFilterPriority('');
    setFilterStatus('');
    setFilterLeadSource('');
    setDatePreset('today');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return {
    // state filter umum
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

    // date filter
    datePreset,
    setDatePreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,

    // hasil
    filteredPipelines,
    totalApeIdr,
    totalApeUsd,
    resetFilters,
  };
}

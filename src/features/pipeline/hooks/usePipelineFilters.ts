'use client';

import { useState, useMemo } from 'react';
import { PipelineRow } from '@/types/pipeline';
import type { DateRangePreset } from '../components/DateRangePicker';

// Preset tanggal yang dipakai di seluruh sistem
export type DatePreset = DateRangePreset;

function toLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

  const filteredPipelines = useMemo(() => {
    let result: PipelineRow[] = [...pipelines];

    // Helper: filter tanggal per-row
    const applyDateFilter = (row: PipelineRow): boolean => {
      const dateStr = row.pipeline_date; // YYYY-MM-DD atau null

      // Jika tidak ada tanggal, exclude
      if (!dateStr) return false;

      // "hari ini" versi lokal (timezone-safe, tanpa UTC shift)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = toLocalYYYYMMDD(today);

      // ── Custom range: pakai string compare (paling stabil untuk YYYY-MM-DD)
      if (datePreset === 'custom') {
        // custom tanpa input apa pun → semua tanggal lolos
        if (!customStartDate && !customEndDate) return true;

        if (customStartDate && dateStr < customStartDate) return false;
        if (customEndDate && dateStr > customEndDate) return false;
        return true;
      }

      // ── Preset "today" (string compare, aman)
      if (datePreset === 'today') {
        return dateStr === todayStr;
      }

      // Untuk rolling window, kita pakai Date lokal tapi "todayStr" sudah aman.
      const d = new Date(dateStr + 'T00:00:00');
      d.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (datePreset) {
        case 'yesterday':
          return diffDays === 1;
        case '7d':
          return diffDays >= 0 && diffDays <= 6;
        case '14d':
          return diffDays >= 0 && diffDays <= 13;
        case '30d':
          return diffDays >= 0 && diffDays <= 29;
        case '90d':
          return diffDays >= 0 && diffDays <= 89;
        default:
          // fallback kalau ada preset baru
          return true;
      }
    };

    // ── filter by product
    if (filterProductId) {
      result = result.filter((row) => row.product_id === filterProductId);
    }

    // ── filter by plan
    if (filterPlan) {
      result = result.filter((row) => row.execution_plan === filterPlan);
    }

    // ── filter by quadrant
    if (filterQuadrant) {
      result = result.filter((row) => row.quadrant === filterQuadrant);
    }

    // ── filter by marketer
    if (filterMarketerId) {
      result = result.filter((row) => row.marketer_id === filterMarketerId);
    }

    // ── filter by priority
    if (filterPriority === 'priority') {
      result = result.filter((row) => !!row.priority_flag);
    } else if (filterPriority === 'normal') {
      result = result.filter((row) => !row.priority_flag);
    }

    // ── filter by status
    if (filterStatus) {
      result = result.filter((row) => row.status === filterStatus);
    }

    // ── filter by lead source
    if (filterLeadSource) {
      result = result.filter((row) => row.lead_source === filterLeadSource);
    }

    // ── filter tanggal (preset/custom)
    result = result.filter((row) => applyDateFilter(row));

    return result;
  }, [
    pipelines,
    filterProductId,
    filterPlan,
    filterQuadrant,
    filterMarketerId,
    filterPriority,
    filterStatus,
    filterLeadSource,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  const totalApeIdr = useMemo(() => {
    return filteredPipelines.reduce((sum, row) => sum + (row.ape_idr ?? 0), 0);
  }, [filteredPipelines]);

  const totalApeUsd = useMemo(() => {
    return filteredPipelines.reduce((sum, row) => sum + (row.ape_usd ?? 0), 0);
  }, [filteredPipelines]);

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

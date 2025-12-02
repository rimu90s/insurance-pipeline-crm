'use client';

import { useState } from 'react';
import { PipelineRow } from '@/types/pipeline';

type DatePreset = 'today' | '7d' | '30d' | 'all';

export function usePipelineFilters(pipelines: PipelineRow[]) {
  const [filterProductId, setFilterProductId] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterQuadrant, setFilterQuadrant] = useState('');
  const [filterMarketerId, setFilterMarketerId] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLeadSource, setFilterLeadSource] = useState('');

  // 🔹 preset tanggal (default: hari ini)
  const [datePreset, setDatePreset] = useState<DatePreset>('today');

  // Helper: parse 'YYYY-MM-DD' → timestamp start-of-day
  const parseDate = (value: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // Terapkan preset tanggal ke list pipelines
  const applyDatePreset = (rows: PipelineRow[]): PipelineRow[] => {
    if (datePreset === 'all') return rows;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    let minMs = todayMs;

    if (datePreset === '7d') {
      minMs = todayMs - 6 * 24 * 60 * 60 * 1000;
    } else if (datePreset === '30d') {
      minMs = todayMs - 29 * 24 * 60 * 60 * 1000;
    }

    return rows.filter((row) => {
      const t = parseDate(row.pipeline_date ?? null);
      if (t === null) {
        // Kalau tidak ada tanggal, sembunyikan untuk preset selain "all"
        return false;
      }

      if (datePreset === 'today') {
        return t === todayMs;
      }

      return t >= minMs && t <= todayMs;
    });
  };

  // 🔹 Apply: DATE → lalu filter lain
  const filteredPipelines = applyDatePreset(pipelines).filter((row) => {
    if (filterProductId && row.product_id !== filterProductId) return false;

    if (filterPlan && (row.execution_plan ?? '') !== filterPlan) return false;

    if (filterQuadrant && (row.quadrant ?? '') !== filterQuadrant) return false;

    if (filterMarketerId && (row.marketer_id ?? '') !== filterMarketerId) {
      return false;
    }

    if (filterPriority) {
      const isPrioritas = !!row.priority_flag;
      if (filterPriority === 'prioritas' && !isPrioritas) return false;
      if (filterPriority === 'normal' && isPrioritas) return false;
    }

    if (filterStatus && (row.status ?? '') !== filterStatus) return false;

    if (filterLeadSource && (row.lead_source ?? '') !== filterLeadSource) {
      return false;
    }

    return true;
  });

  // 🔹 Total APE dari hasil filter
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
    setDatePreset('today'); // balik ke preset hari ini
  };

  return {
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
    filteredPipelines,
    totalApeIdr,
    totalApeUsd,
    resetFilters,
  };
}

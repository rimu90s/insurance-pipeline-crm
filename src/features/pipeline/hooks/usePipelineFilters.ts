'use client';

import { useState } from 'react';
import { PipelineRow } from '@/types/pipeline';

export type DatePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | 'this_week'
  | 'last_week'
  | '30d'
  | 'this_month'
  | 'all'
  | 'custom';

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

  // Helper util: ambil YYYY-MM-DD hari ini
  const todayStr = new Date().toISOString().slice(0, 10);

  function isInDatePreset(row: PipelineRow): boolean {
    const dateStr = row.pipeline_date; // asumsi kolom tanggal = 'pipeline_date' (YYYY-MM-DD atau null)
    if (!dateStr) {
      // kalau tidak ada tanggal, hanya tampil di mode "all"
      return datePreset === 'all';
    }

    // simple string compare saja (karena format YYYY-MM-DD)
    if (datePreset === 'all') return true;
    if (datePreset === 'today') return dateStr === todayStr;

    const d = new Date(dateStr);
    const today = new Date(todayStr);

    // Normalisasi ke jam 00:00 biar aman
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (datePreset === 'yesterday') {
      return diffDays === 1;
    }

    if (datePreset === '7d') {
      return diffDays >= 0 && diffDays <= 7;
    }

    if (datePreset === '30d') {
      return diffDays >= 0 && diffDays <= 30;
    }

    if (datePreset === 'this_week') {
      // Minggu ini (Senin–Minggu) berdasarkan hari ini
      const day = today.getDay(); // 0 = Minggu
      const mondayOffset = (day + 6) % 7; // jarak ke Senin
      const start = new Date(today);
      start.setDate(today.getDate() - mondayOffset);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return d >= start && d <= end;
    }

    if (datePreset === 'last_week') {
      const day = today.getDay();
      const mondayOffset = (day + 6) % 7;
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - mondayOffset);

      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);

      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);

      lastMonday.setHours(0, 0, 0, 0);
      lastSunday.setHours(23, 59, 59, 999);

      return d >= lastMonday && d <= lastSunday;
    }

    if (datePreset === 'this_month') {
      const start = new Date(today);
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0); // hari terakhir bulan ini

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return d >= start && d <= end;
    }

    if (datePreset === 'custom') {
      if (!customStartDate && !customEndDate) return true; // kalau belum isi apapun, jangan memfilter apa-apa dulu
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

    return true;
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

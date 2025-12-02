'use client';

import { useEffect, useState } from 'react';
import { PipelineRow } from '@/types/pipeline';

const FILTER_KEY = 'sales-pipeline-filters-v1';

type SavedFilters = {
  productId?: string;
  plan?: string;
  quadrant?: string;
  marketerId?: string;
  priority?: string;
  status?: string;
  leadSource?: string;
};

function getInitialFilters(): {
  productId: string;
  plan: string;
  quadrant: string;
  marketerId: string;
  priority: string;
  status: string;
  leadSource: string;
} {
  const defaults = {
    productId: 'all',
    plan: 'all',
    quadrant: 'all',
    marketerId: 'all',
    priority: 'all',
    status: 'all',
    leadSource: 'all',
  };

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(FILTER_KEY);
    if (!raw) return defaults;

    const saved = JSON.parse(raw) as SavedFilters;

    return {
      productId: saved.productId ?? defaults.productId,
      plan: saved.plan ?? defaults.plan,
      quadrant: saved.quadrant ?? defaults.quadrant,
      marketerId: saved.marketerId ?? defaults.marketerId,
      priority: saved.priority ?? defaults.priority,
      status: saved.status ?? defaults.status,
      leadSource: saved.leadSource ?? defaults.leadSource,
    };
  } catch (e) {
    console.error('Failed to load filters', e);
    return defaults;
  }
}

export function usePipelineFilters(pipelines: PipelineRow[]) {
  const initial = getInitialFilters();

  const [filterProductId, setFilterProductId] = useState<string>(
    () => initial.productId
  );
  const [filterQuadrant, setFilterQuadrant] = useState<string>(
    () => initial.quadrant
  );
  const [filterPlan, setFilterPlan] = useState<string>(() => initial.plan);
  const [filterMarketerId, setFilterMarketerId] = useState<string>(
    () => initial.marketerId
  );
  const [filterPriority, setFilterPriority] = useState<string>(
    () => initial.priority
  ); // all | prio | nonprio
  const [filterStatus, setFilterStatus] = useState<string>(
    () => initial.status
  );
  const [filterLeadSource, setFilterLeadSource] = useState<string>(
    () => initial.leadSource
  );
    // Filter tanggal: preset sederhana (default: hari ini)
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'all'>(
    'today',
  );


  // SAVE filter ke localStorage setiap kali berubah
  useEffect(() => {
    const payload: SavedFilters = {
      productId: filterProductId,
      plan: filterPlan,
      quadrant: filterQuadrant,
      marketerId: filterMarketerId,
      priority: filterPriority,
      status: filterStatus,
      leadSource: filterLeadSource,
    };

    try {
      window.localStorage.setItem(FILTER_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save filters', e);
    }
  }, [
    filterProductId,
    filterPlan,
    filterQuadrant,
    filterMarketerId,
    filterPriority,
    filterStatus,
    filterLeadSource,
  ]);

  // FILTERING pipelines
  const filteredPipelines = pipelines.filter((row) => {
    const matchProduct =
      filterProductId === 'all' ? true : row.product_id === filterProductId;

    const matchPlan =
      filterPlan === 'all'
        ? true
        : (row.execution_plan ?? '').toLowerCase() ===
          filterPlan.toLowerCase();

    const matchQuadrant =
      filterQuadrant === 'all'
        ? true
        : (row.quadrant ?? '').toLowerCase() ===
          filterQuadrant.toLowerCase();

    const matchMarketer =
      filterMarketerId === 'all'
        ? true
        : (row.marketer_id ?? '') === filterMarketerId;

    const matchPriority =
      filterPriority === 'all'
        ? true
        : filterPriority === 'prio'
        ? !!row.priority_flag
        : !row.priority_flag;

    const matchStatus =
      filterStatus === 'all'
        ? true
        : (row.status ?? '').toLowerCase() ===
          filterStatus.toLowerCase();

    const matchLeadSource =
      filterLeadSource === 'all'
        ? true
        : (row.lead_source ?? '').toLowerCase() ===
          filterLeadSource.toLowerCase();

        // Filter tanggal
        let matchDate = true;

        if (datePreset !== 'all') {
          if (!row.pipeline_date) {
            matchDate = false;
          } else {
            const today = new Date();
            const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
            const rowDate = new Date(row.pipeline_date);
          
            // Normalisasi ke jam 00:00 biar konsisten
            const todayMid = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            ).getTime();
            const rowMid = new Date(
              rowDate.getFullYear(),
              rowDate.getMonth(),
              rowDate.getDate(),
            ).getTime();
          
            const diffDays = (todayMid - rowMid) / (1000 * 60 * 60 * 24);
          
            if (datePreset === 'today') {
              // hanya yang tanggalnya persis hari ini
              matchDate = row.pipeline_date === todayStr;
            } else if (datePreset === '7d') {
              // 7 hari ke belakang (termasuk hari ini)
              matchDate = diffDays >= 0 && diffDays < 7;
            } else if (datePreset === '30d') {
              // 30 hari ke belakang
              matchDate = diffDays >= 0 && diffDays < 30;
            }
          }
        }
      

    return (
      matchProduct &&
      matchPlan &&
      matchQuadrant &&
      matchMarketer &&
      matchPriority &&
      matchStatus &&
      matchLeadSource &&
      matchDate
    );
  });

  const totalApeIdr = filteredPipelines.reduce(
    (acc, row) => acc + (row.ape_idr ?? 0),
    0
  );
  const totalApeUsd = filteredPipelines.reduce(
    (acc, row) => acc + (row.ape_usd ?? 0),
    0
  );

  const resetFilters = () => {
    setFilterProductId('all');
    setFilterPlan('all');
    setFilterQuadrant('all');
    setFilterMarketerId('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterLeadSource('all');
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
    datePreset,
    setDatePreset,
    setFilterLeadSource,
    filteredPipelines,
    totalApeIdr,
    totalApeUsd,
    resetFilters,
  };
}

'use client';

import { useMemo } from 'react';
import type { PipelineRow } from '@/types/pipeline';

// Util: format YYYY-MM-DD (local-safe)
function formatDateLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Extract date part from timestamps
function getDatePart(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export interface TodaySummary {
  totalPipeline: number;
  apeIdr: number;
  apeUsd: number;
  newPipelines: number;
  followUps: number;
  won: number;
  lost: number;
}

export interface WeeklyRow {
  date: string;
  label: string;
  totalPipeline: number;
  apeIdr: number;
  apeUsd: number;
  won: number;
  lost: number;
}

export interface DailyReportStats {
  today: TodaySummary;
  weekly: WeeklyRow[];
}

type PipelineRowExtended = PipelineRow & {
  created_at?: string | null;
};

/**
 * Generate today + 7-day trend statistics.
 * Input: full pipelines (no UI filter applied).
 */
export function useDailyReport(
  pipelines: PipelineRow[],
  preset: "today" | "yesterday" | "7d" | "30d" = "today"
): DailyReportStats {
  return useMemo(() => {
    // Today context (base)
    const now = new Date();
    // Anchor date berdasarkan preset
    const anchor = new Date(now);
    if (preset === "yesterday") {
      anchor.setDate(anchor.getDate() - 1);
    }
    // Format anchor (YYYY-MM-DD)
    const anchorStr = formatDateLocalYYYYMMDD(anchor);

    // FILTER: pipeline with today's pipeline_date
    const todayRows = pipelines.filter(
      (p) => p.pipeline_date === anchorStr
    );

    let apeIdr = 0;
    let apeUsd = 0;
    let newPipelines = 0;
    let followUps = 0;
    let won = 0;
    let lost = 0;

    for (const pBase of pipelines) {
      const p = pBase as PipelineRowExtended;

      const pipelineDate = p.pipeline_date ?? null;
      const createdDate = getDatePart(p.created_at);
      const lastContactDate = p.last_contact_date ?? null;
      const status = p.status ?? '';

      if (pipelineDate === anchorStr) {
        apeIdr += p.ape_idr ?? 0;
        apeUsd += p.ape_usd ?? 0;
        if (status === 'won') won += 1;
        if (status === 'lost') lost += 1;
      }

      if (createdDate === anchorStr) newPipelines += 1;
      if (lastContactDate === anchorStr) followUps += 1;
    }

    const todaySummary: TodaySummary = {
      totalPipeline: todayRows.length,
      apeIdr,
      apeUsd,
      newPipelines,
      followUps,
      won,
      lost,
    };

    // WEEKLY TREND
    const weekly: WeeklyRow[] = [];
    const range = preset === "30d" ? 30 : 7;
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateLocalYYYYMMDD(d);

      const rows = pipelines.filter((p) => p.pipeline_date === dateStr);

      let apeIdrDay = 0;
      let apeUsdDay = 0;
      let wonDay = 0;
      let lostDay = 0;

      for (const r of rows) {
        apeIdrDay += r.ape_idr ?? 0;
        apeUsdDay += r.ape_usd ?? 0;
        if ((r.status ?? '') === 'won') wonDay += 1;
        if ((r.status ?? '') === 'lost') lostDay += 1;
      }

      const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = String(d.getDate()).padStart(2, '0');

      weekly.push({
        date: dateStr,
        label: `${weekday}, ${dayNum}`,
        totalPipeline: rows.length,
        apeIdr: apeIdrDay,
        apeUsd: apeUsdDay,
        won: wonDay,
        lost: lostDay,
      });
    }

    return {
      today: todaySummary,
      weekly,
    };
  }, [pipelines, preset]);
}

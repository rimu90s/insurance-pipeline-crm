'use client';

import { useMemo } from 'react';
import type { PipelineRow } from '@/types/pipeline';

function formatDateLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDatePart(value: string | null | undefined): string | null {
  if (!value) return null;
  // Supabase timestamp biasanya dalam ISO string → ambil 10 char pertama (YYYY-MM-DD)
  return value.slice(0, 10);
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
  date: string; // YYYY-MM-DD
  label: string; // misal: "Sen, 03"
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

type PipelineRowWithCreatedAt = PipelineRow & {
    created_at?: string | null;
};


/**
 * Hitung statistik laporan harian dari seluruh pipelines milik user.
 * Tidak terpengaruh filter UI (pakai data mentah).
 */
export function useDailyReport(pipelines: PipelineRow[]): DailyReportStats {
  return useMemo(() => {
    const today = new Date();
    const todayStr = formatDateLocalYYYYMMDD(today);

    // ───── TODAY SUMMARY ─────────────────────────────────────
    const todayRows = pipelines.filter(
      (p) => p.pipeline_date === todayStr
    );

    let apeIdrToday = 0;
    let apeUsdToday = 0;
    let newPipelinesToday = 0;
    let followUpsToday = 0;
    let wonToday = 0;
    let lostToday = 0;

for (const baseRow of pipelines) {
  const row = baseRow as PipelineRowWithCreatedAt;

  const pipelineDate = row.pipeline_date ?? null;
  const createdDate = getDatePart(row.created_at ?? null);
  const lastContactDate = row.last_contact_date ?? null;
  const status = row.status ?? '';

  if (pipelineDate === todayStr) {
    apeIdrToday += row.ape_idr ?? 0;
    apeUsdToday += row.ape_usd ?? 0;

    if (status === 'won') wonToday += 1;
    if (status === 'lost') lostToday += 1;
  }

  if (createdDate === todayStr) {
    newPipelinesToday += 1;
  }

  if (lastContactDate === todayStr) {
    followUpsToday += 1;
  }
}

    const todaySummary: TodaySummary = {
      totalPipeline: todayRows.length,
      apeIdr: apeIdrToday,
      apeUsd: apeUsdToday,
      newPipelines: newPipelinesToday,
      followUps: followUpsToday,
      won: wonToday,
      lost: lostToday,
    };

    // ───── WEEKLY TREND (7 hari ke belakang, termasuk hari ini) ───────────────
    const weekly: WeeklyRow[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateLocalYYYYMMDD(d);

      const rows = pipelines.filter((p) => p.pipeline_date === dateStr);

      let apeIdr = 0;
      let apeUsd = 0;
      let won = 0;
      let lost = 0;

      for (const row of rows) {
        apeIdr += row.ape_idr ?? 0;
        apeUsd += row.ape_usd ?? 0;

        if ((row.status ?? '') === 'won') won += 1;
        if ((row.status ?? '') === 'lost') lost += 1;
      }

      const weekday = d.toLocaleDateString('id-ID', {
        weekday: 'short',
      }); // misal "Sen"
      const day = String(d.getDate()).padStart(2, '0');

      weekly.push({
        date: dateStr,
        label: `${weekday}, ${day}`,
        totalPipeline: rows.length,
        apeIdr,
        apeUsd,
        won,
        lost,
      });
    }

    return {
      today: todaySummary,
      weekly,
    };
  }, [pipelines]);
}

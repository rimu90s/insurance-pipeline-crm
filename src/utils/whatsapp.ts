import { PipelineRow } from '@/types/pipeline';

export type MessageMode = 'short' | 'full';

export const buildWhatsAppMessage = (
  row: PipelineRow,
  productName: string,
  marketerName: string,
  mode: MessageMode = 'short'
) => {
  const apeIdr = row.ape_idr
    ? 'Rp ' + row.ape_idr.toLocaleString('id-ID')
    : '-';

  const apeUsd = row.ape_usd
    ? '$' + row.ape_usd.toLocaleString('en-US')
    : '-';

  if (mode === 'short') {
    return (
      `🔥 Pipeline Update\n` +
      `${productName} | ${row.customer_name}\n` +
      `APE ${apeIdr} / ${apeUsd}\n` +
      `Plan: ${row.execution_plan ?? '-'} | Quad: ${row.quadrant ?? '-'}\n` +
      `Prioritas: ${row.priority_flag ? 'YES' : 'NO'}`
    ).trim();
  }

  // FULL MESSAGE MODE
  return (
    `🔥 PIPELINE DETAIL\n\n` +
    `Produk: ${productName}\n` +
    `Nasabah: ${row.customer_name}\n` +
    `Marketer: ${marketerName}\n` +
    `Branch: ${row.branch ?? '-'}\n` +
    `Class: ${row.class ?? '-'}\n\n` +
    `APE IDR: ${apeIdr}\n` +
    `APE USD: ${apeUsd}\n` +
    `Plan: ${row.execution_plan ?? '-'}\n` +
    `Quadrant: ${row.quadrant ?? '-'}\n\n` +
    `Remarks: ${row.remarks ?? '-'}\n` +
    `Tanggal: ${row.pipeline_date ?? '-'}\n` +
    `Prioritas: ${row.priority_flag ? 'YES' : 'NO'}`
  ).trim();
};

export const buildWhatsAppLineShort = (
  row: PipelineRow,
  productName: string,
  marketerName: string
) => {
  const apeIdr = row.ape_idr
    ? 'Rp ' + row.ape_idr.toLocaleString('id-ID')
    : '-';

  const plan = row.execution_plan ?? '-';
  const quad = row.quadrant ?? '-';
  const prio = row.priority_flag ? 'PRIO' : '';

  // 1 baris ringkas, enak untuk rekap list
  return `${productName} | ${row.customer_name} | ${marketerName} | ${apeIdr} | ${plan} | ${quad} ${prio}`.trim();
};

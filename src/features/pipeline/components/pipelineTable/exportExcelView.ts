import * as XLSX from 'xlsx';
import type { PipelineRow } from '@/types/pipeline';
import type { DatePreset } from '../../hooks/usePipelineFilters';

function formatPresetLabel(preset: DatePreset): string {
  if (preset === 'today') return 'Hari ini';
  if (preset === '7d') return '7 hari terakhir';
  if (preset === '30d') return '30 hari terakhir';
  if (preset === 'custom') return 'Custom range';
  return String(preset);
}

function nowLocalTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

type ExportArgs = {
  rows: PipelineRow[];
  datePreset: DatePreset;

  filterProductId: string;
  filterMarketerId: string;
  filterPlan: string;
  filterQuadrant: string;
  filterStatus: string;
  filterLeadSource: string;
  filterPriority: string;

  search: string;
  sortKey: string;
  sortDir: string;

  productMap: Record<string, string>;
  marketerMap: Record<string, string>;

  getProductName: (id: string) => string;
  getMarketerName: (id: string | null) => string;
};

export function exportPipelineExcelView(args: ExportArgs) {
  const {
    rows,
    datePreset,

    filterProductId,
    filterMarketerId,
    filterPlan,
    filterQuadrant,
    filterStatus,
    filterLeadSource,
    filterPriority,

    search,
    sortKey,
    sortDir,

    productMap,
    marketerMap,

    getProductName,
    getMarketerName,
  } = args;

  if (rows.length === 0) {
    alert('Tidak ada data pipeline untuk diexport (periksa filter/search).');
    return;
  }

  const productLabel = filterProductId ? productMap[filterProductId] || filterProductId : 'Semua produk';
  const marketerLabel = filterMarketerId ? marketerMap[filterMarketerId] || filterMarketerId : 'Semua marketer';

  const contextLines: string[][] = [
    ['LAPORAN PIPELINE (EXPORT TAMPILAN)'],
    ['Diexport pada', nowLocalTimestamp()],
    ['Periode', formatPresetLabel(datePreset)],
    ['Produk', productLabel],
    ['Marketer', marketerLabel],
    ['Plan', filterPlan || 'Semua'],
    ['Quadrant', filterQuadrant ? filterQuadrant.toUpperCase() : 'Semua'],
    ['Status', filterStatus || 'Semua'],
    ['Lead Source', filterLeadSource || 'Semua'],
    ['Prioritas', filterPriority || 'Semua'],
    ['Search', search.trim() || '-'],
    ['Sort', `${String(sortKey).toUpperCase()} (${String(sortDir).toUpperCase()})`],
    ['Total baris', String(rows.length)],
    [],
  ];

  const header = [
    'NO',
    'NASABAH',
    'PRODUK',
    'BRANCH',
    'CLASS',
    'MARKETER',
    'APE_IDR',
    'APE_USD',
    'PLAN',
    'QUADRANT',
    'PIPELINE_DATE',
    'STATUS',
    'LEAD_SOURCE',
    'EXPECTED_CLOSING',
    'LAST_CONTACT',
    'NEXT_ACTION',
    'RISK_TAG',
    'PRIORITAS',
    'REMARKS',
  ];

  const body: (string | number)[][] = rows.map((row, index) => {
    const product = getProductName(row.product_id);
    const marketer = getMarketerName(row.marketer_id);

    return [
      index + 1,
      row.customer_name,
      product,
      row.branch ?? '',
      row.class ?? '',
      marketer,
      row.ape_idr ?? 0,
      row.ape_usd ?? 0,
      row.execution_plan ?? '',
      row.quadrant ?? '',
      row.pipeline_date ?? '',
      row.status ?? '',
      row.lead_source ?? '',
      row.expected_closing_date ?? '',
      row.last_contact_date ?? '',
      row.next_action ?? '',
      row.risk_tag ?? '',
      row.priority_flag ? 'YES' : '',
      row.remarks ?? '',
    ];
  });

  const aoa: (string | number)[][] = [...contextLines, header, ...body];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    5, 22, 20, 14, 10, 18, 12, 10, 10, 10, 14, 12, 12, 16, 14, 18, 12, 10, 24,
  ].map((wch) => ({ wch }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pipeline (View)');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `pipeline-view-${dateStr}.xlsx`);
}

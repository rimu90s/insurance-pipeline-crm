'use client';

/**
 * ============================================================
 * PIPELINE TABLE COMPONENT (FULL + ANNOTATED)
 * ============================================================
 *
 * Fungsi utama komponen ini:
 * --------------------------------
 * - Menampilkan daftar pipeline dalam bentuk tabel lengkap.
 * - Semua informasi yang penting bagi atasan:
 *   Produk, Nasabah, Marketer, Branch, Class, APE IDR/USD,
 *   Plan (week), Quadrant, Prioritas, Remarks, Tanggal.
 *
 * - Memberikan fitur:
 *   1) FILTER:
 *      - Produk
 *      - Plan (week 1–4)
 *      - Quadrant (k1–k4)
 *      - Marketer
 *      - Prioritas (prioritas saja / non-prioritas)
 *
 *   2) SORT:
 *      - Sort by Tanggal pipeline
 *      - Sort by Produk
 *      - Sort by Nama nasabah
 *      - Sort by APE IDR
 *
 *   3) ACTION:
 *      - Reset filter
 *      - Reset sort
 *      - Export Excel
 *      - Copy WA (berdasarkan data yang sedang terfilter)
 *
 *   4) ACTION per baris:
 *      - Detail (buka modal)
 *      - Copy ringkas ke WhatsApp
 *      - Edit cepat
 *      - Hapus data
 *
 * Catatan:
 * - Data filter dan logika filter utama dikendalikan di DashboardPage.
 * - Komponen ini menerima "filteredPipelines" dari parent,
 *   lalu melakukan SORT dan rendering tampilan.
 *
 * ============================================================
 */

import { useState, useCallback, useMemo } from 'react';
import { PipelineRow } from '@/types/pipeline';
import { buildWhatsAppLineShort } from '@/utils/whatsapp';

/**
 * ============================================================
 * TYPE DEFINITIONS UNTUK DATA & PROPS
 * ============================================================
 */

// Tipe produk (minimal yang dibutuhkan di tabel)
type Product = {
  id: string;
  name: string;
};

// Tipe marketer (minimal yang dibutuhkan di tabel)
type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

// Props yang datang dari DashboardPage
type PipelineTableProps = {
  // Data pipeline yang sudah difilter oleh parent (DashboardPage)
  filteredPipelines: PipelineRow[];

  // Lookup data
  products: Product[];
  marketers: Marketer[];

  // Flag loading, untuk menampilkan skeleton
  loading: boolean;

  /**
   * --------------------------------
   * STATE FILTER (dari parent)
   * --------------------------------
   * Komponen ini hanya "memanggil setter", tidak menyimpan filter sendiri,
   * supaya semua sumber kebenaran filter ada di DashboardPage.
   */
  filterProductId: string;
  setFilterProductId: (v: string) => void;
  filterPlan: string;
  setFilterPlan: (v: string) => void;
  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;
  filterMarketerId: string;
  setFilterMarketerId: (v: string) => void;
  filterPriority: string; // 'all' | 'prio' | 'nonprio'
  setFilterPriority: (v: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterLeadSource: string;
  setFilterLeadSource: (v: string) => void;


  // Aksi global dari parent
  exportExcel: () => void;
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;

  // Tombol reset filter (mengembalikan semua filter ke default)
  onResetFilters: () => void;
};

/**
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */
export default function PipelineTable({
  filteredPipelines,
  products,
  marketers,
  loading,
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
  exportExcel,
  openDetailModal,
  onEditRow,
  onDeleteRow,
  onCopyWARow,
  onResetFilters,
}: PipelineTableProps) {
  /**
   * ============================================================
   * A. STATE SORTING
   * ============================================================
   *
   * sortBy:
   *  - 'date'     → berdasarkan tanggal pipeline
   *  - 'product'  → berdasarkan nama produk
   *  - 'customer' → berdasarkan nama nasabah
   *  - 'apeIdr'   → berdasarkan nominal APE IDR
   *
   * sortDirection:
   *  - 'asc'  → ascending (kecil → besar)
   *  - 'desc' → descending (besar → kecil)
   */
  const [sortBy, setSortBy] = useState<'date' | 'product' | 'customer' | 'apeIdr'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  /**
   * ============================================================
   * B. HELPER MINI (LOOKUP PRODUK & MARKETER)
   * ============================================================
   */

  // Ambil nama produk dari product_id
  const getProductName = useCallback(
    (id: string) => {
      const p = products.find((x) => x.id === id);
      return p ? p.name : '-';
    },
    [products] // tergantung pada array products
  );


  // Ambil nama marketer dari marketer_id
  const getMarketerName = (id: string | null) => {
    if (!id) return '-';
    const m = marketers.find((x) => x.id === id);
    return m ? m.name : '-';
  };

  // Ambil branch marketer (kalau ada)
  const getMarketerBranch = (id: string | null) => {
    if (!id) return '-';
    const m = marketers.find((x) => x.id === id);
    return m?.branch ?? '-';
  };

  /**
   * ============================================================
   * C. SORT HANDLER
   * ============================================================
   * - handleSort: dipanggil ketika header kolom di-klik.
   * - renderSortIcon: menampilkan icon ⇅ / ↑ / ↓ di header.
   */

  const handleSort = (field: 'date' | 'product' | 'customer' | 'apeIdr') => {
    // Jika klik kolom yang sama → toggle naik/turun
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Jika klik kolom baru → set field baru, default asc
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: 'date' | 'product' | 'customer' | 'apeIdr') => {
    if (sortBy !== field) return <span className="opacity-30 text-[10px]">⇅</span>;
    return sortDirection === 'asc' ? (
      <span className="text-[10px]">↑</span>
    ) : (
      <span className="text-[10px]">↓</span>
    );
  };

  /**
   * ============================================================
   * D. SORTED PIPELINES
   * ============================================================
   *
   * - Data yang disort adalah "filteredPipelines" dari parent.
   * - Diurutkan berdasarkan state sortBy & sortDirection.
   * - useMemo dipakai agar tidak menghitung ulang terus menerus
   *   ketika tidak ada perubahan yang relevan.
   */
  const sortedPipelines = useMemo(() => {
    const rows = [...filteredPipelines];

    rows.sort((a, b) => {
      let cmp = 0;

      if (sortBy === 'date') {
        // Jika pipeline_date null, treat sebagai string kosong
        const da = a.pipeline_date ?? '';
        const db = b.pipeline_date ?? '';
        cmp = da.localeCompare(db);
      } else if (sortBy === 'product') {
        const pa = getProductName(a.product_id);
        const pb = getProductName(b.product_id);
        cmp = pa.localeCompare(pb);
      } else if (sortBy === 'customer') {
        cmp = a.customer_name.localeCompare(b.customer_name);
      } else if (sortBy === 'apeIdr') {
        const va = a.ape_idr ?? 0;
        const vb = b.ape_idr ?? 0;
        cmp = va - vb;
      }

      // Aplikasikan direction (asc / desc)
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [filteredPipelines, sortBy, sortDirection, getProductName]);

  /**
   * ============================================================
   * E. COPY WA (SEMUA DATA TERFILTER)
   * ============================================================
   *
   * - Dipanggil ketika user klik tombol "Copy WA (filter)" di toolbar.
   * - Menggabungkan semua baris (sortedPipelines) menjadi 1 pesan WhatsApp,
   *   dengan format ringkas per baris (via buildWhatsAppLineShort).
   */

  const handleCopyAllWA = () => {
    if (sortedPipelines.length === 0) {
      alert('Tidak ada data pipeline untuk disalin (periksa filter).');
      return;
    }

    const lines = sortedPipelines.map((row, index) => {
      const pName = getProductName(row.product_id);
      const mName = getMarketerName(row.marketer_id);
      const line = buildWhatsAppLineShort(row, pName, mName);
      return `${index + 1}. ${line}`;
    });

    const header = `🔥 PIPELINE REPORT (Terfilter)\nTotal: ${sortedPipelines.length} data\n`;
    const message = header + '\n' + lines.join('\n');

    navigator.clipboard.writeText(message);
    alert('Rekap pipeline (sesuai filter) sudah disalin. Tinggal paste di WhatsApp.');
  };

  /**
   * ============================================================
   * F. RESET SORT
   * ============================================================
   *
   * - Mengembalikan urutan sort ke default:
   *   - sortBy: 'date'
   *   - sortDirection: 'desc'
   *
   * Artinya: secara default data diurutkan dari tanggal terbaru.
   */

  const handleResetSort = () => {
    setSortBy('date');
    setSortDirection('desc');
  };

  /**
   * ============================================================
   * G. FORMATTER UNTUK NOMINAL
   * ============================================================
   */

  const formatIdr = (value: number | null) =>
    value != null ? 'Rp ' + value.toLocaleString('id-ID') : '-';

  const formatUsd = (value: number | null) =>
    value != null ? '$' + value.toLocaleString('en-US') : '-';

  /**
   * ============================================================
   * H. LOADING STATE
   * ============================================================
   * Menampilkan skeleton placeholder ketika data masih dimuat.
   */

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-slate-100 rounded" />
          <div className="h-8 w-full bg-slate-100 rounded" />
          <div className="h-32 w-full bg-slate-100 rounded" />
        </div>
      </section>
    );
  }

  // Format tanggal jadi dd/MM/yyyy (atau "-" kalau kosong)
const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID');
};

const prettyStatus = (status?: string | null) => {
  if (!status) return '-';
  switch (status) {
    case 'prospecting':
      return 'Prospecting';
    case 'approach':
      return 'Approach';
    case 'presentation':
      return 'Presentation';
    case 'follow_up':
      return 'Follow up';
    case 'negotiation':
      return 'Negotiation';
    case 'closing':
      return 'Closing';
    case 'closed_lost':
      return 'Closed lost';
    default:
      return status;
  }
};

const prettyLeadSource = (source?: string | null) => {
  if (!source) return '-';
  switch (source) {
    case 'referral':
      return 'Referral';
    case 'bank':
      return 'Bank';
    case 'digital_ads':
      return 'Digital ads';
    case 'walk_in':
      return 'Walk-in';
    case 'agent_referral':
      return 'Agent referral';
    case 'existing_customer':
      return 'Existing customer';
    default:
      return source;
  }
};


  /**
   * ============================================================
   * I. MAIN RENDER: TOOLBAR + TABLE
   * ============================================================
   */

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      {/* ======================================================
          1. TOOLBAR: FILTER + ACTION BUTTONS
         ====================================================== */}
      {/* <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between"> */}
        {/* -----------------------------
            BAGIAN KIRI: CLUSTER FILTER
           ----------------------------- */}
        {/* <div className="flex flex-wrap gap-2">
          <div className="inline-flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-2 py-1"> */}
            {/* Label kecil "Filter" */}
            {/* <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>🔍</span>
              <span>Filter</span>
            </span> */}

            {/* Filter Produk */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
            >
              <option value="all">Semua produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <span className="h-3 w-px bg-slate-200" /> */}

            {/* Filter Plan (week 1–4) */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="all">Semua plan</option>
              <option value="week 1">week 1</option>
              <option value="week 2">week 2</option>
              <option value="week 3">week 3</option>
              <option value="week 4">week 4</option>
            </select>

            <span className="h-3 w-px bg-slate-200" /> */}

            {/* Filter Quadrant (k1–k4) */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterQuadrant}
              onChange={(e) => setFilterQuadrant(e.target.value)}
            >
              <option value="all">Semua quadrant</option>
              <option value="k1">k1</option>
              <option value="k2">k2</option>
              <option value="k3">k3</option>
              <option value="k4">k4</option>
            </select>

            <span className="h-3 w-px bg-slate-200" /> */}

            {/* Filter Marketer */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterMarketerId}
              onChange={(e) => setFilterMarketerId(e.target.value)}
            >
              <option value="all">Semua marketer</option>
              {marketers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <span className="h-3 w-px bg-slate-200" /> */}

            {/* Filter Prioritas */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">Semua prioritas</option>
              <option value="prio">Prioritas saja</option>
              <option value="nonprio">Non-prioritas</option>
            </select>

            <span className="h-3 w-px bg-slate-200" /> */}

            {/* Filter Status */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua status</option>
              <option value="prospecting">Prospecting</option>
              <option value="approach">Approach</option>
              <option value="presentation">Presentation</option>
              <option value="follow_up">Follow up</option>
              <option value="negotiation">Negotiation</option>
              <option value="closing">Closing</option>
              <option value="closed_lost">Closed lost</option>
            </select>
                        
            <span className="h-3 w-px bg-slate-200" /> */}
                        
            {/* Filter Lead source */}
            {/* <select
              className="border-0 bg-transparent text-[11px] text-slate-800 focus:outline-none"
              value={filterLeadSource}
              onChange={(e) => setFilterLeadSource(e.target.value)}
            >
              <option value="all">Semua sumber</option>
              <option value="referral">Referral</option>
              <option value="bank">Bank</option>
              <option value="digital_ads">Digital ads</option>
              <option value="walk_in">Walk-in</option>
              <option value="agent_referral">Agent referral</option>
              <option value="existing_customer">Existing customer</option>
            </select> */}
                        
          {/* </div>
        </div> */}

        {/* -----------------------------
            BAGIAN KANAN: BUTTON ACTION
           ----------------------------- */}
        {/* <div className="flex flex-wrap items-center gap-2"> */}
          {/* Reset filter: kembalikan semua filter ke default */}
          {/* <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            ⟳ Reset filter
          </button> */}

          {/* Reset sort: kembalikan sortBy & sortDirection */}
          {/* <button
            type="button"
            onClick={handleResetSort}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            ⇅ Reset sort
          </button> */}

          {/* Export Excel */}
          {/* <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            ⬇️ Export Excel
          </button> */}

          {/* Copy WA semua data terfilter */}
          {/* <button
            type="button"
            onClick={handleCopyAllWA}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            📲 Copy WA (filter)
          </button>
        </div>
      </div> */}

            {/* ======================================================
          1. TOOLBAR: FILTER + ACTION BUTTONS (layout baru)
         ====================================================== */}
      <div className="mb-4 space-y-3">
        {/* BARIS ATAS: TITLE FILTER + ACTION BUTTONS */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Kiri: label filter */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5">
            <span>🔍</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-medium text-slate-700">
                Filter data pipeline
              </span>
              <span className="text-[10px] text-slate-500">
                Sesuaikan produk, plan, marketer, prioritas, dll.
              </span>
            </div>
          </div>

          {/* Kanan: tombol aksi global */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
            >
              ⟳ Reset filter
            </button>

            <button
              type="button"
              onClick={handleResetSort}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
            >
              ⇅ Reset sort
            </button>

            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
            >
              ⬇️ Export Excel
            </button>

            <button
              type="button"
              onClick={handleCopyAllWA}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
            >
              📲 Copy WA (filter)
            </button>
          </div>
        </div>

        {/* BARIS BAWAH: GRID FILTER INPUT */}
        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Produk */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Produk
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
            >
              <option value="all">Semua produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plan (week) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Plan (week)
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="all">Semua plan</option>
              <option value="week 1">week 1</option>
              <option value="week 2">week 2</option>
              <option value="week 3">week 3</option>
              <option value="week 4">week 4</option>
            </select>
          </div>

          {/* Quadrant */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Quadrant
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterQuadrant}
              onChange={(e) => setFilterQuadrant(e.target.value)}
            >
              <option value="all">Semua quadrant</option>
              <option value="k1">k1</option>
              <option value="k2">k2</option>
              <option value="k3">k3</option>
              <option value="k4">k4</option>
            </select>
          </div>

          {/* Marketer */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Marketer
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterMarketerId}
              onChange={(e) => setFilterMarketerId(e.target.value)}
            >
              <option value="all">Semua marketer</option>
              {marketers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prioritas */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Prioritas
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">Semua prioritas</option>
              <option value="prio">Prioritas saja</option>
              <option value="nonprio">Non-prioritas</option>
            </select>
          </div>

          {/* Status (opsional – kalau nanti mau pakai) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua status</option>
              <option value="prospecting">Prospecting</option>
              <option value="approach">Approach</option>
              <option value="presentation">Presentation</option>
              <option value="follow_up">Follow up</option>
              <option value="negotiation">Negotiation</option>
              <option value="closing">Closing</option>
              <option value="closed_lost">Closed lost</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-600">
              Source
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={filterLeadSource}
              onChange={(e) => setFilterLeadSource(e.target.value)}
            >
              <option value="all">Semua source</option>
              <option value="referral">Referral</option>
              <option value="bank">Bank</option>
              <option value="digital_ads">Digital ads</option>
              <option value="walk_in">Walk-in</option>
              <option value="agent_referral">Agent referral</option>
              <option value="existing_customer">Existing customer</option>
            </select>
          </div>
        </div>
      </div>


      {/* ======================================================
          2. TABLE WRAPPER (OVERFLOW-X UNTUK KOLOM BANYAK)
         ====================================================== */}
      <div className="relative">
        <div className="overflow-x-auto">
          {/* 
            min-w-[1200px] memastikan tabel melebar sehingga
            tidak terlalu "ngepres" jika kolom banyak.
           */}
          <table className="min-w-[1200px] w-full text-[11px] text-left">
            {/* ------------------------------------------
                HEADER TABLE
               ------------------------------------------ */}
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 py-2 text-slate-500">No</th>

                {/* Kolom Produk dengan sorting */}
                <th
                  className="px-2 py-2 text-slate-500 cursor-pointer"
                  onClick={() => handleSort('product')}
                >
                  <div className="flex items-center gap-1">
                    <span>Produk</span>
                    {renderSortIcon('product')}
                  </div>
                </th>

                {/* Kolom Nasabah dengan sorting */}
                <th
                  className="px-2 py-2 text-slate-500 cursor-pointer"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    <span>Nasabah</span>
                    {renderSortIcon('customer')}
                  </div>
                </th>

                {/* Kolom Marketer / Branch / Class */}
                <th className="px-2 py-2 text-slate-500">
                  Marketer / Branch / Class
                </th>

                {/* Kolom APE IDR / USD dengan sorting */}
                <th
                  className="px-2 py-2 text-slate-500 cursor-pointer"
                  onClick={() => handleSort('apeIdr')}
                >
                  <div className="flex items-center gap-1">
                    <span>APE IDR / USD</span>
                    {renderSortIcon('apeIdr')}
                  </div>
                </th>

                {/* Kolom Plan / Quadrant / Tanggal */}
                <th className="px-2 py-2 text-slate-500">
                  Plan / Quadrant
                </th>

                {/* Kolom Prioritas */}
                <th className="px-2 py-2 text-slate-500">Prioritas</th>

                {/* Kolom Remarks (keterangan) */}
                <th className="px-2 py-2 text-slate-500">Remarks</th>

                {/* Kolom Action sticky di kanan */}
                <th className="px-2 py-2 text-slate-500 sticky right-0 bg-slate-50">
                  Action
                </th>
              </tr>
            </thead>

            {/* ------------------------------------------
                BODY TABLE
               ------------------------------------------ */}
            <tbody>
              {/* Jika tidak ada data setelah filter */}
              {sortedPipelines.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-2 py-4 text-center text-[11px] text-slate-500"
                  >
                    Tidak ada data pipeline untuk kombinasi filter ini.
                  </td>
                </tr>
              ) : (
                sortedPipelines.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60"
                  >
                    {/* Nomor urut */}
                    <td className="px-2 py-2 align-top text-slate-500">
                      {index + 1}
                    </td>

                    {/* Produk */}
                    <td className="px-2 py-2 align-top text-slate-800">
                      {getProductName(row.product_id)}
                    </td>

                    {/* Nasabah + tanggal pipeline kecil di bawah */}
                    <td className="align-top px-3 py-2 text-xs">
                      <div className="flex flex-col">
                        {/* Baris 1: Nama nasabah */}
                        <span className="font-medium text-slate-900">
                          {row.customer_name}
                        </span>

                        {/* Baris 2: Tanggal pipeline */}
                        <span className="text-[11px] text-slate-500">
                          Pipeline: {formatDate(row.pipeline_date)}
                        </span>

                        {/* Baris 3: Status + lead source */}
                        <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-slate-500">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-px">
                            Status: {prettyStatus(row.status)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-px">
                            Source: {prettyLeadSource(row.lead_source)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Marketer / Branch / Class */}
                    <td className="px-2 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900">
                          {getMarketerName(row.marketer_id)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {getMarketerBranch(row.marketer_id)}
                        </span>
                        {row.class && (
                          <span className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                            Class {row.class}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* APE IDR / USD */}
                    <td className="px-2 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900">
                          {formatIdr(row.ape_idr)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatUsd(row.ape_usd)}
                        </span>
                      </div>
                    </td>

                    {/* Plan / Quadrant */}
                    <td className="align-top px-3 py-2 text-xs">
                      {/* Baris 1: Plan + Quadrant seperti sekarang */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px]">
                          {row.execution_plan || '-'}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px]">
                          {row.quadrant || '-'}
                        </span>
                      </div>

                      {/* Baris 2: Expected closing */}
                      <div className="text-[11px] text-slate-500">
                        Expected closing:{' '}
                        <span className="font-medium text-slate-700">
                          {formatDate(row.expected_closing_date)}
                        </span>
                      </div>

                      {/* Baris 3: Last contact */}
                      <div className="text-[11px] text-slate-500">
                        Last contact:{' '}
                        <span className="font-medium text-slate-700">
                          {formatDate(row.last_contact_date)}
                        </span>
                      </div>
                    </td>

                    {/* Prioritas */}
                    <td className="px-2 py-2 align-top">
                      {row.priority_flag ? (
                        <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          PRIORITAS
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    {/* Remarks / Keterangan */}
                    <td className="align-top px-3 py-2 text-xs">
                      {/* Baris 1: Remarks utama */}
                      <div className="text-slate-800">
                        {row.remarks ?? '-'}
                      </div>

                      {/* Baris 2: Next action */}
                      {/* {row.next_action && ( */}
                        <div className="mt-1 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-700">Next:</span>{' '}
                          {row.next_action ?? '-'}
                        </div>
                      {/* )} */}

                      {/* Baris 3: Risk / Objection */}
                      {/* {row.risk_tag && ( */}
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-700">Risk:</span>{' '}
                          {row.risk_tag ?? '-'}
                        </div>
                      {/* )} */}
                    </td>

                    {/* ACTIONS (sticky di sisi kanan) */}
                    <td className="px-2 py-2 align-top sticky right-0 bg-white">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => openDetailModal(row)}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] hover:bg-slate-50"
                          title="Lihat detail"
                        >
                          🔍 Detail
                        </button>

                        <button
                          type="button"
                          onClick={() => onCopyWARow(row)}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] hover:bg-slate-50"
                          title="Copy ringkas WA"
                        >
                          📋 Copy
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditRow(row)}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] hover:bg-slate-50"
                          title="Edit cepat"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteRow(row)}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-2 py-1 text-[10px] text-red-700 hover:bg-red-50"
                          title="Hapus"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

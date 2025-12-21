'use client';

import { FormEvent, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import {
  PipelineSummary,
  PipelineForm,
  PipelineTable,
  PipelineDetailModal,
  usePipelineFilters,
  useProducts,
  useMarketers,
  usePipelines,
  usePipelineCreateForm,
  usePipelineEditing,
  usePipelinesRealtimePatch
} from '@/features/pipeline';

import { PipelineRow } from '@/types/pipeline';
import { buildWhatsAppMessage } from '@/utils/whatsapp';
import { useAuthUser } from '@/app/dashboard/hooks/useAuthUser';
import DateRangePicker, { DateRangeValue } from '@/features/pipeline/components/DateRangePicker';
import Toast from '@/app/dashboard/components/Toast';
import PipelineHeader from '@/app/dashboard/components/PipelineHeader';

function formatDateLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PipelinePage() {
  // 1. AUTH: user info & logout
  const { loadingUser, userEmail, userId, logout } = useAuthUser();

  // 2. DATA: Master & pipelines (via hook)
  const { products, loadingProducts } = useProducts();
  const { marketers, loadingMarketers } = useMarketers();
  const { pipelines, setPipelines, loadingPipelines, reloadPipelines } = usePipelines(userId);
  usePipelinesRealtimePatch({ userId, setPipelines });

  const loadingData = loadingProducts || loadingMarketers || loadingPipelines;

    // Toast kecil untuk notifikasi
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // 3a. STATE: Modal create pipeline (tambah baru)
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 3b. STATE: Modal detail & edit pipeline
  const {
    selectedPipeline,
    showDetailModal,
    editMode,
    editForm,
    savingEdit,
    editError,
    deleting,
    openDetailModal,
    closeDetailModal,
    startEdit,
    cancelEdit,
    setEditForm,
    handleSaveEdit,
    handleDelete,
    handleEditFromTable,
    handleDeleteFromTable,
  } = usePipelineEditing({
    userId,
    reloadPipelines,
    setPipelines,
  });

  // 4. STATE: Filter list pipeline (hook)
  const {
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
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,

    filteredPipelines,
    totalApeIdr,
    totalApeUsd,
    resetFilters,
  } = usePipelineFilters(pipelines);

  // 5. STATE + LOGIC: Form create pipeline (via hook)
  const {
    productId,
    setProductId,
    customerName,
    setCustomerName,
    marketerId,
    setMarketerId,
    branch,
    setBranch,
    customerClass,
    setCustomerClass,
    apeIdr,
    setApeIdr,
    apeUsd,
    setApeUsd,
    executionPlan,
    setExecutionPlan,
    quadrant,
    setQuadrant,
    pipelineDate,
    setPipelineDate,
    remarks,
    setRemarks,
    priorityFlag,
    setPriorityFlag,
    status,
    setStatus,
    leadSource,
    setLeadSource,
    expectedClosingDate,
    setExpectedClosingDate,
    lastContactDate,
    setLastContactDate,
    nextAction,
    setNextAction,
    riskTag,
    setRiskTag,
    saving,
    formError,
    resetForm,
    handleSubmit,
  } = usePipelineCreateForm({ userId, reloadPipelines });

  // Wrapper submit untuk menghubungkan logic hook dengan UI (toast + modal)
  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const ok = await handleSubmit(e);
    if (ok) {
      showToast('Pipeline baru berhasil disimpan.', 'success');
      setShowCreateModal(false);
    }
  };

  // Helper nama produk & marketer dari id (untuk export + WA)
  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p: { id?: string; name?: string | null }) => {
      if (p?.id) map[p.id] = p.name ?? '';
    });
    return map;
  }, [products]);

  const marketerMap = useMemo(() => {
    const map: Record<string, string> = {};
    marketers.forEach((m: { id?: string; name?: string | null }) => {
      if (m?.id) map[m.id] = m.name ?? '';
    });
    return map;
  }, [marketers]);

  const getProductName = (productId: string) => productMap[productId] ?? '-';
  const getMarketerName = (marketerId: string | null) => (marketerId ? marketerMap[marketerId] ?? '-' : '-');

  // Export ke Excel
  const exportExcel = () => {
    if (filteredPipelines.length === 0) {
      alert('Tidak ada data pipeline untuk diexport (periksa filter).');
      return;
    }

    const rows = filteredPipelines.map((row, index) => ({
      NO: index + 1,
      PRODUK: getProductName(row.product_id),
      NASABAH: row.customer_name,
      BRANCH: row.branch ?? '',
      CLASS: row.class ?? '',
      MARKETER: getMarketerName(row.marketer_id),
      'APE IDR': row.ape_idr ?? 0,
      'APE USD': row.ape_usd ?? 0,
      PLAN: row.execution_plan ?? '',
      QUADRANT: row.quadrant ?? '',
      TANGGAL_PIPELINE: row.pipeline_date ?? '',
      STATUS: row.status ?? '',
      LEADSOURCE: row.lead_source ?? '',
      EXPECTED_CLOSING: row.expected_closing_date ?? '',
      LAST_CONTACT: row.last_contact_date ?? '',
      NEXT_ACTION: row.next_action ?? '',
      RISK_TAG: row.risk_tag ?? '',
      PRIORITAS: row.priority_flag ? 'YES' : '',
      REMARKS: row.remarks ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pipeline');

    const safeEmail =
      (userEmail ?? 'user')
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_-]/g, '') || 'user';

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `pipeline-${safeEmail}-${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // Modal create
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => setShowCreateModal(false);

  // Copy WhatsApp
  const copyToWhatsApp = () => {
    if (!selectedPipeline) return;

    const product = getProductName(selectedPipeline.product_id);
    const marketer = getMarketerName(selectedPipeline.marketer_id);

    const msg = buildWhatsAppMessage(selectedPipeline, product, marketer, 'full');
    navigator.clipboard.writeText(msg);
    showToast('Pesan pipeline (full) sudah disalin.', 'success');
  };

  const copyShortFromTable = (row: PipelineRow) => {
    const product = getProductName(row.product_id);
    const marketer = getMarketerName(row.marketer_id);
    const message = buildWhatsAppMessage(row, product, marketer, 'short');

    navigator.clipboard.writeText(message);
    showToast('Pesan pipeline (ringkas) sudah disalin.', 'success');
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PipelineHeader userEmail={userEmail} onLogout={logout} />

      <main className="mx-auto max-w-6xl px-4 py-5">
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur">
            <PipelineSummary
              totalCount={filteredPipelines.length}
              totalApeIdr={totalApeIdr}
              totalApeUsd={totalApeUsd}
              loading={loadingData}
            />
          </section>

          <section className="space-y-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Data pipeline</h2>
                <p className="text-[11px] text-slate-500">
                  Kelola pipeline harian, filter, dan export laporan untuk atasan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DateRangePicker
                  key={`${datePreset}-${customStartDate}-${customEndDate}`}
                  value={{
                    preset: datePreset,
                    startDate: customStartDate ? new Date(customStartDate + 'T00:00:00') : null,
                    endDate: customEndDate ? new Date(customEndDate + 'T00:00:00') : null,
                  }}
                  onChange={(next: DateRangeValue) => {
                    setDatePreset(next.preset);
                    setCustomStartDate(next.startDate ? formatDateLocalYYYYMMDD(next.startDate) : '');
                    setCustomEndDate(next.endDate ? formatDateLocalYYYYMMDD(next.endDate) : '');
                  }}
                />

                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <span className="text-base leading-none">＋</span>
                  <span>Tambah pipeline</span>
                </button>
              </div>
            </div>

            <PipelineTable
              filteredPipelines={filteredPipelines}
              products={products}
              marketers={marketers}
              loading={loadingData}
              filterProductId={filterProductId}
              setFilterProductId={setFilterProductId}
              filterPlan={filterPlan}
              setFilterPlan={setFilterPlan}
              filterQuadrant={filterQuadrant}
              setFilterQuadrant={setFilterQuadrant}
              filterMarketerId={filterMarketerId}
              setFilterMarketerId={setFilterMarketerId}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterLeadSource={filterLeadSource}
              setFilterLeadSource={setFilterLeadSource}
              datePreset={datePreset}
              setDatePreset={setDatePreset}
              exportExcel={exportExcel}
              openDetailModal={openDetailModal}
              onEditRow={handleEditFromTable}
              onDeleteRow={handleDeleteFromTable}
              onCopyWARow={copyShortFromTable}
              onResetFilters={resetFilters}
            />
          </section>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl md:p-5 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Tambah pipeline baru</h3>
                <p className="text-[11px] text-slate-500">
                  Lengkapi data sesuai format laporan (produk, marketer, APE, kuadran, dll).
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="text-[11px] text-slate-400 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>

            <div className="mt-2">
              <PipelineForm
                products={products}
                marketers={marketers}
                formError={formError}
                saving={saving}
                productId={productId}
                setProductId={setProductId}
                customerName={customerName}
                setCustomerName={setCustomerName}
                marketerId={marketerId}
                setMarketerId={setMarketerId}
                branch={branch}
                setBranch={setBranch}
                customerClass={customerClass}
                setCustomerClass={setCustomerClass}
                apeIdr={apeIdr}
                setApeIdr={setApeIdr}
                apeUsd={apeUsd}
                setApeUsd={setApeUsd}
                executionPlan={executionPlan}
                setExecutionPlan={setExecutionPlan}
                quadrant={quadrant}
                setQuadrant={setQuadrant}
                pipelineDate={pipelineDate}
                setPipelineDate={setPipelineDate}
                remarks={remarks}
                setRemarks={setRemarks}
                priorityFlag={priorityFlag}
                setPriorityFlag={setPriorityFlag}
                onSubmit={handleCreateSubmit}
                status={status}
                setStatus={setStatus}
                leadSource={leadSource}
                setLeadSource={setLeadSource}
                expectedClosingDate={expectedClosingDate}
                setExpectedClosingDate={setExpectedClosingDate}
                lastContactDate={lastContactDate}
                setLastContactDate={setLastContactDate}
                nextAction={nextAction}
                setNextAction={setNextAction}
                riskTag={riskTag}
                setRiskTag={setRiskTag}
              />
            </div>
          </div>
        </div>
      )}

      <PipelineDetailModal
        open={showDetailModal}
        pipeline={selectedPipeline}
        products={products}
        marketers={marketers}
        editMode={editMode}
        editForm={editForm}
        editError={editError}
        savingEdit={savingEdit}
        deleting={deleting}
        onClose={closeDetailModal}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        setEditForm={setEditForm}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onCopyWA={copyToWhatsApp}
      />

      <Toast toast={toast} />
    </div>
  );
}

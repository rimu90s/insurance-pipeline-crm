'use client';

import { useState, FormEvent } from 'react';
import * as XLSX from 'xlsx';

import {
  PipelineSummary,
  PipelineForm,
  PipelineTable,
  PipelineDetailModal,
  usePipelineData,
  usePipelineFilters,
} from '@/features/pipeline';

import { supabase } from '@/lib/supabaseClient';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';
import { buildWhatsAppMessage } from '@/utils/whatsapp';
import { useAuthUser } from '../hooks/useAuthUser';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';


// ──────────────────────────────────────────────────────────────
//  Halaman utama Dashboard
// ──────────────────────────────────────────────────────────────

export default function PipelinePage() {
  // 1. AUTH: user info & logout
  const { loadingUser, userEmail, userId, logout } = useAuthUser();

  // 2. DATA: Master & pipelines (via hook)
  const {
    products,
    marketers,
    pipelines,
    setPipelines,
    loadingData,
    reloadPipelines,
  } = usePipelineData(userId);

  // 3a. STATE: Modal create pipeline (tambah baru)
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 3b. STATE: Modal detail & edit pipeline
  const [selectedPipeline, setSelectedPipeline] =
    useState<PipelineRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<PipelineEditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    filteredPipelines,
    totalApeIdr,
    totalApeUsd,
    resetFilters,
  } = usePipelineFilters(pipelines);

  // 5. STATE: Form create pipeline (dipass ke PipelineForm)
  const [productId, setProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [marketerId, setMarketerId] = useState('');
  const [branch, setBranch] = useState('');
  const [customerClass, setCustomerClass] = useState('');
  const [apeIdr, setApeIdr] = useState('');
  const [apeUsd, setApeUsd] = useState('');
  const [executionPlan, setExecutionPlan] = useState('week 1');
  const [quadrant, setQuadrant] = useState('k1');
  const [remarks, setRemarks] = useState('');
  const [priorityFlag, setPriorityFlag] = useState(false);
  const [pipelineDate, setPipelineDate] = useState<string>('');

  // field tambahan (status, lead source, dll)
  const [status, setStatus] = useState<string>('prospecting');
  const [leadSource, setLeadSource] = useState<string>('referral');
  const [expectedClosingDate, setExpectedClosingDate] =
    useState<string>(''); // YYYY-MM-DD
  const [lastContactDate, setLastContactDate] = useState<string>(''); // YYYY-MM-DD
  const [nextAction, setNextAction] = useState<string>('');
  const [riskTag, setRiskTag] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast kecil untuk notifikasi
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ──────────────────────────────────────────────────────────
  //  UTIL: Reset form create pipeline
  // ──────────────────────────────────────────────────────────

  const resetForm = () => {
    setProductId('');
    setCustomerName('');
    setMarketerId('');
    setBranch('');
    setCustomerClass('');
    setApeIdr('');
    setApeUsd('');
    setExecutionPlan('week 1');
    setQuadrant('k1');
    setRemarks('');
    setPriorityFlag(false);
    setPipelineDate('');
    setFormError(null);

    setStatus('prospecting');
    setLeadSource('referral');
    setExpectedClosingDate('');
    setLastContactDate('');
    setNextAction('');
    setRiskTag('');
  };

  // ──────────────────────────────────────────────────────────
  //  HANDLER: Submit form create pipeline
  // ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError('User tidak valid. Silakan login ulang.');
      return;
    }

    if (!productId || !customerName) {
      setFormError('Produk dan nama nasabah wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      const parsedApeIdr = apeIdr ? parseFloat(apeIdr.replace(/,/g, '')) : 0;
      const parsedApeUsd = apeUsd ? parseFloat(apeUsd.replace(/,/g, '')) : 0;

      const { error } = await supabase.from('pipelines').insert({
        owner_id: userId,
        product_id: productId,
        marketer_id: marketerId || null,
        customer_name: customerName,
        branch: branch || null,
        class: customerClass || null,
        ape_idr: parsedApeIdr,
        ape_usd: parsedApeUsd,
        execution_plan: executionPlan,
        quadrant: quadrant,
        remarks: remarks || null,
        priority_flag: priorityFlag,
        pipeline_date: pipelineDate || null,
        status: status || 'prospecting',
        lead_source: leadSource || 'referral',
        expected_closing_date: expectedClosingDate || null,
        last_contact_date: lastContactDate || null,
        next_action: nextAction || null,
        risk_tag: riskTag || null,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      // reload pipelines setelah insert
      await reloadPipelines();

      resetForm();
      showToast('Pipeline baru berhasil disimpan.', 'success');
      setShowCreateModal(false);
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  //  UTIL: Helper nama produk & marketer dari id
  // ──────────────────────────────────────────────────────────

  const getProductName = (product_id: string) => {
    const product = products.find((prod) => prod.id === product_id);
    return product ? product.name : '-';
  };

  const getMarketerName = (marketer_id: string | null) => {
    if (!marketer_id) return '-';
    const marketer = marketers.find((mk) => mk.id === marketer_id);
    return marketer ? marketer.name : '-';
  };

  // ──────────────────────────────────────────────────────────
  //  HANDLER: Export ke Excel
  // ──────────────────────────────────────────────────────────

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
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `pipeline-${safeEmail}-${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // ──────────────────────────────────────────────────────────
  //  HANDLER: Modal create
  // ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  // ──────────────────────────────────────────────────────────
  //  HANDLER: Modal detail (open / close / edit / delete)
  // ──────────────────────────────────────────────────────────

  const openDetailModal = (row: PipelineRow) => {
    setSelectedPipeline(row);
    setShowDetailModal(true);
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPipeline(null);
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const startEdit = () => {
    if (!selectedPipeline) return;

    setEditMode(true);
    setEditError(null);

    setEditForm({
      product_id: selectedPipeline.product_id,
      marketer_id: selectedPipeline.marketer_id ?? '',
      customer_name: selectedPipeline.customer_name,
      branch: selectedPipeline.branch ?? '',
      class: selectedPipeline.class ?? '',
      ape_idr: selectedPipeline.ape_idr
        ? String(selectedPipeline.ape_idr)
        : '',
      ape_usd: selectedPipeline.ape_usd
        ? String(selectedPipeline.ape_usd)
        : '',
      execution_plan: selectedPipeline.execution_plan ?? 'week 1',
      quadrant: selectedPipeline.quadrant ?? 'k1',
      remarks: selectedPipeline.remarks ?? '',
      priority_flag: !!selectedPipeline.priority_flag,
      pipeline_date: selectedPipeline.pipeline_date ?? '',
      status: selectedPipeline.status ?? 'prospecting',
      lead_source: selectedPipeline.lead_source ?? 'referral',
      expected_closing_date:
        selectedPipeline.expected_closing_date ?? '',
      last_contact_date: selectedPipeline.last_contact_date ?? '',
      next_action: selectedPipeline.next_action ?? '',
      risk_tag: selectedPipeline.risk_tag ?? '',
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedPipeline || !editForm || !userId) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const parsedApeIdr = editForm.ape_idr
        ? parseFloat(editForm.ape_idr.replace(/,/g, ''))
        : 0;
      const parsedApeUsd = editForm.ape_usd
        ? parseFloat(editForm.ape_usd.replace(/,/g, ''))
        : 0;

      const { error } = await supabase
        .from('pipelines')
        .update({
          product_id: editForm.product_id,
          marketer_id: editForm.marketer_id || null,
          customer_name: editForm.customer_name,
          branch: editForm.branch || null,
          class: editForm.class || null,
          ape_idr: parsedApeIdr,
          ape_usd: parsedApeUsd,
          execution_plan: editForm.execution_plan,
          quadrant: editForm.quadrant,
          remarks: editForm.remarks || null,
          priority_flag: editForm.priority_flag,
          pipeline_date: editForm.pipeline_date || null,
          status: editForm.status || 'prospecting',
          lead_source: editForm.lead_source || 'referral',
          expected_closing_date:
            editForm.expected_closing_date || null,
          last_contact_date: editForm.last_contact_date || null,
          next_action: editForm.next_action || null,
          risk_tag: editForm.risk_tag || null,
        })
        .eq('id', selectedPipeline.id)
        .eq('owner_id', userId);

      if (error) {
        setEditError(error.message);
        return;
      }

      // reload pipelines setelah update
      await reloadPipelines();

      closeDetailModal();
      showToast('Perubahan berhasil disimpan.', 'success');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPipeline) return;

    const ok = window.confirm(
      `Yakin ingin menghapus pipeline untuk nasabah "${selectedPipeline.customer_name}"?`
    );
    if (!ok) return;

    setDeleting(true);
    setEditError(null);

    try {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', selectedPipeline.id);

      if (error) {
        setEditError(error.message);
        return;
      }

      setPipelines((prev) =>
        prev.filter((row) => row.id !== selectedPipeline.id)
      );

      closeDetailModal();
    } finally {
      setDeleting(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  //  HANDLER: Copy WA
  // ──────────────────────────────────────────────────────────

  const copyToWhatsApp = () => {
    if (!selectedPipeline) return;

    const product = getProductName(selectedPipeline.product_id);
    const marketer = getMarketerName(selectedPipeline.marketer_id);

    const msg = buildWhatsAppMessage(
      selectedPipeline,
      product,
      marketer,
      'full'
    );

    navigator.clipboard.writeText(msg);
    showToast('Pesan pipeline (full) sudah disalin.', 'success');
  };

  const copyShortFromTable = (row: PipelineRow) => {
    const product = getProductName(row.product_id);
    const marketer = getMarketerName(row.marketer_id);

    const message = buildWhatsAppMessage(
      row,
      product,
      marketer,
      'short'
    );

    navigator.clipboard.writeText(message);
    showToast('Pesan pipeline (ringkas) sudah disalin.', 'success');
  };

  const handleEditFromTable = (row: PipelineRow) => {
    setSelectedPipeline(row);
    setShowDetailModal(true);
    setEditMode(true);
    setEditError(null);
    setEditForm({
      product_id: row.product_id,
      marketer_id: row.marketer_id ?? '',
      customer_name: row.customer_name,
      branch: row.branch ?? '',
      class: row.class ?? '',
      ape_idr: row.ape_idr ? String(row.ape_idr) : '',
      ape_usd: row.ape_usd ? String(row.ape_usd) : '',
      execution_plan: row.execution_plan ?? 'week 1',
      quadrant: row.quadrant ?? 'k1',
      remarks: row.remarks ?? '',
      priority_flag: !!row.priority_flag,
      pipeline_date: row.pipeline_date ?? '',
      status: row.status ?? 'prospecting',
      lead_source: row.lead_source ?? 'referral',
      expected_closing_date: row.expected_closing_date ?? '',
      last_contact_date: row.last_contact_date ?? '',
      next_action: row.next_action ?? '',
      risk_tag: row.risk_tag ?? '',
    });
  };

  const handleDeleteFromTable = async (row: PipelineRow) => {
    const ok = window.confirm(
      `Yakin ingin menghapus pipeline untuk nasabah "${row.customer_name}"?`
    );
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', row.id);

      if (error) {
        alert(error.message);
        return;
      }

      setPipelines((prev) => prev.filter((p) => p.id !== row.id));
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  // ──────────────────────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Brand + context */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-[11px] font-semibold tracking-tight text-white shadow-sm">
              SP
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-900">
                  Sales Pipeline CRM
                </h1>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-[2px] text-[10px] font-medium text-emerald-700">
                  Private beta
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Monitoring pipeline asuransi, APE, dan progres closing harian.
              </p>
            </div>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-slate-500">Masuk sebagai</p>
              <p className="max-w-[200px] truncate text-[11px] font-medium text-slate-800">
                {userEmail}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-5">
        <div className="space-y-5">
          {/* Summary cards */}
          <section className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur">
            <PipelineSummary
              totalCount={filteredPipelines.length}
              totalApeIdr={totalApeIdr}
              totalApeUsd={totalApeUsd}
              loading={loadingData}
            />
          </section>

          {/* Data table + actions */}
          <section className="space-y-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            {/* Section header */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Data pipeline
                </h2>
                <p className="text-[11px] text-slate-500">
                  Kelola pipeline harian, filter, dan export laporan untuk atasan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <span className="text-base leading-none">＋</span>
                  <span>Tambah pipeline</span>
                </button>
              </div>
            </div>

            {/* Table & filters */}
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

      {/* Modal create pipeline (tambah baru) */}
      {showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
    <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl md:p-5 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Tambah pipeline baru
          </h3>
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
          onSubmit={handleSubmit}
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


      {/* Modal detail / edit / delete / copy WA */}
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-xs text-white shadow-lg
            ${
              toast!.type === 'success'
                ? 'bg-emerald-600'
                : 'bg-red-600'
            }
          `}
        >
          {toast!.message}
        </div>
      )}
    </div>
  );
}

  

  

  


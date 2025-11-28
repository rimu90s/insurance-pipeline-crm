'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

import { supabase } from '@/lib/supabaseClient';
import PipelineSummary from './components/PipelineSummary';
import PipelineForm from './components/PipelineForm';
import PipelineTable from './components/PipelineTable';
import PipelineDetailModal from './components/PipelineDetailModal';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';

//
// ──────────────────────────────────────────────────────────────
//  Tipe lokal untuk data dropdown (produk & marketer)
// ──────────────────────────────────────────────────────────────
//

type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

//
// ──────────────────────────────────────────────────────────────
//  Halaman utama Dashboard
// ──────────────────────────────────────────────────────────────
//

export default function DashboardPage() {
  const router = useRouter();

  //
  // 1. STATE: Auth & user
  //    - cek user login
  //    - simpan email & id untuk owner_id dan nama file export
  //
  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  //
  // 2. STATE: Master data & pipelines
  //
  const [products, setProducts] = useState<Product[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);

  //
  // 3a. STATE: Modal create pipeline (tambah baru)
  //
  const [showCreateModal, setShowCreateModal] = useState(false);

  //
  // 3b. STATE: Modal detail & edit pipeline
  //
  const [selectedPipeline, setSelectedPipeline] =
    useState<PipelineRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<PipelineEditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  //
  // 4. STATE: Filter list pipeline
  //    - filterProductId & filterQuadrant dipakai di PipelineTable
  //
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [filterQuadrant, setFilterQuadrant] = useState<string>('all');

  //
  // 5. STATE: Form create pipeline (dipass ke PipelineForm)
  //
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

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  //
  // ──────────────────────────────────────────────────────────
  //  EFFECT 1: Cek user login (redirect ke /auth kalau belum login)
  // ──────────────────────────────────────────────────────────
  //
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/auth');
        return;
      }

      setUserEmail(data.user.email ?? null);
      setUserId(data.user.id);
      setLoadingUser(false);
    };

    init();
  }, [router]);

  //
  // ──────────────────────────────────────────────────────────
  //  EFFECT 2: Fetch products, marketers, dan pipelines
  //            setelah userId sudah diketahui
  // ──────────────────────────────────────────────────────────
  //
  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      const [
        { data: productsData },
        { data: marketersData },
        { data: pipelinesData },
      ] = await Promise.all([
        supabase.from('products').select('id, name').order('name'),
        supabase.from('marketers').select('id, name, branch').order('name'),
        supabase
          .from('pipelines')
          .select(
            `
            id,
            product_id,
            marketer_id,
            customer_name,
            branch,
            class,
            ape_idr,
            ape_usd,
            execution_plan,
            quadrant,
            remarks,
            priority_flag,
            pipeline_date
          `
          )
          .eq('owner_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      setProducts(productsData ?? []);
      setMarketers(marketersData ?? []);
      setPipelines((pipelinesData ?? []) as PipelineRow[]);
    };

    fetchAll();
  }, [userId]);

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Logout
  // ──────────────────────────────────────────────────────────
  //
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  //
  // ──────────────────────────────────────────────────────────
  //  UTIL: Reset form create pipeline
  // ──────────────────────────────────────────────────────────
  //
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
  };

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Submit form create pipeline
  //           - insert ke Supabase
  //           - reload data pipelines
  //           - reset form
  //           - tutup modal setelah sukses
  // ──────────────────────────────────────────────────────────
  //
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
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      // reload pipelines setelah insert
      const { data: pipelinesData } = await supabase
        .from('pipelines')
        .select(
          `
          id,
          product_id,
          marketer_id,
          customer_name,
          branch,
          class,
          ape_idr,
          ape_usd,
          execution_plan,
          quadrant,
          remarks,
          priority_flag,
          pipeline_date
        `
        )
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      setPipelines((pipelinesData ?? []) as PipelineRow[]);
      resetForm();
      setShowCreateModal(false); // auto-tutup modal setelah sukses
    } finally {
      setSaving(false);
    }
  };

  //
  // ──────────────────────────────────────────────────────────
  //  UTIL: Helper untuk ambil nama produk & marketer dari id
  // ──────────────────────────────────────────────────────────
  //
  const getProductName = (product_id: string) => {
    const product = products.find((prod) => prod.id === product_id);
    return product ? product.name : '-';
  };

  const getMarketerName = (marketer_id: string | null) => {
    if (!marketer_id) return '-';
    const marketer = marketers.find((mk) => mk.id === marketer_id);
    return marketer ? marketer.name : '-';
  };

  //
  // ──────────────────────────────────────────────────────────
  //  DERIVED STATE: filteredPipelines + total APE
  // ──────────────────────────────────────────────────────────
  //
  const filteredPipelines = pipelines.filter((row) => {
    const matchProduct =
      filterProductId === 'all' ? true : row.product_id === filterProductId;

    const matchQuadrant =
      filterQuadrant === 'all'
        ? true
        : (row.quadrant ?? '').toLowerCase() ===
          filterQuadrant.toLowerCase();

    return matchProduct && matchQuadrant;
  });

  const totalApeIdr = filteredPipelines.reduce(
    (acc, row) => acc + (row.ape_idr ?? 0),
    0
  );
  const totalApeUsd = filteredPipelines.reduce(
    (acc, row) => acc + (row.ape_usd ?? 0),
    0
  );

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Export ke Excel (format sesuai contoh klien)
  // ──────────────────────────────────────────────────────────
  //
  const exportExcel = () => {
    if (filteredPipelines.length === 0) {
      alert('Tidak ada data pipeline untuk diexport (periksa filter).');
      return;
    }

    const rows = filteredPipelines.map((row, index) => ({
      NO: index + 1,
      PRODUK: getProductName(row.product_id),
      BRANCH: row.branch ?? '',
      CLASS: row.class ?? '',
      NASABAH: row.customer_name,
      LG: getMarketerName(row.marketer_id),
      'APE IDR': row.ape_idr ?? 0,
      'APE USD': row.ape_usd ?? 0,
      'Eks. Plan': row.execution_plan ?? '',
      Kuadran: row.quadrant ?? '',
      REMARKS: row.remarks ?? '',
      PRIORITAS: row.priority_flag ? 'YES' : '',
      TANGGAL: row.pipeline_date ?? '',
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

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Modal create (buka / tutup)
  // ──────────────────────────────────────────────────────────
  //
  const openCreateModal = () => {
    resetForm();           // pastikan form bersih tiap kali buka modal
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Modal detail (open / close / edit / delete)
  // ──────────────────────────────────────────────────────────
  //
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
        })
        .eq('id', selectedPipeline.id)
        .eq('owner_id', userId);

      if (error) {
        setEditError(error.message);
        return;
      }

      // reload pipelines setelah update
      const { data: pipelinesData, error: reloadError } = await supabase
        .from('pipelines')
        .select(
          `
          id,
          product_id,
          marketer_id,
          customer_name,
          branch,
          class,
          ape_idr,
          ape_usd,
          execution_plan,
          quadrant,
          remarks,
          priority_flag,
          pipeline_date
        `
        )
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!reloadError) {
        setPipelines((pipelinesData ?? []) as PipelineRow[]);
      }

      closeDetailModal();
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

      // Hapus juga dari state lokal agar tabel langsung ter-update
      setPipelines((prev) =>
        prev.filter((row) => row.id !== selectedPipeline.id)
      );

      closeDetailModal();
    } finally {
      setDeleting(false);
    }
  };

  //
  // ──────────────────────────────────────────────────────────
  //  HANDLER: Copy format laporan ke WhatsApp (clipboard)
  // ──────────────────────────────────────────────────────────
  //
  const copyToWhatsApp = () => {
    if (!selectedPipeline) return;

    const product = getProductName(selectedPipeline.product_id);
    const marketer = getMarketerName(selectedPipeline.marketer_id);

    const msg = `
🔥 Pipeline Update

Produk: ${product}
Nasabah: ${selectedPipeline.customer_name}
Marketer: ${marketer}
Branch: ${selectedPipeline.branch ?? '-'}
Class: ${selectedPipeline.class ?? '-'}
APE IDR: ${
      selectedPipeline.ape_idr
        ? 'Rp ' + selectedPipeline.ape_idr.toLocaleString('id-ID')
        : '-'
    }
APE USD: ${
      selectedPipeline.ape_usd
        ? '$' + selectedPipeline.ape_usd.toLocaleString('en-US')
        : '-'
    }
Plan: ${selectedPipeline.execution_plan ?? '-'}
Quadrant: ${selectedPipeline.quadrant ?? '-'}
Remarks: ${selectedPipeline.remarks ?? '-'}
Tanggal: ${selectedPipeline.pipeline_date ?? '-'}
Prioritas: ${selectedPipeline.priority_flag ? 'YES' : 'NO'}
    `.trim();

    navigator.clipboard.writeText(msg);
    alert('Pesan pipeline sudah disalin! Tinggal paste di WhatsApp.');
  };

  //
  // ──────────────────────────────────────────────────────────
  //  RENDER: Loading state
  // ──────────────────────────────────────────────────────────
  //
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat dashboard…</p>
      </div>
    );
  }

  //
  // ──────────────────────────────────────────────────────────
  //  RENDER: Layout utama dashboard
  // ──────────────────────────────────────────────────────────
  //
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              SP
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">
                Sales Pipeline
              </h1>
              <p className="text-[11px] text-slate-500">
                Pipeline & reporting untuk sales asuransi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Masuk sebagai</p>
              <p className="text-xs font-medium text-slate-800">
                {userEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Ringkasan angka (3 kartu atas) */}
        <PipelineSummary
          totalCount={filteredPipelines.length}
          totalApeIdr={totalApeIdr}
          totalApeUsd={totalApeUsd}
        />

        {/* Tabel pipeline + tombol tambah (form sekarang via modal) */}
        <section className="space-y-3">
          {/* Bar atas: judul & tombol tambah pipeline */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Data pipeline
              </h2>
              <p className="text-[11px] text-slate-500">
                Kelola pipeline harian, filter, dan export laporan untuk atasan.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 shadow-sm"
            >
              <span className="text-base leading-none">＋</span>
              <span>Tambah pipeline</span>
            </button>
          </div>

          {/* List pipeline + filter + export */}
          <PipelineTable
            filteredPipelines={filteredPipelines}
            filterProductId={filterProductId}
            setFilterProductId={setFilterProductId}
            filterQuadrant={filterQuadrant}
            setFilterQuadrant={setFilterQuadrant}
            products={products}
            marketers={marketers}
            exportExcel={exportExcel}
            openDetailModal={openDetailModal}
          />
        </section>
      </main>

      {/* Modal create pipeline (tambah baru) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Tambah pipeline baru
              </h3>
              <button
                onClick={closeCreateModal}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Lengkapi data sesuai format laporan (produk, marketer, APE, kuadran, dll.).
            </p>

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
            />
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
    </div>
  );
}

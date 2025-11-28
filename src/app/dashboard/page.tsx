'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import PipelineSummary from './components/PipelineSummary';
import PipelineForm from './components/PipelineForm';
import PipelineTable from './components/PipelineTable';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';
import PipelineDetailModal from './components/PipelineDetailModal';





type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

// type PipelineRow = {
//   id: string;
//   product_id: string;
//   marketer_id: string | null;
//   customer_name: string;
//   branch: string | null;
//   class: string | null;
//   ape_idr: number | null;
//   ape_usd: number | null;
//   execution_plan: string | null;
//   quadrant: string | null;
//   remarks: string | null;
//   priority_flag: boolean | null;
//   pipeline_date: string | null;
// };

// type PipelineEditForm = {
//   product_id: string;
//   marketer_id: string;
//   customer_name: string;
//   branch: string;
//   class: string;
//   ape_idr: string;
//   ape_usd: string;
//   execution_plan: string;
//   quadrant: string;
//   remarks: string;
//   priority_flag: boolean;
//   pipeline_date: string;
// };

export default function DashboardPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  // const [loadingData, setLoadingData] = useState(true);

  // Modal detail state
const [selectedPipeline, setSelectedPipeline] = useState<PipelineRow | null>(null);
const [showDetailModal, setShowDetailModal] = useState(false);

// edit state
const [editMode, setEditMode] = useState(false);
const [editForm, setEditForm] = useState<PipelineEditForm | null>(null);
const [savingEdit, setSavingEdit] = useState(false);
const [editError, setEditError] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

  // filter state
  const [filterProductId, setFilterProductId] = useState<string>('all');
  // const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterQuadrant, setFilterQuadrant] = useState<string>('all');

  // form state (CREATE)
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
  // const [exporting, setExporting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1) cek user login
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

  // 2) fetch products, marketers, pipelines (setelah user ready)
  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      // setLoadingData(true);

      const [
        { data: productsData },
        { data: marketersData },
        { data: pipelinesData }
      ] = await Promise.all([
        supabase.from('products').select('id, name').order('name'),
        supabase.from('marketers').select('id, name, branch').order('name'),
        supabase.from('pipelines').select
        (
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
        ).eq('owner_id', userId).order('created_at', { ascending: false }),
      ]);

      setProducts(productsData ?? []);
      setMarketers(marketersData ?? []);
      setPipelines(((pipelinesData ?? []) as PipelineRow[]));

      // setLoadingData(false);
    };

    fetchAll();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

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

      // reload pipelines
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

      setPipelines(((pipelinesData ?? []) as PipelineRow[]));
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const getProductName = (product_id: string) => {
    const product = products.find((prod) => prod.id === product_id);
    return product ? product.name : '-';
  };

  const getMarketerName = (marketer_id: string | null) => {
    if (!marketer_id) return '-';
    const marketer = marketers.find((mk) => mk.id === marketer_id);
    return marketer ? marketer.name : '-';
  };

  // FILTER: bentuk array yang sudah difilter
  // const filteredPipelines = pipelines.filter((row) => {
  //   const matchProduct =
  //     filterProductId === 'all' ? true : row.product_id === filterProductId;

  //   const matchPlan =
  //     filterPlan === 'all'
  //       ? true
  //       : (row.execution_plan ?? '').toLowerCase() === filterPlan.toLowerCase();

  //   const matchQuadrant =
  //     filterQuadrant === 'all'
  //       ? true
  //       : (row.quadrant ?? '').toLowerCase() === filterQuadrant.toLowerCase();

  //   return matchProduct && matchPlan && matchQuadrant;
  // });
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

  // const exportExcel = () => {
  //   if (filteredPipelines.length === 0) {
  //     alert('Tidak ada data pipeline untuk diexport (periksa filter).');
  //     return;
  //   }

  //   setExporting(true);
  //   try {
  //     const rows = filteredPipelines.map((row, index) => ({
  //       NO: index + 1,
  //       PRODUK: getProductName(row.product_id),
  //       BRANCH: row.branch ?? '',
  //       CLASS: row.class ?? '',
  //       NASABAH: row.customer_name,
  //       LG: getMarketerName(row.marketer_id),
  //       'APE IDR': row.ape_idr ?? 0,
  //       'APE USD': row.ape_usd ?? 0,
  //       'Eks. Plan': row.execution_plan ?? '',
  //       Kuadran: row.quadrant ?? '',
  //       REMARKS: row.remarks ?? '',
  //       PRIORITAS: row.priority_flag ? 'YES' : '',
  //       TANGGAL: row.pipeline_date ?? '',
  //     }));

  //     const ws = XLSX.utils.json_to_sheet(rows);
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, 'Pipeline');

  //     const safeEmail =
  //       (userEmail ?? 'user')
  //         .split('@')[0]
  //         .replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  //     const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  //     const filename = `pipeline-${safeEmail}-${dateStr}.xlsx`;

  //     XLSX.writeFile(wb, filename);
  //   } finally {
  //     setExporting(false);
  //   }
  // };

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
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `pipeline-${safeEmail}-${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
};


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

      // reload pipelines
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
        setPipelines(((pipelinesData ?? []) as PipelineRow[]));
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
        .eq('id', selectedPipeline.id); // cukup pakai id

        console.log('Delete error', error)

      if (error) {
        setEditError(error.message);
        return;
      }

      // kalau sukses, langsung buang dari state lokal
      setPipelines((prev) =>
        prev.filter((row) => row.id !== selectedPipeline.id)
      );

      closeDetailModal();
    } finally {
      setDeleting(false);
    }
  };

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


  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat dashboard…</p>
      </div>
    );
  }

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
        {/* cards ringkas atas */}
        {/* <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
            <p className="text-[11px] font-medium text-slate-500">
              Total pipeline (terfilter)
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
              {filteredPipelines.length}
            </h2>
            <p className="text-[11px] text-slate-500">
              Jumlah nasabah dalam pipeline sesuai filter aktif.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">
              APE IDR (sum, terfilter)
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Rp {totalApeIdr.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-slate-500">
              Total APE IDR dari data yang sedang ditampilkan.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">
              APE USD (sum, terfilter)
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              ${totalApeUsd.toLocaleString('en-US')}
            </h2>
            <p className="text-xs text-slate-500">
              Total APE USD dari data yang sedang ditampilkan.
            </p>
          </div>
        </section> */}

        <PipelineSummary
          totalCount={filteredPipelines.length}
          totalApeIdr={totalApeIdr}
          totalApeUsd={totalApeUsd}
        />


        {/* Form + List */}
        <section className="grid gap-4 lg:grid-cols-2">
          {/* FORM INPUT PIPELINE */}
          {/* <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Tambah pipeline baru
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Lengkapi data sesuai format laporan (produk, marketer, APE, kuadran, dll.).
            </p>

            {formError && (
              <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-slate-700">
                    Produk *
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="">Pilih produk</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700">
                    Nama Nasabah *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama lengkap nasabah"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700">
                    Marketer pemberi nasabah
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    value={marketerId}
                    onChange={(e) => setMarketerId(e.target.value)}
                  >
                    <option value="">Pilih marketer</option>
                    {marketers.map((mk) => (
                      <option key={mk.id} value={mk.id}>
                        {mk.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      Branch / Cabang
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="mis. KCU Wahid Hasyim"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      Class
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={customerClass}
                      onChange={(e) => setCustomerClass(e.target.value)}
                      placeholder="B1 / B2 / dll."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      APE IDR
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={apeIdr}
                      onChange={(e) => setApeIdr(e.target.value)}
                      placeholder="contoh: 120000000"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      APE USD
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={apeUsd}
                      onChange={(e) => setApeUsd(e.target.value)}
                      placeholder="contoh: 120000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      Ekspektasi Plan
                    </label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={executionPlan}
                      onChange={(e) => setExecutionPlan(e.target.value)}
                    >
                      <option value="week 1">week 1</option>
                      <option value="week 2">week 2</option>
                      <option value="week 3">week 3</option>
                      <option value="week 4">week 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-700">
                      Kuadran
                    </label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      value={quadrant}
                      onChange={(e) => setQuadrant(e.target.value)}
                    >
                      <option value="k1">k1</option>
                      <option value="k2">k2</option>
                      <option value="k3">k3</option>
                      <option value="k4">k4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700">
                    Tanggal Pipeline
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    value={pipelineDate}
                    onChange={(e) => setPipelineDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700">
                    Keterangan
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300 min-h-16"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Contoh: Nasabah tertarik, menunggu dana masuk ke rekening."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="priority"
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-300 text-slate-900"
                    checked={priorityFlag}
                    onChange={(e) => setPriorityFlag(e.target.checked)}
                  />
                  <label
                    htmlFor="priority"
                    className="text-xs text-slate-700 cursor-pointer"
                  >
                    Tandai sebagai prioritas (akan di-highlight di laporan Excel)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-1 py-2.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan pipeline'}
              </button>
            </form>
          </div> */}
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

          {/* LIST PIPELINE + FILTER + EXPORT */}
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
      {/* ===== MODAL DETAIL PIPELINE ===== */}
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

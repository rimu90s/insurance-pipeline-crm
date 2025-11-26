'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

type PipelineRow = {
  id: string;
  product_id: string;
  marketer_id: string | null;
  customer_name: string;
  branch: string | null;
  class: string | null;
  ape_idr: number | null;
  ape_usd: number | null;
  execution_plan: string | null;
  quadrant: string | null;
  remarks: string | null;
  priority_flag: boolean | null;
  pipeline_date: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // form state
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
      setLoadingData(true);

      const [{ data: productsData }, { data: marketersData }, { data: pipelinesData }] =
        await Promise.all([
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
      setPipelines(((pipelinesData ?? []) as PipelineRow[]));

      setLoadingData(false);
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

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat dashboard…</p>
      </div>
    );
  }

  const getProductName = (product_id: string) => {
    const p = products.find((prod) => prod.id === product_id);
    return p ? p.name : '-';
  };

  const getMarketerName = (marketer_id: string | null) => {
    if (!marketer_id) return '-';
    const m = marketers.find((mk) => mk.id === marketer_id);
    return m ? m.name : '-';
  };

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
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">
              Total pipeline
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {pipelines.length}
            </h2>
            <p className="text-xs text-slate-500">
              Jumlah nasabah dalam pipeline Anda.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">
              APE IDR (sum)
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Rp{' '}
              {pipelines
                .reduce((acc, item) => acc + (item.ape_idr ?? 0), 0)
                .toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-slate-500">
              Perkiraan total dari seluruh pipeline (IDR).
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">
              APE USD (sum)
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              $
              {pipelines
                .reduce((acc, item) => acc + (item.ape_usd ?? 0), 0)
                .toLocaleString('en-US')}
            </h2>
            <p className="text-xs text-slate-500">
              Perkiraan total dari seluruh pipeline (USD).
            </p>
          </div>
        </section>

        {/* Form + List */}
        <section className="grid gap-4 lg:grid-cols-2">
          {/* FORM INPUT PIPELINE */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
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
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
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
                    {marketers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
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
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300 min-h-[64px]"
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
          </div>

          {/* LIST PIPELINE */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Pipeline Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar pipeline terbaru (hanya milik akun ini).
                </p>
              </div>
            </div>

            {loadingData ? (
              <p className="text-xs text-slate-500 mt-2">Memuat data…</p>
            ) : pipelines.length === 0 ? (
              <p className="text-xs text-slate-500 mt-2">
                Belum ada data pipeline. Tambahkan dari formulir di sebelah kiri.
              </p>
            ) : (
              <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-[11px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-600">
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2">Nasabah</th>
                      <th className="px-3 py-2">Marketer</th>
                      <th className="px-3 py-2 text-right">APE IDR</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Kdr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelines.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-t border-slate-100 ${
                          p.priority_flag ? 'bg-yellow-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-2">
                          {getProductName(p.product_id)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {p.customer_name}
                            </span>
                            {p.remarks && (
                              <span className="text-[10px] text-slate-500 line-clamp-2">
                                {p.remarks}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {getMarketerName(p.marketer_id)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {p.ape_idr
                            ? p.ape_idr.toLocaleString('id-ID', {
                                maximumFractionDigits: 0,
                              })
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {p.execution_plan ?? '-'}
                        </td>
                        <td className="px-3 py-2 uppercase">
                          {p.quadrant ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

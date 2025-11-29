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

export default function SettingsPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);

  // form add product
  const [newProductName, setNewProductName] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductName, setEditingProductName] = useState('');

  // form add marketer
  const [newMarketerName, setNewMarketerName] = useState('');
  const [newMarketerBranch, setNewMarketerBranch] = useState('');
  const [savingMarketer, setSavingMarketer] = useState(false);
  const [editingMarketerId, setEditingMarketerId] = useState<string | null>(null);
  const [editingMarketerName, setEditingMarketerName] = useState('');
  const [editingMarketerBranch, setEditingMarketerBranch] = useState('');

  // toast kecil
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // cek login
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/auth');
        return;
      }
      setUserEmail(data.user.email ?? null);
      setLoadingUser(false);
    };
    init();
  }, [router]);

  // fetch products & marketers
  useEffect(() => {
    if (loadingUser) return;

    const fetchAll = async () => {
      setLoadingData(true);
      try {
        const [{ data: productsData }, { data: marketersData }] = await Promise.all([
          supabase.from('products').select('id, name').order('name'),
          supabase.from('marketers').select('id, name, branch').order('name'),
        ]);

        setProducts(productsData ?? []);
        setMarketers(marketersData ?? []);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAll();
  }, [loadingUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  // ─────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────
  const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newProductName.trim();
    if (!name) return;

    setSavingProduct(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({ name })
        .select('id, name')
        .single();

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setProducts((prev) => [...prev, data as Product]);
      setNewProductName('');
      showToast('Produk baru berhasil ditambahkan.', 'success');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditingProductName(prod.name);
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditingProductName('');
  };

  const handleSaveProduct = async () => {
    if (!editingProductId) return;
    const name = editingProductName.trim();
    if (!name) return;

    setSavingProduct(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ name })
        .eq('id', editingProductId);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProductId ? { ...p, name } : p))
      );
      showToast('Nama produk berhasil diubah.', 'success');
      cancelEditProduct();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    const ok = window.confirm(
      `Yakin ingin menghapus produk "${prod.name}"?\nJika masih dipakai di pipeline, penghapusan bisa gagal.`
    );
    if (!ok) return;

    setSavingProduct(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', prod.id);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      showToast('Produk berhasil dihapus.', 'success');
    } finally {
      setSavingProduct(false);
    }
  };

  // ─────────────────────────────────────────────
  // MARKETERS
  // ─────────────────────────────────────────────
  const handleAddMarketer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newMarketerName.trim();
    const branch = newMarketerBranch.trim() || null;
    if (!name) return;

    setSavingMarketer(true);
    try {
      const { data, error } = await supabase
        .from('marketers')
        .insert({ name, branch })
        .select('id, name, branch')
        .single();

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setMarketers((prev) => [...prev, data as Marketer]);
      setNewMarketerName('');
      setNewMarketerBranch('');
      showToast('Marketer baru berhasil ditambahkan.', 'success');
    } finally {
      setSavingMarketer(false);
    }
  };

  const startEditMarketer = (mk: Marketer) => {
    setEditingMarketerId(mk.id);
    setEditingMarketerName(mk.name);
    setEditingMarketerBranch(mk.branch ?? '');
  };

  const cancelEditMarketer = () => {
    setEditingMarketerId(null);
    setEditingMarketerName('');
    setEditingMarketerBranch('');
  };

  const handleSaveMarketer = async () => {
    if (!editingMarketerId) return;
    const name = editingMarketerName.trim();
    const branch = editingMarketerBranch.trim() || null;
    if (!name) return;

    setSavingMarketer(true);
    try {
      const { error } = await supabase
        .from('marketers')
        .update({ name, branch })
        .eq('id', editingMarketerId);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setMarketers((prev) =>
        prev.map((m) =>
          m.id === editingMarketerId ? { ...m, name, branch } : m
        )
      );
      showToast('Data marketer berhasil diubah.', 'success');
      cancelEditMarketer();
    } finally {
      setSavingMarketer(false);
    }
  };

  const handleDeleteMarketer = async (mk: Marketer) => {
    const ok = window.confirm(
      `Yakin ingin menghapus marketer "${mk.name}"?`
    );
    if (!ok) return;

    setSavingMarketer(true);
    try {
      const { error } = await supabase
        .from('marketers')
        .delete()
        .eq('id', mk.id);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      setMarketers((prev) => prev.filter((m) => m.id !== mk.id));
      showToast('Marketer berhasil dihapus.', 'success');
    } finally {
      setSavingMarketer(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Memuat settings…</p>
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
                Settings
              </h1>
              <p className="text-[11px] text-slate-500">
                Kelola produk & marketer yang digunakan di pipeline.
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
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
            >
              Kembali ke dashboard
            </button>
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
        <p className="text-[11px] text-slate-500 mb-2">
          Perubahan di sini akan mempengaruhi pilihan di form pipeline dan di
          filter dashboard.
        </p>

        {loadingData ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-pulse"
              >
                <div className="h-4 w-32 bg-slate-100 rounded mb-3" />
                <div className="h-3 w-56 bg-slate-100 rounded mb-4" />
                <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* PRODUCTS CARD */}
            <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Produk asuransi
              </h2>
              <p className="text-[11px] text-slate-500 mb-3">
                Daftar produk yang akan muncul di form pipeline dan filter
                dashboard.
              </p>

              {/* FORM ADD PRODUCT */}
              <form
                onSubmit={handleAddProduct}
                className="flex gap-2 mb-3 text-[11px]"
              >
                <input
                  type="text"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  placeholder="Nama produk, mis. Heritage Protection"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-[11px] disabled:opacity-60"
                >
                  Tambah
                </button>
              </form>

              {/* LIST PRODUCTS */}
              {products.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Belum ada produk. Tambahkan minimal satu produk dulu.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-[11px]">
                  {products.map((prod) => (
                    <li
                      key={prod.id}
                      className="flex items-center justify-between py-2"
                    >
                      {editingProductId === prod.id ? (
                        <>
                          <input
                            type="text"
                            className="flex-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300 mr-2"
                            value={editingProductName}
                            onChange={(e) =>
                              setEditingProductName(e.target.value)
                            }
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleSaveProduct}
                              disabled={savingProduct}
                              className="px-2 py-1 rounded-md bg-slate-900 text-white"
                            >
                              ✔
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditProduct}
                              className="px-2 py-1 rounded-md bg-slate-100 text-slate-700"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-800">
                            {prod.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditProduct(prod)}
                              className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                              title="Edit nama produk"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod)}
                              className="px-2 py-1 rounded-md border border-red-200 bg-white hover:bg-red-50"
                              title="Hapus produk"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* MARKETERS CARD */}
            <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Marketer & cabang
              </h2>
              <p className="text-[11px] text-slate-500 mb-3">
                Daftar marketer yang memberikan nasabah kepada Anda, beserta
                cabangnya.
              </p>

              {/* FORM ADD MARKETER */}
              <form
                onSubmit={handleAddMarketer}
                className="space-y-2 text-[11px] mb-3"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    placeholder="Nama marketer"
                    value={newMarketerName}
                    onChange={(e) => setNewMarketerName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    placeholder="Branch / cabang (opsional)"
                    value={newMarketerBranch}
                    onChange={(e) => setNewMarketerBranch(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingMarketer}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-[11px] disabled:opacity-60"
                >
                  Tambah marketer
                </button>
              </form>

              {/* LIST MARKETERS */}
              {marketers.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Belum ada marketer. Tambahkan marketer yang biasa bekerja
                  sama dengan Anda.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-[11px]">
                  {marketers.map((mk) => (
                    <li
                      key={mk.id}
                      className="flex items-start justify-between py-2 gap-2"
                    >
                      {editingMarketerId === mk.id ? (
                        <>
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300"
                              value={editingMarketerName}
                              onChange={(e) =>
                                setEditingMarketerName(e.target.value)
                              }
                              placeholder="Nama marketer"
                            />
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300"
                              value={editingMarketerBranch}
                              onChange={(e) =>
                                setEditingMarketerBranch(e.target.value)
                              }
                              placeholder="Branch / cabang (opsional)"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleSaveMarketer}
                              disabled={savingMarketer}
                              className="px-2 py-1 rounded-md bg-slate-900 text-white"
                            >
                              ✔
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditMarketer}
                              className="px-2 py-1 rounded-md bg-slate-100 text-slate-700"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">
                              {mk.name}
                            </p>
                            {mk.branch && (
                              <p className="text-[10px] text-slate-500">
                                {mk.branch}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditMarketer(mk)}
                              className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                              title="Edit marketer"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMarketer(mk)}
                              className="px-2 py-1 rounded-md border border-red-200 bg-white hover:bg-red-50"
                              title="Hapus marketer"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>

      {/* toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg text-xs text-white z-50 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

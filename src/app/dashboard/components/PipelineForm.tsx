'use client';

import { FormEvent } from 'react';

type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

type PipelineFormProps = {
  products: Product[];
  marketers: Marketer[];
  formError: string | null;
  saving: boolean;

  productId: string;
  setProductId: (value: string) => void;

  customerName: string;
  setCustomerName: (value: string) => void;

  marketerId: string;
  setMarketerId: (value: string) => void;

  branch: string;
  setBranch: (value: string) => void;

  customerClass: string;
  setCustomerClass: (value: string) => void;

  apeIdr: string;
  setApeIdr: (value: string) => void;

  apeUsd: string;
  setApeUsd: (value: string) => void;

  executionPlan: string;
  setExecutionPlan: (value: string) => void;

  quadrant: string;
  setQuadrant: (value: string) => void;

  pipelineDate: string;
  setPipelineDate: (value: string) => void;

  remarks: string;
  setRemarks: (value: string) => void;

  priorityFlag: boolean;
  setPriorityFlag: (value: boolean) => void;

  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export default function PipelineForm({
  products,
  marketers,
  formError,
  saving,
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
  onSubmit,
}: PipelineFormProps) {
  return (
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

      <form onSubmit={onSubmit} className="space-y-3 text-xs">
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
    </div>
  );
}

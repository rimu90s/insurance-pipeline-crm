'use client';

import React from 'react';
import FormSection from './FormSection';

// Tipe lokal sederhana (mengikuti struktur dari hooks)
type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch: string | null;
};

interface PipelineFormProps {
  products: Product[];
  marketers: Marketer[];

  formError: string | null;
  saving: boolean;

  productId: string;
  setProductId: (v: string) => void;

  customerName: string;
  setCustomerName: (v: string) => void;

  marketerId: string;
  setMarketerId: (v: string) => void;

  branch: string;
  setBranch: (v: string) => void;

  customerClass: string;
  setCustomerClass: (v: string) => void;

  apeIdr: string;
  setApeIdr: (v: string) => void;

  apeUsd: string;
  setApeUsd: (v: string) => void;

  executionPlan: string;
  setExecutionPlan: (v: string) => void;

  quadrant: string;
  setQuadrant: (v: string) => void;

  pipelineDate: string;
  setPipelineDate: (v: string) => void;

  remarks: string;
  setRemarks: (v: string) => void;

  priorityFlag: boolean;
  setPriorityFlag: (v: boolean) => void;

  status: string;
  setStatus: (v: string) => void;

  leadSource: string;
  setLeadSource: (v: string) => void;

  expectedClosingDate: string;
  setExpectedClosingDate: (v: string) => void;

  lastContactDate: string;
  setLastContactDate: (v: string) => void;

  nextAction: string;
  setNextAction: (v: string) => void;

  riskTag: string;
  setRiskTag: (v: string) => void;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Helper: format input uang (hanya angka, ada thousand separator)
const formatMoneyInput = (raw: string, maxLength = 12) => {
  const digitsOnly = raw.replace(/\D/g, '');
  const clipped = digitsOnly.slice(0, maxLength);

  if (!clipped) return '';
  return Number(clipped).toLocaleString('id-ID');
};

export default function PipelineForm(props: PipelineFormProps) {
  const {
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

    onSubmit,
  } = props;

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-xs">
      {/* CUSTOMER INFORMATION */}
      <FormSection title="CUSTOMER INFORMATION">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Nama Nasabah
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none ring-0 focus:border-slate-400"
              placeholder="Nama lengkap nasabah"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Kelas Nasabah
            </label>
            <input
              type="text"
              value={customerClass}
              onChange={(e) => setCustomerClass(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
              placeholder="A1, B1, dsb (opsional)"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Cabang / Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
              placeholder="Nama cabang / kota"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Marketer
            </label>
            <select
              value={marketerId}
              onChange={(e) => setMarketerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="">-</option>
              {marketers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      {/* PRODUK & FINANCIALS */}
      <FormSection title="PRODUK & FINANCIALS">
        {/* Row 1: Produk + APE IDR */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Produk
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              APE (IDR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={apeIdr}
                onChange={(e) =>
                  setApeIdr(formatMoneyInput(e.target.value, 15))
                }
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs outline-none focus:border-slate-400"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Row 2: APE USD + Tanggal */}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              APE (USD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-500">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={apeUsd}
                onChange={(e) =>
                  setApeUsd(formatMoneyInput(e.target.value, 12))
                }
                className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs outline-none focus:border-slate-400"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Tanggal Pipeline
            </label>
            <input
              type="date"
              value={pipelineDate}
              onChange={(e) => setPipelineDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </FormSection>

      {/* PIPELINE META */}
      <FormSection title="PIPELINE META">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Execution Plan
            </label>
            <select
              value={executionPlan}
              onChange={(e) => setExecutionPlan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="week 1">Week 1</option>
              <option value="week 2">Week 2</option>
              <option value="week 3">Week 3</option>
              <option value="week 4">Week 4</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Quadrant
            </label>
            <select
              value={quadrant}
              onChange={(e) => setQuadrant(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="k1">K1</option>
              <option value="k2">K2</option>
              <option value="k3">K3</option>
              <option value="k4">K4</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="prospecting">Prospecting</option>
              <option value="follow_up">Follow up</option>
              <option value="won">Won / Deal</option>
              <option value="lost">Lost / Drop</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Lead Source
            </label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            >
              <option value="referral">Referral</option>
              <option value="direct">Direct</option>
              <option value="event">Event</option>
              <option value="online">Online</option>
              <option value="telemarketing">Telemarketing</option>
            </select>
          </div>
        </div>
      </FormSection>

      {/* NEXT ACTIONS & NOTES */}
      <FormSection title="NEXT ACTIONS & NOTES">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Expected Closing
            </label>
            <input
              type="date"
              value={expectedClosingDate}
              onChange={(e) => setExpectedClosingDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Last Contact
            </label>
            <input
              type="date"
              value={lastContactDate}
              onChange={(e) => setLastContactDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Next Action
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
              placeholder="Janji temu, follow up dokumen, dsb."
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Risk Tag
            </label>
            <input
              type="text"
              value={riskTag}
              onChange={(e) => setRiskTag(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
              placeholder="Catatan risiko khusus (opsional)"
            />
          </div>
        </div>
      </FormSection>

      {/* CATATAN TAMBAHAN */}
      <FormSection title="CATATAN TAMBAHAN">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto] md:items-start">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400"
              placeholder="Catatan tambahan untuk laporan atasan (opsional)"
            />
          </div>
          <div className="mt-2 flex items-start gap-2 md:mt-6">
            <input
              id="priorityFlag"
              type="checkbox"
              checked={priorityFlag}
              onChange={(e) => setPriorityFlag(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label
              htmlFor="priorityFlag"
              className="text-[11px] text-slate-700"
            >
              Tandai sebagai{' '}
              <span className="font-semibold">prioritas tinggi</span>.
            </label>
          </div>
        </div>
      </FormSection>

      {/* Error & Submit button */}
      {formError && (
        <p className="text-[11px] text-rose-600">{formError}</p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? 'Menyimpan…' : 'Simpan pipeline'}
        </button>
      </div>
    </form>
  );
}

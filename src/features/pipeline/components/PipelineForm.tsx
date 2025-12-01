'use client';

import { FormEvent } from 'react';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';

type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch?: string | null;
};

interface PipelineFormProps {
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

  status: string;
  setStatus: (value: string) => void;

  leadSource: string;
  setLeadSource: (value: string) => void;

  expectedClosingDate: string;
  setExpectedClosingDate: (value: string) => void;

  lastContactDate: string;
  setLastContactDate: (value: string) => void;

  nextAction: string;
  setNextAction: (value: string) => void;

  riskTag: string;
  setRiskTag: (value: string) => void;
}

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
}: PipelineFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* SECTION: CUSTOMER INFO */}
      <FormSection title="Customer Information">
        <FormField label="Nama Nasabah">
          <input
            type="text"
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Kelas Nasabah">
          <input
            type="text"
            className="input"
            value={customerClass}
            onChange={(e) => setCustomerClass(e.target.value)}
          />
        </FormField>

        <FormField label="Cabang / Branch">
          <input
            type="text"
            className="input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </FormField>

        <FormField label="Marketer">
          <select
            className="input"
            value={marketerId}
            onChange={(e) => setMarketerId(e.target.value)}
          >
            <option value="">-</option>
            {marketers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      {/* SECTION: PRODUK & FINANCIAL */}
      <FormSection title="Produk & Financials">
        <FormField label="Produk">
          <select
            className="input"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Pilih produk…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="APE (IDR)">
          <input
            type="number"
            className="input"
            value={apeIdr}
            onChange={(e) => setApeIdr(e.target.value)}
          />
        </FormField>

        <FormField label="APE (USD)">
          <input
            type="number"
            className="input"
            value={apeUsd}
            onChange={(e) => setApeUsd(e.target.value)}
          />
        </FormField>

        <FormField label="Tanggal Pipeline">
          <input
            type="date"
            className="input"
            value={pipelineDate}
            onChange={(e) => setPipelineDate(e.target.value)}
          />
        </FormField>
      </FormSection>

      {/* SECTION: PIPELINE META */}
      <FormSection title="Pipeline Meta">
        <FormField label="Execution Plan">
          <select
            className="input"
            value={executionPlan}
            onChange={(e) => setExecutionPlan(e.target.value)}
          >
            <option value="week 1">Week 1</option>
            <option value="week 2">Week 2</option>
            <option value="week 3">Week 3</option>
            <option value="week 4">Week 4</option>
          </select>
        </FormField>

        <FormField label="Quadrant">
          <select
            className="input"
            value={quadrant}
            onChange={(e) => setQuadrant(e.target.value)}
          >
            <option value="k1">K1</option>
            <option value="k2">K2</option>
            <option value="k3">K3</option>
            <option value="k4">K4</option>
          </select>
        </FormField>

        <FormField label="Status">
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="prospecting">Prospecting</option>
            <option value="followup">Follow Up</option>
            <option value="presentation">Presentation</option>
            <option value="closing">Closing</option>
            <option value="closed lost">Closed Lost</option>
          </select>
        </FormField>

        <FormField label="Lead Source">
          <select
            className="input"
            value={leadSource}
            onChange={(e) => setLeadSource(e.target.value)}
          >
            <option value="referral">Referral</option>
            <option value="walk-in">Walk-in</option>
            <option value="telemarketing">Telemarketing</option>
            <option value="event">Event</option>
            <option value="digital">Digital</option>
          </select>
        </FormField>
      </FormSection>

      {/* SECTION: NEXT ACTIONS */}
      <FormSection title="Next Actions & Notes">
        <FormField label="Expected Closing">
          <input
            type="date"
            className="input"
            value={expectedClosingDate}
            onChange={(e) => setExpectedClosingDate(e.target.value)}
          />
        </FormField>

        <FormField label="Last Contact">
          <input
            type="date"
            className="input"
            value={lastContactDate}
            onChange={(e) => setLastContactDate(e.target.value)}
          />
        </FormField>

        <FormField label="Next Action">
          <input
            type="text"
            className="input"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
          />
        </FormField>

        <FormField label="Risk Tag">
          <input
            type="text"
            className="input"
            value={riskTag}
            onChange={(e) => setRiskTag(e.target.value)}
          />
        </FormField>
      </FormSection>

      {/* SECTION: REMARKS */}
      <FormSection title="Catatan Tambahan">
        <FormField label="Remarks">
          <textarea
            className="input h-20"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </FormField>

        <FormField label="Prioritas?">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={priorityFlag}
              onChange={(e) => setPriorityFlag(e.target.checked)}
            />
            <span className="text-[11px] text-slate-600">
              Tandai prioritas
            </span>
          </div>
        </FormField>
      </FormSection>

      {/* SUBMIT */}
      {formError && (
        <p className="text-[12px] text-red-600">{formError}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
      >
        {saving ? 'Menyimpan...' : 'Simpan Pipeline'}
      </button>
    </form>
  );
}

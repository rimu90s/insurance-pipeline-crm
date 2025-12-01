'use client';

import { Dispatch, SetStateAction } from 'react';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';

type Product = {
  id: string;
  name: string;
};

type Marketer = {
  id: string;
  name: string;
  branch?: string | null;
};

interface PipelineDetailModalProps {
  open: boolean;
  pipeline: PipelineRow | null;
  products: Product[];
  marketers: Marketer[];
  editMode: boolean;
  editForm: PipelineEditForm | null;
  editError: string | null;
  savingEdit: boolean;
  deleting: boolean;
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  setEditForm: Dispatch<SetStateAction<PipelineEditForm | null>>;
  onSaveEdit: () => void;
  onDelete: () => void;
  onCopyWA: () => void;
}

function getProductName(products: Product[], id: string) {
  const p = products.find((item) => item.id === id);
  return p ? p.name : '-';
}

function getMarketerName(marketers: Marketer[], id: string | null) {
  if (!id) return '-';
  const m = marketers.find((item) => item.id === id);
  return m ? m.name : '-';
}

export default function PipelineDetailModal({
  open,
  pipeline,
  products,
  marketers,
  editMode,
  editForm,
  editError,
  savingEdit,
  deleting,
  onClose,
  onStartEdit,
  onCancelEdit,
  setEditForm,
  onSaveEdit,
  onDelete,
  onCopyWA,
}: PipelineDetailModalProps) {
  if (!open || !pipeline) return null;

  const productName = getProductName(products, pipeline.product_id);
  const marketerName = getMarketerName(marketers, pipeline.marketer_id ?? null);

  const handleChange = <K extends keyof PipelineEditForm>(
    field: K,
    value: PipelineEditForm[K]
  ) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const current = editMode && editForm ? editForm : {
    product_id: pipeline.product_id,
    marketer_id: pipeline.marketer_id ?? '',
    customer_name: pipeline.customer_name,
    branch: pipeline.branch ?? '',
    class: pipeline.class ?? '',
    ape_idr: pipeline.ape_idr ? String(pipeline.ape_idr) : '',
    ape_usd: pipeline.ape_usd ? String(pipeline.ape_usd) : '',
    execution_plan: pipeline.execution_plan ?? '',
    quadrant: pipeline.quadrant ?? '',
    remarks: pipeline.remarks ?? '',
    priority_flag: !!pipeline.priority_flag,
    pipeline_date: pipeline.pipeline_date ?? '',
    status: pipeline.status ?? '',
    lead_source: pipeline.lead_source ?? '',
    expected_closing_date: pipeline.expected_closing_date ?? '',
    last_contact_date: pipeline.last_contact_date ?? '',
    next_action: pipeline.next_action ?? '',
    risk_tag: pipeline.risk_tag ?? '',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {pipeline.customer_name}
            </h3>
            <p className="text-[11px] text-slate-500">
              {productName} • {marketerName !== '-' ? marketerName : 'Tanpa marketer'} •{' '}
              {pipeline.status ?? 'Status tidak ada'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onCopyWA}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Copy WA
            </button>

            {!editMode ? (
              <>
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600 shadow-sm hover:bg-red-100 disabled:opacity-50"
                >
                  {deleting ? 'Menghapus…' : 'Hapus'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={savingEdit}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingEdit ? 'Menyimpan…' : 'Simpan perubahan'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-4 p-4">
          {/* SUMMARY BADGES */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium text-slate-500">APE (IDR)</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {pipeline.ape_idr ? `Rp ${pipeline.ape_idr.toLocaleString('id-ID')}` : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium text-slate-500">Plan / Quadrant</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {(pipeline.execution_plan ?? '-')}{' '}
                {pipeline.quadrant ? `• ${pipeline.quadrant.toUpperCase()}` : ''}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium text-slate-500">Prioritas</p>
              <p className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium
                border-amber-200 bg-amber-50 text-amber-700">
                {pipeline.priority_flag ? 'PRIORITAS' : 'Normal'}
              </p>
            </div>
          </div>

          {/* SECTION: CUSTOMER & PRODUK */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Customer & Produk
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Nama nasabah */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Nama Nasabah</p>
                {!editMode ? (
                  <p className="text-sm font-medium text-slate-900">
                    {pipeline.customer_name}
                  </p>
                ) : (
                  <input
                    className="input"
                    value={current.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                  />
                )}
              </div>

              {/* Kelas */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Kelas Nasabah</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.class ?? '—'}
                  </p>
                ) : (
                  <input
                    className="input"
                    value={current.class}
                    onChange={(e) => handleChange('class', e.target.value)}
                  />
                )}
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Cabang / Branch</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.branch ?? '—'}
                  </p>
                ) : (
                  <input
                    className="input"
                    value={current.branch}
                    onChange={(e) => handleChange('branch', e.target.value)}
                  />
                )}
              </div>

              {/* Produk */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Produk</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {productName}
                  </p>
                ) : (
                  <select
                    className="input"
                    value={current.product_id}
                    onChange={(e) => handleChange('product_id', e.target.value)}
                  >
                    <option value="">Pilih produk…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Marketer */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Marketer</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {marketerName}
                  </p>
                ) : (
                  <select
                    className="input"
                    value={current.marketer_id}
                    onChange={(e) => handleChange('marketer_id', e.target.value)}
                  >
                    <option value="">-</option>
                    {marketers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </section>

          {/* SECTION: STATUS & DATES */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Status & Timeline
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Status */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Status</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.status ?? '—'}
                  </p>
                ) : (
                  <select
                    className="input"
                    value={current.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="prospecting">Prospecting</option>
                    <option value="followup">Follow Up</option>
                    <option value="presentation">Presentation</option>
                    <option value="closing">Closing</option>
                    <option value="closed lost">Closed Lost</option>
                  </select>
                )}
              </div>

              {/* Lead Source */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Lead Source</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.lead_source ?? '—'}
                  </p>
                ) : (
                  <select
                    className="input"
                    value={current.lead_source}
                    onChange={(e) => handleChange('lead_source', e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="referral">Referral</option>
                    <option value="walk-in">Walk-in</option>
                    <option value="telemarketing">Telemarketing</option>
                    <option value="event">Event</option>
                    <option value="digital">Digital</option>
                  </select>
                )}
              </div>

              {/* Tanggal pipeline */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Tanggal Pipeline</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.pipeline_date ?? '—'}
                  </p>
                ) : (
                  <input
                    type="date"
                    className="input"
                    value={current.pipeline_date}
                    onChange={(e) => handleChange('pipeline_date', e.target.value)}
                  />
                )}
              </div>

              {/* Expected Closing */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Expected Closing</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.expected_closing_date ?? '—'}
                  </p>
                ) : (
                  <input
                    type="date"
                    className="input"
                    value={current.expected_closing_date}
                    onChange={(e) =>
                      handleChange('expected_closing_date', e.target.value)
                    }
                  />
                )}
              </div>

              {/* Last Contact */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Last Contact</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.last_contact_date ?? '—'}
                  </p>
                ) : (
                  <input
                    type="date"
                    className="input"
                    value={current.last_contact_date}
                    onChange={(e) =>
                      handleChange('last_contact_date', e.target.value)
                    }
                  />
                )}
              </div>
            </div>
          </section>

          {/* SECTION: NEXT ACTION & RISK */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Next Actions & Risk
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Next Action */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Next Action</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">
                    {pipeline.next_action ?? '—'}
                  </p>
                ) : (
                  <input
                    className="input"
                    value={current.next_action}
                    onChange={(e) => handleChange('next_action', e.target.value)}
                  />
                )}
              </div>

              {/* Risk Tag */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Risk Tag</p>
                {!editMode ? (
                  <p className="text-sm text-slate-900">
                    {pipeline.risk_tag ?? '—'}
                  </p>
                ) : (
                  <input
                    className="input"
                    value={current.risk_tag}
                    onChange={(e) => handleChange('risk_tag', e.target.value)}
                  />
                )}
              </div>
            </div>
          </section>

          {/* SECTION: REMARKS & PRIORITY */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Catatan Tambahan
            </h4>

            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">Remarks</p>
              {!editMode ? (
                <p className="text-sm text-slate-900 whitespace-pre-wrap">
                  {pipeline.remarks ?? '—'}
                </p>
              ) : (
                <textarea
                  className="input h-24"
                  value={current.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <input
                    id="priorityFlag"
                    type="checkbox"
                    checked={current.priority_flag}
                    onChange={(e) => handleChange('priority_flag', e.target.checked)}
                  />
                  <label
                    htmlFor="priorityFlag"
                    className="text-[11px] text-slate-600"
                  >
                    Tandai sebagai prioritas
                  </label>
                </>
              ) : (
                <p className="text-[11px] text-slate-600">
                  Prioritas:{' '}
                  <span className="font-medium">
                    {pipeline.priority_flag ? 'Ya (prioritas)' : 'Normal'}
                  </span>
                </p>
              )}
            </div>
          </section>

          {editError && (
            <p className="text-[12px] text-red-600">{editError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

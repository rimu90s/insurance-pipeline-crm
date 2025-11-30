'use client';

import React from 'react';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';

type Product = { id: string; name: string };
type Marketer = { id: string; name: string; branch?: string | null };

type Props = {
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
  setEditForm: React.Dispatch<React.SetStateAction<PipelineEditForm | null>>;
  onSaveEdit: () => void;
  onDelete: () => void;
  onCopyWA: () => void;
};

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
}: Props) {
  if (!open || !pipeline) return null;

  const getProductName = (product_id: string) => {
    const prod = products.find((p) => p.id === product_id);
    return prod ? prod.name : '-';
  };

  const getMarketerName = (marketer_id: string | null) => {
    if (!marketer_id) return '-';
    const mk = marketers.find((m) => m.id === marketer_id);
    return mk ? mk.name : '-';
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          {editMode ? 'Edit Pipeline' : 'Detail Pipeline'}
        </h3>

        {editError && (
          <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
            {editError}
          </div>
        )}

        {/* MODE DETAIL */}
        {!editMode && (
          <div className="space-y-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <span className="font-medium">Produk:</span>
              <br />
              {getProductName(pipeline.product_id)}
            </div>
            <div>
              <span className="font-medium">Nasabah:</span>
              <br />
              {pipeline.customer_name}
            </div>
            <div>
              <span className="font-medium">Marketer:</span>
              <br />
              {getMarketerName(pipeline.marketer_id)}
            </div>
            <div>
              <span className="font-medium">Branch:</span>
              <br />
              {pipeline.branch ?? '-'}
            </div>
            <div>
              <span className="font-medium">Class:</span>
              <br />
              {pipeline.class ?? '-'}
            </div>
            <div>
              <span className="font-medium">APE IDR:</span>
              <br />
              {pipeline.ape_idr?.toLocaleString('id-ID') ?? '-'}
            </div>
            <div>
              <span className="font-medium">APE USD:</span>
              <br />
              {pipeline.ape_usd?.toLocaleString('en-US') ?? '-'}
            </div>
            <div>
              <span className="font-medium">Execution Plan:</span>
              <br />
              {pipeline.execution_plan ?? '-'}
            </div>
            <div>
              <span className="font-medium">Quadrant:</span>
              <br />
              {pipeline.quadrant ?? '-'}
            </div>
            <div>
              <span className="font-medium">Remarks:</span>
              <br />
              {pipeline.remarks ?? '-'}
            </div>
            <div>
              <span className="font-medium">Tanggal Pipeline:</span>
              <br />
              {pipeline.pipeline_date ?? '-'}
            </div>
            {/* ===== INFO STATUS & LEAD SOURCE ===== */}
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium text-slate-900">
                  {pipeline?.status ?? 'prospecting'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Lead source</p>
                <p className="font-medium text-slate-900">
                  {pipeline?.lead_source ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Expected closing</p>
                <p className="font-medium text-slate-900">
                  {pipeline?.expected_closing_date ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Last contact</p>
                <p className="font-medium text-slate-900">
                  {pipeline?.last_contact_date ?? '-'}
                </p>
              </div>
            </div>

            {/* ===== NEXT ACTION & RISK TAG ===== */}
            <div className="mt-3 text-xs">
              <p className="text-slate-500">Next action</p>
              <p className="font-medium text-slate-900">
                {pipeline?.next_action ?? '-'}
              </p>
            </div>
            <div className="mt-2 text-xs">
              <p className="text-slate-500">Risk / Objection</p>
              <p className="font-medium text-slate-900">
                {pipeline?.risk_tag ?? '-'}
              </p>
            </div>
            <div>
              <span className="font-medium">Prioritas:</span>
              <br />
              {pipeline.priority_flag ? 'YES' : 'NO'}
            </div>
          </div>
        )}

        {/* MODE EDIT */}
                {/* MODE EDIT */}
        {editMode && editForm && (
          <div className="space-y-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Produk
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                value={editForm.product_id}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, product_id: e.target.value } : prev
                  )
                }
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
                Nama Nasabah
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                value={editForm.customer_name}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, customer_name: e.target.value } : prev
                  )
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Marketer
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                value={editForm.marketer_id}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, marketer_id: e.target.value } : prev
                  )
                }
              >
                <option value="">Pilih marketer</option>
                {marketers.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Branch
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.branch}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, branch: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Class
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.class}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, class: e.target.value } : prev
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  APE IDR
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.ape_idr}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, ape_idr: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  APE USD
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.ape_usd}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, ape_usd: e.target.value } : prev
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Ekspektasi Plan
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.execution_plan}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, execution_plan: e.target.value } : prev
                    )
                  }
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
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.quadrant}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, quadrant: e.target.value } : prev
                    )
                  }
                >
                  <option value="k1">k1</option>
                  <option value="k2">k2</option>
                  <option value="k3">k3</option>
                  <option value="k4">k4</option>
                </select>
              </div>
            </div>

            {/* STATUS & LEAD SOURCE */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Status
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, status: e.target.value } : prev
                    )
                  }
                >
                  <option value="prospecting">prospecting</option>
                  <option value="presentation">presentation</option>
                  <option value="proposal">proposal</option>
                  <option value="negotiation">negotiation</option>
                  <option value="closing">closing</option>
                  <option value="lost">lost</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Lead source
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.lead_source}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, lead_source: e.target.value } : prev
                    )
                  }
                >
                  <option value="referral">referral</option>
                  <option value="branch">branch staff</option>
                  <option value="walk-in">walk-in</option>
                  <option value="event">event</option>
                  <option value="digital">digital</option>
                </select>
              </div>
            </div>

            {/* EXPECTED CLOSING & LAST CONTACT */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Expected closing date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.expected_closing_date}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            expected_closing_date: e.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Last contact date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  value={editForm.last_contact_date}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev
                        ? { ...prev, last_contact_date: e.target.value }
                        : prev
                    )
                  }
                />
              </div>
            </div>

            {/* NEXT ACTION */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Next action
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300 min-h-12"
                value={editForm.next_action}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, next_action: e.target.value } : prev
                  )
                }
              />
            </div>

            {/* RISK TAG */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Risk / Objection tag
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                value={editForm.risk_tag}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, risk_tag: e.target.value } : prev
                  )
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Tanggal Pipeline
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300"
                value={editForm.pipeline_date}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, pipeline_date: e.target.value } : prev
                  )
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Keterangan
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-slate-300 min-h-12"
                value={editForm.remarks}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, remarks: e.target.value } : prev
                  )
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-priority"
                type="checkbox"
                className="h-3 w-3 rounded border-slate-300 text-slate-900"
                checked={editForm.priority_flag}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, priority_flag: e.target.checked }
                      : prev
                  )
                }
              />
              <label
                htmlFor="edit-priority"
                className="text-xs text-slate-700 cursor-pointer"
              >
                Tandai sebagai prioritas
              </label>
            </div>
          </div>
        )}


        {/* BUTTONS */}
        <div className="flex items-center justify-between mt-5 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
          >
            Tutup
          </button>

          {!editMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onStartEdit}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Edit
              </button>

              <button
                onClick={onDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? 'Menghapus…' : 'Delete'}
              </button>

              <button
                onClick={onCopyWA}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Copy WA
              </button>
            </div>
          )}

          {editMode && editForm && (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancelEdit}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={onSaveEdit}
                disabled={savingEdit}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingEdit ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

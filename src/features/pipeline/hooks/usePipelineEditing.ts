// src/features/pipeline/hooks/usePipelineEditing.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PipelineRow, PipelineEditForm } from '@/types/pipeline';

type UsePipelineEditingArgs = {
  userId: string | null;
  reloadPipelines: () => Promise<void>;
  setPipelines: React.Dispatch<React.SetStateAction<PipelineRow[]>>;
};

function parseMoneyInput(input: string): number | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[^\d.,-]/g, '');
  const hasDot = cleaned.includes('.');
  const hasComma = cleaned.includes(',');

  let normalized = cleaned;

  if (hasDot && hasComma) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastDot > lastComma) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      normalized = cleaned.replace(/,/g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(/,/g, '.');
    }
  } else if (hasDot && !hasComma) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      normalized = cleaned.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      normalized = cleaned.replace(/\./g, '');
    } else {
      normalized = cleaned;
    }
  }

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return num;
}

export function usePipelineEditing({
  userId,
  reloadPipelines,
  setPipelines,
}: UsePipelineEditingArgs) {
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<PipelineEditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      ape_idr: selectedPipeline.ape_idr != null ? String(selectedPipeline.ape_idr) : '',
      ape_usd: selectedPipeline.ape_usd != null ? String(selectedPipeline.ape_usd) : '',
      execution_plan: selectedPipeline.execution_plan ?? 'week 1',
      quadrant: selectedPipeline.quadrant ?? 'k1',
      remarks: selectedPipeline.remarks ?? '',
      priority_flag: !!selectedPipeline.priority_flag,
      pipeline_date: selectedPipeline.pipeline_date ?? '',
      status: selectedPipeline.status ?? 'prospecting',
      lead_source: selectedPipeline.lead_source ?? 'referral',
      expected_closing_date: selectedPipeline.expected_closing_date ?? '',
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
      const parsedApeIdr = parseMoneyInput(editForm.ape_idr);
      const parsedApeUsd = parseMoneyInput(editForm.ape_usd);

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
          expected_closing_date: editForm.expected_closing_date || null,
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

      await reloadPipelines();
      closeDetailModal();
    } finally {
      setSavingEdit(false);
    }
  };

  const deletePipeline = async (row: PipelineRow) => {
    const { error } = await supabase.from('pipelines').delete().eq('id', row.id);

    if (error) throw new Error(error.message);

    setPipelines((prev) => prev.filter((p) => p.id !== row.id));
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
      await deletePipeline(selectedPipeline);
      closeDetailModal();
    } catch (e: unknown) {
      if (e instanceof Error) setEditError(e.message);
      else setEditError('Gagal menghapus pipeline.');
    } finally {
      setDeleting(false);
    }
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
      ape_idr: row.ape_idr != null ? String(row.ape_idr) : '',
      ape_usd: row.ape_usd != null ? String(row.ape_usd) : '',
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
    const ok = window.confirm(`Yakin ingin menghapus pipeline untuk nasabah "${row.customer_name}"?`);
    if (!ok) return;

    try {
      await deletePipeline(row);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      else alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  return {
    selectedPipeline,
    showDetailModal,
    editMode,
    editForm,
    savingEdit,
    editError,
    deleting,

    openDetailModal,
    closeDetailModal,
    startEdit,
    cancelEdit,
    setEditForm,
    handleSaveEdit,
    handleDelete,
    handleEditFromTable,
    handleDeleteFromTable,
  };
}

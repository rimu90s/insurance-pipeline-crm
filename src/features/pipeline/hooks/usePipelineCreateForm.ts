// src/features/pipeline/hooks/usePipelineCreateForm.ts
import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UsePipelineCreateFormArgs = {
  userId: string | null;
  reloadPipelines: () => Promise<void>;
};

// Normalisasi input angka Indonesia/umum -> number | null
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
    if (lastDot > lastComma) normalized = cleaned.replace(/,/g, '');
    else normalized = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (hasComma && !hasDot) {
    const parts = cleaned.split(',');
    if (parts.length > 2) normalized = cleaned.replace(/,/g, '');
    else if (parts.length === 2 && parts[1].length === 3) normalized = cleaned.replace(/,/g, '');
    else normalized = cleaned.replace(/,/g, '.');
  } else if (hasDot && !hasComma) {
    const parts = cleaned.split('.');
    if (parts.length > 2) normalized = cleaned.replace(/\./g, '');
    else if (parts.length === 2 && parts[1].length === 3) normalized = cleaned.replace(/\./g, '');
  }

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return num;
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function usePipelineCreateForm({ userId, reloadPipelines }: UsePipelineCreateFormArgs) {
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

  // ✅ DEFAULT tanggal: hari ini
  const [pipelineDate, setPipelineDate] = useState<string>(todayYYYYMMDD());

  const [status, setStatus] = useState<string>('prospecting');
  const [leadSource, setLeadSource] = useState<string>('referral');
  const [expectedClosingDate, setExpectedClosingDate] = useState<string>('');
  const [lastContactDate, setLastContactDate] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [riskTag, setRiskTag] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

    // ✅ RESET tetap hari ini (biar masuk filter "today")
    setPipelineDate(todayYYYYMMDD());

    setFormError(null);

    setStatus('prospecting');
    setLeadSource('referral');
    setExpectedClosingDate('');
    setLastContactDate('');
    setNextAction('');
    setRiskTag('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<boolean> => {
    e.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError('User tidak valid. Silakan login ulang.');
      return false;
    }

    if (!productId || !customerName) {
      setFormError('Produk dan nama nasabah wajib diisi.');
      return false;
    }

    // ✅ Safety: pastikan tanggal tidak kosong (kalau user hapus manual)
    const safePipelineDate = (pipelineDate || todayYYYYMMDD()).trim();

    setSaving(true);

    try {
      const parsedApeIdr = parseMoneyInput(apeIdr);
      const parsedApeUsd = parseMoneyInput(apeUsd);

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

        // ✅ jangan biarkan null by default
        pipeline_date: safePipelineDate,

        status: status || 'prospecting',
        lead_source: leadSource || 'referral',
        expected_closing_date: expectedClosingDate || null,
        last_contact_date: lastContactDate || null,
        next_action: nextAction || null,
        risk_tag: riskTag || null,
      });

      if (error) {
        setFormError(error.message);
        return false;
      }

      await reloadPipelines();
      resetForm();
      return true;
    } finally {
      setSaving(false);
    }
  };

  return {
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

    saving,
    formError,
    resetForm,
    handleSubmit,
  };
}

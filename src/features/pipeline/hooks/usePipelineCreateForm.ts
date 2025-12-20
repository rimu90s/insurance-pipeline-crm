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

  // ambil hanya digit, koma, titik, minus
  const cleaned = raw.replace(/[^\d.,-]/g, '');

  // kasus umum Indonesia: "1.000.000" -> "1000000"
  // jika ada koma dan titik sekaligus, biasanya koma untuk decimal (en-US) atau ID? kita ambil aman:
  // - jika format "1,234.56" => hapus koma (thousands) -> "1234.56"
  // - jika format "1.234,56" => hapus titik (thousands) lalu ganti koma jadi titik -> "1234.56"
  const hasDot = cleaned.includes('.');
  const hasComma = cleaned.includes(',');

  let normalized = cleaned;

  if (hasDot && hasComma) {
    // tentukan mana decimal separator: lihat yang paling kanan
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');

    if (lastDot > lastComma) {
      // dot sebagai decimal, koma sebagai ribuan
      normalized = cleaned.replace(/,/g, '');
    } else {
      // koma sebagai decimal, titik sebagai ribuan
      normalized = cleaned.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    // "1000,5" => decimal comma -> ganti ke dot
    // tapi kalau "1,000,000" (comma ribuan) itu juga mungkin.
    // heuristik: jika setelah koma ada 3 digit dan ada beberapa koma -> treat sebagai ribuan
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      normalized = cleaned.replace(/,/g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(/,/g, '.');
    }
  } else if (hasDot && !hasComma) {
    // "1.000.000" -> ribuan (hapus semua dot) jika pattern ribuan
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      normalized = cleaned.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      normalized = cleaned.replace(/\./g, '');
    } else {
      normalized = cleaned; // kemungkinan decimal dot
    }
  }

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return num;
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
  const [pipelineDate, setPipelineDate] = useState<string>('');

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
    setPipelineDate('');
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
        ape_idr: parsedApeIdr, // number | null
        ape_usd: parsedApeUsd, // number | null
        execution_plan: executionPlan,
        quadrant: quadrant,
        remarks: remarks || null,
        priority_flag: priorityFlag,
        pipeline_date: pipelineDate || null,
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

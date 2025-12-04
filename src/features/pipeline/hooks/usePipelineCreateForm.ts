// src/features/pipeline/hooks/usePipelineCreateForm.ts
import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UsePipelineCreateFormArgs = {
  userId: string | null;
  reloadPipelines: () => Promise<void>;
};

export function usePipelineCreateForm({ userId, reloadPipelines }: UsePipelineCreateFormArgs) {
  // STATE: Form create pipeline
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

  // field tambahan (status, lead source, dll)
  const [status, setStatus] = useState<string>('prospecting');
  const [leadSource, setLeadSource] = useState<string>('referral');
  const [expectedClosingDate, setExpectedClosingDate] = useState<string>(''); // YYYY-MM-DD
  const [lastContactDate, setLastContactDate] = useState<string>(''); // YYYY-MM-DD
  const [nextAction, setNextAction] = useState<string>('');
  const [riskTag, setRiskTag] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form ke nilai awal
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

  // handler submit yang hanya mengurus:
  // - validasi
  // - insert ke supabase
  // - reload pipelines
  // - reset form
  //
  // UI seperti: toast, tutup modal, dll → tetap di PipelinePage
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
    // state dan setter
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

    // control
    saving,
    formError,
    resetForm,
    handleSubmit,
  };
}

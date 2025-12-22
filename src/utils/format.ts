// src/utils/format.ts

// Format tanggal ke dd/mm/yyyy
export const formatDateId = (value?: string | null) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID');
};

// Format APE IDR
export const formatIdr = (value?: number | null) =>
  value != null ? 'Rp ' + value.toLocaleString('id-ID') : '-';

// Format APE USD
export const formatUsd = (value?: number | null) =>
  value != null ? '$' + value.toLocaleString('en-US') : '-';

// Format status pipeline
export const prettyStatus = (status?: string | null) => {
  if (!status) return '-';
  const map: Record<string, string> = {
    prospecting: 'Prospecting',
    approach: 'Approach',
    presentation: 'Presentation',
    follow_up: 'Follow up',
    negotiation: 'Negotiation',
    closing: 'Closing',
    closed_lost: 'Closed Lost',
  };
  return map[status] ?? status;
};

// Format leadsource pipeline
export const prettyLeadSource = (source?: string | null) => {
  if (!source) return '-';
  const map: Record<string, string> = {
    referral: 'Referral',
    bank: 'Bank',
    digital_ads: 'Digital Ads',
    walk_in: 'Walk-in',
    agent_referral: 'Agent Referral',
    existing_customer: 'Existing Customer',
  };
  return map[source] ?? source;
};

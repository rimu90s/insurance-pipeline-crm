export type PipelineRow = {
  id: string;
  customer_name: string;
  branch: string | null;
  class: string | null;
  ape_idr: number | null;
  ape_usd: number | null;
  execution_plan: string | null;
  quadrant: string | null;
  remarks: string | null;
  priority_flag: boolean | null;
  pipeline_date: string | null;
  product_id: string;
  marketer_id: string;
  status: string | null;                 // prospecting / presentation / proposal / negotiation / closing / lost
  lead_source: string | null;            // referral / walk-in / branch / event / digital / etc.
  expected_closing_date: string | null;  // YYYY-MM-DD
  last_contact_date: string | null;      // YYYY-MM-DD
  next_action: string | null;            // rencana follow up
  risk_tag: string | null;               // isu utama
};

export type PipelineEditForm = {
  product_id: string;
  marketer_id: string;
  customer_name: string;
  branch: string;
  class: string;
  ape_idr: string;
  ape_usd: string;
  execution_plan: string;
  quadrant: string;
  remarks: string;
  priority_flag: boolean;
  pipeline_date: string;
  status: string;
  lead_source: string;
  expected_closing_date: string;
  last_contact_date: string;
  next_action: string;
  risk_tag: string;
};

// ─────────────────────────────────────────────
// Master data types (products, marketers)
// ─────────────────────────────────────────────

export type ProductMaster = {
  id: string;
  name: string;
  // kolom lain dari tabel products boleh ada tapi tidak wajib di-define
  [key: string]: unknown;
};

export type MarketerMaster = {
  id: string;
  name: string;
  branch: string | null; // sesuaikan dengan kebutuhan UI (boleh null/undefined)
  [key: string]: unknown;
};


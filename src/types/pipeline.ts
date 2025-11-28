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
};

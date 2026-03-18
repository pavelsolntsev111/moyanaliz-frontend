export type AppStep = "upload" | "modal" | "analyzing" | "paywall";

export type Gender = "male" | "female";

export type ResultStatus =
  | "pending_payment"
  | "processing"
  | "ready"
  | "payment_failed"
  | "error";

export type IndicatorStatus = "normal" | "low" | "high" | "critical";

export interface AnalysisIndicator {
  id: string;
  name: string;
  shortName: string;
  value: number;
  textValue?: string;
  unit: string;
  status: IndicatorStatus;
  referenceMin: number;
  referenceMax: number;
  hasRange?: boolean;
  explanation: string;
}

export interface LightIndicator {
  name: string;
  short_name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: "normal" | "above_normal" | "below_normal" | "critical_high" | "critical_low";
  short_description: string;
}

export interface PreviewData {
  meta: {
    analysis_type_label: string;
    lab_name: string | null;
    total_count: number;
    out_of_range_count: number;
  };
  indicators: LightIndicator[];
}

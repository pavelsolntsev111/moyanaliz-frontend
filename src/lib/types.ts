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
  unit: string;
  status: IndicatorStatus;
  referenceMin: number;
  referenceMax: number;
  explanation: string;
}

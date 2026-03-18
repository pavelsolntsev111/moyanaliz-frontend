import type { PreviewData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

export interface UploadResponse {
  order_id: string;
  preview: PreviewData | null;
}

export interface DetectPatientResponse {
  patient_sex: "male" | "female" | null;
  patient_age: number | null;
}

export async function detectPatient(file: File): Promise<DetectPatientResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<DetectPatientResponse>("/api/v1/detect-patient", {
    method: "POST",
    body: formData,
  });
}

export async function uploadFile(
  file: File,
  sex: string,
  age: number
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sex", sex);
  formData.append("age", String(age));
  return request<UploadResponse>("/api/v1/upload", {
    method: "POST",
    body: formData,
  });
}

export interface PaymentCreateResponse {
  redirect_url: string;
}

export async function createPayment(
  orderId: string,
  email: string
): Promise<PaymentCreateResponse> {
  return request<PaymentCreateResponse>("/api/v1/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, email }),
  });
}

export interface PromoResponse {
  ok: boolean;
  redirect_url: string;
}

export async function applyPromo(
  orderId: string,
  email: string,
  promoCode: string
): Promise<PromoResponse> {
  return request<PromoResponse>("/api/v1/payment/promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, email, promo_code: promoCode }),
  });
}

export interface OrderStatus {
  order_id: string;
  payment_status: string;
  processing_status: string;
  email_status: string;
  email?: string | null;
  pdf_download_url: string | null;
  claude_result_json?: {
    meta: {
      detected_analysis_types: string[];
      analysis_type_labels: string[];
      patient_sex: string;
      patient_age: number;
      lab_name: string | null;
      analysis_date: string | null;
      total_indicators_count: number;
      out_of_range_count: number;
      general_notes: string;
      general_conclusion?: string;
    };
    reports: Array<{
      analysis_type: string;
      analysis_type_label: string;
      summary: string;
      indicators: Array<{
        name: string;
        value: string;
        unit: string;
        reference_range: string;
        status: string;
        status_label: string;
        interpretation: string;
        severity: string;
        recommendations?: {
          nutrition: string | null;
          supplements: string | null;
          recheck: string | null;
          doctor: string | null;
        };
      }>;
    }>;
    stis_special_section?: {
      is_present: boolean;
      notice: string;
      results: Array<{
        test_name: string;
        result: string;
        result_type: string;
        interpretation: string;
      }>;
      general_recommendation: string;
    };
    questions_for_doctor: Array<string | { question: string; context: string }>;
    disclaimer: string;
  };
}

export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return request<OrderStatus>(`/api/v1/order/${orderId}/status`);
}

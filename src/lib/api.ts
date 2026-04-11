import type { PreviewData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://moyanaliz-backend-production.up.railway.app";

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

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
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
  promoCode?: string,
  withChat?: boolean
): Promise<PaymentCreateResponse> {
  const body: Record<string, unknown> = { order_id: orderId };
  if (promoCode) body.promo_code = promoCode;
  if (withChat) body.with_chat = true;
  return request<PaymentCreateResponse>("/api/v1/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function setOrderEmail(
  orderId: string,
  email: string
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/v1/order/${orderId}/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
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

export interface PromoValidateResponse {
  valid: boolean;
  free?: boolean;
  discount_percent?: number;
  discounted_price?: number;
  original_price?: number;
  uses_left?: number;
  reason?: string;
}

export async function validatePromo(
  promoCode: string
): Promise<PromoValidateResponse> {
  return request<PromoValidateResponse>("/api/v1/payment/validate-promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promo_code: promoCode }),
  });
}

export interface ChatPaymentResponse {
  redirect_url: string;
  chat_token?: string;
}

export async function createChatPayment(orderId: string): Promise<ChatPaymentResponse> {
  return request<ChatPaymentResponse>("/api/v1/payment/create-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
}

export interface OrderStatus {
  order_id: string;
  payment_status: string;
  processing_status: string;
  email_status: string;
  email?: string | null;
  promo_code?: string | null;
  pdf_download_url: string | null;
  chat_payment_status?: string;
  chat_status?: string;
  chat_telegram_link?: string | null;
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
        interpretation?: string;
        what_is?: string;
        sources?: string;
        recommendation?: string;
        severity: string;
        recommendations?: {
          nutrition: string | null;
          supplements: string | null;
          recheck: string | null;
          doctor: string | null;
        };
      }>;
    }>;
    nutrition?: {
      products_to_add: Array<{ product: string; reason: string; frequency?: string }>;
      products_to_limit: Array<{ product: string; reason: string }>;
      supplements_note: string | null;
    };
    action_plan?: {
      urgent: string[];
      soon: string[];
      control: string[];
    };
    additional_tests?: Array<{ test: string; reason: string }>;
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

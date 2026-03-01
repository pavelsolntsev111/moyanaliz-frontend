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
  payment_url: string;
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
  pdf_download_url: string | null;
}

export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return request<OrderStatus>(`/api/v1/order/${orderId}/status`);
}

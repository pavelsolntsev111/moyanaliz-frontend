// API client for the web chat. Mirrors backend/app/routers/chat_web.py.
//
// Streaming is done via fetch + ReadableStream + TextDecoder — works on all
// modern Chrome / Safari (>=14.5) / Firefox / Edge. On older Android WebViews
// the request will either error fast (no body stream) or behave like a long
// POST returning all text at once; either way the UI degrades gracefully
// because we treat the `done` event as the source of truth, not the deltas.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moyanaliz-backend-production.up.railway.app";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface OrderMeta {
  order_id: string;
  customer_name: string | null;
  analysis_date: string | null;
  lab_name: string | null;
  indicators_total: number | null;
  indicators_out_of_range: number | null;
  analysis_type_labels: string[];
  email: string | null;
}

export type SessionReason =
  | "ok"
  | "needs_payment"
  | "not_purchased"
  | "expired_time"
  | "expired_limit"
  | "report_not_ready";

export interface ChatState {
  paid: boolean;
  phase: "free" | "paid";
  can_send: boolean;
  reason: SessionReason;
  remaining: number;
  total_allowed: number;
  user_messages_used: number;
  expires_at: string | null;
  report_ready: boolean;
  processing_status: string;
  messages: ChatMessage[];
  order: OrderMeta;
  extension_price: number;
  paid_messages_per_extension: number;
}

export async function getChatState(
  token: string,
  init?: { cache?: RequestCache }
): Promise<ChatState> {
  const res = await fetch(`${API_URL}/api/v1/chat/${token}/state`, {
    method: "GET",
    cache: init?.cache ?? "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Не удалось загрузить чат (${res.status})`);
  }
  return res.json();
}

export interface ExtensionResponse {
  redirect_url: string;
  payment_id?: string | null;
  mock?: boolean;
}

export async function createChatExtension(token: string): Promise<ExtensionResponse> {
  const res = await fetch(`${API_URL}/api/v1/chat/${token}/extend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Не удалось создать платёж (${res.status})`);
  }
  return res.json();
}

// ─── SSE streaming ──────────────────────────────────────────────────────────
// Event types from backend (chat_web.py):
//   "ready"  — first frame after opening (proxy buffer flush)
//   "text"   — { delta: string, full: string }
//   "done"   — { remaining: number, expires_at: string|null, emergency?: bool }
//   "error"  — { message: string, code: string }

export type StreamEvent =
  | { type: "ready" }
  | { type: "text"; delta: string; full: string }
  | { type: "done"; remaining: number; expires_at: string | null; emergency?: boolean }
  | { type: "error"; message: string; code: string };

export interface StreamHandle {
  abort: () => void;
  done: Promise<void>;
}

/**
 * Stream a chat message response. Returns a handle with abort() and done promise.
 *
 * The caller's onEvent is invoked for each parsed SSE event. The done promise
 * resolves when the stream ends naturally (done event or close), and rejects
 * only on transport errors that happen BEFORE the stream opened (e.g. 4xx).
 * Errors during the stream surface via an "error" SSE event, not a rejection.
 */
export function streamChatMessage(
  token: string,
  text: string,
  onEvent: (event: StreamEvent) => void
): StreamHandle {
  const controller = new AbortController();

  const done = (async () => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/v1/chat/${token}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onEvent({
        type: "error",
        message: "Не удалось отправить сообщение. Проверьте интернет.",
        code: "network",
      });
      return;
    }

    if (!response.ok) {
      // Parse detail to surface specific reasons (paywall, expired, etc.)
      let detail: { reason?: string; message?: string } | string = "";
      try {
        const body = await response.json();
        detail = body.detail ?? "";
      } catch {
        detail = `HTTP ${response.status}`;
      }
      const message =
        typeof detail === "object" && detail?.message
          ? detail.message
          : typeof detail === "string" && detail
          ? detail
          : `HTTP ${response.status}`;
      const code =
        typeof detail === "object" && detail?.reason
          ? detail.reason
          : `http_${response.status}`;
      onEvent({ type: "error", message, code });
      return;
    }

    if (!response.body) {
      onEvent({
        type: "error",
        message: "Браузер не поддерживает потоковую загрузку",
        code: "no_stream_body",
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE frames are separated by \n\n. Keep the last (possibly incomplete)
        // chunk in buffer for the next iteration.
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const frame of parts) {
          const parsed = parseSseFrame(frame);
          if (parsed) onEvent(parsed);
        }
      }

      // Flush any leftover frame (rare — usually the done event arrives before close)
      if (buffer.trim()) {
        const parsed = parseSseFrame(buffer);
        if (parsed) onEvent(parsed);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onEvent({
        type: "error",
        message: "Соединение прервано. Попробуйте ещё раз.",
        code: "stream_interrupted",
      });
    }
  })();

  return {
    abort: () => controller.abort(),
    done,
  };
}

function parseSseFrame(frame: string): StreamEvent | null {
  let event = "message";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith(":")) continue; // comment / keepalive
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    const payload = JSON.parse(data);
    switch (event) {
      case "ready":
        return { type: "ready" };
      case "text":
        return {
          type: "text",
          delta: payload.delta ?? "",
          full: payload.full ?? "",
        };
      case "done":
        return {
          type: "done",
          remaining: payload.remaining ?? 0,
          expires_at: payload.expires_at ?? null,
          emergency: payload.emergency,
        };
      case "error":
        return {
          type: "error",
          message: payload.message ?? "Ошибка",
          code: payload.code ?? "unknown",
        };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

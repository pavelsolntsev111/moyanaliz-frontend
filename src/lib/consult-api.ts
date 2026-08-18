// API client for the standalone AI health consultation.
// Mirrors backend/app/routers/consult.py.
//
// The SSE wire protocol is byte-identical to the analysis chat, so the frame
// parser is imported from chat-api rather than duplicated — one parser, one
// place to fix if the protocol ever changes.

import { parseSseFrame, type StreamEvent, type StreamHandle } from "./chat-api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moyanaliz-backend-production.up.railway.app";

/** Where the browser remembers its session, so a returning visitor lands back in it. */
export const CONSULT_TOKEN_KEY = "consult_token";

export interface ConsultMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ConsultPack {
  id: string;
  title: string;
  questions: number;
  price: number;
  per_question: number;
}

export type ConsultReason =
  | "ok"
  | "needs_payment"
  | "out_of_questions"
  | "blocked"
  | "disabled";

export interface ConsultState {
  can_send: boolean;
  reason: ConsultReason;
  phase: "free" | "paid";
  remaining: number;
  total_allowed: number;
  free_questions: number;
  paid_questions: number;
  questions_used: number;
  has_paid: boolean;
  email: string | null;
  channel: string;
  telegram_linked: boolean;
  messages: ConsultMessage[];
  packs: ConsultPack[];
  greeting: string;
  disclaimer: string;
}

export interface StartResult {
  token: string;
  free_questions: number;
}

export interface ConsultPacksInfo {
  enabled: boolean;
  free_questions: number;
  packs: ConsultPack[];
}

/**
 * Advertised prices for the landing page.
 *
 * Used with ISR so the SEO page never blocks on the API, and the caller is
 * expected to fall back to its own constants on failure — /ai-konsultant must
 * render even when the backend is unreachable, which has happened.
 */
export async function getConsultPacks(): Promise<ConsultPacksInfo> {
  const res = await fetch(`${API_URL}/api/v1/consult/packs`, {
    next: { revalidate: 3600 },
  });
  return jsonOrThrow(res, "Не удалось получить тарифы");
}

async function jsonOrThrow(res: Response, fallback: string) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body?.detail;
    const message =
      typeof detail === "object" && detail?.message
        ? detail.message
        : typeof detail === "string" && detail
        ? detail
        : `${fallback} (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export interface StartOptions {
  utm_params?: Record<string, string>;
  referrer?: string;
  landing_url?: string;
}

/** Open a session. `consent` is mandatory — the backend rejects false. */
export async function startConsult(opts: StartOptions = {}): Promise<StartResult> {
  const res = await fetch(`${API_URL}/api/v1/consult/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consent: true, ...opts }),
  });
  return jsonOrThrow(res, "Не удалось начать консультацию");
}

export async function getConsultState(
  token: string,
  init?: { cache?: RequestCache }
): Promise<ConsultState> {
  const res = await fetch(`${API_URL}/api/v1/consult/${token}/state`, {
    method: "GET",
    cache: init?.cache ?? "no-store",
  });
  return jsonOrThrow(res, "Не удалось загрузить консультацию");
}

export interface ConsultPayResult {
  redirect_url: string;
  payment_id?: string | null;
  mock?: boolean;
}

export async function payConsult(
  token: string,
  pack: string,
  email: string
): Promise<ConsultPayResult> {
  const res = await fetch(`${API_URL}/api/v1/consult/${token}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pack, email }),
  });
  return jsonOrThrow(res, "Не удалось создать платёж");
}

export async function getTelegramLink(
  token: string
): Promise<{ deep_link: string; bot_username: string }> {
  const res = await fetch(`${API_URL}/api/v1/consult/${token}/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return jsonOrThrow(res, "Не удалось получить ссылку на Телеграм");
}

/**
 * Stream one answer. Same contract as streamChatMessage: the returned promise
 * resolves when the stream ends; failures surface as "error" events, not
 * rejections, so the caller has one code path for all of them.
 */
export function streamConsultMessage(
  token: string,
  text: string,
  onEvent: (event: StreamEvent) => void
): StreamHandle {
  const controller = new AbortController();

  const done = (async () => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/v1/consult/${token}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onEvent({
        type: "error",
        message: "Не удалось отправить вопрос. Проверьте интернет.",
        code: "network",
      });
      return;
    }

    if (!response.ok) {
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
      for (;;) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const frame of parts) {
          const parsed = parseSseFrame(frame);
          if (parsed) onEvent(parsed);
        }
      }
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

  return { abort: () => controller.abort(), done };
}

export type { StreamEvent, StreamHandle };

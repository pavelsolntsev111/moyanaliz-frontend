"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import StatusHeader from "@/components/chat/StatusHeader";
import PaywallScreen from "@/components/chat/PaywallScreen";
import PipelineNotReadyScreen from "@/components/chat/PipelineNotReadyScreen";
import ExtensionBubble from "@/components/chat/ExtensionBubble";

import {
  getChatState,
  streamChatMessage,
  type ChatMessage,
  type ChatState,
  type StreamEvent,
} from "@/lib/chat-api";

interface ChatScreenProps {
  chatToken: string;
  initialState: ChatState;
}

/**
 * Top-level orchestrator for the chat page.
 *
 * State machine (driven by ChatState.reason + payment_status):
 *   not_purchased   → PaywallScreen
 *   report_not_ready → PipelineNotReadyScreen (with 2s polling)
 *   ok / can_send=true   → normal chat
 *   expired_limit / expired_time → chat + inline ExtensionBubble below messages
 */
export default function ChatScreen({ chatToken, initialState }: ChatScreenProps) {
  const router = useRouter();
  const [state, setState] = useState<ChatState>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialState.messages ?? []
  );
  const [streaming, setStreaming] = useState<{
    content: string;
    emergency?: boolean;
  } | null>(null);
  const [inflight, setInflight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamAbortRef = useRef<(() => void) | null>(null);
  // Track current "remaining" optimistically; refreshed on done event + /state
  const [remainingOpt, setRemainingOpt] = useState<number>(initialState.remaining);

  // ─── Remove sensitive query params from URL after first paint ─────────
  // (Token still in path — we accept that for MVP — but no need to keep
  // ?chat=activated / ?extended=1 hanging around to confuse refresh.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("chat") || url.searchParams.has("extended")) {
      url.searchParams.delete("chat");
      url.searchParams.delete("extended");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // ─── State refresh: light polling for countdown + payment confirmation ──
  //
  // - Default: poll every 30s for accurate "ещё 22ч" countdown.
  // - Aggressive (every 2s) when one of:
  //     (a) we returned from a YK payment (?chat= / ?extended= in URL)
  //     (b) chat is paid+ready but messages=[] — backend is generating the
  //         greeting, we want it on screen ASAP.
  useEffect(() => {
    let interval: number | null = null;
    let aggressivePollUntil = 0;

    // Detect return from YK payment via URL query
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("chat") || params.has("extended")) {
        aggressivePollUntil = Date.now() + 60_000;
      }
    }

    // Greeting-pending case: messages still empty on initial mount
    if (messages.length === 0 && state.paid && state.report_ready) {
      aggressivePollUntil = Math.max(aggressivePollUntil, Date.now() + 30_000);
    }

    const tick = async () => {
      try {
        const fresh = await getChatState(chatToken);
        setState(fresh);
        // Don't replace messages array if we're mid-stream — backend hasn't
        // seen our optimistic user message yet.
        if (!streaming && !inflight) {
          setMessages(fresh.messages);
          setRemainingOpt(fresh.remaining);
        }
      } catch {
        /* swallow polling errors */
      }
    };

    const schedule = () => {
      const aggressive = Date.now() < aggressivePollUntil;
      const delay = aggressive ? 2000 : 30_000;
      interval = window.setTimeout(async () => {
        await tick();
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      if (interval) clearTimeout(interval);
    };
    // We deliberately re-subscribe when messages.length flips from 0 → 1+
    // so aggressive polling stops as soon as the greeting arrives.
  }, [chatToken, streaming, inflight, messages.length, state.paid, state.report_ready]);

  // ─── Send a message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text: string) => {
      if (inflight) return;
      setError(null);
      setInflight(true);

      // Optimistic: show user message immediately
      const userMsg: ChatMessage = {
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming({ content: "" });

      let isEmergency = false;
      const handle = streamChatMessage(chatToken, text, (ev: StreamEvent) => {
        switch (ev.type) {
          case "ready":
            // Stream opened. First text frame will replace empty content.
            break;
          case "text":
            setStreaming((prev) => ({
              content: ev.full,
              emergency: prev?.emergency,
            }));
            break;
          case "done":
            // Finalize: collapse the streaming bubble into the messages list.
            // Use functional setStreaming to read the latest accumulated text
            // (closing over `streaming` here would see a stale value).
            isEmergency = ev.emergency ?? false;
            setStreaming((cur) => {
              const finalContent = cur?.content ?? "";
              if (finalContent) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: finalContent,
                    timestamp: new Date().toISOString(),
                  },
                ]);
              }
              return null;
            });
            if (!isEmergency && typeof ev.remaining === "number" && ev.remaining >= 0) {
              setRemainingOpt(ev.remaining);
            }
            setInflight(false);
            break;
          case "error":
            // Roll back optimistic user message? No — they did send it, the
            // failure is on our side. Show error but keep the message so
            // they can resubmit.
            setStreaming(null);
            setInflight(false);
            // Map known error codes to friendlier messages
            setError(translateError(ev.code, ev.message));
            break;
        }
      });

      streamAbortRef.current = handle.abort;
      handle.done.finally(() => {
        // Defensive: if we somehow exited without done/error events
        setInflight((cur) => {
          if (cur) {
            setStreaming(null);
            return false;
          }
          return cur;
        });
      });
    },
    [chatToken, inflight, streaming?.content]
  );

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => {
      streamAbortRef.current?.();
    };
  }, []);

  // ─── Render branches ─────────────────────────────────────────────────────

  // Not paid → paywall
  if (!state.paid) {
    return (
      <PaywallScreen
        orderId={state.order.order_id}
        price={state.extension_price}
        paidMessages={state.paid_messages_per_extension}
        durationHours={24}
      />
    );
  }

  // Paid but pipeline still running → block
  if (!state.report_ready) {
    return <PipelineNotReadyScreen orderId={state.order.order_id} />;
  }

  // ─── Normal chat UI ──────────────────────────────────────────────────────
  const showExtension =
    state.reason === "expired_limit" || state.reason === "expired_time";

  const remaining = inflight ? Math.max(remainingOpt - 1, 0) : remainingOpt;

  return (
    <div
      className="flex flex-col bg-[var(--background)]"
      style={{ minHeight: "100dvh", maxHeight: "100dvh" }}
    >
      <StatusHeader
        order={state.order}
        remaining={remaining}
        totalAllowed={state.total_allowed}
        expiresAt={state.expires_at}
        paid={state.paid}
      />

      <MessageList
        messages={messages}
        streaming={streaming}
        footer={
          showExtension ? (
            <ExtensionBubble
              chatToken={chatToken}
              price={state.extension_price}
              paidMessages={state.paid_messages_per_extension}
              reason={state.reason as "expired_limit" | "expired_time"}
            />
          ) : null
        }
      />

      {error && (
        <div
          role="alert"
          className="mx-3 mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {state.can_send ? (
        <MessageInput
          onSend={sendMessage}
          disabled={inflight}
          placeholder="Спросите про ваш анализ…"
        />
      ) : (
        // Either expired or out-of-questions — ExtensionBubble shows above.
        // Keep the area visually balanced with a hint footer.
        <div
          className="shrink-0 px-4 py-3 text-center text-sm text-slate-500 bg-white border-t border-slate-200"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          Чтобы продолжить — продлите консультацию выше ↑
        </div>
      )}
    </div>
  );
}

function translateError(code: string, fallback: string): string {
  switch (code) {
    case "needs_payment":
      return "Чат не оплачен. Перезагрузите страницу.";
    case "expired_limit":
      return "Вопросы закончились. Можете продлить за 49 ₽.";
    case "expired_time":
      return "Сессия истекла. Можете продлить за 49 ₽.";
    case "report_not_ready":
      return "Отчёт ещё готовится. Попробуйте через минуту.";
    case "network":
    case "stream_interrupted":
      return "Проблема с интернетом. Попробуйте ещё раз.";
    case "no_stream_body":
      return "Ваш браузер не поддерживает потоковые ответы. Обновите Chrome / Safari.";
    case "llm_error":
    case "internal_error":
      return "Ошибка обработки. Попробуйте задать вопрос ещё раз.";
    default:
      return fallback || "Произошла ошибка. Попробуйте ещё раз.";
  }
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import ConsultHeader from "@/components/consult/ConsultHeader";
import ConsultPaywall from "@/components/consult/ConsultPaywall";
import {
  CONSULT_TOKEN_KEY,
  getConsultState,
  streamConsultMessage,
  type ConsultMessage,
  type ConsultState,
  type StreamEvent,
} from "@/lib/consult-api";
import { ymGoal } from "@/lib/ym";

interface ConsultScreenProps {
  token: string;
  initialState: ConsultState;
}

/** sessionStorage handoff from the landing composer (see ConsultComposer). */
const PENDING_QUESTION_KEY = "consult_pending_question";

/**
 * Orchestrator for the standalone consultation.
 *
 * Deliberately simpler than the analysis ChatScreen: there is no report to wait
 * for and no 24h timer, so the only axis is "are there questions left".
 *   can_send                      → chat + input
 *   needs_payment / out_of_questions → chat + inline paywall, input disabled
 *   blocked / disabled            → notice
 */
export default function ConsultScreen({ token, initialState }: ConsultScreenProps) {
  const [state, setState] = useState<ConsultState>(initialState);
  const [messages, setMessages] = useState<ConsultMessage[]>(initialState.messages ?? []);
  const [streaming, setStreaming] = useState<{ content: string; emergency?: boolean } | null>(
    null
  );
  const [inflight, setInflight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingOpt, setRemainingOpt] = useState(initialState.remaining);
  const [justPaid, setJustPaid] = useState(false);

  // Mirrors `inflight` for callbacks that would otherwise close over a stale
  // value — `refresh` must never overwrite the optimistic list mid-stream.
  const busyRef = useRef(false);

  // ─── Remember the session so a returning visitor lands back in it ────────
  useEffect(() => {
    try {
      localStorage.setItem(CONSULT_TOKEN_KEY, token);
    } catch {
      /* private mode — the emailed link is the fallback */
    }
  }, [token]);

  // The server is the source of truth for both the history and the counter.
  // Pulling it after every completed answer keeps an optimistic double-render
  // (a remount that re-sends, a retried stream) from leaving a duplicate
  // bubble on screen or a counter that disagrees with what was charged.
  const refresh = useCallback(async () => {
    try {
      const fresh = await getConsultState(token);
      setState(fresh);
      if (!busyRef.current) {
        setMessages(fresh.messages);
        setRemainingOpt(fresh.remaining);
      }
      return fresh;
    } catch {
      return null;
    }
  }, [token]);

  // ─── Send ────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text: string) => {
      if (busyRef.current) return;
      setError(null);
      busyRef.current = true;
      setInflight(true);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: new Date().toISOString() },
      ]);
      setStreaming({ content: "" });
      ymGoal("consult_question_sent", { phase: state.phase });

      const handle = streamConsultMessage(token, text, (ev: StreamEvent) => {
        switch (ev.type) {
          case "ready":
            break;
          case "text":
            setStreaming((prev) => ({ content: ev.full, emergency: prev?.emergency }));
            break;
          case "done": {
            const isEmergency = ev.emergency ?? false;
            // An answer exists now — the landing handoff can't replay.
            try {
              sessionStorage.removeItem(PENDING_QUESTION_KEY);
            } catch {
              /* ignore */
            }
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
            busyRef.current = false;
            setInflight(false);
            void refresh();
            break;
          }
          case "error":
            setStreaming(null);
            busyRef.current = false;
            setInflight(false);
            setError(translateError(ev.code, ev.message));
            // 402 means the server disagrees with our optimistic counter —
            // resync rather than leaving a live input the backend will reject.
            if (ev.code === "needs_payment" || ev.code === "out_of_questions") {
              void refresh();
            }
            break;
        }
      });

      handle.done.finally(() => {
        setInflight((cur) => {
          if (cur) {
            busyRef.current = false;
            setStreaming(null);
            return false;
          }
          return cur;
        });
      });
    },
    [token, refresh, state.phase]
  );

  // ─── First question handed over from the landing composer ────────────────
  //
  // The handoff is cleared only once an answer exists, not on read. If this
  // mount is torn down mid-stream — React StrictMode in dev, a fast back/
  // forward, a browser reclaiming the tab — the next mount re-sends it. That is
  // safe because the backend treats "same question, still unanswered" as a free
  // retry, so the user is never charged twice and never left with a question
  // that has no answer.
  useEffect(() => {
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_QUESTION_KEY);
    } catch {
      /* ignore */
    }
    if (!pending) return;

    const lastIsUnanswered =
      messages.length > 0 && messages[messages.length - 1].role === "user";
    const shouldSend =
      (messages.length === 0 && initialState.can_send) || lastIsUnanswered;

    if (shouldSend) {
      sendMessage(pending);
    } else {
      // Session already moved on — drop the stale handoff so it can't replay.
      try {
        sessionStorage.removeItem(PENDING_QUESTION_KEY);
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Return from YooKassa ────────────────────────────────────────────────
  // The webhook usually beats the browser back, but "usually" is how orders sat
  // in `pending` for 12 hours. /state reconciles against YooKassa on every read,
  // so polling here converges even when the webhook is lost entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("paid")) return;

    setJustPaid(true);
    ymGoal("consult_payment_done");
    const url = new URL(window.location.href);
    url.searchParams.delete("paid");
    window.history.replaceState({}, "", url.pathname);

    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      if (cancelled || attempts >= 15) return;
      attempts += 1;
      const fresh = await refresh();
      if (fresh?.has_paid && fresh.remaining > 0) return;
      setTimeout(poll, 2000);
    };
    void poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deliberately NOT aborting the stream on unmount.
  //
  // The question is charged before the model runs, and the answer is stored
  // only when the stream reaches `done` — so aborting a stream mid-flight is
  // how a paid question ends up with nothing to show for it. Letting it run to
  // completion means the answer is waiting whenever the user comes back, and
  // the browser tears the request down by itself on a real navigation. It also
  // keeps a remount (React StrictMode, bfcache restore, fast refresh) from
  // cancelling the very request the new mount is waiting on.

  if (state.reason === "disabled") {
    return (
      <Notice
        title="Консультант временно недоступен"
        body="Мы ненадолго отключили чат. Попробуйте зайти позже."
      />
    );
  }
  if (state.reason === "blocked") {
    return (
      <Notice
        title="Сессия закрыта"
        body="Эта консультация заблокирована. Напишите на support@moyanaliz.ru, если это ошибка."
      />
    );
  }

  const showPaywall = !state.can_send && (
    state.reason === "needs_payment" || state.reason === "out_of_questions"
  );
  const remaining = inflight ? Math.max(remainingOpt - 1, 0) : remainingOpt;

  return (
    <div
      className="flex flex-col bg-[var(--background)]"
      style={{ minHeight: "100dvh", maxHeight: "100dvh" }}
    >
      <ConsultHeader
        token={token}
        remaining={remaining}
        hasPaid={state.has_paid}
        telegramLinked={state.telegram_linked}
      />

      {justPaid && state.has_paid && state.remaining > 0 && (
        <div className="mx-3 mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Оплата получена — доступно {state.remaining} вопросов. Ссылку продублировали
          вам на почту.
        </div>
      )}

      <MessageList
        messages={messages.length ? messages : [greetingMessage(state.greeting)]}
        streaming={streaming}
        footer={
          showPaywall ? (
            <ConsultPaywall
              token={token}
              packs={state.packs}
              email={state.email}
              hasPaid={state.has_paid}
            />
          ) : null
        }
      />

      {error && (
        <div
          role="alert"
          className="mx-3 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {state.can_send ? (
        <>
          <MessageInput
            onSend={sendMessage}
            disabled={inflight}
            placeholder="Спросите о здоровье…"
          />
          <p className="shrink-0 bg-white px-4 pb-2 text-center text-[11px] leading-snug text-slate-400">
            {state.disclaimer}
          </p>
        </>
      ) : (
        <div
          className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-500"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          Чтобы продолжить — выберите пакет выше ↑
        </div>
      )}
    </div>
  );
}

function greetingMessage(greeting: string): ConsultMessage {
  // Rendered client-side only, never persisted: it costs no LLM call and no
  // question, and a fresh session should not look like an empty box.
  return { role: "assistant", content: greeting };
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)] px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
        <a
          href="/ai-konsultant"
          className="mt-5 inline-block rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Вернуться
        </a>
      </div>
    </div>
  );
}

function translateError(code: string, fallback: string): string {
  switch (code) {
    case "needs_payment":
    case "out_of_questions":
      return "Вопросы закончились — выберите пакет ниже.";
    case "blocked":
      return "Сессия заблокирована. Напишите на support@moyanaliz.ru.";
    case "network":
    case "stream_interrupted":
      return "Проблема с интернетом. Попробуйте ещё раз.";
    case "no_stream_body":
      return "Ваш браузер не поддерживает потоковые ответы. Обновите Chrome или Safari.";
    case "llm_error":
    case "internal_error":
      return "Ошибка обработки. Попробуйте задать вопрос ещё раз.";
    default:
      return fallback || "Произошла ошибка. Попробуйте ещё раз.";
  }
}

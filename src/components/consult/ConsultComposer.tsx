"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, MessageCircle } from "lucide-react";

import { CONSULT_TOKEN_KEY, startConsult } from "@/lib/consult-api";
import { getAttribution, getEntryPage } from "@/lib/attribution";
import { ymGoal } from "@/lib/ym";

const PENDING_QUESTION_KEY = "consult_pending_question";
const MAX_CHARS = 2000;

const EXAMPLES = [
  "Что означает повышенный ферритин?",
  "К какому врачу идти с постоянной усталостью?",
  "Какие обследования обычно делают перед беременностью?",
  "Что спросить у эндокринолога на приёме?",
];

interface ConsultComposerProps {
  packPrice: number;
  packQuestions: number;
}

/**
 * Entry point to the consultation, sitting where the "готовим запуск" card was.
 *
 * The question is typed here, on the SEO page, and the session is created on
 * submit — no channel-choice screen, no signup, no email in front of the value.
 * The choice of Telegram lives inside the chat instead, where it costs nothing
 * to ignore.
 *
 * The typed text crosses to /ai-chat via sessionStorage, never via the URL:
 * this is health information, and query strings end up in server logs, Referer
 * headers and browser history.
 */
export default function ConsultComposer({
  packPrice,
  packQuestions,
}: ConsultComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingToken, setExistingToken] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Returning visitor: offer the session back instead of silently opening a
  // second one (which would hand out another set of free questions and lose
  // their history behind a token nobody has).
  useEffect(() => {
    try {
      setExistingToken(localStorage.getItem(CONSULT_TOKEN_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const submit = async (text?: string) => {
    const question = (text ?? value).trim();
    if (!question || busy) return;
    if (question.length > MAX_CHARS) {
      setError(`Вопрос длиннее ${MAX_CHARS} символов — сократите, пожалуйста.`);
      return;
    }
    setBusy(true);
    setError(null);
    ymGoal("consult_started");

    try {
      const attribution = getAttribution() ?? undefined;
      const { token } = await startConsult({
        utm_params: attribution
          ? {
              ...(attribution.utm_source && { utm_source: attribution.utm_source }),
              ...(attribution.utm_medium && { utm_medium: attribution.utm_medium }),
              ...(attribution.utm_campaign && { utm_campaign: attribution.utm_campaign }),
              ...(attribution.utm_content && { utm_content: attribution.utm_content }),
              ...(attribution.utm_term && { utm_term: attribution.utm_term }),
              ...(attribution.yclid && { yclid: attribution.yclid }),
            }
          : undefined,
        referrer: attribution?.referrer,
        landing_url: attribution?.landing_url,
        entry_page: getEntryPage() ?? undefined,
      });
      try {
        sessionStorage.setItem(PENDING_QUESTION_KEY, question);
        localStorage.setItem(CONSULT_TOKEN_KEY, token);
      } catch {
        /* private mode: the chat page still opens, user re-types once */
      }
      router.push(`/ai-chat/${token}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <p className="text-base font-semibold text-card-foreground">
          Спросите — начало беседы бесплатно
        </p>
      </div>

      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            void submit();
          }
        }}
        rows={2}
        maxLength={MAX_CHARS + 100}
        disabled={busy}
        placeholder="Например: третий месяц держится усталость, какие анализы имеет смысл сдать?"
        // >=16px keeps iOS Safari from zooming the page on focus
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-base leading-relaxed outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || !value.trim()}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40 sm:w-auto"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? "Открываем чат…" : "Задать вопрос"}
        {!busy && <ArrowRight className="h-4 w-4" />}
      </button>

      {error && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Или начните с готового вопроса:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={busy}
              onClick={() => {
                setValue(ex);
                taRef.current?.focus();
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {existingToken && (
        <p className="mt-4 text-xs text-muted-foreground">
          У вас уже есть начатая консультация —{" "}
          <a
            href={`/ai-chat/${existingToken}`}
            className="font-medium text-primary underline"
          >
            вернуться к ней
          </a>
          .
        </p>
      )}

      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Начало беседы бесплатно, дальше — {packQuestions} вопросов за {packPrice} ₽.
        Купленные вопросы не сгорают.
        Отвечает нейросеть, а не врач: это не диагноз и не назначение.
        <br />
        Отправляя вопрос, вы даёте{" "}
        <a href="/consent" className="underline hover:text-primary">
          согласие на обработку персональных данных
        </a>
        , включая сведения о здоровье, и принимаете{" "}
        <a href="/offer" className="underline hover:text-primary">
          условия оферты
        </a>
        .
      </p>
    </div>
  );
}

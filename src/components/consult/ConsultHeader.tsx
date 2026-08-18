"use client";

import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

import { getTelegramLink } from "@/lib/consult-api";
import { ymGoal } from "@/lib/ym";

interface ConsultHeaderProps {
  token: string;
  remaining: number;
  hasPaid: boolean;
  /** Hide the Telegram button once the user is already there. */
  telegramLinked: boolean;
}

/**
 * Sticky top bar: identity, remaining-questions counter, Telegram hand-off.
 *
 * The Telegram button lives here rather than on a pre-chat choice screen: the
 * user asks their first question without choosing anything, and switching
 * channels stays available at every moment instead of being a gate in front of
 * the value. The link carries the same session, so history follows the user.
 */
export default function ConsultHeader({
  token,
  remaining,
  hasPaid,
  telegramLinked,
}: ConsultHeaderProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openTelegram = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { deep_link } = await getTelegramLink(token);
      ymGoal("consult_telegram_open");
      window.open(deep_link, "_blank", "noopener");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Link
          href="/ai-konsultant"
          aria-label="К описанию сервиса"
          className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-800">
            ИИ-консультант по здоровью
          </div>
          <div className="truncate text-xs text-slate-500">
            {remaining > 0 ? (
              <>
                Осталось вопросов: <span className="font-medium">{remaining}</span>
                {!hasPaid && " · пробный доступ"}
              </>
            ) : (
              "Вопросы закончились"
            )}
          </div>
        </div>

        {!telegramLinked && (
          <button
            type="button"
            onClick={openTelegram}
            disabled={busy}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            <Send size={13} />
            <span className="hidden xs:inline sm:inline">В Телеграм</span>
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 pb-2 text-xs text-red-600" role="alert">
          {error}
        </div>
      )}
    </header>
  );
}

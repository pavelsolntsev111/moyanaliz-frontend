"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { createChatExtension } from "@/lib/chat-api";

interface ExtensionBubbleProps {
  chatToken: string;
  price: number;
  paidMessages: number;
  /** "expired_limit" or "expired_time" — shapes the copy. */
  reason: "expired_limit" | "expired_time";
}

/**
 * Inline "bubble" card shown when the user hits their question limit or
 * the 24h session expires. Renders inside the messages stream (not a modal)
 * so context stays visible while they decide.
 */
export default function ExtensionBubble({
  chatToken,
  price,
  paidMessages,
  reason,
}: ExtensionBubbleProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtend = async () => {
    setBusy(true);
    setError(null);
    try {
      const { redirect_url } = await createChatExtension(chatToken);
      window.location.href = redirect_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать платёж");
      setBusy(false);
    }
  };

  const title =
    reason === "expired_limit"
      ? "Вопросы закончились"
      : "Время сессии истекло";
  const body =
    reason === "expired_limit"
      ? "Если разбор анализа поднял ещё вопросы — продлите консультацию. История нашего разговора сохранится."
      : "Хотите продолжить? История разговора сохранится, и таймер обнулится.";

  return (
    <div className="rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--accent)] to-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-[var(--primary)]" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-700 leading-snug">{body}</p>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleExtend}
        disabled={busy}
        className="mt-4 w-full h-11 rounded-xl bg-[var(--primary)] text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Открываем оплату…
          </>
        ) : (
          <>Продлить — +{paidMessages} вопросов за {price} ₽</>
        )}
      </button>
    </div>
  );
}

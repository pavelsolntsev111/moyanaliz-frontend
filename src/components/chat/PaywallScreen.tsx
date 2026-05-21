"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles, Clock, Loader2 } from "lucide-react";
import { useState } from "react";

import { createChatPayment } from "@/lib/api";

interface PaywallScreenProps {
  orderId: string;
  price: number;
  paidMessages: number;
  durationHours: number;
  /**
   * When non-null, we're polling an existing in-flight payment (pending state).
   * Renders a disabled button + spinner. Parent does the actual polling.
   */
  pending?: boolean;
}

/**
 * Shown when /chat/[token] opens but chat_payment_status !== "paid".
 * Lets the user pay 49 ₽ → redirects to YooKassa → on return their state
 * polls to paid and the chat unlocks.
 */
export default function PaywallScreen({
  orderId,
  price,
  paidMessages,
  durationHours,
  pending,
}: PaywallScreenProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setBusy(true);
    setError(null);
    try {
      const { redirect_url } = await createChatPayment(orderId);
      // YK redirect or mock-mode same-app redirect
      window.location.href = redirect_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать платёж");
      setBusy(false);
    }
  };

  const disabled = busy || !!pending;

  return (
    <div
      className="flex flex-col bg-[var(--background)]"
      style={{ minHeight: "100dvh" }}
    >
      <header
        className="shrink-0 bg-white border-b border-slate-200"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Link
            href={`/result/${orderId}`}
            aria-label="Назад к отчёту"
            className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="font-semibold text-slate-900">Мой Анализ</span>
        </div>
      </header>

      <main
        className="flex-1 flex flex-col px-5 pt-8 pb-6 max-w-md w-full mx-auto"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-5">
            <MessageSquare size={32} className="text-[var(--accent-foreground)]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            AI-консультант по вашим анализам
          </h1>
          <p className="text-slate-600 mt-2 text-[15px] leading-relaxed">
            Задайте вопросы про ваши показатели — ИИ ответит с учётом ваших
            конкретных результатов.
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          <FeatureRow
            icon={<MessageSquare size={18} className="text-[var(--primary)]" />}
            text={`${paidMessages} вопросов — спросите что угодно про этот анализ`}
          />
          <FeatureRow
            icon={<Sparkles size={18} className="text-[var(--primary)]" />}
            text="Контекст уже загружен — не нужно ничего объяснять"
          />
          <FeatureRow
            icon={<Clock size={18} className="text-[var(--primary)]" />}
            text={`${durationHours} часа на использование`}
          />
        </ul>

        <div className="flex-1" />

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={disabled}
          className="w-full h-14 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition disabled:opacity-60"
        >
          {disabled ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {pending ? "Подтверждаем оплату…" : "Открываем оплату…"}
            </>
          ) : (
            <>Оплатить — {price} ₽</>
          )}
        </button>

        <p className="text-xs text-slate-500 text-center mt-3">
          Оплата через ЮКассу. После оплаты вернётесь сюда и сразу сможете
          задавать вопросы.
        </p>
      </main>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 mt-0.5 size-7 rounded-full bg-[var(--accent)] flex items-center justify-center">
        {icon}
      </span>
      <span className="text-slate-700 text-[15px] leading-snug">{text}</span>
    </li>
  );
}

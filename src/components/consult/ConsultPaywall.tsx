"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { payConsult, type ConsultPack } from "@/lib/consult-api";
import { ymGoal } from "@/lib/ym";

interface ConsultPaywallProps {
  token: string;
  packs: ConsultPack[];
  /** Already-known email (returning buyer) prefills the field. */
  email: string | null;
  /** True after the first purchase — changes the copy from "продолжить" to "докупить". */
  hasPaid: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Inline paywall card, rendered at the bottom of the conversation rather than
 * as a full-screen takeover — the user keeps seeing the answers they already
 * got, which is the actual argument for paying.
 *
 * Email is required here and nowhere earlier: it is the 54-ФЗ receipt recipient
 * and the only way back into a session that otherwise lives behind a secret URL
 * in one browser tab.
 */
export default function ConsultPaywall({
  token,
  packs,
  email: knownEmail,
  hasPaid,
}: ConsultPaywallProps) {
  const [selected, setSelected] = useState(packs[0]?.id ?? "pack10");
  const [email, setEmail] = useState(knownEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const pack = packs.find((p) => p.id === selected) ?? packs[0];

  const submit = async () => {
    if (!pack || !emailValid || busy) return;
    setBusy(true);
    setError(null);
    ymGoal("consult_click_pay", { pack: pack.id, price: pack.price });
    try {
      const { redirect_url } = await payConsult(token, pack.id, email.trim());
      window.location.href = redirect_url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  if (!pack) return null;

  return (
    <div className="mx-3 my-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[15px] font-semibold text-slate-900">
        {hasPaid ? "Вопросы закончились" : "Пробные вопросы закончились"}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Продолжайте разговор — история сохранится. Купленные вопросы{" "}
        <span className="font-medium text-slate-800">не сгорают</span>: задавайте их когда
        удобно, хоть через месяц.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {packs.map((p) => {
          const active = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              aria-pressed={active}
              className={[
                "rounded-xl border px-3 py-3 text-left transition",
                active
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30"
                  : "border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{p.title}</span>
                {active && <Check size={15} className="shrink-0 text-[var(--primary)]" />}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">{p.price} ₽</div>
              <div className="text-xs text-slate-500">
                {p.per_question} ₽ за вопрос
              </div>
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-slate-600">
          Email — пришлём чек и ссылку на этот диалог
        </span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        />
        <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
          Без него доступ останется только в этой вкладке — закроете, и вопросы
          будет не вернуть.
        </span>
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={!emailValid || busy}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
      >
        {busy && <Loader2 size={16} className="animate-spin" />}
        {busy ? "Переходим к оплате…" : `Оплатить ${pack.price} ₽`}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Оплата через ЮKassa. Отвечает нейросеть, а не врач — ответы информационные,
        это не диагноз и не назначение.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  orderId: string;
  onPay: (email: string) => void;
  onPromo: (email: string, promoCode: string) => void;
  loading?: boolean;
}

export default function PaywallScreen({ orderId, onPay, onPromo, loading }: Props) {
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Анализ готов
        </div>
        <h1 className="text-2xl font-bold">Ваш анализ расшифрован</h1>
        <p className="text-sm text-muted mt-1">
          Один показатель — бесплатно. Полный отчёт — 199 &#8381;
        </p>
      </div>

      {/* Free indicator */}
      <div className="rounded-2xl border border-border bg-white p-5 mb-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/15 text-success">
            Бесплатно
          </span>
        </div>
        <div className="rounded-xl bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
              <span className="text-sm font-medium">Гемоглобин</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">118 г/л</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                Ниже нормы
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-foreground/60 mb-1.5 ml-4">
            Гемоглобин — белок в эритроцитах, который переносит кислород от
            лёгких к органам и тканям.
          </p>
          <p className="text-xs leading-relaxed text-foreground/80 pl-4 border-l-2 border-primary/30 ml-0.5 font-medium">
            Ниже нормы для женщин (референс 120–140 г/л). Возможна
            железодефицитная анемия. Рекомендуется сдать ферритин и сывороточное
            железо для уточнения. Обратитесь к терапевту.
          </p>
        </div>
      </div>

      {/* Blurred remaining indicators + paywall overlay */}
      <div className="relative rounded-2xl border border-border bg-white overflow-hidden">
        {/* Blurred content */}
        <div className="blur-[6px] pointer-events-none select-none p-5 space-y-3">
          {[
            { dot: "bg-success", text: "Эритроциты (RBC): 4.5 ×10¹²/л — Норма" },
            { dot: "bg-warning", text: "СОЭ: 22 мм/ч — Выше нормы. Может указывать на..." },
            { dot: "bg-success", text: "Лейкоциты (WBC): 6.2 ×10⁹/л — Норма" },
            { dot: "bg-success", text: "Тромбоциты (PLT): 245 ×10⁹/л — Норма" },
            { dot: "bg-danger", text: "Глюкоза: 6.4 ммоль/л — Выше нормы. Рекомендуется..." },
            { dot: "bg-success", text: "Холестерин: 4.8 ммоль/л — Норма" },
            { dot: "bg-success", text: "АЛТ: 18 Ед/л — Норма" },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${row.dot} mt-1 shrink-0`} />
              <div className="text-sm">{row.text}</div>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <div className="text-sm font-medium mb-2">Вопросы для врача:</div>
            <div className="text-sm text-muted">1. Стоит ли сдать ферритин для...</div>
            <div className="text-sm text-muted">2. Нужна ли консультация...</div>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mx-4 max-w-sm w-full text-center">
            <svg
              className="w-8 h-8 text-primary mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <h3 className="font-bold text-lg mb-1">
              Полный отчёт — 199 &#8381;
            </h3>
            <p className="text-sm text-muted mb-4">
              Расшифровка всех показателей, рекомендации и вопросы для врача
            </p>

            <input
              type="email"
              placeholder="Ваш email для получения отчёта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition mb-1"
            />
            <p className="text-xs text-muted mb-3 text-left">
              Введите адрес электронной почты, куда отправить отчёт
            </p>

            <button
              disabled={!emailValid || loading}
              onClick={() => emailValid && onPay(email)}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Создаём ссылку..." : "Оплатить 199 \u20BD и увидеть полный отчёт"}
            </button>

            {/* Promo code */}
            {!showPromo ? (
              <button
                onClick={() => setShowPromo(true)}
                className="mt-3 text-xs text-muted hover:text-primary transition underline"
              >
                Есть промокод?
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Промокод"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition"
                />
                <button
                  disabled={!promo.trim() || !emailValid || loading}
                  onClick={() =>
                    promo.trim() && emailValid && onPromo(email, promo.trim())
                  }
                  className="px-4 py-2 rounded-lg bg-foreground text-white text-sm font-medium hover:bg-foreground/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Применить
                </button>
              </div>
            )}

            <p className="text-[11px] text-muted mt-3">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <a href="/offer" className="underline">
                офертой
              </a>{" "}
              и{" "}
              <a href="/privacy" className="underline">
                политикой конфиденциальности
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

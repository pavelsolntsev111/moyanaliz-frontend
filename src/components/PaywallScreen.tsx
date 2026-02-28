"use client";

import { useState } from "react";
import BlurredPreview from "./BlurredPreview";

interface Props {
  orderId: string;
  onPay: (email: string) => void;
  loading?: boolean;
}

const BULLETS = [
  "12 показателей проанализировано",
  "Отклонения от нормы выделены",
  "Рекомендации по каждому показателю",
  "Вопросы для обсуждения с врачом",
];

export default function PaywallScreen({ orderId, onPay, loading }: Props) {
  const [email, setEmail] = useState("");
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
      </div>

      <BlurredPreview />

      <ul className="space-y-3 my-6">
        {BULLETS.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm">
            <svg
              className="w-5 h-5 text-primary shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Ваш email для получения отчёта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border-2 border-border px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
        />
        <button
          disabled={!emailValid || loading}
          onClick={() => emailValid && onPay(email)}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Создаём ссылку..." : "Оплатить 199 \u20BD"}
        </button>
      </div>

      <p className="text-xs text-muted text-center mt-4">
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
  );
}

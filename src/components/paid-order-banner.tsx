"use client";

import { useEffect, useState } from "react";
import { ArrowRight, FileText } from "lucide-react";

import { getOrderStatus } from "@/lib/api";

/**
 * Возврат к оплаченному, но не забранному отчёту.
 *
 * ⚠️ Зачем: ~6.5% оплат не получают отчёт вообще (баг 98ef32b087). Клиент
 * уходит на оплату в той же вкладке; банк/СБП открывает своё приложение, и
 * назад на /result человек уже не возвращается. Почты у него мы не спросили —
 * она собирается ПОСЛЕ оплаты, — значит написать ему нечем: за 30 дней сами
 * дошли лишь ~11%. Единственная зацепка, которая остаётся на его устройстве, —
 * вот эта запись в localStorage. Деньги взяты, услуга не оказана.
 *
 * Показываем только своему покупателю на его же устройстве и только пока отчёт
 * действительно не забран: как только письмо ушло, запись стирается и баннер
 * исчезает навсегда.
 */

const KEY = "moyanaliz_last_order";
const MAX_AGE_MS = 30 * 24 * 3600 * 1000; // дальше исходник всё равно удаляет чистка

type Stored = { id: string; ts: number };

/** Запомнить заказ перед уходом на оплату. Тихо молчит в приватном режиме. */
export function rememberPendingOrder(orderId: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ id: orderId, ts: Date.now() } satisfies Stored));
  } catch {
    /* приватный режим — баннера просто не будет */
  }
}

function forget() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function PaidOrderBanner() {
  const [order, setOrder] = useState<{ id: string; needsEmail: boolean } | null>(null);

  useEffect(() => {
    let stored: Stored | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      stored = raw ? (JSON.parse(raw) as Stored) : null;
    } catch {
      return;
    }
    if (!stored?.id) return;
    if (!stored.ts || Date.now() - stored.ts > MAX_AGE_MS) {
      forget();
      return;
    }
    let alive = true;
    getOrderStatus(stored.id)
      .then((s) => {
        if (!alive) return;
        if (s.payment_status !== "paid") {
          // Оплаты не было (передумал на странице банка) — не напоминаем о ней.
          if (Date.now() - stored!.ts > 24 * 3600 * 1000) forget();
          return;
        }
        // Забрал: почта указана и письмо ушло — напоминать больше не о чем.
        if (s.email && s.email_status === "sent") {
          forget();
          return;
        }
        setOrder({ id: stored!.id, needsEmail: !s.email });
      })
      .catch(() => {
        /* сеть/404 — баннер не критичен, молчим */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!order) return null;

  return (
    <a
      href={`/result/${order.id}`}
      className="mx-auto mb-6 flex w-full max-w-2xl items-center gap-3 rounded-2xl border-2 p-4 transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-950/30"
      style={{ borderColor: "#86efac", background: "#f0fdf4" }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(22,163,74,0.12)" }}
      >
        <FileText className="h-5 w-5" style={{ color: "#16a34a" }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold" style={{ color: "#15803d" }}>
          У вас есть оплаченный отчёт
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {order.needsEmail
            ? "Укажите почту — и мы пришлём расшифровку. Платить повторно не нужно."
            : "Откройте расшифровку. Платить повторно не нужно."}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "#16a34a" }} />
    </a>
  );
}

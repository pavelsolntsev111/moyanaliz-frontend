"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Copy, CheckCircle2, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAbonementStatus, type AbonementStatus } from "@/lib/api";
import { ymGoal } from "@/lib/ym";

function AbonementSuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [status, setStatus] = useState<AbonementStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    let stopped = false;
    let attempts = 0;
    const maxAttempts = 60; // ~3 минуты при интервале 3с

    async function poll() {
      while (!stopped && attempts < maxAttempts) {
        try {
          const s = await getAbonementStatus(orderId!);
          if (stopped) return;
          setStatus(s);
          if (s.payment_status === "paid" && s.promo_code) {
            ymGoal("payment_done");
            setPolling(false);
            return;
          }
        } catch {
          /* keep polling */
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 3000));
      }
      setPolling(false);
    }

    poll();
    return () => {
      stopped = true;
    };
  }, [orderId]);

  const handleCopy = () => {
    if (!status?.promo_code) return;
    navigator.clipboard.writeText(status.promo_code.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        {!orderId && (
          <div className="rounded-xl border border-border bg-card p-6">
            <p>Не указан идентификатор заказа.</p>
            <Link href="/abonement" className="mt-4 inline-block text-primary underline">
              ← Вернуться к покупке
            </Link>
          </div>
        )}

        {orderId && status?.payment_status === "paid" && status.promo_code && (
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-xl md:p-10">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold md:text-3xl">Абонемент активирован</h1>
            </div>

            <p className="mt-4 text-muted-foreground">
              Спасибо! Платёж прошёл. Мы отправили промокод на{" "}
              <strong>{status.email}</strong> — а вот он сразу:
            </p>

            <div className="mt-6 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Ваш промокод
              </div>
              <div className="mt-2 font-mono text-2xl font-bold tracking-wider text-primary md:text-3xl">
                {status.promo_code.toUpperCase()}
              </div>
              <button
                onClick={handleCopy}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-background px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Скопировано!" : "Скопировать код"}
              </button>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="font-medium">10 использований</div>
                <div className="text-muted-foreground">
                  Хватит на 10 расшифровок анализов
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="font-medium">12 месяцев действия</div>
                <div className="text-muted-foreground">
                  Используйте в любое время в течение года
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="font-medium">Для всей семьи</div>
                <div className="text-muted-foreground">
                  Расшифровывайте свои анализы и анализы близких
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-lg font-semibold">Как использовать</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                Загружайте анализ на{" "}
                <Link href="/" className="text-primary underline">
                  moyanaliz.ru
                </Link>
              </li>
              <li>На экране оплаты введите промокод выше</li>
              <li>Расшифровка пойдёт без оплаты</li>
            </ol>

            <Link
              href="/"
              className="mt-8 block w-full rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Загрузить первый анализ
            </Link>
          </div>
        )}

        {orderId && status?.payment_status !== "paid" && polling && (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            <h1 className="mt-4 text-xl font-semibold">Подтверждаем оплату</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Это занимает обычно 10–30 секунд. Не закрывайте страницу.
            </p>
          </div>
        )}

        {orderId && !polling && status?.payment_status !== "paid" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Платёж обрабатывается</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Мы пока не получили подтверждение от ЮКассы. Это нормально —
                  иногда оно приходит с задержкой. Промокод придёт на ваш email
                  в течение нескольких минут.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Если через 30 минут письма не будет — напишите на{" "}
                  <a
                    href="mailto:support@moyanaliz.ru"
                    className="text-primary underline"
                  >
                    support@moyanaliz.ru
                  </a>{" "}
                  с указанием email и времени оплаты.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function AbonementSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Загружаем...</div>}>
      <AbonementSuccessInner />
    </Suspense>
  );
}

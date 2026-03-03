"use client";

import { useEffect, useState, useCallback, use } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getOrderStatus, type OrderStatus } from "@/lib/api";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default function ResultPage({ params }: Props) {
  const { orderId } = use(params);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const s = await getOrderStatus(orderId);
      setStatus(s);
      return s;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки статуса");
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const s = await poll();
      if (!active) return;
      if (
        s &&
        s.processing_status !== "completed" &&
        s.processing_status !== "error" &&
        s.payment_status !== "failed"
      ) {
        setTimeout(run, 3000);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [poll]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16">
          {error && <ErrorScreen message={error} />}
          {!error && !status && <LoadingScreen />}
          {!error && status && <StatusScreen status={status} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="text-center">
      <Spinner />
      <p className="mt-4 text-muted-foreground">Загрузка...</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-destructive mb-2">Ошибка</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function StatusScreen({ status }: { status: OrderStatus }) {
  // Awaiting payment
  if (
    status.payment_status === "awaiting" ||
    status.payment_status === "pending"
  ) {
    return (
      <div className="text-center">
        <Spinner />
        <h1 className="text-xl font-semibold mt-6 text-foreground">
          Ожидаем подтверждение оплаты...
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Обычно это занимает несколько секунд
        </p>
      </div>
    );
  }

  // Payment failed
  if (status.payment_status === "failed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Оплата не прошла
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Попробуйте снова или используйте другой способ оплаты
        </p>
        <a
          href="/"
          className="inline-block py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          Попробовать снова
        </a>
      </div>
    );
  }

  // Processing
  if (
    status.processing_status === "processing" ||
    status.processing_status === "not_started"
  ) {
    return (
      <div className="text-center">
        <Spinner />
        <h1 className="text-xl font-semibold mt-6 text-foreground">
          Анализируем ваши результаты...
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Обычно это занимает 30–60 секунд
        </p>
        <div className="mt-6 w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  // Completed
  if (status.processing_status === "completed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Ваш отчёт готов!
        </h1>
        {status.email_status === "sent" && (
          <p className="text-sm text-muted-foreground mt-2">
            Отчёт также отправлен на вашу электронную почту
          </p>
        )}
        {status.pdf_download_url && (
          <a
            href={status.pdf_download_url}
            download
            className="mt-6 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Скачать PDF
          </a>
        )}
      </div>
    );
  }

  // Error
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-foreground">
        Произошла ошибка
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        Напишите нам на{" "}
        <a
          href="mailto:support@moyanaliz.ru"
          className="text-primary underline"
        >
          support@moyanaliz.ru
        </a>{" "}
        и мы решим проблему
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="relative w-12 h-12 mx-auto">
      <div className="absolute inset-0 rounded-full border-4 border-border" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

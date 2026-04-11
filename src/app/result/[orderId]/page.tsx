"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ymGoal } from "@/lib/ym";
import { getOrderStatus, setOrderEmail, createChatPayment, type OrderStatus } from "@/lib/api";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  MessageCircleQuestion,
  ShieldAlert,
  Apple,
  Pill,
  CalendarCheck,
  Stethoscope,
  FileText,
  UtensilsCrossed,
  CircleAlert,
  Clock,
  RotateCcw,
  CircleMinus,
  Plus,
  Mail,
  ArrowRight,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getIndicatorSlug } from "@/lib/indicators-data";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default function ResultPage({ params }: Props) {
  const { orderId } = use(params);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const goalKey = `payment_done_${orderId}`;
  const goalFired = useRef(typeof window !== "undefined" && localStorage.getItem(goalKey) === "1");

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

  // payment_done metric with localStorage deduplication
  useEffect(() => {
    if (
      status?.payment_status === "paid" &&
      typeof window !== "undefined" &&
      !localStorage.getItem(`payment_done_${orderId}`)
    ) {
      ymGoal("payment_done");
      localStorage.setItem(`payment_done_${orderId}`, "1");
    }
  }, [status?.payment_status, orderId]);

  // Re-fetch status when returning from chat payment (?chat=activated)
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.search.includes("chat=activated")) return;
    window.history.replaceState({}, "", window.location.pathname);
    let attempts = 0;
    const chatPoll = async () => {
      const s = await poll();
      if (s?.chat_payment_status === "paid" || attempts >= 10) return;
      attempts++;
      setTimeout(chatPoll, 2000);
    };
    chatPoll();
  }, [poll]);

  useEffect(() => {
    let active = true;
    let pdfRetries = 0;
    const run = async () => {
      const s = await poll();
      if (!active) return;
      if (s) {
        const terminal = s.processing_status === "completed" || s.processing_status === "error" || s.payment_status === "failed";
        if ((s.payment_status === "paid" || s.processing_status === "completed") && !goalFired.current) {
          goalFired.current = true;
          localStorage.setItem(goalKey, "1");
          ymGoal("payment_done");
        }
        if (!terminal) {
          setTimeout(run, 3000);
        } else if (s.processing_status === "completed" && !s.pdf_download_url && pdfRetries < 6) {
          pdfRetries++;
          setTimeout(run, 5000);
        }
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
        <div className="mx-auto max-w-3xl px-4 py-16">
          {error && <ErrorScreen message={error} />}
          {!error && !status && <LoadingScreen />}
          {!error && status && <StatusScreen status={status} orderId={orderId} />}
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
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-bold text-destructive mb-2">Ошибка</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function EmailCaptureCard({
  orderId,
  hasEmail,
  confirmText = "Пришлём PDF на ваш email когда отчёт будет готов",
  onSubmitted,
}: {
  orderId: string;
  hasEmail: boolean;
  confirmText?: string;
  onSubmitted?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(hasEmail);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmitEmail = async () => {
    if (!isValidEmail(email)) {
      setEmailError("Введите корректный email");
      return;
    }
    setSubmitting(true);
    setEmailError("");
    try {
      await setOrderEmail(orderId, email.trim());
      ymGoal("email_submitted");
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setEmailError("Не удалось сохранить email, попробуйте позже");
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-5 text-left">
      {submitted ? (
        <div className="flex items-center gap-2.5 text-sm text-emerald-600">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{confirmText}</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium text-card-foreground">
              Укажите email — пришлём PDF с отчётом
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmitEmail(); }}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              onClick={handleSubmitEmail}
              disabled={submitting}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "..." : "Готово"}
            </button>
          </div>
          {emailError && <p className="mt-2 text-xs text-destructive">{emailError}</p>}
        </>
      )}
    </div>
  );
}

function ProcessingScreen({ orderId, hasEmail, onEmailSubmitted, chatPaid }: { orderId: string; hasEmail: boolean; onEmailSubmitted?: () => void; chatPaid?: boolean }) {
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

      <div className="mt-8">
        <EmailCaptureCard orderId={orderId} hasEmail={hasEmail} onSubmitted={onEmailSubmitted} />
      </div>

      {chatPaid && (
        <div className="mt-4 mx-auto max-w-xs rounded-xl px-4 py-3 text-left" style={{ background: "rgba(0,180,188,0.07)", border: "1px solid rgba(0,180,188,0.18)" }}>
          <p className="text-xs text-primary font-medium leading-relaxed">
            💬 Консультация с ИИ-ассистентом станет доступна сразу после формирования отчёта
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">Не закрывайте окно браузера</p>
    </div>
  );
}

function EmailRequiredScreen({
  orderId,
  onSubmitted,
}: {
  orderId: string;
  onSubmitted: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async () => {
    if (!isValid(email)) {
      setError("Введите корректный email");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await setOrderEmail(orderId, email.trim());
      ymGoal("email_submitted");
      onSubmitted();
    } catch {
      setError("Не удалось сохранить email, попробуйте ещё раз");
      setSubmitting(false);
    }
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Куда отправить отчёт?
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Платёж получен ✓ Отчёт уже готовится — укажите email, чтобы получить
        PDF-отчёт и доступ к расшифровке.
      </p>

      <div className="rounded-2xl border border-border bg-card p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm font-medium text-card-foreground">
            Ваш email
          </p>
        </div>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="example@mail.ru"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Сохраняем…" : "Получить отчёт"}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Email нужен только для отправки отчёта. Никакого спама.
      </p>
    </div>
  );
}

function StatusScreen({ status, orderId }: { status: OrderStatus; orderId: string }) {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const hasEmail = !!status.email || emailSubmitted;

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

  if (status.payment_status === "failed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
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

  // Email gate: paid but no email yet → block UI until email is submitted
  if (status.payment_status === "paid" && !hasEmail) {
    return (
      <EmailRequiredScreen
        orderId={orderId}
        onSubmitted={() => setEmailSubmitted(true)}
      />
    );
  }

  if (
    status.processing_status === "processing" ||
    status.processing_status === "not_started" ||
    status.processing_status === "light_complete"
  ) {
    return <ProcessingScreen orderId={orderId} hasEmail={hasEmail} onEmailSubmitted={() => setEmailSubmitted(true)} chatPaid={status.chat_payment_status === "paid"} />;
  }

  if (status.processing_status === "completed" && status.claude_result_json) {
    return <FullReport status={status} orderId={orderId} hasEmail={hasEmail} onEmailSubmitted={() => setEmailSubmitted(true)} />;
  }

  if (status.processing_status === "completed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Отчёт готов
        </h1>
        {status.pdf_download_url ? (
          <a
            href={status.pdf_download_url}
            download
            onClick={() => ymGoal("pdf_downloaded")}
            className="mt-5 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <Download className="w-5 h-5" />
            Скачать PDF-отчёт
          </a>
        ) : (
          <button
            disabled
            className="mt-5 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold opacity-50 cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Скачать PDF-отчёт
          </button>
        )}
        <div className="mt-6">
          <EmailCaptureCard
            orderId={orderId}
            hasEmail={hasEmail}
            confirmText="PDF отправим на ваш email"
            onSubmitted={() => setEmailSubmitted(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">
        Произошла ошибка при анализе
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        Не волнуйтесь — попробуйте загрузить анализ ещё раз.
        <br />
        Если проблема повторится, напишите нам на{" "}
        <a
          href="mailto:support@moyanaliz.ru"
          className="text-primary underline"
        >
          support@moyanaliz.ru
        </a>
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
      >
        Загрузить анализ заново
      </a>
    </div>
  );
}

/* ─── Full Report (redesigned) ─── */

/** Genitive plural for "показатель": "1 показателя", "2 показателей", "5 показателей" */
function pluralIndicatorsGen(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} показателя`;
  return `${n} показателей`;
}

function FullReport({ status, orderId, hasEmail, onEmailSubmitted }: { status: OrderStatus; orderId: string; hasEmail: boolean; onEmailSubmitted?: () => void }) {
  useEffect(() => { ymGoal("analysis_viewed"); }, []);
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Ваш отчёт готов</h1>

      {status.email && (
        <p className="mt-2 text-sm text-muted-foreground">
          {status.email_status === "sent" ? "Отправлен" : "Будет отправлен"} на {status.email}
        </p>
      )}

      {status.pdf_download_url ? (
        <a
          href={status.pdf_download_url}
          download
          onClick={() => ymGoal("pdf_downloaded")}
          className="mt-6 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-sm"
        >
          <Download className="w-5 h-5" />
          Скачать PDF-отчёт
        </a>
      ) : (
        <button
          disabled
          className="mt-6 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold opacity-50 cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Скачать PDF-отчёт
        </button>
      )}

      {status.email_status === "sent" && (
        <p className="mt-3 text-xs text-muted-foreground/70">
          Не пришло? Проверьте «Спам» или напишите на{" "}
          <a href="mailto:support@moyanaliz.ru" className="text-primary underline">
            support@moyanaliz.ru
          </a>
        </p>
      )}

      {/* Chat upsell */}
      <ChatUpsellButton status={status} orderId={orderId} />

      {/* Email capture */}
      {!hasEmail && (
        <div className="mt-6">
          <EmailCaptureCard
            orderId={orderId}
            hasEmail={false}
            confirmText="PDF отправим на ваш email"
            onSubmitted={onEmailSubmitted}
          />
        </div>
      )}

      {/* Promo bonus block */}
      <div
        className="mt-8 mx-auto max-w-md rounded-xl p-5 text-center"
        style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}
      >
        <p className="text-lg font-bold text-primary">
          Промокод –30% на следующий анализ:
        </p>
        <p className="mt-1 text-2xl font-bold text-primary">
          30%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          введите в поле «Промокод» при оплате
        </p>
      </div>

      {/* Telegram channel */}
      <a
        href="https://t.me/moy_analiz"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 mx-auto max-w-md rounded-xl border border-border bg-card p-5 text-center block hover:border-[#0088cc]/30 transition-colors"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-[#0088cc]" />
          <p className="text-sm font-semibold text-foreground">Наш канал в Telegram</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Подпишись, если следишь за своим здоровьем и хочешь знать больше научных данных о своем теле
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0088cc]">@moy_analiz</p>
      </a>
    </div>
  );
}

/* ─── Chat upsell ─── */

function ChatUpsellButton({ status, orderId }: { status: OrderStatus; orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatPaid = status.chat_payment_status === "paid";
  const chatLink = status.chat_telegram_link;

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createChatPayment(orderId);
      if (res.redirect_url) {
        window.location.href = res.redirect_url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setLoading(false);
    }
  };

  if (chatPaid && chatLink) {
    return (
      <div
        className="mt-6 mx-auto max-w-md rounded-xl p-5 text-center"
        style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-semibold text-foreground">Чат активирован!</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Задайте до 10 вопросов по вашим анализам. Сессия 24 часа.
        </p>
        <a
          href={chatLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[#0088cc] text-white font-semibold hover:opacity-90 transition text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Открыть в Telegram
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 mx-auto max-w-md rounded-xl border border-border bg-card p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <p className="text-sm font-semibold text-foreground">Есть вопросы по анализам?</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Задайте до 10 вопросов AI-ассистенту по вашим анализам в Telegram.
      </p>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-sm disabled:opacity-50"
      >
        {loading ? "Переход к оплате..." : "Обсудить анализ — 100 ₽"}
      </button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ─── Abnormal indicator card ─── */

function AbnormalCard({
  indicator: ind,
}: {
  indicator: NonNullable<OrderStatus["claude_result_json"]>["reports"][0]["indicators"][0];
}) {
  // Parse range for display
  const rangeMatch = ind.reference_range.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/);
  const numValue = parseFloat(ind.value.replace(",", "."));
  const hasNumeric = !isNaN(numValue) && rangeMatch;

  let refMin = 0, refMax = 100, pct = 50;
  if (hasNumeric) {
    refMin = parseFloat(rangeMatch![1].replace(",", "."));
    refMax = parseFloat(rangeMatch![2].replace(",", "."));
    const range = refMax - refMin;
    const displayMin = refMin - range * 0.3;
    const displayMax = refMax + range * 0.3;
    pct = Math.max(0, Math.min(100, ((numValue - displayMin) / (displayMax - displayMin)) * 100));
  }

  const isBelow = ind.status === "below_normal" || ind.status === "critical_low";
  const statusColor = ind.severity === "severe" || ind.status.startsWith("critical")
    ? "text-red-600" : "text-orange-600";
  const statusBg = ind.severity === "severe" || ind.status.startsWith("critical")
    ? "bg-red-50" : "bg-orange-50";

  const recs = ind.recommendations;

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ borderLeft: "4px solid #FF523E" }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className={`text-base font-semibold ${statusColor}`}>{ind.name}</h3>
          <span className={`rounded-full ${statusBg} px-2.5 py-0.5 text-xs font-medium ${statusColor} whitespace-nowrap`}>
            {ind.status_label}
          </span>
        </div>

        {/* Value + range bar */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">{ind.value}</span>
          <span className="text-sm text-muted-foreground">{ind.unit}</span>
          {ind.reference_range && (
            <span className="text-xs text-muted-foreground ml-auto">
              норма: {ind.reference_range}
            </span>
          )}
        </div>

        {/* Range bar */}
        {hasNumeric && (
          <div className="relative h-2.5 w-full rounded-full bg-muted mb-4 overflow-hidden">
            {/* Normal zone */}
            <div
              className="absolute h-full bg-emerald-200"
              style={{
                left: `${((refMin - (refMin - (refMax - refMin) * 0.3)) / ((refMax + (refMax - refMin) * 0.3) - (refMin - (refMax - refMin) * 0.3))) * 100}%`,
                right: `${100 - ((refMax - (refMin - (refMax - refMin) * 0.3)) / ((refMax + (refMax - refMin) * 0.3) - (refMin - (refMax - refMin) * 0.3))) * 100}%`,
              }}
            />
            {/* Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
              style={{
                left: `${pct}%`,
                transform: `translate(-50%, -50%)`,
                backgroundColor: "#FF523E",
              }}
            />
          </div>
        )}

        {/* Interpretation */}
        {ind.what_is || ind.sources || ind.recommendation ? (
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {ind.what_is && (
              <p><span className="font-medium text-foreground">Что это:</span> {ind.what_is}</p>
            )}
            {ind.sources && (
              <p><span className="font-medium text-foreground">Источники:</span> {ind.sources}</p>
            )}
            {ind.recommendation && (
              <p><span className="font-medium text-foreground">Ваш результат:</span> {ind.recommendation}</p>
            )}
          </div>
        ) : ind.interpretation ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ind.interpretation}
          </p>
        ) : null}

        {/* Recommendations */}
        {recs && (recs.nutrition || recs.supplements || recs.recheck || recs.doctor) && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4 space-y-2.5">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Рекомендации</h4>
            {recs.nutrition && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Apple className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <div><span className="font-medium text-foreground">Питание:</span> {recs.nutrition}</div>
              </div>
            )}
            {recs.supplements && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Pill className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                <div><span className="font-medium text-foreground">Добавки:</span> {recs.supplements}</div>
              </div>
            )}
            {recs.recheck && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <div><span className="font-medium text-foreground">Контроль:</span> {recs.recheck}</div>
              </div>
            )}
            {recs.doctor && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Stethoscope className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div><span className="font-medium text-foreground">К врачу:</span> {recs.doctor}</div>
              </div>
            )}
          </div>
        )}

        {/* Link to indicator reference page */}
        {(() => {
          const slug = getIndicatorSlug(ind.name);
          return slug ? (
            <Link
              href={`/indicators/${slug}`}
              target="_blank"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors"
            >
              Подробнее о показателе
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null;
        })()}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function generateFallbackConclusion(
  total: number,
  problems: number,
  abnormal: Array<{ indicator: { name: string } }>
): string {
  if (problems === 0) {
    return `Все ${total} показателей в пределах референсных значений. Подробный разбор каждого, рекомендации по поддержанию здоровья и вопросы для врача — в вашем отчёте.`;
  }
  const names = abnormal.slice(0, 3).map((a) => a.indicator.name);
  const extra = problems > 3 ? ` и ещё ${problems - 3}` : "";
  return `Из ${total} исследованных показателей ${total - problems} в норме, ${problems} требуют внимания: ${names.join(", ")}${extra}. Рекомендуем обсудить результаты с врачом.`;
}

function Spinner() {
  return (
    <div className="relative w-12 h-12 mx-auto">
      <div className="absolute inset-0 rounded-full border-4 border-border" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PROCESSING_STEPS = [
  { id: 0, label: "Читаем анализ", duration: 4000 },
  { id: 1, label: "Расшифровываем показатели", duration: 8000 },
  { id: 2, label: "Сравниваем с нормами", duration: 6000 },
  { id: 3, label: "Формируем отчёт", duration: 0 },
];

function ProcessingScreen({ orderId, hasEmail, onEmailSubmitted, chatPaid }: { orderId: string; hasEmail: boolean; onEmailSubmitted?: () => void; chatPaid?: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let stepIndex = 0;

    const advance = () => {
      const step = PROCESSING_STEPS[stepIndex];
      if (!step || step.duration === 0) return;

      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIndex]);
        stepIndex += 1;
        if (stepIndex < PROCESSING_STEPS.length) {
          setActiveStep(stepIndex);
          advance();
        }
      }, step.duration);

      return timer;
    };

    const first = advance();
    return () => { if (first) clearTimeout(first); };
  }, []);

  // Progress 0–90%: steps 0–2 each add ~28%. Step 3 stays at 90% (server controls completion).
  const progressPercent = Math.min(90, completedSteps.length * 28 + (activeStep > 0 ? 4 : 0));

  return (
    <div className="flex flex-col items-center">
      {/* Animated orb / pulse ring */}
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(0,180,188,0.12)" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 10, background: "rgba(0,180,188,0.18)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        {/* Core icon */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{ width: 48, height: 48, background: "rgba(0,180,188,0.15)", border: "1.5px solid rgba(0,180,188,0.35)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00b4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <motion.h1
        className="mt-5 text-lg font-semibold text-foreground"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Анализируем ваши результаты
      </motion.h1>
      <motion.p
        className="mt-1 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Обычно это занимает 30–60 секунд
      </motion.p>

      {/* Progress bar */}
      <div className="mt-5 w-full max-w-xs mx-auto">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #00b4bc, #00d4dc)" }}
            initial={{ width: "4%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="mt-6 w-full max-w-xs mx-auto flex flex-col gap-2.5">
        {PROCESSING_STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = activeStep === i && !isDone;
          const isPending = !isDone && !isActive;

          return (
            <motion.div
              key={step.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: isActive
                  ? "rgba(0,180,188,0.08)"
                  : isDone
                  ? "rgba(0,180,188,0.04)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(0,180,188,0.22)"
                  : isDone
                  ? "1px solid rgba(0,180,188,0.12)"
                  : "1px solid transparent",
                transition: "background 0.3s, border-color 0.3s",
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isPending ? 0.38 : 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              {/* Step indicator */}
              <div className="shrink-0" style={{ width: 22, height: 22 }}>
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="11" fill="rgba(0,180,188,0.18)" />
                        <path d="M6.5 11l3 3 6-6" stroke="#00b4bc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="active"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                      >
                        <circle cx="11" cy="11" r="9" stroke="rgba(0,180,188,0.2)" strokeWidth="2" />
                        <path d="M11 2a9 9 0 0 1 9 9" stroke="#00b4bc" strokeWidth="2" strokeLinecap="round" />
                      </motion.svg>
                    </motion.div>
                  ) : (
                    <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="9" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
                        <circle cx="11" cy="11" r="3" fill="rgba(0,0,0,0.12)" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <span
                className="text-sm font-medium"
                style={{
                  color: isDone ? "#00b4bc" : isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  transition: "color 0.3s",
                }}
              >
                {step.label}
              </span>

              {/* "В процессе" badge on active */}
              {isActive && (
                <motion.span
                  className="ml-auto text-xs font-medium shrink-0"
                  style={{ color: "#00b4bc" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  В процессе
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Email capture */}
      <div className="mt-7 w-full max-w-xs mx-auto">
        <EmailCaptureCard orderId={orderId} hasEmail={hasEmail} onSubmitted={onEmailSubmitted} />
      </div>

      {/* Chat paid notice */}
      {chatPaid && (
        <motion.div
          className="mt-4 w-full max-w-xs mx-auto rounded-xl px-4 py-3 text-left"
          style={{ background: "rgba(0,180,188,0.07)", border: "1px solid rgba(0,180,188,0.18)" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <p className="text-xs text-primary font-medium leading-relaxed">
            Консультация с ИИ-ассистентом станет доступна сразу после формирования отчёта
          </p>
        </motion.div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">Не закрывайте окно браузера</p>
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
      <p className="text-sm font-semibold text-primary mb-2">Платеж получен</p>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Куда отправить отчёт?
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Отчёт уже готовится — укажите email, чтобы получить PDF-отчёт и доступ к расшифровке.
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

/* Sparkle particle for confetti effect */
const SPARKLES = [
  { x: -52, y: -38, delay: 0,    size: 6,  color: "#00b4bc" },
  { x:  44, y: -44, delay: 0.06, size: 5,  color: "#f59e0b" },
  { x:  60, y:  10, delay: 0.1,  size: 4,  color: "#00b4bc" },
  { x: -60, y:  18, delay: 0.04, size: 5,  color: "#a78bfa" },
  { x:  18, y:  58, delay: 0.12, size: 4,  color: "#f59e0b" },
  { x: -22, y:  62, delay: 0.08, size: 6,  color: "#34d399" },
  { x:  72, y: -18, delay: 0.14, size: 4,  color: "#34d399" },
  { x: -72, y: -10, delay: 0.02, size: 5,  color: "#a78bfa" },
];

function ReportHero() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
      {/* Sparkle particles */}
      {SPARKLES.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0, 1, 0.6] }}
          transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: s.color,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Outer pulse ring */}
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(0,180,188,0.25)",
        }}
      />

      {/* Icon circle */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00b4bc 0%, #008f96 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,180,188,0.30)",
        }}
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
        >
          {/* SVG checkmark drawn with stroke animation */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <motion.path
              d="M8 16.5 L13.5 22 L24 11"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
              fill="none"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FullReport({ status, orderId, hasEmail, onEmailSubmitted }: { status: OrderStatus; orderId: string; hasEmail: boolean; onEmailSubmitted?: () => void }) {
  const [promoCopied, setPromoCopied] = useState(false);
  useEffect(() => { ymGoal("analysis_viewed"); }, []);

  const handleCopyPromo = () => {
    if (!status.promo_code) return;
    navigator.clipboard.writeText(status.promo_code.toUpperCase()).then(() => {
      setPromoCopied(true);
      setTimeout(() => setPromoCopied(false), 2000);
    });
  };

  return (
    <div className="pt-4 pb-8">
      {/* ── Hero: celebration header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <ReportHero />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="mt-5 text-2xl font-bold text-foreground tracking-tight"
        >
          Ваш отчёт готов
        </motion.h1>

        {status.email && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {status.email_status === "sent" ? "Отправлен" : "Будет отправлен"} на{" "}
            <span className="font-medium text-foreground/80">{status.email}</span>
          </motion.p>
        )}
      </motion.div>

      {/* ── Primary action: PDF download ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="mb-3"
      >
        {status.pdf_download_url ? (
          <a
            href={status.pdf_download_url}
            download
            onClick={() => ymGoal("pdf_downloaded")}
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #00b4bc 0%, #008f96 100%)",
              boxShadow: "0 4px 20px rgba(0,180,188,0.35)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(0,180,188,0.45)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(0,180,188,0.35)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            <Download className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="text-base">Скачать PDF-отчёт</span>
          </a>
        ) : (
          <div
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-semibold text-white opacity-50 cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #00b4bc 0%, #008f96 100%)" }}
          >
            <Download className="w-5 h-5 shrink-0" />
            <span className="text-base">Скачать PDF-отчёт</span>
          </div>
        )}

        {status.email_status === "sent" && (
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            Не пришло?{" "}
            <a href="mailto:support@moyanaliz.ru" className="text-primary underline underline-offset-2">
              Напишите нам
            </a>{" "}
            или проверьте папку «Спам»
          </p>
        )}
      </motion.div>

      {/* ── Email capture (if no email yet) ── */}
      {!hasEmail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mb-6"
        >
          <EmailCaptureCard
            orderId={orderId}
            hasEmail={false}
            confirmText="PDF отправим на ваш email"
            onSubmitted={onEmailSubmitted}
          />
        </motion.div>
      )}

      {/* ── Secondary cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="space-y-3 mb-6"
      >
        {/* Chat card — always shown; content differs by purchase status */}
        <ChatUpsellButton status={status} orderId={orderId} />

        {/* Cards below only for users WITH chat paid */}
        {status.chat_payment_status === "paid" && (
          <>
            {/* Static 30% discount badge */}
            <div className="rounded-2xl border border-border bg-card p-4 min-h-[72px] flex items-center gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,180,188,0.08)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Скидка 30% на следующий анализ</p>
                <p className="text-xs text-muted-foreground mt-0.5">Введите промокод «30%» при следующей оплате</p>
              </div>
            </div>

            {/* Telegram channel */}
            <a
              href="https://t.me/moy_analiz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 min-h-[72px] hover:border-[#0088cc]/25 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,136,204,0.08)" }}>
                <MessageSquare className="w-5 h-5 text-[#0088cc]" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground">Канал в Telegram</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Советы и научные данные о здоровье
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[#0088cc]">
                <span className="text-xs font-medium hidden sm:block">@moy_analiz</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Chat upsell ─── */

function ChatUpsellButton({ status, orderId }: { status: OrderStatus; orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatPaid = status.chat_payment_status === "paid";
  const chatToken = status.chat_token;
  const chatLink = chatPaid && chatToken
    ? `https://t.me/MoyAnalizBot?start=${chatToken}`
    : (status.chat_telegram_link ?? null);

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
      <div className="rounded-2xl border bg-card p-4 min-h-[72px] flex items-center" style={{ borderColor: "rgba(0,180,188,0.25)", background: "rgba(0,180,188,0.04)" }}>
        <div className="flex items-center gap-3 w-full">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)" }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Чат активирован</p>
            <p className="text-xs text-muted-foreground mt-0.5">До 10 вопросов по анализам · Сессия 24 ч</p>
          </div>
          <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#0088cc" }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Открыть
          </a>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full text-left rounded-2xl border border-border bg-card p-4 min-h-[72px] flex items-center cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,188,0.08)" }}>
          <MessageCircleQuestion className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Есть вопросы по анализам?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Создаём ссылку..." : error ? error : "До 10 вопросов AI-ассистенту в Telegram"}
          </p>
        </div>
        <div
          className="shrink-0 inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold"
          style={{ background: "rgba(0,180,188,0.1)", color: "#008f96" }}
        >
          {loading ? "..." : "49 ₽"}
        </div>
      </div>
    </button>
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

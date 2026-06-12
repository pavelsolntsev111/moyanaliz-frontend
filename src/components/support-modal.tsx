"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileSearch, MessageCircleQuestion, CheckCircle2, Loader2, ArrowLeft, Inbox } from "lucide-react";
import { submitSupportRequest } from "@/lib/api";
import { ymGoal } from "@/lib/ym";

type Step = "choose" | "report" | "other" | "done";

interface SupportModalProps {
  onClose: () => void;
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/60";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";
const hintCls = "mt-1 text-xs text-muted-foreground";

export function SupportModal({ onClose }: SupportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);

  // shared fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  // report_issue fields
  const [last4, setLast4] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [surname, setSurname] = useState("");
  const [orderId, setOrderId] = useState("");
  const [comment, setComment] = useState("");
  // other
  const [message, setMessage] = useState("");
  // honeypot
  const [website, setWebsite] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const last4Valid = last4 === "" || /^\d{4}$/.test(last4);

  // Render via portal to document.body — the SiteHeader has backdrop-blur,
  // which creates a containing block for position:fixed descendants. Without
  // the portal, the modal's `fixed inset-0` resolves to the ~58px header, not
  // the viewport, collapsing the overlay. Lock body scroll while open.
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function submit(category: "report_issue" | "other") {
    setError("");
    if (!emailValid) {
      setError("Укажите корректный email — на него придёт ответ");
      return;
    }
    if (category === "report_issue" && !last4Valid) {
      setError("Последние 4 цифры карты — ровно 4 цифры");
      return;
    }
    if (category === "other" && !message.trim()) {
      setError("Опишите ваш вопрос");
      return;
    }
    setSending(true);
    try {
      const res = await submitSupportRequest({
        category,
        email: email.trim(),
        name: name.trim() || undefined,
        card_last4: category === "report_issue" ? last4 || undefined : undefined,
        analysis_type: category === "report_issue" ? analysisType.trim() || undefined : undefined,
        patient_surname: category === "report_issue" ? surname.trim() || undefined : undefined,
        order_id: category === "report_issue" ? orderId.trim() || undefined : undefined,
        message: category === "report_issue" ? comment.trim() || undefined : message.trim(),
        website: website || undefined,
      });
      setTicketId(res.ticket_id);
      setStep("done");
      ymGoal("support_form_sent");
    } catch (e) {
      // Show the backend's validation detail (e.g. "Укажите корректный email"),
      // but a friendly fallback for network/transport failures.
      const msg = e instanceof Error ? e.message : "";
      const isValidationDetail =
        msg && !msg.startsWith("API error") && msg !== "Failed to fetch";
      setError(
        isValidationDetail
          ? msg
          : "Не удалось отправить. Проверьте интернет или напишите напрямую: support@moyanaliz.ru"
      );
    } finally {
      setSending(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="flex min-h-full items-start justify-center p-4 sm:py-10">
      <div className="relative z-10 my-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        {/* honeypot — скрытое поле от ботов */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-px w-px opacity-0"
          aria-hidden
        />

        {step === "choose" && (
          <>
            <h2 className="mb-1 text-xl font-bold text-foreground">Поддержка</h2>
            <p className="mb-5 text-sm text-muted-foreground">С чем вам помочь?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep("report")}
                className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Проблема с расшифровкой</div>
                  <div className="text-xs text-muted-foreground">
                    Оплатили, но отчёт не пришёл / пришёл с ошибкой
                  </div>
                </div>
              </button>
              <button
                onClick={() => setStep("other")}
                className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MessageCircleQuestion className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Другой вопрос</div>
                  <div className="text-xs text-muted-foreground">
                    Тарифы, промокоды, чат-консультант, что угодно
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "report" && (
          <>
            <button
              onClick={() => { setStep("choose"); setError(""); }}
              className="mb-3 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Назад
            </button>
            <h2 className="mb-3 text-xl font-bold text-foreground">Проблема с расшифровкой</h2>

            <div className="mb-4 flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-foreground/90">
                Сначала проверьте почту и папку <b>«Спам»</b> — отчёт приходит с адреса{" "}
                <b>results@moyanaliz.ru</b> обычно за пару минут. Если письма точно нет —
                заполните форму, найдём ваш заказ и пришлём отчёт.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>
                  Ваш email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="на него придёт ответ и отчёт"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>4 цифры карты</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className={inputCls}
                  />
                  <p className={hintCls}>если платили картой; цифры с пластика</p>
                </div>
                <div>
                  <label className={labelCls}>Фамилия в анализе</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="как в шапке бланка"
                    className={inputCls}
                  />
                  <p className={hintCls}>пациента, не плательщика</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Тип анализа</label>
                  <input
                    type="text"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    placeholder="кровь, гормоны…"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Номер заказа</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="если знаете"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Комментарий</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="что-то ещё, что нам поможет (необязательно)"
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

            <button
              onClick={() => submit("report_issue")}
              disabled={sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Отправляем…" : "Отправить в поддержку"}
            </button>
          </>
        )}

        {step === "other" && (
          <>
            <button
              onClick={() => { setStep("choose"); setError(""); }}
              className="mb-3 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Назад
            </button>
            <h2 className="mb-4 text-xl font-bold text-foreground">Другой вопрос</h2>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>
                  Ваш email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="на него придёт ответ"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Как к вам обращаться</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="имя (необязательно)"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Ваш вопрос <span className="text-primary">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите вопрос — ответим на email"
                  rows={4}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

            <button
              onClick={() => submit("other")}
              disabled={sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Отправляем…" : "Отправить вопрос"}
            </button>
          </>
        )}

        {step === "done" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Обращение принято</h2>
            <p className="mb-1 text-sm text-muted-foreground">
              Ответ придёт на <b className="text-foreground">{email.trim()}</b> — обычно в течение часа.
            </p>
            {ticketId && (
              <p className="mb-4 text-xs text-muted-foreground">Номер обращения: {ticketId}</p>
            )}
            <p className="mb-5 text-xs text-muted-foreground">
              Мы отправили вам письмо-подтверждение — ответом на него можно дополнить обращение.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Готово
            </button>
          </div>
        )}
      </div>
      </div>
    </div>,
    document.body
  );
}

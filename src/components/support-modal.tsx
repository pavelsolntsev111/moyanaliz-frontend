"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, FileSearch, MessageCircleQuestion, CheckCircle2, Loader2, ArrowLeft, Inbox, Paperclip, Trash2 } from "lucide-react";
import { submitSupportRequest, uploadSupportAttachment, type SupportAttachmentRef } from "@/lib/api";
import { ymGoal } from "@/lib/ym";

type Step = "choose" | "report" | "other" | "done";
type PayMethod = "card" | "sbp" | "unknown" | "";

interface SupportModalProps {
  onClose: () => void;
}

interface Attachment extends SupportAttachmentRef {
  previewUrl?: string; // object URL for image thumbnail
  uploading?: boolean;
  localName: string;
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/60";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";
const hintCls = "mt-1 text-xs text-muted-foreground";
const MAX_ATTACH = 3;

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
  const [payMethod, setPayMethod] = useState<PayMethod>("");
  const [paidDate, setPaidDate] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [amount, setAmount] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [surname, setSurname] = useState("");
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachError, setAttachError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]); // all created blob URLs, for unmount cleanup
  // other
  const [message, setMessage] = useState("");
  // honeypot
  const [website, setWebsite] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const last4Valid = last4 === "" || /^\d{4}$/.test(last4);
  const uploadingAny = attachments.some((a) => a.uploading);

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

  // Revoke ALL object URLs created during this modal session on unmount.
  // Tracked in a ref (not state) so the cleanup sees URLs added after mount.
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  async function handleFiles(files: FileList | null) {
    setAttachError("");
    if (!files || files.length === 0) return;
    const room = MAX_ATTACH - attachments.length;
    if (room <= 0) { setAttachError(`Можно приложить не больше ${MAX_ATTACH} файлов`); return; }
    const all = Array.from(files);
    const picked = all.slice(0, room);
    const errors: string[] = [];
    if (all.length > room) errors.push(`добавлено ${room} из ${all.length} (лимит ${MAX_ATTACH})`);
    for (const file of picked) {
      // Accept by MIME, with an extension fallback for empty file.type (common
      // for HEIC and some mobile picks). Backend can't decode HEIC → only the
      // server-supported set here; HEIC users get a clear message, not a 415.
      const name = file.name.toLowerCase();
      const okType =
        /^image\/(jpeg|png|webp|gif)$/i.test(file.type) ||
        file.type === "application/pdf" ||
        (!file.type && /\.(jpe?g|png|webp|gif|pdf)$/i.test(name));
      const isHeic = /^image\/(heic|heif)$/i.test(file.type) || /\.(heic|heif)$/i.test(name);
      if (isHeic) { errors.push("HEIC не поддерживается — сделайте скриншот или сохраните как JPG"); continue; }
      if (!okType) { errors.push("только фото/скриншот (JPG, PNG, WebP) или PDF"); continue; }
      if (file.size > 10 * 1024 * 1024) { errors.push("файл больше 10 МБ"); continue; }
      const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(name);
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      if (previewUrl) objectUrlsRef.current.push(previewUrl);
      const placeholder: Attachment = { key: "", localName: file.name, previewUrl, uploading: true };
      setAttachments((prev) => [...prev, placeholder]);
      try {
        const ref = await uploadSupportAttachment(file);
        setAttachments((prev) =>
          prev.map((a) => (a === placeholder ? { ...a, ...ref, uploading: false } : a))
        );
      } catch {
        setAttachments((prev) => prev.filter((a) => a !== placeholder));
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        errors.push("не удалось загрузить файл");
      }
    }
    if (errors.length) setAttachError(errors.join("; "));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(target: Attachment) {
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setAttachments((prev) => prev.filter((a) => a !== target));
  }

  async function submit(category: "report_issue" | "other") {
    setError("");
    if (!emailValid) {
      setError("Укажите корректный email — на него придёт ответ");
      return;
    }
    if (category === "report_issue" && payMethod !== "sbp" && !last4Valid) {
      setError("Последние 4 цифры карты — ровно 4 цифры");
      return;
    }
    if (category === "other" && !message.trim()) {
      setError("Опишите ваш вопрос");
      return;
    }
    if (uploadingAny) {
      setError("Дождитесь загрузки вложений");
      return;
    }
    setSending(true);
    try {
      const refs = attachments
        .filter((a) => a.key && !a.uploading)
        .map((a) => ({ key: a.key, content_type: a.content_type, filename: a.filename }));
      const res = await submitSupportRequest({
        category,
        email: email.trim(),
        name: name.trim() || undefined,
        card_last4: category === "report_issue" && payMethod !== "sbp" ? last4 || undefined : undefined,
        payment_method: category === "report_issue" && payMethod ? payMethod : undefined,
        paid_at: category === "report_issue" ? paidDate || undefined : undefined,
        paid_time_of_day: category === "report_issue" ? timeOfDay || undefined : undefined,
        amount: category === "report_issue" ? amount || undefined : undefined,
        analysis_type: category === "report_issue" ? analysisType.trim() || undefined : undefined,
        patient_surname: category === "report_issue" ? surname.trim() || undefined : undefined,
        message: category === "report_issue" ? comment.trim() || undefined : message.trim(),
        attachments: refs.length ? refs : undefined,
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

              {/* Receipt / screenshot — the highest-signal field: carries date,
                  amount, last4 and sometimes the payment id in one shot. */}
              <div>
                <label className={labelCls}>Чек или скриншот оплаты</label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-background"
                    >
                      {a.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.previewUrl} alt={a.localName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">PDF<br />{a.localName.slice(0, 12)}</span>
                      )}
                      {a.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card/70">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                      {!a.uploading && (
                        <button
                          type="button"
                          onClick={() => removeAttachment(a)}
                          className="absolute right-0.5 top-0.5 rounded-md bg-foreground/60 p-1 text-white hover:bg-foreground"
                          aria-label="Удалить вложение"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {attachments.length < MAX_ATTACH && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
                    >
                      <Paperclip className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Приложить</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <p className={hintCls}>самый быстрый способ — на чеке есть всё, что нужно для поиска</p>
                {attachError && <p className="mt-1 text-xs font-medium text-red-600">{attachError}</p>}
              </div>

              {/* Payment method — routes the agent: card → search by last4,
                  SBP → search by date+amount (last4 is meaningless for SBP). */}
              <div>
                <label className={labelCls}>Как оплачивали?</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["card", "Картой"],
                    ["sbp", "СБП / по телефону"],
                    ["unknown", "Не помню"],
                  ] as [PayMethod, string][]).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setPayMethod(val); if (val === "sbp") setLast4(""); }}
                      className={
                        "rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors " +
                        (payMethod === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/50")
                      }
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod !== "sbp" && (
                <div>
                  <label className={labelCls}>4 последние цифры карты, с которой оплатили</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className={inputCls}
                  />
                  <p className={hintCls}>цифры с пластика или из приложения банка</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Когда оплатили</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className={inputCls}
                  />
                  <p className={hintCls}>примерно</p>
                </div>
                <div>
                  <label className={labelCls}>Время суток</label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">не помню</option>
                    <option value="утро">утро</option>
                    <option value="день">день</option>
                    <option value="вечер">вечер</option>
                    <option value="ночь">ночь</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Сумма</label>
                  <select
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">не помню</option>
                    <option value="299 ₽">299 ₽</option>
                    <option value="349 ₽">349 ₽</option>
                    <option value="449 ₽">449 ₽</option>
                    <option value="899 ₽">899 ₽</option>
                    <option value="другая">другая сумма</option>
                  </select>
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

              <div>
                <label className={labelCls}>Тип анализа</label>
                <input
                  type="text"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  placeholder="кровь, гормоны, моча…"
                  className={inputCls}
                />
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
              disabled={sending || uploadingAny}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {(sending || uploadingAny) && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Отправляем…" : uploadingAny ? "Загрузка вложений…" : "Отправить в поддержку"}
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

"use client";

import { useEffect, useState, useCallback, use } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ymGoal } from "@/lib/ym";
import { getOrderStatus, type OrderStatus } from "@/lib/api";
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
} from "lucide-react";

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
    let pdfRetries = 0;
    const run = async () => {
      const s = await poll();
      if (!active) return;
      if (s) {
        const terminal = s.processing_status === "completed" || s.processing_status === "error" || s.payment_status === "failed";
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
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-bold text-destructive mb-2">Ошибка</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function StatusScreen({ status }: { status: OrderStatus }) {
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

  if (
    status.processing_status === "processing" ||
    status.processing_status === "not_started" ||
    status.processing_status === "light_complete"
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
        <p className="text-xs text-muted-foreground mt-1">
          Не закрывайте окно браузера
        </p>
        <div className="mt-6 w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (status.processing_status === "completed" && status.claude_result_json) {
    return <FullReport status={status} />;
  }

  if (status.processing_status === "completed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Ваш отчёт готов!
        </h1>
        {status.email_status === "sent" && (
          <p className="text-sm text-muted-foreground mt-2">
            Отчёт отправлен на вашу электронную почту
          </p>
        )}
        {status.pdf_download_url && (
          <a
            href={status.pdf_download_url}
            download
            onClick={() => ymGoal("pdf_downloaded")}
            className="mt-6 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <Download className="w-5 h-5" />
            Скачать PDF
          </a>
        )}
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

function FullReport({ status }: { status: OrderStatus }) {
  const data = status.claude_result_json!;
  const meta = data.meta;

  // Collect all abnormal indicators across all reports
  const abnormalIndicators: Array<{
    indicator: (typeof data.reports)[0]["indicators"][0];
    reportLabel: string;
  }> = [];

  for (const report of data.reports) {
    for (const ind of report.indicators) {
      if (ind.status !== "normal") {
        abnormalIndicators.push({ indicator: ind, reportLabel: report.analysis_type_label });
      }
    }
  }

  // Sort by severity: critical > severe > moderate > mild
  const severityOrder: Record<string, number> = { severe: 0, critical_high: 0, critical_low: 0, moderate: 1, mild: 2, none: 3 };
  abnormalIndicators.sort(
    (a, b) => (severityOrder[a.indicator.severity] ?? 3) - (severityOrder[b.indicator.severity] ?? 3)
  );

  const totalCount = meta.total_indicators_count;
  const problemCount = abnormalIndicators.length;

  return (
    <div className="space-y-8">
      {/* 1. Report ready header */}
      <div className="text-center">
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
            className="mt-4 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Download className="w-5 h-5" />
            Скачать PDF-отчёт
          </a>
        ) : (
          <button
            disabled
            className="mt-4 inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold opacity-50 cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Скачать PDF-отчёт
          </button>
        )}

        {status.email_status === "sent" && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            Не пришло? Проверьте «Спам» или напишите на{" "}
            <a href="mailto:support@moyanaliz.ru" className="text-primary underline">
              support@moyanaliz.ru
            </a>
          </p>
        )}
      </div>

      {/* 2. General conclusion */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
          Итог
        </h2>
        <p className="text-base leading-relaxed text-foreground">
          {meta.general_conclusion || meta.general_notes || generateFallbackConclusion(totalCount, problemCount, abnormalIndicators)}
        </p>
      </div>

      {/* 3. Abnormal indicators — full detail */}
      {abnormalIndicators.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-foreground">
              Требует внимания
            </h2>
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600">
              {problemCount}
            </span>
          </div>
          <div className="space-y-4">
            {abnormalIndicators.map(({ indicator: ind }, i) => (
              <AbnormalCard key={i} indicator={ind} />
            ))}
          </div>
        </div>
      )}

      {/* 4. STI section */}
      {data.stis_special_section?.is_present && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-card-foreground">ИППП</h2>
          </div>
          {data.stis_special_section.notice && (
            <p className="text-sm text-muted-foreground mb-4 italic">
              {data.stis_special_section.notice}
            </p>
          )}
          <div className="grid gap-3">
            {data.stis_special_section.results.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-card-foreground text-sm">{r.test_name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      r.result_type === "negative"
                        ? "bg-emerald-50 text-emerald-600"
                        : r.result_type === "positive"
                        ? "bg-destructive text-white"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {r.result}
                  </span>
                </div>
                {r.interpretation && (
                  <p className="mt-2 text-sm text-muted-foreground">{r.interpretation}</p>
                )}
              </div>
            ))}
          </div>
          {data.stis_special_section.general_recommendation && (
            <p className="mt-4 text-sm text-muted-foreground">
              {data.stis_special_section.general_recommendation}
            </p>
          )}
        </div>
      )}

      {/* 5. Nutrition recommendations */}
      {data.nutrition && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-card-foreground">Рекомендации по питанию</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            {totalCount === 1
              ? `На основе вашего показателя`
              : `На основе ваших ${pluralIndicatorsGen(totalCount)}`}
            {meta.patient_age ? ` и возраста (${meta.patient_age})` : ""}
          </p>

          {/* Products to add */}
          {data.nutrition.products_to_add?.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Обратить внимание
              </h3>
              <div className="space-y-3">
                {data.nutrition.products_to_add.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{item.product}</span>
                      {item.frequency && (
                        <span className="text-xs text-muted-foreground ml-1.5">({item.frequency})</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products to limit */}
          {data.nutrition.products_to_limit?.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-1.5">
                <CircleMinus className="h-3.5 w-3.5" />
                Стоит ограничить
              </h3>
              <div className="space-y-3">
                {data.nutrition.products_to_limit.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{item.product}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supplements note */}
          {data.nutrition.supplements_note && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
              <Pill className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="text-sm text-blue-900">{data.nutrition.supplements_note}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium">Согласуйте дозировку с врачом</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Action plan */}
      {data.action_plan && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">Что делать дальше</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Ваш персональный план действий</p>

          <div className="space-y-5">
            {/* Urgent */}
            {data.action_plan.urgent?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-orange-600 mb-2.5 flex items-center gap-1.5">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Срочно
                  <span className="text-xs font-normal text-muted-foreground">в ближайшие 1–2 недели</span>
                </h3>
                <ul className="space-y-2">
                  {data.action_plan.urgent.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-orange-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Soon */}
            {data.action_plan.soon?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 mb-2.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  В ближайший месяц
                </h3>
                <ul className="space-y-2">
                  {data.action_plan.soon.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Control */}
            {data.action_plan.control?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Контроль
                  <span className="text-xs font-normal">пересдача анализов</span>
                </h3>
                <ul className="space-y-2">
                  {data.action_plan.control.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-muted-foreground/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Doctor questions */}
      {data.questions_for_doctor?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircleQuestion className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">Вопросы для врача</h2>
          </div>
          <ul className="space-y-4">
            {data.questions_for_doctor.map((q, i) => {
              const isObj = typeof q === "object" && q !== null;
              const question = isObj ? q.question : q;
              const context = isObj ? q.context : null;

              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{question}</p>
                    {context && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{context}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 6. Disclaimer */}
      {data.disclaimer && (
        <div className="rounded-xl bg-muted/50 p-5 text-xs text-muted-foreground leading-relaxed">
          {data.disclaimer}
        </div>
      )}

      {/* 7. Bottom CTA — link to PDF */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-foreground font-medium">
          Полный отчёт со всеми показателями, дополнительными анализами и рекомендациями — в PDF
        </p>
        {status.pdf_download_url ? (
          <a
            href={status.pdf_download_url}
            download
            onClick={() => ymGoal("pdf_downloaded")}
            className="mt-4 inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition"
          >
            <Download className="w-4 h-4" />
            Скачать PDF
          </a>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            PDF будет отправлен на ваш email
          </p>
        )}
      </div>
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

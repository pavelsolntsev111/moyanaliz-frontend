"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  Apple,
  Pill,
  CalendarCheck,
  Stethoscope,
  FileText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

/**
 * ReportExampleModal — sample-report preview shown on the paywall (A/B ab_example_v1).
 *
 * Content is curated from a real anonymized order (9eb03073319d, ж/44, comprehensive
 * 8-panel checkup) — 3 of its most relatable findings rendered in the product's web-report
 * card style. No PII (only sex/age, as in the real report). Fully self-contained: no API,
 * no images, mobile-native. Footer pins the pay CTA so closing returns to the paywall.
 */

type Severity = "critical" | "warning";

interface ExampleCard {
  name: string;
  value: string;
  unit: string;
  reference: string;
  /** 0..1 position of the value on the reference bar (for the marker). */
  pos: number;
  status: string;
  severity: Severity;
  whatIs: string;
  recommendation: string;
  actions: { icon: "apple" | "pill" | "calendar" | "doctor"; text: string }[];
}

const EXAMPLE_META = {
  types: ["Общий анализ крови", "Биохимия", "Щитовидная железа", "Обмен железа", "Витамин D", "Коагулограмма"],
  extraTypes: 2,
  lab: "Лаборатория Гемотест",
  patient: "Женщина, 44 года",
  totalApprox: 102,
  abnormal: 6,
};

const EXAMPLE_CARDS: ExampleCard[] = [
  {
    name: "Ферритин",
    value: "7.7",
    unit: "нг/мл",
    reference: "15–150 нг/мл",
    pos: 0.04,
    status: "Критически низкий",
    severity: "critical",
    whatIs:
      "Главный показатель запасов железа в организме. Падает раньше гемоглобина — поэтому ловит дефицит на ранней стадии.",
    recommendation:
      "Запасы железа истощены (норма — от 15). По критериям ВОЗ это диагностический признак железодефицита — частая причина усталости, выпадения волос и одышки.",
    actions: [
      { icon: "apple", text: "Красное мясо, печень, гречка, зелёные овощи" },
      { icon: "pill", text: "Обсудить с врачом препараты железа" },
      { icon: "calendar", text: "Пересдать ферритин через 1 месяц" },
    ],
  },
  {
    name: "Холестерин ЛПНП («плохой»)",
    value: "3.91",
    unit: "ммоль/л",
    reference: "до 3.34 ммоль/л",
    pos: 0.86,
    status: "Повышен",
    severity: "warning",
    whatIs:
      "«Плохой» холестерин — накапливается в стенках сосудов и повышает риск атеросклероза и сердечно-сосудистых заболеваний.",
    recommendation:
      "Значение в зоне повышенного риска. Пока не критично, но требует внимания — особенно в сочетании с другими факторами.",
    actions: [
      { icon: "apple", text: "Меньше насыщенных жиров, больше клетчатки и рыбы" },
      { icon: "calendar", text: "Повторить липидограмму через 3 месяца" },
    ],
  },
  {
    name: "Липаза",
    value: "69.6",
    unit: "Ед/л",
    reference: "13–60 Ед/л",
    pos: 0.82,
    status: "Повышена",
    severity: "warning",
    whatIs: "Фермент поджелудочной железы, расщепляющий жиры в пище.",
    recommendation:
      "Превышение на 16% может указывать на лёгкое раздражение поджелудочной железы. Само по себе не диагноз, но стоит проконтролировать.",
    actions: [
      { icon: "apple", text: "Ограничить жирное и алкоголь" },
      { icon: "calendar", text: "Пересдать через 2 недели" },
      { icon: "doctor", text: "Если останется повышенной — к гастроэнтерологу" },
    ],
  },
];

const ACTION_ICON = {
  apple: Apple,
  pill: Pill,
  calendar: CalendarCheck,
  doctor: Stethoscope,
} as const;

function RangeBar({ pos, severity }: { pos: number; severity: Severity }) {
  const color = severity === "critical" ? "bg-red-500" : "bg-amber-500";
  return (
    <div className="relative mt-2 h-2 w-full rounded-full bg-gradient-to-r from-amber-200 via-emerald-300 to-amber-200">
      <div
        className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${color}`}
        style={{ left: `${Math.max(4, Math.min(96, pos * 100))}%` }}
      />
    </div>
  );
}

function ExampleCardView({ card }: { card: ExampleCard }) {
  const isCrit = card.severity === "critical";
  const accent = isCrit
    ? "border-red-200 bg-red-50/60"
    : "border-amber-200 bg-amber-50/50";
  const badge = isCrit
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700";
  return (
    <div className={`rounded-2xl border ${accent} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground sm:text-base">{card.name}</h4>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}>
          {card.status}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{card.value}</span>
        <span className="text-sm text-muted-foreground">{card.unit}</span>
        <span className="ml-auto text-xs text-muted-foreground">Норма: {card.reference}</span>
      </div>
      <RangeBar pos={card.pos} severity={card.severity} />

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          <span className="font-medium text-foreground">Что это.</span> {card.whatIs}
        </p>
        <p>
          <span className="font-medium text-foreground">Ваш результат.</span> {card.recommendation}
        </p>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-background/70 p-3">
        {card.actions.map((a, i) => {
          const Icon = ACTION_ICON[a.icon];
          return (
            <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{a.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportExampleModal({
  onClose,
  onPay,
  payLabel,
}: {
  onClose: () => void;
  onPay: () => void;
  payLabel: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      {/* backdrop — click closes */}
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-3 sm:py-8">
        <div className="relative z-10 my-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground sm:text-base">
                Пример готового отчёта
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* scrollable body */}
          <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {/* report meta */}
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_META.types.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  +{EXAMPLE_META.extraTypes}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{EXAMPLE_META.lab}</span>
                <span>·</span>
                <span>{EXAMPLE_META.patient}</span>
                <span>·</span>
                <span>
                  Проверено более {EXAMPLE_META.totalApprox} показателей ·{" "}
                  <span className="font-semibold text-foreground">{EXAMPLE_META.abnormal} с отклонениями</span>
                </span>
              </div>
            </div>

            {/* summary banner */}
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold text-red-700">Найдено 6 отклонений, одно — критическое.</span>{" "}
              Ниже — 3 из них с разбором: что это значит и что делать. В полном отчёте так же разобран{" "}
              <span className="font-medium text-foreground">каждый</span> показатель.
            </div>

            {/* cards */}
            <div className="mt-4 space-y-3">
              {EXAMPLE_CARDS.map((c) => (
                <ExampleCardView key={c.name} card={c} />
              ))}
            </div>

            {/* teaser: breadth of the full report */}
            <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-4">
              <p className="text-sm font-medium text-foreground">
                …и ещё {EXAMPLE_META.totalApprox - 3} показателей разобраны так же подробно
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                {[
                  "Что означает каждый показатель",
                  "Ваш результат простым языком",
                  "Питание и образ жизни",
                  "Когда пересдать анализы",
                  "К какому врачу идти",
                  "Вопросы для приёма + PDF на email",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-1.5">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Пример составлен по реальному обезличенному анализу
            </p>
          </div>

          {/* pinned footer CTA — pay is always one tap away */}
          <div className="sticky bottom-0 z-10 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
            <button
              onClick={onPay}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:text-base"
            >
              {payLabel}
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
            >
              Закрыть и вернуться
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

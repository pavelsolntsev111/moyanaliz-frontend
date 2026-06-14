"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  FileText,
  BookOpen,
  UserCheck,
  AlertTriangle,
  Apple,
  Pill,
  CalendarCheck,
  FlaskConical,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

/**
 * ReportExampleModal — sample-report preview shown on the paywall (A/B ab_example_v1).
 *
 * ONE indicator, in depth (per owner 2026-06-14): a single critical finding —
 * ferritin — analyzed the way every indicator is in the full report. Curated from a
 * real anonymized order (9eb03073319d, ж/44): personalised reading tied to her sex/age
 * and other results (hemoglobin / colour index / serum iron), "what else to test &
 * monitor", and a question-for-the-doctor. No PII (name never rendered). Self-contained;
 * footer pins the pay CTA so closing returns to the paywall.
 */

const META = {
  types: ["Общий анализ крови", "Биохимия", "Щитовидная железа", "Обмен железа", "Витамин D", "Коагулограмма"],
  extraTypes: 2,
  lab: "Лаборатория Гемотест",
  patient: "Женщина, 44 года",
  total: 102,
  abnormal: 6,
};

function RangeBar() {
  // ferritin 7.7 on a 15–150 reference scale → below the lower bound (far left).
  return (
    <div className="mt-2">
      <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-red-300 via-emerald-300 to-amber-200">
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow"
          style={{ left: "3%", height: "1.05rem", width: "1.05rem" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span className="text-red-600 font-medium">ваши 7.7 ↑ нужно ≥15</span>
        <span>150</span>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, children, tone = "default" }: { icon: React.ElementType; children: React.ReactNode; tone?: "default" | "primary" | "red" }) {
  const color = tone === "red" ? "text-red-600" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <h5 className={`text-sm font-semibold ${color}`}>{children}</h5>
    </div>
  );
}

/** Inline reference to another result — makes the reading feel individual. */
function Ref({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-md px-1.5 py-0.5 text-[13px] font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      {label} <span className="font-semibold">{value}</span>
    </span>
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
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-3 sm:py-8">
        <div className="relative z-10 my-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground sm:text-base">Пример: как разобран один показатель</span>
            </div>
            <button onClick={onClose} aria-label="Закрыть" className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* scrollable body */}
          <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {/* report meta */}
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex flex-wrap gap-1.5">
                {META.types.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{t}</span>
                ))}
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">+{META.extraTypes}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{META.lab}</span><span>·</span>
                <span>{META.patient}</span><span>·</span>
                <span>{META.total} показателей · <span className="font-semibold text-foreground">{META.abnormal} с отклонениями</span></span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                Ниже — <span className="font-semibold text-foreground">один</span> показатель (самый важный в этом отчёте) разобран так, как в полном отчёте разобран <span className="font-semibold text-foreground">каждый</span> из {META.total}.
              </p>
            </div>

            {/* ── deep single-indicator card ── */}
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/40 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-base font-bold text-foreground sm:text-lg">Ферритин</h4>
                <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Критически низкий</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">7.7</span>
                <span className="text-sm text-muted-foreground">нг/мл</span>
                <span className="ml-auto text-xs text-muted-foreground">Норма: 15–150 нг/мл</span>
              </div>
              <RangeBar />

              <div className="mt-5 space-y-5">
                {/* what is it */}
                <section>
                  <SectionHeader icon={BookOpen}>Что это</SectionHeader>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    Ферритин — белок, в котором организм хранит железо «про запас». Это самый ранний и точный маркер запасов железа: он падает за <span className="font-medium text-foreground">месяцы</span> до того, как снизится гемоглобин. Поэтому нормальный гемоглобин ещё не гарантирует, что с железом всё в порядке.
                  </p>
                </section>

                {/* personalised reading — the individual part */}
                <section className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3.5">
                  <SectionHeader icon={UserCheck} tone="primary">Что это значит именно для вас</SectionHeader>
                  <div className="space-y-2.5 text-sm leading-relaxed text-foreground/90">
                    <p>
                      У вас, <span className="font-medium text-foreground">женщины 44 лет</span>, ферритин 7.7 — это вдвое ниже нижней границы. Запасы железа практически исчерпаны.
                    </p>
                    <p>Это не случайная цифра — она сходится с другими вашими результатами:</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Ref label="Цветовой показатель" value="0.84" />
                      <span className="text-xs text-muted-foreground">— эритроциты начинают «бледнеть» (ниже нормы 0.85)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Ref label="Гемоглобин" value="123" ok />
                      <span className="text-xs text-muted-foreground">— ещё в норме, анемии пока нет</span>
                    </div>
                    <p>
                      Это <span className="font-semibold text-foreground">скрытый (латентный) железодефицит</span>: тело пока удерживает гемоглобин, но резервов не осталось — анализ поймал проблему до анемии. У женщин до менопаузы это частая ситуация из-за ежемесячной кровопотери.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Сывороточное железо у вас <span className="font-medium">626 (в норме)</span> — но оно скачет день ото дня и не отражает запасы. Истину показывает именно ферритин.
                    </p>
                  </div>
                </section>

                {/* why it matters */}
                <section>
                  <SectionHeader icon={AlertTriangle} tone="red">Чем грозит, если не заняться</SectionHeader>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    Даже без анемии низкий ферритин даёт усталость, выпадение волос, ломкость ногтей, одышку при нагрузке и «туман в голове». Если не восполнить — разовьётся железодефицитная анемия.
                  </p>
                </section>

                {/* what to do */}
                <section>
                  <SectionHeader icon={Apple}>Что делать</SectionHeader>
                  <div className="space-y-2 rounded-xl bg-background/70 p-3">
                    <div className="flex items-start gap-2.5 text-sm text-foreground/90"><Apple className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Красное мясо, печень, гречка, бобовые + витамин C (усиливает усвоение). Чай и кофе во время еды — наоборот, мешают.</span></div>
                    <div className="flex items-start gap-2.5 text-sm text-foreground/90"><Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Диетой 7.7 не поднять — почти наверняка нужны препараты железа. Форму и дозу подберёт врач.</span></div>
                    <div className="flex items-start gap-2.5 text-sm text-foreground/90"><CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Пересдать ферритин и гемоглобин через 4–6 недель после начала приёма.</span></div>
                  </div>
                </section>

                {/* what else to test & monitor */}
                <section>
                  <SectionHeader icon={FlaskConical} tone="primary">Что ещё сдать и за чем следить</SectionHeader>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    Чтобы понять <span className="font-medium text-foreground">причину</span> и глубину дефицита: ОЖСС, % насыщения трансферрина, ретикулоциты. При стойкой усталости — витамин B12 и фолиевая кислота (бывает смешанный дефицит). <span className="font-medium text-foreground">Следить:</span> ферритин раз в 1–2 месяца, пока не выйдет в комфортные 30–50 нг/мл.
                  </p>
                </section>

                {/* question for doctor */}
                <section>
                  <SectionHeader icon={Stethoscope}>Вопрос врачу</SectionHeader>
                  <blockquote className="rounded-xl border-l-[3px] border-primary bg-primary/[0.04] px-3.5 py-2.5 text-sm italic leading-relaxed text-foreground/90">
                    «Ферритин 7.7 — нужны ли препараты железа и в какой дозе? Стоит ли искать причину потери железа — например, проверить обильность менструаций или обследовать ЖКТ?»
                  </blockquote>
                </section>
              </div>
            </div>

            {/* focused teaser */}
            <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-4 text-center">
              <p className="text-sm font-medium text-foreground">…и так разобран каждый из {META.total} показателей</p>
              <p className="mt-1 text-xs text-muted-foreground">что значит лично для вас, с учётом пола, возраста и связей между анализами — плюс PDF на email и вопросы для приёма у врача</p>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Пример составлен по реальному обезличенному анализу
            </p>
          </div>

          {/* pinned footer CTA */}
          <div className="sticky bottom-0 z-10 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
            <button onClick={onPay} className="w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:text-base">
              {payLabel}
            </button>
            <button onClick={onClose} className="mt-2 w-full text-center text-xs text-muted-foreground transition hover:text-foreground">
              Закрыть и вернуться
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

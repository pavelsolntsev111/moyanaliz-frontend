"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, FileText, Check } from "lucide-react";

/**
 * ReportExampleModal — sample-report preview shown on the paywall (A/B ab_example_v1).
 *
 * ONE indicator, in depth (ferritin), the way every indicator is analyzed in the full
 * report. Curated from a real anonymized order (9eb03073319d, ж/44): personalised reading
 * tied to sex/age and other results (colour index / hemoglobin / serum iron), "what else
 * to test & monitor", and a question-for-the-doctor. No PII (name never rendered).
 * Flat sections inside a single card, uniform typography. Footer pins the pay CTA.
 */

function RangeBar() {
  // ferritin 7.7 on a 15–150 scale → far below the lower bound.
  return (
    <div className="mt-3 h-2 w-full rounded-full bg-muted">
      <div className="relative h-full">
        <div className="absolute left-0 top-0 h-2 rounded-full bg-red-400" style={{ width: "5%" }} />
        <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-red-500" style={{ left: "5%" }} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-1.5 text-sm font-semibold text-foreground">{title}</h5>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
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
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-3 sm:py-8">
        <div className="relative z-10 my-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground sm:text-base">Пример из расшифровки анализа крови</span>
            </div>
            <button onClick={onClose} aria-label="Закрыть" className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* scrollable body */}
          <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {/* single indicator card — flat sections inside */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-base font-semibold text-foreground sm:text-lg">Ферритин</h4>
                <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Критически низкий</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">7.7</span>
                <span className="text-sm text-muted-foreground">нг/мл</span>
                <span className="ml-auto text-xs text-muted-foreground">Норма: 15–150 нг/мл</span>
              </div>
              <RangeBar />

              <div className="mt-5 space-y-5">
                <Section title="Что это">
                  <p>Ферритин — белок, в котором организм хранит железо про запас. Это самый ранний маркер дефицита: он падает за месяцы до того, как снизится гемоглобин. Поэтому нормальный гемоглобин ещё не значит, что с железом всё в порядке.</p>
                </Section>

                <Section title="Что это значит для вас">
                  <p>Для женщины 44 лет ферритин 7.7 — вдвое ниже нормы, запасы железа почти исчерпаны.</p>
                  <p>Это согласуется с другими вашими показателями: цветовой показатель 0.84 уже ниже нормы (эритроциты начинают «бледнеть»), а гемоглобин 123 пока в норме — анемии ещё нет. Значит, дефицит скрытый: организм держит гемоглобин из последних резервов, и анализ поймал проблему заранее. У женщин до менопаузы это частая ситуация из-за регулярной кровопотери.</p>
                  <p>Сывороточное железо (626) выглядит нормальным, но оно меняется день ото дня — настоящие запасы показывает именно ферритин.</p>
                </Section>

                <Section title="Чем это грозит">
                  <p>Даже без анемии низкий ферритин даёт усталость, выпадение волос, ломкость ногтей, одышку при нагрузке и «туман в голове». Если не восполнить — разовьётся железодефицитная анемия.</p>
                </Section>

                <Section title="Что делать">
                  <ul className="space-y-1.5">
                    <li>Красное мясо, печень, гречка, бобовые вместе с витамином C; чай и кофе во время еды, наоборот, мешают усвоению.</li>
                    <li>Диетой 7.7 не поднять — почти наверняка нужны препараты железа, форму и дозу подберёт врач.</li>
                    <li>Пересдать ферритин и гемоглобин через 4–6 недель после начала приёма.</li>
                  </ul>
                </Section>

                <Section title="Что ещё сдать и за чем следить">
                  <p>Чтобы понять причину и глубину дефицита: ОЖСС, процент насыщения трансферрина, ретикулоциты. При стойкой усталости — витамин B12 и фолиевая кислота. Дальше следить за ферритином раз в 1–2 месяца, пока он не выйдет в комфортные 30–50 нг/мл.</p>
                </Section>

                <Section title="Вопрос врачу">
                  <p>Ферритин 7.7 — нужны ли препараты железа и в какой дозе? Стоит ли искать причину потери железа — например, проверить обильность менструаций или обследовать ЖКТ?</p>
                </Section>
              </div>
            </div>

            {/* what the full report includes — mirrors the paywall feature list */}
            <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">В полном отчёте так же разобран каждый показатель из вашего анализа</p>
              <p className="mt-1 text-sm text-muted-foreground">с учётом пола, возраста и связей между показателями. В отчёт входит:</p>
              <ul className="mt-3 space-y-2">
                {[
                  "Детальные комментарии по всем показателям",
                  "Рекомендации по питанию",
                  "Персональный чек-лист «Что делать дальше»",
                  "Рекомендации, какие анализы ещё сдать",
                  "Вопросы для врача",
                  "PDF-отчёт на email",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
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

"use client";

import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Stethoscope,
  MessageCircle,
  Star,
  ChevronDown,
  Apple,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Static preview data                                                */
/* ------------------------------------------------------------------ */

const previewIndicators = [
  {
    name: "Альбумин",
    shortName: "ALB",
    value: 50,
    unit: "г/л",
    refMin: 35,
    refMax: 52,
    status: "normal" as const,
    explanation:
      "Уровень альбумина в пределах нормы. Это говорит о хорошей работе печени и достаточном поступлении белка с пищей.",
  },
  {
    name: "Витамин D (25-OH)",
    shortName: "25(OH)D",
    value: 18,
    unit: "нг/мл",
    refMin: 30,
    refMax: 100,
    status: "low" as const,
    explanation:
      "Уровень витамина D ниже нормы. Рекомендуется приём витамина D3 (2000–4000 МЕ/день) и увеличение времени на солнце.",
  },
];

function getRangePosition(value: number, min: number, max: number) {
  const range = max - min;
  const padding = range * 0.3;
  const totalMin = min - padding;
  const totalMax = max + padding;
  const totalRange = totalMax - totalMin;
  const pos = ((value - totalMin) / totalRange) * 100;
  return Math.max(2, Math.min(98, pos));
}

function getNormalZone(min: number, max: number) {
  const range = max - min;
  const padding = range * 0.3;
  const totalMin = min - padding;
  const totalMax = max + padding;
  const totalRange = totalMax - totalMin;
  const left = ((min - totalMin) / totalRange) * 100;
  const right = ((max - totalMin) / totalRange) * 100;
  return { left, width: right - left };
}

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const faqItems = [
  {
    q: "Какие анализы поддерживаются?",
    a: "Общий и биохимический анализ крови, гормоны щитовидной железы, витамин D, железо и ферритин, анализ мочи, копрограмма, ИППП и многие другие. Мы распознаём результаты из всех крупных лабораторий.",
  },
  {
    q: "Насколько точна AI-расшифровка?",
    a: "Мы используем Claude — одну из самых продвинутых AI-моделей. Точность интерпретации составляет 99%. При этом сервис не ставит диагнозы, а помогает понять результаты и подготовить вопросы для врача.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Файлы анализов хранятся в зашифрованном хранилище и автоматически удаляются. Мы не передаём данные третьим лицам и соблюдаем требования законодательства о персональных данных.",
  },
  {
    q: "Что входит в полный отчёт?",
    a: "Расшифровка каждого показателя простым языком, рекомендации по питанию и образу жизни, список вопросов для врача, рекомендации по дополнительным обследованиям. Отчёт доступен онлайн и в виде PDF.",
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function EditorialIndicatorCard({
  indicator,
}: {
  indicator: (typeof previewIndicators)[0];
}) {
  const isNormal = indicator.status === "normal";
  const position = getRangePosition(
    indicator.value,
    indicator.refMin,
    indicator.refMax
  );
  const normalZone = getNormalZone(indicator.refMin, indicator.refMax);

  return (
    <div className="animate-fade-up rounded-2xl bg-card px-8 py-7 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {indicator.shortName}
          </p>
          <h3 className="mt-1 text-lg font-medium text-foreground">
            {indicator.name}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isNormal
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isNormal ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span
          className={`text-4xl font-light tabular-nums ${
            isNormal ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {indicator.value}
        </span>
        <span className="text-base text-muted-foreground">
          {indicator.unit}
        </span>
      </div>

      {/* Range bar */}
      <div className="mt-5">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute top-0 h-full rounded-full bg-emerald-500/15"
            style={{
              left: `${normalZone.left}%`,
              width: `${normalZone.width}%`,
            }}
          />
          <div
            className={`absolute top-0 h-full w-1.5 rounded-full ${
              isNormal ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>
            {indicator.refMin} {indicator.unit}
          </span>
          <span className="text-emerald-600">норма</span>
          <span>
            {indicator.refMax} {indicator.unit}
          </span>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
        {indicator.explanation}
      </p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 py-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-lg font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {a}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Variant3Page() {
  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* ── Header ── */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Мой<span className="text-primary">Анализ</span>
        </span>
        <a
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Загрузить анализ
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-32 text-center">
        <h1 className="animate-fade-up text-5xl leading-[1.15] font-extralight tracking-tight text-foreground sm:text-6xl">
          Узнайте, что означают
          <br />
          <span className="text-primary">ваши анализы</span>
        </h1>
        <p className="animate-fade-up delay-100 mx-auto mt-8 max-w-xl text-lg leading-relaxed font-light text-muted-foreground">
          Загрузите результаты из любой лаборатории — получите понятную
          расшифровку каждого показателя с рекомендациями за 30 секунд.
        </p>
        <div className="animate-fade-up delay-200 mt-14">
          <a
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
          >
            <Upload className="h-5 w-5" />
            Загрузить анализы — бесплатно
          </a>
        </div>
        <p className="animate-fade-up delay-300 mt-5 text-sm text-muted-foreground">
          PDF, фото или скан &middot; Результат через 30 секунд
        </p>
      </section>

      {/* ── Preview ── */}
      <section className="mx-auto max-w-2xl px-6 pb-36">
        <p className="mb-10 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Пример расшифровки
        </p>
        <div className="flex flex-col gap-5">
          {previewIndicators.map((ind) => (
            <EditorialIndicatorCard key={ind.shortName} indicator={ind} />
          ))}
        </div>
      </section>

      {/* ── Teaser ── */}
      <section className="bg-white py-28">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-3xl font-light tracking-tight text-foreground">
            Что вы получите в отчёте
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Какие продукты добавить в рацион для нормализации показателей.",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Конкретные шаги для улучшения здоровья на основе ваших результатов.",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные обследования",
                desc: "Какие анализы стоит сдать дополнительно для полной картины.",
              },
              {
                icon: HelpCircle,
                title: "Вопросы для врача",
                desc: "Подготовленный список вопросов, которые стоит обсудить с доктором.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-light tracking-tight text-foreground">
            Почему выбирают нас
          </h2>
          <div className="mt-16 grid gap-16 sm:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "Простым языком",
                desc: "Никакого медицинского жаргона — только понятные объяснения.",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Готовый список тем для обсуждения на приёме.",
              },
              {
                icon: Zap,
                title: "30 секунд",
                desc: "Полная расшифровка за время, пока вы наливаете кофе.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust stats ── */}
      <section className="bg-white py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-12 text-center sm:grid-cols-3">
            {[
              { value: "10 000+", label: "анализов расшифровано" },
              { value: "99%", label: "точность интерпретации" },
              {
                value: "4.8",
                label: "средняя оценка",
                extra: (
                  <div className="mt-1 flex justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < 5
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                ),
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-light tracking-tight text-primary">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
                {stat.extra}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Labs ── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Поддерживаемые лаборатории
          </p>
          <div className="mt-8 flex items-center justify-center gap-10 text-lg font-light text-muted-foreground">
            <span>Инвитро</span>
            <span className="text-border">|</span>
            <span>Гемотест</span>
            <span className="text-border">|</span>
            <span>KDL</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            и другие лаборатории России
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-28">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-3xl font-light tracking-tight text-foreground">
            Частые вопросы
          </h2>
          <div className="mt-14">
            {faqItems.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground">
            Готовы разобраться в своих анализах?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Загрузите файл — первые два показателя бесплатно.
            <br />
            Полный отчёт — <span className="font-medium text-foreground">199 ₽</span>.
          </p>
          <div className="mt-12">
            <a
              href="/"
              className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <a href="/offer" className="hover:text-foreground">
              Оферта
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Политика конфиденциальности
            </a>
            <a href="/terms" className="hover:text-foreground">
              Условия использования
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            support@moyanaliz.ru
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Не является медицинской консультацией</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

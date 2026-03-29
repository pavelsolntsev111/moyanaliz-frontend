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
  FileText,
  Users,
  TrendingUp,
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
    q: "Что входит в полный отчёт за 199 рублей?",
    a: "Расшифровка каждого показателя простым языком, рекомендации по питанию и образу жизни, список вопросов для врача, рекомендации по дополнительным обследованиям. Отчёт доступен онлайн и в виде PDF.",
  },
];

/* ------------------------------------------------------------------ */
/*  Dark indicator card                                                */
/* ------------------------------------------------------------------ */

function DarkIndicatorCard({
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
    <div className="animate-fade-up rounded-2xl border border-[#2a3442] bg-[#1a2332] p-6 transition-all hover:border-[#3a4a5a]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            {indicator.shortName}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            {indicator.name}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isNormal
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
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

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={`text-3xl font-bold tabular-nums ${
            isNormal ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {indicator.value}
        </span>
        <span className="text-sm text-slate-400">{indicator.unit}</span>
      </div>

      {/* Range bar */}
      <div className="mt-4">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#0f1419]">
          <div
            className="absolute top-0 h-full rounded-full bg-emerald-500/20"
            style={{
              left: `${normalZone.left}%`,
              width: `${normalZone.width}%`,
            }}
          />
          <div
            className={`absolute top-0 h-full w-1.5 rounded-full ${
              isNormal ? "bg-emerald-400" : "bg-red-400"
            }`}
            style={{
              left: `${position}%`,
              transform: "translateX(-50%)",
              boxShadow: isNormal
                ? "0 0 8px rgba(52,211,153,0.5)"
                : "0 0 8px rgba(248,113,113,0.5)",
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
          <span>
            {indicator.refMin} {indicator.unit}
          </span>
          <span className="text-emerald-500/70">норма</span>
          <span>
            {indicator.refMax} {indicator.unit}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        {indicator.explanation}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Item                                                           */
/* ------------------------------------------------------------------ */

function DarkFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2a3442] py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-base font-medium text-white">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
          {a}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Variant4Page() {
  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* ── Header ── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold tracking-tight">
          Мой
          <span
            className="text-[#00b4bc]"
            style={{ textShadow: "0 0 20px rgba(0,180,188,0.3)" }}
          >
            Анализ
          </span>
        </span>
        <a
          href="/"
          className="rounded-lg border border-[#00b4bc]/30 px-4 py-2 text-sm font-medium text-[#00b4bc] transition-all hover:border-[#00b4bc]/60 hover:shadow-[0_0_15px_rgba(0,180,188,0.15)]"
        >
          Начать
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-28">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "800px",
            height: "600px",
            background:
              "radial-gradient(ellipse at center, rgba(0,180,188,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#2a3442] bg-[#1a2332] px-4 py-1.5 text-xs font-medium text-slate-400">
            <Zap className="h-3.5 w-3.5 text-[#00b4bc]" />
            AI-расшифровка за 30 секунд
          </div>
          <h1 className="animate-fade-up delay-100 mt-8 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Узнайте, что означают
            <br />
            <span
              className="text-[#00b4bc]"
              style={{ textShadow: "0 0 40px rgba(0,180,188,0.25)" }}
            >
              ваши анализы
            </span>
          </h1>
          <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Загрузите PDF или фото из любой лаборатории — получите детальную
            расшифровку с рекомендациями от передового AI.
          </p>
          <div className="animate-fade-up delay-300 mt-10">
            <a
              href="/"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-base font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #00b4bc, #009da5)",
                boxShadow:
                  "0 0 30px rgba(0,180,188,0.3), 0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы — бесплатно
              <div
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, #00c8d0, #00b4bc)",
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                {/* content is in parent, this span is for hover glow trick */}
              </span>
            </a>
          </div>
          <p className="animate-fade-up delay-400 mt-5 text-sm text-slate-500">
            PDF, JPEG, PNG, WebP, HEIC &middot; до 20 МБ
          </p>
        </div>
      </section>

      {/* ── Preview ── */}
      <section className="mx-auto max-w-2xl px-6 pb-28">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2a3442]" />
          <span className="text-xs font-medium tracking-widest text-slate-500 uppercase">
            Пример расшифровки
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2a3442]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {previewIndicators.map((ind) => (
            <DarkIndicatorCard key={ind.shortName} indicator={ind} />
          ))}
        </div>
      </section>

      {/* ── Teaser: What you get ── */}
      <section className="border-t border-[#1a2332] bg-[#111827] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Что входит в{" "}
            <span className="text-[#00b4bc]">полный отчёт</span>
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Персональные советы: какие продукты добавить в рацион для нормализации показателей.",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Конкретные шаги и приоритеты для улучшения здоровья на основе ваших результатов.",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные обследования",
                desc: "Какие анализы стоит сдать, чтобы увидеть полную картину.",
              },
              {
                icon: HelpCircle,
                title: "Вопросы для врача",
                desc: "Готовый список вопросов для обсуждения на приёме у специалиста.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group flex gap-4 rounded-xl border border-[#2a3442] bg-[#1a2332]/50 p-5 transition-all hover:border-[#00b4bc]/20 hover:shadow-[0_0_20px_rgba(0,180,188,0.05)]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(0,180,188,0.1)",
                  }}
                >
                  <item.icon className="h-5 w-5 text-[#00b4bc]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Почему <span className="text-[#00b4bc]">МойАнализ</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "Простым языком",
                desc: "Никакого медицинского жаргона. Каждый показатель объяснён так, чтобы было понятно.",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Подготовьтесь к визиту — мы сформируем список вопросов на основе ваших результатов.",
              },
              {
                icon: Zap,
                title: "30 секунд",
                desc: "От загрузки до результата — быстрее, чем вы варите кофе.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#2a3442] bg-[#1a2332] p-6 text-center transition-all hover:border-[#00b4bc]/20"
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "rgba(0,180,188,0.1)" }}
                >
                  <item.icon className="h-5 w-5 text-[#00b4bc]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust stats ── */}
      <section className="border-t border-b border-[#1a2332] bg-[#111827] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-10 text-center sm:grid-cols-3">
            {[
              {
                icon: Users,
                value: "10 000+",
                label: "анализов расшифровано",
              },
              {
                icon: TrendingUp,
                value: "99%",
                label: "точность интерпретации",
              },
              {
                icon: Star,
                value: "4.8",
                label: "средняя оценка",
                extra: (
                  <div className="mt-2 flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 5
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                ),
              },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2332]">
                  <stat.icon className="h-5 w-5 text-[#00b4bc]" />
                </div>
                <p
                  className="text-4xl font-bold tabular-nums text-[#00b4bc]"
                  style={{ textShadow: "0 0 30px rgba(0,180,188,0.2)" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                {stat.extra}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Labs ── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
            Поддерживаемые лаборатории
          </p>
          <div className="mt-6 flex items-center justify-center gap-8">
            {["Инвитро", "Гемотест", "KDL"].map((lab, i) => (
              <span key={lab} className="flex items-center gap-8">
                <span className="text-base font-medium text-slate-300">
                  {lab}
                </span>
                {i < 2 && (
                  <span className="h-4 w-px bg-[#2a3442]" />
                )}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            и другие лаборатории России
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-[#1a2332] bg-[#111827] py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Частые вопросы
          </h2>
          <div className="mt-10">
            {faqItems.map((item) => (
              <DarkFaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(0,180,188,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Разберитесь в своих анализах
            <br />
            <span className="text-[#00b4bc]">прямо сейчас</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Два показателя — бесплатно. Полный отчёт с рекомендациями —{" "}
            <span className="font-semibold text-white">199 ₽</span>.
          </p>
          <div className="mt-10">
            <a
              href="/"
              className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #00b4bc, #009da5)",
                boxShadow:
                  "0 0 30px rgba(0,180,188,0.3), 0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Данные зашифрованы
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              PDF + онлайн отчёт
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a2332] py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <a href="/offer" className="hover:text-slate-300 transition-colors">
              Оферта
            </a>
            <a
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Политика конфиденциальности
            </a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">
              Условия использования
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">support@moyanaliz.ru</p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <Shield className="h-3 w-3" />
            <span>Сервис не является медицинской консультацией</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

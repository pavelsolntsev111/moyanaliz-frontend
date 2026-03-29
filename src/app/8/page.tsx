"use client";

import {
  Upload,
  Brain,
  FileText,
  ShieldCheck,
  Star,
  Zap,
  Stethoscope,
  Apple,
  ClipboardList,
  FlaskConical,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/* ───────── FAQ data ───────── */
const faqItems = [
  {
    q: "Какие анализы поддерживаются?",
    a: "Общий и биохимический анализ крови, анализ мочи, копрограмму, гормоны щитовидной железы, глюкозу и HbA1c, железо и ферритин, витамин D, ПЦР на ИППП, ВИЧ/сифилис/гепатиты и другие лабораторные исследования.",
  },
  {
    q: "Насколько точна интерпретация?",
    a: "Мы используем AI Claude для анализа — точность составляет 99%. Результат носит информационный характер и не заменяет консультацию врача.",
  },
  {
    q: "Какие форматы файлов принимаются?",
    a: "PDF, JPEG, PNG, WebP и HEIC — до 20 МБ. Подходят сканы, фотографии бланков и электронные результаты из лабораторий.",
  },
  {
    q: "Сколько времени занимает расшифровка?",
    a: "Предварительный анализ готов за 30 секунд. Полный отчёт с рекомендациями — 1–2 минуты после оплаты.",
  },
  {
    q: "Можно ли получить PDF-отчёт?",
    a: "Да, после оплаты полный отчёт доступен в браузере и отправляется на email в формате PDF.",
  },
  {
    q: "Это замена визита к врачу?",
    a: "Нет. Сервис помогает понять результаты анализов и подготовить вопросы для врача, но не является медицинской консультацией.",
  },
];

/* ───────── Compact indicator card ───────── */
function CompactCard({
  name,
  value,
  unit,
  refMin,
  refMax,
  status,
}: {
  name: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: "normal" | "abnormal";
}) {
  const isNormal = status === "normal";
  const range = refMax - refMin;
  const padding = range * 0.3;
  const totalMin = refMin - padding;
  const totalMax = refMax + padding;
  const totalRange = totalMax - totalMin;
  const pos = Math.max(2, Math.min(98, ((value - totalMin) / totalRange) * 100));
  const normLeft = ((refMin - totalMin) / totalRange) * 100;
  const normWidth = ((refMax - refMin) / totalRange) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isNormal ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className="text-sm font-medium text-foreground">{name}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-base font-bold ${
              isNormal ? "text-success" : "text-destructive"
            }`}
          >
            {value}
          </span>
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="relative h-1.5 bg-muted rounded-full">
        <div
          className="absolute top-0 h-full bg-success/20 rounded-full"
          style={{ left: `${normLeft}%`, width: `${normWidth}%` }}
        />
        <div
          className={`absolute top-0 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-[2px] ${
            isNormal ? "bg-success" : "bg-destructive"
          }`}
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">
          {refMin} {unit}
        </span>
        <span
          className={`text-[10px] font-medium ${
            isNormal ? "text-success" : "text-destructive"
          }`}
        >
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {refMax} {unit}
        </span>
      </div>
    </div>
  );
}

/* ───────── FAQ row ───────── */
function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:text-primary transition-colors"
      >
        <span className="text-sm font-medium text-foreground pr-3">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="text-xs text-muted-foreground pb-3 px-1 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

/* ═══════════ MAIN PAGE ═══════════ */
export default function Variant8Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Compact Hero with integrated upload bar ── */}
      <section className="hero-gradient border-b border-border">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-3">
              Узнайте, что означают{" "}
              <span className="text-primary">ваши анализы</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
              AI-расшифровка лабораторных исследований с рекомендациями по
              питанию, активности и вопросами для врача
            </p>
          </div>

          {/* Upload bar — integrated search/upload style */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                PDF, фото или скан анализа (до 20 МБ)
              </span>
            </div>
            <a
              href="/"
              className="flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-lg cta-glow whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Загрузить анализы — бесплатно
            </a>
          </div>

          {/* Lab logos inline */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[11px] text-muted-foreground">
              Поддерживаем:
            </span>
            {[
              { src: "/labs/invitro.png", alt: "Инвитро" },
              { src: "/labs/gemotest.png", alt: "Гемотест" },
              { src: "/labs/kdl.png", alt: "KDL" },
            ].map((lab) => (
              <Image
                key={lab.alt}
                src={lab.src}
                alt={lab.alt}
                width={64}
                height={24}
                className="h-5 w-auto object-contain opacity-50 grayscale"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats banner bar ── */}
      <div className="bg-foreground">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {[
            { icon: FileText, value: "10 000+", label: "анализов" },
            { icon: ShieldCheck, value: "99%", label: "точность" },
            { icon: Star, value: "4.8", label: "оценка" },
            { icon: Clock, value: "30 сек", label: "скорость" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/50 hidden sm:inline">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Three-column preview section ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold text-foreground mb-6">
          Как выглядит результат анализа
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left sidebar — mini stats */}
          <div className="md:col-span-3 space-y-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                Сводка
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Всего показателей
                  </span>
                  <span className="text-sm font-bold text-foreground">14</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    В норме
                  </span>
                  <span className="text-sm font-bold text-success">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Требуют внимания
                  </span>
                  <span className="text-sm font-bold text-destructive">2</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Тип анализа
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Биохимия
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Пол</span>
                  <span className="text-xs font-medium text-foreground">
                    Жен, 32
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="text-[11px] uppercase tracking-wide text-primary mb-2 font-semibold">
                Оценка
              </div>
              <div className="text-3xl font-bold text-primary mb-1">Хорошо</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Большинство показателей в норме. Обратите внимание на витамин D.
              </p>
            </div>
          </div>

          {/* Center — indicator cards */}
          <div className="md:col-span-5 space-y-3">
            <CompactCard
              name="Альбумин"
              value={50}
              unit="г/л"
              refMin={35}
              refMax={52}
              status="normal"
            />
            <CompactCard
              name="Витамин D"
              value={18}
              unit="нг/мл"
              refMin={30}
              refMax={100}
              status="abnormal"
            />

            {/* Blurred teaser cards */}
            <div className="relative">
              <div className="space-y-3 blur-[3px] select-none pointer-events-none">
                <div className="bg-card border border-border rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-sm font-medium text-foreground">
                        Гемоглобин
                      </span>
                    </div>
                    <span className="text-base font-bold text-success">
                      138 г/л
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full" />
                </div>
                <div className="bg-card border border-border rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-sm font-medium text-foreground">
                        Глюкоза
                      </span>
                    </div>
                    <span className="text-base font-bold text-success">
                      4.8 ммоль/л
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="/"
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg cta-glow flex items-center gap-1.5"
                >
                  Открыть все показатели — 199 ₽
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right — teaser blocks */}
          <div className="md:col-span-4 space-y-3">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Продукты, которые помогут нормализовать витамин D и поддержать альбумин",
                color: "text-success",
                border: "border-success/20",
                bg: "bg-success/5",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Пошаговый чек-лист: приём витаминов, контрольные анализы, визит к врачу",
                color: "text-primary",
                border: "border-primary/20",
                bg: "bg-primary/5",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные анализы",
                desc: "Рекомендация сдать кальций, паратгормон и магний для полной картины",
                color: "text-warning",
                border: "border-warning/20",
                bg: "bg-warning/5",
              },
              {
                icon: MessageSquare,
                title: "Вопросы для врача",
                desc: "3 конкретных вопроса для терапевта или эндокринолога на приёме",
                color: "text-destructive",
                border: "border-destructive/20",
                bg: "bg-destructive/5",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`${item.bg} border ${item.border} rounded-lg p-3.5`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits strip ── */}
      <section className="border-y border-border bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Brain,
                title: "Понятным языком",
                desc: "Без медицинского жаргона",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Подготовьтесь к приёму",
              },
              {
                icon: Zap,
                title: "30 секунд",
                desc: "Предварительный анализ мгновенно",
              },
              {
                icon: ShieldCheck,
                title: "Конфиденциально",
                desc: "Данные защищены и зашифрованы",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ two columns ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold text-foreground mb-5">
          Частые вопросы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div>
            {faqItems.slice(0, 3).map((item) => (
              <FAQRow key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div>
            {faqItems.slice(3).map((item) => (
              <FAQRow key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA (compact) ── */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Расшифруйте свои анализы прямо сейчас
            </h3>
            <p className="text-sm text-muted-foreground">
              Предварительный результат бесплатно &middot; Полный отчёт — 199 ₽
            </p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-lg cta-glow whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            Загрузить анализы
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            &copy; 2026 Мой Анализ &middot;{" "}
            <a href="/offer" className="underline hover:text-foreground">
              Оферта
            </a>{" "}
            &middot;{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Политика
            </a>
          </p>
          <p>Не является медицинской организацией</p>
        </div>
      </footer>
    </div>
  );
}

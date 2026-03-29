"use client";

import {
  Upload,
  Brain,
  FileText,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShieldCheck,
  Zap,
  Stethoscope,
  Apple,
  ClipboardList,
  FlaskConical,
  MessageSquare,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/* ───────── FAQ data ───────── */
const faqItems = [
  {
    q: "Какие анализы можно расшифровать?",
    a: "Общий и биохимический анализ крови, анализ мочи, копрограмму, гормоны щитовидной железы, глюкозу и HbA1c, железо и ферритин, витамин D, ПЦР на ИППП, ВИЧ/сифилис/гепатиты и другие.",
  },
  {
    q: "Насколько точна расшифровка?",
    a: "Мы используем передовой AI Claude для анализа — точность интерпретации составляет 99%. Однако результат не заменяет консультацию врача и носит информационный характер.",
  },
  {
    q: "Какие форматы файлов поддерживаются?",
    a: "PDF, JPEG, PNG, WebP и HEIC — файлы до 20 МБ. Можно загрузить скан, фото или электронный бланк из лаборатории.",
  },
  {
    q: "Как быстро я получу результат?",
    a: "Предварительный анализ — за 30 секунд сразу после загрузки. Полный отчёт с рекомендациями — в течение 1–2 минут после оплаты.",
  },
];

/* ───────── Step component ───────── */
function TimelineStep({
  number,
  title,
  isLast,
  reverse,
  children,
}: {
  number: string;
  title: string;
  isLast?: boolean;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-6 md:left-1/2 top-16 bottom-0 w-px bg-border md:-translate-x-px z-0" />
      )}

      <div
        className={`relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Number circle — always on left on mobile, center on desktop */}
        <div className="flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-md">
            {number}
          </div>
        </div>

        {/* Spacer for desktop layout */}
        <div className="hidden md:block md:w-1/2" />

        {/* Content */}
        <div className="md:w-1/2 w-full pl-16 md:pl-0">
          <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───────── Indicator preview card ───────── */
function PreviewCard({
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
    <div className="bg-card rounded-xl card-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground">{name}</span>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isNormal
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span
          className={`text-2xl font-bold ${
            isNormal ? "text-success" : "text-destructive"
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      {/* Range bar */}
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-success/25 rounded-full"
          style={{ left: `${normLeft}%`, width: `${normWidth}%` }}
        />
        <div
          className={`absolute top-0 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-[1px] shadow ${
            isNormal ? "bg-success" : "bg-destructive"
          }`}
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-muted-foreground">{refMin}</span>
        <span className="text-[11px] text-muted-foreground">{refMax}</span>
      </div>
    </div>
  );
}

/* ───────── FAQ accordion item ───────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

/* ═══════════ MAIN PAGE ═══════════ */
export default function Variant7Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="hero-gradient pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4" />
            Результат за 30 секунд
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-5">
            Узнайте, что означают
            <br />
            <span className="text-primary">ваши анализы</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Загрузите результаты из лаборатории — получите понятную расшифровку
            с рекомендациями по питанию, активности и вопросами для врача
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-lg px-8 py-4 rounded-xl cta-glow animate-subtle-pulse"
          >
            <Upload className="w-5 h-5" />
            Загрузить анализы — бесплатно
          </a>
          <p className="text-sm text-muted-foreground mt-3">
            PDF, фото или скан &middot; до 20 МБ
          </p>
        </div>
      </section>

      {/* ── Timeline steps ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-20">
        {/* Step 01 — Upload */}
        <TimelineStep number="01" title="Загрузите ваш анализ">
          <p className="text-muted-foreground mb-5 leading-relaxed">
            Просто перетащите PDF-файл или фотографию бланка из любой
            лаборатории. Мы поддерживаем Инвитро, Гемотест, KDL и другие.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg cta-glow text-sm"
          >
            <Upload className="w-4 h-4" />
            Загрузить анализы
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Lab logos */}
          <div className="flex items-center gap-5 mt-6">
            {[
              { src: "/labs/invitro.png", alt: "Инвитро" },
              { src: "/labs/gemotest.png", alt: "Гемотест" },
              { src: "/labs/kdl.png", alt: "KDL" },
            ].map((lab) => (
              <Image
                key={lab.alt}
                src={lab.src}
                alt={lab.alt}
                width={80}
                height={32}
                className="h-7 w-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition"
              />
            ))}
          </div>
        </TimelineStep>

        {/* Step 02 — AI analyzes (reverse on desktop) */}
        <TimelineStep number="02" title="AI анализирует показатели" reverse>
          <p className="text-muted-foreground mb-5 leading-relaxed">
            Наш AI мгновенно распознаёт все показатели, сравнивает с
            референсными значениями и выявляет отклонения.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewCard
              name="Альбумин"
              value={50}
              unit="г/л"
              refMin={35}
              refMax={52}
              status="normal"
            />
            <PreviewCard
              name="Витамин D"
              value={18}
              unit="нг/мл"
              refMin={30}
              refMax={100}
              status="abnormal"
            />
          </div>
        </TimelineStep>

        {/* Step 03 — Get report */}
        <TimelineStep number="03" title="Получите персональный отчёт">
          <p className="text-muted-foreground mb-5 leading-relaxed">
            Подробная расшифровка каждого показателя с конкретными
            рекомендациями: что есть, что делать, о чём спросить врача.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Какие продукты помогут нормализовать показатели",
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Пошаговый чек-лист на ближайшие недели",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные анализы",
                desc: "Какие обследования стоит пройти дополнительно",
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                icon: MessageSquare,
                title: "Вопросы для врача",
                desc: "Готовые вопросы для приёма у специалиста",
                color: "text-destructive",
                bg: "bg-destructive/10",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-xl card-elevated p-4 flex gap-3 items-start"
              >
                <div className={`p-2 rounded-lg ${item.bg} flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TimelineStep>

        {/* Step 04 — Take action (reverse on desktop) */}
        <TimelineStep number="04" title="Действуйте уверенно" reverse isLast>
          <p className="text-muted-foreground mb-5 leading-relaxed">
            Вы получаете не просто цифры, а понятное объяснение — что с вами,
            почему это важно и что делать дальше.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: Brain,
                title: "Понятным языком",
                desc: "Никаких медицинских терминов — всё объяснено просто",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Идите на приём подготовленными с конкретными вопросами",
              },
              {
                icon: Zap,
                title: "За 30 секунд",
                desc: "Мгновенный предварительный анализ сразу после загрузки",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg cta-glow text-sm mt-6"
          >
            Попробовать за 199 ₽
            <ArrowRight className="w-4 h-4" />
          </a>
        </TimelineStep>
      </section>

      {/* ── Trust stats ── */}
      <section className="bg-foreground py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            {
              value: "10 000+",
              label: "анализов расшифровано",
              icon: FileText,
            },
            { value: "99%", label: "точность интерпретации", icon: ShieldCheck },
            { value: "4.8", label: "средняя оценка", icon: Star },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Частые вопросы
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="hero-gradient py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Готовы расшифровать свои анализы?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Загрузите файл — предварительный результат бесплатно за 30 секунд.
          Полный отчёт с рекомендациями — 199 ₽.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-lg px-8 py-4 rounded-xl cta-glow animate-subtle-pulse"
        >
          <Upload className="w-5 h-5" />
          Загрузить анализы — бесплатно
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        <p>
          &copy; 2026 Мой Анализ &middot;{" "}
          <a href="/offer" className="underline hover:text-foreground">
            Оферта
          </a>{" "}
          &middot;{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Политика конфиденциальности
          </a>
        </p>
        <p className="mt-2">
          Сервис не является медицинской организацией. Результаты носят
          информационный характер.
        </p>
      </footer>
    </div>
  );
}

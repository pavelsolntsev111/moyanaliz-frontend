"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Apple,
  ClipboardList,
  TestTubes,
  Stethoscope,
  MessageSquare,
  Clock,
  BookOpen,
  Star,
  Users,
  Shield,
  ChevronDown,
  FileText,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

/* ─── Dashboard Card wrapper ─── */
function DashCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-card shadow-md border border-border/50 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Preview Indicator Card ─── */
function PreviewIndicator({
  name,
  shortName,
  value,
  unit,
  status,
  refMin,
  refMax,
}: {
  name: string;
  shortName: string;
  value: number;
  unit: string;
  status: "normal" | "abnormal";
  refMin: number;
  refMax: number;
}) {
  const isNormal = status === "normal";
  const range = refMax - refMin;
  const padding = range * 0.3;
  const totalMin = refMin - padding;
  const totalMax = refMax + padding;
  const totalRange = totalMax - totalMin;
  const pos = Math.max(2, Math.min(98, ((value - totalMin) / totalRange) * 100));
  const normLeft = ((refMin - totalMin) / totalRange) * 100;
  const normWidth = ((refMax - totalMin) / totalRange) * 100 - normLeft;

  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{shortName}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isNormal
              ? "bg-success text-success-foreground"
              : "bg-destructive text-white"
          }`}
        >
          {isNormal ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold ${
            isNormal ? "text-success" : "text-destructive"
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-3">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute top-0 h-full rounded-full bg-success/20"
            style={{ left: `${normLeft}%`, width: `${normWidth}%` }}
          />
          <div
            className={`absolute top-0 h-full w-1.5 rounded-full ${
              isNormal ? "bg-success" : "bg-destructive"
            }`}
            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>
            {refMin} {unit}
          </span>
          <span className="text-success">норма</span>
          <span>
            {refMax} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DashCard className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </div>
      )}
    </DashCard>
  );
}

/* ─── Stat Metric Card ─── */
function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <DashCard className="p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-extrabold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </DashCard>
  );
}

export default function Variant6Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* ─── Hero Card (full width) ─── */}
        <DashCard className="animate-fade-up hero-gradient overflow-hidden p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Узнайте, что означают
              <br />
              <span className="text-primary">ваши анализы</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              ИИ-расшифровка лабораторных анализов с рекомендациями по питанию и
              образу жизни. Понятно, быстро, конфиденциально.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              PDF, фото или скан — результат за 30 секунд
            </p>
          </div>
        </DashCard>

        {/* ─── Upload + Preview (2 col) ─── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Upload zone card */}
          <DashCard className="animate-fade-up delay-100 flex flex-col items-center justify-center p-8 sm:p-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-foreground">
              Загрузите анализы
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Поддерживаем PDF, JPEG, PNG, WebP, HEIC.
              <br />
              Максимум 20 МБ.
            </p>
            <a
              href="/"
              className="cta-glow animate-subtle-pulse mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы — бесплатно
            </a>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Данные зашифрованы и не передаются третьим лицам
            </p>
          </DashCard>

          {/* Preview card */}
          <DashCard className="animate-fade-up delay-200 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Пример расшифровки
              </h2>
            </div>
            <div className="space-y-4">
              <PreviewIndicator
                name="Альбумин"
                shortName="ALB"
                value={50}
                unit="г/л"
                status="normal"
                refMin={35}
                refMax={52}
              />
              <PreviewIndicator
                name="Витамин D"
                shortName="25-OH Vitamin D"
                value={18}
                unit="нг/мл"
                status="abnormal"
                refMin={30}
                refMax={100}
              />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Полный отчёт со всеми показателями — от{" "}
              <span className="font-semibold text-foreground">199 ₽</span>
            </p>
          </DashCard>
        </div>

        {/* ─── Benefits (3 cards row) ─── */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Простым языком",
              desc: "Результаты без медицинского жаргона — всё понятно с первого прочтения",
            },
            {
              icon: MessageSquare,
              title: "Вопросы для врача",
              desc: "Готовые вопросы для приёма, чтобы не забыть ничего важного",
            },
            {
              icon: Clock,
              title: "Результат за 30 сек",
              desc: "Загрузите файл и получите расшифровку практически мгновенно",
            },
          ].map((item, i) => (
            <DashCard
              key={item.title}
              className={`animate-fade-up delay-${(i + 1) * 100} p-6`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </DashCard>
          ))}
        </div>

        {/* ─── Stats (3 metric cards) ─── */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="animate-fade-up delay-100">
            <MetricCard
              icon={Users}
              value="10 000+"
              label="анализов расшифровано"
            />
          </div>
          <div className="animate-fade-up delay-200">
            <MetricCard
              icon={Shield}
              value="99%"
              label="точность распознавания"
            />
          </div>
          <div className="animate-fade-up delay-300">
            <MetricCard
              icon={Star}
              value="4.8"
              label="средняя оценка пользователей"
            />
          </div>
        </div>

        {/* ─── Teaser blocks (2x2 grid) ─── */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            {
              icon: Apple,
              title: "Рекомендации по питанию",
              desc: "Какие продукты добавить в рацион и какие ограничить для улучшения показателей",
              color: "bg-success/10 text-success",
            },
            {
              icon: ClipboardList,
              title: "План действий",
              desc: "Пошаговые рекомендации: что делать в первую очередь для нормализации показателей",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: TestTubes,
              title: "Дополнительные анализы",
              desc: "Какие исследования стоит пройти дополнительно для полной картины здоровья",
              color: "bg-warning/10 text-warning",
            },
            {
              icon: Stethoscope,
              title: "Вопросы для врача",
              desc: "Готовый список вопросов, чтобы максимально эффективно провести приём у специалиста",
              color: "bg-destructive/10 text-destructive",
            },
          ].map((item, i) => (
            <DashCard
              key={item.title}
              className={`animate-fade-up delay-${(i + 1) * 100} p-6`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            </DashCard>
          ))}
        </div>

        {/* ─── Lab logos ─── */}
        <DashCard className="mt-6 p-6 sm:p-8">
          <h2 className="text-center text-base font-bold text-foreground">
            Поддерживаемые лаборатории
          </h2>
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            Распознаём анализы из всех крупных лабораторий России
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            {[
              { src: "/labs/invitro.png", alt: "Инвитро" },
              { src: "/labs/gemotest.png", alt: "Гемотест" },
              { src: "/labs/kdl.jpeg", alt: "KDL" },
            ].map((lab) => (
              <div
                key={lab.alt}
                className="flex h-14 w-32 items-center justify-center rounded-xl bg-muted/50 p-2"
              >
                <Image
                  src={lab.src}
                  alt={lab.alt}
                  width={100}
                  height={40}
                  className="h-9 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </DashCard>

        {/* ─── FAQ (expandable cards) ─── */}
        <div className="mt-6">
          <h2 className="mb-4 text-center text-lg font-bold text-foreground">
            Частые вопросы
          </h2>
          <div className="space-y-3">
            <FaqItem
              question="Какие анализы можно расшифровать?"
              answer="Мы поддерживаем общий и биохимический анализ крови, анализ мочи, копрограмму, гормоны щитовидной железы, глюкозу, HbA1c, железо, ферритин, витамин D, ПЦР на ИППП, ВИЧ, сифилис, гепатиты и многие другие. Загрузите файл — и мы определим тип автоматически."
            />
            <FaqItem
              question="Это заменяет визит к врачу?"
              answer="Нет. Наш сервис помогает понять результаты анализов простым языком и подготовиться к приёму. Мы не ставим диагнозы и не назначаем лечение. Для медицинских решений всегда обращайтесь к специалисту."
            />
            <FaqItem
              question="Как обеспечивается безопасность данных?"
              answer="Файлы передаются по зашифрованному каналу и обрабатываются автоматически. Мы не храним персональные данные дольше необходимого и не передаём их третьим лицам. Анализ проводится с помощью ИИ без участия людей."
            />
            <FaqItem
              question="Сколько стоит расшифровка?"
              answer="Предварительный просмотр двух показателей — бесплатно. Полный отчёт со всеми показателями, рекомендациями по питанию, планом действий и вопросами для врача — 199 ₽. Отчёт приходит на email в формате PDF."
            />
          </div>
        </div>

        {/* ─── Final CTA Card ─── */}
        <DashCard className="mt-6 mb-4 bg-primary/[0.03] p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Готовы разобраться в анализах?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузите PDF или фото — получите расшифровку за 30 секунд
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="cta-glow animate-subtle-pulse inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы — бесплатно
            </a>
          </div>
        </DashCard>
      </main>

      <SiteFooter />
    </div>
  );
}

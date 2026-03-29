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
} from "lucide-react";
import Image from "next/image";

/* ─── Indicator mini-card for preview ─── */
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
    <div className="rounded-xl bg-card p-5 shadow-md transition-shadow hover:shadow-lg">
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

/* ─── Section title with teal underline ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
        {children}
      </h2>
      <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}

/* ─── Teal horizontal rule ─── */
function TealDivider() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="h-px bg-primary/20" />
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
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Variant5Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ─── Hero (white) ─── */}
      <section className="hero-gradient py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="animate-fade-up text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Узнайте, что означают
            <br />
            <span className="text-primary">ваши анализы</span>
          </h1>
          <p className="animate-fade-up delay-100 mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Загрузите результаты лабораторных анализов и получите понятную расшифровку
            с рекомендациями по питанию и образу жизни за 30 секунд
          </p>
          <div className="animate-fade-up delay-200 mt-8">
            <a
              href="/"
              className="cta-glow animate-subtle-pulse inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы — бесплатно
            </a>
          </div>
          <p className="animate-fade-up delay-300 mt-4 text-sm text-muted-foreground">
            PDF, фото или скан — результат за 30 секунд
          </p>
        </div>
      </section>

      <TealDivider />

      {/* ─── Preview (tinted) ─── */}
      <section className="bg-primary/[0.03] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle>Пример расшифровки</SectionTitle>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="animate-fade-up delay-100">
              <PreviewIndicator
                name="Альбумин"
                shortName="ALB"
                value={50}
                unit="г/л"
                status="normal"
                refMin={35}
                refMax={52}
              />
            </div>
            <div className="animate-fade-up delay-200">
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
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Полный отчёт включает расшифровку всех показателей с рекомендациями — от{" "}
            <span className="font-semibold text-foreground">199 ₽</span>
          </p>
        </div>
      </section>

      <TealDivider />

      {/* ─── Teaser blocks (white) ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle>Что вы получите</SectionTitle>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Какие продукты добавить в рацион и какие ограничить для улучшения показателей",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Пошаговые рекомендации: что делать в первую очередь, чтобы привести показатели в норму",
              },
              {
                icon: TestTubes,
                title: "Дополнительные анализы",
                desc: "Какие исследования стоит пройти дополнительно для полной картины здоровья",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Готовый список вопросов, чтобы максимально эффективно провести приём у специалиста",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`animate-fade-up delay-${(i + 1) * 100} flex gap-4 rounded-xl p-6 shadow-md bg-card`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TealDivider />

      {/* ─── Benefits (tinted) ─── */}
      <section className="bg-primary/[0.03] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle>Почему Мой Анализ</SectionTitle>
          <div className="grid gap-6 sm:grid-cols-3">
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
                title: "Результат за 30 секунд",
                desc: "Загрузите файл и получите расшифровку практически мгновенно",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-card p-6 text-center shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
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

      <TealDivider />

      {/* ─── Trust stats (white) ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle>Нам доверяют</SectionTitle>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Users,
                value: "10 000+",
                label: "анализов расшифровано",
              },
              {
                icon: Shield,
                value: "99%",
                label: "точность распознавания",
              },
              {
                icon: Star,
                value: "4.8",
                label: "средняя оценка пользователей",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TealDivider />

      {/* ─── Lab logos (tinted) ─── */}
      <section className="bg-primary/[0.03] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <SectionTitle>Поддерживаемые лаборатории</SectionTitle>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Распознаём анализы из всех крупных лабораторий России
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {[
              { src: "/labs/invitro.png", alt: "Инвитро" },
              { src: "/labs/gemotest.png", alt: "Гемотест" },
              { src: "/labs/kdl.jpeg", alt: "KDL" },
            ].map((lab) => (
              <div
                key={lab.alt}
                className="flex h-16 w-36 items-center justify-center rounded-xl bg-card p-3 shadow-sm"
              >
                <Image
                  src={lab.src}
                  alt={lab.alt}
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <TealDivider />

      {/* ─── FAQ (white) ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle>Частые вопросы</SectionTitle>
          <div className="rounded-xl bg-card p-6 shadow-md">
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
      </section>

      {/* ─── Final CTA (tinted) ─── */}
      <section className="bg-primary/[0.03] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Готовы разобраться в анализах?
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-5 text-muted-foreground">
            Загрузите PDF или фото — получите расшифровку за 30 секунд
          </p>
          <div className="mt-8">
            <a
              href="/"
              className="cta-glow animate-subtle-pulse inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-5 w-5" />
              Загрузить анализы — бесплатно
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Upload,
  Brain,
  Zap,
  Stethoscope,
  ChevronDown,
  Apple,
  ListChecks,
  FlaskConical,
  MessageCircleQuestion,
  Star,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"

/* ────────────── indicator card (large variant) ────────────── */

function IndicatorCardLarge({
  name,
  shortName,
  value,
  unit,
  status,
  refMin,
  refMax,
  explanation,
}: {
  name: string
  shortName: string
  value: number
  unit: string
  status: "normal" | "low"
  refMin: number
  refMax: number
  explanation: string
}) {
  const isNormal = status === "normal"
  const range = refMax - refMin
  const padding = range * 0.3
  const totalMin = refMin - padding
  const totalMax = refMax + padding
  const totalRange = totalMax - totalMin
  const pos = Math.max(2, Math.min(98, ((value - totalMin) / totalRange) * 100))
  const nLeft = ((refMin - totalMin) / totalRange) * 100
  const nWidth = ((refMax - totalMin) / totalRange) * 100 - nLeft

  return (
    <div className="card-elevated rounded-2xl bg-card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{shortName}</p>
          <h3 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
            isNormal ? "bg-success text-success-foreground" : "bg-destructive text-white"
          }`}
        >
          {isNormal ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertOctagon className="h-3.5 w-3.5" />
          )}
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-4xl font-extrabold ${isNormal ? "text-success" : "text-destructive"}`}>
          {value}
        </span>
        <span className="text-base text-muted-foreground">{unit}</span>
      </div>

      <div className="mt-5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute top-0 h-full rounded-full bg-success/20"
            style={{ left: `${nLeft}%`, width: `${nWidth}%` }}
          />
          <div
            className={`absolute top-0 h-full w-2 rounded-full ${isNormal ? "bg-success" : "bg-destructive"}`}
            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{refMin} {unit}</span>
          <span className="text-success font-medium">норма</span>
          <span>{refMax} {unit}</span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{explanation}</p>
    </div>
  )
}

/* ────────────── indicator card (compact variant) ────────────── */

function IndicatorCardCompact({
  name,
  shortName,
  value,
  unit,
  status,
  refMin,
  refMax,
}: {
  name: string
  shortName: string
  value: number
  unit: string
  status: "normal" | "low"
  refMin: number
  refMax: number
}) {
  const isNormal = status === "normal"
  const range = refMax - refMin
  const padding = range * 0.3
  const totalMin = refMin - padding
  const totalMax = refMax + padding
  const totalRange = totalMax - totalMin
  const pos = Math.max(2, Math.min(98, ((value - totalMin) / totalRange) * 100))
  const nLeft = ((refMin - totalMin) / totalRange) * 100
  const nWidth = ((refMax - totalMin) / totalRange) * 100 - nLeft

  return (
    <div className="card-elevated rounded-xl bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{shortName}</p>
          <h3 className="mt-0.5 text-sm font-bold text-foreground">{name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
            isNormal ? "bg-success text-success-foreground" : "bg-destructive text-white"
          }`}
        >
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`text-xl font-extrabold ${isNormal ? "text-success" : "text-destructive"}`}>{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>

      <div className="mt-3">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute top-0 h-full rounded-full bg-success/20"
            style={{ left: `${nLeft}%`, width: `${nWidth}%` }}
          />
          <div
            className={`absolute top-0 h-full w-1.5 rounded-full ${isNormal ? "bg-success" : "bg-destructive"}`}
            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{refMin} {unit}</span>
          <span className="text-success">норма</span>
          <span>{refMax} {unit}</span>
        </div>
      </div>
    </div>
  )
}

/* ────────────── FAQ item ────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

/* ────────────── page ────────────── */

export default function Variant10Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero: asymmetric 2/3 + 1/3 ── */}
      <section className="hero-gradient border-b border-border py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-16">
          {/* left: headline */}
          <div>
            <p className="animate-fade-up text-xs font-semibold uppercase tracking-widest text-primary">
              Расшифровка анализов с ИИ
            </p>
            <h1 className="animate-fade-up delay-100 mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Узнайте, что означают ваши анализы
            </h1>
            <p className="animate-fade-up delay-200 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Загрузите PDF или фото из любой лаборатории. Искусственный интеллект
              расшифрует каждый показатель и подготовит рекомендации за 30 секунд.
            </p>

            {/* lab logos inline */}
            <div className="animate-fade-up delay-300 mt-8 flex items-center gap-6">
              <Image src="/labs/invitro.png" alt="Инвитро" width={80} height={28} className="h-5 w-auto opacity-40 grayscale" />
              <Image src="/labs/gemotest.png" alt="Гемотест" width={80} height={28} className="h-5 w-auto opacity-40 grayscale" />
              <Image src="/labs/kdl.jpeg" alt="KDL" width={80} height={28} className="h-5 w-auto opacity-40 grayscale" />
            </div>
          </div>

          {/* right: upload zone */}
          <div className="animate-fade-up delay-300 flex flex-col items-center">
            <div className="w-full max-w-xs rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Загрузите анализ</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, HEIC до 20 МБ</p>
              <a
                href="/"
                className="cta-glow mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground"
              >
                Загрузить анализы — бесплатно
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <blockquote className="relative">
            <span className="absolute -left-2 -top-4 text-6xl font-serif leading-none text-primary/15 sm:-left-6 sm:-top-6 sm:text-8xl">
              &ldquo;
            </span>
            <p className="relative text-xl font-semibold italic leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
              Мы найдём отклонения и объясним каждый показатель
            </p>
            <span className="absolute -bottom-6 -right-2 text-6xl font-serif leading-none text-primary/15 sm:-bottom-8 sm:-right-6 sm:text-8xl">
              &rdquo;
            </span>
          </blockquote>
          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary/40" />
        </div>
      </section>

      {/* ── Preview: asymmetric spread ── */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Пример результата
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-center text-sm text-muted-foreground">
            Каждый показатель со шкалой, статусом и объяснением
          </p>

          <div className="animate-fade-up delay-200 mt-10 grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
            {/* large card */}
            <IndicatorCardLarge
              name="Альбумин"
              shortName="ALB"
              value={50}
              unit="г/л"
              status="normal"
              refMin={35}
              refMax={52}
              explanation="Альбумин в пределах нормы. Это основной белок крови, отвечающий за транспорт веществ и поддержание давления. Для поддержания уровня рекомендуется достаточное потребление белка: яйца, рыба, творог."
            />
            {/* compact card */}
            <IndicatorCardCompact
              name="Витамин D"
              shortName="25-OH Vitamin D"
              value={18}
              unit="нг/мл"
              status="low"
              refMin={30}
              refMax={100}
            />
          </div>
        </div>
      </section>

      {/* ── Teaser blocks: horizontal with dividers ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Что входит в полный отчёт
          </h2>
          <div className="animate-fade-up delay-200 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Apple,
                title: "Питание",
                desc: "Какие продукты и нутриенты помогут привести показатели в норму",
              },
              {
                icon: ListChecks,
                title: "План действий",
                desc: "Пошаговый чек-лист: что сделать в первую очередь",
              },
              {
                icon: FlaskConical,
                title: "Доп. анализы",
                desc: "Какие исследования стоит пройти для полной картины",
              },
              {
                icon: MessageCircleQuestion,
                title: "Вопросы врачу",
                desc: "Готовый список вопросов для максимально полезного приёма",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex flex-col items-center px-6 py-6 text-center ${
                  i < 3 ? "border-b border-border lg:border-b-0 lg:border-r" : ""
                } ${i < 2 ? "sm:border-r sm:border-b-0" : ""} ${i === 2 ? "sm:border-r-0 sm:border-b lg:border-r lg:border-b-0" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits: full-width large icons ── */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Понятный язык",
                desc: "Никакого медицинского жаргона. Объясняем каждый показатель простыми словами с примерами.",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Сформируем список конкретных вопросов, чтобы приём был максимально полезным.",
              },
              {
                icon: Zap,
                title: "30 секунд",
                desc: "Загрузите файл и через полминуты получите полную расшифровку с рекомендациями.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats: minimal line with dots ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-y-4 text-center">
            <div className="px-6">
              <p className="text-2xl font-extrabold text-foreground sm:text-3xl">10 000+</p>
              <p className="mt-1 text-xs text-muted-foreground">расшифровок</p>
            </div>
            <span className="hidden text-2xl text-border sm:inline">&middot;</span>
            <div className="px-6">
              <p className="text-2xl font-extrabold text-foreground sm:text-3xl">99%</p>
              <p className="mt-1 text-xs text-muted-foreground">точность</p>
            </div>
            <span className="hidden text-2xl text-border sm:inline">&middot;</span>
            <div className="px-6">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-extrabold text-foreground sm:text-3xl">4.8</p>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">средняя оценка</p>
            </div>
            <span className="hidden text-2xl text-border sm:inline">&middot;</span>
            <div className="px-6">
              <p className="text-2xl font-extrabold text-foreground sm:text-3xl">199 ₽</p>
              <p className="mt-1 text-xs text-muted-foreground">полный отчёт</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lab logos ── */}
      <section className="border-y border-border py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Поддерживаем анализы из любых лабораторий
          </p>
          <div className="mt-6 flex items-center justify-center gap-10">
            <Image src="/labs/invitro.png" alt="Инвитро" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
            <Image src="/labs/gemotest.png" alt="Гемотест" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
            <Image src="/labs/kdl.jpeg" alt="KDL" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
          </div>
        </div>
      </section>

      {/* ── FAQ: two columns ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Вопросы и ответы
          </h2>
          <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
            <div>
              <FaqItem
                q="Какие анализы можно загрузить?"
                a="Любые лабораторные анализы: общий и биохимический анализ крови, гормоны, витамины, ИППП, мочу, копрограмму и другие. Поддерживаем PDF, JPG, PNG, HEIC до 20 МБ."
              />
              <FaqItem
                q="Это заменяет врача?"
                a="Нет. Сервис носит информационный характер. Мы помогаем понять результаты и подготовить вопросы для врача, но не ставим диагнозы и не назначаем лечение."
              />
            </div>
            <div>
              <FaqItem
                q="Сколько стоит расшифровка?"
                a="Предварительный результат с 2 показателями — бесплатно. Полный отчёт со всеми показателями, рекомендациями и PDF — 199 рублей."
              />
              <FaqItem
                q="Как быстро будет результат?"
                a="Предварительный анализ — около 30 секунд. Полный отчёт — в течение минуты после оплаты. PDF придёт на email."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-border bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Расшифруйте свои анализы прямо сейчас
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Первые 2 показателя — бесплатно. Полный отчёт — 199 ₽.
          </p>
          <a
            href="/"
            className="cta-glow mt-8 inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground"
          >
            <Upload className="h-5 w-5" />
            Загрузить анализы — бесплатно
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Upload,
  Zap,
  Brain,
  ShieldCheck,
  Star,
  ChevronDown,
  Sparkles,
  Apple,
  ListChecks,
  FlaskConical,
  Stethoscope,
  MessageCircleQuestion,
  Clock,
  FileText,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"

/* ────────────── mock indicator cards ────────────── */

function IndicatorCardPreview({
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
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{shortName}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-card-foreground">{name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isNormal ? "bg-success text-success-foreground" : "bg-destructive text-white"
          }`}
        >
          {isNormal ? "Норма" : "Ниже нормы"}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${isNormal ? "text-success" : "text-destructive"}`}>{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-3">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
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

export default function Variant9Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Social proof bar ── */}
      <div className="border-b border-border bg-muted/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5">
          <span className="text-xs font-semibold text-primary">10 000+ расшифровок</span>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-5">
            <Image src="/labs/invitro.png" alt="Инвитро" width={72} height={24} className="h-5 w-auto opacity-60 grayscale" />
            <Image src="/labs/gemotest.png" alt="Гемотест" width={72} height={24} className="h-5 w-auto opacity-60 grayscale" />
            <Image src="/labs/kdl.jpeg" alt="KDL" width={72} height={24} className="h-5 w-auto opacity-60 grayscale" />
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">4.8</span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden pb-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-widest text-primary">
            ИИ-расшифровка анализов
          </p>
          <h1 className="animate-fade-up delay-100 mt-4 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Узнайте, что означают{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #00b4bc 0%, #0891b2 50%, #06b6d4 100%)",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 4s ease infinite",
              }}
            >
              ваши анализы
            </span>
          </h1>
          <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Загрузите PDF или фото анализа и получите понятную расшифровку
            с рекомендациями за 30 секунд. Без записи к врачу.
          </p>

          {/* ── Shimmer CTA ── */}
          <div className="animate-fade-up delay-300 mt-8 flex justify-center">
            <div className="relative rounded-2xl p-[2px]" style={{ background: "linear-gradient(135deg, #00b4bc, #0891b2, #06b6d4, #00b4bc)", backgroundSize: "300% 300%", animation: "shimmer-border 3s linear infinite" }}>
              <a
                href="/"
                className="relative flex items-center gap-2.5 rounded-[14px] bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Upload className="h-5 w-5" />
                Загрузить анализы — бесплатно
              </a>
            </div>
          </div>
          <p className="animate-fade-up delay-400 mt-3 text-xs text-muted-foreground">
            PDF, JPG, PNG, HEIC  --  до 20 МБ
          </p>
        </div>

        {/* gradient shimmer keyframes */}
        <style jsx>{`
          @keyframes shimmer-border {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </section>

      {/* ── Preview: browser mockup ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Так выглядит ваш результат
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-center text-sm text-muted-foreground">
            Каждый показатель с понятной шкалой и статусом
          </p>

          {/* browser chrome */}
          <div className="animate-fade-up delay-200 relative mx-auto mt-10 max-w-2xl">
            {/* floating badges */}
            <div className="absolute -left-3 top-12 z-10 hidden animate-fade-up rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm sm:block delay-400">
              <Sparkles className="mr-1 inline h-3 w-3" />
              ИИ-анализ
            </div>
            <div className="absolute -right-2 top-24 z-10 hidden animate-fade-up rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm sm:block delay-500">
              <Clock className="mr-1 inline h-3 w-3" />
              30 сек
            </div>
            <div className="absolute -right-3 bottom-16 z-10 hidden animate-fade-up rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm sm:block delay-600">
              199 ₽
            </div>

            {/* window frame */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {/* title bar */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-400/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <span className="h-3 w-3 rounded-full bg-green-400/60" />
                <span className="ml-3 flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                  moyanaliz.ru/result
                </span>
              </div>
              {/* content */}
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <IndicatorCardPreview
                  name="Альбумин"
                  shortName="ALB"
                  value={50}
                  unit="г/л"
                  status="normal"
                  refMin={35}
                  refMax={52}
                />
                <IndicatorCardPreview
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
          </div>
        </div>
      </section>

      {/* ── Teaser blocks ── */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Что входит в отчёт
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Продукты и нутриенты, которые помогут привести показатели в норму.",
              },
              {
                icon: ListChecks,
                title: "План действий",
                desc: "Пошаговый чек-лист: что сделать в первую очередь и на что обратить внимание.",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные анализы",
                desc: "Какие ещё исследования стоит пройти для полной картины.",
              },
              {
                icon: MessageCircleQuestion,
                title: "Вопросы для врача",
                desc: "Готовый список вопросов, чтобы получить максимум от приёма.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`animate-fade-up card-elevated flex gap-4 rounded-xl bg-card p-5 ${
                  i === 0 ? "" : i === 1 ? "delay-100" : i === 2 ? "delay-200" : "delay-300"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits: alternating rows ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Почему Мой Анализ
          </h2>
          <div className="mt-10 space-y-0">
            {[
              {
                icon: Brain,
                title: "Понятный язык",
                desc: "Никакого медицинского жаргона. Объясняем каждый показатель простыми словами.",
                alt: false,
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Подготовим список вопросов, чтобы приём у врача был максимально полезным.",
                alt: true,
              },
              {
                icon: Zap,
                title: "Результат за 30 секунд",
                desc: "Загрузите файл — и через полминуты получите полную расшифровку.",
                alt: false,
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`animate-fade-up flex items-center gap-5 rounded-xl px-6 py-5 ${
                  item.alt ? "bg-muted/50" : ""
                } ${i === 0 ? "" : i === 1 ? "delay-100" : "delay-200"}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-primary">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4 py-10 text-center text-primary-foreground">
          {[
            { val: "10 000+", label: "Анализов расшифровано" },
            { val: "99%", label: "Точность" },
            { val: "4.8", label: "Средняя оценка" },
            { val: "30 сек", label: "Время расшифровки" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold">{s.val}</p>
              <p className="mt-1 text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials / trust ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Нам доверяют
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                text: "Наконец-то понятная расшифровка! Раньше гуглил каждый показатель по отдельности.",
                name: "Алексей М.",
                role: "Москва",
              },
              {
                text: "Очень удобно перед приёмом у врача — уже знаешь, какие вопросы задать.",
                name: "Мария К.",
                role: "Санкт-Петербург",
              },
              {
                text: "Загрузила анализ ребёнка, всё разложили по полочкам. Рекомендую!",
                name: "Ольга В.",
                role: "Новосибирск",
              },
            ].map((t) => (
              <div key={t.name} className="card-elevated rounded-xl bg-card p-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lab logos ── */}
      <section className="border-y border-border bg-muted/40 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Работаем с анализами из любых лабораторий
          </p>
          <div className="mt-6 flex items-center justify-center gap-10">
            <Image src="/labs/invitro.png" alt="Инвитро" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
            <Image src="/labs/gemotest.png" alt="Гемотест" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
            <Image src="/labs/kdl.jpeg" alt="KDL" width={100} height={32} className="h-7 w-auto opacity-50 grayscale transition-opacity hover:opacity-80" />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl">
            Частые вопросы
          </h2>
          <div className="mt-10">
            <FaqItem
              q="Какие анализы можно загрузить?"
              a="Любые лабораторные анализы: общий и биохимический анализ крови, гормоны, витамины, ИППП, мочу, копрограмму и другие. Поддерживаем PDF, JPG, PNG, HEIC до 20 МБ."
            />
            <FaqItem
              q="Это заменяет консультацию врача?"
              a="Нет. Сервис носит исключительно информационный характер. Мы помогаем понять результаты и подготовить вопросы для врача, но не ставим диагнозы и не назначаем лечение."
            />
            <FaqItem
              q="Сколько стоит расшифровка?"
              a="Предварительный результат с 2 показателями — бесплатно. Полный отчёт со всеми показателями, рекомендациями, планом действий и PDF — 199 рублей."
            />
            <FaqItem
              q="Как быстро я получу результат?"
              a="Предварительный анализ готов сразу после загрузки (около 30 секунд). Полный отчёт — в течение минуты после оплаты."
            />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Готовы расшифровать анализы?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Загрузите файл и получите первые результаты бесплатно
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/"
              className="cta-glow inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground"
            >
              <FileText className="h-5 w-5" />
              Загрузить анализы — бесплатно
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

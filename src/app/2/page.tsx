"use client";

import {
  Upload,
  FileText,
  Shield,
  Clock,
  MessageCircleQuestion,
  Stethoscope,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  Target,
  Apple,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/* ── FAQ Data ── */
const faqItems = [
  {
    q: "Какие форматы файлов поддерживаются?",
    a: "Вы можете загрузить результаты в формате PDF, JPEG, PNG, WebP или HEIC. Максимальный размер файла — 20 МБ. Подойдёт как скан из лаборатории, так и фотография бланка.",
  },
  {
    q: "Это заменяет визит к врачу?",
    a: "Нет. Наш сервис помогает понять результаты анализов простым языком и подготовиться к визиту к врачу. Мы формируем список вопросов для специалиста. Окончательный диагноз ставит только врач.",
  },
  {
    q: "Сколько времени занимает расшифровка?",
    a: "Предварительный просмотр двух показателей вы получите сразу после загрузки — менее чем за 30 секунд. Полный отчёт с детальными рекомендациями формируется в течение минуты после оплаты.",
  },
  {
    q: "Какие лаборатории поддерживаются?",
    a: "Мы поддерживаем результаты из всех российских лабораторий: Инвитро, Гемотест, KDL, Хеликс, CMD и других. Система автоматически распознаёт формат бланка.",
  },
  {
    q: "Как обеспечивается безопасность данных?",
    a: "Файлы передаются по зашифрованному каналу и хранятся в защищённом облачном хранилище. Мы не передаём данные третьим лицам и не используем их для других целей.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">
          {a}
        </p>
      )}
    </div>
  );
}

/* ── Teaser cards data ── */
const teaserCards = [
  {
    icon: Apple,
    title: "Питание",
    desc: "Персональные рекомендации по продуктам для нормализации показателей",
    color: "bg-green-500",
  },
  {
    icon: ClipboardList,
    title: "План действий",
    desc: "Пошаговая инструкция: что делать, какой образ жизни вести, когда пересдать",
    color: "bg-blue-500",
  },
  {
    icon: FlaskConical,
    title: "Доп. анализы",
    desc: "Какие исследования сдать дополнительно для полной клинической картины",
    color: "bg-purple-500",
  },
  {
    icon: MessageCircleQuestion,
    title: "Вопросы врачу",
    desc: "Готовый список вопросов для приёма у терапевта или профильного специалиста",
    color: "bg-primary",
  },
];

/* ── Main Page ── */
export default function Variant2Page() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ═══ HERO — Full-width Gradient ═══ */}
      <section
        className="relative overflow-hidden pb-32 pt-16 md:pb-40 md:pt-24"
        style={{
          background:
            "linear-gradient(135deg, #00838f 0%, #00b4bc 30%, #006064 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-white/3" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              Расшифровка анализов с помощью ИИ
            </span>
          </div>
          <h1 className="animate-fade-up delay-100 mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Узнайте, что означают ваши анализы
          </h1>
          <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Загрузите PDF или фото из любой лаборатории — получите понятную
            расшифровку каждого показателя с рекомендациями по питанию, образу
            жизни и вопросами для врача.
          </p>

          {/* Lab support line */}
          <div className="animate-fade-up delay-300 mt-6 flex items-center justify-center gap-4">
            <span className="text-sm text-white/60">
              Инвитро &middot; Гемотест &middot; KDL &middot; и другие
              лаборатории
            </span>
          </div>
        </div>

        {/* Bottom wave shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z"
              fill="var(--background)"
            />
          </svg>
        </div>
      </section>

      {/* ═══ Floating Upload Card ═══ */}
      <section className="relative z-10 -mt-24 px-4 md:-mt-28">
        <div className="animate-fade-up delay-300 mx-auto max-w-lg">
          <div className="card-elevated rounded-2xl bg-card p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Загрузите ваш анализ
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, JPEG, PNG, WebP или HEIC — до 20 МБ
              </p>
              <div className="mt-5 w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-8 transition-colors hover:border-primary/50">
                <FileText className="mx-auto h-7 w-7 text-primary/60" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Перетащите файл или нажмите кнопку ниже
                </p>
              </div>
              <a
                href="/"
                className="cta-glow animate-subtle-pulse mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground"
              >
                <Upload className="h-5 w-5" />
                Загрузить анализы — бесплатно
              </a>
              <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Данные зашифрованы и автоматически удаляются
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Preview Section — Left Border Cards ═══ */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="animate-fade-up text-2xl font-bold text-foreground md:text-3xl">
              Мгновенный предпросмотр — бесплатно
            </h2>
            <p className="animate-fade-up delay-100 mt-3 text-muted-foreground">
              Сразу после загрузки вы увидите два показателя с пояснениями
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Albumin — Normal, left green border */}
            <div className="animate-fade-up delay-200 card-elevated overflow-hidden rounded-2xl bg-card">
              <div className="flex">
                <div className="w-1.5 shrink-0 bg-success" />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Биохимия крови
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        Альбумин
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Норма
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-success">
                      42.5
                    </span>
                    <span className="text-sm text-muted-foreground">г/л</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Реф: 35–50 г/л
                    </span>
                  </div>

                  {/* Range bar */}
                  <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 rounded-full bg-success/20"
                      style={{ left: "0%", width: "100%" }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-success shadow-md"
                      style={{
                        left: `${((42.5 - 35) / (50 - 35)) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Альбумин — главный белок крови, отвечает за перенос
                    питательных веществ и поддержание давления. Уровень в
                    норме. Поддерживайте рацион с достаточным количеством белка:
                    яйца, рыба, творог.
                  </p>
                </div>
              </div>
            </div>

            {/* Vitamin D — Below Normal, left orange border */}
            <div className="animate-fade-up delay-300 card-elevated overflow-hidden rounded-2xl bg-card">
              <div className="flex">
                <div className="w-1.5 shrink-0 bg-warning" />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Витамины
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        Витамин D (25-OH)
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Ниже нормы
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-warning">
                      18.3
                    </span>
                    <span className="text-sm text-muted-foreground">
                      нг/мл
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Реф: 30–100 нг/мл
                    </span>
                  </div>

                  <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 rounded-full bg-success/20"
                      style={{ left: "30%", width: "70%" }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-warning shadow-md"
                      style={{ left: `${(18.3 / 100) * 100}%` }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Витамин D ниже оптимального уровня (дефицит). Рекомендуется
                    увеличить потребление жирной рыбы, яичных желтков. Прогулки
                    на солнце 15–20 минут в день. Обсудите приём добавок с
                    врачом.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Teaser Blocks — Horizontal Scrollable ═══ */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Полный отчёт — 199 ₽
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-center text-muted-foreground">
            Детальная расшифровка каждого показателя и персональные рекомендации
          </p>

          {/* Scrollable row on mobile, grid on desktop */}
          <div
            ref={scrollContainerRef}
            className="mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
          >
            {teaserCards.map((card) => (
              <div
                key={card.title}
                className="min-w-[220px] shrink-0 snap-start rounded-2xl bg-card p-5 card-elevated md:min-w-0"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Benefits ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Почему выбирают нас
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Простым языком",
                desc: "Никаких латинских терминов и непонятных сокращений. Каждый показатель объяснён так, чтобы было понятно любому человеку.",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Мы готовим персональный список вопросов для вашего визита к специалисту. Вы приходите на приём подготовленными.",
              },
              {
                icon: Clock,
                title: "30 секунд",
                desc: "Мгновенный предпросмотр сразу после загрузки. Полный отчёт с PDF и email — менее чем за минуту.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="animate-fade-up text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
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

      {/* ═══ Trust Stats — Circles ═══ */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center justify-center gap-10 md:flex-row md:gap-16">
            {[
              {
                value: "10 000+",
                label: "расшифровок",
                icon: Users,
              },
              {
                value: "99%",
                label: "точность",
                icon: Target,
              },
              {
                value: "4.8",
                label: "оценка",
                icon: Star,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="animate-fade-up flex flex-col items-center"
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="mt-1 text-xl font-extrabold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Lab Logos ═══ */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Работаем с результатами из любых лабораторий
          </p>
          <div className="mt-5 flex items-center justify-center gap-10">
            <img
              src="/labs/invitro.png"
              alt="Инвитро"
              className="h-8 object-contain opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
            <img
              src="/labs/gemotest.png"
              alt="Гемотест"
              className="h-8 object-contain opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
            <img
              src="/labs/kdl.jpeg"
              alt="KDL"
              className="h-8 object-contain opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Вопросы и ответы
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-center text-muted-foreground">
            Всё, что нужно знать о сервисе
          </p>
          <div className="mt-10 card-elevated rounded-2xl bg-card px-6">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          background:
            "linear-gradient(135deg, #00838f 0%, #00b4bc 50%, #006064 100%)",
        }}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Расшифруйте анализы за 30 секунд
          </h2>
          <p className="mt-3 text-white/80">
            Предпросмотр двух показателей — бесплатно. Полный отчёт — 199 ₽.
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#00838f] shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Загрузить анализы — бесплатно
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

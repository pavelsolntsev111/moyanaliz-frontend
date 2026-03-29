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
} from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/* ── FAQ Data ── */
const faqItems = [
  {
    q: "Какие анализы можно расшифровать?",
    a: "Общий и биохимический анализ крови, анализ мочи, копрограмму, гормоны щитовидной железы, глюкозу и HbA1c, железо и ферритин, витамин D, ПЦР-исследования на ИППП, ВИЧ, сифилис, гепатиты и другие лабораторные исследования.",
  },
  {
    q: "Насколько точна расшифровка?",
    a: "Мы используем передовую модель Claude от Anthropic, обученную на медицинских данных. Точность интерпретации составляет 99%. Однако сервис не заменяет консультацию врача — мы помогаем вам лучше понять свои результаты.",
  },
  {
    q: "Как загрузить результаты анализов?",
    a: "Просто сфотографируйте бланк анализа или загрузите PDF-файл, полученный из лаборатории. Мы поддерживаем форматы PDF, JPEG, PNG, WebP и HEIC размером до 20 МБ.",
  },
  {
    q: "Сколько стоит полная расшифровка?",
    a: "Предварительный просмотр двух показателей — бесплатно. Полная расшифровка всех показателей с рекомендациями, вопросами для врача и PDF-отчётом стоит 199 ₽.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Файлы хранятся в зашифрованном виде и автоматически удаляются. Мы не передаём ваши данные третьим лицам. Подробнее — в политике конфиденциальности.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
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

/* ── Main Page ── */
export default function Variant1Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ═══ HERO — Split Two-Column ═══ */}
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          {/* Left: Copy */}
          <div className="animate-fade-up">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Узнайте, что означают{" "}
              <span className="text-primary">ваши анализы</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Загрузите результаты из любой лаборатории — и получите понятную
              расшифровку с рекомендациями по питанию, активности и вопросами для
              врача. За 30 секунд.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/"
                className="cta-glow inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Upload className="h-5 w-5" />
                Загрузить анализы — бесплатно
              </a>
              <span className="text-sm text-muted-foreground">
                PDF, фото или скан
              </span>
            </div>
            {/* Lab logos */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Поддерживаем:
              </span>
              <div className="flex items-center gap-4">
                <img
                  src="/labs/invitro.png"
                  alt="Инвитро"
                  className="h-5 object-contain opacity-60"
                />
                <img
                  src="/labs/gemotest.png"
                  alt="Гемотест"
                  className="h-5 object-contain opacity-60"
                />
                <img
                  src="/labs/kdl.jpeg"
                  alt="KDL"
                  className="h-5 object-contain opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Right: Upload Card */}
          <div className="animate-fade-up delay-200">
            <div className="card-elevated rounded-2xl bg-card p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  Загрузите анализ
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  PDF, JPEG, PNG, WebP или HEIC — до 20 МБ
                </p>
                <div className="mt-6 w-full rounded-xl border-2 border-dashed border-border bg-muted/50 px-6 py-10 transition-colors hover:border-primary/40">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Перетащите файл сюда
                  </p>
                </div>
                <a
                  href="/"
                  className="cta-glow mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Выбрать файл
                </a>
                <p className="mt-4 text-xs text-muted-foreground">
                  <Shield className="mr-1 inline h-3.5 w-3.5" />
                  Данные зашифрованы и защищены
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Preview Indicator Cards — 2 columns ═══ */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="animate-fade-up text-2xl font-bold text-foreground md:text-3xl">
              Мгновенный предварительный просмотр
            </h2>
            <p className="animate-fade-up delay-100 mt-3 text-muted-foreground">
              Два показателя — бесплатно, сразу после загрузки
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Albumin — Normal */}
            <div className="animate-fade-up delay-200 card-elevated rounded-2xl bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Альбумин
                  </p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    42.5{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      г/л
                    </span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Норма
                </span>
              </div>
              {/* Range bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>35</span>
                  <span>Референс: 35–50 г/л</span>
                  <span>50</span>
                </div>
                <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-success/30"
                    style={{ width: "100%" }}
                  />
                  <div
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-success shadow"
                    style={{ left: `${((42.5 - 35) / (50 - 35)) * 100}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Альбумин — основной белок крови, отвечающий за транспорт
                питательных веществ. Ваш уровень в пределах нормы. Для
                поддержания: яйца, рыба, творог, бобовые.
              </p>
            </div>

            {/* Vitamin D — Below normal */}
            <div className="animate-fade-up delay-300 card-elevated rounded-2xl bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Витамин D (25-OH)
                  </p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    18.3{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      нг/мл
                    </span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Ниже нормы
                </span>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Референс: 30–100 нг/мл</span>
                  <span>100</span>
                </div>
                <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 rounded-full bg-warning/30"
                    style={{ left: "30%", width: "70%" }}
                  />
                  <div
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-warning shadow"
                    style={{ left: `${(18.3 / 100) * 100}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Витамин D ниже оптимального уровня. Рекомендуется: жирная рыба
                (лосось, скумбрия), яичные желтки, прогулки на солнце 15–20 мин
                в день. Обсудите приём добавок с врачом.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Загрузить свои анализы и получить предпросмотр
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Teaser Blocks ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Что входит в полный отчёт
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-center text-muted-foreground">
            Всего за 199 ₽ вы получите
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Apple,
                title: "Рекомендации по питанию",
                desc: "Какие продукты помогут нормализовать показатели и поддержать здоровье",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                icon: ClipboardList,
                title: "План действий",
                desc: "Конкретные шаги: образ жизни, активность, контроль и сроки повторных анализов",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: FlaskConical,
                title: "Дополнительные исследования",
                desc: "Какие анализы стоит сдать дополнительно для полной картины",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: MessageCircleQuestion,
                title: "Вопросы для врача",
                desc: "Готовый список вопросов, которые стоит задать на приёме у специалиста",
                color: "text-primary",
                bg: "bg-primary/5",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="animate-fade-up card-elevated rounded-2xl bg-card p-6"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
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

      {/* ═══ Benefits — Horizontal Rows ═══ */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Почему нам доверяют
          </h2>

          <div className="mt-10 space-y-6">
            {[
              {
                icon: FileText,
                title: "Понятный язык",
                desc: "Никаких сложных медицинских терминов. Мы объясняем каждый показатель простыми словами — что он значит, зачем нужен и что делать.",
              },
              {
                icon: Stethoscope,
                title: "Вопросы для врача",
                desc: "Мы готовим список вопросов, которые вы можете задать своему врачу. Приходите на приём подготовленными.",
              },
              {
                icon: Clock,
                title: "Результат за 30 секунд",
                desc: "Загрузите файл — и получите предварительный результат мгновенно. Полный отчёт с рекомендациями готов менее чем за минуту.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="animate-fade-up flex items-start gap-5 rounded-2xl bg-card p-6 card-elevated"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Trust Stats — Horizontal Bar ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="animate-fade-up card-elevated flex flex-col items-center justify-around gap-8 rounded-2xl bg-card px-6 py-10 md:flex-row md:gap-0">
            <div className="flex items-center gap-3 text-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">10 000+</p>
                <p className="text-sm text-muted-foreground">
                  расшифровок выполнено
                </p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex items-center gap-3 text-center">
              <Target className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">99%</p>
                <p className="text-sm text-muted-foreground">
                  точность интерпретации
                </p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex items-center gap-3 text-center">
              <Star className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground">
                  средняя оценка пользователей
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Lab Logos ═══ */}
      <section className="py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Поддерживаем анализы из ведущих лабораторий
          </p>
          <div className="mt-5 flex items-center justify-center gap-10">
            <img
              src="/labs/invitro.png"
              alt="Инвитро"
              className="h-8 object-contain opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
            <img
              src="/labs/gemotest.png"
              alt="Гемотест"
              className="h-8 object-contain opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
            <img
              src="/labs/kdl.jpeg"
              alt="KDL"
              className="h-8 object-contain opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground md:text-3xl">
            Частые вопросы
          </h2>
          <div className="mt-10 card-elevated rounded-2xl bg-card px-6">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Activity className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
            Расшифруйте свои анализы прямо сейчас
          </h2>
          <p className="mt-3 text-muted-foreground">
            Предпросмотр — бесплатно. Полный отчёт с рекомендациями — 199 ₽.
          </p>
          <a
            href="/"
            className="animate-subtle-pulse cta-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground"
          >
            <Upload className="h-5 w-5" />
            Загрузить анализы — бесплатно
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

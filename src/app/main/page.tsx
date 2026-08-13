import Link from "next/link";
import {
  FileSearch,
  BookOpen,
  Calculator,
  HeartPulse,
  ArrowRight,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { articles } from "@/lib/blog-data";
import { indicators } from "@/lib/indicators-data";
import { calculators } from "@/lib/calculators-data";
import { rubricCounts, rubricForCategory } from "@/lib/rubrics-data";
import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/safe-html";

/**
 * Разводящая страница портала.
 *
 * ⚠️ Дропзоны здесь НЕТ намеренно: загрузка живёт только на «/» — это рекламная посадочная,
 * на неё настроены кампании и цели Метрики (file_selected / file_uploaded / click_pay).
 * Вторая точка загрузки размывала бы атрибуцию и A/B-бакеты. Отсюда — только ссылка на «/».
 */

export const metadata: Metadata = {
  title: "Мой Анализ — портал о здоровье и лабораторных анализах",
  description:
    "Разбор медицинских анализов с помощью ИИ, справочник показателей, медицинские калькуляторы и статьи о здоровье простым языком.",
  alternates: { canonical: "/main" },
  openGraph: {
    title: "Мой Анализ — портал о здоровье и лабораторных анализах",
    description:
      "Разбор медицинских анализов с помощью ИИ, справочник показателей, медицинские калькуляторы и статьи о здоровье простым языком.",
    url: "https://moyanaliz.ru/main",
    type: "website",
  },
};

/** Самые спрашиваемые показатели — вход в справочник с конкретики, а не со списка. */
const POPULAR_INDICATORS = [
  "gemoglobin",
  "ferritin",
  "holesterin-obschij",
  "glyukoza",
  "tireotropnyj-gormon",
  "vitamin-d",
  "soe",
  "kreatinin",
];

const POPULAR_CALCULATORS = ["skf-ckd-epi", "homa-ir", "imt-kalkulyator", "lpnp-fridvald"];

const SECTIONS = [
  {
    href: "/",
    icon: FileSearch,
    title: "Расшифровка анализов",
    text: "Загрузите PDF или фото бланка — ИИ объяснит каждый показатель с учётом пола и возраста и покажет, что выходит за норму.",
    cta: "Разобрать свой анализ",
  },
  {
    href: "/indicators",
    icon: BookOpen,
    title: "Справочник показателей",
    text: "Что означает каждый показатель, нормы для взрослых, причины отклонений вверх и вниз и что делать дальше.",
    cta: "Открыть справочник",
  },
  {
    href: "/kalkulyator",
    icon: Calculator,
    title: "Калькуляторы",
    text: "СКФ, HOMA-IR, ЛПНП, ИМТ и другие расчёты по формулам, которые используют врачи. Бесплатно и без регистрации.",
    cta: "Посчитать",
  },
  {
    href: "/blog",
    icon: HeartPulse,
    title: "Здоровье",
    text: "Статьи о показателях, подготовке к сдаче, чек-апах и профилактике — простым языком, с опорой на доказательную медицину.",
    cta: "Читать статьи",
  },
];

export default function MainPage() {
  const popularIndicators = POPULAR_INDICATORS.map((s) =>
    indicators.find((i) => i.slug === s),
  ).filter((i): i is NonNullable<typeof i> => Boolean(i));

  const popularCalculators = POPULAR_CALCULATORS.map((s) =>
    calculators.find((c) => c.slug === s),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const latest = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const rubrics = rubricCounts();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Мой Анализ",
      url: "https://moyanaliz.ru",
      inLanguage: "ru-RU",
      description:
        "Портал о здоровье и лабораторных анализах: разбор бланков с помощью ИИ, справочник показателей, медицинские калькуляторы и статьи.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Портал", item: "https://moyanaliz.ru/main" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <main className="flex-1">
        {/* Введение: зачем портал */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Понятно о лабораторных анализах и здоровье
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Результат анализа — это таблица цифр, в которой непонятно главное: всё ли в
              порядке и что делать дальше. Мы объясняем медицинские показатели человеческим
              языком: разбираем ваш бланк целиком, ведём справочник по каждому показателю,
              считаем врачебные формулы и пишем о здоровье без запугивания и без обещаний
              чудес.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Материалы носят справочный характер и не заменяют консультацию врача — они
              нужны, чтобы прийти к нему с понятными вопросами.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Разобрать свой анализ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/indicators"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Справочник показателей
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{indicators.length}</span>{" "}
                показателей в справочнике
              </span>
              <span>
                <span className="font-semibold text-foreground">{calculators.length}</span>{" "}
                калькуляторов
              </span>
              <span>
                <span className="font-semibold text-foreground">{articles.length}</span> статей
                о здоровье
              </span>
            </div>
          </div>
        </section>

        {/* Разделы портала */}
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-xl font-semibold text-foreground">Разделы</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {s.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Частые показатели */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">Спрашивают чаще всего</h2>
              <Link href="/indicators" className="shrink-0 text-sm text-primary hover:underline">
                Все показатели
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {popularIndicators.map((i) => (
                <Link
                  key={i.slug}
                  href={`/indicators/${i.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">
                    {i.name}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Калькуляторы */}
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Посчитать самому</h2>
            <Link href="/kalkulyator" className="shrink-0 text-sm text-primary hover:underline">
              Все калькуляторы
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularCalculators.map((c) => (
              <Link
                key={c.slug}
                href={`/kalkulyator/${c.slug}`}
                className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-card-foreground group-hover:text-primary">
                  {c.short}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {c.metaDescription}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Здоровье: рубрики + свежее */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">Здоровье</h2>
              <Link href="/blog" className="shrink-0 text-sm text-primary hover:underline">
                Все статьи
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {rubrics.map(({ rubric, count }) => (
                <Link
                  key={rubric.slug}
                  href={`/blog/rubrika/${rubric.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {rubric.title}
                  <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a) => (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 text-xs font-medium text-primary">
                    {rubricForCategory(a.category).title}
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
                    {a.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {a.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(a.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Продукт: что такое расшифровка */}
        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold text-card-foreground">
              Если бланк уже на руках
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Справочник объясняет показатели по отдельности, но в реальном бланке они связаны:
              низкий гемоглобин читается иначе при низком ферритине, чем при нормальном. Разбор
              смотрит на документ целиком — определяет пол и возраст из шапки бланка, сверяет
              каждое значение с подходящей нормой, отмечает отклонения и объясняет, какие из них
              требуют внимания, а какие — вариант нормы.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Подходят PDF и фото: общий анализ крови, биохимия, гормоны, липидный профиль и
              другие. Регистрация не нужна, результат приходит сразу и дублируется на почту.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Загрузить анализ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

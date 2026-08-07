import Link from "next/link";
import { ArrowUpRight, Calculator as CalcIcon, ShieldCheck, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { calculators, calculatorsByGroup } from "@/lib/calculators-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Медицинские калькуляторы по анализам — Мой Анализ",
  description:
    "Бесплатные калькуляторы по результатам анализов: СКФ, HOMA-IR, ЛПНП по Фридвальду, коэффициент атерогенности, де Ритиса, FIB-4, насыщение трансферрина и другие. Расчёт в браузере.",
  keywords: [
    "медицинские калькуляторы",
    "калькулятор скф",
    "калькулятор homa-ir",
    "калькулятор лпнп",
    "калькулятор по анализам",
    "рассчитать показатель анализа",
  ].join(", "),
  alternates: { canonical: "/kalkulyator" },
  openGraph: {
    title: "Медицинские калькуляторы по анализам — Мой Анализ",
    description:
      "Считайте СКФ, HOMA-IR, ЛПНП, индекс атерогенности и другие показатели прямо по цифрам из своего бланка.",
    url: "https://moyanaliz.ru/kalkulyator",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Калькуляторы бесплатные?",
    a: "Да, все расчёты бесплатны и работают без регистрации. Платная у нас только полная расшифровка загруженного бланка — когда нужно объяснение всех показателей сразу, а не одно число.",
  },
  {
    q: "Куда попадают введённые цифры?",
    a: "Никуда. Расчёт выполняется прямо в браузере на вашем устройстве: значения не отправляются на сервер и нигде не сохраняются.",
  },
  {
    q: "Можно ли поставить диагноз по калькулятору?",
    a: "Нет. Формулы дают ориентир и помогают понять, о чём говорит цифра из бланка. Диагноз ставит врач, который видит вас, ваши жалобы и всю картину анализов целиком.",
  },
  {
    q: "Почему мой результат не совпадает с расчётом в лаборатории?",
    a: "Лаборатории используют разные формулы и единицы измерения — например, для СКФ существуют CKD-EPI разных редакций и формула Кокрофта-Голта. Ориентируйтесь на референсные значения из своего бланка и уточняйте методику у врача.",
  },
];

export default function CalculatorsHub() {
  const groups = calculatorsByGroup();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Медицинские калькуляторы по анализам",
      description:
        "Калькуляторы для расчёта показателей по результатам лабораторных анализов: почки, печень, липиды, обмен веществ, кровь, железо.",
      url: "https://moyanaliz.ru/kalkulyator",
      inLanguage: "ru-RU",
      hasPart: calculators.map((c) => ({
        "@type": "WebApplication",
        name: c.h1,
        url: `https://moyanaliz.ru/kalkulyator/${c.slug}`,
        applicationCategory: "HealthApplication",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Калькуляторы", item: "https://moyanaliz.ru/kalkulyator" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-transparent py-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <CalcIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Медицинские калькуляторы по анализам
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Возьмите цифры из своего бланка и посчитайте показатели, которых в нём нет: СКФ,
              индекс HOMA-IR, ЛПНП по Фридвальду, коэффициент де Ритиса и другие. Бесплатно и без
              регистрации.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Расчёт в браузере, данные никуда не уходят
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                {calculators.length} калькуляторов
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-10">
          {groups.map(({ group, items }) => (
            <section key={group} className="mb-10">
              <h2 className="text-lg font-semibold text-foreground">{group}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/kalkulyator/${c.slug}`}
                    className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-lg hover:shadow-black/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">{c.short}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {c.lead}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-6 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Нужно разобрать весь анализ, а не один показатель?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Загрузите PDF или фото бланка — ИИ объяснит каждый показатель с учётом пола и возраста
              и пришлёт отчёт на почту.
            </p>
            <Link
              href="/?ref=calc-hub"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Расшифровать анализ
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Частые вопросы</h2>
            <div className="mt-4 space-y-3">
              {FAQ.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

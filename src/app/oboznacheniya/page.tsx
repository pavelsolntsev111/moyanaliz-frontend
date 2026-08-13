import Link from "next/link";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InlineDropzone } from "@/components/inline-dropzone";
import { abbreviations, abbreviationsByGroup } from "@/lib/abbreviations-data";
import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/safe-html";

export const metadata: Metadata = {
  title: "Обозначения в анализе крови: расшифровка сокращений — Мой Анализ",
  description:
    "Что означают латинские сокращения в бланке анализа: WBC, RBC, HGB, HCT, MCV, MCH, PLT, NEU, LYM, ALT, AST, CRP и другие. Таблица с расшифровкой и переходом к разбору показателя.",
  keywords: [
    "обозначения в анализе крови",
    "расшифровка сокращений в анализе крови",
    "латинские буквы в анализе крови",
    "что означает в бланке анализа",
    "аббревиатуры анализа крови",
  ].join(", "),
  alternates: { canonical: "/oboznacheniya" },
  openGraph: {
    title: "Обозначения в анализе крови: расшифровка сокращений — Мой Анализ",
    description:
      "Таблица латинских сокращений из лабораторного бланка с расшифровкой на русском.",
    url: "https://moyanaliz.ru/oboznacheniya",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Почему в бланке латинские сокращения, а не русские названия?",
    a: "Анализаторы крови — импортное оборудование, и в печатную форму попадают заводские обозначения на английском. Часть лабораторий дублирует их русскими названиями, часть — нет. Смысл от этого не меняется: WBC и «лейкоциты» — это одна и та же строка.",
  },
  {
    q: "Что значат значки # и % рядом с сокращением?",
    a: "Решётка означает абсолютное число клеток (например, NE# — сколько нейтрофилов в литре крови), процент — их долю среди всех лейкоцитов. Это разные величины: доля может вырасти просто потому, что снизилось количество других клеток, поэтому врачи обычно смотрят на абсолютные значения.",
  },
  {
    q: "Что означают стрелки, буквы H и L, звёздочки в бланке?",
    a: "Это пометки анализатора о выходе за референсный интервал: H (high) или стрелка вверх — выше границы, L (low) или стрелка вниз — ниже. Звёздочка или выделение обычно означают заметное отклонение. Пометка говорит только о том, что число вне коридора, но не о том, насколько это значимо в вашем случае.",
  },
  {
    q: "У меня в бланке сокращение, которого нет в таблице",
    a: "Обозначения различаются между анализаторами и лабораториями, и полный список составить невозможно. Загрузите бланк — сервис распознает строки и объяснит каждый показатель, включая нестандартные обозначения.",
  },
];

export default function AbbreviationsPage() {
  const groups = abbreviationsByGroup();
  const withArticle = abbreviations.filter((a) => a.article).length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Обозначения в анализе крови",
      description: metadata.description,
      url: "https://moyanaliz.ru/oboznacheniya",
      inLanguage: "ru-RU",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Обозначения в бланке", item: "https://moyanaliz.ru/oboznacheniya" },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-transparent py-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <ListChecks className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Обозначения в анализе крови
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              В бланке стоят латинские сокращения — WBC, MCV, PLT, ALT. Здесь собрано, что каждое
              из них означает по-русски. Найдите своё сокращение в таблице и переходите к разбору
              показателя.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-10">
          {groups.map(({ group, items }) => (
            <section key={group} className="mb-10">
              <h2 className="text-lg font-semibold text-foreground">{group}</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Обозначение</th>
                      <th className="px-4 py-3 font-medium">Что это</th>
                      <th className="px-4 py-3 font-medium">Подробнее</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((a) => (
                      <tr key={a.code} className="border-b border-border/60 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <span className="font-semibold text-foreground">{a.code}</span>
                          {a.alt && (
                            <span className="block text-xs text-muted-foreground">
                              {a.alt.join(", ")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="font-medium text-foreground">{a.name}</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            {a.what}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <div className="flex flex-col gap-1">
                            {a.article && (
                              <Link
                                href={`/blog/${a.article}`}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                Разбор <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            )}
                            {a.indicator && (
                              <Link
                                href={`/indicators/${a.indicator}`}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                Показатель <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            )}
                            {!a.article && !a.indicator && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <p className="text-sm text-muted-foreground">
            В таблице {abbreviations.length} обозначений, у {withArticle} есть подробный разбор.
            Обозначения различаются между анализаторами: если вашего сокращения тут нет, его
            распознает сервис при загрузке бланка.
          </p>

          <InlineDropzone
            source="abbr-hub"
            title="Не разбираться по одной строке, а понять весь бланк"
            subtitle="Загрузите PDF или фото анализа — ИИ расшифрует все показатели сразу, с учётом пола и возраста."
          />

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

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/example"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              Пример расшифровки
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
            <Link
              href="/kalkulyator"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              Калькуляторы по анализам
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rubrics, getRubricBySlug, articlesInRubric } from "@/lib/rubrics-data";
import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/safe-html";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  // ⚠️ Пустую рубрику не генерим: новая категория заводится ЗАРАНЕЕ (чтобы агент мог её
  // проставить), и до первой статьи страница была бы пустышкой в индексе.
  // dynamicParams=false → такой URL честно отдаёт 404, пока статей нет.
  return rubrics.filter((r) => articlesInRubric(r.slug).length > 0).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getRubricBySlug(slug);
  if (!r) return {};
  const count = articlesInRubric(slug).length;
  return {
    title: `${r.title} — Здоровье | Мой Анализ`,
    description: r.description,
    alternates: { canonical: `/blog/rubrika/${r.slug}` },
    openGraph: {
      title: `${r.title} — ${count} статей | Мой Анализ`,
      description: r.description,
      url: `https://moyanaliz.ru/blog/rubrika/${r.slug}`,
      type: "website",
    },
  };
}

export default async function RubricPage({ params }: Props) {
  const { slug } = await params;
  const rubric = getRubricBySlug(slug);
  if (!rubric) notFound();

  const list = articlesInRubric(slug);
  const others = rubrics.filter((r) => r.slug !== slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: rubric.title,
      description: rubric.description,
      url: `https://moyanaliz.ru/blog/rubrika/${rubric.slug}`,
      inLanguage: "ru-RU",
      hasPart: list.slice(0, 30).map((a) => ({
        "@type": "Article",
        headline: a.title,
        url: `https://moyanaliz.ru/blog/${a.slug}`,
        datePublished: a.date,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru" },
        { "@type": "ListItem", position: 2, name: "Здоровье", item: "https://moyanaliz.ru/blog" },
        {
          "@type": "ListItem",
          position: 3,
          name: rubric.title,
          item: `https://moyanaliz.ru/blog/rubrika/${rubric.slug}`,
        },
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
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Здоровье
          </Link>

          <div className="mt-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{rubric.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              {rubric.description}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              {list.length}{" "}
              {list.length % 10 === 1 && list.length % 100 !== 11
                ? "статья"
                : [2, 3, 4].includes(list.length % 10) && ![12, 13, 14].includes(list.length % 100)
                  ? "статьи"
                  : "статей"}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <h2 className="font-semibold text-[15px] leading-snug mb-2 text-card-foreground group-hover:text-primary transition-colors">
                  {a.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {a.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(a.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Читать</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Другие рубрики</h2>
            <div className="flex flex-wrap gap-2">
              {others.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/rubrika/${r.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

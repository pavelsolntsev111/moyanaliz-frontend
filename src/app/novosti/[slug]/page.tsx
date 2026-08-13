import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { news, getNewsBySlug, newsSorted } from "@/lib/news-data";
import { indicatorsMentioned, autolinkIndicators } from "@/lib/article-links";
import { formatInlineSafe, jsonLdScript } from "@/lib/safe-html";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNewsBySlug(slug);
  if (!n) return {};
  return {
    title: `${n.title} — Мой Анализ`,
    description: n.description,
    keywords: n.keywords.join(", "),
    alternates: { canonical: `/novosti/${slug}` },
    openGraph: {
      title: `${n.title} — Мой Анализ`,
      description: n.description,
      url: `https://moyanaliz.ru/novosti/${slug}`,
      type: "article",
      publishedTime: n.date,
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  const mentioned = indicatorsMentioned(item.content, 4);
  const others = newsSorted()
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: item.title,
      description: item.description,
      inLanguage: "ru-RU",
      datePublished: item.date,
      dateModified: item.date,
      mainEntityOfPage: `https://moyanaliz.ru/novosti/${slug}`,
      author: { "@type": "Organization", name: "Мой Анализ" },
      publisher: { "@type": "Organization", name: "Мой Анализ" },
      // Первоисточник указываем в разметке, а не только в тексте: это новость по мотивам
      // чужой публикации, и поисковик должен видеть, откуда она.
      citation: {
        "@type": "CreativeWork",
        name: item.source,
        url: item.sourceUrl,
        datePublished: item.sourceDate,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Новости", item: "https://moyanaliz.ru/novosti" },
        {
          "@type": "ListItem",
          position: 3,
          name: item.title,
          item: `https://moyanaliz.ru/novosti/${slug}`,
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
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link
            href="/novosti"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Новости
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Новость
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{item.readTime}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(item.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {item.title}
          </h1>

          {/* Первоисточник — вверху, до текста: читатель должен видеть, на чём основана
              новость, ещё до того, как начнёт её читать. */}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener nofollow"
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 transition hover:border-primary/40"
          >
            <span className="text-sm text-muted-foreground">
              Источник: <span className="font-medium text-foreground">{item.source}</span>,{" "}
              {new Date(item.sourceDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>

          <article className="prose prose-sm max-w-none prose-headings:font-semibold prose-h2:mb-3 prose-h2:mt-8 prose-h2:text-xl prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground sm:prose-base">
            <NewsContent content={item.content} />
          </article>

          {mentioned.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Показатели из новости</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {mentioned.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/indicators/${i.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <span className="text-sm font-medium text-foreground">{i.name}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Новость — это повод посмотреть на свои показатели, а не поставить себе диагноз.
              Если бланк анализа уже на руках,{" "}
              <Link href="/?ref=novosti" className="text-primary hover:underline">
                загрузите его целиком
              </Link>{" "}
              — разбор учтёт пол, возраст и связи между показателями.
            </p>
          </div>

          {others.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="text-lg font-semibold text-foreground">Другие новости</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {others.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/novosti/${n.slug}`}
                    className="group rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {n.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
            Материал носит информационный характер, не является медицинской рекомендацией и не
            заменяет консультацию врача. Мнение редакции может не совпадать с позицией
            первоисточника.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function NewsContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const linkBudget = { left: 3 };
  const linkedSlugs = new Set<string>();
  const link = (t: string) => autolinkIndicators(t, linkedSlugs, linkBudget);

  while (i < lines.length) {
    const line = lines[i];

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++}>{line.slice(4)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++}>{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++}>
          {items.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineSafe(link(it)) }} />
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    elements.push(
      <p key={key++} dangerouslySetInnerHTML={{ __html: formatInlineSafe(link(line)) }} />
    );
    i++;
  }

  return <>{elements}</>;
}


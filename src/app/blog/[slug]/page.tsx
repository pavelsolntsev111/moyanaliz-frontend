import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InlineDropzone } from "@/components/inline-dropzone";
import { articles, getArticleBySlug } from "@/lib/blog-data";
import { rubricForCategory, relatedArticles } from "@/lib/rubrics-data";
import {
  articleCluster,
  landingForArticle,
  indicatorsMentioned,
  autolinkIndicators,
} from "@/lib/article-links";
import { formatInlineSafe, jsonLdScript } from "@/lib/safe-html";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} — Мой Анализ`,
    description: article.description,
    keywords: article.keywords.join(", "),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: `${article.title} — Мой Анализ`,
      description: article.description,
      url: `https://moyanaliz.ru/blog/${slug}`,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const cluster = articleCluster(slug);
  const landing = landingForArticle(slug, article.category);
  const mentioned = indicatorsMentioned(article.content, 6);
  const rubric = rubricForCategory(article.category);
  const related = relatedArticles(slug, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      inLanguage: "ru-RU",
      datePublished: article.date,
      dateModified: article.date,
      mainEntityOfPage: `https://moyanaliz.ru/blog/${slug}`,
      author: { "@type": "Organization", name: "Мой Анализ" },
      publisher: { "@type": "Organization", name: "Мой Анализ" },
      articleSection: rubric.title,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Здоровье", item: "https://moyanaliz.ru/blog" },
        {
          "@type": "ListItem",
          position: 3,
          name: rubric.title,
          item: `https://moyanaliz.ru/blog/rubrika/${rubric.slug}`,
        },
        { "@type": "ListItem", position: 4, name: article.title, item: `https://moyanaliz.ru/blog/${slug}` },
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
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Здоровье
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Link
              href={`/blog/rubrika/${rubric.slug}`}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {rubric.title}
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(article.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-6 text-foreground">
            {article.title}
          </h1>

          <article className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-foreground/80 prose-p:leading-relaxed prose-li:text-foreground/80 prose-strong:text-foreground prose-table:text-sm">
            <FormattedContent content={article.content} cluster={cluster} />
          </article>

          {/* Показатели из статьи — контекстные ссылки вглубь сайта, а не только на главную */}
          {mentioned.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Показатели из статьи</h2>
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

          {/* Финальная дропзона: не ссылка на главную, а сама загрузка прямо здесь */}
          <InlineDropzone
            source={cluster}
            title="Разберём ваш анализ целиком"
            subtitle="Загрузите PDF или фото бланка — ИИ объяснит каждый показатель с учётом пола и возраста. 299 ₽, без регистрации, результат сразу."
          />

          {/* Профильный лендинг вместо главной: тематически ближе и не сбрасывает контекст */}
          {landing && (
            <Link
              href={`/${landing.slug}?ref=${cluster}`}
              className="group mt-4 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition hover:border-primary/40"
            >
              <span className="text-sm text-muted-foreground">
                Подробнее по теме:{" "}
                <span className="font-medium text-foreground">{landing.title}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          )}

          {/* Соседи по рубрике — связность раздела без ручной разметки */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">Читайте также</h2>
                <Link
                  href={`/blog/rubrika/${rubric.slug}`}
                  className="text-sm text-primary hover:underline shrink-0"
                >
                  Вся рубрика
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/blog/${a.slug}`}
                    className="group rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {a.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FormattedContent({ content, cluster }: { content: string; cluster: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  let ctaInserted = false;
  // Бюджет автоссылок на статью: 5 достаточно для связности и не превращает текст в решето.
  const linkBudget = { left: 5 };
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
      // Bridge into the funnel early: place a CTA after the intro, before the
      // first section — most readers leave before the end-of-article CTA (depth ~1.1).
      if (!ctaInserted && elements.length > 0) {
        elements.push(<InlineDropzone key={key++} source={cluster} />);
        ctaInserted = true;
      }
      elements.push(<h2 key={key++}>{line.slice(3)}</h2>);
      i++;
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .filter((l) => !l.match(/^\|[\s-|]+\|$/))
        .map((l) =>
          l
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim())
        );
      if (rows.length > 0) {
        elements.push(
          <table key={key++}>
            <thead>
              <tr>
                {rows[0].map((cell, ci) => (
                  <th key={ci}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
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
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineSafe(link(item)) }} />
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(
        <ol key={key++}>
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineSafe(item) }} />
          ))}
        </ol>
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


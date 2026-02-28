import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticleBySlug } from "@/lib/blog-data";
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
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/blog"
        className="text-sm text-muted hover:text-primary transition mb-6 inline-block"
      >
        &larr; Все статьи
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
          {article.category}
        </span>
        <span className="text-xs text-muted">{article.readTime}</span>
        <span className="text-xs text-muted">
          {new Date(article.date).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-6">
        {article.title}
      </h1>

      <article className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-foreground/80 prose-p:leading-relaxed prose-li:text-foreground/80 prose-strong:text-foreground prose-table:text-sm">
        <FormattedContent content={article.content} />
      </article>

      <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
        <h3 className="font-semibold mb-2">
          Хотите расшифровать свои анализы?
        </h3>
        <p className="text-sm text-muted mb-4">
          Загрузите PDF или фото — и получите подробное объяснение каждого
          показателя за 2 минуты
        </p>
        <Link
          href="/"
          className="inline-block py-2.5 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          Расшифровать анализы
        </Link>
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers
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

    // Table
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

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++}>
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(
        <ol key={key++}>
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
    i++;
  }

  return <>{elements}</>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { landings, getLandingBySlug } from "@/lib/landings-data";
import { indicators } from "@/lib/indicators-data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ landing: string }>;
}

// Only the slugs listed in landings-data render here; any other top-level path
// falls through to 404 instead of being captured by this dynamic segment.
export const dynamicParams = false;

export async function generateStaticParams() {
  return landings.map((l) => ({ landing: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { landing } = await params;
  const data = getLandingBySlug(landing);
  if (!data) return {};
  return {
    title: `${data.title} — Мой Анализ`,
    description: data.metaDescription,
    keywords: data.keywords.join(", "),
    alternates: { canonical: `/${data.slug}` },
    openGraph: {
      title: `${data.title} — Мой Анализ`,
      description: data.metaDescription,
      url: `https://moyanaliz.ru/${data.slug}`,
      type: "website",
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { landing } = await params;
  const data = getLandingBySlug(landing);
  if (!data) notFound();

  const related = data.relatedIndicators
    .map((s) => indicators.find((i) => i.slug === s))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: data.title,
      description: data.metaDescription,
      url: `https://moyanaliz.ru/${data.slug}`,
      inLanguage: "ru-RU",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: data.title, item: `https://moyanaliz.ru/${data.slug}` },
      ],
    },
    ...(data.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition">Главная</Link>
            <span>/</span>
            <span className="text-foreground">{data.title}</span>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {data.badge}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {data.h1}
            </h1>
          </div>

          {/* Intro */}
          <div className="mb-8 text-base">
            <FormattedContent content={data.intro} />
          </div>

          {/* Primary CTA (above the fold) */}
          <div className="mb-10 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}>
            <p className="text-sm text-foreground font-medium text-center sm:text-left">
              Загрузите бланк — первые показатели бесплатно
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-7 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition whitespace-nowrap"
            >
              Расшифровать анализы
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Body */}
          <article className="space-y-1">
            <FormattedContent content={data.content} />
          </article>

          {/* FAQ */}
          {data.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Частые вопросы</h2>
              <div className="space-y-4">
                {data.faq.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related indicators (hub -> spoke internal links) */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Популярные показатели</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/indicators/${rel.slug}`}
                    className="rounded-xl border border-border bg-card p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <p className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{rel.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rel.shortName}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Полный справочник — на странице{" "}
                <Link href="/indicators" className="text-primary hover:underline">показатели анализов</Link>.
              </p>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl p-6 text-center" style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Готовы понять свои анализы?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Загрузите PDF или фото — ИИ объяснит каждый показатель за 2 минуты
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Расшифровать анализы
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-xs text-muted-foreground text-center leading-relaxed">
            Информация на этой странице носит ознакомительный характер и не заменяет консультацию врача.
            Нормы могут отличаться в зависимости от лаборатории.
          </p>
        </div>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-foreground mt-6 mb-2">{line.slice(4)}</h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-foreground mt-8 mb-3">{line.slice(3)}</h2>
      );
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
        .filter((l) => !l.match(/^\|[\s\-|]+\|$/))
        .map((l) => l.split("|").filter(Boolean).map((c) => c.trim()));
      if (rows.length > 0) {
        elements.push(
          <div key={key++} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="text-left py-2.5 px-3 text-foreground font-semibold" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2.5 px-3 text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <ul key={key++} className="space-y-1.5 my-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
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
        <ol key={key++} className="list-decimal pl-5 space-y-1.5 my-3 text-muted-foreground marker:text-primary/60">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
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
      <p key={key++} className="text-muted-foreground leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
    i++;
  }

  return <>{elements}</>;
}

function formatInline(text: string): string {
  return text
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary hover:underline">$1</a>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

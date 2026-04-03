import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { indicators, getIndicatorBySlug } from "@/lib/indicators-data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return indicators.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndicatorBySlug(slug);
  if (!ind) return {};
  return {
    title: `${ind.title} — Мой Анализ`,
    description: ind.metaDescription,
    alternates: {
      canonical: `/indicators/${slug}`,
    },
    openGraph: {
      title: `${ind.title} — Мой Анализ`,
      description: ind.metaDescription,
      url: `https://moyanaliz.ru/indicators/${slug}`,
      type: "article",
    },
  };
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

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
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function IndicatorPage({ params }: Props) {
  const { slug } = await params;
  const ind = getIndicatorBySlug(slug);
  if (!ind) notFound();

  const relatedIndicators = ind.content.relatedIndicators
    .map((s) => indicators.find((i) => i.slug === s))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: ind.name,
    description: ind.metaDescription,
    url: `https://moyanaliz.ru/indicators/${slug}`,
    mainEntity: {
      "@type": "MedicalTest",
      name: ind.name,
      normalRange: `${ind.referenceRange.male} (${ind.unit})`,
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition">Главная</Link>
            <span>/</span>
            <Link href="/indicators" className="hover:text-primary transition">Показатели</Link>
            <span>/</span>
            <span className="text-foreground">{ind.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {ind.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {ind.shortName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {ind.name}: норма, расшифровка, причины отклонений
            </h1>
          </div>

          {/* Quick stats card */}
          <div className="rounded-2xl border border-border bg-card p-5 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Единицы</p>
                <p className="text-sm font-semibold text-foreground">{ind.unit}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50">
                <p className="text-xs text-muted-foreground mb-1">Мужчины</p>
                <p className="text-sm font-semibold text-foreground">{ind.referenceRange.male}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-pink-50">
                <p className="text-xs text-muted-foreground mb-1">Женщины</p>
                <p className="text-sm font-semibold text-foreground">{ind.referenceRange.female}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Категория</p>
                <p className="text-sm font-semibold text-foreground">{ind.category}</p>
              </div>
            </div>
          </div>

          {/* Content sections */}
          <article className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Что такое {ind.name.toLowerCase()}</h2>
              <FormattedText text={ind.content.whatIs} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Почему {ind.name.toLowerCase()} важен</h2>
              <FormattedText text={ind.content.whyImportant} />
            </section>

            {/* Norms table */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Норма {ind.shortName} по возрасту и полу</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-3 text-foreground font-semibold">Группа</th>
                      <th className="text-left py-2.5 px-3 text-foreground font-semibold">Норма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ind.content.normsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2.5 px-3 text-muted-foreground">{row.group}</td>
                        <td className="py-2.5 px-3 text-foreground font-medium">{row.range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Причины повышения</h2>
              <FormattedText text={ind.content.highCauses} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Причины понижения</h2>
              <FormattedText text={ind.content.lowCauses} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Симптомы отклонений</h2>
              <FormattedText text={ind.content.symptoms} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Что делать при отклонениях</h2>
              <FormattedText text={ind.content.whatToDo} />
            </section>

            {/* FAQ */}
            {ind.content.faq.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">Частые вопросы</h2>
                <div className="space-y-4">
                  {ind.content.faq.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related indicators */}
            {relatedIndicators.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">Связанные показатели</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedIndicators.map((rel) => rel && (
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
              </section>
            )}
          </article>

          {/* CTA */}
          <div className="mt-12 rounded-2xl p-6 text-center" style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Загрузите свой анализ для персональной расшифровки
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ИИ объяснит каждый показатель простым языком и даст индивидуальные рекомендации
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
            Информация на этой странице носит ознакомительный характер. Для интерпретации ваших результатов обратитесь к врачу.
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calculator as CalcIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CalculatorWidget } from "@/components/calculator-widget";
import { calculators, getCalculatorBySlug } from "@/lib/calculators-data";
import { indicators } from "@/lib/indicators-data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalculatorBySlug(slug);
  if (!c) return {};
  return {
    title: `${c.title} — Мой Анализ`,
    description: c.metaDescription,
    keywords: c.keywords.join(", "),
    alternates: { canonical: `/kalkulyator/${c.slug}` },
    openGraph: {
      title: `${c.title} — Мой Анализ`,
      description: c.metaDescription,
      url: `https://moyanaliz.ru/kalkulyator/${c.slug}`,
      type: "website",
    },
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const c = getCalculatorBySlug(slug);
  if (!c) notFound();

  const related = c.relatedIndicators
    .map((s) => indicators.find((i) => i.slug === s))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  const siblings = calculators.filter((x) => x.group === c.group && x.slug !== c.slug).slice(0, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: c.h1,
      description: c.metaDescription,
      url: `https://moyanaliz.ru/kalkulyator/${c.slug}`,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      inLanguage: "ru-RU",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Калькуляторы", item: "https://moyanaliz.ru/kalkulyator" },
        { "@type": "ListItem", position: 3, name: c.h1, item: `https://moyanaliz.ru/kalkulyator/${c.slug}` },
      ],
    },
    ...(c.faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link
            href="/kalkulyator"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Все калькуляторы
          </Link>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <CalcIcon className="h-3.5 w-3.5" />
            {c.group}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{c.h1}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.lead}</p>

          <div className="mt-7">
            <CalculatorWidget slug={c.slug} />
          </div>

          <Prose title="Как считается" md={c.howItWorks} />
          <Prose title="Как понимать результат" md={c.interpretation} />

          {c.whenToDoctor && (
            <div className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
              <h2 className="text-base font-semibold text-foreground">Когда нужен врач</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.whenToDoctor}</p>
            </div>
          )}

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Показатели из расчёта</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((i) => (
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

          {c.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Частые вопросы</h2>
              <div className="mt-4 space-y-3">
                {c.faq.map((f, i) => (
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
          )}

          {siblings.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Другие калькуляторы раздела «{c.group}»</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/kalkulyator/${s.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <span className="text-sm font-medium text-foreground">{s.short}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {c.sources.length > 0 && (
            <section className="mt-10 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-foreground">Источники</h2>
              <ul className="mt-2 space-y-1">
                {c.sources.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Калькулятор носит информационный характер, не ставит диагноз и не заменяет консультацию
            врача. Расчёт выполняется в вашем браузере — введённые значения никуда не передаются.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Мини-рендер markdown: абзацы, списки, **жирный**, [ссылки](/url). */
function Prose({ title, md }: { title: string; md: string }) {
  if (!md?.trim()) return null;
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (t: string) =>
    t
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-primary underline underline-offset-2 hover:opacity-80">$1</a>'
      )
      .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>");

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^[-•*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•*]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={key++} className="ml-5 list-disc space-y-1.5">
          {items.map((it, n) => (
            <li
              key={n}
              className="text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: inline(it) }}
            />
          ))}
        </ul>
      );
      continue;
    }
    out.push(
      <p
        key={key++}
        className="text-sm leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: inline(line) }}
      />
    );
    i++;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{out}</div>
    </section>
  );
}

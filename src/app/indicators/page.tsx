import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { indicators, indicatorCategories } from "@/lib/indicators-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Показатели анализов — справочник | Мой Анализ",
  description:
    "Справочник лабораторных показателей: нормы, причины отклонений. Гемоглобин, холестерин, глюкоза, ТТГ, ферритин, лейкоциты и другие.",
  alternates: {
    canonical: "/indicators",
  },
  openGraph: {
    title: "Показатели анализов — справочник | Мой Анализ",
    description:
      "Справочник лабораторных показателей: нормы, причины отклонений.",
    url: "https://moyanaliz.ru/indicators",
  },
};

const categoryColors: Record<string, string> = {
  "Общий анализ крови": "bg-red-50 text-red-600",
  "Биохимия": "bg-amber-50 text-amber-700",
  "Гормоны": "bg-purple-50 text-purple-600",
};

const categoryDotColors: Record<string, string> = {
  "Общий анализ крови": "bg-red-500",
  "Биохимия": "bg-amber-500",
  "Гормоны": "bg-purple-500",
};

export default function IndicatorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Показатели анализов
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Справочник лабораторных показателей: что означает каждый, нормы
              для взрослых, причины отклонений и что делать.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {indicatorCategories.map((cat) => (
              <a
                key={cat}
                href={`#${cat.replace(/\s+/g, "-")}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 ${
                  categoryColors[cat] || "bg-muted text-muted-foreground"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>

          {indicatorCategories.map((cat) => {
            const catIndicators = indicators.filter((i) => i.category === cat);
            if (catIndicators.length === 0) return null;
            return (
              <section key={cat} id={cat.replace(/\s+/g, "-")} className="mb-10 scroll-mt-20">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      categoryDotColors[cat] || "bg-primary"
                    }`}
                  />
                  {cat}
                </h2>

                <div className="space-y-3">
                  {catIndicators.map((ind) => (
                    <Link
                      key={ind.slug}
                      href={`/indicators/${ind.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[15px] text-card-foreground group-hover:text-primary transition-colors">
                            {ind.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {ind.shortName}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {ind.metaDescription}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Норма: {ind.referenceRange.male} ({ind.unit})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="hidden sm:inline">Подробнее</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <div className="rounded-2xl p-6 text-center mt-4" style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Получите расшифровку вашего анализа за 2 минуты
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ИИ объяснит каждый показатель простым языком и даст рекомендации
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Загрузить анализ
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

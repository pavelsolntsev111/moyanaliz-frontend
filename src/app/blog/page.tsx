import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { articles } from "@/lib/blog-data";
import { rubricCounts, rubricForCategory } from "@/lib/rubrics-data";
import { jsonLdScript } from "@/lib/safe-html";

export const metadata = {
  title: "Здоровье — статьи о анализах и показателях | Мой Анализ",
  description:
    "Статьи о здоровье и лабораторных анализах: показатели крови, биохимия, гормоны, витамины, подготовка к сдаче и чек-апы — простым языком, с опорой на доказательную медицину.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Здоровье — статьи о анализах и показателях | Мой Анализ",
    description:
      "Статьи о здоровье и лабораторных анализах: показатели крови, биохимия, гормоны, витамины, подготовка к сдаче и чек-апы.",
    url: "https://moyanaliz.ru/blog",
  },
};

/** Сколько свежих статей показываем на хабе. Остальные — на страницах рубрик. */
const LATEST_LIMIT = 60;

export default function BlogPage() {
  const counts = rubricCounts();
  const latest = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, LATEST_LIMIT);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Здоровье — Мой Анализ",
    description:
      "Статьи о здоровье и лабораторных анализах: показатели крови, биохимия, гормоны, витамины, подготовка к сдаче и чек-апы.",
    url: "https://moyanaliz.ru/blog",
    inLanguage: "ru-RU",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Здоровье</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Статьи о показателях здоровья, расшифровке анализов и профилактике — простым
              языком, с опорой на доказательную медицину. Всего {articles.length} материалов.
            </p>
          </div>

          {/* Рубрики — навигация по разделу */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map(({ rubric, count }) => (
              <Link
                key={rubric.slug}
                href={`/blog/rubrika/${rubric.slug}`}
                className="group rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {rubric.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{count} материалов</div>
              </Link>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-5">Свежие материалы</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => {
              const rubric = rubricForCategory(a.category);
              return (
                <div
                  key={a.slug}
                  className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      href={`/blog/rubrika/${rubric.slug}`}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {rubric.title}
                    </Link>
                  </div>
                  <Link href={`/blog/${a.slug}`} className="block">
                    <h3 className="font-semibold text-[15px] leading-snug mb-2 text-card-foreground group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
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
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Показаны последние {LATEST_LIMIT} материалов. Остальные — в рубриках выше.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { newsSorted } from "@/lib/news-data";
import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/safe-html";

export const metadata: Metadata = {
  title: "Новости медицины простым языком — Мой Анализ",
  description:
    "Новости медицины и здоровья для обычных людей: что выяснили учёные, что изменилось в рекомендациях и что из этого стоит применить к себе. Со ссылкой на первоисточник.",
  alternates: { canonical: "/novosti" },
  openGraph: {
    title: "Новости медицины простым языком — Мой Анализ",
    description:
      "Что выяснили учёные, что изменилось в рекомендациях и что из этого стоит применить к себе.",
    url: "https://moyanaliz.ru/novosti",
    type: "website",
  },
};

export default function NewsIndexPage() {
  const items = newsSorted();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Новости медицины — Мой Анализ",
    description:
      "Новости медицины и здоровья для обычных людей, с указанием первоисточника.",
    url: "https://moyanaliz.ru/novosti",
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
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Новости</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
              Что выяснили учёные, что изменилось в рекомендациях и что из этого стоит
              применить к себе. Пишем простым языком, без запугивания и без сенсаций,
              и всегда указываем первоисточник — его можно открыть и проверить.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Раздел только запускается — первые материалы появятся в ближайшие дни.
                Пока загляните в{" "}
                <Link href="/blog" className="text-primary hover:underline">
                  раздел «Здоровье»
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <Link
                  key={n.slug}
                  href={`/novosti/${n.slug}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    <span>{n.source}</span>
                  </div>
                  <h2 className="mb-2 text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
                    {n.title}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {n.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(n.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <span>Читать</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
            Материалы раздела носят информационный характер, не являются медицинской
            рекомендацией и не заменяют консультацию врача.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import type { MetadataRoute } from "next";
import { articles } from "@/lib/blog-data";
import { indicators } from "@/lib/indicators-data";
import { landings } from "@/lib/landings-data";
import { calculators } from "@/lib/calculators-data";
import { rubrics, articlesInRubric } from "@/lib/rubrics-data";
import { news } from "@/lib/news-data";

// Слаги, склеенные 301-редиректом в next.config.ts (транслитерационные дубли).
// В карте сайта их быть не должно — иначе сами же отдаём роботу редиректы.
const REDIRECTED_SLUGS = new Set([
  "kakie-analizy-sdat-pri-bessonnitse",
  "kakie-analizy-sdat-pri-chastykh-prostudakh",
  "kakie-analizy-sdat-pri-sukhosti-kozhi",
  "kakie-analizy-sdat-pri-sukhosti-vo-rtu",
  "kakie-analizy-sdat-pri-sukhosti-vo-rtu-i-zhazhde",
  "kaltsiy-magniy-norma-kosti",
]);

// Дата фактической публикации раздела калькуляторов. Бампать вручную, когда меняли их контент.
const CALC_PUBLISHED = "2026-08-07";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://moyanaliz.ru";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/indicators`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/novosti`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/kalkulyator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ai-konsultant`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/example`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/oboznacheniya`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/offer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/consent`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/guarantee`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const blogPages: MetadataRoute.Sitemap = articles
    .filter((a) => !REDIRECTED_SLUGS.has(a.slug))
    .map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // lastmod НЕ ставим «сегодня»: страницы показателей не меняются на каждом деплое,
  // а если каждый URL всегда «изменён только что», Google перестаёт доверять сигналу целиком.
  const indicatorPages: MetadataRoute.Sitemap = indicators.map((i) => ({
    url: `${base}/indicators/${i.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const landingPages: MetadataRoute.Sitemap = landings.map((l) => ({
    url: `${base}/${l.slug}`,
    lastModified: new Date(l.updated),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const calcPages: MetadataRoute.Sitemap = calculators.map((c) => ({
    url: `${base}/kalkulyator/${c.slug}`,
    lastModified: new Date(CALC_PUBLISHED),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Рубрики: lastmod = дата свежайшей статьи внутри, чтобы не врать роботу «обновлено сегодня»
  const rubricPages: MetadataRoute.Sitemap = rubrics.map((r) => {
    const list = articlesInRubric(r.slug);
    return {
      url: `${base}/blog/rubrika/${r.slug}`,
      lastModified: list.length ? new Date(list[0].date) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${base}/novosti/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...newsPages,
    ...landingPages,
    ...calcPages,
    ...rubricPages,
    ...blogPages,
    ...indicatorPages,
  ];
}

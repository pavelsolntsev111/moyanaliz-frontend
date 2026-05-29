import type { MetadataRoute } from "next";
import { articles } from "@/lib/blog-data";
import { indicators } from "@/lib/indicators-data";
import { landings } from "@/lib/landings-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://moyanaliz.ru";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/indicators`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/offer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/guarantee`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const indicatorPages: MetadataRoute.Sitemap = indicators.map((i) => ({
    url: `${base}/indicators/${i.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const landingPages: MetadataRoute.Sitemap = landings.map((l) => ({
    url: `${base}/${l.slug}`,
    lastModified: new Date(l.updated),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...landingPages, ...blogPages, ...indicatorPages];
}

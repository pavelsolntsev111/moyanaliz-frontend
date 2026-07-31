import type { Metadata, Viewport } from "next";
// Inter — интерфейсный шрифт всего сайта. Подключён ЛОКАЛЬНО из node_modules,
// а НЕ через next/font/google, и это принципиально: next/font качает woff2 с
// fonts.gstatic.com во время сборки, и когда доступ к Google Fonts отваливается,
// падает билд ВСЕГО фронта. Так уже было на /posev-demo дважды (Raleway, потом
// Manrope), а 30.07.2026 то же воспроизводилось локально на этом Inter'е.
// @fontsource-variable/inter везёт woff2 в зависимостях (включая cyrillic и
// cyrillic-ext) — сборка перестаёт зависеть от внешней сети.
// Семейство называется 'Inter Variable', оно подставлено в --font-inter в
// globals.css.
import "@fontsource-variable/inter";
import "./globals.css";
import Analytics from "./analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://moyanaliz.ru"),
  title: "Мой Анализ — расшифровка лабораторных анализов",
  description:
    "Загрузите фото или PDF лабораторного анализа и получите понятную расшифровку с пояснениями от ИИ. Быстро, точно, конфиденциально.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Мой Анализ — расшифровка лабораторных анализов",
    description:
      "Загрузите результаты из любой лаборатории — получите понятную расшифровку с рекомендациями по питанию и образу жизни.",
    url: "https://moyanaliz.ru",
    siteName: "Мой Анализ",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Мой Анализ — расшифровка лабораторных анализов",
    description:
      "Загрузите результаты из любой лаборатории — получите понятную расшифровку с рекомендациями по питанию и образу жизни.",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00b4bc",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Мой Анализ",
  url: "https://moyanaliz.ru",
  description:
    "Сервис расшифровки лабораторных анализов с помощью ИИ. Загрузите PDF или фото — получите понятный отчёт с рекомендациями.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "299",
    priceCurrency: "RUB",
  },
  inLanguage: "ru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

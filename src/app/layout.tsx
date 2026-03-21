import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

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
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "199",
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
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108175626','ym');
          ym(108175626,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
        `}</Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/108175626" style={{position:"absolute",left:"-9999px"}} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}

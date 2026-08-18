import type { Metadata, Viewport } from "next";

// Full-screen consultation shell — no site header/footer. Returns children
// unchanged so the root layout (html/body/Метрика) still wraps it.

export const metadata: Metadata = {
  title: "ИИ-консультант по здоровью — Мой Анализ",
  description: "Чат с ИИ-консультантом о здоровье",
  // The token in the path IS the session secret: anyone holding it can read
  // the conversation. Keep it out of indexes and out of Referer headers.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#00b4bc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return children;
}

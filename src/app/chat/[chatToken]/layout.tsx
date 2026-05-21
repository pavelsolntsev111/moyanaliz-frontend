import type { Metadata, Viewport } from "next";

// Chat layout — full-screen, no site header/footer (the file overrides the
// root layout's children wrapping). We rely on the root layout still being
// in the tree (for <html>/<body>/YM script), so this layout intentionally
// returns just {children}.

export const metadata: Metadata = {
  title: "AI-консультант — Мой Анализ",
  description: "Расшифровка лабораторных анализов с помощью ИИ",
  // Keep this chat session out of search engines and aggregators —
  // token-in-URL is a session secret.
  robots: { index: false, follow: false },
  // Don't leak the token via Referer when the user clicks any outbound link
  // (LLM might emit one, the user might tap a logo, etc.)
  referrer: "no-referrer",
};

// viewport-fit=cover lets us paint into the iPhone notch / home-indicator
// area; safe-area-inset-* CSS variables then push real content back.
export const viewport: Viewport = {
  themeColor: "#00b4bc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Note: NOT setting maximumScale — accessibility (users may need to zoom).
  // We prevent iOS zoom-on-focus by keeping textarea font-size >=16px in CSS.
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}

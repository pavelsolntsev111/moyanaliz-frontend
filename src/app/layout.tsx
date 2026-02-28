import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Мой Анализ — расшифровка лабораторных анализов",
  description:
    "Информационная расшифровка результатов лабораторных анализов с помощью ИИ. Загрузите PDF или фото — получите понятный отчёт.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`}>
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

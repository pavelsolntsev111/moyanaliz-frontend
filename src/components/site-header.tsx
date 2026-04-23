"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/guarantee", label: "Гарантия" },
  { href: "/indicators", label: "Показатели" },
  { href: "/blog", label: "Блог" },
  { href: "/offer", label: "О сервисе" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        backgroundColor: "color-mix(in oklab, var(--card) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md shadow-[var(--shadow-sm-ma)]"
            style={{
              background:
                "linear-gradient(135deg, #00b4bc 0%, #00838f 100%)",
            }}
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 15 8 10 12 13 16 7 21 12" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-[-0.02em] text-foreground">
            Мой<span className="text-primary">Анализ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-foreground md:hidden"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

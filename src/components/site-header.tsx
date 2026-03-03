"use client";

import Link from "next/link";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Мой <span className="text-primary">Анализ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Блог
          </Link>
          <Link
            href="/offer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            О сервисе
          </Link>
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
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Блог
            </Link>
            <Link
              href="/offer"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              О сервисе
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

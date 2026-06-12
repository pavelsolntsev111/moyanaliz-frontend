"use client";

import Link from "next/link";
import { Activity, LifeBuoy, Menu, X } from "lucide-react";
import { useState } from "react";
import { SupportModal } from "@/components/support-modal";
import { ymGoal } from "@/lib/ym";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  function openSupport() {
    setMenuOpen(false);
    setSupportOpen(true);
    ymGoal("support_form_opened");
  }

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
            href="/indicators"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Показатели
          </Link>
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
          <Link
            href="/abonement"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Абонемент
          </Link>
          <button
            onClick={openSupport}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <LifeBuoy className="h-4 w-4" />
            Поддержка
          </button>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={openSupport}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
            aria-label="Поддержка"
          >
            <LifeBuoy className="h-4 w-4" />
            Поддержка
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-foreground"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/indicators"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Показатели
            </Link>
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
            <Link
              href="/abonement"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Абонемент
            </Link>
          </div>
        </nav>
      )}

      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
    </header>
  );
}

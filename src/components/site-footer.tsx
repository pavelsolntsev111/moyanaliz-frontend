import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Мой Анализ</p>
            <p className="text-xs text-muted-foreground">
              Расшифровка лабораторных анализов с помощью ИИ
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/offer"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Оферта
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Конфиденциальность
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Условия
            </Link>
            <a
              href="mailto:support@moyanaliz.ru"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              support@moyanaliz.ru
            </a>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} moyanaliz.ru
          </p>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Сервис носит исключительно информационный характер и не является
          медицинской услугой. Результаты не заменяют консультацию врача.
        </p>
      </div>
    </footer>
  );
}

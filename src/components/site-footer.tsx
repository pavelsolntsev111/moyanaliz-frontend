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
              href="/indicators"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Показатели
            </Link>
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
            <Link
              href="/guarantee"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Гарантия
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

        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="grid gap-4 text-center md:grid-cols-2 md:text-left">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Оператор сервиса
              </p>
              <p className="text-xs font-medium text-foreground">
                ИП Солнцев Павел Владимирович
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                ИНН 501815177453 · ОГРНИП 326774600300742
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                +7 993 551 38 16
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                support@moyanaliz.ru
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Медицинская клиника
              </p>
              <p className="text-xs font-medium text-foreground">
                ООО «Оренбургская Неотложка»
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                ИНН 5610096165 · ОГРН 1065610073385
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                460048, г. Оренбург, проезд Автоматики, д. 30
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                Лицензия № ЛО-56-01-002714 от 25.03.2020
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

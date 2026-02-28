import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 py-8 px-4 mt-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/terms" className="hover:text-primary transition">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:text-primary transition">
              Политика конфиденциальности
            </Link>
            <Link href="/offer" className="hover:text-primary transition">
              Оферта
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} moyanaliz.ru</span>
        </div>
        <p className="text-xs text-muted/70 mt-4 text-center">
          Сервис носит исключительно информационный характер и не является
          медицинской услугой. Результаты не заменяют консультацию врача.
        </p>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
// Manrope — дисплейный шрифт заказчика (med-click.ru). Подключён ЛОКАЛЬНО из
// node_modules, а НЕ через next/font/google, и это принципиально: next/font
// скачивает файлы шрифта во время сборки, и когда доступ к Google Fonts
// отваливается, падает билд ВСЕГО фронта, а не только этой страницы. Так уже
// было дважды (сначала на static-weight Raleway, потом на Manrope). Пакет
// @fontsource-variable/manrope везёт woff2 в репозиторий зависимостей —
// сборка перестаёт зависеть от внешней сети, набор подмножеств включает
// кириллицу.
import "@fontsource-variable/manrope";
import PosevDemoClient from "./posev-demo-client";

export const metadata: Metadata = {
  title: "Демо · расшифровка бак-посева",
  robots: { index: false, follow: false, nocache: true },
};

export default function PosevDemoPage() {
  return (
    <div
      style={
        {
          // Пара «Manrope дисплей + Inter интерфейс»: Inter уже подключён в
          // корневом layout, отдельно тянуть его не нужно.
          "--font-display": "'Manrope Variable'",
        } as React.CSSProperties
      }
    >
      <PosevDemoClient />
    </div>
  );
}

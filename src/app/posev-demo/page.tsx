import type { Metadata } from "next";
import PosevDemoClient from "./posev-demo-client";

export const metadata: Metadata = {
  title: "Демо · расшифровка бак-посева",
  // Демо для одного заказчика — из индекса убираем полностью.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * У заказчика на сайте Manrope (заголовки) + Raleway (текст). Через next/font их
 * НЕ подключаем намеренно: Turbopack падает на их static-weight модулях, а любой
 * сбой скачивания шрифта в билде роняет деплой ВСЕГО фронта, не только демо.
 * Демо-макету достаточно уже подключённого в layout Inter — он геометрически
 * близок к Manrope, а совпадение палитры и композиции даёт узнаваемость.
 * Если заказчик попросит пиксель-в-пиксель — положим ttf в /public и подключим
 * локальным @font-face, без внешней сети в билде.
 */
export default function PosevDemoPage() {
  return (
    <div
      style={
        {
          "--font-mc-head": "var(--font-inter)",
          "--font-mc-body": "var(--font-inter)",
        } as React.CSSProperties
      }
    >
      <PosevDemoClient />
    </div>
  );
}

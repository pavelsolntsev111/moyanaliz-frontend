import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import PosevDemoClient from "./posev-demo-client";

/**
 * Manrope — родной дисплейный шрифт заказчика (med-click.ru), берём как
 * ВАРИАТИВНЫЙ, без массива weight. Именно `weight: [...]` роняло сборку
 * Turbopack на static-weight модулях — вариативный вариант собирается штатно
 * (так же подключён Inter в корневом layout). Inter остаётся на интерфейсный
 * текст: пара «Manrope дисплей + Inter UI» держит воздух и не выглядит
 * дефолтной системной вёрсткой.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Демо · расшифровка бак-посева",
  robots: { index: false, follow: false, nocache: true },
};

export default function PosevDemoPage() {
  return (
    <div className={manrope.variable}>
      <PosevDemoClient />
    </div>
  );
}

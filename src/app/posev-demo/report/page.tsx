import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import ReportClient from "./report-client";

export const metadata: Metadata = {
  title: "Расшифровка бак-посева",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Отдельная вкладка с расшифровкой.
 *
 * Данные СЮДА НЕ ПРИХОДЯТ ни из URL, ни из хранилища: вкладка открывается
 * пустой, а родительская страница передаёт отчёт через postMessage. Так контур
 * остаётся эфемерным целиком — результат разбора не оседает ни в адресной
 * строке (попадает в историю), ни в localStorage (остаётся на устройстве).
 */
export default function PosevReportPage() {
  return (
    <div style={{ "--font-display": "'Manrope Variable'" } as React.CSSProperties}>
      <ReportClient />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ReportView, type PosevReport, type ReportMeta } from "../report-view";

type State =
  | { kind: "loading" }
  | { kind: "ready"; report: PosevReport; meta: ReportMeta | null }
  | { kind: "orphan" };

/** Ключ, под которым вкладка держит уже забранный отчёт (переживает F5). */
const TAB_KEY = "posev_report_tab";

/**
 * Печать: A4 с полями, цвета принудительно сохраняются (иначе Chrome выкидывает
 * заливки чипов S/I/R и таблица теряет смысл), блоки не рвутся по страницам.
 */
const CSS = `
.pd-display { font-family: var(--font-display), system-ui, sans-serif; letter-spacing: -0.02em; }
.pd-eyebrow { font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; }
.pd-row { transition: background-color .18s ease; }
.pd-row:hover { background-color: rgba(22,20,28,.022); }
.pd-btn { transition: background-color .2s ease, transform .12s ease, border-color .2s ease; }
.pd-btn:active { transform: translateY(1px); }
.pd-print-only { display: none; }

@page { size: A4; margin: 14mm 12mm 16mm; }
@media print {
  html, body { background: #fff !important; }
  .pd-noprint { display: none !important; }
  .pd-print-only { display: block !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .pd-block, tr, li { break-inside: avoid; }
  h1, h2 { break-after: avoid; }
  table { width: 100% !important; min-width: 0 !important; }
  article { max-width: none !important; padding: 0 !important; }
}
`;

export default function ReportClient() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    // Отчёт передаётся ключом в localStorage: postMessage не годится — часть
    // браузеров и вебвью открывают window.open в ТОЙ ЖЕ вкладке, opener
    // теряется, и данные передать нечем. Забираем и сразу стираем: на сервере
    // отчёт не хранится вовсе, в браузере живёт секунды.
    const key = new URLSearchParams(window.location.search).get("k");
    let raw: string | null = null;

    if (key) {
      try {
        raw = localStorage.getItem(key);
        if (raw) {
          localStorage.removeItem(key);
          // Кладём в sessionStorage этой вкладки, чтобы F5 не убивал отчёт.
          // sessionStorage умирает вместе со вкладкой — это ровно тот срок
          // жизни, который мы обещаем заказчику.
          sessionStorage.setItem(TAB_KEY, raw);
        }
      } catch {
        raw = null;
      }
    }
    if (!raw) {
      try {
        raw = sessionStorage.getItem(TAB_KEY);
      } catch {
        raw = null;
      }
    }

    if (!raw) {
      setState({ kind: "orphan" });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { report: PosevReport; meta?: ReportMeta };
      setState({ kind: "ready", report: parsed.report, meta: parsed.meta ?? null });
    } catch {
      setState({ kind: "orphan" });
    }
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#16141C]">
      <style>{CSS}</style>

      <header className="pd-noprint border-b border-black/[0.08]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-4 px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3.5">
            <div className="pd-display grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#00C3C8] text-[11px] font-extrabold tracking-[0.04em] text-white">
              АМР
            </div>
            <div className="pd-display text-[13px] font-extrabold tracking-[0.06em]">
              ПОРТАЛ О АНТИБИОТИКОРЕЗИСТЕНТНОСТИ
            </div>
          </div>

          {state.kind === "ready" && (
            <div className="ml-auto flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="pd-btn rounded-lg bg-[#7119FF] px-6 py-3.5 text-[12px] font-bold text-white hover:bg-[#5F12DC]"
              >
                Скачать PDF
              </button>
              <button
                type="button"
                onClick={() => window.close()}
                className="pd-btn rounded-lg border border-black/[0.12] bg-white px-6 py-3.5 text-[12px] font-bold hover:bg-black/[0.03]"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </header>

      {/* колонтитул только для печати */}
      <div className="pd-print-only border-b border-black/20 pb-3">
        <p className="pd-display text-[11px] font-extrabold tracking-[0.06em]">
          ПОРТАЛ О АНТИБИОТИКОРЕЗИСТЕНТНОСТИ · РАСШИФРОВКА БАК-ПОСЕВА
        </p>
      </div>

      {state.kind === "loading" && (
        <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
          <div className="h-[3px] w-[220px] overflow-hidden rounded-full bg-black/[0.07]">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#7119FF]" />
          </div>
        </div>
      )}

      {state.kind === "orphan" && (
        <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
          <h1 className="pd-display text-[30px] font-extrabold leading-tight">
            Расшифровка недоступна
          </h1>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-[#55535E]">
            Эта страница показывает результат только сразу после разбора: отчёт нигде не
            сохраняется — ни на сервере, ни в браузере. Вернитесь на страницу сервиса и загрузите
            бланк заново.
          </p>
          <a
            href="/posev-demo"
            className="pd-btn mt-8 inline-block rounded-lg bg-[#7119FF] px-6 py-4 text-[12px] font-bold text-white hover:bg-[#5F12DC]"
          >
            К загрузке бланка
          </a>
        </div>
      )}

      {state.kind === "ready" && <ReportView report={state.report} meta={state.meta} />}
    </main>
  );
}

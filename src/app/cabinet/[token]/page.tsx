"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, FileText, Plus, TableProperties, ListChecks, Lock, Check, ArrowRight,
  ChevronLeft, ChevronRight, MessageCircle, Download,
} from "lucide-react";
import {
  getCabinet,
  type CabinetData, type CabinetIndicator, type CabinetPoint,
  type CabinetAnalysis, type CabinetAnalysisIndicator,
} from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// ───────────────────────── self-contained demo (token "demo") ─────────────────────────
// A marketing mockup for the subscription campaign; renders without any backend call so
// it always works in emails/screenshots.
function demoPanel(
  hb: number, fer: number, vd: number, lpnp: number, chol: number,
  glu: number, fe: number, b12: number, ttg = 2.0,
): CabinetAnalysisIndicator[] {
  const st = (v: number, lo: number | null, hi: number | null): string =>
    lo != null && v < lo ? "below_normal" : hi != null && v > hi ? "above_normal" : "normal";
  const d = (name: string, value: number, unit: string, ref: string, low: number | null, high: number | null): CabinetAnalysisIndicator => {
    const s = st(value, low, high);
    return { name, value: String(value), unit, reference_raw: ref, ref_low: low, ref_high: high, status: s, abnormal: s !== "normal" };
  };
  return [
    d("Гемоглобин", hb, "г/л", "120–150", 120, 150),
    d("Ферритин", fer, "нг/мл", "15–150", 15, 150),
    d("Витамин D", vd, "нг/мл", "30–100", 30, 100),
    d("ТТГ", ttg, "мЕд/л", "0.4–4.0", 0.4, 4.0),
    d("Холестерин ЛПНП", lpnp, "ммоль/л", "до 3.34", null, 3.34),
    d("Холестерин общий", chol, "ммоль/л", "до 5.2", null, 5.2),
    d("Глюкоза", glu, "ммоль/л", "3.9–5.9", 3.9, 5.9),
    d("Железо", fe, "мкмоль/л", "9–30", 9, 30),
    d("Витамин B12", b12, "пг/мл", "190–660", 190, 660),
  ];
}
function demoAnalysis(order_id: string, date: string, lab: string, inds: CabinetAnalysisIndicator[]): CabinetAnalysis {
  return {
    order_id, date, lab,
    types: ["ОАК", "Биохимия", "Железо", "Витамин D", "Щитовидная железа"],
    total: inds.length, out_of_range: inds.filter((i) => i.abnormal).length,
    pdf_url: "#", indicators: inds,
  };
}
const DEMO_CABINET: CabinetData = {
  ok: true, demo: true, patient: { sex: "female", age: 44 },
  dates: ["2026-01-12", "2026-03-20", "2026-06-08"],
  summary: { analyses_count: 3, tracked_count: 5, labs: ["Гемотест", "Инвитро"], from: "2026-01-12", to: "2026-06-08" },
  indicators: [
    { name: "Ферритин", unit: "нг/мл", reference_raw: "15–150", ref_low: 15, ref_high: 150, points: [
      { date: "2026-01-12", value: 7.7, status: "below_normal", abnormal: true }, { date: "2026-03-20", value: 19, status: "normal", abnormal: false }, { date: "2026-06-08", value: 41, status: "normal", abnormal: false }] },
    { name: "Гемоглобин", unit: "г/л", reference_raw: "120–150", ref_low: 120, ref_high: 150, points: [
      { date: "2026-01-12", value: 118, status: "below_normal", abnormal: true }, { date: "2026-03-20", value: 124, status: "normal", abnormal: false }, { date: "2026-06-08", value: 131, status: "normal", abnormal: false }] },
    { name: "Холестерин ЛПНП", unit: "ммоль/л", reference_raw: "до 3.34", ref_low: null, ref_high: 3.34, points: [
      { date: "2026-01-12", value: 3.91, status: "above_normal", abnormal: true }, { date: "2026-03-20", value: 3.6, status: "above_normal", abnormal: true }, { date: "2026-06-08", value: 3.2, status: "normal", abnormal: false }] },
    { name: "Витамин D", unit: "нг/мл", reference_raw: "30–100", ref_low: 30, ref_high: 100, points: [
      { date: "2026-01-12", value: 16, status: "below_normal", abnormal: true }, { date: "2026-03-20", value: 27, status: "below_normal", abnormal: true }, { date: "2026-06-08", value: 38, status: "normal", abnormal: false }] },
    { name: "ТТГ", unit: "мЕд/л", reference_raw: "0.4–4.0", ref_low: 0.4, ref_high: 4.0, points: [
      { date: "2026-01-12", value: 2.1, status: "normal", abnormal: false }, { date: "2026-03-20", value: 2.3, status: "normal", abnormal: false }, { date: "2026-06-08", value: 2.0, status: "normal", abnormal: false }] },
  ],
  analyses: [
    demoAnalysis("demo3", "2026-06-08", "Гемотест", demoPanel(131, 41, 38, 3.2, 5.3, 5.1, 18, 420)),
    demoAnalysis("demo2", "2026-03-20", "Инвитро", demoPanel(124, 19, 27, 3.6, 5.6, 5.4, 12, 310)),
    demoAnalysis("demo1", "2026-01-12", "Гемотест", demoPanel(118, 7.7, 16, 3.91, 5.0, 5.0, 12, 280)),
  ],
};

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function fmtDay(d: string | null, withYear = false): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const mi = parseInt(m, 10) - 1;
  return `${parseInt(day, 10)} ${MONTHS[mi] ?? ""}${withYear ? ` ${y.slice(2)}` : ""}`;
}
function fmtPeriod(from?: string | null, to?: string | null): string {
  if (!from || !to) return "";
  const f = from.split("-"), t = to.split("-");
  return `${MONTHS[parseInt(f[1], 10) - 1]} ${f[0]} — ${MONTHS[parseInt(t[1], 10) - 1]} ${t[0]}`;
}
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
function fmtVal(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)));
}
function dirArrow(status: string): string {
  const s = (status || "").toLowerCase();
  if (/(high|above|выше|критич.*выс)/.test(s)) return "↑";
  if (/(low|below|ниже|критич.*низ)/.test(s)) return "↓";
  return "";
}
// "came to normal" = first reading out of range, latest in range. The win we sell.
function cameToNormal(ind: CabinetIndicator): boolean {
  if (ind.points.length < 2) return false;
  return ind.points[0].abnormal && !ind.points[ind.points.length - 1].abnormal;
}
// Clean "norma" line for the dynamics table; never dumps "см. комментарий…" prose.
function refText(ind: { ref_low: number | null; ref_high: number | null; reference_raw: string; unit: string }): string {
  const u = ind.unit ? ` ${ind.unit}` : "";
  if (ind.ref_low != null && ind.ref_high != null) return `норма ${fmtVal(ind.ref_low)}–${fmtVal(ind.ref_high)}${u}`;
  if (ind.ref_high != null) return `норма до ${fmtVal(ind.ref_high)}${u}`;
  if (ind.ref_low != null) return `норма от ${fmtVal(ind.ref_low)}${u}`;
  const raw = (ind.reference_raw || "").trim();
  if (raw && raw.length <= 22 && !/коммент/i.test(raw)) return `норма ${raw}${u}`;
  return ind.unit ? `ед.: ${ind.unit}` : "норма не указана";
}
// Compact range for the per-analysis detail table's "Норма" column.
function refShort(ind: CabinetAnalysisIndicator): string {
  if (ind.ref_low != null && ind.ref_high != null) return `${fmtVal(ind.ref_low)}–${fmtVal(ind.ref_high)}`;
  if (ind.ref_high != null) return `до ${fmtVal(ind.ref_high)}`;
  if (ind.ref_low != null) return `от ${fmtVal(ind.ref_low)}`;
  const raw = (ind.reference_raw || "").trim();
  if (raw && raw.length <= 14 && !/коммент/i.test(raw)) return raw;
  return "—";
}

// ───────────────────────── tab 1: список анализов ─────────────────────────
function AnalysesList({ data, onSelect }: { data: CabinetData; onSelect: (id: string) => void }) {
  return (
    <div>
      <Link
        href="/"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
      >
        <Plus className="h-5 w-5" /> Добавить анализ
      </Link>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Загрузите новый анализ — он сам встанет в вашу историю
      </p>

      <h2 className="mb-3 mt-7 text-base font-semibold text-foreground">
        Все мои анализы <span className="text-muted-foreground">· {data.analyses.length}</span>
      </h2>
      <div className="space-y-2.5">
        {data.analyses.map((a) => (
          <button
            key={a.order_id}
            onClick={() => onSelect(a.order_id)}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition hover:border-primary/50 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground">{fmtDay(a.date, true)}</div>
              <div className="truncate text-sm text-muted-foreground">
                {a.lab || "Лаборатория"}
                {a.types.length > 0 && ` · ${a.types.slice(0, 3).join(", ")}`}
              </div>
            </div>
            {typeof a.out_of_range === "number" && a.out_of_range > 0 ? (
              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                {a.out_of_range} {plural(a.out_of_range, "отклонение", "отклонения", "отклонений")}
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                в норме
              </span>
            )}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
        {data.analyses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            Здесь появятся все ваши анализы. Нажмите «Добавить анализ», чтобы загрузить первый.
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── analysis detail (drill-in) ─────────────────────────
function AnalysisDetail({ analysis, onBack }: { analysis: CabinetAnalysis; onBack: () => void }) {
  const inds = analysis.indicators ?? [];
  const oor = inds.filter((i) => i.abnormal).length;
  const hasReport = !!analysis.pdf_url && analysis.pdf_url !== "#";
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Назад к анализам
      </button>

      {/* summary header */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-lg font-bold text-foreground">{fmtDay(analysis.date, true)}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{analysis.lab || "Лаборатория"}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {inds.length} {plural(inds.length, "показатель", "показателя", "показателей")}
          </span>
          {oor > 0 ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
              {oor} {plural(oor, "отклонение", "отклонения", "отклонений")}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">всё в норме</span>
          )}
          {analysis.types.length > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {analysis.types.slice(0, 4).join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* report link */}
      <a
        href={analysis.pdf_url}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition ${
          hasReport ? "bg-primary text-primary-foreground hover:opacity-90" : "cursor-default border border-dashed border-border bg-card text-muted-foreground"
        }`}
        {...(hasReport ? {} : { onClick: (e) => e.preventDefault() })}
      >
        <Download className="h-4 w-4" />
        {hasReport ? "Открыть отчёт и скачать PDF" : "Отчёт в демо недоступен"}
        {hasReport && <ArrowRight className="h-4 w-4" />}
      </a>

      {/* indicators table */}
      <h3 className="mb-2 mt-6 text-base font-semibold text-foreground">Показатели</h3>
      {inds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Показатели этого анализа недоступны. Откройте полный отчёт.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Показатель</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Результат</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Норма</th>
              </tr>
            </thead>
            <tbody>
              {inds.map((i, idx) => (
                <tr key={`${i.name}-${idx}`} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 align-top text-[14px] font-medium leading-tight text-foreground">{i.name}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-right align-top text-[14px] font-semibold tabular-nums ${i.abnormal ? "text-red-600" : "text-foreground"}`}>
                    {i.value}{i.abnormal && <span className="ml-0.5 text-[11px]">{dirArrow(i.status)}</span>}
                    {i.unit && <span className="ml-1 text-[11px] font-normal text-muted-foreground">{i.unit}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs text-muted-foreground tabular-nums">{refShort(i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── tab 2: динамика (таблица) ─────────────────────────
function DynamicsTable({ data }: { data: CabinetData }) {
  // Columns oldest → newest (left → right), the natural time order. The latest
  // ("сейчас") sits on the right; auto-scroll there so the current value shows first.
  const cols = [...(data.dates || [])];
  const multiYear = new Set((data.dates || []).map((d) => d.slice(0, 4))).size > 1;
  const indicators = data.indicators.filter((i) => i.points.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  if (indicators.length === 0 || cols.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        Динамика появится, когда у вас будет хотя бы один разобранный анализ.
      </div>
    );
  }

  const byDate = (ind: CabinetIndicator) => {
    const m = new Map<string, CabinetPoint>();
    for (const p of ind.points) if (p.date) m.set(p.date, p);
    return m;
  };
  const lastIdx = cols.length - 1;

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Слева — показатель и его норма. В колонках — даты анализов по порядку, свежий справа.
        <span className="ml-1 inline-flex items-center gap-1 align-middle">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100" /> — вне нормы.
        </span>
      </p>
      <div ref={scrollRef} className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-20 min-w-[150px] max-w-[160px] bg-card px-3.5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Показатель
              </th>
              {cols.map((d, i) => (
                <th
                  key={d}
                  className={`min-w-[66px] px-2.5 py-3 text-center text-xs font-semibold ${
                    i === lastIdx ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {fmtDay(d, multiYear)}
                  {i === lastIdx && <div className="text-[10px] font-normal text-muted-foreground">сейчас</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind) => {
              const m = byDate(ind);
              const win = cameToNormal(ind);
              return (
                <tr key={ind.name} className="border-b border-border/60 last:border-0">
                  <th className="sticky left-0 z-10 min-w-[150px] max-w-[160px] bg-card px-3.5 py-2.5 text-left align-top font-normal">
                    <div className="text-[14px] font-semibold leading-tight text-foreground">{ind.name}</div>
                    <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{refText(ind)}</div>
                    {win && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Check className="h-3 w-3" /> пришёл в норму
                      </span>
                    )}
                  </th>
                  {cols.map((d) => {
                    const p = m.get(d);
                    if (!p) return <td key={d} className="px-2.5 py-2.5 text-center text-muted-foreground/40">·</td>;
                    return (
                      <td
                        key={d}
                        className={`px-2.5 py-2.5 text-center text-[14px] font-semibold tabular-nums ${
                          p.abnormal ? "bg-red-50 text-red-600" : "text-foreground"
                        }`}
                      >
                        {fmtVal(p.value)}
                        {p.abnormal && <span className="ml-0.5 text-[11px]">{dirArrow(p.status)}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Листайте таблицу вбок, чтобы увидеть все даты
      </p>

      {/* discuss CTA — feature sold with the subscription, no per-use price */}
      <button
        onClick={() => document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/[0.06] px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        <MessageCircle className="h-4 w-4" /> Обсудить динамику показателей
      </button>
    </div>
  );
}

export default function CabinetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  // Demo renders entirely client-side (no backend) so it always works for screenshots.
  const [data, setData] = useState<CabinetData | null>(token === "demo" ? DEMO_CABINET : null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "dynamics">("list");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (token === "demo") return;
    getCabinet(token).then(setData).catch(() => setError("Ссылка недействительна или устарела."));
  }, [token]);

  const selectedAnalysis = selectedOrderId
    ? (data?.analyses.find((a) => a.order_id === selectedOrderId) ?? null)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {error && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!error && !data && (
          <div className="py-20 text-center text-sm text-muted-foreground">Загружаем ваши анализы…</div>
        )}

        {data && (
          <>
            {/* header */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Личный кабинет здоровья</h1>
                <p className="text-sm text-muted-foreground">
                  {data.summary.analyses_count} {plural(data.summary.analyses_count, "анализ", "анализа", "анализов")}
                  {data.summary.from && ` · ${fmtPeriod(data.summary.from, data.summary.to)}`}
                  {data.summary.labs.length > 0 && ` · ${data.summary.labs.join(", ")}`}
                </p>
              </div>
            </div>

            {data.demo && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                Демонстрационный кабинет с примером данных.
              </div>
            )}

            {selectedAnalysis ? (
              <div className="mt-6">
                <AnalysisDetail analysis={selectedAnalysis} onBack={() => setSelectedOrderId(null)} />
              </div>
            ) : (
              <>
                {/* tabs / menu */}
                <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5">
                  <button
                    onClick={() => setTab("list")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      tab === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ListChecks className="h-4 w-4" /> Мои анализы
                  </button>
                  <button
                    onClick={() => setTab("dynamics")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      tab === "dynamics" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <TableProperties className="h-4 w-4" /> Динамика показателей
                  </button>
                </div>

                <div className="mt-6">
                  {tab === "list"
                    ? <AnalysesList data={data} onSelect={setSelectedOrderId} />
                    : <DynamicsTable data={data} />}
                </div>

                {/* subscription CTA — the cabinet is the product we sell */}
                <section id="subscribe" className="mt-10 scroll-mt-20 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-6">
                  <h3 className="text-lg font-bold text-foreground">Следите за здоровьем весь год</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Годовая подписка: все анализы из любой лаборатории в одной ленте, динамика каждого показателя,
                    обсуждение трендов с AI-ассистентом и напоминания, когда пора пересдать.
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                    Оформить подписку <ArrowRight className="h-4 w-4" />
                  </button>
                </section>
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

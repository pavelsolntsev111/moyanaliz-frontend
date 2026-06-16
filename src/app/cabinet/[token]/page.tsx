"use client";

import { use, useEffect, useState } from "react";
import { Activity, FileText, Plus, TableProperties, ListChecks, Lock, Check, ArrowRight } from "lucide-react";
import { getCabinet, type CabinetData, type CabinetIndicator, type CabinetPoint } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Self-contained demo (token "demo") — a marketing mockup for the subscription
// campaign; renders without any backend call so it always works in emails/screenshots.
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
    { order_id: "demo3", date: "2026-06-08", lab: "Гемотест", types: ["ОАК", "Биохимия", "Железо", "Витамин D"], total: 64, out_of_range: 1, pdf_url: "#" },
    { order_id: "demo2", date: "2026-03-20", lab: "Инвитро", types: ["ОАК", "Биохимия", "Железо"], total: 58, out_of_range: 3, pdf_url: "#" },
    { order_id: "demo1", date: "2026-01-12", lab: "Гемотест", types: ["ОАК", "Биохимия", "Железо", "Витамин D", "Щитовидная железа"], total: 71, out_of_range: 4, pdf_url: "#" },
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

// "came to normal" = first reading was out of range, latest is in range. The win we sell.
function cameToNormal(ind: CabinetIndicator): boolean {
  if (ind.points.length < 2) return false;
  return ind.points[0].abnormal && !ind.points[ind.points.length - 1].abnormal;
}
function fmtVal(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)));
}
// Clean "norma" line: build from numeric bounds when available, otherwise show a
// short raw range, but never dump a verbose "см. комментарий…" string into the cell.
function refText(ind: CabinetIndicator): string {
  const u = ind.unit ? ` ${ind.unit}` : "";
  if (ind.ref_low != null && ind.ref_high != null) return `норма ${fmtVal(ind.ref_low)}–${fmtVal(ind.ref_high)}${u}`;
  if (ind.ref_high != null) return `норма до ${fmtVal(ind.ref_high)}${u}`;
  if (ind.ref_low != null) return `норма от ${fmtVal(ind.ref_low)}${u}`;
  const raw = (ind.reference_raw || "").trim();
  if (raw && raw.length <= 22 && !/коммент/i.test(raw)) return `норма ${raw}${u}`;
  return ind.unit ? `ед.: ${ind.unit}` : "норма не указана";
}
function dirArrow(status: string): string {
  const s = (status || "").toLowerCase();
  if (/(high|above|выше|критич.*выс)/.test(s)) return "↑";
  if (/(low|below|ниже|критич.*низ)/.test(s)) return "↓";
  return "";
}

// ───────────────────────── tab 1: список анализов ─────────────────────────
function AnalysesList({ data }: { data: CabinetData }) {
  return (
    <div>
      <a
        href="/"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
      >
        <Plus className="h-5 w-5" /> Добавить анализ
      </a>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Загрузите новый анализ — он сам встанет в вашу историю
      </p>

      <h2 className="mb-3 mt-7 text-base font-semibold text-foreground">
        Все мои анализы <span className="text-muted-foreground">· {data.analyses.length}</span>
      </h2>
      <div className="space-y-2.5">
        {data.analyses.map((a) => (
          <a
            key={a.order_id}
            href={a.pdf_url}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5 transition hover:border-primary/50 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground">
                {fmtDay(a.date, true)}
              </div>
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
          </a>
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

// ───────────────────────── tab 2: динамика (таблица) ─────────────────────────
function DynamicsTable({ data }: { data: CabinetData }) {
  // Columns: dates newest-first so the current value is the first thing you see.
  const cols = [...(data.dates || [])].reverse();
  const multiYear = new Set((data.dates || []).map((d) => d.slice(0, 4))).size > 1;
  const indicators = data.indicators.filter((i) => i.points.length > 0);

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

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Слева — показатель и его норма. В колонках — даты анализов (от новых к старым).
        <span className="ml-1 inline-flex items-center gap-1 align-middle">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100" /> — вне нормы.
        </span>
      </p>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
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
                    i === 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {fmtDay(d, multiYear)}
                  {i === 0 && <div className="text-[10px] font-normal text-muted-foreground">сейчас</div>}
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
                    <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {refText(ind)}
                    </div>
                    {win && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Check className="h-3 w-3" /> пришёл в норму
                      </span>
                    )}
                  </th>
                  {cols.map((d) => {
                    const p = m.get(d);
                    if (!p) {
                      return <td key={d} className="px-2.5 py-2.5 text-center text-muted-foreground/40">·</td>;
                    }
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
        Прокрутите таблицу вбок, чтобы увидеть более ранние анализы →
      </p>
    </div>
  );
}

export default function CabinetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<CabinetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "dynamics">("list");

  useEffect(() => {
    if (token === "demo") { setData(DEMO_CABINET); return; }
    getCabinet(token).then(setData).catch(() => setError("Ссылка недействительна или устарела."));
  }, [token]);

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
              {tab === "list" ? <AnalysesList data={data} /> : <DynamicsTable data={data} />}
            </div>

            {/* subscription CTA — the cabinet is the product we sell */}
            <section className="mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-6">
              <h3 className="text-lg font-bold text-foreground">Следите за здоровьем весь год</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Годовая подписка: все анализы из любой лаборатории в одной ленте, динамика каждого показателя
                и напоминания, когда пора пересдать. Загружайте сколько угодно анализов.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Оформить подписку <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

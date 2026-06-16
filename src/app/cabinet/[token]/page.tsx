"use client";

import { use, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp, TrendingDown, Minus, FileText, ArrowRight, Lock } from "lucide-react";
import { getCabinet, type CabinetData, type CabinetIndicator } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Self-contained demo (token "demo") — a marketing mockup for the subscription
// campaign; renders without any backend call so it always works in emails/screenshots.
const DEMO_CABINET: CabinetData = {
  ok: true, demo: true, patient: { sex: "female", age: 44 },
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
function fmtDate(d: string | null): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  const mi = parseInt(m, 10) - 1;
  return `${parseInt(day, 10)} ${MONTHS[mi] ?? ""}`;
}
function fmtPeriod(from?: string | null, to?: string | null): string {
  if (!from || !to) return "";
  const f = from.split("-"), t = to.split("-");
  return `${MONTHS[parseInt(f[1], 10) - 1]} ${f[0]} — ${MONTHS[parseInt(t[1], 10) - 1]} ${t[0]}`;
}

function Trend({ ind }: { ind: CabinetIndicator }) {
  if (ind.points.length < 2) return null;
  const first = ind.points[0].value;
  const last = ind.points[ind.points.length - 1].value;
  const lastAbn = ind.points[ind.points.length - 1].abnormal;
  const firstAbn = ind.points[0].abnormal;
  // "improving" = moved from abnormal toward normal
  const improving = firstAbn && !lastAbn;
  if (improving) return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><TrendingUp className="h-3.5 w-3.5" /> пришёл в норму</span>;
  if (last > first) return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> растёт</span>;
  if (last < first) return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><TrendingDown className="h-3.5 w-3.5" /> снижается</span>;
  return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3.5 w-3.5" /> стабильно</span>;
}

function IndicatorChart({ ind }: { ind: CabinetIndicator }) {
  const data = ind.points.map((p) => ({ ...p, label: fmtDate(p.date) }));
  const latest = ind.points[ind.points.length - 1];
  const vals = ind.points.map((p) => p.value);
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const lo = ind.ref_low, hi = ind.ref_high;
  // Domain follows the VALUES, extended only to the NEARBY reference threshold —
  // so a recovery (e.g. ferritin 7.7→41) isn't crushed by a far-off ceiling (150).
  const bounds = [vmin, vmax];
  if (lo != null && lo <= vmax * 1.8) bounds.push(lo);
  if (hi != null && hi <= vmax * 1.8 && hi >= vmin * 0.4) bounds.push(hi);
  let ymin = Math.min(...bounds), ymax = Math.max(...bounds);
  const pad = (ymax - ymin) * 0.18 || ymax * 0.1 || 1;
  ymin = Math.max(0, ymin - pad);
  ymax = ymax + pad;
  const fmtTick = (v: number) => {
    const n = Number(v);
    return Number.isInteger(n) ? String(n) : n.toFixed(n < 10 ? 1 : 0);
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{ind.name}</h3>
          <p className="text-xs text-muted-foreground">Норма: {ind.reference_raw || "—"} {ind.unit}</p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold ${latest.abnormal ? "text-red-600" : "text-emerald-600"}`}>{latest.value}</span>
            <span className="text-xs text-muted-foreground">{ind.unit}</span>
          </div>
          <Trend ind={ind} />
        </div>
      </div>
      <div className="mt-3 h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 14, left: -8, bottom: 0 }}>
            {(lo != null || hi != null) && (
              <ReferenceArea
                y1={lo ?? ymin}
                y2={hi ?? ymax}
                fill="#10b981"
                fillOpacity={0.1}
              />
            )}
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis domain={[ymin, ymax]} tickFormatter={fmtTick} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={34} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              formatter={(v: number) => [`${v} ${ind.unit}`, ind.name]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00b4bc"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={{ r: 4, fill: "#00b4bc", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CabinetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<CabinetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token === "demo") { setData(DEMO_CABINET); return; }
    getCabinet(token).then(setData).catch(() => setError("Ссылка недействительна или устарела."));
  }, [token]);

  const tracked = (data?.indicators ?? []).filter((i) => i.points.length >= 2);
  const snapshot = (data?.indicators ?? []).filter((i) => i.points.length < 2 && i.points[0]?.abnormal);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
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
                  {data.summary.analyses_count} {data.summary.analyses_count === 1 ? "анализ" : "анализа"}
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

            {/* dynamics */}
            {tracked.length > 0 ? (
              <section className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Динамика показателей</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tracked.map((ind) => <IndicatorChart key={ind.name} ind={ind} />)}
                </div>
              </section>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                Динамика появится, когда вы загрузите второй анализ — мы построим график изменения каждого показателя во времени.
              </div>
            )}

            {/* latest abnormal snapshot */}
            {snapshot.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Отклонения в последнем анализе</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {snapshot.slice(0, 8).map((ind) => {
                    const p = ind.points[ind.points.length - 1];
                    return (
                      <div key={ind.name} className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
                        <span className="text-sm text-foreground">{ind.name}</span>
                        <span className="text-sm font-semibold text-red-600">{p.value} {ind.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* analyses list */}
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Ваши анализы</h2>
              <div className="space-y-2">
                {data.analyses.map((a) => (
                  <a
                    key={a.order_id}
                    href={a.pdf_url}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{fmtDate(a.date)} {a.date?.slice(0, 4)} · {a.lab || "лаборатория"}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.types.slice(0, 4).join(", ")}{a.types.length > 4 ? "…" : ""}</div>
                    </div>
                    {typeof a.out_of_range === "number" && a.out_of_range > 0 && (
                      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{a.out_of_range} откл.</span>
                    )}
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>

            {/* subscription CTA — the cabinet is the product we sell */}
            <section className="mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-6">
              <h3 className="text-lg font-bold text-foreground">Следите за здоровьем весь год</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Годовая подписка: все анализы из любой лаборатории в одной ленте, динамика каждого показателя,
                AI-объяснение трендов и напоминания, когда пора пересдать. Загружайте сколько угодно анализов.
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

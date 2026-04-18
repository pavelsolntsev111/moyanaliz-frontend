"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyReport {
  date: string;
  revenue_rub: number;
  net_revenue_rub: number;
  ad_cost_rub: number;
  llm_cost_rub: number;
  clicks: number;
  cpc_rub: number | null;
  file_uploads: number;
  purchases: number;
  conv_click_to_upload: number | null;
  conv_click_to_purchase: number | null;
  profit_rub: number;
  collected_at: string | null;
}

type Period = "yesterday" | "7d" | "30d" | "custom";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const STORAGE_KEY = "finances_auth";

function toBase64(s: string) {
  return typeof window !== "undefined" ? btoa(unescape(encodeURIComponent(s))) : "";
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function fmtRub(v: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v) + " ₽";
}

function fmtPct(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return (v * 100).toFixed(1) + "%";
}

function fmtNum(v: number): string {
  return new Intl.NumberFormat("ru-RU").format(v);
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function mskToday(): Date {
  // Approximate Moscow date by using UTC+3 offset
  const now = new Date();
  const mskOffset = 3 * 60; // minutes
  const localOffset = -now.getTimezoneOffset();
  const diff = mskOffset - localOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function aggregate(rows: DailyReport[]) {
  if (rows.length === 0) return null;
  const sum = (key: keyof DailyReport) =>
    rows.reduce((acc, r) => acc + (typeof r[key] === "number" ? (r[key] as number) : 0), 0);

  const revenue = sum("revenue_rub");
  const net_revenue = sum("net_revenue_rub");
  const ad_cost = sum("ad_cost_rub");
  const llm_cost = sum("llm_cost_rub");
  const clicks = sum("clicks");
  const file_uploads = sum("file_uploads");
  const purchases = sum("purchases");
  const profit = sum("profit_rub");

  return {
    revenue,
    net_revenue,
    ad_cost,
    llm_cost,
    clicks,
    cpc: clicks > 0 ? ad_cost / clicks : null,
    file_uploads,
    purchases,
    conv_upload: clicks > 0 ? file_uploads / clicks : null,
    conv_purchase: clicks > 0 ? purchases / clicks : null,
    profit,
  };
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  sub,
  color = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "default" | "green" | "red" | "muted";
}) {
  const valueColor =
    color === "green"
      ? "text-green-600"
      : color === "red"
      ? "text-red-500"
      : color === "muted"
      ? "text-slate-500"
      : "text-slate-900";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 shadow-sm">
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold ${valueColor}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

function LoginForm({ onLogin }: { onLogin: (login: string, pass: string) => void }) {
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Финансы</h1>
        <p className="text-sm text-slate-500 mb-6">Введите логин и пароль администратора</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00b4bc]/30 focus:border-[#00b4bc]"
            onKeyDown={(e) => e.key === "Enter" && onLogin(login, pass)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00b4bc]/30 focus:border-[#00b4bc]"
            onKeyDown={(e) => e.key === "Enter" && onLogin(login, pass)}
          />
          <button
            onClick={() => {
              if (!login || !pass) {
                setError("Введите логин и пароль");
                return;
              }
              setError("");
              onLogin(login, pass);
            }}
            className="bg-[#00b4bc] hover:bg-[#009aa1] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function FinancesPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const [period, setPeriod] = useState<Period>("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [data, setData] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load auth from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setAuthToken(stored);
  }, []);

  // Compute start/end dates from selected period
  const { startDate, endDate } = useMemo(() => {
    const today = mskToday();
    const yesterday = addDays(today, -1);

    if (period === "yesterday") {
      const d = toDateString(yesterday);
      return { startDate: d, endDate: d };
    }
    if (period === "7d") {
      return { startDate: toDateString(addDays(yesterday, -6)), endDate: toDateString(yesterday) };
    }
    if (period === "30d") {
      return { startDate: toDateString(addDays(yesterday, -29)), endDate: toDateString(yesterday) };
    }
    // custom
    return { startDate: customStart, endDate: customEnd };
  }, [period, customStart, customEnd]);

  const fetchData = useCallback(
    async (token: string) => {
      if (!startDate || !endDate) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `${API_URL}/api/v1/finances/daily?start=${startDate}&end=${endDate}`,
          {
            headers: {
              Authorization: `Basic ${token}`,
            },
          }
        );
        if (resp.status === 401) {
          setAuthError(true);
          sessionStorage.removeItem(STORAGE_KEY);
          setAuthToken(null);
          return;
        }
        if (!resp.ok) {
          setError(`Ошибка сервера: ${resp.status}`);
          return;
        }
        const json: DailyReport[] = await resp.json();
        setData(json);
      } catch (e) {
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  // Fetch when auth or period changes
  useEffect(() => {
    if (authToken) {
      fetchData(authToken);
    }
  }, [authToken, fetchData]);

  const handleLogin = useCallback(
    async (login: string, pass: string) => {
      const token = toBase64(`${login}:${pass}`);
      // Verify credentials immediately
      try {
        const today = mskToday();
        const yesterday = toDateString(addDays(today, -1));
        const resp = await fetch(
          `${API_URL}/api/v1/finances/daily?start=${yesterday}&end=${yesterday}`,
          { headers: { Authorization: `Basic ${token}` } }
        );
        if (resp.status === 401) {
          setAuthError(true);
          return;
        }
        setAuthError(false);
        sessionStorage.setItem(STORAGE_KEY, token);
        setAuthToken(token);
      } catch {
        setAuthError(true);
      }
    },
    []
  );

  // Not authenticated
  if (!authToken) {
    return (
      <LoginForm
        onLogin={handleLogin}
      />
    );
  }

  const totals = aggregate(data);

  // Chart data
  const chartData = data.map((r) => ({
    date: formatDate(r.date),
    "Поступления": r.revenue_rub,
    "Чистые поступления": r.net_revenue_rub,
    "Прибыль": r.profit_rub,
    "Реклама": r.ad_cost_rub,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg">Финансы</span>
            <span className="text-xs text-slate-400 hidden sm:block">Мой Анализ</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setAuthToken(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Period selector */}
        <div className="flex flex-wrap items-center gap-2">
          {(["yesterday", "7d", "30d", "custom"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-[#00b4bc] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p === "yesterday" && "Вчера"}
              {p === "7d" && "7 дней"}
              {p === "30d" && "30 дней"}
              {p === "custom" && "Период"}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#00b4bc]/30 focus:border-[#00b4bc]"
              />
              <span className="text-slate-400 text-sm">—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#00b4bc]/30 focus:border-[#00b4bc]"
              />
            </div>
          )}
          {loading && (
            <span className="text-xs text-slate-400 ml-2 animate-pulse">Загрузка…</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        {totals && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <KpiCard label="Поступления" value={fmtRub(totals.revenue)} />
            <KpiCard
              label="Чистые поступления"
              value={fmtRub(totals.net_revenue)}
              sub="после −11,5%"
            />
            <KpiCard
              label="Прибыль"
              value={fmtRub(totals.profit)}
              color={totals.profit >= 0 ? "green" : "red"}
              sub="до прочих расходов"
            />
            <KpiCard label="Реклама" value={fmtRub(totals.ad_cost)} color="muted" />
            <KpiCard label="LLM" value={fmtRub(totals.llm_cost)} color="muted" />
            <KpiCard label="Клики" value={fmtNum(totals.clicks)} />
            <KpiCard
              label="CPC"
              value={totals.cpc !== null ? fmtRub(totals.cpc) : "—"}
              sub="руб/клик"
            />
            <KpiCard label="Загрузки" value={fmtNum(totals.file_uploads)} sub="file_uploaded" />
            <KpiCard label="Покупки" value={fmtNum(totals.purchases)} sub="payment_done" />
            <KpiCard
              label="Конв. клик→загрузка"
              value={fmtPct(totals.conv_upload)}
            />
            <KpiCard
              label="Конв. клик→покупка"
              value={fmtPct(totals.conv_purchase)}
            />
          </div>
        )}

        {/* Chart */}
        {data.length > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Динамика по дням</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)
                  }
                />
                <Tooltip
                  formatter={(value: number, name: string) => [fmtRub(value), name]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="Поступления"
                  stroke="#00b4bc"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Чистые поступления"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="Прибыль"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Реклама"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily table */}
        {data.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Данные по дням ({data.length} {data.length === 1 ? "день" : data.length < 5 ? "дня" : "дней"})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Дата</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Поступления</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Чистые</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Реклама</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">LLM</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Прибыль</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Клики</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">CPC</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Загрузки</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Покупки</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Кл→Загр</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Кл→Пок</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().map((r, i) => (
                    <tr
                      key={r.date}
                      className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${
                        i % 2 === 0 ? "" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(r.date)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700 whitespace-nowrap">
                        {fmtRub(r.revenue_rub)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">
                        {fmtRub(r.net_revenue_rub)}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-600 whitespace-nowrap">
                        {fmtRub(r.ad_cost_rub)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400 whitespace-nowrap">
                        {fmtRub(r.llm_cost_rub)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-semibold whitespace-nowrap ${
                          r.profit_rub >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {fmtRub(r.profit_rub)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">
                        {fmtNum(r.clicks)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500 whitespace-nowrap">
                        {r.cpc_rub !== null ? fmtRub(r.cpc_rub) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">
                        {fmtNum(r.file_uploads)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">
                        {fmtNum(r.purchases)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500 whitespace-nowrap">
                        {fmtPct(r.conv_click_to_upload)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500 whitespace-nowrap">
                        {fmtPct(r.conv_click_to_purchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400 shadow-sm">
            Нет данных за выбранный период
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center pb-4">
          Данные обновляются ежедневно в 03:00 МСК за предыдущий день
        </p>
      </div>
    </div>
  );
}

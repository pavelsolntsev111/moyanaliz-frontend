"use client";

/**
 * Демо расшифровки бак-посева для Med-Click.
 *
 * Страница = макет окружения будущего портала о антибиотикорезистентности
 * (один экран: шапка + герой) + рабочий виджет расшифровки.
 *
 * ДИЗАЙН. Светлая схема: тема просветительская и медицинская, тёмный контур
 * читался как «техно», а не как «здоровье». Герой — бумажный тон #F7F5FB с
 * мягкими радиальными подсветками фирменных цветов заказчика (#7119FF, #00C3C8)
 * вместо плоской заливки; отчёт — на чистом белом, отделён волосяной границей.
 * Палитра med-click.ru сохранена, но живёт в акцентах, подсветках и линиях, а не
 * в больших плоскостях.
 *
 * Поверхности — белое стекло (white/70 + backdrop-blur) с волосяной границей и
 * мягкими послойными тенями, без жёстких чёрных боксов. Контент — асимметричная
 * сетка: липкая узкая колонка-сводка + широкая колонка отчёта. Таблица
 * минималистична: ни одной вертикальной линейки, только горизонтальные
 * разделители и переход фона на ховере.
 *
 * Файл никуда не сохраняется — эндпоинт эфемерный (см. app/routers/demo_posev.py).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────── типы ответа бэкенда ───────────────────────────

type Verdict = "S" | "I" | "R";

interface AbxItem {
  drug: string;
  drug_class?: string | null;
  verdict: Verdict;
  mic?: string | null;
  comment?: string | null;
}

interface PosevReport {
  doc_kind?: string | null;
  material?: string | null;
  collected_at?: string | null;
  patient?: { sex?: "male" | "female" | null; age?: number | null };
  growth?: { status?: string; text?: string } | null;
  pathogens?: {
    name_latin?: string;
    name_ru?: string;
    count?: string | null;
    significance?: string;
    significance_text?: string;
    about?: string;
  }[];
  antibiogram?: { pathogen?: string; items?: AbxItem[] }[];
  phages?: { name?: string; verdict?: Verdict | null; comment?: string | null }[];
  resistance?: {
    tested?: number;
    s?: number;
    i?: number;
    r?: number;
    multi_resistant?: boolean;
    r_classes?: number;
    text?: string;
  };
  plain_summary?: string;
  sir_explainer?: { code: Verdict; title: string; text: string }[];
  amr_notes?: string[];
  questions_for_doctor?: string[];
  red_flags?: string[];
  no_prescription_note?: string;
  disclaimer?: string;
}

interface ApiOk {
  ok: true;
  report: PosevReport;
  meta: { model?: string; elapsed_ms?: number; stored: boolean };
}
interface ApiReject {
  ok: false;
  reason: string;
  meta?: { model?: string; elapsed_ms?: number };
}

// ─── категории чувствительности: приглушённые тона, не сигнальный светофор ───

const V: Record<
  Verdict,
  { tile: string; chip: string; label: string; short: string; bar: string }
> = {
  S: {
    tile: "bg-[#0B6E5D] text-white",
    chip: "bg-[#EAF4F1] text-[#0A6153]",
    label: "Чувствителен",
    short: "чувствителен",
    bar: "bg-[#0B6E5D]",
  },
  I: {
    tile: "bg-[#8A6A2A] text-white",
    chip: "bg-[#F8F1E1] text-[#7A5920]",
    label: "Чувствителен при увел. экспозиции",
    short: "при увел. экспозиции",
    bar: "bg-[#B08A3C]",
  },
  R: {
    tile: "bg-[#8F3A2F] text-white",
    chip: "bg-[#F9ECE9] text-[#8A372C]",
    label: "Устойчив",
    short: "устойчив",
    bar: "bg-[#8F3A2F]",
  },
};

const STAGES = [
  "Читаем бланк",
  "Определяем возбудителя и количество",
  "Разбираем таблицу чувствительности",
  "Сверяем трактовку категорий S / I / R",
  "Проверяем формулировки",
];

const SAMPLES = [
  { file: "/demo/posev-sample-1.png", label: "Посев мочи", meta: "E. coli · БЛРС" },
  { file: "/demo/posev-sample-2.png", label: "Посев раны", meta: "MRSA · бактериофаги" },
];

const AUTH_KEY = "posev_demo_ok";

const CSS = `
.pd-display { font-family: var(--font-display), system-ui, sans-serif; letter-spacing: -0.02em; }
.pd-eyebrow { font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; }
.pd-row { transition: background-color .18s ease; }
.pd-row:hover { background-color: rgba(22,20,28,.022); }
.pd-nav-link { transition: color .18s ease, border-color .18s ease; }
.pd-jump { transition: color .18s ease, padding-left .18s ease; }
.pd-jump:hover { color: #16141C; padding-left: 4px; }
.pd-sample { transition: background-color .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.pd-sample:hover { border-color: rgba(101,18,224,.28); box-shadow: 0 6px 20px -8px rgba(22,20,28,.16); transform: translateX(2px); }
.pd-drop { transition: border-color .2s ease, background-color .2s ease; }
.pd-btn { transition: background-color .2s ease, transform .12s ease, box-shadow .2s ease, border-color .2s ease; }
.pd-btn:active { transform: translateY(1px); }
.pd-fade { animation: pdFade .5s cubic-bezier(.2,.7,.2,1) both; }
@keyframes pdFade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@media print {
  .pd-noprint { display: none !important; }
  .pd-rail { display: none !important; }
}
`;

// ═══════════════════════════════ страница ═══════════════════════════════

export default function PosevDemoClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {checking ? (
        <div className="min-h-screen bg-[#F7F5FB]" />
      ) : authed ? (
        <Portal password={password} />
      ) : (
        <Gate
          onPass={(pw) => {
            sessionStorage.setItem(AUTH_KEY, pw);
            setPassword(pw);
            setAuthed(true);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────── общие детали оболочки ───────────────────────────

/** Мягкие подсветки фирменными цветами вместо плоской заливки. */
function Glow() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-64 -top-80 h-[900px] w-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 45% 45%, rgba(113,25,255,.11), rgba(113,25,255,.05) 46%, rgba(113,25,255,0) 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-64 top-24 h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,195,200,.13), rgba(0,195,200,.04) 48%, rgba(0,195,200,0) 74%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.85))" }}
      />
    </>
  );
}

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-[11px]";
  return (
    <div
      className={`${box} pd-display grid shrink-0 place-items-center rounded-xl font-extrabold tracking-[0.04em] text-white`}
      style={{
        background: "linear-gradient(140deg, #7119FF, #4B10C8)",
        boxShadow: "0 6px 18px -6px rgba(75,16,200,.5)",
      }}
    >
      АМР
    </div>
  );
}

// ─────────────────────────── пароль ───────────────────────────

function Gate({ onPass }: { onPass: (pw: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/demo/posev/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Неверный пароль" : "Сервис недоступен");
      onPass(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось проверить пароль");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#F7F5FB] px-6 py-16 text-[#16141C]">
      <Glow />
      <div className="relative mx-auto grid w-full max-w-[1000px] gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <div className="mb-8 flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="pd-eyebrow text-[#77747F]">портал о антибиотикорезистентности</span>
          </div>
          <h1 className="pd-display text-[38px] font-extrabold leading-[1.06] sm:text-[46px]">
            Демо расшифровки
            <br />
            бак-посева
          </h1>
          <p className="mt-6 max-w-[42ch] text-[15.5px] leading-relaxed text-[#5A5764]">
            Закрытая сборка для команды Med-Click. Страница не индексируется, доступ по паролю.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-black/[0.07] bg-white/80 p-8 backdrop-blur-xl lg:col-span-6"
          style={{ boxShadow: "0 18px 50px -20px rgba(22,20,28,.22), 0 2px 6px rgba(22,20,28,.03)" }}
        >
          <label htmlFor="pd-pw" className="pd-eyebrow block text-[#77747F]">
            Пароль доступа
          </label>
          <input
            id="pd-pw"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className={`mt-3 w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none placeholder:text-[#B4B1BC] focus:border-[#7119FF]/45 ${
              error ? "border-[#8F3A2F]/45" : "border-black/[0.1]"
            }`}
            placeholder="••••••••"
          />
          {error && <p className="mt-3 text-[13px] text-[#8F3A2F]">{error}</p>}
          <button
            type="submit"
            disabled={busy || !value}
            className="pd-btn pd-eyebrow mt-6 w-full rounded-xl bg-[#5B12CF] px-6 py-4 text-white hover:bg-[#4B10C8] disabled:cursor-default disabled:bg-[#E7E3F2] disabled:text-[#A9A5B6]"
            style={{ boxShadow: busy || !value ? "none" : "0 10px 26px -12px rgba(75,16,200,.6)" }}
          >
            {busy ? "проверяем…" : "войти"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ─────────────────────────── макет портала ───────────────────────────

function Portal({ password }: { password: string }) {
  const [report, setReport] = useState<PosevReport | null>(null);
  const [meta, setMeta] = useState<ApiOk["meta"] | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Прогресс — косметика поверх реального запроса: последняя стадия «залипает»,
  // чтобы шкала не врала «готово», пока модель ещё думает.
  useEffect(() => {
    if (!busy) return;
    setStage(0);
    const id = setInterval(() => setStage((s) => (s < STAGES.length - 1 ? s + 1 : s)), 3200);
    return () => clearInterval(id);
  }, [busy]);

  const analyze = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      setRejected(null);
      setReport(null);
      setFileName(file.name);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("password", password);
        const res = await fetch("/api/v1/demo/posev", { method: "POST", body: form });
        const data = (await res.json()) as ApiOk | ApiReject | { detail?: string };
        if (!res.ok) {
          throw new Error(("detail" in data && data.detail) || "Не удалось обработать файл");
        }
        if ("ok" in data && data.ok) {
          setReport(data.report);
          setMeta(data.meta);
          setTimeout(
            () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            80
          );
        } else if ("reason" in data) {
          setRejected(data.reason);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Что-то пошло не так");
      } finally {
        setBusy(false);
      }
    },
    [password]
  );

  const loadSample = useCallback(
    async (path: string) => {
      const res = await fetch(path);
      const blob = await res.blob();
      await analyze(new File([blob], path.split("/").pop() || "sample.png", { type: "image/png" }));
    },
    [analyze]
  );

  return (
    <main className="min-h-screen bg-white text-[#16141C]">
      {/* ── шапка + герой: один экран окружения портала ──
          Герой держит ровно один экран: до загрузки бланка зона отчёта не
          должна показываться обрезком под сгибом. */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#F7F5FB]">
        <Glow />

        <div className="relative border-b border-black/[0.05] bg-white/50">
          <p className="mx-auto max-w-[1240px] px-6 py-2.5 text-[11.5px] text-[#8A8794] lg:px-10">
            Демо-макет для Med-Click · название и логотип портала — заглушка · движок расшифровки —
            «Мой Анализ»
          </p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-6 lg:px-10">
          <header className="flex flex-wrap items-center gap-x-10 gap-y-5 py-7">
            <div className="flex items-center gap-3.5">
              <LogoMark />
              <div>
                <div className="pd-display text-[13.5px] font-extrabold tracking-[0.06em]">
                  ПОРТАЛ О АНТИБИОТИКОРЕЗИСТЕНТНОСТИ
                </div>
                <div className="mt-1 text-[11px] text-[#8A8794]">рабочее название · макет</div>
              </div>
            </div>

            <nav className="ml-auto flex flex-wrap items-center gap-7 text-[13px]">
              {["О проблеме", "Антибиотики", "Бактериофаги", "Расшифровать анализ", "Врачам"].map(
                (item, idx) => (
                  <span
                    key={item}
                    className={`pd-nav-link cursor-default border-b pb-1 ${
                      idx === 3
                        ? "border-[#00A9AE] text-[#16141C]"
                        : "border-transparent text-[#5A5764] hover:text-[#16141C]"
                    }`}
                  >
                    {item}
                  </span>
                )
              )}
            </nav>

            <button
              type="button"
              className="pd-btn pd-eyebrow cursor-default rounded-xl bg-[#5B12CF] px-5 py-3.5 text-white"
              style={{ boxShadow: "0 10px 26px -14px rgba(75,16,200,.7)" }}
            >
              личный кабинет
            </button>
          </header>

          <div className="grid flex-1 gap-14 pb-20 pt-6 lg:grid-cols-12 lg:content-center lg:gap-16">
            <div className="lg:col-span-7">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-9 bg-[#00A9AE]" />
                <span className="pd-eyebrow text-[#00807F]">сервис портала</span>
              </div>

              <h1 className="pd-display text-[34px] font-extrabold leading-[1.05] sm:text-[46px] lg:text-[58px] lg:leading-[1.03]">
                Разберитесь
                <br />
                в своём бак-посеве
              </h1>

              <p className="mt-7 max-w-[48ch] text-[16.5px] leading-[1.7] text-[#5A5764]">
                Загрузите бланк посева — сервис объяснит, что за микроб выделен, что означают буквы
                S, I и R в таблице чувствительности и о чём говорит устойчивость. Понятным языком и
                без назначений: препарат подбирает врач.
              </p>

              <dl className="mt-12 grid gap-y-7 border-t border-black/[0.08] pt-8 sm:grid-cols-3 sm:gap-x-8">
                {[
                  ["Приватность", "Файл обрабатывается и удаляется, не сохраняется"],
                  ["Обезличивание", "Имя пациента и лаборатория не извлекаются"],
                  ["Стандарт", "Категории чувствительности — по критериям EUCAST"],
                ].map(([k, v], i) => (
                  <div key={k} className={i ? "sm:border-l sm:border-black/[0.08] sm:pl-8" : ""}>
                    <dt className="pd-eyebrow text-[#77747F]">{k}</dt>
                    <dd className="mt-2.5 text-[13.5px] leading-relaxed text-[#4A4753]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-5">
              <Widget
                busy={busy}
                stage={stage}
                fileName={fileName}
                error={error}
                rejected={rejected}
                hasReport={!!report}
                onFile={analyze}
                onSample={loadSample}
              />
            </div>
          </div>
        </div>
      </section>

      {report && (
        <div ref={resultRef}>
          <Result
            report={report}
            meta={meta}
            onReset={() => {
              setReport(null);
              setMeta(null);
              setFileName(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      <footer className="border-t border-black/[0.07] bg-[#FBFAFC] px-6 py-10 lg:px-10">
        <p className="mx-auto max-w-[1240px] text-[12.5px] leading-relaxed text-[#8A8794]">
          Демонстрационная сборка. Виджет встраивается в портал как iframe или вызывается по API —
          оформление подгоняется под финальный дизайн.
        </p>
      </footer>
    </main>
  );
}

// ─────────────────────────── виджет загрузки ───────────────────────────

function Widget({
  busy,
  stage,
  fileName,
  error,
  rejected,
  hasReport,
  onFile,
  onSample,
}: {
  busy: boolean;
  stage: number;
  fileName: string | null;
  error: string | null;
  rejected: string | null;
  hasReport: boolean;
  onFile: (f: File) => void;
  onSample: (p: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="pd-noprint rounded-2xl border border-black/[0.07] bg-white/85 p-7 backdrop-blur-xl"
      style={{ boxShadow: "0 22px 60px -24px rgba(22,20,28,.28), 0 2px 8px rgba(22,20,28,.04)" }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="pd-display text-[19px] font-extrabold">Расшифровка посева</h2>
        <span className="text-[11.5px] text-[#8A8794]">до 20 МБ</span>
      </div>

      {busy ? (
        <div className="mt-7">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(92, (stage + 1) * (100 / STAGES.length))}%`,
                background: "linear-gradient(90deg, #00A9AE, #7119FF)",
                transition: "width .7s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
          <ul className="mt-7 space-y-3.5">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-3 text-[13.5px] ${
                  i <= stage ? "text-[#2C2936]" : "text-[#B4B1BC]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    i < stage ? "bg-[#00A9AE]" : i === stage ? "bg-[#7119FF]" : "bg-black/15"
                  }`}
                />
                {s}
              </li>
            ))}
          </ul>
          {fileName && (
            <p className="mt-7 border-t border-black/[0.07] pt-4 text-[11.5px] leading-relaxed text-[#8A8794]">
              {fileName} — обрабатывается в памяти, не сохраняется
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`pd-drop mt-7 cursor-pointer rounded-xl border border-dashed px-6 py-10 text-center ${
              drag
                ? "border-[#7119FF]/45 bg-[#7119FF]/[0.05]"
                : "border-black/[0.13] bg-black/[0.012] hover:border-black/25 hover:bg-black/[0.025]"
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="mx-auto mb-4"
            >
              <circle cx="12" cy="12" r="8.4" stroke="#9A96A6" strokeWidth="1.4" />
              <path d="M4.4 9.6h15.2" stroke="#9A96A6" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="9.4" cy="14.6" r="1.5" fill="#00A9AE" />
              <circle cx="14.2" cy="13.2" r="1.1" fill="#7119FF" />
            </svg>
            <p className="text-[14.5px] font-semibold">Перетащите бланк или выберите файл</p>
            <p className="mt-1.5 text-[12px] text-[#8A8794]">PDF, JPG, PNG, HEIC</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>

          <div className="mt-7">
            <p className="pd-eyebrow text-[#77747F]">образцы бланков</p>
            <div className="mt-3.5 space-y-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.file}
                  type="button"
                  onClick={() => onSample(s.file)}
                  className="pd-sample flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-white px-4 py-3.5 text-left"
                >
                  <span className="text-[13.5px] font-semibold">{s.label}</span>
                  <span className="text-[11.5px] text-[#8A8794]">{s.meta}</span>
                </button>
              ))}
            </div>
          </div>

          {(error || rejected) && (
            <p
              className={`mt-6 rounded-xl border px-4 py-3.5 text-[13px] leading-relaxed ${
                rejected
                  ? "border-[#E4D2A8] bg-[#FBF5E7] text-[#7A5920]"
                  : "border-[#E8C4BD] bg-[#FBEEEB] text-[#8A372C]"
              }`}
            >
              {rejected || error}
            </p>
          )}

          {hasReport && <p className="mt-6 text-[12.5px] text-[#8A8794]">Расшифровка ниже ↓</p>}
        </>
      )}
    </div>
  );
}

// ─────────────────────────── результат ───────────────────────────

/**
 * compact — для таблицы: полная подпись «Чувствителен при увел. экспозиции»
 * переносилась в две строки и ломала ритм строк. В списке фагов, где строки
 * редкие и места много, остаётся полная формулировка.
 */
function Chip({ v, compact }: { v: Verdict; compact?: boolean }) {
  const st = V[v];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 text-[12px] font-semibold ${
        compact ? "whitespace-nowrap" : ""
      } ${st.chip}`}
    >
      <span
        className={`grid h-[19px] w-[19px] place-items-center rounded-md text-[11px] font-extrabold ${st.tile}`}
      >
        {v}
      </span>
      {compact ? st.short : st.label}
    </span>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-6 border-t border-black/[0.09] pt-5">
        <p className="pd-eyebrow text-[#9A96A6]">{eyebrow}</p>
        <h2 className="pd-display mt-2 text-[24px] font-extrabold leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Result({
  report,
  meta,
  onReset,
}: {
  report: PosevReport;
  meta: ApiOk["meta"] | null;
  onReset: () => void;
}) {
  const r = report.resistance || {};
  const tested = r.tested || 0;
  const sexLabel =
    report.patient?.sex === "male" ? "мужской" : report.patient?.sex === "female" ? "женский" : null;

  const jumps = useMemo(
    () =>
      [
        report.plain_summary && ["summary", "Кратко"],
        report.pathogens?.length && ["growth", "Что выросло"],
        report.antibiogram?.length && ["abx", "Чувствительность"],
        tested > 0 && ["resistance", "Устойчивость"],
        report.phages?.length && ["phages", "Бактериофаги"],
        report.sir_explainer?.length && ["sir", "S, I и R"],
        report.amr_notes?.length && ["amr", "Про устойчивость"],
        (report.questions_for_doctor?.length || report.red_flags?.length) && ["ask", "Врачу"],
      ].filter(Boolean) as [string, string][],
    [report, tested]
  );

  return (
    <div className="pd-fade border-t border-black/[0.07] bg-white">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-16 lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-16 lg:px-10">
        {/* ── липкая колонка-сводка ──
            min-w-0 обязателен: без него грид-трек раздувается под min-w таблицы
            антибиотикограммы и на мобильном появляется горизонтальный скролл
            всей страницы вместо прокрутки внутри таблицы. */}
        <aside className="pd-rail min-w-0 lg:sticky lg:top-8 lg:self-start">
          <p className="pd-eyebrow text-[#9A96A6]">результат</p>
          <h2 className="pd-display mt-2.5 text-[19px] font-extrabold leading-snug">
            {report.doc_kind || "Бактериологический посев"}
          </h2>

          <dl className="mt-6 space-y-3 border-t border-black/[0.09] pt-5 text-[13px]">
            {report.material && (
              <div>
                <dt className="text-[#8A8794]">Биоматериал</dt>
                <dd className="mt-0.5 leading-snug">{report.material}</dd>
              </div>
            )}
            {report.collected_at && (
              <div>
                <dt className="text-[#8A8794]">Дата взятия</dt>
                <dd className="mt-0.5">{report.collected_at}</dd>
              </div>
            )}
            {(sexLabel || report.patient?.age != null) && (
              <div>
                <dt className="text-[#8A8794]">Пациент</dt>
                <dd className="mt-0.5">
                  {[sexLabel, report.patient?.age != null ? `${report.patient.age} лет` : null]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            )}
          </dl>

          {tested > 0 && (
            <div className="mt-7 border-t border-black/[0.09] pt-5">
              <p className="pd-eyebrow text-[#9A96A6]">из {tested} препаратов</p>
              <div className="mt-4 space-y-2.5">
                {(["S", "I", "R"] as Verdict[]).map((v) => {
                  const val = (v === "S" ? r.s : v === "I" ? r.i : r.r) ?? 0;
                  return (
                    <div key={v} className="flex items-center gap-3">
                      <span className="pd-display w-4 text-[12px] font-extrabold text-[#6B6875]">
                        {v}
                      </span>
                      <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                        <span
                          className={`block h-full rounded-full ${V[v].bar}`}
                          style={{ width: `${tested ? (val / tested) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="w-5 text-right text-[12.5px] font-semibold tabular-nums">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
              {r.multi_resistant && (
                <p className="mt-5 rounded-xl bg-[#F9ECE9] px-4 py-3 text-[12.5px] leading-relaxed text-[#8A372C]">
                  Устойчивость к {r.r_classes} классам препаратов — картина множественной
                  устойчивости.
                </p>
              )}
            </div>
          )}

          <nav className="pd-noprint mt-7 border-t border-black/[0.09] pt-5">
            <ul className="space-y-2.5 text-[13px]">
              {jumps.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="pd-jump block text-[#6B6875]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ── колонка отчёта ── */}
        <div className="min-w-0 space-y-14">
          {report.plain_summary && (
            <section id="summary" className="scroll-mt-8">
              <p className="pd-eyebrow mb-4 text-[#9A96A6]">кратко</p>
              <p className="pd-display max-w-[62ch] text-[21px] font-medium leading-[1.5] tracking-[-0.01em]">
                {report.plain_summary}
              </p>
              {meta?.elapsed_ms != null && (
                <p className="pd-noprint mt-6 text-[11.5px] text-[#A5A2AE]">
                  разобрано за {(meta.elapsed_ms / 1000).toFixed(1)} с
                </p>
              )}
            </section>
          )}

          {!!report.pathogens?.length && (
            <Section id="growth" eyebrow="результат посева" title="Что выросло">
              <div className="space-y-8">
                {report.pathogens.map((p, i) => (
                  <div key={i} className={i ? "border-t border-black/[0.07] pt-8" : ""}>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                      <span className="pd-display text-[22px] font-extrabold italic">
                        {p.name_latin}
                      </span>
                      {p.name_ru && (
                        <span className="text-[14.5px] text-[#6B6875]">{p.name_ru}</span>
                      )}
                      {p.count && (
                        <span className="ml-auto rounded-lg bg-black/[0.045] px-3 py-1.5 text-[13px] font-semibold tabular-nums">
                          {p.count}
                        </span>
                      )}
                    </div>
                    {p.about && (
                      <p className="mt-4 max-w-[70ch] text-[14.5px] leading-[1.7]">{p.about}</p>
                    )}
                    {p.significance_text && (
                      <p className="mt-3 max-w-[70ch] text-[13.5px] leading-[1.7] text-[#6B6875]">
                        {p.significance_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!!report.antibiogram?.length &&
            report.antibiogram.map((group, gi) => (
              <Section
                key={gi}
                id={gi === 0 ? "abx" : `abx-${gi}`}
                eyebrow="антибиотикограмма"
                title={`Чувствительность${group.pathogen ? ` · ${group.pathogen}` : ""}`}
              >
                <div className="-mx-2 overflow-x-auto px-2">
                  <table className="w-full min-w-[560px] border-collapse text-[14px]">
                    <thead>
                      <tr>
                        {["Препарат", "Класс", "МПК, мг/л", "Категория"].map((h) => (
                          <th
                            key={h}
                            className="pd-eyebrow whitespace-nowrap pb-3 pr-4 text-left font-semibold text-[#9A96A6]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(group.items || []).map((it, i) => (
                        <tr key={i} className="pd-row border-t border-black/[0.07]">
                          <td className="py-3.5 pr-4 font-semibold">{it.drug}</td>
                          <td className="py-3.5 pr-4 text-[13px] text-[#6B6875]">
                            {it.drug_class || "—"}
                          </td>
                          <td className="whitespace-nowrap py-3.5 pr-4 tabular-nums">
                            {it.mic || "—"}
                          </td>
                          <td className="py-3.5">
                            <Chip v={it.verdict} compact />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-5 max-w-[70ch] text-[12.5px] leading-[1.7] text-[#8A8794]">
                  МПК — минимальная подавляющая концентрация. Сравнивать числа МПК между разными
                  препаратами нельзя: у каждого свои пороги.
                </p>
              </Section>
            ))}

          {tested > 0 && r.text && (
            <Section id="resistance" eyebrow="картина изолята" title="Устойчивость">
              <p className="max-w-[70ch] text-[15px] leading-[1.75]">{r.text}</p>
            </Section>
          )}

          {!!report.phages?.length && (
            <Section id="phages" eyebrow="альтернативные агенты" title="Бактериофаги">
              <ul>
                {report.phages.map((p, i) => (
                  <li
                    key={i}
                    className="pd-row flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.07] py-3.5"
                  >
                    <span className="text-[14.5px] font-semibold">{p.name}</span>
                    {p.verdict && <Chip v={p.verdict} />}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {!!report.sir_explainer?.length && (
            <Section id="sir" eyebrow="как читать таблицу" title="Что означают S, I и R">
              <div className="grid gap-y-8 sm:grid-cols-3 sm:gap-x-0">
                {report.sir_explainer.map((e, i) => {
                  const st = V[e.code] || V.S;
                  return (
                    <div
                      key={e.code}
                      className={i ? "sm:border-l sm:border-black/[0.09] sm:pl-7" : "sm:pr-7"}
                    >
                      <span
                        className={`pd-display grid h-8 w-8 place-items-center rounded-lg text-[14px] font-extrabold ${st.tile}`}
                      >
                        {e.code}
                      </span>
                      <h3 className="mt-4 text-[14.5px] font-bold leading-snug">{e.title}</h3>
                      <p className="mt-2.5 text-[13.5px] leading-[1.7] text-[#5A5764]">{e.text}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {!!report.amr_notes?.length && (
            <Section id="amr" eyebrow="тема портала" title="Почему это важно знать">
              <ol className="space-y-6">
                {report.amr_notes.map((n, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="pd-display shrink-0 text-[20px] font-extrabold tabular-nums text-[#7119FF]/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="max-w-[66ch] text-[14.5px] leading-[1.75]">{n}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {(!!report.questions_for_doctor?.length || !!report.red_flags?.length) && (
            <Section id="ask" eyebrow="что делать дальше" title="Разговор с врачом">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
                {!!report.questions_for_doctor?.length && (
                  <div>
                    <p className="pd-eyebrow mb-4 text-[#9A96A6]">о чём спросить</p>
                    <ul className="space-y-3.5">
                      {report.questions_for_doctor.map((q, i) => (
                        <li
                          key={i}
                          className="border-t border-black/[0.07] pt-3.5 text-[13.5px] leading-[1.65]"
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!report.red_flags?.length && (
                  <div className="rounded-2xl bg-[#FBEEEB]/70 p-7">
                    <p className="pd-eyebrow mb-4 text-[#8A372C]/75">срочно к врачу</p>
                    <ul className="space-y-3.5">
                      {report.red_flags.map((f, i) => (
                        <li
                          key={i}
                          className="border-t border-[#8F3A2F]/15 pt-3.5 text-[13.5px] leading-[1.65] text-[#5E2A22]"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* граница продукта, а не косметика */}
          <div className="rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] p-8">
            <h3 className="pd-display text-[16px] font-extrabold text-[#6E521C]">
              Сервис не подбирает препарат
            </h3>
            <p className="mt-3.5 max-w-[72ch] text-[13.5px] leading-[1.75] text-[#6E521C]/90">
              {report.no_prescription_note}
            </p>
            <p className="mt-4 max-w-[72ch] border-t border-[#E4D9BF] pt-4 text-[12.5px] leading-[1.7] text-[#6E521C]/70">
              {report.disclaimer}
            </p>
          </div>

          <div className="pd-noprint flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onReset}
              className="pd-btn pd-eyebrow rounded-xl bg-[#5B12CF] px-6 py-4 text-white hover:bg-[#4B10C8]"
              style={{ boxShadow: "0 12px 30px -14px rgba(75,16,200,.65)" }}
            >
              разобрать другой бланк
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="pd-btn pd-eyebrow rounded-xl border border-black/10 bg-white px-6 py-4 hover:bg-black/[0.02]"
            >
              сохранить в pdf
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

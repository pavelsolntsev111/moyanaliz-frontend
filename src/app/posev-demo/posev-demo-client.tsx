"use client";

/**
 * Демо расшифровки бак-посева для Med-Click.
 *
 * Страница = макет окружения будущего портала о антибиотикорезистентности
 * (один экран: шапка + герой) + рабочий виджет расшифровки.
 *
 * ДИЗАЙН — фирменный стиль med-click.ru: плоская заливка #4000A8 в герое,
 * кнопки #7119FF и #00C3C8 с радиусом 8px и подписью 12px/700, Manrope на
 * заголовках, белый контент с волосяными границами.
 * ⚠️ Никаких градиентов, свечений и glassmorphism: «палевом ИИ» читается не
 * фиолетовый сам по себе (это бренд заказчика), а именно такая его подача —
 * светящиеся радиальные пятна и стеклянные карточки. У заказчика на сайте
 * плоские заливки, их и держим.
 *
 * Отчёт открывается в ОТДЕЛЬНОЙ ВКЛАДКЕ. Разбор при этом идёт на ЭТОЙ странице,
 * а готовый отчёт передаётся ключом в localStorage, который вкладка сразу
 * забирает и стирает.
 * ⚠️ Почему не postMessage: часть браузеров и вебвью (мессенджеры) открывают
 * window.open в ТОЙ ЖЕ вкладке — родитель уничтожается на середине запроса,
 * opener теряется, и передавать становится нечем. Через ключ работает и такой
 * случай. Открываем вкладку ПОСЛЕ ответа модели; если её заблокировал
 * блокировщик, показываем кнопку — клик пользователя всегда проходит.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PosevReport, ReportMeta } from "./report-view";

interface ApiOk {
  ok: true;
  report: PosevReport;
  meta: ReportMeta;
}
interface ApiReject {
  ok: false;
  reason: string;
  meta?: ReportMeta;
}

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
.pd-sample { transition: border-color .2s ease, background-color .2s ease, transform .2s ease; }
.pd-sample:hover { border-color: #7119FF; background-color: #FAF7FF; transform: translateX(2px); }
.pd-drop { transition: border-color .2s ease, background-color .2s ease; }
.pd-btn { transition: background-color .2s ease, transform .12s ease, border-color .2s ease; }
.pd-btn:active { transform: translateY(1px); }
.pd-fade { animation: pdFade .45s cubic-bezier(.2,.7,.2,1) both; }
@keyframes pdFade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@media print { .pd-noprint { display: none !important; } .pd-rail { display: none !important; } }
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
        <div className="min-h-screen bg-[#4000A8]" />
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

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-[11px]";
  return (
    <div
      className={`${box} pd-display grid shrink-0 place-items-center rounded-lg bg-[#00C3C8] font-extrabold tracking-[0.04em] text-white`}
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
    <main className="flex min-h-screen items-center bg-[#4000A8] px-6 py-16 text-white">
      <div className="mx-auto grid w-full max-w-[1000px] gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <div className="mb-8 flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="pd-eyebrow text-white/60">портал о антибиотикорезистентности</span>
          </div>
          <h1 className="pd-display text-[38px] font-extrabold leading-[1.06] sm:text-[46px]">
            Демо расшифровки
            <br />
            бак-посева
          </h1>
          <p className="mt-6 max-w-[42ch] text-[15.5px] leading-relaxed text-white/70">
            Закрытая сборка для команды Med-Click. Страница не индексируется, доступ по паролю.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-lg bg-white p-8 text-[#16141C] lg:col-span-6">
          <label htmlFor="pd-pw" className="pd-eyebrow block text-[#86838F]">
            Пароль доступа
          </label>
          <input
            id="pd-pw"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className={`mt-3 w-full rounded-lg border bg-white px-4 py-3.5 text-[15px] outline-none placeholder:text-[#B4B1BC] focus:border-[#7119FF] ${
              error ? "border-[#8F3A2F]/50" : "border-black/[0.12]"
            }`}
            placeholder="••••••••"
          />
          {error && <p className="mt-3 text-[13px] text-[#8F3A2F]">{error}</p>}
          <button
            type="submit"
            disabled={busy || !value}
            className="pd-btn mt-6 w-full rounded-lg bg-[#7119FF] px-6 py-4 text-[12px] font-bold text-white hover:bg-[#5F12DC] disabled:cursor-default disabled:bg-[#E7E3F2] disabled:text-[#A9A5B6]"
          >
            {busy ? "Проверяем…" : "Войти"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ─────────────────────────── макет портала ───────────────────────────

function Portal({ password }: { password: string }) {
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [openedInTab, setOpenedInTab] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

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
      setReportUrl(null);
      setOpenedInTab(false);
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
          const key = `posev_report_${Math.random().toString(36).slice(2)}`;
          localStorage.setItem(key, JSON.stringify({ report: data.report, meta: data.meta }));
          const url = `/posev-demo/report?k=${key}`;
          setReportUrl(url);
          // Открытие вне жеста может не пройти через блокировщик — тогда ниже
          // показываем кнопку, и клик пользователя откроет вкладку наверняка.
          const w = window.open(url, "_blank");
          setOpenedInTab(!!w && !w.closed);
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
      {/* ── шапка + герой: один экран окружения портала ── */}
      <section className="flex min-h-[100svh] flex-col bg-[#4000A8] text-white">
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-6 lg:px-10">
          <header className="flex flex-wrap items-center gap-x-10 gap-y-5 py-7">
            <div className="flex items-center gap-3.5">
              <LogoMark />
              <div className="pd-display text-[13.5px] font-extrabold tracking-[0.06em]">
                ПОРТАЛ О АНТИБИОТИКОРЕЗИСТЕНТНОСТИ
              </div>
            </div>

            <nav className="ml-auto flex flex-wrap items-center gap-7 text-[13px]">
              {["О проблеме", "Антибиотики", "Бактериофаги", "Расшифровать анализ", "Врачам"].map(
                (item, idx) => (
                  <span
                    key={item}
                    className={`pd-nav-link cursor-default border-b pb-1 ${
                      idx === 3
                        ? "border-[#00C3C8] text-white"
                        : "border-transparent text-white/70 hover:text-white"
                    }`}
                  >
                    {item}
                  </span>
                )
              )}
            </nav>

            <button
              type="button"
              className="pd-btn cursor-default rounded-lg bg-[#7119FF] px-6 py-3.5 text-[12px] font-bold text-white"
            >
              Личный кабинет
            </button>
          </header>

          <div className="grid flex-1 gap-14 pb-20 pt-6 lg:grid-cols-12 lg:content-center lg:gap-16">
            <div className="lg:col-span-7">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-9 bg-[#00C3C8]" />
                <span className="pd-eyebrow text-[#7EE3E6]">сервис портала</span>
              </div>

              <h1 className="pd-display text-[34px] font-extrabold leading-[1.05] sm:text-[46px] lg:text-[58px] lg:leading-[1.03]">
                Разберитесь
                <br />в своём бак-посеве
              </h1>

              <p className="mt-7 max-w-[48ch] text-[16.5px] leading-[1.7] text-white/75">
                Загрузите бланк посева — сервис объяснит, что за микроб выделен, что означают буквы
                S, I и R в таблице чувствительности и о чём говорит устойчивость. Понятным языком и
                без назначений: препарат подбирает врач.
              </p>

              <dl className="mt-12 grid gap-y-7 border-t border-white/20 pt-8 sm:grid-cols-3 sm:gap-x-8">
                {[
                  ["Приватность", "Файл обрабатывается и удаляется, не сохраняется"],
                  ["Обезличивание", "Имя пациента и лаборатория не извлекаются"],
                  ["Стандарт", "Категории чувствительности — по критериям EUCAST"],
                ].map(([k, v], i) => (
                  <div key={k} className={i ? "sm:border-l sm:border-white/20 sm:pl-8" : ""}>
                    <dt className="pd-eyebrow text-[#7EE3E6]">{k}</dt>
                    <dd className="mt-2.5 text-[13.5px] leading-relaxed text-white/75">{v}</dd>
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
                reportUrl={reportUrl}
                openedInTab={openedInTab}
                onFile={analyze}
                onSample={loadSample}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.07] px-6 py-10 lg:px-10">
        <p className="mx-auto max-w-[1240px] text-[12.5px] leading-relaxed text-[#86838F]">
          Виджет встраивается в портал как iframe или вызывается по API — оформление подгоняется
          под финальный дизайн.
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
  reportUrl,
  openedInTab,
  onFile,
  onSample,
}: {
  busy: boolean;
  stage: number;
  fileName: string | null;
  error: string | null;
  rejected: string | null;
  reportUrl: string | null;
  openedInTab: boolean;
  onFile: (f: File) => void;
  onSample: (p: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pd-noprint rounded-lg bg-white p-7 text-[#16141C]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="pd-display text-[19px] font-extrabold">Расшифровка посева</h2>
        <span className="text-[11.5px] text-[#86838F]">до 20 МБ</span>
      </div>

      {busy ? (
        <div className="mt-7">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full bg-[#7119FF]"
              style={{
                width: `${Math.min(92, (stage + 1) * (100 / STAGES.length))}%`,
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
                    i < stage ? "bg-[#00C3C8]" : i === stage ? "bg-[#7119FF]" : "bg-black/15"
                  }`}
                />
                {s}
              </li>
            ))}
          </ul>
          {fileName && (
            <p className="mt-7 border-t border-black/[0.07] pt-4 text-[11.5px] leading-relaxed text-[#86838F]">
              {fileName} — обрабатывается в памяти, не сохраняется
            </p>
          )}
        </div>
      ) : reportUrl ? (
        <div className="mt-7">
          <p className="text-[14.5px] font-semibold">
            {openedInTab ? "Расшифровка открыта в новой вкладке" : "Расшифровка готова"}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#55535E]">
            {openedInTab
              ? "Там же её можно сохранить в PDF. Если вкладка потерялась — откройте заново."
              : "Браузер заблокировал новое окно — откройте расшифровку кнопкой ниже."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener"
              className="pd-btn inline-block rounded-lg bg-[#7119FF] px-5 py-3.5 text-[12px] font-bold text-white hover:bg-[#5F12DC]"
            >
              Открыть расшифровку
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="pd-btn rounded-lg border border-black/[0.12] bg-white px-5 py-3.5 text-[12px] font-bold hover:bg-black/[0.03]"
            >
              Другой бланк
            </button>
          </div>
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
            className={`pd-drop mt-7 cursor-pointer rounded-lg border border-dashed px-6 py-10 text-center ${
              drag
                ? "border-[#7119FF] bg-[#FAF7FF]"
                : "border-black/[0.15] hover:border-black/30 hover:bg-black/[0.02]"
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
              <circle cx="9.4" cy="14.6" r="1.5" fill="#00C3C8" />
              <circle cx="14.2" cy="13.2" r="1.1" fill="#7119FF" />
            </svg>
            <p className="text-[14.5px] font-semibold">Перетащите бланк или выберите файл</p>
            <p className="mt-1.5 text-[12px] text-[#86838F]">PDF, JPG, PNG, HEIC</p>
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
            <p className="pd-eyebrow text-[#86838F]">образцы бланков</p>
            <div className="mt-3.5 space-y-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.file}
                  type="button"
                  onClick={() => onSample(s.file)}
                  className="pd-sample flex w-full items-center justify-between rounded-lg border border-black/[0.1] bg-white px-4 py-3.5 text-left"
                >
                  <span className="text-[13.5px] font-semibold">{s.label}</span>
                  <span className="text-[11.5px] text-[#86838F]">{s.meta}</span>
                </button>
              ))}
            </div>
          </div>

          {(error || rejected) && (
            <p
              className={`mt-6 rounded-lg border px-4 py-3.5 text-[13px] leading-relaxed ${
                rejected
                  ? "border-[#E4D2A8] bg-[#FBF5E7] text-[#7A5920]"
                  : "border-[#E8C4BD] bg-[#FBEEEB] text-[#8A372C]"
              }`}
            >
              {rejected || error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

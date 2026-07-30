"use client";

/**
 * Демо расшифровки бак-посева для Med-Click.
 *
 * Страница = макет окружения будущего портала о антибиотикорезистентности
 * (один экран: шапка + герой) + рабочий виджет расшифровки.
 *
 * Палитра и типографика взяты с med-click.ru: #4000A8 герой, #7119FF кнопки,
 * #00C3C8 акцент, Manrope на заголовки, Raleway на текст. Логотип и название
 * портала — ЗАГЛУШКА: подставлять реальный бренд заказчика или ведомств в
 * демо нельзя, поэтому вверху висит плашка «демо-макет».
 *
 * Файл никуда не сохраняется — эндпоинт эфемерный (см. app/routers/demo_posev.py).
 */

import { useCallback, useEffect, useRef, useState } from "react";

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

// ─────────────────────────── палитра заказчика ───────────────────────────

const C = {
  deep: "#4000A8",
  purple: "#7119FF",
  teal: "#00C3C8",
  ink: "#1E1D22",
  grey: "#7B7B7B",
  line: "#E7E7E7",
  bg: "#F4F4F4",
};

// short — для счётчиков. У S и I полные подписи начинаются одинаково
// («Чувствителен…»), и сокращение по первому слову делало их неразличимыми.
const VERDICT_STYLE: Record<
  Verdict,
  { bg: string; fg: string; label: string; short: string }
> = {
  S: { bg: "#E4F8F8", fg: "#00726F", label: "Чувствителен", short: "ЧУВСТВИТЕЛЕН" },
  I: {
    bg: "#FFF3DF",
    fg: "#8A5200",
    label: "Чувствителен при увел. экспозиции",
    short: "ПРИ УВЕЛ. ЭКСПОЗИЦИИ",
  },
  R: { bg: "#FDE7E7", fg: "#AE2018", label: "Устойчив", short: "УСТОЙЧИВ" },
};

const STAGES = [
  "Читаем бланк",
  "Определяем возбудителя и количество",
  "Разбираем таблицу чувствительности",
  "Сверяем трактовку категорий S / I / R",
  "Проверяем формулировки",
];

const SAMPLES = [
  { file: "/demo/posev-sample-1.png", label: "Посев мочи · E. coli" },
  { file: "/demo/posev-sample-2.png", label: "Посев раны · MRSA + фаги" },
];

const AUTH_KEY = "posev_demo_ok";

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

  if (checking) return <div style={{ minHeight: "100vh", background: C.deep }} />;
  if (!authed) {
    return (
      <Gate
        onPass={(pw) => {
          sessionStorage.setItem(AUTH_KEY, pw);
          setPassword(pw);
          setAuthed(true);
        }}
      />
    );
  }
  return <Portal password={password} />;
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
    <main
      style={{
        minHeight: "100vh",
        background: C.deep,
        fontFamily: "var(--font-mc-body), sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 60px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <LogoMark />
          <div style={{ fontSize: 11, letterSpacing: ".08em", color: C.grey, fontWeight: 700 }}>
            ДЕМО · РАСШИФРОВКА БАК-ПОСЕВА
          </div>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-mc-head), sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: C.ink,
            margin: "0 0 8px",
          }}
        >
          Демо закрыто паролем
        </h1>
        <p style={{ fontSize: 14, color: C.grey, margin: "0 0 22px", lineHeight: 1.5 }}>
          Страница не индексируется и доступна только по паролю.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Пароль"
          autoFocus
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 15,
            border: `1px solid ${error ? "#AE2018" : C.line}`,
            borderRadius: 8,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {error && (
          <div style={{ color: "#AE2018", fontSize: 13, marginTop: 8 }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={busy || !value}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "15px 24px",
            background: busy || !value ? "#C9BCE8" : C.purple,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".02em",
            cursor: busy || !value ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {busy ? "ПРОВЕРЯЕМ…" : "ВОЙТИ"}
        </button>
      </form>
    </main>
  );
}

// ─────────────────────────── макет портала ───────────────────────────

function LogoMark() {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "var(--font-mc-head), sans-serif",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: ".02em",
        flexShrink: 0,
      }}
    >
      АМР
    </div>
  );
}

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
    const id = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 3200);
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
          throw new Error(
            ("detail" in data && data.detail) || "Не удалось обработать файл"
          );
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
    <main
      style={{
        fontFamily: "var(--font-mc-body), sans-serif",
        color: C.ink,
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* плашка: это макет, а не живой портал */}
      <div
        style={{
          background: C.ink,
          color: "rgba(255,255,255,.72)",
          fontSize: 12,
          padding: "8px 20px",
          textAlign: "center",
        }}
      >
        Демо-макет для Med-Click · название и логотип портала — заглушка · движок расшифровки —
        «Мой Анализ»
      </div>

      {/* ── шапка + герой: один экран окружения портала ── */}
      <section style={{ background: C.deep, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -180,
            top: -120,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(0,195,200,.35), transparent 62%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "22px 0",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LogoMark />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mc-head), sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: ".04em",
                  }}
                >
                  ПОРТАЛ О АНТИБИОТИКОРЕЗИСТЕНТНОСТИ
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 }}>
                  рабочее название · макет
                </div>
              </div>
            </div>
            <nav
              style={{
                display: "flex",
                gap: 22,
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,.86)",
                marginLeft: "auto",
                flexWrap: "wrap",
              }}
            >
              {["О проблеме", "Антибиотики", "Бактериофаги", "Расшифровать анализ", "Врачам"].map(
                (item, idx) => (
                  <span
                    key={item}
                    style={{
                      cursor: "default",
                      borderBottom: idx === 3 ? `2px solid ${C.teal}` : "2px solid transparent",
                      paddingBottom: 3,
                    }}
                  >
                    {item}
                  </span>
                )
              )}
            </nav>
            <button
              type="button"
              style={{
                padding: "13px 22px",
                background: C.purple,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "default",
                fontFamily: "inherit",
              }}
            >
              ЛИЧНЫЙ КАБИНЕТ
            </button>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, 1fr) minmax(320px, 480px)",
              gap: 48,
              alignItems: "start",
              padding: "34px 0 56px",
            }}
            className="posev-hero"
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(0,195,200,.18)",
                  border: `1px solid rgba(0,195,200,.5)`,
                  color: "#9CF6F8",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  padding: "6px 12px",
                  borderRadius: 6,
                  marginBottom: 18,
                }}
              >
                СЕРВИС ПОРТАЛА
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-mc-head), sans-serif",
                  fontWeight: 800,
                  fontSize: 40,
                  lineHeight: 1.12,
                  margin: "0 0 16px",
                }}
              >
                Разберитесь
                <br />
                в своём бак-посеве
              </h1>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,.82)",
                  margin: "0 0 26px",
                  maxWidth: 480,
                }}
              >
                Загрузите бланк посева — сервис объяснит, что за микроб выделен, что означают
                буквы S, I и R в таблице чувствительности и о чём говорит устойчивость. Понятным
                языком и без назначений: препарат подбирает врач.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {[
                  "Файл не сохраняется — обрабатывается и удаляется",
                  "Имя пациента и лаборатория не извлекаются",
                  "Категории чувствительности — по критериям EUCAST",
                ].map((t) => (
                  <li
                    key={t}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,.9)",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: C.teal, fontWeight: 700, lineHeight: 1.5 }}>✓</span>
                    <span style={{ lineHeight: 1.5 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

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
      </section>

      {report && (
        <div ref={resultRef}>
          <Result report={report} meta={meta} onReset={() => {
            setReport(null);
            setMeta(null);
            setFileName(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }} />
        </div>
      )}

      <footer
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.line}`,
          padding: "26px 24px",
          fontSize: 12.5,
          color: C.grey,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Демонстрационная сборка. Виджет встраивается в портал как iframe/скрипт или вызывается по
        API — оформление подгоняется под финальный дизайн.
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .posev-hero { grid-template-columns: 1fr !important; gap: 28px !important; }
          .posev-hero h1 { font-size: 30px !important; }
        }
        @media print {
          .posev-noprint { display: none !important; }
        }
      `}</style>
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
      className="posev-noprint"
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 26,
        color: C.ink,
        boxShadow: "0 26px 60px rgba(0,0,0,.28)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mc-head), sans-serif",
          fontWeight: 800,
          fontSize: 19,
          marginBottom: 4,
        }}
      >
        Расшифровка бак-посева
      </div>
      <div style={{ fontSize: 13, color: C.grey, marginBottom: 18 }}>
        PDF или фото бланка · до 20 МБ
      </div>

      {busy ? (
        <div style={{ padding: "6px 0 4px" }}>
          <div
            style={{
              height: 6,
              background: C.bg,
              borderRadius: 99,
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(92, (stage + 1) * (100 / STAGES.length))}%`,
                background: `linear-gradient(90deg, ${C.teal}, ${C.purple})`,
                borderRadius: 99,
                transition: "width .6s ease",
              }}
            />
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {STAGES.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  gap: 9,
                  fontSize: 13.5,
                  color: i <= stage ? C.ink : "#B6B6BE",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: 16,
                    textAlign: "center",
                    color: i < stage ? C.teal : i === stage ? C.purple : "#D5D5DC",
                    fontWeight: 700,
                  }}
                >
                  {i < stage ? "✓" : "•"}
                </span>
                {s}
              </div>
            ))}
          </div>
          {fileName && (
            <div style={{ fontSize: 12, color: C.grey, marginTop: 16 }}>
              Файл: {fileName} — обрабатывается в памяти, не сохраняется
            </div>
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
            style={{
              border: `2px dashed ${drag ? C.purple : "#D8D8E0"}`,
              background: drag ? "#F6F1FF" : "#FCFCFD",
              borderRadius: 10,
              padding: "30px 18px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all .15s ease",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                margin: "0 auto 12px",
                borderRadius: 12,
                background: "#F1EBFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Иконка «чашка Петри» вектором: эмодзи 🧫 на разных ОС рисуется
                  по-своему и в макете выглядело мутным пятном. */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="8.4" stroke={C.purple} strokeWidth="1.7" />
                <path d="M4.4 9.6h15.2" stroke={C.purple} strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="9.4" cy="14.6" r="1.5" fill={C.teal} />
                <circle cx="14.2" cy="13.2" r="1.1" fill={C.teal} />
                <circle cx="12.6" cy="16.8" r="0.9" fill={C.purple} opacity="0.5" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>
              Перетащите бланк или нажмите
            </div>
            <div style={{ fontSize: 12.5, color: C.grey }}>PDF, JPG, PNG, HEIC</div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: C.grey, marginBottom: 8 }}>
              Нет бланка под рукой — откройте образец:
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {SAMPLES.map((s) => (
                <button
                  key={s.file}
                  type="button"
                  onClick={() => onSample(s.file)}
                  style={{
                    textAlign: "left",
                    padding: "11px 14px",
                    border: `1px solid ${C.line}`,
                    background: "#fff",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.ink,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {(error || rejected) && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: rejected ? "#FFF7E6" : "#FDE7E7",
                border: `1px solid ${rejected ? "#F0D9A8" : "#F3C7C4"}`,
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.5,
                color: rejected ? "#8A5200" : "#AE2018",
              }}
            >
              {rejected || error}
            </div>
          )}

          {hasReport && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: C.grey }}>
              Расшифровка ниже ↓
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────── результат ───────────────────────────

function Card({
  title,
  children,
  accent,
}: {
  title?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderLeft: accent ? `4px solid ${accent}` : `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "20px 22px",
      }}
    >
      {title && (
        <h3
          style={{
            fontFamily: "var(--font-mc-head), sans-serif",
            fontSize: 15,
            fontWeight: 800,
            margin: "0 0 12px",
            letterSpacing: ".01em",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

function Chip({ v }: { v: Verdict }) {
  const st = VERDICT_STYLE[v];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: st.bg,
        color: st.fg,
        borderRadius: 6,
        padding: "4px 9px",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <b style={{ fontSize: 13 }}>{v}</b>
      <span style={{ fontWeight: 600 }}>{st.label}</span>
    </span>
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
  const sexLabel =
    report.patient?.sex === "male" ? "мужской" : report.patient?.sex === "female" ? "женский" : null;

  return (
    <div style={{ background: C.bg, padding: "40px 24px 56px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 16 }}>
        {/* шапка результата */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-mc-head), sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "0 0 6px",
                }}
              >
                {report.doc_kind || "Бактериологический посев"}
              </h2>
              <div style={{ fontSize: 13.5, color: C.grey, lineHeight: 1.7 }}>
                {report.material && <>Биоматериал: {report.material}<br /></>}
                {report.collected_at && <>Дата взятия: {report.collected_at} · </>}
                {sexLabel && <>пол: {sexLabel}</>}
                {report.patient?.age != null && <>, возраст: {report.patient.age}</>}
              </div>
            </div>
            {meta?.elapsed_ms != null && (
              <span className="posev-noprint" style={{ fontSize: 11.5, color: C.grey }}>
                разобрано за {(meta.elapsed_ms / 1000).toFixed(1)} с
              </span>
            )}
          </div>
        </div>

        {report.plain_summary && (
          <Card title="Что показал посев" accent={C.purple}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65 }}>{report.plain_summary}</p>
          </Card>
        )}

        {/* возбудители */}
        {!!report.pathogens?.length && (
          <Card title="Что выросло">
            <div style={{ display: "grid", gap: 14 }}>
              {report.pathogens.map((p, i) => (
                <div
                  key={i}
                  style={{
                    borderTop: i ? `1px solid ${C.line}` : "none",
                    paddingTop: i ? 14 : 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 17, fontWeight: 700, fontStyle: "italic" }}>
                      {p.name_latin}
                    </span>
                    {p.name_ru && <span style={{ color: C.grey, fontSize: 14 }}>{p.name_ru}</span>}
                    {p.count && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: C.bg,
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {p.count}
                      </span>
                    )}
                  </div>
                  {p.about && (
                    <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.6 }}>{p.about}</p>
                  )}
                  {p.significance_text && (
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: C.grey }}>
                      {p.significance_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* антибиотикограмма */}
        {!!report.antibiogram?.length &&
          report.antibiogram.map((group, gi) => (
            <Card
              key={gi}
              title={`Таблица чувствительности${group.pathogen ? ` · ${group.pathogen}` : ""}`}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {["Препарат", "Класс", "МПК, мг/л", "Категория"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: 11.5,
                            fontWeight: 700,
                            letterSpacing: ".04em",
                            color: C.grey,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(group.items || []).map((it, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td style={{ padding: "11px 12px", fontWeight: 600 }}>{it.drug}</td>
                        <td style={{ padding: "11px 12px", color: C.grey, fontSize: 13 }}>
                          {it.drug_class || "—"}
                        </td>
                        <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                          {it.mic || "—"}
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <Chip v={it.verdict} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 12.5, color: C.grey, lineHeight: 1.6 }}>
                МПК — минимальная подавляющая концентрация. Сравнивать числа МПК между разными
                препаратами нельзя: у каждого свои пороги.
              </p>
            </Card>
          ))}

        {/* устойчивость */}
        {(r.tested || 0) > 0 && (
          <Card title="Картина устойчивости">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {(["S", "I", "R"] as Verdict[]).map((v) => {
                const val = v === "S" ? r.s : v === "I" ? r.i : r.r;
                const st = VERDICT_STYLE[v];
                return (
                  <div
                    key={v}
                    style={{
                      background: st.bg,
                      color: st.fg,
                      borderRadius: 8,
                      padding: "12px 16px",
                      minWidth: 96,
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{val ?? 0}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 5, letterSpacing: ".03em" }}>
                      {v} · {st.short}
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  background: C.bg,
                  borderRadius: 8,
                  padding: "12px 16px",
                  minWidth: 96,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{r.tested}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4, color: C.grey }}>
                  ПРОВЕРЕНО
                </div>
              </div>
            </div>
            {r.multi_resistant && (
              <div
                style={{
                  background: "#FDE7E7",
                  color: "#AE2018",
                  border: "1px solid #F3C7C4",
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Устойчивость к {r.r_classes} разным классам препаратов — это картина
                множественной устойчивости. Такой результат врач обычно разбирает особенно
                внимательно.
              </div>
            )}
            {r.text && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>{r.text}</p>}
          </Card>
        )}

        {/* фаги */}
        {!!report.phages?.length && (
          <Card title="Чувствительность к бактериофагам" accent={C.teal}>
            <div style={{ display: "grid", gap: 10 }}>
              {report.phages.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: i ? `1px solid ${C.line}` : "none",
                    paddingTop: i ? 10 : 0,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                  {p.verdict && <Chip v={p.verdict} />}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* S / I / R */}
        {!!report.sir_explainer?.length && (
          <Card title="Что означают S, I и R">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {report.sir_explainer.map((e) => {
                const st = VERDICT_STYLE[e.code] || VERDICT_STYLE.S;
                return (
                  <div
                    key={e.code}
                    style={{
                      background: st.bg,
                      borderRadius: 8,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        color: st.fg,
                        fontWeight: 800,
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      {e.code} — {e.title}
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{e.text}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* про AMR — ядро портала */}
        {!!report.amr_notes?.length && (
          <Card title="Почему это важно знать про устойчивость" accent={C.purple}>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>
              {report.amr_notes.map((n, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.65 }}>
                  {n}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {!!report.questions_for_doctor?.length && (
            <Card title="О чём спросить врача">
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                {report.questions_for_doctor.map((q, i) => (
                  <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                    {q}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {!!report.red_flags?.length && (
            <Card title="Когда к врачу срочно" accent="#AE2018">
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                {report.red_flags.map((f, i) => (
                  <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* главная плашка: не назначаем */}
        <div
          style={{
            background: "#FFF7E6",
            border: "1px solid #F0D9A8",
            borderRadius: 10,
            padding: "18px 22px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mc-head), sans-serif",
              fontWeight: 800,
              fontSize: 14.5,
              color: "#8A5200",
              marginBottom: 8,
            }}
          >
            Сервис не подбирает препарат
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.65, color: "#6B4200" }}>
            {report.no_prescription_note}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#8A5200" }}>
            {report.disclaimer}
          </p>
        </div>

        <div
          className="posev-noprint"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}
        >
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "15px 24px",
              background: C.purple,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            РАЗОБРАТЬ ДРУГОЙ БЛАНК
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: "15px 24px",
              background: "#fff",
              color: C.ink,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            СОХРАНИТЬ В PDF
          </button>
          {/* Идентификатор модели в API-ответе остаётся (нужен нам для разбора
              инцидентов), но заказчику в интерфейсе он ни о чём не говорит и
              только провоцирует разговор про вендора вместо продукта. */}
        </div>
      </div>
    </div>
  );
}

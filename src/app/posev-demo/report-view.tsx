"use client";

/**
 * Презентация расшифровки бак-посева. Общая для двух мест:
 *  - отдельная вкладка /posev-demo/report (основной путь),
 *  - инлайн под виджетом (запасной путь, если браузер заблокировал вкладку).
 *
 * ПАЛИТРА — фирменная med-click.ru: плоский #4000A8, #7119FF, бирюза #00C3C8,
 * коралл. «Палевом ИИ» читается не сам фиолетовый (это бренд заказчика), а его
 * типовая подача: градиентные свечения, glassmorphism, переливы фиолетовый→синий.
 * Поэтому здесь плоские заливки и волосяные границы, без единого градиента.
 * Категории S/I/R — приглушённые зелень / латунь / терракота, а не светофор.
 */

import { useMemo } from "react";

// ─────────────────────────── типы ответа бэкенда ───────────────────────────

export type Verdict = "S" | "I" | "R";

export interface AbxItem {
  drug: string;
  drug_class?: string | null;
  verdict: Verdict;
  mic?: string | null;
  comment?: string | null;
}

export interface PosevReport {
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

export interface ReportMeta {
  model?: string;
  elapsed_ms?: number;
  stored?: boolean;
}

export const V: Record<
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

/**
 * compact — для таблицы: полная подпись «Чувствителен при увел. экспозиции»
 * переносится в две строки и ломает ритм строк.
 */
export function Chip({ v, compact }: { v: Verdict; compact?: boolean }) {
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
    <section id={id} className="pd-block scroll-mt-8">
      <div className="mb-6 border-t border-black/[0.09] pt-5">
        <p className="pd-eyebrow text-[#9A96A6]">{eyebrow}</p>
        <h2 className="pd-display mt-2 text-[24px] font-extrabold leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────── сам отчёт ───────────────────────────

export function ReportView({ report, meta }: { report: PosevReport; meta?: ReportMeta | null }) {
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
        tested > 0 && r.text && ["resistance", "Устойчивость"],
        report.phages?.length && ["phages", "Бактериофаги"],
        report.sir_explainer?.length && ["sir", "S, I и R"],
        report.amr_notes?.length && ["amr", "Про устойчивость"],
        (report.questions_for_doctor?.length || report.red_flags?.length) && ["ask", "Врачу"],
      ].filter(Boolean) as [string, string][],
    [report, tested, r.text]
  );

  return (
    <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-14 lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-16 lg:px-10">
      {/* ── колонка-сводка ──
          min-w-0 обязателен: без него грид-трек раздувается под min-w таблицы
          антибиотикограммы и на мобильном появляется горизонтальный скролл
          всей страницы вместо прокрутки внутри таблицы. */}
      <aside className="pd-rail min-w-0 lg:sticky lg:top-8 lg:self-start">
        <p className="pd-eyebrow text-[#9A96A6]">результат</p>
        <h1 className="pd-display mt-2.5 text-[19px] font-extrabold leading-snug">
          {report.doc_kind || "Бактериологический посев"}
        </h1>

        <dl className="mt-6 space-y-3 border-t border-black/[0.09] pt-5 text-[13px]">
          {report.material && (
            <div>
              <dt className="text-[#86838F]">Биоматериал</dt>
              <dd className="mt-0.5 leading-snug">{report.material}</dd>
            </div>
          )}
          {report.collected_at && (
            <div>
              <dt className="text-[#86838F]">Дата взятия</dt>
              <dd className="mt-0.5">{report.collected_at}</dd>
            </div>
          )}
          {(sexLabel || report.patient?.age != null) && (
            <div>
              <dt className="text-[#86838F]">Пациент</dt>
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
          <section id="summary" className="pd-block scroll-mt-8">
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
                    {p.name_ru && <span className="text-[14.5px] text-[#6B6875]">{p.name_ru}</span>}
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
              <p className="mt-5 max-w-[70ch] text-[12.5px] leading-[1.7] text-[#86838F]">
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
                    <p className="mt-2.5 text-[13.5px] leading-[1.7] text-[#55535E]">{e.text}</p>
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
                  <span className="pd-display shrink-0 text-[20px] font-extrabold tabular-nums text-[#4000A8]/45">
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
        <div className="pd-block rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] p-8">
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
      </div>
    </div>
  );
}

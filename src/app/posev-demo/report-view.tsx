"use client";

/**
 * Презентация расшифровки бак-посева (страница /posev-demo/report).
 *
 * СОЗНАТЕЛЬНО КОНСЕРВАТИВНО. Прошлая версия расползалась: десяток кеглей,
 * шесть уровней серого, курсив, надзаголовки над каждым разделом, липкий
 * сайдбар с оглавлением. Для медицинского документа это шум. Здесь:
 *  - одна колонка, как у лабораторного заключения;
 *  - четыре кегля (24 заголовок / 18 раздел / 15 текст / 13 подписи);
 *  - три уровня серого (ink / secondary / muted) и волосяная линия;
 *  - Manrope только на заголовках, весь текст — интерфейсным шрифтом;
 *  - без курсива и без надзаголовков-эйбрау.
 * Цвет остаётся только там, где он несёт смысл: категории S / I / R.
 */

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
  { tile: string; bar: string; label: string; short: string }
> = {
  S: {
    tile: "bg-[#0B6E5D] text-white",
    bar: "bg-[#0B6E5D]",
    label: "Чувствителен",
    short: "чувствителен",
  },
  I: {
    tile: "bg-[#8A6A2A] text-white",
    bar: "bg-[#B08A3C]",
    label: "Чувствителен при увеличенной экспозиции",
    short: "при увел. экспозиции",
  },
  R: {
    tile: "bg-[#8F3A2F] text-white",
    bar: "bg-[#8F3A2F]",
    label: "Устойчив",
    short: "устойчив",
  },
};

/**
 * Категория как шкала из трёх позиций S | I | R с подсвеченной активной.
 *
 * Почему не подпись словом: подписи «чувствителен» / «при увеличенной
 * экспозиции» / «устойчив» разной длины, и правый край колонки получается
 * рваным, а самый широкий чип достаётся самой редкой категории — вес пятна
 * не совпадает со значимостью. Шкала всегда одной ширины, столбец читается
 * сверху вниз одним взглядом (видно, где сгущаются R), и она самодостаточна:
 * все три буквы видны всегда, активная залита цветом. Расшифровка букв — легендой
 * под таблицей, одной строкой на всю таблицу вместо повтора в каждой строке.
 */
function SirScale({ v }: { v: Verdict }) {
  return (
    <span
      className="inline-flex gap-[3px] align-middle"
      role="img"
      aria-label={V[v].label}
      title={V[v].label}
    >
      {(["S", "I", "R"] as Verdict[]).map((code) => {
        const active = code === v;
        return (
          <span
            key={code}
            className={`grid h-[22px] w-[26px] place-items-center rounded text-[11px] font-bold ${
              active ? V[code].tile : "bg-[#F2F2F4] text-[#C3C3C9]"
            }`}
          >
            {code}
          </span>
        );
      })}
    </span>
  );
}

/**
 * МПК: оператор отделяется от числа и гасится, число печатается таблично.
 * Иначе «> 32» и «≤ 0,25» едут по разным осям и колонка выглядит небрежно.
 * Точка в дробях меняется на запятую — бланки лабораторий русскоязычные.
 */
function Mic({ raw }: { raw?: string | null }) {
  const s = (raw ?? "").trim();
  if (!s || s === "—") return <span className="text-[#C3C3C9]">—</span>;
  const m = s.match(/^([≤≥<>]=?)\s*(.+)$/);
  const op = m ? m[1] : "";
  const num = (m ? m[2] : s).replace(".", ",");
  return (
    <span className="tabular-nums">
      <span className="mr-1 text-[#A9A9B2]">{op}</span>
      {num}
    </span>
  );
}

/** Полоска долей S / I / R — «форма» результата до чтения строк. */
function ShareBar({ s, i, r }: { s: number; i: number; r: number }) {
  const total = s + i + r;
  if (!total) return null;
  const parts: [Verdict, number][] = [
    ["S", s],
    ["I", i],
    ["R", r],
  ];
  return (
    <div className="mb-6">
      <div className="flex h-[6px] w-full overflow-hidden rounded-full bg-[#F2F2F4]">
        {parts.map(([code, n]) =>
          n ? (
            <span
              key={code}
              className={V[code].bar}
              style={{ width: `${(n / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#55555E]">
        {parts.map(([code, n]) => (
          <span key={code} className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-sm ${V[code].bar}`} />
            <span className="font-semibold tabular-nums">{n}</span> {V[code].short}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="pd-block border-t border-[#E5E5E8] pt-7">
      <h2 className="pd-display mb-4 text-[18px] font-bold leading-snug">{title}</h2>
      {children}
    </section>
  );
}

export function ReportView({ report }: { report: PosevReport; meta?: ReportMeta | null }) {
  const r = report.resistance || {};
  const tested = r.tested || 0;
  const sexLabel =
    report.patient?.sex === "male" ? "мужской" : report.patient?.sex === "female" ? "женский" : null;
  const patientLine = [sexLabel, report.patient?.age != null ? `${report.patient.age} лет` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="mx-auto max-w-[860px] px-6 py-12 text-[15px] leading-[1.65] text-[#1A1A1F]">
      <h1 className="pd-display text-[24px] font-bold leading-snug">
        {report.doc_kind || "Бактериологический посев"}
      </h1>

      <dl className="mt-6 grid gap-x-8 gap-y-2 border-t border-[#E5E5E8] pt-5 text-[13px] sm:grid-cols-[max-content_1fr]">
        {report.material && (
          <>
            <dt className="text-[#8A8A93]">Что исследовали</dt>
            <dd>{report.material}</dd>
          </>
        )}
        {report.collected_at && (
          <>
            <dt className="text-[#8A8A93]">Дата взятия</dt>
            <dd>{report.collected_at}</dd>
          </>
        )}
        {patientLine && (
          <>
            <dt className="text-[#8A8A93]">Пациент</dt>
            <dd>{patientLine}</dd>
          </>
        )}
      </dl>

      <div className="mt-10 space-y-10">
        {report.plain_summary && (
          <section id="summary" className="pd-block border-t border-[#E5E5E8] pt-7">
            <p className="max-w-[68ch]">{report.plain_summary}</p>
          </section>
        )}

        {!!report.pathogens?.length && (
          <Section id="growth" title="Что выросло">
            <div className="space-y-6">
              {report.pathogens.map((p, i) => (
                <div key={i} className={i ? "border-t border-[#EFEFF1] pt-6" : ""}>
                  <p className="font-semibold">
                    {p.name_latin}
                    {p.name_ru ? ` — ${p.name_ru}` : ""}
                    {p.count ? ` · ${p.count}` : ""}
                  </p>
                  {p.about && <p className="mt-2 max-w-[68ch]">{p.about}</p>}
                  {p.significance_text && (
                    <p className="mt-2 max-w-[68ch] text-[#55555E]">{p.significance_text}</p>
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
              title={`Таблица чувствительности${group.pathogen ? ` · ${group.pathogen}` : ""}`}
            >
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[460px] border-collapse text-[14px]">
                  {/* Фиксированные колонки: числа и шкала не должны «плавать»
                      от длины названия препарата. */}
                  <colgroup>
                    <col />
                    <col style={{ width: 104 }} />
                    <col style={{ width: 104 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-[#E5E5E8]">
                      <th className="pb-2.5 pr-4 text-left text-[13px] font-normal text-[#8A8A93]">
                        Препарат
                      </th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 text-right text-[13px] font-normal text-[#8A8A93]">
                        МПК, мг/л
                      </th>
                      <th className="pb-2.5 text-left text-[13px] font-normal text-[#8A8A93]">
                        Категория
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(group.items || []).map((it, i) => (
                      <tr key={i} className="pd-row border-b border-[#EFEFF1] align-middle">
                        <td className="py-3 pr-4">
                          <span className="block leading-snug">{it.drug}</span>
                          {it.drug_class && (
                            <span className="mt-0.5 block text-[12.5px] leading-snug text-[#8A8A93]">
                              {it.drug_class}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right">
                          <Mic raw={it.mic} />
                        </td>
                        <td className="py-3">
                          <SirScale v={it.verdict} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#55555E]">
                {(["S", "I", "R"] as Verdict[]).map((code) => (
                  <span key={code} className="inline-flex items-center gap-2">
                    <span
                      className={`grid h-[18px] w-[20px] place-items-center rounded-sm text-[10.5px] font-bold ${V[code].tile}`}
                    >
                      {code}
                    </span>
                    {V[code].label.toLowerCase()}
                  </span>
                ))}
              </p>
              <p className="mt-3 max-w-[68ch] text-[13px] text-[#8A8A93]">
                МПК — наименьшая концентрация препарата, которая остановила рост микроба в
                лаборатории. Сравнивать эти числа между разными препаратами нельзя: у каждого
                свои пороговые значения.
              </p>
            </Section>
          ))}

        {tested > 0 && (
          <Section id="resistance" title="Устойчивость">
            {/* Раскладка по категориям — графикой, а не перечислением в строку:
                соотношение S/I/R считывается до чтения текста. */}
            <p className="mb-3 text-[13px] text-[#8A8A93]">
              Всего проверено препаратов — <span className="tabular-nums">{tested}</span>
            </p>
            <ShareBar s={r.s ?? 0} i={r.i ?? 0} r={r.r ?? 0} />
            {r.multi_resistant && (
              <p className="max-w-[68ch] border-l-2 border-[#8F3A2F] pl-4 text-[#8A372C]">
                Устойчивость к {r.r_classes} классам препаратов — картина множественной
                устойчивости.
              </p>
            )}
            {r.text && <p className="mt-4 max-w-[68ch]">{r.text}</p>}
          </Section>
        )}

        {!!report.phages?.length && (
          <Section id="phages" title="Бактериофаги">
            <table className="w-full border-collapse text-[14px]">
              <tbody>
                {report.phages.map((p, i) => (
                  <tr key={i} className="border-b border-[#EFEFF1]">
                    <td className="py-2.5 pr-4">{p.name}</td>
                    <td className="w-px whitespace-nowrap py-2.5 text-right">
                      {p.verdict && <SirScale v={p.verdict} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {!!report.sir_explainer?.length && (
          <Section id="sir" title="Что означают S, I и R">
            <dl className="space-y-4">
              {report.sir_explainer.map((e) => {
                const st = V[e.code] || V.S;
                return (
                  <div key={e.code}>
                    <dt className="flex items-center gap-2 font-semibold">
                      <span
                        className={`grid h-[18px] w-[18px] place-items-center rounded-sm text-[11px] font-bold ${st.tile}`}
                      >
                        {e.code}
                      </span>
                      {e.title}
                    </dt>
                    <dd className="mt-1 max-w-[68ch] text-[#55555E]">{e.text}</dd>
                  </div>
                );
              })}
            </dl>
          </Section>
        )}

        {!!report.amr_notes?.length && (
          <Section id="amr" title="Почему это важно знать">
            <ol className="max-w-[68ch] list-decimal space-y-3 pl-5">
              {report.amr_notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ol>
          </Section>
        )}

        {!!report.questions_for_doctor?.length && (
          <Section id="ask" title="О чём спросить врача">
            <ul className="max-w-[68ch] list-disc space-y-2 pl-5">
              {report.questions_for_doctor.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Section>
        )}

        {!!report.red_flags?.length && (
          <Section id="urgent" title="Когда к врачу срочно">
            <ul className="max-w-[68ch] list-disc space-y-2 pl-5">
              {report.red_flags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* граница продукта, а не косметика */}
        <section className="pd-block border-t border-[#E5E5E8] pt-7">
          <h2 className="pd-display mb-4 text-[18px] font-bold leading-snug">
            Портал не подбирает препарат
          </h2>
          <p className="max-w-[68ch]">{report.no_prescription_note}</p>
          <p className="mt-3 max-w-[68ch] text-[13px] text-[#8A8A93]">{report.disclaimer}</p>
        </section>
      </div>
    </article>
  );
}

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

export const V: Record<Verdict, { tile: string; chip: string; label: string; short: string }> = {
  S: {
    tile: "bg-[#0B6E5D] text-white",
    chip: "bg-[#EAF4F1] text-[#0A6153]",
    label: "Чувствителен",
    short: "чувствителен",
  },
  I: {
    tile: "bg-[#8A6A2A] text-white",
    chip: "bg-[#F8F1E1] text-[#7A5920]",
    label: "Чувствителен при увеличенной экспозиции",
    short: "при увел. экспозиции",
  },
  R: {
    tile: "bg-[#8F3A2F] text-white",
    chip: "bg-[#F9ECE9] text-[#8A372C]",
    label: "Устойчив",
    short: "устойчив",
  },
};

function Chip({ v, compact }: { v: Verdict; compact?: boolean }) {
  const st = V[v];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded py-0.5 pl-0.5 pr-2 text-[13px] ${
        compact ? "whitespace-nowrap" : ""
      } ${st.chip}`}
    >
      <span
        className={`grid h-[18px] w-[18px] place-items-center rounded-sm text-[11px] font-bold ${st.tile}`}
      >
        {v}
      </span>
      {compact ? st.short : st.label}
    </span>
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
            <dt className="text-[#8A8A93]">Биоматериал</dt>
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
              title={`Чувствительность${group.pathogen ? ` · ${group.pathogen}` : ""}`}
            >
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[540px] border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-[#E5E5E8]">
                      {["Препарат", "Класс", "МПК, мг/л", "Категория"].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap pb-2.5 pr-4 text-left text-[13px] font-normal text-[#8A8A93]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(group.items || []).map((it, i) => (
                      <tr key={i} className="pd-row border-b border-[#EFEFF1]">
                        <td className="py-2.5 pr-4">{it.drug}</td>
                        <td className="py-2.5 pr-4 text-[#55555E]">{it.drug_class || "—"}</td>
                        <td className="whitespace-nowrap py-2.5 pr-4">{it.mic || "—"}</td>
                        <td className="py-2.5">
                          <Chip v={it.verdict} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[68ch] text-[13px] text-[#8A8A93]">
                МПК — минимальная подавляющая концентрация. Сравнивать числа МПК между разными
                препаратами нельзя: у каждого свои пороги.
              </p>
            </Section>
          ))}

        {tested > 0 && (
          <Section id="resistance" title="Устойчивость">
            <p>
              Проверено препаратов: {tested}. Чувствителен — {r.s ?? 0}, чувствителен при
              увеличенной экспозиции — {r.i ?? 0}, устойчив — {r.r ?? 0}.
            </p>
            {r.multi_resistant && (
              <p className="mt-3 max-w-[68ch] text-[#8A372C]">
                Устойчивость к {r.r_classes} классам препаратов — картина множественной
                устойчивости.
              </p>
            )}
            {r.text && <p className="mt-3 max-w-[68ch]">{r.text}</p>}
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
                      {p.verdict && <Chip v={p.verdict} compact />}
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
            Сервис не подбирает препарат
          </h2>
          <p className="max-w-[68ch]">{report.no_prescription_note}</p>
          <p className="mt-3 max-w-[68ch] text-[13px] text-[#8A8A93]">{report.disclaimer}</p>
        </section>
      </div>
    </article>
  );
}

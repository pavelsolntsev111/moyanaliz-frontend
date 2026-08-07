"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Info, RotateCcw } from "lucide-react";
import { getEngine, type Tone } from "@/lib/calculators-engine";

/**
 * Интерактивный калькулятор. Считает ПОЛНОСТЬЮ в браузере: введённые цифры никуда
 * не отправляются — это и честнее по отношению к медданным, и снимает вопрос про 152-ФЗ.
 */

const toneStyles: Record<Tone, string> = {
  good: "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400",
  warn: "border-amber-500/25 bg-amber-500/[0.07] text-amber-700 dark:text-amber-400",
  bad: "border-rose-500/25 bg-rose-500/[0.07] text-rose-700 dark:text-rose-400",
  neutral: "border-border bg-muted/60 text-foreground",
};

interface Props {
  /** Только slug: сам движок содержит функцию compute, а функции нельзя передать
   *  из серверного компонента в клиентский — поэтому резолвим его здесь, на клиенте. */
  slug: string;
  /** заголовок над блоком результата */
  resultLabel?: string;
}

export function CalculatorWidget({ slug, resultLabel = "Результат" }: Props) {
  const engine = getEngine(slug);

  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    for (const f of engine?.fields ?? [])
      if (f.type === "select") o[f.key] = f.def ?? f.options?.[0]?.value ?? "";
    return o;
  }, [engine]);

  const [values, setValues] = useState<Record<string, string>>(initial);

  const result = useMemo(
    () => (engine ? engine.compute(values) : { value: null, display: "—" }),
    [engine, values]
  );

  if (!engine) return null;

  const filled = engine.fields.every(
    (f) => f.type === "select" || (values[f.key] ?? "").trim() !== "" || f.hint?.includes("оставьте 0")
  );
  const show = filled && (result.value !== null || Boolean(result.note));

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {engine.fields.map((f) => (
          <div key={f.key} className={f.type === "select" ? "sm:col-span-2" : ""}>
            <label
              htmlFor={`calc-${f.key}`}
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {f.label}
              {f.unit && <span className="ml-1 font-normal text-muted-foreground">, {f.unit}</span>}
            </label>

            {f.type === "select" ? (
              <select
                id={`calc-${f.key}`}
                value={values[f.key] ?? f.def ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`calc-${f.key}`}
                type="number"
                inputMode="decimal"
                min={f.min}
                max={f.max}
                step={f.step ?? "any"}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder="—"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
          </div>
        ))}
      </div>

      {/* результат */}
      <div className="mt-5 border-t border-border/70 pt-5">
        {show ? (
          <>
            {result.value !== null && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm text-muted-foreground">{resultLabel}:</span>
                <span className="text-2xl font-bold text-foreground">{result.display}</span>
              </div>
            )}
            {result.band && (
              <div
                className={`mt-3 rounded-xl border px-4 py-3 text-sm font-medium ${toneStyles[result.band.tone]}`}
              >
                {result.band.label}
              </div>
            )}
            {result.note && (
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{result.note}</span>
              </p>
            )}

            {/* мост в воронку: человек уже смотрит в свой бланк */}
            <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
              <p className="text-sm font-semibold text-foreground">
                Разобрать весь бланк целиком, а не один показатель
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Загрузите фото или PDF анализа — ИИ объяснит каждый показатель с учётом пола и возраста.
              </p>
              <Link
                href="/?ref=calc"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Расшифровать анализ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              onClick={() => setValues(initial)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Сбросить
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Заполните поля выше — расчёт появится здесь. Значения не покидают ваш браузер.
          </p>
        )}
      </div>
    </div>
  );
}

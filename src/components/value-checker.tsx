"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";

/**
 * «Проверь своё значение» на странице показателя.
 *
 * Смысл: страница уже ранжируется и содержит нормы, но читать их глазами неудобно —
 * человек с бланком хочет просто вбить своё число. Считаем ПРЯМО В БРАУЗЕРЕ, ничего
 * не отправляем. Референсы берём из данных страницы: единой «нормы» не существует,
 * поэтому в тексте прямо просим сверяться с колонкой своей лаборатории.
 */

interface Props {
  indicatorName: string;
  unit?: string;
  /** «12.0-16.0», «до 5.0», «менее 1,1» и т.п. — как записано в данных показателя */
  male?: string;
  female?: string;
}

/** Разбирает строку референса в числовой диапазон. Возвращает null, если не смогли. */
function parseRange(s?: string): { lo?: number; hi?: number } | null {
  if (!s) return null;
  const t = s.replace(",", ".").replace(/\s+/g, " ").toLowerCase();
  const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!nums.length) return null;
  if (/^(до|менее|меньше|<)/.test(t) || t.startsWith("<")) return { hi: nums[0] };
  if (/^(от|более|больше|>)/.test(t) && nums.length === 1) return { lo: nums[0] };
  if (nums.length >= 2) return { lo: Math.min(nums[0], nums[1]), hi: Math.max(nums[0], nums[1]) };
  return { lo: nums[0], hi: nums[0] };
}

export function ValueChecker({ indicatorName, unit, male, female }: Props) {
  const [sex, setSex] = useState<"f" | "m">("f");
  const [raw, setRaw] = useState("");

  const ref = useMemo(() => parseRange(sex === "f" ? female : male), [sex, female, male]);
  const refText = (sex === "f" ? female : male) || "—";

  const verdict = useMemo(() => {
    const v = Number.parseFloat(raw.replace(",", "."));
    if (!Number.isFinite(v) || !ref) return null;
    if (ref.lo !== undefined && v < ref.lo)
      return { tone: "low" as const, label: "Ниже референсного интервала" };
    if (ref.hi !== undefined && v > ref.hi)
      return { tone: "high" as const, label: "Выше референсного интервала" };
    return { tone: "in" as const, label: "В пределах референсного интервала" };
  }, [raw, ref]);

  const tone =
    verdict?.tone === "in"
      ? "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400"
      : "border-amber-500/25 bg-amber-500/[0.07] text-amber-700 dark:text-amber-400";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04]">
      <h2 className="text-base font-semibold text-foreground">
        Проверьте своё значение
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Введите цифру из бланка — сравним с ориентировочным интервалом. Считаем в браузере,
        значение никуда не отправляется.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="vc-sex" className="mb-1.5 block text-sm font-medium text-foreground">
            Пол
          </label>
          <select
            id="vc-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as "f" | "m")}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="f">Женский</option>
            <option value="m">Мужской</option>
          </select>
        </div>
        <div>
          <label htmlFor="vc-val" className="mb-1.5 block text-sm font-medium text-foreground">
            {indicatorName}
            {unit && <span className="ml-1 font-normal text-muted-foreground">, {unit}</span>}
          </label>
          <input
            id="vc-val"
            type="number"
            inputMode="decimal"
            step="any"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="ваше значение"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Ориентир для сравнения: <span className="font-medium text-foreground">{refText}</span>
      </p>

      {verdict && (
        <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-medium ${tone}`}>
          {verdict.label}
        </div>
      )}

      {verdict && (
        <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Это ориентир, а не оценка здоровья: у каждой лаборатории свои референсы, и они
            зависят от метода, возраста и состояния. Сверяйте с колонкой в своём бланке, а
            трактовать отклонение должен врач.
          </span>
        </p>
      )}
    </div>
  );
}

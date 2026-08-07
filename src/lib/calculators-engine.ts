/**
 * Медицинские калькуляторы — поля ввода, формулы и зоны результата.
 *
 * Здесь ТОЛЬКО математика и структура: формулы написаны и проверены вручную по
 * клиническим источникам, тексты живут отдельно в calculators-content.ts (их пишет
 * контент-пайплайн). Такое разделение сделано намеренно — прозу можно перегенерировать
 * без риска задеть расчёт.
 *
 * Единицы: по умолчанию российские лабораторные (ммоль/л, мкмоль/л, Ед/л, г/л).
 * Формулы, определённые в мг/дл, конвертируются внутри — коэффициенты подписаны.
 */

export type Tone = "good" | "warn" | "bad" | "neutral";

export interface CalcField {
  key: string;
  label: string;
  unit?: string;
  type?: "number" | "select";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  /** значение по умолчанию для select */
  def?: string;
}

export interface CalcBand {
  /** нижняя граница включительно */
  from?: number;
  /** верхняя граница НЕ включительно */
  to?: number;
  label: string;
  tone: Tone;
}

export interface CalcResult {
  value: number | null;
  /** отформатированное значение с единицей */
  display: string;
  band?: CalcBand;
  /** предупреждение о неприменимости формулы и т.п. */
  note?: string;
}

export interface CalcEngine {
  slug: string;
  /** группа для хаба */
  group: string;
  /** короткое имя для карточки на хабе */
  short: string;
  fields: CalcField[];
  bands: CalcBand[];
  /** единица результата, показывается рядом с числом */
  unit?: string;
  compute: (v: Record<string, string>) => CalcResult;
}

/* ─── helpers ─── */

const num = (v: Record<string, string>, k: string): number => {
  const raw = (v[k] ?? "").toString().replace(",", ".").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : NaN;
};

const bandFor = (bands: CalcBand[], value: number): CalcBand | undefined =>
  bands.find(
    (b) =>
      (b.from === undefined || value >= b.from) &&
      (b.to === undefined || value < b.to)
  );

const fmt = (n: number, digits = 2): string => {
  const r = Number(n.toFixed(digits));
  return String(r).replace(".", ",");
};

/** мкмоль/л → мг/дл для креатинина */
const creaToMgDl = (umol: number) => umol / 88.4;

const SEX: CalcField = {
  key: "sex",
  label: "Пол",
  type: "select",
  def: "f",
  options: [
    { value: "f", label: "Женский" },
    { value: "m", label: "Мужской" },
  ],
};

/* ─── калькуляторы ─── */

export const engines: CalcEngine[] = [
  {
    slug: "skf-ckd-epi",
    group: "Почки",
    short: "СКФ (CKD-EPI 2021)",
    unit: "мл/мин/1,73 м²",
    fields: [
      { key: "crea", label: "Креатинин", unit: "мкмоль/л", min: 10, max: 2000, step: 0.1 },
      { key: "age", label: "Возраст", unit: "лет", min: 18, max: 110, step: 1 },
      SEX,
    ],
    // CKD-EPI 2021 (без расовой поправки): 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^возраст × 1.012 (жен)
    bands: [
      { from: 90, label: "Норма или высокая (С1)", tone: "good" },
      { from: 60, to: 90, label: "Незначительно снижена (С2)", tone: "warn" },
      { from: 45, to: 60, label: "Умеренно снижена (С3а)", tone: "warn" },
      { from: 30, to: 45, label: "Существенно снижена (С3б)", tone: "bad" },
      { from: 15, to: 30, label: "Резко снижена (С4)", tone: "bad" },
      { to: 15, label: "Почечная недостаточность (С5)", tone: "bad" },
    ],
    compute: (v) => {
      const crea = num(v, "crea"), age = num(v, "age");
      const female = (v.sex ?? "f") === "f";
      if (!Number.isFinite(crea) || !Number.isFinite(age) || crea <= 0 || age <= 0)
        return { value: null, display: "—" };
      const scr = creaToMgDl(crea);
      const k = female ? 0.7 : 0.9;
      const a = female ? -0.241 : -0.302;
      const r = scr / k;
      const egfr =
        142 *
        Math.pow(Math.min(r, 1), a) *
        Math.pow(Math.max(r, 1), -1.2) *
        Math.pow(0.9938, age) *
        (female ? 1.012 : 1);
      return {
        value: egfr,
        display: `${fmt(egfr, 0)} мл/мин/1,73 м²`,
        band: bandFor([
          { from: 90, label: "Норма или высокая (С1)", tone: "good" },
          { from: 60, to: 90, label: "Незначительно снижена (С2)", tone: "warn" },
          { from: 45, to: 60, label: "Умеренно снижена (С3а)", tone: "warn" },
          { from: 30, to: 45, label: "Существенно снижена (С3б)", tone: "bad" },
          { from: 15, to: 30, label: "Резко снижена (С4)", tone: "bad" },
          { to: 15, label: "Почечная недостаточность (С5)", tone: "bad" },
        ], egfr),
        note:
          age < 18
            ? "Формула рассчитана на взрослых. Для детей используйте калькулятор по формуле Шварца."
            : undefined,
      };
    },
  },

  {
    slug: "klirens-kreatinina",
    group: "Почки",
    short: "Клиренс креатинина",
    unit: "мл/мин",
    fields: [
      { key: "crea", label: "Креатинин", unit: "мкмоль/л", min: 10, max: 2000, step: 0.1 },
      { key: "age", label: "Возраст", unit: "лет", min: 18, max: 110, step: 1 },
      { key: "weight", label: "Вес", unit: "кг", min: 20, max: 250, step: 0.1 },
      SEX,
    ],
    // Кокрофт—Голт: ((140 − возраст) × вес × 0.85 для женщин) / (72 × Scr мг/дл)
    bands: [
      { from: 90, label: "Норма", tone: "good" },
      { from: 60, to: 90, label: "Лёгкое снижение", tone: "warn" },
      { from: 30, to: 60, label: "Умеренное снижение", tone: "bad" },
      { from: 15, to: 30, label: "Выраженное снижение", tone: "bad" },
      { to: 15, label: "Почечная недостаточность", tone: "bad" },
    ],
    compute: (v) => {
      const crea = num(v, "crea"), age = num(v, "age"), w = num(v, "weight");
      const female = (v.sex ?? "f") === "f";
      if (![crea, age, w].every(Number.isFinite) || crea <= 0 || age <= 0 || w <= 0)
        return { value: null, display: "—" };
      const cl = ((140 - age) * w * (female ? 0.85 : 1)) / (72 * creaToMgDl(crea));
      return {
        value: cl,
        display: `${fmt(cl, 0)} мл/мин`,
        band: bandFor(
          [
            { from: 90, label: "Норма", tone: "good" as Tone },
            { from: 60, to: 90, label: "Лёгкое снижение", tone: "warn" as Tone },
            { from: 30, to: 60, label: "Умеренное снижение", tone: "bad" as Tone },
            { from: 15, to: 30, label: "Выраженное снижение", tone: "bad" as Tone },
            { to: 15, label: "Почечная недостаточность", tone: "bad" as Tone },
          ],
          cl
        ),
        note: "Формула использует фактический вес и при ожирении завышает результат.",
      };
    },
  },

  {
    slug: "homa-ir",
    group: "Обмен веществ",
    short: "Индекс HOMA-IR",
    fields: [
      { key: "glu", label: "Глюкоза натощак", unit: "ммоль/л", min: 1, max: 40, step: 0.01 },
      { key: "ins", label: "Инсулин натощак", unit: "мкЕд/мл", min: 0.1, max: 300, step: 0.01 },
    ],
    bands: [
      { to: 2.7, label: "В пределах обычных значений", tone: "good" },
      { from: 2.7, to: 3.9, label: "Пограничный результат", tone: "warn" },
      { from: 3.9, label: "Вероятна инсулинорезистентность", tone: "bad" },
    ],
    compute: (v) => {
      const g = num(v, "glu"), i = num(v, "ins");
      if (![g, i].every(Number.isFinite) || g <= 0 || i <= 0) return { value: null, display: "—" };
      const r = (g * i) / 22.5;
      return {
        value: r,
        display: fmt(r),
        band: bandFor(
          [
            { to: 2.7, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 2.7, to: 3.9, label: "Пограничный результат", tone: "warn" as Tone },
            { from: 3.9, label: "Вероятна инсулинорезистентность", tone: "bad" as Tone },
          ],
          r
        ),
        note: "Оба показателя должны быть сданы строго натощак, из одной пробы.",
      };
    },
  },

  {
    slug: "lpnp-fridvald",
    group: "Липиды",
    short: "ЛПНП по Фридвальду",
    unit: "ммоль/л",
    fields: [
      { key: "tc", label: "Общий холестерин", unit: "ммоль/л", min: 1, max: 30, step: 0.01 },
      { key: "hdl", label: "ЛПВП", unit: "ммоль/л", min: 0.1, max: 10, step: 0.01 },
      { key: "tg", label: "Триглицериды", unit: "ммоль/л", min: 0.1, max: 30, step: 0.01 },
    ],
    bands: [
      { to: 3, label: "Оптимально при низком сердечно-сосудистом риске", tone: "good" },
      { from: 3, to: 4, label: "Повышен", tone: "warn" },
      { from: 4, label: "Высокий", tone: "bad" },
    ],
    compute: (v) => {
      const tc = num(v, "tc"), hdl = num(v, "hdl"), tg = num(v, "tg");
      if (![tc, hdl, tg].every(Number.isFinite)) return { value: null, display: "—" };
      if (tg > 4.5)
        return {
          value: null,
          display: "—",
          note:
            "При триглицеридах выше 4,5 ммоль/л формула Фридвальда неприменима — ЛПНП нужно измерять прямым методом.",
        };
      const ldl = tc - hdl - tg / 2.2;
      return {
        value: ldl,
        display: `${fmt(ldl)} ммоль/л`,
        band: bandFor(
          [
            { to: 3, label: "Оптимально при низком сердечно-сосудистом риске", tone: "good" as Tone },
            { from: 3, to: 4, label: "Повышен", tone: "warn" as Tone },
            { from: 4, label: "Высокий", tone: "bad" as Tone },
          ],
          ldl
        ),
        note: "Целевой уровень ЛПНП зависит от сердечно-сосудистого риска и определяется врачом.",
      };
    },
  },

  {
    slug: "koefficient-aterogennosti",
    group: "Липиды",
    short: "Коэффициент атерогенности",
    fields: [
      { key: "tc", label: "Общий холестерин", unit: "ммоль/л", min: 1, max: 30, step: 0.01 },
      { key: "hdl", label: "ЛПВП", unit: "ммоль/л", min: 0.1, max: 10, step: 0.01 },
    ],
    bands: [
      { to: 3, label: "Низкий риск", tone: "good" },
      { from: 3, to: 4, label: "Умеренный риск", tone: "warn" },
      { from: 4, label: "Высокий риск", tone: "bad" },
    ],
    compute: (v) => {
      const tc = num(v, "tc"), hdl = num(v, "hdl");
      if (![tc, hdl].every(Number.isFinite) || hdl <= 0) return { value: null, display: "—" };
      const ka = (tc - hdl) / hdl;
      return {
        value: ka,
        display: fmt(ka),
        band: bandFor(
          [
            { to: 3, label: "Низкий риск", tone: "good" as Tone },
            { from: 3, to: 4, label: "Умеренный риск", tone: "warn" as Tone },
            { from: 4, label: "Высокий риск", tone: "bad" as Tone },
          ],
          ka
        ),
      };
    },
  },

  {
    slug: "ne-lpvp-holesterin",
    group: "Липиды",
    short: "Не-ЛПВП холестерин",
    unit: "ммоль/л",
    fields: [
      { key: "tc", label: "Общий холестерин", unit: "ммоль/л", min: 1, max: 30, step: 0.01 },
      { key: "hdl", label: "ЛПВП", unit: "ммоль/л", min: 0.1, max: 10, step: 0.01 },
    ],
    bands: [
      { to: 3.8, label: "Оптимально при низком риске", tone: "good" },
      { from: 3.8, to: 4.9, label: "Повышен", tone: "warn" },
      { from: 4.9, label: "Высокий", tone: "bad" },
    ],
    compute: (v) => {
      const tc = num(v, "tc"), hdl = num(v, "hdl");
      if (![tc, hdl].every(Number.isFinite)) return { value: null, display: "—" };
      const x = tc - hdl;
      return {
        value: x,
        display: `${fmt(x)} ммоль/л`,
        band: bandFor(
          [
            { to: 3.8, label: "Оптимально при низком риске", tone: "good" as Tone },
            { from: 3.8, to: 4.9, label: "Повышен", tone: "warn" as Tone },
            { from: 4.9, label: "Высокий", tone: "bad" as Tone },
          ],
          x
        ),
        note: "В отличие от ЛПНП, считается при любых триглицеридах и не требует сдачи натощак.",
      };
    },
  },

  {
    slug: "koefficient-de-ritisa",
    group: "Печень",
    short: "Коэффициент де Ритиса",
    fields: [
      { key: "ast", label: "АСТ", unit: "Ед/л", min: 1, max: 5000, step: 0.1 },
      { key: "alt", label: "АЛТ", unit: "Ед/л", min: 1, max: 5000, step: 0.1 },
    ],
    bands: [
      { to: 1, label: "Меньше 1", tone: "neutral" },
      { from: 1, to: 2, label: "От 1 до 2", tone: "neutral" },
      { from: 2, label: "Больше 2", tone: "warn" },
    ],
    compute: (v) => {
      const ast = num(v, "ast"), alt = num(v, "alt");
      if (![ast, alt].every(Number.isFinite) || alt <= 0) return { value: null, display: "—" };
      const r = ast / alt;
      return {
        value: r,
        display: fmt(r),
        band: bandFor(
          [
            { to: 1, label: "Меньше 1", tone: "neutral" as Tone },
            { from: 1, to: 2, label: "От 1 до 2", tone: "neutral" as Tone },
            { from: 2, label: "Больше 2", tone: "warn" as Tone },
          ],
          r
        ),
        note: "Коэффициент имеет смысл только когда сами АСТ и АЛТ выходят за референс.",
      };
    },
  },

  {
    slug: "nasyshchenie-transferrina",
    group: "Железо",
    short: "Насыщение трансферрина (TSAT)",
    unit: "%",
    fields: [
      { key: "iron", label: "Железо сыворотки", unit: "мкмоль/л", min: 0.5, max: 100, step: 0.01 },
      {
        key: "mode",
        label: "Второй показатель",
        type: "select",
        def: "tibc",
        options: [
          { value: "tibc", label: "ОЖСС (мкмоль/л)" },
          { value: "trf", label: "Трансферрин (г/л)" },
        ],
      },
      { key: "second", label: "Значение", min: 0.1, max: 200, step: 0.01 },
    ],
    bands: [
      { to: 20, label: "Низкое — вероятен дефицит железа", tone: "bad" },
      { from: 20, to: 45, label: "В пределах обычных значений", tone: "good" },
      { from: 45, label: "Высокое — возможна перегрузка железом", tone: "warn" },
    ],
    compute: (v) => {
      const iron = num(v, "iron"), second = num(v, "second");
      if (![iron, second].every(Number.isFinite) || second <= 0) return { value: null, display: "—" };
      // трансферрин г/л → ОЖСС мкмоль/л: ×25.1
      const tibc = (v.mode ?? "tibc") === "trf" ? second * 25.1 : second;
      const t = (iron / tibc) * 100;
      return {
        value: t,
        display: `${fmt(t, 1)} %`,
        band: bandFor(
          [
            { to: 20, label: "Низкое — вероятен дефицит железа", tone: "bad" as Tone },
            { from: 20, to: 45, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 45, label: "Высокое — возможна перегрузка железом", tone: "warn" as Tone },
          ],
          t
        ),
        note: "Железо сыворотки колеблется в течение суток — сдавать утром натощак.",
      };
    },
  },

  {
    slug: "deficit-zheleza-ganzoni",
    group: "Железо",
    short: "Дефицит железа (Ганзони)",
    unit: "мг",
    fields: [
      { key: "weight", label: "Вес", unit: "кг", min: 10, max: 250, step: 0.1 },
      { key: "hb", label: "Текущий гемоглобин", unit: "г/л", min: 20, max: 200, step: 1 },
      { key: "target", label: "Целевой гемоглобин", unit: "г/л", min: 80, max: 180, step: 1, hint: "обычно 130–150" },
    ],
    bands: [],
    compute: (v) => {
      const w = num(v, "weight"), hb = num(v, "hb"), t = num(v, "target");
      if (![w, hb, t].every(Number.isFinite) || w <= 0) return { value: null, display: "—" };
      if (t <= hb)
        return { value: null, display: "—", note: "Целевой гемоглобин должен быть выше текущего." };
      // Ганзони: вес × (целевой − текущий, г/дл) × 2.4 + депо (500 мг при весе ≥35 кг)
      const depot = w >= 35 ? 500 : 15 * w;
      const total = w * ((t - hb) / 10) * 2.4 + depot;
      return {
        value: total,
        display: `${fmt(total, 0)} мг`,
        note:
          "Это ориентир общего дефицита, а не схема лечения: препарат, путь введения и дозу подбирает только врач.",
      };
    },
  },

  {
    slug: "indeks-mentzera",
    group: "Кровь",
    short: "Индекс Ментцера",
    fields: [
      { key: "mcv", label: "MCV (средний объём эритроцита)", unit: "фл", min: 40, max: 140, step: 0.1 },
      { key: "rbc", label: "Эритроциты", unit: "×10¹²/л", min: 1, max: 10, step: 0.01 },
    ],
    bands: [
      { to: 13, label: "Меньше 13 — картина ближе к талассемии", tone: "warn" },
      { from: 13, label: "Больше 13 — картина ближе к дефициту железа", tone: "warn" },
    ],
    compute: (v) => {
      const mcv = num(v, "mcv"), rbc = num(v, "rbc");
      if (![mcv, rbc].every(Number.isFinite) || rbc <= 0) return { value: null, display: "—" };
      const m = mcv / rbc;
      return {
        value: m,
        display: fmt(m, 1),
        band: bandFor(
          [
            { to: 13, label: "Меньше 13 — картина ближе к талассемии", tone: "warn" as Tone },
            { from: 13, label: "Больше 13 — картина ближе к дефициту железа", tone: "warn" as Tone },
          ],
          m
        ),
        note:
          "Индекс — только подсказка направления. Он не заменяет ферритин и электрофорез гемоглобина.",
      };
    },
  },

  {
    slug: "skorrektirovannyj-kalcij",
    group: "Обмен веществ",
    short: "Скорректированный кальций",
    unit: "ммоль/л",
    fields: [
      { key: "ca", label: "Кальций общий", unit: "ммоль/л", min: 0.5, max: 5, step: 0.01 },
      { key: "alb", label: "Альбумин", unit: "г/л", min: 5, max: 70, step: 0.1 },
    ],
    bands: [
      { to: 2.15, label: "Ниже обычного коридора", tone: "bad" },
      { from: 2.15, to: 2.55, label: "В пределах обычных значений", tone: "good" },
      { from: 2.55, label: "Выше обычного коридора", tone: "bad" },
    ],
    compute: (v) => {
      const ca = num(v, "ca"), alb = num(v, "alb");
      if (![ca, alb].every(Number.isFinite)) return { value: null, display: "—" };
      const c = ca + 0.02 * (40 - alb);
      return {
        value: c,
        display: `${fmt(c)} ммоль/л`,
        band: bandFor(
          [
            { to: 2.15, label: "Ниже обычного коридора", tone: "bad" as Tone },
            { from: 2.15, to: 2.55, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 2.55, label: "Выше обычного коридора", tone: "bad" as Tone },
          ],
          c
        ),
        note: "Точнее всего состояние отражает ионизированный кальций, если его можно сдать.",
      };
    },
  },

  {
    slug: "osmolyarnost-plazmy",
    group: "Обмен веществ",
    short: "Осмолярность плазмы",
    unit: "мОсм/л",
    fields: [
      { key: "na", label: "Натрий", unit: "ммоль/л", min: 90, max: 200, step: 0.1 },
      { key: "glu", label: "Глюкоза", unit: "ммоль/л", min: 0.5, max: 60, step: 0.01 },
      { key: "urea", label: "Мочевина", unit: "ммоль/л", min: 0.5, max: 60, step: 0.01 },
    ],
    bands: [
      { to: 275, label: "Ниже обычного коридора", tone: "warn" },
      { from: 275, to: 295, label: "В пределах обычных значений", tone: "good" },
      { from: 295, label: "Выше обычного коридора", tone: "warn" },
    ],
    compute: (v) => {
      const na = num(v, "na"), g = num(v, "glu"), u = num(v, "urea");
      if (![na, g, u].every(Number.isFinite)) return { value: null, display: "—" };
      const o = 2 * na + g + u;
      return {
        value: o,
        display: `${fmt(o, 1)} мОсм/л`,
        band: bandFor(
          [
            { to: 275, label: "Ниже обычного коридора", tone: "warn" as Tone },
            { from: 275, to: 295, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 295, label: "Выше обычного коридора", tone: "warn" as Tone },
          ],
          o
        ),
      };
    },
  },

  {
    slug: "anionnaya-raznica",
    group: "Обмен веществ",
    short: "Анионная разница",
    unit: "ммоль/л",
    fields: [
      { key: "na", label: "Натрий", unit: "ммоль/л", min: 90, max: 200, step: 0.1 },
      { key: "cl", label: "Хлор", unit: "ммоль/л", min: 60, max: 160, step: 0.1 },
      { key: "hco3", label: "Бикарбонат (HCO₃⁻)", unit: "ммоль/л", min: 1, max: 60, step: 0.1 },
    ],
    bands: [
      { to: 8, label: "Ниже обычного коридора", tone: "warn" },
      { from: 8, to: 16, label: "В пределах обычных значений", tone: "good" },
      { from: 16, label: "Повышена", tone: "bad" },
    ],
    compute: (v) => {
      const na = num(v, "na"), cl = num(v, "cl"), h = num(v, "hco3");
      if (![na, cl, h].every(Number.isFinite)) return { value: null, display: "—" };
      const ag = na - (cl + h);
      return {
        value: ag,
        display: `${fmt(ag, 1)} ммоль/л`,
        band: bandFor(
          [
            { to: 8, label: "Ниже обычного коридора", tone: "warn" as Tone },
            { from: 8, to: 16, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 16, label: "Повышена", tone: "bad" as Tone },
          ],
          ag
        ),
        note: "При низком альбумине анионная разница занижается примерно на 2,5 на каждые 10 г/л.",
      };
    },
  },

  {
    slug: "abs-chislo-nejtrofilov",
    group: "Кровь",
    short: "Абсолютное число нейтрофилов",
    unit: "×10⁹/л",
    fields: [
      { key: "wbc", label: "Лейкоциты", unit: "×10⁹/л", min: 0.1, max: 200, step: 0.01 },
      { key: "seg", label: "Сегментоядерные нейтрофилы", unit: "%", min: 0, max: 100, step: 0.1 },
      { key: "band", label: "Палочкоядерные нейтрофилы", unit: "%", min: 0, max: 100, step: 0.1, hint: "если в бланке нет — оставьте 0" },
    ],
    bands: [
      { to: 0.5, label: "Тяжёлая нейтропения", tone: "bad" },
      { from: 0.5, to: 1, label: "Умеренная нейтропения", tone: "bad" },
      { from: 1, to: 1.5, label: "Лёгкая нейтропения", tone: "warn" },
      { from: 1.5, to: 7, label: "В пределах обычных значений", tone: "good" },
      { from: 7, label: "Повышено", tone: "warn" },
    ],
    compute: (v) => {
      const wbc = num(v, "wbc"), seg = num(v, "seg");
      const band = Number.isFinite(num(v, "band")) ? num(v, "band") : 0;
      if (![wbc, seg].every(Number.isFinite)) return { value: null, display: "—" };
      const anc = (wbc * (seg + band)) / 100;
      return {
        value: anc,
        display: `${fmt(anc)} ×10⁹/л`,
        band: bandFor(
          [
            { to: 0.5, label: "Тяжёлая нейтропения", tone: "bad" as Tone },
            { from: 0.5, to: 1, label: "Умеренная нейтропения", tone: "bad" as Tone },
            { from: 1, to: 1.5, label: "Лёгкая нейтропения", tone: "warn" as Tone },
            { from: 1.5, to: 7, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 7, label: "Повышено", tone: "warn" as Tone },
          ],
          anc
        ),
        note:
          "Если абсолютное число нейтрофилов ниже 0,5 и есть температура — это повод обратиться за помощью немедленно.",
      };
    },
  },

  {
    slug: "nlr-nejtrofily-limfocity",
    group: "Кровь",
    short: "НЛР (нейтрофилы/лимфоциты)",
    fields: [
      { key: "neu", label: "Нейтрофилы", min: 0.01, max: 200, step: 0.01, hint: "абсолютное число или %" },
      { key: "lym", label: "Лимфоциты", min: 0.01, max: 200, step: 0.01, hint: "в тех же единицах" },
    ],
    bands: [
      { to: 1, label: "Ниже обычного", tone: "warn" },
      { from: 1, to: 3, label: "Обычный диапазон", tone: "good" },
      { from: 3, to: 6, label: "Повышено", tone: "warn" },
      { from: 6, label: "Выражено повышено", tone: "bad" },
    ],
    compute: (v) => {
      const n = num(v, "neu"), l = num(v, "lym");
      if (![n, l].every(Number.isFinite) || l <= 0) return { value: null, display: "—" };
      const r = n / l;
      return {
        value: r,
        display: fmt(r),
        band: bandFor(
          [
            { to: 1, label: "Ниже обычного", tone: "warn" as Tone },
            { from: 1, to: 3, label: "Обычный диапазон", tone: "good" as Tone },
            { from: 3, to: 6, label: "Повышено", tone: "warn" as Tone },
            { from: 6, label: "Выражено повышено", tone: "bad" as Tone },
          ],
          r
        ),
        note: "Оба показателя должны быть в одинаковых единицах — либо оба абсолютные, либо оба в процентах.",
      };
    },
  },

  {
    slug: "hba1c-srednyaya-glyukoza",
    group: "Обмен веществ",
    short: "HbA1c → средняя глюкоза",
    unit: "ммоль/л",
    fields: [{ key: "a1c", label: "Гликированный гемоглобин (HbA1c)", unit: "%", min: 3, max: 20, step: 0.1 }],
    bands: [],
    compute: (v) => {
      const a = num(v, "a1c");
      if (!Number.isFinite(a) || a <= 0) return { value: null, display: "—" };
      // ADAG: средняя глюкоза (мг/дл) = 28.7 × HbA1c − 46.7; → ммоль/л ÷ 18.0
      const mgdl = 28.7 * a - 46.7;
      const mmol = mgdl / 18.0;
      const zone =
        a < 5.7 ? "Ниже порога преддиабета" : a < 6.5 ? "Диапазон преддиабета" : "Диапазон, используемый как критерий диабета";
      return {
        value: mmol,
        display: `${fmt(mmol)} ммоль/л`,
        band: { label: zone, tone: a < 5.7 ? "good" : a < 6.5 ? "warn" : "bad" },
        note: "Это средний сахар за 2–3 месяца, а не значение натощак: разовая глюкоза может отличаться.",
      };
    },
  },

  {
    slug: "tyg-indeks",
    group: "Обмен веществ",
    short: "Индекс TyG",
    fields: [
      { key: "tg", label: "Триглицериды", unit: "ммоль/л", min: 0.1, max: 30, step: 0.01 },
      { key: "glu", label: "Глюкоза натощак", unit: "ммоль/л", min: 1, max: 40, step: 0.01 },
    ],
    bands: [
      { to: 8.5, label: "Обычный диапазон", tone: "good" },
      { from: 8.5, to: 9, label: "Пограничный результат", tone: "warn" },
      { from: 9, label: "Вероятна инсулинорезистентность", tone: "bad" },
    ],
    compute: (v) => {
      const tg = num(v, "tg"), g = num(v, "glu");
      if (![tg, g].every(Number.isFinite) || tg <= 0 || g <= 0) return { value: null, display: "—" };
      // ммоль/л → мг/дл: ТГ ×88.57, глюкоза ×18.0182
      const t = Math.log((tg * 88.57 * (g * 18.0182)) / 2);
      return {
        value: t,
        display: fmt(t),
        band: bandFor(
          [
            { to: 8.5, label: "Обычный диапазон", tone: "good" as Tone },
            { from: 8.5, to: 9, label: "Пограничный результат", tone: "warn" as Tone },
            { from: 9, label: "Вероятна инсулинорезистентность", tone: "bad" as Tone },
          ],
          t
        ),
        note: "Подходит, когда инсулин натощак не сдавали и посчитать HOMA-IR нечем.",
      };
    },
  },

  {
    slug: "fib-4",
    group: "Печень",
    short: "FIB-4",
    fields: [
      { key: "age", label: "Возраст", unit: "лет", min: 18, max: 110, step: 1 },
      { key: "ast", label: "АСТ", unit: "Ед/л", min: 1, max: 5000, step: 0.1 },
      { key: "alt", label: "АЛТ", unit: "Ед/л", min: 1, max: 5000, step: 0.1 },
      { key: "plt", label: "Тромбоциты", unit: "×10⁹/л", min: 5, max: 1500, step: 1 },
    ],
    bands: [
      { to: 1.3, label: "Низкая вероятность выраженного фиброза", tone: "good" },
      { from: 1.3, to: 2.67, label: "Неопределённая зона", tone: "warn" },
      { from: 2.67, label: "Высокая вероятность — нужна очная оценка", tone: "bad" },
    ],
    compute: (v) => {
      const age = num(v, "age"), ast = num(v, "ast"), alt = num(v, "alt"), plt = num(v, "plt");
      if (![age, ast, alt, plt].every(Number.isFinite) || plt <= 0 || alt <= 0)
        return { value: null, display: "—" };
      const f = (age * ast) / (plt * Math.sqrt(alt));
      return {
        value: f,
        display: fmt(f),
        band: bandFor(
          [
            { to: 1.3, label: "Низкая вероятность выраженного фиброза", tone: "good" as Tone },
            { from: 1.3, to: 2.67, label: "Неопределённая зона", tone: "warn" as Tone },
            { from: 2.67, label: "Высокая вероятность — нужна очная оценка", tone: "bad" as Tone },
          ],
          f
        ),
        note: "У людей моложе 35 и старше 65 лет точность порогов ниже.",
      };
    },
  },

  {
    slug: "reticulocytarnyj-indeks",
    group: "Кровь",
    short: "Ретикулоцитарный индекс",
    unit: "%",
    fields: [
      { key: "ret", label: "Ретикулоциты", unit: "%", min: 0.01, max: 40, step: 0.01 },
      { key: "hct", label: "Гематокрит", unit: "%", min: 5, max: 70, step: 0.1 },
    ],
    bands: [
      { to: 2, label: "Костный мозг отвечает недостаточно", tone: "warn" },
      { from: 2, label: "Ответ костного мозга адекватный", tone: "good" },
    ],
    compute: (v) => {
      const r = num(v, "ret"), h = num(v, "hct");
      if (![r, h].every(Number.isFinite)) return { value: null, display: "—" };
      const ri = r * (h / 45);
      return {
        value: ri,
        display: `${fmt(ri)} %`,
        band: bandFor(
          [
            { to: 2, label: "Костный мозг отвечает недостаточно", tone: "warn" as Tone },
            { from: 2, label: "Ответ костного мозга адекватный", tone: "good" as Tone },
          ],
          ri
        ),
        note: "Индекс имеет смысл считать при сниженном гемоглобине — он показывает, отвечает ли костный мозг.",
      };
    },
  },

  {
    slug: "skf-deti-shvarc",
    group: "Почки",
    short: "СКФ у детей (Шварц)",
    unit: "мл/мин/1,73 м²",
    fields: [
      { key: "height", label: "Рост ребёнка", unit: "см", min: 40, max: 200, step: 0.5 },
      { key: "crea", label: "Креатинин", unit: "мкмоль/л", min: 5, max: 1000, step: 0.1 },
    ],
    bands: [
      { from: 90, label: "В пределах обычных значений", tone: "good" },
      { from: 60, to: 90, label: "Незначительно снижена", tone: "warn" },
      { to: 60, label: "Снижена — нужна консультация нефролога", tone: "bad" },
    ],
    compute: (v) => {
      const h = num(v, "height"), c = num(v, "crea");
      if (![h, c].every(Number.isFinite) || c <= 0) return { value: null, display: "—" };
      // Bedside Schwartz: 0.413 × рост(см) / креатинин(мг/дл); с мкмоль/л коэффициент 36.5
      const e = (36.5 * h) / c;
      return {
        value: e,
        display: `${fmt(e, 0)} мл/мин/1,73 м²`,
        band: bandFor(
          [
            { from: 90, label: "В пределах обычных значений", tone: "good" as Tone },
            { from: 60, to: 90, label: "Незначительно снижена", tone: "warn" as Tone },
            { to: 60, label: "Снижена — нужна консультация нефролога", tone: "bad" as Tone },
          ],
          e
        ),
        note: "Формула предназначена для детей и подростков до 18 лет.",
      };
    },
  },

  {
    slug: "imt-kalkulyator",
    group: "Обмен веществ",
    short: "Индекс массы тела",
    unit: "кг/м²",
    fields: [
      { key: "height", label: "Рост", unit: "см", min: 100, max: 250, step: 0.5 },
      { key: "weight", label: "Вес", unit: "кг", min: 20, max: 300, step: 0.1 },
    ],
    bands: [
      { to: 18.5, label: "Дефицит массы тела", tone: "warn" },
      { from: 18.5, to: 25, label: "Обычный диапазон", tone: "good" },
      { from: 25, to: 30, label: "Избыточная масса тела", tone: "warn" },
      { from: 30, to: 35, label: "Ожирение I степени", tone: "bad" },
      { from: 35, to: 40, label: "Ожирение II степени", tone: "bad" },
      { from: 40, label: "Ожирение III степени", tone: "bad" },
    ],
    compute: (v) => {
      const h = num(v, "height"), w = num(v, "weight");
      if (![h, w].every(Number.isFinite) || h <= 0) return { value: null, display: "—" };
      const b = w / Math.pow(h / 100, 2);
      return {
        value: b,
        display: `${fmt(b, 1)} кг/м²`,
        band: bandFor(
          [
            { to: 18.5, label: "Дефицит массы тела", tone: "warn" as Tone },
            { from: 18.5, to: 25, label: "Обычный диапазон", tone: "good" as Tone },
            { from: 25, to: 30, label: "Избыточная масса тела", tone: "warn" as Tone },
            { from: 30, to: 35, label: "Ожирение I степени", tone: "bad" as Tone },
            { from: 35, to: 40, label: "Ожирение II степени", tone: "bad" as Tone },
            { from: 40, label: "Ожирение III степени", tone: "bad" as Tone },
          ],
          b
        ),
        note: "У людей с большой мышечной массой ИМТ завышает оценку.",
      };
    },
  },

  {
    slug: "konverter-edinic-analizov",
    group: "Инструменты",
    short: "Конвертер единиц",
    fields: [
      {
        key: "what",
        label: "Показатель",
        type: "select",
        def: "glu",
        options: [
          { value: "glu", label: "Глюкоза (ммоль/л ↔ мг/дл)" },
          { value: "chol", label: "Холестерин (ммоль/л ↔ мг/дл)" },
          { value: "tg", label: "Триглицериды (ммоль/л ↔ мг/дл)" },
          { value: "crea", label: "Креатинин (мкмоль/л ↔ мг/дл)" },
          { value: "urea", label: "Мочевина (ммоль/л ↔ мг/дл)" },
          { value: "bili", label: "Билирубин (мкмоль/л ↔ мг/дл)" },
          { value: "hb", label: "Гемоглобин (г/л ↔ г/дл)" },
        ],
      },
      { key: "value", label: "Значение", min: 0, max: 100000, step: 0.01 },
      {
        key: "dir",
        label: "Направление",
        type: "select",
        def: "si2us",
        options: [
          { value: "si2us", label: "Из российских единиц в мг/дл" },
          { value: "us2si", label: "Из мг/дл в российские единицы" },
        ],
      },
    ],
    bands: [],
    compute: (v) => {
      const x = num(v, "value");
      if (!Number.isFinite(x)) return { value: null, display: "—" };
      // коэффициент: значение в российских единицах × k = значение в мг/дл (для Hb — г/дл)
      const K: Record<string, { k: number; si: string; us: string }> = {
        glu: { k: 18.0182, si: "ммоль/л", us: "мг/дл" },
        chol: { k: 38.67, si: "ммоль/л", us: "мг/дл" },
        tg: { k: 88.57, si: "ммоль/л", us: "мг/дл" },
        crea: { k: 1 / 88.4, si: "мкмоль/л", us: "мг/дл" },
        urea: { k: 6.006, si: "ммоль/л", us: "мг/дл" },
        bili: { k: 1 / 17.1, si: "мкмоль/л", us: "мг/дл" },
        hb: { k: 0.1, si: "г/л", us: "г/дл" },
      };
      const c = K[(v.what ?? "glu") as string] ?? K.glu;
      const toUs = (v.dir ?? "si2us") === "si2us";
      const out = toUs ? x * c.k : x / c.k;
      const digits = out < 1 ? 3 : out < 100 ? 2 : 1;
      return {
        value: out,
        display: `${fmt(out, digits)} ${toUs ? c.us : c.si}`,
        note: `Пересчёт ${toUs ? `${c.si} → ${c.us}` : `${c.us} → ${c.si}`}. Референсы всегда сверяйте с колонкой в своём бланке.`,
      };
    },
  },
];

export const getEngine = (slug: string): CalcEngine | undefined =>
  engines.find((e) => e.slug === slug);

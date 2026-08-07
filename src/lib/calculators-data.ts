/**
 * Калькуляторы = движок (поля + формула, calculators-engine.ts) + текст (этот файл).
 * Тексты пишет контент-пайплайн и проходит критическое медицинское ревью; формулы правятся
 * только вручную и покрыты регрессионным тестом scripts/test-calculators.sh.
 */
import { engines, getEngine, type CalcEngine } from "./calculators-engine";
import { calculatorContent } from "./calculators-content";

export interface CalcFaq {
  q: string;
  a: string;
}

export interface CalcContent {
  slug: string;
  h1: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  lead: string;
  howItWorks: string;
  interpretation: string;
  whenToDoctor: string;
  faq: CalcFaq[];
  relatedIndicators: string[];
  sources: string[];
}

export interface Calculator extends CalcContent {
  engine: CalcEngine;
  group: string;
  short: string;
}

/** Только те калькуляторы, у которых есть и движок, и вычитанный текст. */
export const calculators: Calculator[] = engines
  .map((engine) => {
    const c = calculatorContent.find((x) => x.slug === engine.slug);
    if (!c) return null;
    return { ...c, engine, group: engine.group, short: engine.short };
  })
  .filter((x): x is Calculator => x !== null);

export const getCalculatorBySlug = (slug: string): Calculator | undefined =>
  calculators.find((c) => c.slug === slug);

/** Порядок групп на хабе. */
export const CALC_GROUPS = [
  "Почки",
  "Печень",
  "Липиды",
  "Обмен веществ",
  "Кровь",
  "Железо",
  "Инструменты",
] as const;

export const calculatorsByGroup = (): { group: string; items: Calculator[] }[] =>
  CALC_GROUPS.map((group) => ({
    group,
    items: calculators.filter((c) => c.group === group),
  })).filter((g) => g.items.length > 0);

export { getEngine };

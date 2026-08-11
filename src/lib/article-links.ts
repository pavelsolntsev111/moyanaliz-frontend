import { indicators } from "./indicators-data";
import { landings } from "./landings-data";

/**
 * Автоматическая перелинковка и маршрутизация CTA для статей блога.
 *
 * Зачем: у 313 существующих статей ровно НОЛЬ контекстных ссылок — единственным выходом
 * была кнопка на главную, где воронка начинается заново. Перегенерировать 313 статей ради
 * ссылок дорого и рискованно, поэтому связность делается на рендере: имена показателей в
 * тексте превращаются в ссылки на их страницы, а CTA ведёт на профильный лендинг.
 */

/** Кластер статьи по слагу — попадёт в метку ref, чтобы впервые увидеть, что конвертит. */
export function articleCluster(slug: string): string {
  if (slug.startsWith("kakie-analizy-sdat") || slug.includes("check-ap")) return "blog-symptom";
  if (slug.startsWith("chto-oznachaet-") || slug.includes("oboznacheniya")) return "blog-abbr";
  if (/-\d/.test(slug) && slug.endsWith("-chto-znachit")) return "blog-value";
  if (slug.includes("povyshen") || slug.includes("ponizhen")) return "blog-deviation";
  if (slug.startsWith("norma-") || slug.includes("-norma")) return "blog-norm";
  return "blog-other";
}

/** Профильный лендинг под тему статьи: лучше вести туда, чем на общую главную. */
const LANDING_RULES: { test: RegExp; slug: string }[] = [
  { test: /gemoglobin|eritrocit|gematokrit|trombocit|lejkocit|leykocit|limfocit|monocit|eozinofil|bazofil|nejtrofil|soe|mcv|mch|rdw|retikulocit|anemi/i, slug: "rasshifrovka-obshchego-analiza-krovi" },
  { test: /holesterin|lpnp|lpvp|trigliceri|lipid|aterogen/i, slug: "rasshifrovka-lipidogrammy" },
  { test: /ttg|tireo|shchitovid|t4|t3|at-tpo/i, slug: "rasshifrovka-analizov-shchitovidnoj-zhelezy" },
  { test: /ferritin|zhelez|ozhss|transferrin/i, slug: "rasshifrovka-analiza-na-zhelezo" },
  { test: /glyukoz|sahar|insulin|gликirovann|glikirovann|hba1c|diabet/i, slug: "rasshifrovka-analiza-na-glyukozu" },
  { test: /kreatinin|mochevina|skf|pochk/i, slug: "rasshifrovka-pochechnyh-pokazatelej" },
  { test: /alt|ast|bilirubin|ggt|pechen|fosfataza/i, slug: "rasshifrovka-pechenochnyh-prob" },
  { test: /vitamin|b12|folat/i, slug: "rasshifrovka-analiza-na-vitaminy" },
  { test: /prolaktin|testosteron|estradiol|fsg|lg|gormon|kortizol/i, slug: "rasshifrovka-gormonov" },
  { test: /psa|onkomarker|he4|roma|ca-125|rea|afp/i, slug: "rasshifrovka-onkomarkerov" },
  { test: /d-dimer|koagulogramm|fibrinogen|mno|svertyva/i, slug: "rasshifrovka-koagulogrammy" },
  { test: /mocha|mochi|nechiporenko|belok-v-moche/i, slug: "rasshifrovka-analiza-mochi" },
  { test: /srb|s-reaktiv|vospalen/i, slug: "rasshifrovka-analiza-na-srb" },
];

export function landingForArticle(slug: string, category?: string): { slug: string; title: string } | null {
  const hay = `${slug} ${category ?? ""}`;
  for (const r of LANDING_RULES) {
    if (r.test.test(hay)) {
      const l = landings.find((x) => x.slug === r.slug);
      if (l) return { slug: l.slug, title: l.title };
    }
  }
  return null;
}

/**
 * Показатели, упомянутые в тексте — для блока «Показатели из статьи».
 * Совпадение по основе слова с русскими окончаниями (гемоглобин → гемоглобина, -ом).
 */
function stemRe(name: string): RegExp {
  const esc = name.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // допускаем падежные окончания у последнего слова
  return new RegExp(`(^|[^а-яё])${esc}[а-яё]{0,3}(?![а-яё])`, "i");
}

const INDEX = indicators
  .map((i) => ({ slug: i.slug, name: i.name, re: stemRe(i.name) }))
  // длинные названия проверяем первыми, чтобы «общий белок» не съелся «белком»
  .sort((a, b) => b.name.length - a.name.length);

export function indicatorsMentioned(text: string, max = 6): { slug: string; name: string }[] {
  const low = text.toLowerCase();
  const out: { slug: string; name: string }[] = [];
  for (const i of INDEX) {
    if (out.length >= max) break;
    if (i.re.test(low)) out.push({ slug: i.slug, name: i.name });
  }
  return out;
}

/**
 * Ставит ссылку на страницу показателя при ПЕРВОМ упоминании в тексте.
 * Работает на сыром markdown-абзаце ДО inline-форматирования; строки, где уже есть
 * markdown-ссылка, пропускаются, чтобы не получить ссылку внутри ссылки.
 */
export function autolinkIndicators(line: string, used: Set<string>, budget: { left: number }): string {
  if (budget.left <= 0) return line;
  if (line.includes("](")) return line;
  let out = line;
  for (const i of INDEX) {
    if (budget.left <= 0) break;
    if (used.has(i.slug)) continue;
    const m = out.match(i.re);
    if (!m) continue;
    const whole = m[0];
    const lead = m[1] ?? "";
    const word = whole.slice(lead.length);
    out = out.replace(whole, `${lead}[${word}](/indicators/${i.slug})`);
    used.add(i.slug);
    budget.left -= 1;
  }
  return out;
}

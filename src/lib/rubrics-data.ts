import { articles, type BlogArticle } from "./blog-data";

/**
 * Рубрикатор раздела «Здоровье» (URL остался /blog — адреса не меняем, чтобы не терять
 * накопленные сигналы у 345 страниц; меняется только вывеска).
 *
 * Категории в данных копились стихийно: 16 штук, среди них дубли («Биохимия» и «Биохимия крови»)
 * и рубрики на одну-две статьи. Переписывать 345 записей ради этого не нужно и рискованно —
 * сопоставление делаем НА РЕНДЕРЕ, как и автоперелинковку. Данные остаются как есть,
 * а читатель и робот видят чистую структуру.
 */

export interface Rubric {
  slug: string;
  title: string;
  /** что за раздел — выводится на странице рубрики и в мете */
  description: string;
  /** категории из blog-data, которые сюда попадают */
  categories: string[];
}

export const rubrics: Rubric[] = [
  {
    slug: "analizy-krovi",
    title: "Анализы крови",
    description:
      "Общий анализ крови и что означают его строки: какие показатели за что отвечают, как читать бланк и на что смотреть вместе.",
    categories: ["Анализы крови", "Общий анализ крови"],
  },
  {
    slug: "biohimiya",
    title: "Биохимия",
    description:
      "Биохимический анализ крови: печёночные пробы, почечные показатели, липиды, углеводный обмен и электролиты — что значит каждое отклонение.",
    categories: [
      "Биохимия",
      "Биохимия крови",
      "Печёночные пробы",
      "Почечные показатели",
      "Липидный профиль",
      "Углеводный обмен",
    ],
  },
  {
    slug: "pokazateli-krovi",
    title: "Показатели крови",
    description:
      "Разбор отдельных показателей: что значит конкретное значение в вашем бланке, почему оно отклоняется и что смотрят рядом.",
    categories: ["Показатели крови", "Железо и анемия"],
  },
  {
    slug: "gormony",
    title: "Гормоны",
    description:
      "Щитовидная железа, половые гормоны, надпочечники: как читать результаты, когда сдавать и почему цифра зависит от дня цикла.",
    categories: ["Гормоны", "Гормоны щитовидной железы"],
  },
  {
    slug: "vitaminy-mineraly",
    title: "Витамины и минералы",
    description:
      "Витамин D, B12, железо, магний и другие: как понять, есть ли дефицит, и что смотреть в анализе.",
    categories: ["Витамины и минералы"],
  },
  {
    slug: "onkomarkery",
    title: "Онкомаркеры",
    description:
      "Что показывают онкомаркеры и почему повышение не равно диагнозу: как читать результат спокойно и что уточняют дальше.",
    categories: ["Онкомаркеры"],
  },
  {
    slug: "chekapy",
    title: "Чекапы",
    description:
      "Что имеет смысл проверять в разном возрасте — детям, женщинам и мужчинам после 40 и 50, " +
      "и что входит в диспансеризацию. Без списков «сдайте всё подряд».",
    categories: ["Чекапы"],
  },
  {
    slug: "sroki-i-spravki",
    title: "Сроки и справки",
    description:
      "Сколько действителен анализ для медкомиссии, операции, садика или справки, сколько " +
      "готовится результат и что делать, если срок вышел.",
    categories: ["Сроки и справки"],
  },
  {
    slug: "podgotovka",
    title: "Подготовка к анализам",
    description:
      "Натощак или нет, что нельзя перед сдачей, как влияют еда, спорт и лекарства — чтобы результат не пришлось пересдавать.",
    categories: ["Подготовка"],
  },
  {
    slug: "zdorovie-i-chek-apy",
    title: "Здоровье и чек-апы",
    description:
      "Какие обследования имеет смысл проходить и когда: чек-апы по возрасту и ситуации, беременность, дети, спорт.",
    categories: ["Здоровье"],
  },
];

/** Категория статьи → рубрика. Неизвестная категория уходит в «Здоровье и чек-апы». */
const CATEGORY_TO_RUBRIC = new Map<string, Rubric>();
for (const r of rubrics) for (const c of r.categories) CATEGORY_TO_RUBRIC.set(c, r);

const FALLBACK = rubrics[rubrics.length - 1];

export const rubricForCategory = (category: string): Rubric =>
  CATEGORY_TO_RUBRIC.get(category) ?? FALLBACK;

export const getRubricBySlug = (slug: string): Rubric | undefined =>
  rubrics.find((r) => r.slug === slug);

/** Статьи рубрики, свежие сверху. */
export function articlesInRubric(slug: string): BlogArticle[] {
  const r = getRubricBySlug(slug);
  if (!r) return [];
  return articles
    .filter((a) => rubricForCategory(a.category).slug === slug)
    .sort((x, y) => (x.date < y.date ? 1 : -1));
}

/** Сколько статей в каждой рубрике — для хаба и меню. */
export function rubricCounts(): { rubric: Rubric; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of articles) {
    const s = rubricForCategory(a.category).slug;
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return rubrics
    .map((rubric) => ({ rubric, count: counts.get(rubric.slug) ?? 0 }))
    .filter((x) => x.count > 0);
}

/**
 * «Читайте также» — соседи по рубрике. Берём ближайшие по дате, исключая саму статью:
 * связь по рубрике даёт тематическую близость без ручной разметки и не разваливается
 * при 12 публикациях в день.
 */
export function relatedArticles(slug: string, limit = 4): BlogArticle[] {
  const self = articles.find((a) => a.slug === slug);
  if (!self) return [];
  const r = rubricForCategory(self.category);
  return articles
    .filter((a) => a.slug !== slug && rubricForCategory(a.category).slug === r.slug)
    .sort((x, y) => (x.date < y.date ? 1 : -1))
    .slice(0, limit);
}

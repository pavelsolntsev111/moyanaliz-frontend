/**
 * Словарь обозначений из лабораторного бланка.
 *
 * Задача страницы — «человек смотрит в распечатку и не понимает буквы»: он ищет не статью,
 * а расшифровку одной строки. Поэтому это таблица-справочник, а не лонгрид.
 *
 * article — существующая статья «Что означает X в анализе крови» (если её ещё нет, поля нет);
 * indicator — страница показателя в справочнике.
 * Ничего не выдумываем: только общепринятые обозначения российских и международных бланков.
 */

export interface Abbr {
  code: string;
  /** альтернативные написания в бланках */
  alt?: string[];
  name: string;
  what: string;
  group: string;
  article?: string;
  indicator?: string;
}

export const ABBR_GROUPS = [
  "Общий анализ крови",
  "Лейкоцитарная формула",
  "Биохимия",
  "Липиды",
  "Обмен железа",
  "Гормоны",
  "Свёртываемость",
] as const;

export const abbreviations: Abbr[] = [
  // ─── ОАК ───
  { code: "WBC", name: "Лейкоциты", what: "Белые клетки крови — защита от инфекций.", group: "Общий анализ крови", article: "chto-oznachaet-wbc-v-analize-krovi", indicator: "lejkocity" },
  { code: "RBC", name: "Эритроциты", what: "Красные клетки, переносящие кислород.", group: "Общий анализ крови", article: "chto-oznachaet-rbc-v-analize-krovi", indicator: "eritrocity" },
  { code: "HGB", alt: ["HB"], name: "Гемоглобин", what: "Белок эритроцита, связывающий кислород.", group: "Общий анализ крови", article: "chto-oznachaet-hgb-hb-v-analize-krovi", indicator: "gemoglobin" },
  { code: "HCT", alt: ["Ht"], name: "Гематокрит", what: "Доля объёма крови, занятая эритроцитами.", group: "Общий анализ крови", article: "chto-oznachaet-hct-v-analize-krovi", indicator: "gematokrit" },
  { code: "MCV", name: "Средний объём эритроцита", what: "Размер эритроцита — подсказывает тип анемии.", group: "Общий анализ крови", article: "chto-oznachaet-mcv-v-analize-krovi", indicator: "srednij-obem-eritrocita" },
  { code: "MCH", name: "Среднее содержание гемоглобина в эритроците", what: "Сколько гемоглобина приходится на одну клетку.", group: "Общий анализ крови", article: "chto-oznachaet-mch-v-analize-krovi", indicator: "mch" },
  { code: "MCHC", name: "Средняя концентрация гемоглобина в эритроците", what: "Насколько плотно клетка «набита» гемоглобином.", group: "Общий анализ крови", indicator: "mchc" },
  { code: "RDW-CV", alt: ["RDW", "RDW-SD"], name: "Ширина распределения эритроцитов", what: "Разброс эритроцитов по размеру.", group: "Общий анализ крови", article: "chto-oznachaet-rdw-cv-v-analize-krovi" },
  { code: "PLT", name: "Тромбоциты", what: "Клетки свёртывания крови.", group: "Общий анализ крови", article: "chto-oznachaet-plt-v-analize-krovi", indicator: "trombocity" },
  { code: "MPV", name: "Средний объём тромбоцита", what: "Размер тромбоцитов — косвенно об их «возрасте».", group: "Общий анализ крови", article: "chto-oznachaet-mpv-v-analize-krovi" },
  { code: "PCT", name: "Тромбокрит", what: "Доля объёма крови, занятая тромбоцитами.", group: "Общий анализ крови" },
  { code: "PDW", name: "Ширина распределения тромбоцитов", what: "Разброс тромбоцитов по размеру.", group: "Общий анализ крови" },
  { code: "ESR", alt: ["СОЭ"], name: "Скорость оседания эритроцитов", what: "Неспецифический маркер воспаления.", group: "Общий анализ крови", indicator: "soe" },
  { code: "RET", name: "Ретикулоциты", what: "Молодые эритроциты — показывают ответ костного мозга.", group: "Общий анализ крови" },

  // ─── лейкоформула ───
  { code: "NEU", alt: ["NE#", "NE%"], name: "Нейтрофилы", what: "Основная защита от бактерий.", group: "Лейкоцитарная формула", article: "chto-oznachaet-neu-v-analize-krovi" },
  { code: "LYM", alt: ["LY#", "LY%"], name: "Лимфоциты", what: "Отвечают за противовирусный и приобретённый иммунитет.", group: "Лейкоцитарная формула", article: "chto-oznachaet-lym-v-analize-krovi", indicator: "limfocity" },
  { code: "MON", alt: ["MO#", "MO%"], name: "Моноциты", what: "Поглощают погибшие клетки и микробы.", group: "Лейкоцитарная формула", article: "chto-oznachaet-mon-v-analize-krovi", indicator: "monocity" },
  { code: "EOS", alt: ["EO#", "EO%"], name: "Эозинофилы", what: "Растут при аллергии и паразитах.", group: "Лейкоцитарная формула", article: "chto-oznachaet-eos-v-analize-krovi", indicator: "eozinofily" },
  { code: "BAS", alt: ["BA#", "BA%"], name: "Базофилы", what: "Самая малочисленная группа лейкоцитов.", group: "Лейкоцитарная формула", indicator: "bazofily" },
  { code: "GRA", name: "Гранулоциты", what: "Суммарно нейтрофилы, эозинофилы и базофилы.", group: "Лейкоцитарная формула" },

  // ─── биохимия ───
  { code: "ALT", alt: ["ALAT", "GPT", "АЛТ"], name: "Аланинаминотрансфераза", what: "Фермент, в основном печёночный.", group: "Биохимия", article: "chto-oznachaet-alt-v-analize-krovi", indicator: "alt" },
  { code: "AST", alt: ["ASAT", "GOT", "АСТ"], name: "Аспартатаминотрансфераза", what: "Фермент печени, мышц и сердца.", group: "Биохимия", article: "chto-oznachaet-ast-v-analize-krovi", indicator: "ast" },
  { code: "GGT", alt: ["GGTP", "ГГТ"], name: "Гамма-глутамилтрансфераза", what: "Чувствительный маркер печени и желчевыводящих путей.", group: "Биохимия", article: "chto-oznachaet-ggt-v-analize-krovi" },
  { code: "ALP", alt: ["ЩФ"], name: "Щелочная фосфатаза", what: "Фермент печени, желчных путей и костей.", group: "Биохимия" },
  { code: "TBIL", alt: ["Т-Bil"], name: "Билирубин общий", what: "Продукт распада гемоглобина.", group: "Биохимия", indicator: "bilirubin-obschij" },
  { code: "DBIL", alt: ["D-Bil"], name: "Билирубин прямой", what: "Фракция, прошедшая через печень.", group: "Биохимия" },
  { code: "TP", alt: ["ОБ"], name: "Общий белок", what: "Суммарный белок сыворотки.", group: "Биохимия", indicator: "obschij-belok" },
  { code: "ALB", name: "Альбумин", what: "Основной транспортный белок крови.", group: "Биохимия", indicator: "albumin" },
  { code: "CREA", alt: ["CRE", "Крт"], name: "Креатинин", what: "Продукт мышечного обмена, выводится почками.", group: "Биохимия", indicator: "kreatinin" },
  { code: "UREA", alt: ["BUN", "Моч."], name: "Мочевина", what: "Конечный продукт обмена белка.", group: "Биохимия", indicator: "mochevina" },
  { code: "UA", alt: ["МК"], name: "Мочевая кислота", what: "Продукт обмена пуринов.", group: "Биохимия", indicator: "mochevaya-kislota" },
  { code: "GLU", alt: ["Glu"], name: "Глюкоза", what: "Сахар крови.", group: "Биохимия", indicator: "glyukoza" },
  { code: "HbA1c", name: "Гликированный гемоглобин", what: "Средний сахар за 2–3 месяца.", group: "Биохимия", article: "chto-oznachaet-hba1c-v-analize-krovi" },
  { code: "CRP", alt: ["СРБ", "hs-CRP"], name: "С-реактивный белок", what: "Быстрый маркер воспаления.", group: "Биохимия", article: "chto-oznachaet-crp-v-analize-krovi" },
  { code: "AMY", name: "Амилаза", what: "Фермент поджелудочной и слюнных желёз.", group: "Биохимия" },
  { code: "CK", alt: ["КФК", "CPK"], name: "Креатинкиназа", what: "Фермент мышц, растёт после нагрузок и травм.", group: "Биохимия" },
  { code: "K", name: "Калий", what: "Электролит, важен для работы сердца.", group: "Биохимия" },
  { code: "Na", name: "Натрий", what: "Основной электролит внеклеточной жидкости.", group: "Биохимия" },
  { code: "Ca", name: "Кальций", what: "Кости, мышцы, свёртывание.", group: "Биохимия", indicator: "kalcij" },

  // ─── липиды ───
  { code: "CHOL", alt: ["TC", "ОХ"], name: "Холестерин общий", what: "Суммарный холестерин крови.", group: "Липиды", indicator: "holesterin-obschij" },
  { code: "HDL", alt: ["ЛПВП"], name: "Липопротеины высокой плотности", what: "«Хороший» холестерин.", group: "Липиды" },
  { code: "LDL", alt: ["ЛПНП"], name: "Липопротеины низкой плотности", what: "«Плохой» холестерин, основной атерогенный.", group: "Липиды" },
  { code: "TG", alt: ["ТГ"], name: "Триглицериды", what: "Жиры крови.", group: "Липиды", indicator: "trigliceridy" },

  // ─── железо ───
  { code: "FER", alt: ["Ferritin"], name: "Ферритин", what: "Запас железа в организме.", group: "Обмен железа", indicator: "ferritin" },
  { code: "Fe", alt: ["SI"], name: "Железо сыворотки", what: "Железо, циркулирующее в крови сейчас.", group: "Обмен железа", indicator: "zhelezo" },
  { code: "TIBC", alt: ["ОЖСС"], name: "Общая железосвязывающая способность", what: "Сколько железа кровь способна связать.", group: "Обмен железа" },
  { code: "TSAT", name: "Насыщение трансферрина", what: "Процент трансферрина, занятого железом.", group: "Обмен железа" },

  // ─── гормоны ───
  { code: "TSH", alt: ["ТТГ"], name: "Тиреотропный гормон", what: "Главный регулятор щитовидной железы.", group: "Гормоны", article: "chto-oznachaet-tsh-v-analize-krovi", indicator: "tireotropnyj-gormon" },
  { code: "FT4", alt: ["Т4 св."], name: "Тироксин свободный", what: "Основной гормон щитовидной железы.", group: "Гормоны", indicator: "tiroksin-svobodnyj" },
  { code: "FT3", alt: ["Т3 св."], name: "Трийодтиронин свободный", what: "Активная форма тиреоидного гормона.", group: "Гормоны" },
  { code: "PRL", name: "Пролактин", what: "Гормон гипофиза.", group: "Гормоны" },
  { code: "LH", alt: ["ЛГ"], name: "Лютеинизирующий гормон", what: "Регулирует репродуктивную функцию.", group: "Гормоны" },
  { code: "FSH", alt: ["ФСГ"], name: "Фолликулостимулирующий гормон", what: "Регулирует созревание половых клеток.", group: "Гормоны" },
  { code: "E2", name: "Эстрадиол", what: "Основной женский половой гормон.", group: "Гормоны" },
  { code: "PTH", alt: ["ПТГ"], name: "Паратгормон", what: "Регулирует обмен кальция.", group: "Гормоны" },
  { code: "25(OH)D", name: "Витамин D", what: "Форма витамина D, по которой оценивают запас.", group: "Гормоны", indicator: "vitamin-d" },

  // ─── свёртываемость ───
  { code: "INR", alt: ["МНО"], name: "Международное нормализованное отношение", what: "Стандартизованный показатель свёртывания.", group: "Свёртываемость" },
  { code: "APTT", alt: ["АЧТВ"], name: "Активированное частичное тромбопластиновое время", what: "Оценивает внутренний путь свёртывания.", group: "Свёртываемость" },
  { code: "PT", alt: ["ПВ", "ПТИ"], name: "Протромбиновое время", what: "Оценивает внешний путь свёртывания.", group: "Свёртываемость" },
  { code: "FIB", alt: ["Фибриноген"], name: "Фибриноген", what: "Белок свёртывания и маркер воспаления.", group: "Свёртываемость" },
  { code: "D-dimer", alt: ["Д-димер"], name: "D-димер", what: "Продукт распада тромба.", group: "Свёртываемость" },
];

export const abbreviationsByGroup = () =>
  ABBR_GROUPS.map((group) => ({
    group,
    items: abbreviations.filter((a) => a.group === group),
  })).filter((g) => g.items.length > 0);

// Авторитетные внешние источники для страниц показателей (/indicators/[slug]).
//
// Зачем: исходящие ссылки на авторитетные медицинские источники — сильный
// E-E-A-T-сигнал для YMYL-контента (важен и для Яндекса, и для Google).
//
// ⚠️ ПРАВИЛО: только РЕАЛЬНЫЕ, резолвящиеся URL. Каждая ссылка ниже была
// проверена HTTP-запросом (200) против MedlinePlus (U.S. National Library of
// Medicine, NIH). Битая или выдуманная цитата на медицинской странице — хуже,
// чем её отсутствие. Перед добавлением новой ссылки — проверь, что она отдаёт 200.
//
// Шаблон страницы рендерит блок «Источники» и добавляет schema.org `citation`
// в JSON-LD, когда для слуга есть хотя бы одна запись. Слуги без записей просто
// не показывают блок — это безопасно. Покрытие можно расширять со временем.

export interface IndicatorSource {
  /** Заголовок ссылки, показываемый пользователю */
  title: string;
  /** Проверенный (200) URL */
  url: string;
  /** Короткая подпись издателя (чип рядом со ссылкой) */
  publisher: string;
}

const ML = "MedlinePlus · NIH";

export const indicatorSources: Record<string, IndicatorSource[]> = {
  gemoglobin: [{ title: "Hemoglobin Test", url: "https://medlineplus.gov/lab-tests/hemoglobin-test/", publisher: ML }],
  eritrocity: [{ title: "Red Blood Cell (RBC) Count", url: "https://medlineplus.gov/lab-tests/red-blood-cell-rbc-count/", publisher: ML }],
  gematokrit: [{ title: "Hematocrit Test", url: "https://medlineplus.gov/lab-tests/hematocrit-test/", publisher: ML }],
  lejkocity: [{ title: "White Blood Count (WBC)", url: "https://medlineplus.gov/lab-tests/white-blood-count-wbc/", publisher: ML }],
  trombocity: [{ title: "Platelet Tests", url: "https://medlineplus.gov/lab-tests/platelet-tests/", publisher: ML }],
  glyukoza: [{ title: "Blood Glucose Test", url: "https://medlineplus.gov/lab-tests/blood-glucose-test/", publisher: ML }],
  "holesterin-obschij": [{ title: "Cholesterol Levels", url: "https://medlineplus.gov/lab-tests/cholesterol-levels/", publisher: ML }],
  ferritin: [{ title: "Ferritin Blood Test", url: "https://medlineplus.gov/lab-tests/ferritin-blood-test/", publisher: ML }],
  soe: [{ title: "Erythrocyte Sedimentation Rate (ESR)", url: "https://medlineplus.gov/lab-tests/erythrocyte-sedimentation-rate-esr/", publisher: ML }],
  kreatinin: [{ title: "Creatinine Test", url: "https://medlineplus.gov/lab-tests/creatinine-test/", publisher: ML }],
  alt: [{ title: "ALT Blood Test", url: "https://medlineplus.gov/lab-tests/alt-blood-test/", publisher: ML }],
  ast: [{ title: "AST Test", url: "https://medlineplus.gov/lab-tests/ast-test/", publisher: ML }],
  limfocity: [{ title: "Blood Differential Test", url: "https://medlineplus.gov/lab-tests/blood-differential/", publisher: ML }],
  monocity: [{ title: "Blood Differential Test", url: "https://medlineplus.gov/lab-tests/blood-differential/", publisher: ML }],
  eozinofily: [{ title: "Blood Differential Test", url: "https://medlineplus.gov/lab-tests/blood-differential/", publisher: ML }],
  bazofily: [{ title: "Blood Differential Test", url: "https://medlineplus.gov/lab-tests/blood-differential/", publisher: ML }],
  "srednij-obem-eritrocita": [{ title: "Complete Blood Count (CBC)", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/", publisher: ML }],
  mch: [{ title: "Complete Blood Count (CBC)", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/", publisher: ML }],
  mchc: [{ title: "Complete Blood Count (CBC)", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/", publisher: ML }],
  trigliceridy: [{ title: "Triglycerides Test", url: "https://medlineplus.gov/lab-tests/triglycerides-test/", publisher: ML }],
  "bilirubin-obschij": [{ title: "Bilirubin Blood Test", url: "https://medlineplus.gov/lab-tests/bilirubin-blood-test/", publisher: ML }],
  mochevina: [{ title: "BUN (Blood Urea Nitrogen)", url: "https://medlineplus.gov/lab-tests/bun-blood-urea-nitrogen/", publisher: ML }],
  "tireotropnyj-gormon": [{ title: "TSH (Thyroid-Stimulating Hormone) Test", url: "https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/", publisher: ML }],
  albumin: [{ title: "Albumin Blood Test", url: "https://medlineplus.gov/lab-tests/albumin-blood-test/", publisher: ML }],
  kalcij: [{ title: "Calcium Blood Test", url: "https://medlineplus.gov/lab-tests/calcium-blood-test/", publisher: ML }],
  "vitamin-b12": [{ title: "Vitamin B12 Level (Medical Encyclopedia)", url: "https://medlineplus.gov/ency/article/003705.htm", publisher: ML }],
  "tiroksin-svobodnyj": [{ title: "TSH (Thyroid-Stimulating Hormone) Test", url: "https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/", publisher: ML }],
  gomocistein: [{ title: "Homocysteine Test", url: "https://medlineplus.gov/lab-tests/homocysteine-test/", publisher: ML }],
  "vitamin-d": [{ title: "Vitamin D Test", url: "https://medlineplus.gov/lab-tests/vitamin-d-test/", publisher: ML }],
  zhelezo: [{ title: "Iron Tests", url: "https://medlineplus.gov/lab-tests/iron-tests/", publisher: ML }],
  "obschij-belok": [{ title: "Total Protein (Medical Encyclopedia)", url: "https://medlineplus.gov/ency/article/003483.htm", publisher: ML }],
  "mochevaya-kislota": [{ title: "Uric Acid Test", url: "https://medlineplus.gov/lab-tests/uric-acid-test/", publisher: ML }],
};

export function getIndicatorSources(slug: string): IndicatorSource[] {
  return indicatorSources[slug] ?? [];
}

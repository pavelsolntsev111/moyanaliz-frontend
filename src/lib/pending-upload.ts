/**
 * Передача выбранного файла между страницами БЕЗ дублирования логики загрузки.
 *
 * Зачем: дропзона нужна в теле статьи и на странице показателя, но весь флоу загрузки
 * (A/B-ветка, атрибуция рекламы, цели Метрики, обработка ошибок) живёт в page.tsx.
 * Копировать его во второе место = гарантированно разъехаться. Поэтому страница-контент
 * лишь кладёт File сюда и делает клиентский переход на «/», а главная на маунте забирает
 * файл и запускает СВОЙ обычный обработчик.
 *
 * Память переживает клиентскую навигацию Next (router.push), но не полную перезагрузку —
 * это и хорошо: при прямом заходе на «/» ничего лишнего не стартует.
 */

let pendingFile: File | null = null;
/** откуда пришёл файл — попадёт в метку ref для аналитики */
let pendingSource: string | null = null;

export function setPendingUpload(file: File, source: string) {
  pendingFile = file;
  pendingSource = source;
}

/** Забрать файл ОДИН раз: повторный вызов вернёт null (защита от двойного старта). */
export function takePendingUpload(): { file: File; source: string } | null {
  if (!pendingFile) return null;
  const out = { file: pendingFile, source: pendingSource ?? "unknown" };
  pendingFile = null;
  pendingSource = null;
  return out;
}

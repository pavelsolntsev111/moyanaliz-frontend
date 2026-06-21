// Liveness-эндпоинт для healthcheck'а Timeweb (Dockerfile HEALTHCHECK пробит его
// на 127.0.0.1:3000/api/health). Возвращает 200, если Next-сервер жив и обслуживает
// запросы. СОЗНАТЕЛЬНО не дёргает бэкенд/БД — это liveness фронт-контейнера, а не
// readiness всей системы: фронт не должен перезапускаться из-за недоступного бэкенда.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

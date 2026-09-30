import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // The /api rewrite below is the browser's path to the backend (browser →
    // this Timeweb origin → relay → Railway), so every upload of a lab form
    // goes through Next's proxy. Two defaults break it:
    //
    // 1. Next clones every request body for the proxy and TRUNCATES it at
    //    10 MiB. The backend then waits for bytes that never come (the
    //    Content-Length is the original one), and the request dies on the proxy
    //    timeout below. This, not a slow network, was the "30 s ceiling" that
    //    moved browsers off this path on 17.08: 7 MB passed, 10.2 MB → 500 at
    //    30.5 s. Re-measured 30.09.2026: 9.9 MB → 200, 10.7 MB → 500 at 50 s.
    //    Uploads are capped at 20 MB by the backend; the headroom lets an
    //    oversized file reach it and get the "max 20 MB" answer instead of a
    //    hang. The clone is held in memory per request, so don't go wild.
    proxyClientMaxBodySize: 32 * 1024 * 1024,
    // 2. Proxied requests time out after 30 s by default, and the upload
    //    handler runs the light LLM analysis before it answers (Haiku fallback
    //    can take ~40 s). 300 s matches the relay's own read/write timeouts.
    proxyTimeout: 300_000,
  },
  async rewrites() {
    // UPSTREAM (Railway) must stay SEPARATE from NEXT_PUBLIC_API_URL (what the
    // browser calls). RKN IP-blocks the Railway edge (69.46.46.62) for part of
    // RU networks — 15.07.2026 incident: site reachable, API not, visit→upload
    // 33%→10%. Unlike 07-08.07 this is an IP block, not SNI, so a new subdomain
    // wouldn't help. Fix: the browser hits this Timeweb origin (Russian IP,
    // reachable everywhere) and Next proxies server-side to Railway — Timeweb's
    // egress to Railway is NOT filtered (verified via the /admin rewrite).
    // ⚠️ Never point UPSTREAM at NEXT_PUBLIC_API_URL — same-origin → rewrite loop.
    const upstream = process.env.API_UPSTREAM || "https://api.moyanaliz.ru";
    return [
      { source: "/api/:path*", destination: `${upstream}/api/:path*` },
      { source: "/admin", destination: `${upstream}/admin` },
      { source: "/admin/:path*", destination: `${upstream}/admin/:path*` },
      // Prod admin lives under ADMIN_URL_PREFIX=/ADM, not /admin — without this
      // the owner loses EVERY dashboard exactly during a block: /ADM/support
      // (refund queue), /ADM/support/bugs, /ADM/finances, /ADM/ab-tests, /ADM/metrics.
      // Verified 21.07: /ADM/metrics → 404 via proxy, 200 direct.
      { source: "/ADM/:path*", destination: `${upstream}/ADM/:path*` },
    ];
  },
  async redirects() {
    return [
      // www → апекс. Ставим заранее: пока на www нет сертификата, хост до нас не доходит
      // и правило просто не срабатывает. Как только www привяжут к приложению в панели
      // Timeweb и выпишут сертификат, редирект начнёт работать сам — без ещё одного деплоя.
      // Нужен, чтобы не плодить дубль сайта на втором хосте и не размывать сигналы.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.moyanaliz.ru" }],
        destination: "https://moyanaliz.ru/:path*",
        permanent: true,
      },
      // Транслитерационные дубли: обе страницы отдавали 200 с self-canonical и
      // каннибализировали друг друга в выдаче. Склеиваем на канонический вариант.
      {
        source: "/blog/kakie-analizy-sdat-pri-bessonnitse",
        destination: "/blog/kakie-analizy-sdat-pri-bessonnice",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-chastykh-prostudakh",
        destination: "/blog/kakie-analizy-sdat-pri-chastyh-prostudah",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-sukhosti-kozhi",
        destination: "/blog/kakie-analizy-sdat-pri-suhosti-kozhi",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-sukhosti-vo-rtu",
        destination: "/blog/kakie-analizy-sdat-pri-suhosti-vo-rtu",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-sukhosti-vo-rtu-i-zhazhde",
        destination: "/blog/kakie-analizy-sdat-pri-suhosti-vo-rtu-i-zhazhde",
        permanent: true,
      },
      {
        source: "/blog/kaltsiy-magniy-norma-kosti",
        destination: "/blog/kaltsij-magnij-norma-kosti",
        permanent: true,
      },
      // Consolidate duplicate-title auto-blog near-dupes (Yandex Webmaster flagged 3 pairs) → 301 to canonical
      {
        source: "/blog/kakie-analizy-sdat-pri-chastyh-sinyakah-na-tele",
        destination: "/blog/kakie-analizy-sdat-pri-chastyh-sinyakah",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-chastyh-golovnyh-bolyah",
        destination: "/blog/kakie-analizy-sdat-pri-golovnoj-boli",
        permanent: true,
      },
      {
        source: "/blog/kakie-analizy-sdat-pri-serdcebienii",
        destination: "/blog/kakie-analizy-sdat-pri-uchashennom-serdcebienii",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

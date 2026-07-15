import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
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
    ];
  },
  async redirects() {
    return [
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

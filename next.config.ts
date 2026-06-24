import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || "https://moyanaliz-backend-production.up.railway.app";
    return [
      { source: "/admin", destination: `${api}/admin` },
      { source: "/admin/:path*", destination: `${api}/admin/:path*` },
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

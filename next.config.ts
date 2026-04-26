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
    ];
  },
};

export default nextConfig;

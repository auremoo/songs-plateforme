import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // standalone only for Docker/Fly.io — Vercel handles its own output
  output: isVercel ? undefined : "standalone",
  // Vercel provides sharp natively; bundling it blows the 250MB function limit
  serverExternalPackages: isVercel ? ["sharp"] : [],
  experimental: isVercel ? {
    outputFileTracingExcludes: {
      "*": ["node_modules/sharp/**", "node_modules/@swc/core*/**"],
    },
  } : {},
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Rewrites are only needed in standalone mode (public/ not served by Next.js)
  async rewrites() {
    if (isVercel) return [];
    return [
      { source: "/images/:path*", destination: "/api/files/images/:path*" },
      { source: "/fonts/:path*", destination: "/api/files/fonts/:path*" },
    ];
  },
};

export default withNextIntl(nextConfig);

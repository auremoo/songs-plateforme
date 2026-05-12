import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // In standalone mode, Next.js doesn't serve public/ files automatically.
  // Rewrite uploaded file requests to the API route that reads from disk.
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: "/api/files/images/:path*",
      },
      {
        source: "/fonts/:path*",
        destination: "/api/files/fonts/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);

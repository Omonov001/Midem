import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // <-- To'g'ri: protokoli https, hostname esa domen
      },
      {
        protocol: "https",
        hostname: "pub-624827eef44b403babe6859663a414f7.r2.dev", // <-- Cloudflare R2 domenimiz
      },
    ],
  },
};

export default withNextIntl(nextConfig);

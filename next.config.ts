import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* loyihangizning boshqa sozlamalari shu yerda bo'ladi */
  // Masalan: reactStrictMode: true,
};

export default withNextIntl(nextConfig);

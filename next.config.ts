import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// @ts-ignore
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Removed 'output: standalone' - not needed for EC2/PM2 deployment
  images: {
    unoptimized: true, // Disable image optimization for local files
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Puck docs recommend transpiling it for Next.js App Router
  transpilePackages: ['@measured/puck'],
  experimental: {
  },
};

export default withNextIntl(withPWA(nextConfig));

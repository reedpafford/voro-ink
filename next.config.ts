// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },  // ✅ don’t run ESLint in CI
  // leave TS errors on so we catch real mistakes; flip to true only if you
  // need an emergency unblock:
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;


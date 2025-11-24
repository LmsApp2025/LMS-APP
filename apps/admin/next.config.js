/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // THIS LINE IS THE MAGIC THAT FIXES RAILWAY
  experimental: {
    outputFileTracingRoot: undefined,   // ← removes monorepo root restriction
    outputFileTracingExcludes: {},     // ← forces all files to be included
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
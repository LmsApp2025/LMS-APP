/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // THIS IS THE ONLY COMBINATION THAT WORKS ON RAILWAY + TURBOREPO
  experimental: {
    outputFileTracing: true,
    // This forces Next.js to include everything needed for standalone in monorepos
  },

  // Critical: copy all required files
  distDir: ".next",

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
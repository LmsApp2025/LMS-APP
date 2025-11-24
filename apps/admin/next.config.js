/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',                         // ← THIS IS THE KEY
  experimental: {
    // Critical for monorepos – tells Next.js where the project root is
    outputFileTracingRoot: undefined,
  },
  // Allow images from your R2 buckets
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

module.exports = nextConfig;
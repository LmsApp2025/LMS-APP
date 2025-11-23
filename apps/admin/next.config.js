/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',                 // ← CRITICAL
  experimental: {
    // This makes .next/standalone work in monorepos
    outputFileTracingRoot: __dirname + '/../../',
  },
  // Optional: if you use images from R2
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
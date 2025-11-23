/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',        // THIS IS THE KEY FOR DOCKER
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
  env: {
    NEXT_PUBLIC_SOCKET_SERVER_URI: process.env.SOCKET_SERVER_URI || "http://localhost:8000",
  }
};

module.exports = nextConfig;
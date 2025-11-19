// The NEW, corrected next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // <-- ADD THIS LINE
  images: {
    domains: ['res.cloudinary.com', 'randomuser.me', '192.168.1.2'],
  },
  experimental: {
    // reactRoot: true,
    // suppressHydrationWarning: true,
  }
}

module.exports = nextConfig

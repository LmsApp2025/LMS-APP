/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // distDir is critical for your Dockerfile COPY commands
  distDir: ".next",

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  
  // Remove the 'experimental' block containing outputFileTracing
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental.appDir as it's stable in Next.js 14+
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    // Allow builds even with TypeScript errors during development
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow builds even with ESLint warnings during development
    ignoreDuringBuilds: false,
  },
  // Optimize for Vercel deployment
  output: "standalone",
};

module.exports = nextConfig;

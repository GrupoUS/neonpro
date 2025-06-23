/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for Next.js 15 - moved from experimental
  serverExternalPackages: [],
  // Disable static optimization for problematic pages
  trailingSlash: false,
  // Force dynamic rendering for all pages to avoid static generation issues
  experimental: {
    // Disable static optimization completely
    forceSwcTransforms: true,
  },
  // Configure dynamic rendering
  async headers() {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

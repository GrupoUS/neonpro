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
  // Fix for static generation issues with client components
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Use standalone output for better Vercel compatibility
  output: "standalone",
  // Disable static optimization for problematic pages
  trailingSlash: false,
};

export default nextConfig;

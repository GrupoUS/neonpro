/** @type {import('next').NextConfig} */

// Bundle Analyzer Configuration
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // Simplified configuration for Vercel compatibility
  experimental: {
    // Only essential optimizations
    optimizePackageImports: [
      "@supabase/supabase-js",
      "recharts",
      "date-fns",
    ],
  },

  // External packages that should not be bundled
  serverExternalPackages: ["sharp"],

  // Simplified webpack configuration
  webpack: (config) => {
    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Image optimization configuration
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.com",
      },
    ],
  },

  // Headers for performance and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // Performance headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      // Static assets caching
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes caching
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,



  // Environment variables to expose to the client
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Logging configuration for development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // TypeScript and ESLint settings for production builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Redirects for SEO optimization
  async redirects() {
    return [
      // Redirect old URLs if any
      {
        source: "/dashboard/analytics",
        destination: "/dashboard/analytics/overview",
        permanent: true,
      },
    ];
  },


};

export default withBundleAnalyzer(nextConfig);

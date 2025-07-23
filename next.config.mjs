/** @type {import('next').NextConfig} */

// Bundle Analyzer Configuration
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // Performance Optimizations
  experimental: {
    // Bundle optimizations
    optimizePackageImports: [
      "@phosphor-icons/react",
      "recharts",
      "lodash",
      "date-fns",
      "react-query",
      "@supabase/supabase-js",
    ],

    // CSS chunking for better performance
    cssChunking: true,

    // Server components HMR cache for development
    serverComponentsHmrCache: true,

    // Turbopack for faster builds (Next.js 15.4+)
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },

    // Enable Next.js 15.4+ performance features
    reactCompiler: process.env.NODE_ENV === "production",
  },

  // Bundle Pages Router dependencies for consistency
  bundlePagesRouterDependencies: true,

  // External packages that should not be bundled
  serverExternalPackages: ["sharp", "onnxruntime-node", "canvas", "playwright"],

  // Webpack configuration for additional optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      // Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Minimize duplicate dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        react: "react",
        "react-dom": "react-dom",
        "@supabase/supabase-js": "@supabase/supabase-js",
      };
    }

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
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ["localhost", "ownkoxryswokcdanrdgj.supabase.co", "supabase.com"],
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

  // Asset prefix for CDN (when deployed)
  assetPrefix:
    process.env.NODE_ENV === "production" && process.env.CDN_URL
      ? process.env.CDN_URL
      : "",

  // Output configuration for static exports (optional)
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  trailingSlash: process.env.NEXT_OUTPUT === "export",

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

  // Rewrites for clean URLs and API proxying
  async rewrites() {
    return [
      // Proxy API calls to external services if needed
      {
        source: "/api/external/:path*",
        destination: "https://api.external-service.com/:path*",
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

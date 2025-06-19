import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // === EXPERIMENTAL FEATURES ===
  experimental: {
    // Partial Prerendering (PPR) - Next.js 15 Performance Boost
    ppr: "incremental",

    // Performance optimizations
    optimizePackageImports: [
      "@heroicons/react",
      "@headlessui/react",
      "framer-motion",
      "lucide-react",
      "@supabase/supabase-js",
      "drizzle-orm",
    ],
  },

  // === TURBOPACK CONFIGURATION ===
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // === SERVER EXTERNAL PACKAGES ===
<<<<<<< Updated upstream
  serverExternalPackages: ["@prisma/client", "@opentelemetry/api"],

  // === TYPESCRIPT CONFIGURATION ===
  typescript: {
    // Type checking during build (enabled for production)
    ignoreBuildErrors: false,
=======
  serverExternalPackages: ["@prisma/client"],

  // === TYPESCRIPT CONFIGURATION ===
  typescript: {
    // Type checking during build (temporarily disabled for validation)
    ignoreBuildErrors: true,
>>>>>>> Stashed changes
  },

  // === ESLint CONFIGURATION ===
  eslint: {
    // Lint during builds
    ignoreDuringBuilds: false,
    dirs: ["src", "components", "lib", "app"],
  },

  // === IMAGE OPTIMIZATION ===
  images: {
    // Image domains for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
<<<<<<< Updated upstream
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.com",
      },
=======
>>>>>>> Stashed changes
    ],
    // Image formats
    formats: ["image/webp", "image/avif"],
    // Image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization
    unoptimized: false,
  },

  // === WEBPACK CONFIGURATION ===
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Bundle analyzer (development only)
    if (dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(true),
          __THEME_NAME__: JSON.stringify("Horizon UI Pro"),
          __THEME_VERSION__: JSON.stringify("1.0.0"),
          __THEME_VARIANT__: JSON.stringify("light"),
        })
      );
    }

    // Production optimizations
    if (!dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(false),
          __THEME_NAME__: JSON.stringify("Horizon UI Pro"),
          __THEME_VERSION__: JSON.stringify("1.0.0"),
          __THEME_VARIANT__: JSON.stringify("light"),
        })
      );
    }

    return config;
  },

  // === ENVIRONMENT VARIABLES ===
  env: {
    THEME_NAME: "Horizon UI Pro",
    THEME_VERSION: "1.0.0",
    THEME_VARIANT: "light",
    THEME_PRIMARY_COLOR: "#052CC9",
    THEME_SECONDARY_COLOR: "#4FD1C7",
    THEME_BACKGROUND_COLOR: "#FFFFFF",
  },

  // === REDIRECTS ===
  async redirects() {
    return [
      // Theme-specific redirects can be added here
      {
        source: "/theme",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // === HEADERS ===
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
          // Theme metadata headers
          {
            key: "X-Theme-Name",
            value: "Horizon UI Pro",
          },
          {
            key: "X-Theme-Version",
            value: "1.0.0",
          },
          {
            key: "X-Theme-Variant",
            value: "light",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // === PERFORMANCE OPTIMIZATIONS ===
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // === OUTPUT CONFIGURATION ===
  output: "standalone",

  // === SASS CONFIGURATION ===
  sassOptions: {
    includePaths: ["./src/styles"],
    prependData: `
<<<<<<< Updated upstream
      $primary-color: #112031;
      $primary-medium-color: #294359;
      $accent-gold-color: #AC9469;
      $neutral-warm-color: #B4AC9C;
      $neutral-light-color: #D2D0C8;
      $secondary-color: #4FD1C7;
      $background-color: #FFFFFF;
      $text-color: #112031;
      $border-color: #D2D0C8;
=======
      $primary-color: #052CC9;
      $secondary-color: #4FD1C7;
      $background-color: #FFFFFF;
      $text-color: #0B1437;
      $border-color: #E5E7EB;
>>>>>>> Stashed changes
    `,
  },

  // === COMPILER OPTIONS ===
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
    // Enable SWC minification
    styledComponents: true,
  },

  // === REWRITES ===
  async rewrites() {
    return [
      // API rewrites for theme endpoints
      {
        source: "/api/theme/:path*",
        destination: "/api/theme/:path*",
      },
    ];
  },

  // === TRAILING SLASH ===
  trailingSlash: false,

  // === REACT STRICT MODE ===
  reactStrictMode: true,
};

export default nextConfig;

// Generated by VIBECODE Theming System Universal
// Theme: Horizon UI Pro v1.0.0
// Generated: 2025-06-13T13:27:59.110029
// Source: @project-core/memory/horizon_ui_design_system.md
// Compliance: VIBECODE V4.0 + EHS V1
// Next.js Configuration optimized for Horizon UI Pro theme system

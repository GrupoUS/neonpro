import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // === EXPERIMENTAL FEATURES ===
  experimental: {
    // Performance optimizations
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@supabase/ssr",
      "@ai-sdk/openai",
      "@neondatabase/serverless",
      "lucide-react",
      "ai",
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
  serverExternalPackages: ["@prisma/client"],

  // === TYPESCRIPT CONFIGURATION ===
  typescript: {
    // Type checking during build (temporarily disabled for validation)
    ignoreBuildErrors: true,
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

    // ✅ POLYFILLS APLICADOS GLOBALMENTE (SEM CONDICIONAIS) - VERCEL COMPATIBLE
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Core polyfills
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      url: require.resolve("url/"),
      querystring: require.resolve("querystring-es3"),
      // Additional polyfills for OpenTelemetry and Vercel compatibility
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      // Node.js modules disabled
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };

    // ✅ PROVIDE PLUGIN GLOBAL - VERCEL OPTIMIZED
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
        global: "global",
      })
    );

    // ✅ ALIAS CONFIGURATION COMPLETA - NODE.JS PROTOCOL SUPPORT
    config.resolve.alias = {
      ...config.resolve.alias,
      // Node.js protocol aliases
      "node:process": "process/browser",
      "node:buffer": "buffer",
      "node:util": "util",
      "node:url": "url",
      "node:querystring": "querystring-es3",
      "node:stream": "stream-browserify",
      "node:crypto": "crypto-browserify",
      "node:os": "os-browserify/browser",
      "node:path": "path-browserify",
    };

    // ✅ VERCEL-SPECIFIC OPTIMIZATIONS
    if (process.env.VERCEL) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            polyfills: {
              name: "polyfills",
              test: /[\\/]node_modules[\\/](process|buffer|util|url|querystring-es3|stream-browserify|crypto-browserify|os-browserify|path-browserify)[\\/]/,
              chunks: "all",
              priority: 20,
            },
          },
        },
      };
    }

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
    THEME_PRIMARY_COLOR: "#112031",
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
  // Removido output: "standalone" - não necessário para Vercel
  // O Vercel gerencia automaticamente o output

  // === SASS CONFIGURATION ===
  sassOptions: {
    includePaths: ["./src/styles"],
    prependData: `
      $primary-color: #112031;
      $primary-medium-color: #294359;
      $accent-gold-color: #AC9469;
      $neutral-warm-color: #B4AC9C;
      $neutral-light-color: #D2D0C8;
      $secondary-color: #4FD1C7;
      $background-color: #FFFFFF;
      $text-color: #112031;
      $border-color: #D2D0C8;
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

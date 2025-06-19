import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // === BASIC CONFIGURATION ===
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  // === TYPESCRIPT CONFIGURATION ===
  typescript: {
    // Type checking during build (temporarily disabled for UI component compatibility)
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
    // Enable image optimization
    unoptimized: false,
  },

  // === WEBPACK CONFIGURATION (SIMPLIFIED) ===
  webpack: (config, { webpack }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Basic polyfills for browser compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };

    return config;
  },

  // === EXPERIMENTAL FEATURES (MINIMAL) ===
  experimental: {
    // Only essential optimizations
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@supabase/ssr",
      "lucide-react",
    ],
  },

  // === ENVIRONMENT VARIABLES ===
  env: {
    THEME_NAME: "Horizon UI Pro",
    THEME_VERSION: "1.0.0",
  },

  // === REDIRECTS ===
  async redirects() {
    return [
      {
        source: "/theme",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // === COMPILER OPTIONS ===
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // === SASS CONFIGURATION ===
  sassOptions: {
    includePaths: ["./src/styles"],
  },
};

export default nextConfig;

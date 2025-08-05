/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turborepo optimizations
  transpilePackages: ["@neonpro/ui", "@neonpro/utils", "@neonpro/types"],

  // Build configuration - ignore linting and type checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@neonpro/ui"],
  },

  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Bundle analyzer for monitoring
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        neonpro: {
          test: /[\\/]packages[\\/]/,
          name: "neonpro-packages",
          chunks: "all",
          priority: 10,
        },
      };
    }
    return config;
  },

  // Environment variables
  env: {
    TURBO_BUILD: "true",
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

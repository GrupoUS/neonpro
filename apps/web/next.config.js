// Temporarily disabled for deployment
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@neonpro/brazilian-healthcare-ui",
    "@neonpro/types",
    "@neonpro/utils",

    "@neonpro/core-services",
  ],
  experimental: {},
  // Only skip TypeScript checking if explicitly allowed (defaults to false for type safety)
  typescript: {
    ignoreBuildErrors: process.env.NEXT_ALLOW_IGNORE_TS_ERRORS === "true",
  },
  // Skip problematic API routes during build
  generateBuildId: async () => {
    return "mvp-build";
  },
  images: {
    domains: ["ownkoxryswokcdanrdgj.supabase.co"],
    formats: ["image/webp", "image/avif"],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Temporarily disabled for deployment
module.exports = nextConfig;

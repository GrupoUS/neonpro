import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
// ⚠️ DEPRECATED: This next.config.mjs is now DEPRECATED after Turborepo reorganization
// All Next.js configuration should be done in apps/web/next.config.mjs
// This file exists only for compatibility and will be removed after migration is complete

const nextConfig = {
  // Legacy transpilePackages for compatibility during migration
  transpilePackages: ["@neonpro/ui", "@neonpro/domain", "@neonpro/types", "@neonpro/utils"],

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      || (process.env.NODE_ENV === "production" ? "/api/v1" : "http://localhost:3003"),
  },

  // API configuration - no rewrites needed in production (Vercel handles this)
  async rewrites() {
    // Only rewrite in development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3003/:path*",
        },
      ];
    }
    return [];
  },

  // Security headers
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
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Image configuration
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "grupous",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});

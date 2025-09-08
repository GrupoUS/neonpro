/**
 * Next.js Configuration Optimizations for Core Web Vitals
 *
 * Enhanced configuration with aggressive bundle splitting and performance optimizations
 * Target: LCP <2.5s, FID <100ms, CLS <0.1, Bundle Size -20%
 */

/** @type {import('next').NextConfig} */
const optimizedNextConfig = {
  output: "standalone",
  transpilePackages: [
    "@neonpro/ui",
    "@neonpro/utils",
    "@neonpro/database",
  ],

  // HEALTHCARE PRODUCTION OPTIMIZATION
  compress: true, // Enable gzip compression for production
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Image optimization for healthcare media - ENHANCED
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Healthcare-specific optimizations
    minimumCacheTTL: 31_536_000, // 1 year cache for healthcare assets
    dangerouslyAllowSVG: true, // Allow SVG for medical icons
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimization - ENHANCED
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      "@neonpro/ui",
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-toast",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "framer-motion", // Selective imports for animations
    ],
    turbo: {
      resolveAlias: {
        "@/": "./",
      },
    },
    // Enable modern bundling optimizations
    optimizeCss: true,
    webVitalsAttribution: ["CLS", "FCP", "FID", "INP", "LCP", "TTFB"],
  },

  // Webpack optimization for aggressive bundle splitting
  webpack: async (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      // Enhanced code splitting for healthcare application
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20_000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50_000,
        cacheGroups: {
          // PDF processing libraries - Heavy medical reports
          pdf: {
            test: /[\\/]node_modules[\\/](@react-pdf|jspdf|jspdf-autotable|pdfkit)[\\/]/,
            name: "pdf-chunk",
            chunks: "all",
            priority: 30,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Excel processing - Patient data import/export
          excel: {
            test: /[\\/]node_modules[\\/](xlsx|csv-parse|papaparse)[\\/]/,
            name: "excel-chunk",
            chunks: "all",
            priority: 25,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Payment processing - Stripe integration
          payments: {
            test: /[\\/]node_modules[\\/](@stripe|stripe)[\\/]/,
            name: "payments-chunk",
            chunks: "all",
            priority: 20,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Animation libraries - UI enhancements
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: "animations-chunk",
            chunks: "all",
            priority: 15,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Image processing - Screenshots, charts
          imaging: {
            test: /[\\/]node_modules[\\/](html2canvas|canvg)[\\/]/,
            name: "imaging-chunk",
            chunks: "all",
            priority: 10,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Supabase - Database operations
          database: {
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            name: "database-chunk",
            chunks: "all",
            priority: 8,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Router - Navigation chunks
          router: {
            test: /[\\/]node_modules[\\/](@tanstack\/react-router|@tanstack\/router-devtools)[\\/]/,
            name: "router-chunk",
            chunks: "all",
            priority: 5,
            enforce: true,
            reuseExistingChunk: true,
          },
          // UI Framework - Core components
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@hookform|react-hook-form)[\\/]/,
            name: "ui-chunk",
            chunks: "all",
            priority: 3,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Vendor libraries - Common utilities
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            priority: 1,
            enforce: false,
            reuseExistingChunk: true,
          },
        },
      };

      // Bundle analyzer in development
      if (process.env.ANALYZE === "true") {
        const { BundleAnalyzerPlugin } = await import("webpack-bundle-analyzer");
        const Analyzer = BundleAnalyzerPlugin.BundleAnalyzerPlugin ?? BundleAnalyzerPlugin;
        config.plugins.push(
          new Analyzer({
            analyzerMode: "static",
            reportFilename: "../bundle-analysis.html",
            openAnalyzer: true,
          }),
        );
      }

      // Optimize production builds
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Tree shaking enhancements
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize lodash imports
        "lodash-es": "lodash",
      };
    }

    return config;
  },

  // Security headers for healthcare compliance
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
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Performance optimizations
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Font optimization headers
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Static assets optimization
      {
        source: "/(.*\\.(?:js|css|woff2?|eot|ttf|otf)$)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  eslint: {
    // HEALTHCARE CRITICAL: Using Oxlint for code quality validation
    ignoreDuringBuilds: true, // Oxlint handles linting in CI/CD pipeline
  },
  typescript: {
    // HEALTHCARE CRITICAL: TypeScript errors MUST be fixed for patient safety
    // ignoreBuildErrors: false, // Patient safety requirement - errors must be fixed
  },

  // Core Web Vitals optimization
  swcMinify: true, // Use SWC for faster minification
  reactStrictMode: true, // Enable strict mode for better performance

  // Bundle optimization
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
      skipDefaultConversion: true,
    },
  },
};

export default optimizedNextConfig;

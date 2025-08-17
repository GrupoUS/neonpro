/** @type {import('next').NextConfig} */

// Zod schema for environment validation
import { z } from "zod";

// Environment variables validation schema
const envSchema = z.object({
  // Supabase (CRITICAL - Required for app to function)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  
  // Optional but important environment variables
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // AI Services (Optional for basic functionality)
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  
  // Search Services (Optional)
  TAVILY_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  
  // Email Service (Optional)
  RESEND_API_KEY: z.string().optional(),
  
  // Payment Processing (Optional)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

// Validate environment variables
const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return env;
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid environment configuration");
  }
};

// Validate environment on build
const validatedEnv = validateEnv();

// Bundle Analyzer Configuration
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // ESLint configuration for healthcare compliance
  eslint: {
    // ESLint enabled for production builds to catch errors early
    ignoreDuringBuilds: false,
    dirs: [
      "app",
      "components", 
      "lib",
      "hooks",
      "middleware",
      "contexts",
      "types",
    ],
  },

  // TypeScript configuration for strict type safety
  typescript: {
    // TypeScript type checking enabled for production builds
    // This ensures type safety in production deployments
    ignoreBuildErrors: false,
  },

  // Experimental optimizations for performance
  experimental: {
    // Optimize package imports for better performance
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "@supabase/supabase-js",
      "recharts",
      "date-fns",
    ],
  },

  // Compiler optimizations (Next.js 15 with swcMinify default)
  compiler: {
    // Remove console.log in production builds
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // Output configuration for deployment
  output: "standalone",

  // External packages that should not be bundled
  serverExternalPackages: ["sharp"],

  // Enhanced webpack configuration
  webpack: (config) => {
    // SVG optimization for healthcare icons
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Suppress OpenTelemetry critical dependency warnings
    // These warnings are cosmetic and do not affect functionality
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    
    // Suppress all OpenTelemetry instrumentation critical dependency warnings
    config.ignoreWarnings.push(
      // Match any file in OpenTelemetry instrumentation modules
      (warning) => {
        return (
          warning.module &&
          warning.module.resource &&
          warning.module.resource.includes('@opentelemetry/instrumentation') &&
          warning.message &&
          warning.message.includes('Critical dependency: the request of a dependency is an expression')
        );
      }
    );
    
    // Suppress require-in-the-middle warnings
    config.ignoreWarnings.push(
      (warning) => {
        return (
          warning.module &&
          warning.module.resource &&
          warning.module.resource.includes('require-in-the-middle') &&
          warning.message &&
          warning.message.includes('Critical dependency')
        );
      }
    );

    return config;
  },

  // Image optimization configuration for medical images
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

  // Security and performance headers for healthcare compliance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Healthcare-grade security headers
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
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Performance headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      // Static assets caching for performance
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes caching for healthcare APIs
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

  // Compress responses for performance
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Environment variables to expose to the client
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Logging configuration for development and debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Healthcare-specific redirects for SEO optimization
  async redirects() {
    return [
      // Redirect old analytics URLs
      {
        source: "/dashboard/analytics",
        destination: "/dashboard/analytics/overview",
        permanent: true,
      },
      // Legacy patient management redirects
      {
        source: "/patients",
        destination: "/dashboard/patients",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

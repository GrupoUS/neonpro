/** @type {import('next').NextConfig} */
const nextConfig = {
  // instrumentationHook is now available by default in Next.js 15
  // serverComponentsExternalPackages moved to serverExternalPackages
  serverExternalPackages: ['@opentelemetry/api'],
  webpack: (config, { isServer }) => {
    // DEFINITIVE SOLUTION: Comprehensive OpenTelemetry warning suppression
    // Based on extensive research from VS Code docs, GitHub issues, and Next.js best practices
    
    // 1. Suppress specific OpenTelemetry "Critical dependency" warnings
    config.ignoreWarnings = [
      // Core OpenTelemetry modules that use dynamic requires
      {
        module: /@opentelemetry/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      // BullMQ and other queue libraries
      {
        module: /bullmq/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      // Instrumentation middleware
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/,
      },
      // Any dynamic import warnings from node_modules
      {
        module: /node_modules/,
        message: /Critical dependency.*expression/,
      },
    ];

    // 2. Disable critical warnings for dynamic expressions in modules
    // This is safe for libraries that legitimately use dynamic requires
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    
    // 3. Additional context options for better module resolution
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      dns: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
};

module.exports = nextConfig;
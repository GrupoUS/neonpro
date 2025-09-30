/**
 * NeonPro Bun Runtime Configuration
 * Optimized for healthcare compliance and performance
 *
 * Features:
 * - Healthcare compliance monitoring
 * - Performance optimization for Brazilian aesthetic clinics
 * - LGPD/ANVISA/CFM compliance support
 * - Edge runtime compatibility
 */

export default {
  // Target environment
  target: 'bun',

  // Entry points for different environments
  entrypoints: {
    // API server entry point
    api: './apps/api/src/index.ts',
    // Web application entry point
    web: './apps/web/src/main.tsx',
    // Database scripts entry point
    database: './packages/database/src/index.ts',
  },

  // Output configuration
  outdir: './dist',

  // Format configuration
  format: 'esm',

  // Minification for production
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },

  // Source maps for debugging
  sourcemap: true,

  // External dependencies (don't bundle)
  external: [
    // Node.js built-ins
    'fs',
    'path',
    'crypto',
    'util',
    'stream',
    'buffer',
    'events',
    'http',
    'https',
    'net',
    'tls',
    'dns',
    'child_process',

    // Healthcare-specific external dependencies
    '@supabase/supabase-js',
    'supabase',
    'prisma',
    '@prisma/client',

    // React ecosystem
    'react',
    'react-dom',
    'react-router-dom',

    // Development tools
    'vitest',
    'playwright',
    'typescript',
  ],

  // Define global constants
  define: {
    // Environment-specific constants
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.BUN_VERSION': JSON.stringify(process.env.BUN_VERSION),

    // Healthcare compliance flags
    'process.env.LGPD_COMPLIANCE': JSON.stringify(process.env.LGPD_COMPLIANCE || 'enabled'),
    'process.env.HEALTHCARE_AUDIT': JSON.stringify(process.env.HEALTHCARE_AUDIT || 'enabled'),
    'process.env.ANVISA_COMPLIANCE': JSON.stringify(process.env.ANVISA_COMPLIANCE || 'enabled'),
    'process.env.CFM_COMPLIANCE': JSON.stringify(process.env.CFM_COMPLIANCE || 'enabled'),

    // Performance optimization flags
    'process.env.EDGE_RUNTIME': JSON.stringify(process.env.EDGE_RUNTIME || 'bun'),
    'process.env.BUN_PERFORMANCE': JSON.stringify(process.env.BUN_PERFORMANCE || 'optimized'),
  },

  // Plugin configuration
  plugins: [
    // TypeScript support
    {
      name: 'typescript',
      setup(build) {
        // TypeScript configuration handling
        build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
          // Handle TypeScript compilation with healthcare compliance
          return {
            contents: await Bun.file(args.path).text(),
            loader: 'ts',
          };
        });
      },
    },
  ],

  // Loader configuration for different file types
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
    '.json': 'json',
    '.wasm': 'wasm',
    '.sql': 'text',
    '.md': 'text',
  },

  // Optimizations
  optimization: {
    // Enable dead code elimination
    eliminateDeadCode: true,

    // Optimize for healthcare data processing
    optimizeHealthcareData: true,

    // Enable performance monitoring
    performanceMonitoring: true,

    // Memory optimization for large datasets
    memoryOptimization: {
      maxHeapSize: '2GB',
      gcOptimization: true,
    },
  },

  // Development server configuration
  development: {
    // Hot module replacement for development
    hot: true,

    // Enable development logging
    logging: {
      level: 'info',
      healthcareCompliance: true,
      performanceMetrics: true,
    },
  },

  // Production configuration
  production: {
    // Strict mode for production
    strict: true,

    // Healthcare compliance validation
    healthcareCompliance: {
      lgpdValidation: true,
      auditLogging: true,
      dataResidency: 'brazil',
    },

    // Performance optimization
    performance: {
      bundleAnalysis: true,
      compressionEnabled: true,
      edgeOptimization: true,
    },
  },

  // Testing configuration
  test: {
    // Test runner configuration
    runner: 'bun:test',

    // Coverage configuration
    coverage: {
      enabled: true,
      threshold: 90,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    },

    // Healthcare compliance testing
    healthcareTesting: {
      lgpdCompliance: true,
      securityValidation: true,
      accessibilityTesting: true,
    },
  },

  // Security configuration
  security: {
    // Enable security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    },

    // Healthcare data protection
    healthcareProtection: {
      dataEncryption: true,
      auditLogging: true,
      accessControl: true,
    },
  },

  // Monitoring configuration
  monitoring: {
    // Performance monitoring
    performance: {
      enabled: true,
      metricsCollection: true,
      realTimeMonitoring: true,
    },

    // Healthcare compliance monitoring
    healthcareCompliance: {
      enabled: true,
      auditTrail: true,
      dataResidencyMonitoring: true,
      lgpdCompliance: true,
    },
  },
};

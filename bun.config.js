/**
 * NeonPro Bun Configuration
 * Healthcare Compliance: LGPD, ANVISA, CFM
 * Performance: Optimized for healthcare workloads
 */

export default {
  // Target environment
  target: 'bun',

  // Entry points
  entrypoints: [
    './apps/api/src/index.ts',
    './apps/web/src/index.tsx'
  ],

  // Output configuration
  outdir: './dist',
  format: 'esm',
  sourcemap: true,

  // TypeScript configuration
  tsconfig: './tsconfig.json',

  // External dependencies (not bundled)
  external: [
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@trpc/server',
    '@trpc/client'
  ],

  // Optimization settings
  minify: {
    syntax: true,
    whitespace: true,
  },

  // Healthcare compliance settings
  define: {
    // Ensure compliance flags are available at build time
    HEALTHCARE_COMPLIANCE: JSON.stringify(process.env.HEALTHCARE_COMPLIANCE || 'true'),
    LGPD_MODE: JSON.stringify(process.env.LGPD_MODE || 'true'),
    DATA_RESIDENCY: JSON.stringify(process.env.DATA_RESIDENCY || 'local'),
    AUDIT_LOGGING: JSON.stringify(process.env.AUDIT_LOGGING || 'true'),

    // Environment-specific settings
    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    BUN_RUNTIME: JSON.stringify(process.env.BUN_RUNTIME || 'true'),
    VERCEL_ENV: JSON.stringify(process.env.VERCEL_ENV || 'development'),
    EDGE_RUNTIME: JSON.stringify(process.env.EDGE_RUNTIME || 'false'),
  },

  // Plugin configuration
  plugins: [
    // Healthcare compliance plugin
    {
      name: 'healthcare-compliance',
      setup(build) {
        // Log all build operations for compliance
        build.onStart(() => {
          console.log('[HEALTHCARE-AUDIT] Build started with compliance mode:', process.env.HEALTHCARE_COMPLIANCE);
        });

        build.onEnd((result) => {
          console.log('[HEALTHCARE-AUDIT] Build completed:', result);
        });
      }
    }
  ],

  // Loader configuration
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
    '.json': 'json',
    '.css': 'css',
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.webp': 'file',
  },

  // Path resolution
  resolve: {
    alias: {
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/hooks': './src/hooks',
      '@/contexts': './src/contexts',
      '@/utils': './src/utils',
      '@/types': './src/types',
      '@/assets': './src/assets',
    },
  },

  // Environment variables
  env: {
    // Healthcare compliance environment variables
    HEALTHCARE_COMPLIANCE: process.env.HEALTHCARE_COMPLIANCE || 'true',
    LGPD_MODE: process.env.LGPD_MODE || 'true',
    DATA_RESIDENCY: process.env.DATA_RESIDENCY || 'local',
    AUDIT_LOGGING: process.env.AUDIT_LOGGING || 'true',

    // Database configuration
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,

    // API configuration
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

    // Runtime configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    BUN_RUNTIME: process.env.BUN_RUNTIME || 'true',
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    EDGE_RUNTIME: process.env.EDGE_RUNTIME || 'false',
    CI: process.env.CI || 'false',

    // Performance configuration
    BUN_PERFORMANCE: process.env.BUN_PERFORMANCE || 'true',
  },

  // Development server configuration
  dev: {
    port: 3000,
    hostname: '0.0.0.0',
    https: false,

    // Hot module replacement
    hmr: {
      enabled: true,
    },

    // Development middleware
    middleware: [
      // Healthcare compliance middleware
      (req, res, next) => {
        // Log all requests for compliance
        console.log('[HEALTHCARE-AUDIT] Request:', {
          method: req.method,
          url: req.url,
          timestamp: new Date().toISOString(),
          compliance: {
            lgpd: process.env.LGPD_MODE || 'true',
            healthcare: process.env.HEALTHCARE_COMPLIANCE || 'true',
          }
        });

        // Continue with request
        next();
      }
    ]
  },

  // Build configuration
  build: {
    // Target runtime
    target: 'bun',

    // Output directory
    outdir: './dist',

    // Source maps
    sourcemap: true,

    // Minification
    minify: {
      syntax: true,
      whitespace: true,
    },

    // Dead code elimination
    deadCodeElimination: true,

    // Tree shaking
    treeShaking: true,

    // Splitting
    splitting: true,

    // Chunking
    chunking: {
      strategy: 'auto',
    },

    // Metafile for analysis
    metafile: true,
  },

  // Test configuration
  test: {
    // Test environment
    env: 'jsdom',

    // Test setup files
    setupFiles: [
      './src/test/setup.ts'
    ],

    // Coverage configuration
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Healthcare compliance test configuration
    globals: {
      HEALTHCARE_COMPLIANCE: true,
      LGPD_MODE: true,
      DATA_RESIDENCY: 'local',
      AUDIT_LOGGING: true,
    },
  },
};

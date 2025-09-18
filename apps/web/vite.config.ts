import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'crypto';
import { componentTagger } from 'lovable-tagger';
import path from 'path';
import { type ConfigEnv, defineConfig } from 'vite';
import { generateHealthcareSecurityHeaders } from './src/lib/security/csp';

// Subresource Integrity (SRI) Plugin for healthcare security
function subresourceIntegrityPlugin() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    name: 'healthcare-sri',
    apply: 'build' as const,
    generateBundle(options: any, bundle: any) {
      if (!isProduction) return;

      // Generate SRI hashes for all assets
      const sriHashes = new Map<string, string>();

      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' || chunk.type === 'asset') {
          const content = chunk.type === 'chunk' ? chunk.code : chunk.source;
          if (typeof content === 'string') {
            // Generate SHA-384 hash for SRI
            const hash = createHash('sha384').update(content, 'utf8').digest('base64');
            sriHashes.set(fileName, `sha384-${hash}`);
          }
        }
      });

      // Store SRI hashes for runtime use
      this.emitFile({
        type: 'asset',
        fileName: 'sri-hashes.json',
        source: JSON.stringify(Object.fromEntries(sriHashes), null, 2),
      });
    },
    transformIndexHtml(html: string) {
      if (!isProduction) return html;

      // Add security headers as meta tags
      const securityHeaders = generateHealthcareSecurityHeaders();
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${
        securityHeaders['Content-Security-Policy']
      }">`;

      // Add healthcare-specific meta tags
      const healthcareMeta = `
        <meta name="healthcare-app" content="NeonPro-Platform">
        <meta name="data-classification" content="LGPD-Protected-Medical-Data">
        <meta name="compliance-standards" content="LGPD,ANVISA,CFM">
        <meta http-equiv="X-Content-Type-Options" content="nosniff">
        <meta http-equiv="X-Frame-Options" content="DENY">
        <meta http-equiv="X-XSS-Protection" content="1; mode=block">
        <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
        <meta name="robots" content="noindex, nofollow"> <!-- Healthcare data should not be indexed -->
      `;

      // Inject security headers and healthcare meta tags
      return html.replace(
        '<head>',
        `<head>${cspMeta}${healthcareMeta}`,
      );
    },
  };
}

// Healthcare asset integrity validation
function healthcareAssetValidation() {
  return {
    name: 'healthcare-asset-validation',
    apply: 'build' as const,
    generateBundle(options: any, bundle: any) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) return;

      // Validate that no sensitive data is included in assets
      const sensitivePatterns = [
        /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
        /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g, // RG
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
        /\bpassword\s*[:=]\s*['"]\w+['"]/gi, // Passwords
        /\bapi[_-]?key\s*[:=]\s*['"]\w+['"]/gi, // API keys
        /\bsecret\s*[:=]\s*['"]\w+['"]/gi, // Secrets
      ];

      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        const content = chunk.type === 'chunk' ? chunk.code : chunk.source;

        if (typeof content === 'string') {
          sensitivePatterns.forEach(pattern => {
            if (pattern.test(content)) {
              throw new Error(
                `[HEALTHCARE_SECURITY_ERROR] Potential sensitive data found in ${fileName}. Build failed to prevent accidental deployment of sensitive data.`,
              );
              // Build is aborted to prevent accidental deployment of sensitive data
            }
          });
        }
      });
    },
  };
}

// Performance budget enforcement for healthcare applications
function performanceBudgetPlugin() {
  return {
    name: 'healthcare-performance-budget',
    apply: 'build' as const,
    generateBundle(options: any, bundle: any) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) return;

      // Performance budget thresholds (in KB)
      const BUDGET_THRESHOLDS = {
        vendor: 300, // React and other core vendors
        router: 100, // TanStack Router
        query: 80, // TanStack Query
        supabase: 120, // Supabase client
        ui: 150, // UI components
        security: 100, // Security libraries
        patients: 150, // Patient management module
        appointments: 100, // Appointments module
        services: 80, // Services module
        auth: 100, // Authentication module
        'ai-components': 200, // AI components (larger due to ML models)
        monitoring: 80, // Monitoring and analytics
      };

      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.fileName.includes('.js')) {
          const chunkName = chunk.fileName.split('-')[0];
          const sizeInKB = chunk.code.length / 1024;

          if (BUDGET_THRESHOLDS[chunkName as keyof typeof BUDGET_THRESHOLDS]) {
            const budget = BUDGET_THRESHOLDS[chunkName as keyof typeof BUDGET_THRESHOLDS];
            if (sizeInKB > budget) {
              console.warn(
                `[PERFORMANCE_WARNING] ${chunkName} chunk (${
                  sizeInKB.toFixed(1)
                }KB) exceeds budget (${budget}KB). Consider optimization.`,
              );
            }
          }
        }
      });
    },
  };
}

// Healthcare module lazy loading optimization
function healthcareModuleOptimization() {
  return {
    name: 'healthcare-module-optimization',
    configResolved(config: any) {
      // Optimize prefetch behavior for healthcare modules
      config.optimizeDeps.force = false;

      // Set up module preload strategies
      config.build.rollupOptions.output.preloadStrategy = 'preload';

      // Optimize code splitting for healthcare modules
      config.build.rollupOptions.output.experimentalOptimizeChunks = true;
    },
  };
}

// External resource integrity configuration
const EXTERNAL_RESOURCES_SRI = {
  // Google Fonts (commonly used)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap':
    'sha384-rD+TRJXcOQhVTJPEYpNMXq8/wCfRvdwTI1u5n3UeGbVwWrLx2GdV5QDqhbRZNzHW',

  // CDN resources (update hashes as needed)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css':
    'sha384-j0CNLUeiqtyaRmlzUHCPZ+Gy5fQu0dQ6eZ/xAww941Ai1SxSY+0EQqNXNE6DZiVc',
  // Add more external resources as needed
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
      autoCodeSplitting: true,
      // Enable healthcare-specific route optimizations
      routeFilePatterns: ['**/*route.{ts,tsx}', '**/*page.{ts,tsx}'],
      addRouteExtensions: false,
    }),
    react(),
    mode === 'development' ? (componentTagger() as any) : undefined,
    subresourceIntegrityPlugin(),
    healthcareAssetValidation(),
    performanceBudgetPlugin(),
    healthcareModuleOptimization(),
  ].filter(Boolean) as any,
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/ui/lib/utils': path.resolve(__dirname, '../../packages/ui/src/lib/utils.ts'),
      '@neonpro/ui/theme': path.resolve(__dirname, '../../packages/ui/src/theme'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, '../../packages/types/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  define: {
    // Vite requires these to be defined for Supabase
    global: 'globalThis',
    // Define build-time constants for healthcare security
    __HEALTHCARE_APP__: JSON.stringify(true),
    __DATA_CLASSIFICATION__: JSON.stringify('LGPD-Protected-Medical-Data'),
    __COMPLIANCE_STANDARDS__: JSON.stringify(['LGPD', 'ANVISA', 'CFM']),
  },
  server: {
    host: '::',
    port: 8080,
    open: true,
    // Add security headers for development server
    headers: mode === 'development'
      ? {
        'X-Healthcare-App': 'NeonPro-Platform-Dev',
        'X-Data-Classification': 'Development-Data',
        'X-Content-Type-Options': 'nosniff',
      }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy: any, _options: any) => {
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq: any, req: any, _res: any) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    target: 'es2020',
    // Healthcare-specific build optimization
    cssCodeSplit: true,
    cssTarget: 'es2020',
    // Enable modern JavaScript features for healthcare apps
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // Preserve healthcare-critical functions
        passes: 3,
      },
      mangle: {
        safari10: true,
        // Preserve healthcare debugging function names
        reserved: [
          'healthcareError',
          'lgpdCompliance',
          'auditLog',
          'patientSafetyAlert',
          'emergencyResponse',
          'medicalRecordAccess',
          'consentValidation',
        ],
      },
      format: {
        // Preserve license comments and healthcare compliance annotations
        comments: /@preserve|@license|@cc_on|^!|@healthcare|@lgpd|@emergency|@medical/,
      },
    },
    rollupOptions: {
      external: [
        // OpenTelemetry packages that should be external for frontend builds
        '@opentelemetry/auto-instrumentations-node',
        '@opentelemetry/exporter-otlp-http',
        '@opentelemetry/exporter-otlp-grpc',
        '@opentelemetry/sdk-node',
      ],
      output: {
        // Advanced code splitting strategy for healthcare modules
        manualChunks: id => {
          // Vendor chunks with healthcare-specific categorization
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            // Router and state management
            if (id.includes('@tanstack/react-router') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }

            // Database and auth
            if (id.includes('@supabase/supabase-js') || id.includes('@supabase/auth-js')) {
              return 'vendor-database';
            }

            // UI libraries
            if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-ui';
            }

            // Forms and validation
            if (
              id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')
              || id.includes('valibot')
            ) {
              return 'vendor-forms';
            }

            // Icons and graphics
            if (id.includes('lucide-react') || id.includes('@tabler/icons-react')) {
              return 'vendor-icons';
            }

            // Charts and data visualization
            if (id.includes('recharts') || id.includes('d3') || id.includes('chart.js')) {
              return 'vendor-charts';
            }

            // AI and ML libraries (larger chunks)
            if (id.includes('@vercel/ai') || id.includes('openai') || id.includes('anthropic')) {
              return 'vendor-ai';
            }

            // Security and monitoring
            if (id.includes('@sentry') || id.includes('opentelemetry') || id.includes('@sentry')) {
              return 'vendor-security';
            }

            // Image processing
            if (id.includes('sharp') || id.includes('image') || id.includes('canvas')) {
              return 'vendor-images';
            }

            // Date and time utilities
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
              return 'vendor-datetime';
            }

            // Other vendor libraries
            return 'vendor-misc';
          }

          // Application-specific chunks

          // Healthcare-specific modules (lazy loaded)
          if (id.includes('/routes/patients/')) {
            if (id.includes('medical-records')) return 'patients-medical-records';
            if (id.includes('consent-management')) return 'patients-consent';
            if (id.includes('appointments')) return 'patients-appointments';
            return 'patients-core';
          }

          if (id.includes('/routes/appointments/')) {
            if (id.includes('scheduling')) return 'appointments-scheduling';
            if (id.includes('calendar')) return 'appointments-calendar';
            return 'appointments-core';
          }

          if (id.includes('/routes/services/')) {
            if (id.includes('ai-analysis')) return 'services-ai-analysis';
            if (id.includes('treatments')) return 'services-treatments';
            return 'services-core';
          }

          if (id.includes('/routes/auth/')) {
            if (id.includes('lgpd-consent')) return 'auth-lgpd';
            if (id.includes('biometric')) return 'auth-biometric';
            return 'auth-core';
          }

          if (id.includes('/routes/ai/')) {
            if (id.includes('chat')) return 'ai-chat';
            if (id.includes('analysis')) return 'ai-analysis';
            return 'ai-core';
          }

          if (id.includes('/routes/dashboard/')) {
            if (id.includes('analytics')) return 'dashboard-analytics';
            if (id.includes('monitoring')) return 'dashboard-monitoring';
            return 'dashboard-core';
          }

          if (id.includes('/routes/financial/')) {
            if (id.includes('billing')) return 'financial-billing';
            if (id.includes('insurance')) return 'financial-insurance';
            return 'financial-core';
          }

          if (id.includes('/routes/admin/')) {
            if (id.includes('audit')) return 'admin-audit';
            if (id.includes('compliance')) return 'admin-compliance';
            return 'admin-core';
          }

          // Component chunks
          if (id.includes('/components/patients/')) {
            if (id.includes('forms/')) return 'patients-form-components';
            if (id.includes('cards/')) return 'patients-card-components';
            return 'patients-components';
          }

          if (id.includes('/components/ui/')) {
            if (id.includes('charts/') || id.includes('data/')) return 'ui-data-components';
            if (id.includes('forms/')) return 'ui-form-components';
            return 'ui-base-components';
          }

          if (id.includes('/components/ai/')) {
            if (id.includes('analysis/')) return 'ai-analysis-components';
            if (id.includes('chat/')) return 'ai-chat-components';
            return 'ai-base-components';
          }

          // Security and compliance packages
          if (id.includes('@neonpro/security') || id.includes('/security/')) {
            return 'security-module';
          }

          if (id.includes('@neonpro/ui')) {
            return 'ui-package';
          }

          // Shared utilities
          if (id.includes('@neonpro/utils') || id.includes('/utils/')) {
            if (id.includes('validation/')) return 'utils-validation';
            if (id.includes('formatting/')) return 'utils-formatting';
            return 'utils-core';
          }

          // Types and interfaces
          if (id.includes('@neonpro/types') || id.includes('/types/')) {
            return 'types-module';
          }
        },

        // Enhanced chunk naming with versioning and security
        chunkFileNames: chunkInfo => {
          // Use content hash with version prefix for better caching and security
          const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
          const chunkName = chunkInfo.name || 'chunk';
          return `assets/${chunkName}-${timestamp}-[hash].js`;
        },

        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

          // Healthcare-specific asset organization
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-${timestamp}-[hash][extname]`;
          }

          if (/css/i.test(ext)) {
            return `assets/css/[name]-${timestamp}-[hash][extname]`;
          }

          if (/woff|woff2|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-${timestamp}-[hash][extname]`;
          }

          if (/mp4|webm|mov/i.test(ext)) {
            return `assets/media/[name]-${timestamp}-[hash][extname]`;
          }

          return `assets/[name]-${timestamp}-[hash][extname]`;
        },

        // Entry file naming with healthcare compliance
        entryFileNames: `assets/entry-[name]-[hash].js`,

        // Dynamic import optimization
        dynamicImportFunctionOptions: {
          // Healthcare module loading strategy
          preferDynamicImports: true,
          inlineDynamicImports: false,
        },

        // Module preload strategy for healthcare apps
        experimentalMinChunkSize: 10000, // 10KB minimum chunk size
        experimentalOptimizeChunks: true,
        experimentalOptimizeModuleIds: true,
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    // Ensure builds are reproducible for security auditing
    minify: mode === 'production' ? 'terser' : false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      // Healthcare-critical dependencies
      'valibot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      'react-hook-form',
    ],
    // Exclude packages that might contain sensitive data or should be loaded on-demand
    exclude: mode === 'production'
      ? [
        '@neonpro/security',
        '@vercel/ai',
        'openai',
        'anthropic',
        '@simplewebauthn/server',
      ]
      : [],
    // Healthcare-specific optimization settings
    force: false,
    esbuildOptions: {
      target: 'es2020',
      // Optimize for healthcare application performance
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    // Drop console logs and debugger statements in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));

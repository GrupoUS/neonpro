import { TanStackRouterVite, } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// Healthcare-specific Vite configuration for NeonPro
export default defineConfig({
  plugins: [
    // React support with optimizations
    react({
      // Enable React DevTools in development
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: [
          // Optimize for healthcare performance
          ['babel-plugin-styled-components', {
            displayName: true,
            ssr: false,
          },],
        ],
      },
    },),

    // TanStack Router with file-based routing
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
      // Healthcare-specific route configuration
      experimental: {
        enableCodeSplitting: true, // Critical for large healthcare app
      },
    },),
  ],

  // Path resolution for healthcare modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src',),
      '@/components': path.resolve(__dirname, './src/components',),
      '@/hooks': path.resolve(__dirname, './src/hooks',),
      '@/lib': path.resolve(__dirname, './src/lib',),
      '@/providers': path.resolve(__dirname, './src/providers',),
      '@/contexts': path.resolve(__dirname, './src/contexts',),
      '@/utils': path.resolve(__dirname, './src/utils',),
      '@/types': path.resolve(__dirname, './src/types',),
      // Keep workspace package aliases
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src',),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src',),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database',),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external connections for healthcare team access
    open: true,
    cors: true,
    // Healthcare security headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // Build optimization for healthcare production
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'terser',
    // Critical for healthcare performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Healthcare-specific chunking strategy
          'healthcare-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
          ],
          'healthcare-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          'healthcare-charts': [
            'recharts',
          ],
          'healthcare-data': [
            '@tanstack/react-query',
            '@supabase/supabase-js',
            '@supabase/ssr',
          ],
          'healthcare-auth': [
            '@simplewebauthn/browser',
          ],
          'healthcare-icons': [
            'lucide-react',
          ],
          'vendor': ['react', 'react-dom',],
        },
      },
    },

    // Healthcare compliance requirements
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production for LGPD
        drop_debugger: true,
      },
    },

    // Build size optimization for healthcare networks
    chunkSizeWarningLimit: 1000, // 1MB chunks max
  },

  // Environment variables configuration
  define: {
    // Healthcare environment flags
    __HEALTHCARE_MODE__: JSON.stringify('production',),
    __LGPD_COMPLIANCE__: JSON.stringify(true,),
    __ANVISA_COMPLIANCE__: JSON.stringify(true,),
  },

  // CSS processing for healthcare themes
  css: {
    postcss: {
      plugins: [
        // Tailwind CSS support maintained
        tailwindcss,
        autoprefixer,
      ],
    },
    modules: {
      // CSS modules for component isolation
      localsConvention: 'camelCase',
    },
  },

  // Optimizations for healthcare performance
  optimizeDeps: {
    include: [
      // Pre-bundle heavy healthcare dependencies
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
      'react-hook-form',
    ],
    exclude: [
      // Exclude development-only packages
      '@tanstack/router-devtools',
    ],
  },

  // TypeScript configuration
  esbuild: {
    // Healthcare-specific TypeScript settings
    logOverride: { 'this-is-undefined-in-esm': 'silent', },
    target: 'esnext',
    format: 'esm',
  },

  // Preview server for testing builds
  preview: {
    port: 3001,
    host: true,
    cors: true,
  },

  // Healthcare-specific worker configuration
  worker: {
    format: 'es',
    plugins: () => [
      // Worker plugins for background healthcare tasks
    ],
  },
},)

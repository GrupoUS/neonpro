import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
        quoteStyle: 'single',
        autoCodeSplitting: true,
        addRouteExtensions: false,
      }),
      react(),
    ],

    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@neonpro/ui', replacement: path.resolve(__dirname, '../../packages/ui/src') },
        { find: '@neonpro/shared', replacement: path.resolve(__dirname, '../../packages/shared/src') },
        { find: '@neonpro/utils', replacement: path.resolve(__dirname, '../../packages/utils/src') },
        { find: '@neonpro/types', replacement: path.resolve(__dirname, '../../packages/types/src') },
        { find: '@sentry/react', replacement: path.resolve(__dirname, './src/shims/sentry-react.tsx') },
        { find: '@sentry/tracing', replacement: path.resolve(__dirname, './src/shims/sentry-tracing.ts') },
        { find: /^file-saver(\/.*)?$/, replacement: path.resolve(__dirname, './src/shims/file-saver') },
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    server: {
      host: '::',
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3004',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        external: [
          '@opentelemetry/auto-instrumentations-node',
          '@opentelemetry/exporter-otlp-http',
          '@opentelemetry/exporter-otlp-grpc',
          '@opentelemetry/sdk-node',
        ],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
              if (id.includes('@tanstack')) return 'vendor-tanstack'
              if (id.includes('@supabase')) return 'vendor-database'
              if (id.includes('@radix-ui') || id.includes('framer-motion')) return 'vendor-ui'
              return 'vendor'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1200,
      reportCompressedSize: false,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'react-hook-form',
      ],
      exclude: ['file-saver'],
    },
  }
})

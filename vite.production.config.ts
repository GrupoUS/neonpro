import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

let visualizer: any
try {
  visualizer = require('rollup-plugin-visualizer')
} catch (e) {
  // Plugin not available, will be skipped
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  const baseConfig = {
    plugins: [
      react(),
      visualizer && visualizer({
        filename: 'bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    root: './apps/web',
    publicDir: './public',
    css: {
      postcss: './postcss.config.cjs',
      modules: {
        localsConvention: 'camelCase' as const,
      },
    },
    resolve: {
      alias: [
        {
          find: '@sentry/react',
          replacement: path.resolve(
            __dirname,
            './apps/web/src/shims/sentry-react.ts',
          ),
        },
        {
          find: '@sentry/tracing',
          replacement: path.resolve(
            __dirname,
            './apps/web/src/shims/sentry-tracing.ts',
          ),
        },
        {
          find: /^@\//,
          replacement: path.resolve(__dirname, './apps/web/src/') + '/',
        },
        {
          find: /^@components\//,
          replacement: path.resolve(__dirname, './apps/web/src/components') + '/',
        },
        {
          find: /^@hooks\//,
          replacement: path.resolve(__dirname, './apps/web/src/hooks') + '/',
        },
        {
          find: '@neonpro/ui/lib/utils',
          replacement: path.resolve(__dirname, './packages/ui/src/utils'),
        },
        {
          find: '@neonpro/ui/theme',
          replacement: path.resolve(__dirname, './packages/ui/src/theme'),
        },
        {
          find: '@neonpro/ui',
          replacement: path.resolve(__dirname, './packages/ui/src'),
        },
        {
          find: '@neonpro/shared',
          replacement: path.resolve(__dirname, './packages/shared/src'),
        },
        {
          find: '@neonpro/utils',
          replacement: path.resolve(__dirname, './packages/utils/src'),
        },
        {
          find: '@neonpro/types',
          replacement: path.resolve(__dirname, './packages/types/src'),
        },
        {
          find: /^file-saver(\/.*)?$/,
          replacement: path.resolve(
            __dirname,
            './apps/web/src/shims/file-saver/index.ts',
          ),
        },
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      host: true,
      port: 8080,
      open: false,
    },
    build: {
      outDir: path.resolve(__dirname, './dist'),
      sourcemap: isProduction ? ('hidden' as const) : true,
      minify: isProduction ? ('terser' as const) : false,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'react-vendor'
              if (id.includes('@tanstack/react-router')) return 'router-vendor'
              if (id.includes('@tanstack/react-query')) return 'query-vendor'
              if (id.includes('@supabase/supabase-js')) return 'supabase-vendor'
              if (id.includes('lucide-react')) return 'icons-vendor'
              if (id.includes('zod') || id.includes('valibot')) return 'validation-vendor'
              return 'vendor'
            }

            if (id.includes('src/components')) return 'components'
            if (id.includes('src/hooks')) return 'hooks'
            if (id.includes('src/utils')) return 'utils'
            if (id.includes('src/pages')) return 'pages'
            if (id.includes('src/routes')) return 'routes'

            return 'index'
          },
          entryFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name].[hash][extname]' : 'assets/[name][extname]',
        },
        external: [],
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'valibot',
        'zod',
        'lucide-react',
      ],
      exclude: ['file-saver'],
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      legalComments: isProduction ? 'none' : 'inline',
      minifyIdentifiers: isProduction,
      minifyWhitespace: isProduction,
      minifySyntax: isProduction,
    } as any,
    preview: {
      port: 4173,
      host: true,
    },
    cssCodeSplit: true,
  }

  if (isProduction) {
    ;(baseConfig.build as any).terserOptions = {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    }
  }

  return baseConfig
})

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { componentTagger } from 'lovable-tagger';
import path from 'path';
import { type ConfigEnv, defineConfig } from 'vite';

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
    }),
    react(),
    mode === 'development' ? (componentTagger() as any) : undefined,
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
  },
  server: {
    host: '::',
    port: 8080,
    open: true,
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@tanstack/react-router')) {
              return 'router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'animations';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            if (id.includes('lucide-react') || id.includes('@tabler/icons-react')) {
              return 'icons';
            }
            if (id.includes('@radix-ui')) {
              return 'radix';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }

          // UI package
          if (id.includes('@neonpro/ui')) {
            return 'ui';
          }

          // Route-based chunks
          if (id.includes('/routes/')) {
            const routePath = id.split('/routes/')[1];
            if (routePath.includes('patients')) return 'patients';
            if (routePath.includes('appointments')) return 'appointments';
            if (routePath.includes('services')) return 'services';
            if (routePath.includes('auth')) return 'auth';
            return 'routes-misc';
          }

          // Component-based chunks
          if (id.includes('/components/')) {
            if (id.includes('ai/') || id.includes('chat/')) return 'ai-components';
            if (id.includes('forms/')) return 'form-components';
            if (id.includes('ui/')) return 'ui-components';
            return 'components-misc';
          }
        },
        chunkFileNames: () => {
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
}));

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/ui/lib/utils': path.resolve(__dirname, '../../packages/ui/src/utils'),
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
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@neonpro/ui'],
          animations: ['framer-motion', 'motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
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

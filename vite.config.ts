import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './apps/web/src/routes',
      generatedRouteTree: './apps/web/src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  root: './apps/web',
  publicDir: './public',
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/ui/lib/utils': path.resolve(__dirname, './packages/ui/src/utils'),
      '@neonpro/ui/theme': path.resolve(__dirname, './packages/ui/src/theme'),
      '@neonpro/shared': path.resolve(__dirname, './packages/shared/src'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 8080,
    open: false,
  },
  build: {
    outDir: path.resolve(__dirname, './dist'),
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
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
});
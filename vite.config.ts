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
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: [
      { find: /^@\//, replacement: path.resolve(__dirname, './apps/web/src/') + '/' },
      { find: /^@components\//, replacement: path.resolve(__dirname, './apps/web/src/components') + '/' },
      { find: /^@hooks\//, replacement: path.resolve(__dirname, './apps/web/src/hooks') + '/' },
      { find: '@neonpro/ui/lib/utils', replacement: path.resolve(__dirname, './packages/ui/src/utils') },
      { find: '@neonpro/ui/theme', replacement: path.resolve(__dirname, './packages/ui/src/theme') },
      { find: '@neonpro/ui', replacement: path.resolve(__dirname, './packages/ui/src') },
      { find: '@neonpro/shared', replacement: path.resolve(__dirname, './packages/shared/src') },
      { find: '@neonpro/utils', replacement: path.resolve(__dirname, './packages/utils/src') },
      { find: '@neonpro/types', replacement: path.resolve(__dirname, './packages/types/src') },
    ],
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
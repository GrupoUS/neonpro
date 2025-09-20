import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      // Restrict to this app's tsconfig and ignore errors in external dist tsconfigs
      projects: [path.resolve(__dirname, './tsconfig.json')],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    env: {
      // Load env vars for tests
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://ownkoxryswokcdanrdgj.supabase.co',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MTEwNDQsImV4cCI6MjA0MDE4NzA0NH0.2kD9rN4tOFgJQWbOhYHDxMkVqJ_3-0EfP5gK2vKC0-0',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDYxMTA0NCwiZXhwIjoyMDQwMTg3MDQ0fQ.KGVOuClrHkBtFfZQI4JdI_nKUlnVU1CKtL0pUq7WXhI',
      // Frontend environment variables for packages/database compatibility
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        || 'https://ownkoxryswokcdanrdgj.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MTEwNDQsImV4cCI6MjA0MDE4NzA0NH0.2kD9rN4tOFgJQWbOhYHDxMkVqJ_3-0EfP5gK2vKC0-0',
    },
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules/**', 'dist/**', '.vercel/**', '../../apps/web/**'],
    reporters: ['default'],
    bail: 1,
    timeout: 20000,
    // Enable CommonJS support in ESM environment
    transformMode: {
      web: [/\.tsx?$/],
      ssr: [/\.tsx?$/],
    },
    // Add custom resolver for shared packages
    alias: {
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  resolve: {
    alias: {
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/database': path.resolve(
        __dirname,
        '../../packages/database/src',
      ),
      '@neonpro/security': path.resolve(
        __dirname,
        '../../packages/security/src',
      ),
      '@neonpro/types': path.resolve(__dirname, '../../packages/types/src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/shared/validators': path.resolve(
        __dirname,
        '../../packages/shared/src/validators',
      ),
      '@neonpro/core-services': path.resolve(
        __dirname,
        '../../packages/core-services/src',
      ),
    },
  },
});

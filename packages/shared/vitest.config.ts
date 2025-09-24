/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Node environment for shared package
    include: ['src/**/*.{test,spec}.{ts,js}', 'src/**/__tests__/**/*.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
  },
  resolve: {
    alias: {
      '@neonpro/shared': path.resolve(__dirname, 'src'),
      '@neonpro/types': path.resolve(__dirname, '../types/src'),
      '@neonpro/utils': path.resolve(__dirname, '../utils/src'),
    },
  },
})

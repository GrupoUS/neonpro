import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/agents/index.ts',
    'src/compliance/index.ts',
    'src/fixtures/index.ts',
    'src/utils/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
  external: [
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    '@playwright/test',
    'msw',
    'hono',
    'zod',
    'supertest',
  ],
})

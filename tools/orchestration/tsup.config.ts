import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node20',
  external: ['@neonpro/tools-shared'],
});

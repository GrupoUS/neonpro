import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporariamente desabilitado para resolver build
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  banner: {
    js: '"use client";',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});

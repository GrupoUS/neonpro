import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Disable DTS generation to avoid TypeScript issues
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'es2022',
  external: ['react', 'react-dom'],
  splitting: false,
  treeshake: true,
  jsx: 'automatic',
  tsconfig: './tsconfig.json',
});

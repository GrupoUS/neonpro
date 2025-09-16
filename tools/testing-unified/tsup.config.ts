import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'setup/index': 'src/setup/index.ts',
    'utils/index': 'src/utils/index.ts',
    'fixtures/index': 'src/fixtures/index.ts',
    'healthcare/index': 'src/healthcare/index.ts',
    'performance/index': 'src/performance/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
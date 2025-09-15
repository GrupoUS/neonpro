import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'framer-motion',
    '@radix-ui/react-slot',
    '@neonpro/utils',
  ],
  treeshake: true,
  skipNodeModulesBundle: true,
})

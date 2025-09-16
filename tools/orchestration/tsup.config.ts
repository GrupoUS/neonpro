import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'tdd-orchestrator.ts',
    'agent-registry.ts',
    'quality-control-bridge.ts',
    'workflows/workflow-engine.ts',
    'communication/index.ts',
    'metrics/collector.ts',
    'compliance/healthcare-validator.ts',
    'src/test-coordinator.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node20',
  external: ['@neonpro/tools-shared'],
  esbuildOptions(options) {
    options.conditions = ['module'];
  },
});
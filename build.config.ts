/**
 * NEONPRO BUILD SYSTEM CONFIGURATION
 * 
 * Unified configuration for healthcare-optimized build system
 * 
 * This file consolidates all build configurations to ensure consistency
 * across the monorepo while maintaining healthcare compliance standards.
 * 
 * Health compliance: LGPD, ANVISA, CFM - All configurations enforce 95% coverage
 */

// Build System Configuration
export const BUILD_CONFIG = {
  // Primary build system - Turbo for monorepo optimization
  primary: 'turbo',
  
  // Runtime optimization - Bun for package management and execution
  runtime: 'bun',
  
  // Build tools - Vite for frontend, tRPC for API
  frontend: 'vite',
  api: 'trpc',
  
  // Testing framework - Vitest with healthcare optimizations
  testing: 'vitest',
  
  // Quality gates - Healthcare compliance required
  coverage: {
    global: 95,
    healthcare: 95,
    security: 95,
    api: 95,
    'core-business': 95,
  },
  
  // Performance targets for healthcare workloads
  performance: {
    concurrency: 15,
    testTimeout: 30000,
    hookTimeout: 30000,
    maxWorkers: 4,
  },
  
  // File exclusions for all build operations
  exclusions: [
    'node_modules/**',
    'dist/**',
    '.vercel/**',
    '**/*.d.ts',
    '**/*.config.*',
    '**/coverage/**',
    '**/test-results/**',
  ],
  
  // Healthcare-specific file inclusions
  healthcareInclusions: [
    '**/healthcare/**/*.{js,ts}',
    '**/security/**/*.{js,ts}',
    '**/api/**/*.{js,ts}',
    '**/core/**/*.{js,ts}',
  ],
}

// Quality Gates Configuration
export const QUALITY_GATES = {
  // Minimum coverage requirements (95% for healthcare compliance)
  coverage: BUILD_CONFIG.coverage,
  
  // Test configurations
  testing: {
    environment: 'node',
    globals: true,
    reporters: ['verbose', 'json', 'junit'],
    pool: 'threads',
    testTimeout: BUILD_CONFIG.performance.testTimeout,
    hookTimeout: BUILD_CONFIG.performance.hookTimeout,
  },
  
  // Linting configuration
  linting: {
    primary: 'oxlint',
    secondary: 'eslint',
    formatting: 'biome',
    healthcare: {
      rules: [
        'no-console',
        'no-debugger',
        'no-eval',
        'no-implied-eval',
        'no-new-func',
        'no-script-url',
      ],
      allow: ['warn', 'error'],
    },
  },
}

// Package Scripts Configuration
export const PACKAGE_SCRIPTS = {
  // Core development scripts
  development: {
    build: 'turbo build',
    dev: 'turbo dev --concurrency=15',
    devWeb: 'turbo dev --filter=@neonpro/web',
    devApi: 'turbo dev --filter=neonpro-vercel-api',
    typeCheck: 'turbo type-check',
    clean: 'turbo clean',
  },
  
  // Testing scripts
  testing: {
    unit: 'vitest',
    unitWatch: 'vitest --watch',
    unitCoverage: 'vitest --coverage',
    healthcare: 'vitest run --config=vitest.config.ts --timeout=30000',
    security: 'vitest run --config=vitest.config.ts --reporter=verbose --outputFile=test-results/security-results.json',
    performance: 'vitest run --config=vitest.config.ts --reporter=verbose --outputFile=test-results/performance-results.json',
    compliance: 'vitest run --config=vitest.config.ts --timeout=30000',
    e2e: 'playwright test',
    api: 'playwright test --config=playwright.config.ts --project=api',
    mobile: 'playwright test --config=playwright.config.ts --project=mobile',
    accessibility: 'playwright test --config=playwright.config.ts --project=accessibility',
  },
  
  // Quality assurance scripts
  quality: {
    lint: 'oxlint . --import-plugin --jsx-a11y-plugin',
    lintFix: 'oxlint . --import-plugin --jsx-a11y-plugin --fix',
    lintSecurity: 'eslint . --max-warnings 0',
    lintSecurityFix: 'eslint . --fix --max-warnings 0',
    format: 'biome format .',
    formatFix: 'biome format --write .',
    check: 'biome check .',
    checkFix: 'biome check --fix .',
  },
  
  // Healthcare compliance scripts
  compliance: {
    healthcare: 'vitest run --config=vitest.config.ts --timeout=30000',
    security: 'vitest run --config=vitest.config.ts --timeout=30000',
    regulatory: 'vitest run --config=vitest.config.ts --timeout=30000',
    all: 'vitest run --config=vitest.config.ts --timeout=30000',
    report: 'vitest --timeout=30000 --coverage',
    audit: 'vitest --timeout=30000',
  },
  
  // Deployment scripts
  deployment: {
    setup: 'bun install && turbo build',
    prepare: 'turbo build && vitest && bun run lint',
    healthCheck: 'turbo type-check && vitest && bun run lint',
    verifyEdge: 'bunx vite build --config apps/api/vite.config.ts',
  },
}

// Environment Configuration
export const ENV_CONFIG = {
  // Healthcare compliance requirements
  healthcare: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    auditLogging: true,
    dataResidency: 'brazil',
  },
  
  // Performance requirements
  performance: {
    maxFileSize: '500kb',
    maxLines: 2000,
    complexityThreshold: 10,
    coreWebVitals: {
      lcp: 2500,
      inp: 200,
      cls: 0.1,
    },
  },
  
  // Security requirements
  security: {
    encryption: 'at-rest-and-in-transit',
    authentication: 'multi-factor',
    inputValidation: true,
    sanitization: true,
  },
}

export default {
  build: BUILD_CONFIG,
  quality: QUALITY_GATES,
  scripts: PACKAGE_SCRIPTS,
  environment: ENV_CONFIG,
}
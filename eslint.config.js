// ESLint Flat Configuration - Security & LGPD Focus
// KISS/YAGNI: Minimal security rules only - heavy lifting done by oxlint

export default [
  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Basic security rules for LGPD compliance
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.config.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      '**/*.{ts,tsx}',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'test-results/**',
      '**/*.min.js',
      'playwright-report/**',
      '.next/**',
      '.turbo/**',
      'vitest.config.*',
      'playwright.config.*',
      'vite.config.*',
      'tailwind.config.*',
      'dprint.json',
    ],
  },
]

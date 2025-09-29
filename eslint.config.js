// ESLint Flat Configuration - Security & Healthcare Compliance Focus
// OXLint (primary) → ESLint (security fallback) → Biome (formatting)

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
    },
    rules: {
      // Healthcare Security & LGPD Compliance Rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Healthcare Data Protection
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // ANVISA/CFM Compliance
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'crypto',
            message: 'Use secure crypto utilities from healthcare security package'
          },
          {
            name: 'child_process',
            message: 'Use healthcare-approved process utilities'
          }
        ]
      }],
      
      // LGPD Data Validation
      'no-warning-comments': ['warn', {
        terms: ['todo', 'fixme', 'hack', 'temporary', 'temp'],
        location: 'start'
      }],
    },
  },
  
  // Healthcare Compliance Critical Files
  {
    files: [
      '**/compliance/**/*.{ts,tsx}',
      '**/patient-data/**/*.{ts,tsx}',
      '**/medical-records/**/*.{ts,tsx}',
      '**/appointments/**/*.{ts,tsx}',
      '**/security/**/*.{ts,tsx}'
    ],
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },
  
  // Test Files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
      'no-warning-comments': 'off',
    },
  },
  
  // Config Files
  {
    files: ['**/*.config.{js,ts}'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
  
  // Logging & Debug Files
  {
    files: [
      '**/logger/**/*.{ts,js}',
      '**/console-manager.ts',
      '**/logging/**/*.{ts,js}',
      '**/healthcare-logger.ts'
    ],
    rules: {
      'no-console': 'off',
    },
  },
  
  // Build & Tooling Files
  {
    files: [
      '**/scripts/**/*.{js,ts}',
      '**/tools/**/*.{ts,js}',
      'vitest.config.*',
      'playwright.config.*',
      'vite.config.*',
      'tailwind.config.*'
    ],
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
  
  // Ignore Patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'test-results/**',
      '**/*.min.js',
      'playwright-report/**',
      '.next/**',
      '.turbo/**',
      'dprint.json',
      '*.lock',
      '.git/**',
      '.oxlint_cache/**',
      '.serena/**',
      '.specify/**',
    ],
  },
]

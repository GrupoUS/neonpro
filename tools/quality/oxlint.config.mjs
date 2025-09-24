/**
 * Oxlint Configuration for NeonPro Healthcare Platform
 *
 * Ultra-fast linter with healthcare compliance rules
 * 50x faster than ESLint with zero-config defaults
 */

export default {
  // Plugin configuration for healthcare compliance
  plugins: {
    typescript: 'enable',
    react: 'enable',
    import: 'enable',
    jsdoc: 'enable',
    node: 'enable',
    promise: 'enable',
    security: 'enable',
    n: 'enable',
    jsx_a11y: 'enable',
  },

  // Rule configuration with healthcare-specific enforcement
  rules: {
    // Type safety and code quality
    'no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',

    // TypeScript compliance for healthcare applications
    'typescript/no-unused-vars': 'error',
    'typescript/no-explicit-any': ['error', { fixToUnknown: true }],
    'typescript/no-non-null-assertion': 'error',
    'typescript/prefer-optional-chain': 'error',
    'typescript/prefer-nullish-coalescing': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-return': 'error',

    // React best practices for healthcare UI
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/no-unescaped-entities': 'error',
    'react/no-array-index-key': 'error',
    'react/no-children-prop': 'error',
    'react/prop-types': 'off', // Using TypeScript instead
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Accessibility rules for healthcare compliance (WCAG 2.1 AA+)
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // Import organization and dependency management
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
    }],
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': 'error',

    // Security rules for healthcare data
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',

    // Promise handling for async operations
    'promise/prefer-await-to-then': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',

    // Node.js and runtime compliance
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',

    // ES6+ features and modern JavaScript
    'n/prefer-global/process': ['error', 'always'],
    'n/prefer-global/buffer': ['error', 'always'],
    'n/no-unsupported-features/es-syntax': 'error',

    // JSDoc for healthcare API documentation
    'jsdoc/require-jsdoc': ['warn', {
      'contexts': ['FunctionExpression', 'ClassDeclaration'],
      'require': {
        'FunctionExpression': true,
        'ClassDeclaration': true,
      },
    }],
  },

  // File-specific overrides
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off',
        'typescript/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.config.{js,ts}'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['src/compliance/**/*.{ts,tsx}'],
      rules: {
        'no-console': 'error',
        'security/detect-object-injection': 'error',
        'typescript/no-explicit-any': ['error', { fixToUnknown: true }],
      },
    },
    {
      files: ['src/agents/**/*.{ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 'error',
        'typescript/no-non-null-assertion': 'error',
      },
    },
  ],

  // Global ignores for generated files and dependencies
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'test-results/**',
    '*.min.js',
    'playwright-report/**',
    '.next/**',
    '.turbo/**',
    'tools/**/node_modules/**',
    'packages/**/dist/**',
    'apps/**/dist/**',
  ],

  // Settings for TypeScript integration
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
}

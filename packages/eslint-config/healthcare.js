/**
 * ESLint Healthcare Configuration
 *
 * Specialized ESLint rules for healthcare applications ensuring
 * LGPD compliance, security, accessibility, and code quality.
 *
 * @compliance LGPD, ANVISA, CFM, WCAG 2.1 AA
 * @quality ≥9.8/10 Healthcare Grade
 */

module.exports = {
  extends: ['./index.js', './security.js', './accessibility.js'],

  env: {
    browser: true,
    node: true,
    es2024: true,
  },

  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: {
    // Healthcare Data Protection Rules
    'healthcare/no-hardcoded-secrets': 'error',
    'healthcare/require-audit-logging': 'error',
    'healthcare/validate-patient-data': 'error',
    'healthcare/secure-medical-records': 'error',
    'healthcare/lgpd-consent-required': 'error',
    'healthcare/anvisa-compliance': 'warn',
    'healthcare/cfm-validation': 'warn',

    // Security Rules (Enhanced for Healthcare)
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // Data Privacy Rules
    'no-console': ['error', { allow: ['warn', 'error'] }], // Prevent accidental data logging
    'no-debugger': 'error',
    'no-alert': 'error',

    // TypeScript Healthcare Rules
    '@typescript-eslint/no-explicit-any': 'error', // Critical for healthcare type safety
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',

    // React Healthcare Rules
    'react/no-danger': 'error', // Prevent XSS in medical data
    'react/no-danger-with-children': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',

    // Accessibility Rules (Critical for Healthcare)
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',

    // Code Quality Rules (Healthcare Grade)
    complexity: ['error', { max: 10 }], // Reduce complexity for medical software
    'max-depth': ['error', 4],
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 4],
    'no-magic-numbers': ['error', { ignore: [0, 1, -1, 100] }],

    // Documentation Rules (Critical for Healthcare)
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
    'valid-jsdoc': [
      'error',
      {
        requireReturn: true,
        requireReturnType: true,
        requireParamDescription: true,
        requireReturnDescription: true,
      },
    ],
  },

  overrides: [
    // Healthcare API Routes
    {
      files: ['**/api/**/*.{js,ts}', '**/pages/api/**/*.{js,ts}', '**/app/api/**/*.{js,ts}'],
      rules: {
        'healthcare/require-audit-logging': 'error',
        'healthcare/validate-patient-data': 'error',
        'healthcare/secure-medical-records': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'no-console': 'error', // Absolutely no console logs in API routes
      },
    },

    // Healthcare Components
    {
      files: ['**/components/**/*.{jsx,tsx}'],
      rules: {
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/heading-has-content': 'error',
        'react/no-danger': 'error',
        'healthcare/lgpd-consent-required': 'error',
      },
    },

    // Medical Forms
    {
      files: ['**/forms/**/*.{jsx,tsx}', '**/*Form*.{jsx,tsx}'],
      rules: {
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/aria-required-attr': 'error',
        'healthcare/validate-patient-data': 'error',
        'healthcare/secure-medical-records': 'error',
      },
    },

    // Database/ORM Files
    {
      files: ['**/db/**/*.{js,ts}', '**/database/**/*.{js,ts}', '**/models/**/*.{js,ts}'],
      rules: {
        'healthcare/secure-medical-records': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'no-magic-numbers': 'off', // Database migrations may need magic numbers
      },
    },

    // Test Files
    {
      files: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/tests/**/*.{js,ts,jsx,tsx}'],
      rules: {
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off',
        'require-jsdoc': 'off',
        '@typescript-eslint/no-explicit-any': 'warn', // More lenient in tests
        'healthcare/require-audit-logging': 'off',
      },
    },

    // Configuration Files
    {
      files: ['*.config.{js,ts}', '**/*.config.{js,ts}'],
      rules: {
        'require-jsdoc': 'off',
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};

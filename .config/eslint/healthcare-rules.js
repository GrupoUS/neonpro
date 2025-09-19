/**
 * Healthcare-specific ESLint rules for LGPD/ANVISA/CFM compliance
 * NeonPro Healthcare Platform - Enhanced Linting Configuration
 */

module.exports = {
  rules: {
    // Healthcare Data Security Rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // LGPD Compliance Rules
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="console"][arguments.0.type="Literal"][arguments.0.value=/.*cpf.*|.*rg.*|.*email.*|.*phone.*/i]',
        message: 'LGPD Violation: Patient personal data should not be logged to console'
      },
      {
        selector: 'CallExpression[callee.property.name="log"][arguments.0.type="TemplateLiteral"] > TemplateLiteral[quasis.0.value.raw=/.*cpf.*|.*rg.*|.*email.*|.*phone.*/i]',
        message: 'LGPD Violation: Patient personal data should not be logged'
      }
    ],

    // Healthcare Variable Naming Conventions
    'camelcase': ['error', {
      allow: [
        'patient_id',
        'cpf_number',
        'sus_number',
        'cfm_license',
        'anvisa_protocol',
        'lgpd_consent_id',
        'healthcare_provider_id',
        'appointment_id',
        'consultation_id',
        'medical_record_id'
      ]
    }],

    // Healthcare Function Patterns
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['crypto'],
            message: 'Use @neonpro/security crypto utilities for healthcare data encryption'
          },
          {
            group: ['jsonwebtoken'],
            message: 'Use @neonpro/security JWT utilities for healthcare authentication'
          }
        ]
      }
    ],

    // Patient Data Protection
    'no-restricted-globals': [
      'error',
      {
        name: 'localStorage',
        message: 'LGPD Violation: Patient data should not be stored in localStorage. Use secure storage utilities.'
      },
      {
        name: 'sessionStorage',
        message: 'LGPD Violation: Patient data should not be stored in sessionStorage. Use secure storage utilities.'
      }
    ],

    // Healthcare API Security
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowedNames: [
        'createPatientSecurely',
        'getPatientWithConsent',
        'updatePatientData',
        'deletePatientData',
        'validateCPF',
        'validateSUS',
        'validateCFMLicense'
      ]
    }],

    // Medical Data Validation
    '@typescript-eslint/strict-boolean-expressions': ['error', {
      allowString: false,
      allowNumber: false,
      allowNullableObject: false,
      allowNullableBoolean: false,
      allowNullableString: false,
      allowNullableNumber: false,
      allowAny: false
    }],

    // Healthcare Error Handling
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // Brazilian Healthcare Constants
    'no-magic-numbers': ['error', {
      ignore: [0, 1, -1],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      detectObjects: false,
      enforceConst: true
    }],

    // Healthcare Comments Requirements
    'spaced-comment': ['error', 'always', {
      line: {
        markers: ['/', 'TODO', 'FIXME', 'LGPD', 'ANVISA', 'CFM', 'HIPAA'],
        exceptions: ['-', '+']
      },
      block: {
        markers: ['*'],
        exceptions: ['*'],
        balanced: true
      }
    }],

    // Import Organization for Healthcare Modules
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      pathGroups: [
        {
          pattern: '@neonpro/security/**',
          group: 'internal',
          position: 'before'
        },
        {
          pattern: '@neonpro/core-services/**',
          group: 'internal',
          position: 'before'
        },
        {
          pattern: '@neonpro/shared/**',
          group: 'internal',
          position: 'after'
        }
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }]
  },

  // Healthcare-specific environments
  env: {
    'es2022': true,
    'node': true,
    'browser': true
  },

  // Brazilian Healthcare Overrides
  overrides: [
    {
      files: ['**/lgpd/**/*.ts', '**/compliance/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'no-console': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error'
      }
    },
    {
      files: ['**/patient/**/*.ts', '**/medical-record/**/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'CallExpression[callee.property.name="toString"][callee.object.property.name=/.*cpf.*|.*rg.*|.*phone.*/i]',
            message: 'LGPD Violation: Patient sensitive data should be encrypted before conversion'
          }
        ]
      }
    },
    {
      files: ['**/telemedicine/**/*.ts', '**/consultation/**/*.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        'security/detect-possible-timing-attacks': 'error'
      }
    }
  ]
};
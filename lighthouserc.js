module.exports = {
  ci: {
    // Lighthouse CI Server Configuration
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/professional/dashboard',
        'http://localhost:3000/register',
        'http://localhost:3000/professional/patients',
        'http://localhost:3000/professional/appointments',
      ],
      startServerCommand: 'bun dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60_000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        skipAudits: ['redirects-http', 'uses-http2', 'bf-cache',],
        // Healthcare-specific performance budgets
        budgets: [
          {
            path: '/*',
            timings: [
              { metric: 'first-contentful-paint', budget: 2000, },
              { metric: 'largest-contentful-paint', budget: 3000, },
              { metric: 'cumulative-layout-shift', budget: 0.1, },
              { metric: 'total-blocking-time', budget: 200, },
              { metric: 'speed-index', budget: 3000, },
            ],
            resourceCounts: [
              { resourceType: 'script', budget: 30, },
              { resourceType: 'image', budget: 50, },
              { resourceType: 'stylesheet', budget: 10, },
              { resourceType: 'font', budget: 8, },
            ],
            resourceSizes: [
              { resourceType: 'script', budget: 400_000, }, // 400KB
              { resourceType: 'image', budget: 1_000_000, }, // 1MB
              { resourceType: 'stylesheet', budget: 150_000, }, // 150KB
              { resourceType: 'font', budget: 200_000, }, // 200KB
              { resourceType: 'total', budget: 2_000_000, }, // 2MB
            ],
          },
          {
            path: '/dashboard/*',
            timings: [
              { metric: 'first-contentful-paint', budget: 1800, },
              { metric: 'largest-contentful-paint', budget: 2500, },
              { metric: 'cumulative-layout-shift', budget: 0.05, },
              { metric: 'total-blocking-time', budget: 150, },
            ],
          },
          {
            path: '/professional/*',
            timings: [
              { metric: 'first-contentful-paint', budget: 1500, },
              { metric: 'largest-contentful-paint', budget: 2200, },
              { metric: 'cumulative-layout-shift', budget: 0.08, },
              { metric: 'total-blocking-time', budget: 180, },
            ],
          },
        ],
      },
    },

    // Upload results to temporary public storage
    upload: {
      target: 'temporary-public-storage',
    },

    // Performance assertions for healthcare workflows
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // Performance requirements for healthcare applications
        'categories:performance': ['error', { minScore: 0.85, },],
        'categories:accessibility': ['error', { minScore: 0.95, },],
        'categories:best-practices': ['error', { minScore: 0.9, },],
        'categories:seo': ['warn', { minScore: 0.8, },],

        // Healthcare-specific performance requirements
        'first-contentful-paint': ['error', { maxNumericValue: 2000, },],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000, },],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1, },],
        'total-blocking-time': ['error', { maxNumericValue: 200, },],
        'speed-index': ['error', { maxNumericValue: 3000, },],

        // Accessibility requirements (critical for healthcare)
        'color-contrast': ['error', { minScore: 1, },],
        'heading-order': ['error', { minScore: 1, },],
        'html-has-lang': ['error', { minScore: 1, },],
        'html-lang-valid': ['error', { minScore: 1, },],
        'image-alt': ['error', { minScore: 1, },],
        label: ['error', { minScore: 1, },],
        'link-name': ['error', { minScore: 1, },],
        list: ['error', { minScore: 1, },],
        listitem: ['error', { minScore: 1, },],
        'meta-viewport': ['error', { minScore: 1, },],
        'button-name': ['error', { minScore: 1, },],
        'aria-allowed-attr': ['error', { minScore: 1, },],
        'aria-hidden-body': ['error', { minScore: 1, },],
        'aria-required-attr': ['error', { minScore: 1, },],
        'aria-required-children': ['error', { minScore: 1, },],
        'aria-required-parent': ['error', { minScore: 1, },],
        'aria-roles': ['error', { minScore: 1, },],
        'aria-valid-attr-value': ['error', { minScore: 1, },],
        'aria-valid-attr': ['error', { minScore: 1, },],
        'role-img-alt': ['error', { minScore: 1, },],
        'scrollable-region-focusable': ['error', { minScore: 1, },],
        'valid-lang': ['error', { minScore: 1, },],

        // Security requirements for healthcare data
        'is-on-https': ['error', { minScore: 1, },],
        'redirects-http': 'off',
        'geolocation-on-start': ['error', { minScore: 1, },],
        'notification-on-start': ['error', { minScore: 1, },],

        // Best practices for healthcare applications
        'errors-in-console': ['warn', { maxLength: 0, },],
        'no-vulnerable-libraries': ['error', { minScore: 1, },],
        'csp-xss': ['warn', { minScore: 1, },],
        doctype: ['error', { minScore: 1, },],
        charset: ['error', { minScore: 1, },],
      },
    },

    // Server configuration for CI environments
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-ci-results',
      },
    },
  },

  // Healthcare-specific configuration
  healthcareConfig: {
    // HIPAA compliance checks
    hipaaCompliance: {
      requireHttps: true,
      requireSecurityHeaders: true,
      maxSessionTimeout: 1_800_000, // 30 minutes
      auditTrailRequired: true,
    },

    // Accessibility requirements (WCAG 2.1 AA+)
    accessibilityCompliance: {
      wcagLevel: 'AA',
      contrastRatio: 4.5,
      keyboardNavigation: true,
      screenReaderSupport: true,
      focusManagement: true,
    },

    // Performance requirements for clinical workflows
    clinicalPerformance: {
      patientDataLoadTime: 1500, // ms
      appointmentSchedulingTime: 2000, // ms
      medicalRecordAccessTime: 1200, // ms
      emergencyAccessTime: 800, // ms
    },
  },
}

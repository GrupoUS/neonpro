/**
 * Lighthouse CI Configuration for NeonPro Healthcare Platform
 *
 * Defines performance budgets and monitoring configuration optimized for
 * healthcare applications where speed and reliability are critical for
 * patient care and operational efficiency.
 */

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './apps/web/dist',
      startServerCommand: 'pnpm --filter @neonpro/web preview --port 4173',
      startServerReadyPattern: 'Local:\\s+http://localhost:4173',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:4173/', 'http://localhost:4173/dashboard'],
      settings: {
        // Healthcare-specific audit configuration
        skipAudits: [
          // Skip audits not applicable to healthcare SPAs
          'installable-manifest', // Not a PWA requirement for clinic management
          'apple-touch-icon', // Not critical for clinic internal tools
        ],
        preset: 'desktop',
        throttling: {
          // Clinic networks are typically better than public mobile
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
        // Strict budgets for healthcare applications
        budgetPath: './lighthouse-budget.json',
        // Custom configuration for healthcare context
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Healthcare-Critical Performance Metrics
        // Patient safety requires fast loading times
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }], // 2s max (stricter than web.dev 2.5s)
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // 1.5s max
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }], // Stricter than 0.1 for form stability
        'interaction-to-next-paint': ['error', { maxNumericValue: 150 }], // 150ms (stricter than 200ms standard)
        'speed-index': ['error', { maxNumericValue: 2500 }], // Visual completeness
        'total-blocking-time': ['error', { maxNumericValue: 200 }], // Interactivity

        // Healthcare-Specific Accessibility (Patient Safety)
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95% minimum
        'color-contrast': 'error',
        'focus-traps': 'error',
        'focusable-controls': 'error',
        'interactive-element-affordance': 'error',
        'logical-tab-order': 'error',

        // Security for Medical Data (LGPD/ANVISA Compliance)
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'is-on-https': 'error',
        'uses-http2': 'error',
        'no-vulnerable-libraries': 'error',

        // Resource Optimization for Clinic Network Efficiency
        'uses-responsive-images': 'error',
        'efficient-animated-content': 'error',
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }], // 20KB unused CSS threshold
        'unused-javascript': ['warn', { maxNumericValue: 50000 }], // 50KB unused JS threshold
        'unminified-css': 'error',
        'unminified-javascript': 'error',

        // Network Resource Budgets (for clinic bandwidth efficiency)
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }], // 50KB HTML
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB JS total
        'resource-summary:stylesheet:size': [
          'error',
          { maxNumericValue: 100000 },
        ], // 100KB CSS total
        'resource-summary:image:size': ['error', { maxNumericValue: 300000 }], // 300KB images total
        'resource-summary:font:size': ['warn', { maxNumericValue: 150000 }], // 150KB fonts
        'resource-summary:other:size': ['warn', { maxNumericValue: 100000 }], // 100KB other assets

        // Network Request Budgets
        'resource-summary:total:count': ['error', { maxNumericValue: 50 }], // Max 50 requests
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 5 }], // Limit 3rd party

        // SEO for healthcare provider discovery
        'categories:seo': ['warn', { minScore: 0.85 }],

        // Turn off non-critical audits for healthcare context
        'robots-txt': 'off', // Not needed for internal tools
        canonical: 'off', // SPA doesn't need canonical
        'structured-data': 'off', // Not needed for clinic management
        'tap-targets': 'off', // Desktop-focused application
        'content-width': 'off', // Controlled viewport
        'meta-description': 'off', // Internal tool
        'uses-rel-preconnect': 'off', // Optimization not critical
        'uses-rel-preload': 'off', // Manual resource prioritization
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

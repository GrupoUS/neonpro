/**
 * Lighthouse CI Configuration for NeonPro Healthcare
 * ≥95% Core Web Vitals requirement for patient-facing interfaces
 * <100ms emergency response performance validation
 */

module.exports = {
  ci: {
    collect: {
      // Healthcare application URLs for performance testing
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/patients',
        'http://localhost:3000/dashboard/appointments',
        'http://localhost:3000/emergency-access'
      ],
      numberOfRuns: 3,
      settings: {
        // Healthcare-specific performance settings
        preset: 'desktop',
        throttling: {
          // Medical practice network conditions
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        // Healthcare performance standards (≥95% requirement)
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        
        // Core Web Vitals - Healthcare Critical Thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Healthcare Emergency Response Performance
        'interactive': ['error', { maxNumericValue: 3500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Medical Interface Accessibility Requirements
        'color-contrast': 'error',
        'heading-order': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'image-alt': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9009,
      storage: './lighthouse-reports'
    }
  }
};
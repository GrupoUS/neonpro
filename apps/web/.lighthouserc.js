/**
 * Lighthouse CI Configuration for NeonPro Core Web Vitals Optimization
 *
 * Enforces performance budgets and monitors Core Web Vitals:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - FID (First Input Delay) < 100ms
 * - CLS (Cumulative Layout Shift) < 0.1
 * - Bundle Size Reduction > 20%
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        "http://localhost:3000", // Home page
        "http://localhost:3000/dashboard", // Dashboard
        "http://localhost:3000/pacientes", // Patient management
        "http://localhost:3000/agenda", // Appointments
        "http://localhost:3000/financeiro", // Financial
      ],

      // Collection settings
      numberOfRuns: 3, // Run 3 times and average results
      settings: {
        // Chrome flags for consistent testing
        chromeFlags: [
          "--no-sandbox",
          "--headless",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-extensions",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
        ],

        // Throttling for mobile testing
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },

        // Emulate mobile device
        emulatedFormFactor: "mobile",

        // Skip PWA audits for now
        skipAudits: [
          "service-worker",
          "installable-manifest",
          "splash-screen",
          "themed-omnibox",
          "maskable-icon",
        ],
      },
    },

    assert: {
      // Performance budgets - STRICT for healthcare
      assertions: {
        // Core Web Vitals - PRIMARY TARGETS
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }], // 2.5s
        "first-input-delay": ["error", { maxNumericValue: 100 }], // 100ms
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }], // 0.1

        // Additional Performance Metrics
        "first-contentful-paint": ["error", { maxNumericValue: 1800 }], // 1.8s
        "speed-index": ["error", { maxNumericValue: 3000 }], // 3s
        "total-blocking-time": ["error", { maxNumericValue: 200 }], // 200ms
        "interactive": ["error", { maxNumericValue: 3800 }], // 3.8s

        // Healthcare-specific requirements
        "color-contrast": "error", // WCAG compliance
        "heading-order": "error", // Accessibility
        "label": "error", // Form accessibility
        "link-name": "error", // Link accessibility
        "tap-targets": "error", // Mobile usability

        // Bundle size optimization
        "unused-javascript": ["warn", { maxNumericValue: 100_000 }], // 100KB
        "unused-css-rules": ["warn", { maxNumericValue: 50_000 }], // 50KB
        "render-blocking-resources": "error",
        "unminified-css": "error",
        "unminified-javascript": "error",

        // Image optimization
        "modern-image-formats": "error",
        "uses-optimized-images": "error",
        "uses-responsive-images": "error",
        "efficient-animated-content": "error",

        // Font optimization
        "font-display": "error",
        "preload-fonts": "warn",

        // Caching
        "uses-long-cache-ttl": "warn",
        "uses-rel-preconnect": "warn",
        "uses-rel-preload": "warn",

        // Security (healthcare compliance)
        "is-on-https": "error",
        "external-anchors-use-rel-noopener": "error",
        "no-vulnerable-libraries": "error",

        // SEO (healthcare discoverability)
        "document-title": "error",
        "meta-description": "error",
        "viewport": "error",
        "robots-txt": "warn",
      },
    },

    upload: {
      // Temporary server for CI results
      target: "temporary-public-storage",

      // GitHub integration (if using GitHub Actions)
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubApiHost: "https://api.github.com",
      githubToken: process.env.GITHUB_TOKEN,
    },

    server: {
      // Local server configuration
      port: 9001,
      storage: {
        storageMethod: "sql",
        sqlDialect: "sqlite",
        sqlDatabasePath: "./lhci.db",
      },
    },
  },
};

// Healthcare-specific Lighthouse plugins
const healthcarePlugins = [
  // Accessibility plugin
  "lighthouse-plugin-accessibility",

  // Performance monitoring
  "lighthouse-plugin-field-performance",

  // Security plugin
  "lighthouse-plugin-security",
];

// Export configuration for GitHub Actions
module.exports.healthcareConfig = {
  // Performance budget thresholds for different pages
  budgets: {
    dashboard: {
      lcp: 2000, // Dashboard should be faster
      fid: 80,
      cls: 0.05,
    },

    patients: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },

    emergency: {
      lcp: 1500, // Emergency pages must be very fast
      fid: 50,
      cls: 0.02,
    },
  },

  // Healthcare compliance checks
  compliance: {
    accessibility: {
      "color-contrast": "error",
      "keyboard-navigation": "error",
      "screen-reader": "error",
      "focus-management": "error",
    },

    security: {
      "https-only": "error",
      "no-mixed-content": "error",
      "secure-cookies": "error",
      "csp-header": "warn",
    },

    performance: {
      "bundle-size": "error",
      "image-optimization": "error",
      "font-optimization": "error",
      "caching": "warn",
    },
  },
};

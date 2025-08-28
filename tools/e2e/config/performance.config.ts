/**
 * Performance Configuration for E2E Tests
 * Centralized configuration for performance monitoring and budgets
 */

import type { PerformanceBudget } from '../utils/performance-metrics'

/**
 * Performance budgets for different types of pages in the healthcare application
 */
export const PERFORMANCE_BUDGETS = {
  // Critical healthcare pages - strictest budgets
  critical: {
    lcp: 2000,  // 2s - Patient data must load quickly
    fid: 50,    // 50ms - Medical forms need immediate response
    cls: 0.05,  // 0.05 - Medical UI must be stable
    fcp: 1500,  // 1.5s - Critical content first
    ttfb: 400,  // 400ms - Server response for medical data
    patientDataLoadTime: 800,   // 800ms - Patient records
    formSubmissionTime: 1500,   // 1.5s - Medical form submission
    navigationTime: 300,        // 300ms - Quick navigation
    searchResponseTime: 600     // 600ms - Patient search
  } as PerformanceBudget,

  // Standard healthcare pages - balanced budgets
  standard: {
    lcp: 2500,  // 2.5s
    fid: 100,   // 100ms
    cls: 0.1,   // 0.1
    fcp: 1800,  // 1.8s
    ttfb: 600,  // 600ms
    patientDataLoadTime: 1000,  // 1s
    formSubmissionTime: 2000,   // 2s
    navigationTime: 500,        // 500ms
    searchResponseTime: 800     // 800ms
  } as PerformanceBudget,

  // Administrative pages - relaxed budgets
  administrative: {
    lcp: 3000,  // 3s
    fid: 150,   // 150ms
    cls: 0.15,  // 0.15
    fcp: 2200,  // 2.2s
    ttfb: 800,  // 800ms
    patientDataLoadTime: 1500,  // 1.5s
    formSubmissionTime: 3000,   // 3s
    navigationTime: 800,        // 800ms
    searchResponseTime: 1200    // 1.2s
  } as PerformanceBudget,

  // Reports and analytics - most relaxed
  reports: {
    lcp: 4000,  // 4s - Complex data visualization
    fid: 200,   // 200ms
    cls: 0.2,   // 0.2
    fcp: 2500,  // 2.5s
    ttfb: 1000, // 1s - Complex queries
    patientDataLoadTime: 2000,  // 2s - Large datasets
    formSubmissionTime: 4000,   // 4s - Report generation
    navigationTime: 1000,       // 1s
    searchResponseTime: 1500    // 1.5s - Complex searches
  } as PerformanceBudget
}

/**
 * Page type mapping for automatic budget selection
 */
export const PAGE_TYPE_MAPPING = {
  // Critical healthcare pages
  '/patients': 'critical',
  '/patients/[id]': 'critical',
  '/emergency': 'critical',
  '/appointments/urgent': 'critical',
  '/medical-records': 'critical',
  '/prescriptions': 'critical',
  '/lab-results': 'critical',

  // Standard pages
  '/dashboard': 'standard',
  '/appointments': 'standard',
  '/calendar': 'standard',
  '/notifications': 'standard',
  '/profile': 'standard',
  '/settings': 'standard',

  // Administrative pages
  '/admin': 'administrative',
  '/users': 'administrative',
  '/roles': 'administrative',
  '/audit': 'administrative',
  '/compliance': 'administrative',
  '/billing': 'administrative',

  // Reports and analytics
  '/reports': 'reports',
  '/analytics': 'reports',
  '/statistics': 'reports',
  '/exports': 'reports'
} as const

/**
 * Performance test configuration
 */
export const PERFORMANCE_CONFIG = {
  // Monitoring settings
  monitoring: {
    enabled: true,
    collectWebVitals: true,
    collectCustomMetrics: true,
    collectResourceMetrics: true,
    collectMemoryMetrics: true
  },

  // Reporting settings
  reporting: {
    generateJSON: true,
    generateHTML: true,
    generateSummary: true,
    outputDir: './test-results/performance',
    includeScreenshots: true,
    includeTraces: false // Set to true for detailed debugging
  },

  // Test execution settings
  execution: {
    warmupRuns: 1,        // Number of warmup runs before measuring
    measurementRuns: 3,   // Number of measurement runs to average
    cooldownTime: 1000,   // Time to wait between runs (ms)
    networkThrottling: {
      enabled: false,     // Enable for mobile/slow connection testing
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
      latency: 40         // 40ms latency
    }
  },

  // Failure thresholds
  thresholds: {
    failOnBudgetViolation: false, // Set to true for strict enforcement
    maxBudgetViolations: 2,       // Maximum violations before test fails
    criticalMetrics: ['lcp', 'fid', 'patientDataLoadTime'], // Always fail on these
    warningMetrics: ['cls', 'fcp', 'ttfb'] // Log warnings for these
  },

  // Healthcare-specific settings
  healthcare: {
    // HIPAA compliance monitoring
    monitorDataTransfer: true,
    trackSecureConnections: true,
    validateEncryption: true,
    
    // Medical workflow performance
    trackPatientDataAccess: true,
    monitorFormSubmissions: true,
    validateSearchPerformance: true,
    
    // Critical alerts
    emergencyPageThreshold: 1000, // Emergency pages must load under 1s
    patientSafetyThreshold: 2000   // Patient safety features under 2s
  }
}

/**
 * Get performance budget for a specific page
 */
export function getPerformanceBudget(url: string): PerformanceBudget {
  // Extract pathname from URL
  const pathname = new URL(url, 'http://localhost').pathname
  
  // Find matching page type
  const pageType = Object.entries(PAGE_TYPE_MAPPING).find(([pattern, _]) => {
    // Simple pattern matching - can be enhanced with regex if needed
    return pathname.startsWith(pattern.replace('[id]', '')) || pathname === pattern
  })?.[1] || 'standard'
  
  return PERFORMANCE_BUDGETS[pageType as keyof typeof PERFORMANCE_BUDGETS]
}

/**
 * Check if a page is critical for healthcare operations
 */
export function isCriticalPage(url: string): boolean {
  const budget = getPerformanceBudget(url)
  return budget === PERFORMANCE_BUDGETS.critical
}

/**
 * Get test configuration based on page criticality
 */
export function getTestConfig(url: string) {
  const isCritical = isCriticalPage(url)
  
  return {
    ...PERFORMANCE_CONFIG,
    execution: {
      ...PERFORMANCE_CONFIG.execution,
      measurementRuns: isCritical ? 5 : 3, // More runs for critical pages
      warmupRuns: isCritical ? 2 : 1       // More warmup for critical pages
    },
    thresholds: {
      ...PERFORMANCE_CONFIG.thresholds,
      failOnBudgetViolation: isCritical,    // Strict enforcement for critical pages
      maxBudgetViolations: isCritical ? 0 : 2 // No violations allowed for critical pages
    }
  }
}

/**
 * Performance test selectors for common healthcare UI elements
 */
export const PERFORMANCE_SELECTORS = {
  // Patient data elements
  patientList: '[data-testid="patient-list"]',
  patientCard: '[data-testid="patient-card"]',
  patientDetails: '[data-testid="patient-details"]',
  medicalHistory: '[data-testid="medical-history"]',
  
  // Form elements
  medicalForm: '[data-testid="medical-form"]',
  prescriptionForm: '[data-testid="prescription-form"]',
  appointmentForm: '[data-testid="appointment-form"]',
  
  // Navigation elements
  mainNavigation: '[data-testid="main-navigation"]',
  breadcrumbs: '[data-testid="breadcrumbs"]',
  sidebar: '[data-testid="sidebar"]',
  
  // Search elements
  searchInput: '[data-testid="search-input"]',
  searchResults: '[data-testid="search-results"]',
  searchFilters: '[data-testid="search-filters"]',
  
  // Loading states
  loadingSpinner: '[data-testid="loading-spinner"]',
  loadingSkeleton: '[data-testid="loading-skeleton"]',
  
  // Success/Error states
  successMessage: '[data-testid="success-message"]',
  errorMessage: '[data-testid="error-message"]',
  
  // Critical healthcare elements
  emergencyAlert: '[data-testid="emergency-alert"]',
  criticalValues: '[data-testid="critical-values"]',
  medicationAlerts: '[data-testid="medication-alerts"]'
}

/**
 * Custom performance assertions for healthcare workflows
 */
export const HEALTHCARE_PERFORMANCE_ASSERTIONS = {
  // Patient data must load quickly for safety
  patientDataLoad: {
    maxTime: 1000,
    errorMessage: 'Patient data loading exceeded safety threshold'
  },
  
  // Emergency features must be immediately responsive
  emergencyResponse: {
    maxTime: 500,
    errorMessage: 'Emergency features must respond within 500ms'
  },
  
  // Medical forms must submit reliably and quickly
  medicalFormSubmission: {
    maxTime: 2000,
    errorMessage: 'Medical form submission exceeded acceptable time'
  },
  
  // Search must be fast for clinical efficiency
  clinicalSearch: {
    maxTime: 800,
    errorMessage: 'Clinical search response time affects workflow efficiency'
  },
  
  // Navigation must be smooth for user experience
  clinicalNavigation: {
    maxTime: 400,
    errorMessage: 'Clinical navigation must be smooth and responsive'
  }
}

export default PERFORMANCE_CONFIG
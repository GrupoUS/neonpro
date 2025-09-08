/**
 * Healthcare-specific performance metrics configuration
 * Defines critical performance thresholds for healthcare applications
 */

export interface HealthcareMetric {
  name: string
  description: string
  threshold: number
  unit: 'ms' | 'score' | 'bytes' | 'count'
  critical: boolean
  category: 'clinical' | 'administrative' | 'compliance' | 'user-experience'
}

export interface HealthcarePerformanceBudget {
  // Core Web Vitals - Critical for all healthcare apps
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte

  // Healthcare-specific metrics
  patientDataLoadTime: number
  medicalRecordAccessTime: number
  prescriptionLoadTime: number
  diagnosticImageLoadTime: number
  formSubmissionTime: number
  searchResponseTime: number
  navigationTime: number
  authenticationTime: number

  // Compliance and security metrics
  auditLogTime: number
  encryptionTime: number
  accessControlCheckTime: number

  // Memory and resource metrics
  memoryUsage: number
  cpuUsage: number
  networkRequests: number
  bundleSize: number
}

/**
 * Critical healthcare performance metrics
 * These metrics are essential for patient safety and regulatory compliance
 */
export const HEALTHCARE_CRITICAL_METRICS: HealthcareMetric[] = [
  {
    name: 'patientDataLoadTime',
    description: 'Time to load critical patient data (demographics, allergies, medications)',
    threshold: 2000, // 2 seconds - critical for emergency situations
    unit: 'ms',
    critical: true,
    category: 'clinical',
  },
  {
    name: 'medicalRecordAccessTime',
    description: 'Time to access complete medical records',
    threshold: 3000, // 3 seconds
    unit: 'ms',
    critical: true,
    category: 'clinical',
  },
  {
    name: 'prescriptionLoadTime',
    description: 'Time to load prescription history and current medications',
    threshold: 1500, // 1.5 seconds - critical for drug interactions
    unit: 'ms',
    critical: true,
    category: 'clinical',
  },
  {
    name: 'diagnosticImageLoadTime',
    description: 'Time to load diagnostic images (X-rays, MRIs, etc.)',
    threshold: 5000, // 5 seconds - acceptable for large medical images
    unit: 'ms',
    critical: true,
    category: 'clinical',
  },
  {
    name: 'authenticationTime',
    description: 'Time for healthcare provider authentication',
    threshold: 3000, // 3 seconds
    unit: 'ms',
    critical: true,
    category: 'compliance',
  },
  {
    name: 'auditLogTime',
    description: 'Time to record audit log entries (HIPAA compliance)',
    threshold: 500, // 500ms - must be fast to not impact workflow
    unit: 'ms',
    critical: true,
    category: 'compliance',
  },
]

/**
 * Standard healthcare performance metrics
 * Important for user experience but not critical for patient safety
 */
export const HEALTHCARE_STANDARD_METRICS: HealthcareMetric[] = [
  {
    name: 'formSubmissionTime',
    description: 'Time to submit and process healthcare forms',
    threshold: 2000, // 2 seconds
    unit: 'ms',
    critical: false,
    category: 'user-experience',
  },
  {
    name: 'searchResponseTime',
    description: 'Time to return search results (patients, procedures, etc.)',
    threshold: 1000, // 1 second
    unit: 'ms',
    critical: false,
    category: 'user-experience',
  },
  {
    name: 'navigationTime',
    description: 'Time to navigate between different sections',
    threshold: 800, // 800ms
    unit: 'ms',
    critical: false,
    category: 'user-experience',
  },
  {
    name: 'encryptionTime',
    description: 'Time to encrypt/decrypt sensitive data',
    threshold: 200, // 200ms
    unit: 'ms',
    critical: false,
    category: 'compliance',
  },
  {
    name: 'accessControlCheckTime',
    description: 'Time to verify user permissions',
    threshold: 300, // 300ms
    unit: 'ms',
    critical: false,
    category: 'compliance',
  },
]

/**
 * Performance budgets for different types of healthcare pages
 */
export const HEALTHCARE_PERFORMANCE_BUDGETS: Record<
  string,
  HealthcarePerformanceBudget
> = {
  // Emergency/Critical Care Pages
  emergency: {
    // Core Web Vitals - Stricter for emergency scenarios
    lcp: 1500, // 1.5s - Must load fast in emergencies
    fid: 50, // 50ms - Immediate response needed
    cls: 0.05, // Minimal layout shift
    fcp: 1000, // 1s
    ttfb: 200, // 200ms

    // Healthcare-specific - Emergency optimized
    patientDataLoadTime: 1500, // 1.5s - Critical patient info
    medicalRecordAccessTime: 2000, // 2s - Emergency medical history
    prescriptionLoadTime: 1000, // 1s - Drug allergies/interactions
    diagnosticImageLoadTime: 3000, // 3s - Emergency scans
    formSubmissionTime: 1500, // 1.5s - Emergency forms
    searchResponseTime: 500, // 500ms - Fast patient lookup
    navigationTime: 400, // 400ms - Quick navigation
    authenticationTime: 2000, // 2s - Fast but secure auth

    // Compliance metrics
    auditLogTime: 300, // 300ms
    encryptionTime: 150, // 150ms
    accessControlCheckTime: 200, // 200ms

    // Resource metrics
    memoryUsage: 100 * 1024 * 1024, // 100MB
    cpuUsage: 70, // 70% max CPU
    networkRequests: 20, // Minimize requests
    bundleSize: 500 * 1024, // 500KB max bundle
  },

  // Regular Clinical Pages
  clinical: {
    // Core Web Vitals - Standard clinical requirements
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // Acceptable layout shift
    fcp: 1500, // 1.5s
    ttfb: 300, // 300ms

    // Healthcare-specific - Standard clinical workflow
    patientDataLoadTime: 2000, // 2s
    medicalRecordAccessTime: 3000, // 3s
    prescriptionLoadTime: 1500, // 1.5s
    diagnosticImageLoadTime: 5000, // 5s - Full quality images
    formSubmissionTime: 2000, // 2s
    searchResponseTime: 1000, // 1s
    navigationTime: 600, // 600ms
    authenticationTime: 3000, // 3s

    // Compliance metrics
    auditLogTime: 500, // 500ms
    encryptionTime: 200, // 200ms
    accessControlCheckTime: 300, // 300ms

    // Resource metrics
    memoryUsage: 150 * 1024 * 1024, // 150MB
    cpuUsage: 80, // 80% max CPU
    networkRequests: 30, // Moderate requests
    bundleSize: 800 * 1024, // 800KB max bundle
  },

  // Administrative Pages
  administrative: {
    // Core Web Vitals - Relaxed for admin tasks
    lcp: 3000, // 3s
    fid: 150, // 150ms
    cls: 0.15, // More layout shift acceptable
    fcp: 2000, // 2s
    ttfb: 400, // 400ms

    // Healthcare-specific - Administrative workflow
    patientDataLoadTime: 3000, // 3s - Less critical
    medicalRecordAccessTime: 4000, // 4s
    prescriptionLoadTime: 2000, // 2s
    diagnosticImageLoadTime: 6000, // 6s
    formSubmissionTime: 3000, // 3s - Complex admin forms
    searchResponseTime: 1500, // 1.5s
    navigationTime: 800, // 800ms
    authenticationTime: 3000, // 3s

    // Compliance metrics
    auditLogTime: 600, // 600ms
    encryptionTime: 250, // 250ms
    accessControlCheckTime: 400, // 400ms

    // Resource metrics
    memoryUsage: 200 * 1024 * 1024, // 200MB
    cpuUsage: 85, // 85% max CPU
    networkRequests: 40, // More requests for admin data
    bundleSize: 1000 * 1024, // 1MB max bundle
  },

  // Reporting and Analytics Pages
  reporting: {
    // Core Web Vitals - Relaxed for complex reports
    lcp: 4000, // 4s - Complex charts and data
    fid: 200, // 200ms
    cls: 0.2, // Layout shift acceptable for dynamic content
    fcp: 2500, // 2.5s
    ttfb: 500, // 500ms

    // Healthcare-specific - Reporting workflow
    patientDataLoadTime: 4000, // 4s - Aggregate data
    medicalRecordAccessTime: 5000, // 5s - Historical data
    prescriptionLoadTime: 3000, // 3s
    diagnosticImageLoadTime: 8000, // 8s - Multiple images
    formSubmissionTime: 4000, // 4s - Complex report parameters
    searchResponseTime: 2000, // 2s - Complex queries
    navigationTime: 1000, // 1s
    authenticationTime: 3000, // 3s

    // Compliance metrics
    auditLogTime: 800, // 800ms
    encryptionTime: 300, // 300ms
    accessControlCheckTime: 500, // 500ms

    // Resource metrics
    memoryUsage: 300 * 1024 * 1024, // 300MB - Large datasets
    cpuUsage: 90, // 90% max CPU - Heavy processing
    networkRequests: 60, // Many requests for data
    bundleSize: 1500 * 1024, // 1.5MB max bundle
  },
}

/**
 * Healthcare-specific performance assertions
 * Used in E2E tests to validate critical healthcare workflows
 */
export const HEALTHCARE_PERFORMANCE_ASSERTIONS = {
  // Patient Safety Critical Assertions
  patientSafety: {
    criticalDataLoad: {
      description: 'Critical patient data must load within safety thresholds',
      assertion: (metrics: Record<string, number>,) => {
        const criticalMetrics = [
          'patientDataLoadTime',
          'prescriptionLoadTime',
          'medicalRecordAccessTime',
        ]
        return criticalMetrics.every((metric,) => {
          const value = metrics[metric]
          const threshold = HEALTHCARE_CRITICAL_METRICS.find(
            (m,) => m.name === metric,
          )?.threshold
          return value && threshold && value <= threshold
        },)
      },
    },

    emergencyResponse: {
      description: 'Emergency scenarios must meet strict performance requirements',
      assertion: (metrics: Record<string, number>, pageType: string,) => {
        if (pageType !== 'emergency') {
          return true
        }
        const budget = HEALTHCARE_PERFORMANCE_BUDGETS.emergency
        return (
          metrics.patientDataLoadTime <= budget.patientDataLoadTime
          && metrics.prescriptionLoadTime <= budget.prescriptionLoadTime
          && metrics.lcp <= budget.lcp
        )
      },
    },
  },

  // Regulatory Compliance Assertions
  compliance: {
    auditTrail: {
      description: 'Audit logging must not impact user workflow performance',
      assertion: (metrics: Record<string, number>,) => {
        return metrics.auditLogTime <= 500 // 500ms max for audit logging
      },
    },

    dataEncryption: {
      description: 'Data encryption/decryption must be performant',
      assertion: (metrics: Record<string, number>,) => {
        return metrics.encryptionTime <= 300 // 300ms max for encryption
      },
    },

    accessControl: {
      description: 'Access control checks must be fast',
      assertion: (metrics: Record<string, number>,) => {
        return metrics.accessControlCheckTime <= 400 // 400ms max
      },
    },
  },

  // User Experience Assertions
  userExperience: {
    coreWebVitals: {
      description: 'Core Web Vitals must meet healthcare standards',
      assertion: (metrics: Record<string, number>, pageType = 'clinical',) => {
        const budget = HEALTHCARE_PERFORMANCE_BUDGETS[pageType]
          || HEALTHCARE_PERFORMANCE_BUDGETS.clinical
        return (
          metrics.lcp <= budget.lcp
          && metrics.fid <= budget.fid
          && metrics.cls <= budget.cls
        )
      },
    },

    interactivity: {
      description: 'User interactions must be responsive',
      assertion: (metrics: Record<string, number>,) => {
        return (
          metrics.formSubmissionTime <= 3000 // 3s max for form submission
          && metrics.searchResponseTime <= 1500 // 1.5s max for search
          && metrics.navigationTime <= 1000 // 1s max for navigation
        )
      },
    },
  },
}

/**
 * Get performance budget for a specific healthcare page type
 */
export function getHealthcarePerformanceBudget(
  pageType: string,
): HealthcarePerformanceBudget {
  return (
    HEALTHCARE_PERFORMANCE_BUDGETS[pageType]
    || HEALTHCARE_PERFORMANCE_BUDGETS.clinical
  )
}

/**
 * Check if a page type is considered critical for patient safety
 */
export function isCriticalHealthcarePage(pageType: string,): boolean {
  return pageType === 'emergency' || pageType === 'clinical'
}

/**
 * Get all critical healthcare metrics for a page type
 */
export function getCriticalHealthcareMetrics(
  pageType: string,
): HealthcareMetric[] {
  if (isCriticalHealthcarePage(pageType,)) {
    return HEALTHCARE_CRITICAL_METRICS
  }
  return HEALTHCARE_CRITICAL_METRICS.filter(
    (metric,) => metric.category === 'compliance',
  )
}

/**
 * Validate healthcare performance metrics against thresholds
 */
export function validateHealthcareMetrics(
  metrics: Record<string, number>,
  pageType = 'clinical',
): {
  passed: boolean
  failures: {
    metric: string
    value: number
    threshold: number
    critical: boolean
  }[]
} {
  const budget = getHealthcarePerformanceBudget(pageType,)
  const criticalMetrics = getCriticalHealthcareMetrics(pageType,)
  const failures: Record<string, unknown>[] = []

  // Check Core Web Vitals
  const coreVitals = [
    { name: 'lcp', threshold: budget.lcp, critical: true, },
    { name: 'fid', threshold: budget.fid, critical: true, },
    { name: 'cls', threshold: budget.cls, critical: true, },
    { name: 'fcp', threshold: budget.fcp, critical: false, },
    { name: 'ttfb', threshold: budget.ttfb, critical: false, },
  ]

  coreVitals.forEach((vital,) => {
    if (metrics[vital.name] && metrics[vital.name] > vital.threshold) {
      failures.push({
        metric: vital.name,
        value: metrics[vital.name],
        threshold: vital.threshold,
        critical: vital.critical,
      },)
    }
  },)

  // Check healthcare-specific metrics
  criticalMetrics.forEach((metric,) => {
    const budgetValue = (budget as any)[metric.name]
    if (
      metrics[metric.name]
      && budgetValue
      && metrics[metric.name] > budgetValue
    ) {
      failures.push({
        metric: metric.name,
        value: metrics[metric.name],
        threshold: budgetValue,
        critical: metric.critical,
      },)
    }
  },)

  return {
    passed: failures.length === 0,
    failures,
  }
}

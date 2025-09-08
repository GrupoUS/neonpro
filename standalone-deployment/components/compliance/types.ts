/**
 * TypeScript types for the compliance monitoring system
 * Supports WCAG, LGPD, ANVISA, and CFM frameworks
 */

// Core compliance frameworks supported
export type ComplianceFramework = "WCAG" | "LGPD" | "ANVISA" | "CFM";

// Compliance score status indicators
export type ComplianceStatus = "excellent" | "good" | "warning" | "critical";

// Trend indicators for compliance scores
export type ComplianceTrend = "up" | "down" | "stable";

// Violation severity levels
export type ViolationSeverity = "low" | "medium" | "high" | "critical";

// Violation status tracking
export type ViolationStatus = "open" | "in_progress" | "resolved";

// Report generation status
export type ReportStatus = "generating" | "ready" | "error";

/**
 * Main compliance score interface
 * Represents the current compliance status for a specific framework
 */
export interface ComplianceScore {
  framework: ComplianceFramework;
  score: number; // 0-100
  status: ComplianceStatus;
  lastUpdated: number; // timestamp
  violations: number; // count of active violations
  trend: ComplianceTrend;
  trendValue: number; // percentage change
}

/**
 * Compliance violation interface
 * Represents a specific compliance violation found by automated checks
 */
export interface ComplianceViolation {
  id: string;
  framework: ComplianceFramework;
  severity: ViolationSeverity;
  rule: string; // specific rule that was violated
  description: string; // human-readable description
  element?: string; // DOM element selector (for WCAG)
  page: string; // page where violation was found
  timestamp: number; // when violation was detected
  status: ViolationStatus;
  assignedTo?: string; // email of person assigned to fix
  notes?: string; // additional notes or fixes applied
}

/**
 * Compliance report interface
 * Represents a generated compliance report
 */
export interface ComplianceReport {
  id: string;
  title: string;
  frameworks: ComplianceFramework[];
  generatedAt: number;
  status: ReportStatus;
  downloadUrl?: string;
  metadata?: {
    totalPages?: number;
    totalViolations?: number;
    averageScore?: number;
    reportedPeriod?: {
      startDate: string;
      endDate: string;
    };
  };
}

/**
 * Configuration for compliance checks
 */
export interface ComplianceConfig {
  // WCAG Configuration
  wcag?: {
    level: "A" | "AA" | "AAA";
    tags?: string[]; // specific axe tags to check
    excludeSelectors?: string[]; // CSS selectors to exclude
    includeRules?: string[]; // specific rules to include
    excludeRules?: string[]; // specific rules to exclude
  };

  // LGPD Configuration
  lgpd?: {
    checkConsent?: boolean;
    checkRetentionPolicies?: boolean;
    checkDataMinimization?: boolean;
    auditDataProcessing?: boolean;
  };

  // ANVISA Configuration
  anvisa?: {
    checkMedicalRecords?: boolean;
    checkDigitalSignatures?: boolean;
    checkDataIntegrity?: boolean;
    checkAuditTrails?: boolean;
  };

  // CFM Configuration
  cfm?: {
    checkEthicsCompliance?: boolean;
    checkPatientPrivacy?: boolean;
    checkProfessionalConduct?: boolean;
    checkMedicalSecrecy?: boolean;
  };

  // General configuration
  general?: {
    enableRealTimeMonitoring?: boolean;
    notificationThreshold?: ComplianceStatus;
    retryAttempts?: number;
    timeoutMs?: number;
  };
}

/**
 * Compliance check result
 * Represents the result of running a compliance check
 */
export interface ComplianceCheckResult {
  framework: ComplianceFramework;
  score: number;
  violations: ComplianceViolation[];
  passes: number;
  incomplete: number;
  timestamp: number;
  metadata: {
    checkDurationMs: number;
    pagesChecked: number;
    rulesEvaluated: number;
  };
}

/**
 * Real-time monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  interval: number; // minutes between checks
  frameworks: ComplianceFramework[];
  alertThresholds: {
    scoreDropPercent: number; // alert when score drops by this percent
    newViolationSeverity: ViolationSeverity; // alert for violations of this severity or higher
  };
  notifications: {
    email?: {
      enabled: boolean;
      recipients: string[];
    };
    webhook?: {
      enabled: boolean;
      url: string;
      secret?: string;
    };
    dashboard?: {
      enabled: boolean;
      showToasts: boolean;
    };
  };
}

/**
 * Compliance dashboard filters
 */
export interface ComplianceFilters {
  frameworks?: ComplianceFramework[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  violationStatus?: ViolationStatus[];
  violationSeverity?: ViolationSeverity[];
  assignedTo?: string[];
  pages?: string[];
}

/**
 * Compliance trend data
 */
export interface ComplianceTrendData {
  framework: ComplianceFramework;
  data: {
    date: string;
    score: number;
    violations: number;
  }[];
  summary: {
    averageScore: number;
    scoreImprovement: number; // percentage change over period
    totalViolations: number;
    violationTrend: ComplianceTrend;
  };
}

/**
 * WCAG-specific interfaces
 */
export interface WCAGViolation extends Omit<ComplianceViolation, "framework"> {
  framework: "WCAG";
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriterion: string; // e.g., '1.4.3'
  wcagTechnique?: string; // specific technique
  axeRule: string; // axe-core rule ID
  impact: "minor" | "moderate" | "serious" | "critical";
  nodes: {
    target: string[]; // CSS selector path
    html: string; // problematic HTML
    failureSummary?: string;
  }[];
}

/**
 * LGPD-specific interfaces
 */
export interface LGPDViolation extends Omit<ComplianceViolation, "framework"> {
  framework: "LGPD";
  lgpdArticle: string; // e.g., 'Art. 9'
  dataCategory: string; // type of personal data involved
  processingPurpose?: string;
  legalBasis?: string;
  consentStatus?: "missing" | "invalid" | "expired" | "withdrawn";
  retentionPeriod?: string;
}

/**
 * ANVISA-specific interfaces
 */
export interface ANVISAViolation extends Omit<ComplianceViolation, "framework"> {
  framework: "ANVISA";
  regulation: string; // e.g., 'RDC 11/2014'
  requirement: string; // specific requirement
  medicalRecordId?: string;
  patientId?: string;
  healthcareProvider?: string;
  auditTrailPresent: boolean;
  digitalSignatureValid: boolean;
}

/**
 * CFM-specific interfaces
 */
export interface CFMViolation extends Omit<ComplianceViolation, "framework"> {
  framework: "CFM";
  ethicsCode: string; // e.g., 'CEM Art. 73'
  professionalDuty: string;
  patientRights?: string[];
  medicalSecrecyBreach: boolean;
  professionalResponsibility: string;
}

/**
 * Database schema interfaces for Supabase
 */
export interface ComplianceScoreRow {
  id: string;
  framework: ComplianceFramework;
  score: number;
  violations_count: number;
  trend: ComplianceTrend;
  trend_value: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceViolationRow {
  id: string;
  framework: ComplianceFramework;
  severity: ViolationSeverity;
  rule: string;
  description: string;
  element?: string;
  page: string;
  status: ViolationStatus;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceHistoryRow {
  id: string;
  framework: ComplianceFramework;
  date: string;
  score: number;
  violations_count: number;
  created_at: string;
}

/**
 * API response interfaces
 */
export interface ComplianceAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
    duration: number;
  };
}

/**
 * Webhook payload interfaces
 */
export interface ComplianceWebhookPayload {
  event: "violation_detected" | "score_changed" | "check_completed";
  framework: ComplianceFramework;
  data: ComplianceViolation | ComplianceScore | ComplianceCheckResult;
  timestamp: number;
  signature?: string; // HMAC signature for verification
}

/**
 * Export utility types
 */
export type ComplianceViolationUnion =
  | WCAGViolation
  | LGPDViolation
  | ANVISAViolation
  | CFMViolation;

export type ComplianceMetrics = {
  [K in ComplianceFramework]: {
    score: number;
    violations: number;
    trend: ComplianceTrend;
    lastCheck: number;
  };
};

/**
 * Type guards
 */
export const isWCAGViolation = (violation: ComplianceViolation): violation is WCAGViolation => {
  return violation.framework === "WCAG";
};

export const isLGPDViolation = (violation: ComplianceViolation): violation is LGPDViolation => {
  return violation.framework === "LGPD";
};

export const isANVISAViolation = (violation: ComplianceViolation): violation is ANVISAViolation => {
  return violation.framework === "ANVISA";
};

export const isCFMViolation = (violation: ComplianceViolation): violation is CFMViolation => {
  return violation.framework === "CFM";
};

/**
 * System health and integration types
 */
export interface SystemHealthCheck {
  service: string;
  status: "healthy" | "warning" | "error";
  lastCheck: Date;
  metrics?: {
    connectivity?: boolean;
    responseTime?: number;
    lastUpdate?: Date;
    [key: string]: unknown;
  };
  error?: string;
}

export interface IntegrationValidation {
  status: "healthy" | "warning" | "error";
  validations: {
    component: string;
    status: "healthy" | "warning" | "error";
    checks?: unknown;
    error?: string;
  }[];
  timestamp: Date;
}

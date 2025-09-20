/**
 * AI Analytics Types
 *
 * Type definitions for advanced healthcare analytics system
 */

export interface AIAnalyticsConfig {
  enablePredictiveAnalytics: boolean;
  enableLGPDCompliance: boolean;
  enableRealTimeProcessing: boolean;
  enableAuditLogging: boolean;
  modelProvider?: any;
}

export interface HealthcareInsights {
  category: "clinical" | "operational" | "financial" | "regulatory";
  insights: any[];
  metrics: any;
  complianceStatus: "compliant" | "warning" | "violation";
  generatedAt: Date;
}

export interface HealthcareComplianceAudit {
  lgpdCompliant: boolean;
  anvisaCompliant: boolean;
  cfmCompliant: boolean;
  auditTrail: string[];
  recommendations: string[];
  lastAuditDate: Date;
  overallScore: number;
  issues: string[];
  nextAuditDue: Date;
}

export interface BrazilianHealthcareKPIs {
  anvisa: {
    deviceCompliance: number;
    auditScore: number;
    lastInspection: Date;
  };
  sus: {
    integrationPerformance: number;
    patientFlow: number;
    waitingTimeCompliance: number;
  };
  lgpd: {
    dataProtectionScore: number;
    consentRate: number;
    breachCount: number;
  };
  lastUpdated: Date;
}

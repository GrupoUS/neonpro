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

export interface HealthcareInsight {
  category: 'clinical' | 'operational' | 'financial' | 'regulatory';
  insights: any[];
  metrics: any;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  generatedAt: Date;
}

export interface ComplianceAudit {
  lgpdCompliant: boolean;
  anvisaCompliant: boolean;
  cfmCompliant: boolean;
  auditTrail: string[];
  recommendations: string[];
  lastAuditDate: Date;
}
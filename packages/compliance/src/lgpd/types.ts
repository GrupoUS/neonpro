/**
 * @fileoverview LGPD Types and Interfaces
 * Constitutional Brazilian Data Protection Law Type Definitions
 *
 * @version 0.1.0
 * @compliance LGPD Art. 5º, 7º, 11º, 14º, 18º
 */

// Base LGPD Types
export interface LGPDSubject {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document: string; // CPF/CNPJ
  createdAt: Date;
  updatedAt: Date;
}

export interface LGPDConsent {
  id: string;
  subjectId: string;
  purpose: string;
  description: string;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  version: string;
  metadata?: Record<string, any>;
}

export interface LGPDDataCategory {
  id: string;
  name: string;
  description: string;
  sensitivity: "low" | "medium" | "high" | "critical";
  retention: number; // days
  lawfulBasis: LGPDLawfulBasis;
}

export type LGPDLawfulBasis =
  | "consent"
  | "contract"
  | "legal_obligation"
  | "vital_interests"
  | "public_task"
  | "legitimate_interests";

export interface LGPDProcessingActivity {
  id: string;
  name: string;
  description: string;
  controller: string;
  processor?: string;
  categories: string[];
  purposes: string[];
  recipients: string[];
  transfers: LGPDDataTransfer[];
  retention: number;
  security: LGPDSecurityMeasure[];
}

export interface LGPDDataTransfer {
  id: string;
  recipient: string;
  country: string;
  adequacyDecision?: boolean;
  safeguards: string[];
  purpose: string;
}

export interface LGPDSecurityMeasure {
  id: string;
  type: "technical" | "organizational";
  description: string;
  implemented: boolean;
  implementedAt?: Date;
}

export interface LGPDDataBreach {
  id: string;
  detectedAt: Date;
  reportedAt?: Date;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedSubjects: number;
  categories: string[];
  consequences: string[];
  measures: string[];
  status: "detected" | "investigating" | "reported" | "resolved";
}

export interface LGPDSubjectRequest {
  id: string;
  subjectId: string;
  type: "access" | "rectification" | "erasure" | "portability" | "objection";
  description?: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  status: "pending" | "processing" | "completed" | "rejected";
  response?: string;
}

export interface LGPDDPIA {
  id: string;
  name: string;
  description: string;
  processing: LGPDProcessingActivity;
  risks: LGPDRisk[];
  measures: LGPDSecurityMeasure[];
  assessment: LGPDRiskAssessment;
  reviewDate: Date;
  status: "draft" | "review" | "approved" | "rejected";
}

export interface LGPDRisk {
  id: string;
  description: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  category: "confidentiality" | "integrity" | "availability";
  mitigation: string[];
}

export interface LGPDRiskAssessment {
  overallRisk: "low" | "medium" | "high";
  recommendation: "proceed" | "proceed_with_measures" | "reject";
  justification: string;
  assessedBy: string;
  assessedAt: Date;
}

export interface LGPDAuditLog {
  id: string;
  timestamp: Date;
  action: string;
  subjectId?: string;
  userId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface LGPDReport {
  id: string;
  type: "compliance" | "breach" | "dpia" | "audit";
  period: {
    start: Date;
    end: Date;
  };
  data: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
}

// Configuration Types
export interface LGPDConfig {
  controller: {
    name: string;
    contact: string;
    dpo?: string;
  };
  retention: {
    default: number;
    categories: Record<string, number>;
  };
  notifications: {
    breach: {
      authority: string;
      timeLimit: number; // hours
    };
    subject: {
      timeLimit: number; // days
    };
  };
  security: {
    encryption: boolean;
    pseudonymization: boolean;
    accessControls: boolean;
  };
}

// Utility Types
export interface LGPDValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type LGPDExportFormat = "json" | "xml" | "csv" | "pdf";

export interface LGPDExportOptions {
  format: LGPDExportFormat;
  includeMetadata: boolean;
  anonymize: boolean;
  categories?: string[];
}

// Event Types
export interface LGPDEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

export type LGPDEventHandler = (event: LGPDEvent) => void | Promise<void>;

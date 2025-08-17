/**
 * @fileoverview LGPD Types and Interfaces
 * Constitutional Brazilian Data Protection Law Type Definitions
 *
 * @version 0.1.0
 * @compliance LGPD Art. 5º, 7º, 11º, 14º, 18º
 */

// Base LGPD Types
export type LGPDSubject = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document: string; // CPF/CNPJ
  createdAt: Date;
  updatedAt: Date;
};

export type LGPDConsent = {
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
};

export type LGPDDataCategory = {
  id: string;
  name: string;
  description: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  retention: number; // days
  lawfulBasis: LGPDLawfulBasis;
};

export type LGPDLawfulBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type LGPDProcessingActivity = {
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
};

export type LGPDDataTransfer = {
  id: string;
  recipient: string;
  country: string;
  adequacyDecision?: boolean;
  safeguards: string[];
  purpose: string;
};

export type LGPDSecurityMeasure = {
  id: string;
  type: 'technical' | 'organizational';
  description: string;
  implemented: boolean;
  implementedAt?: Date;
};

export type LGPDDataBreach = {
  id: string;
  detectedAt: Date;
  reportedAt?: Date;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSubjects: number;
  categories: string[];
  consequences: string[];
  measures: string[];
  status: 'detected' | 'investigating' | 'reported' | 'resolved';
};

export type LGPDSubjectRequest = {
  id: string;
  subjectId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection';
  description?: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  response?: string;
};

export type LGPDDPIA = {
  id: string;
  name: string;
  description: string;
  processing: LGPDProcessingActivity;
  risks: LGPDRisk[];
  measures: LGPDSecurityMeasure[];
  assessment: LGPDRiskAssessment;
  reviewDate: Date;
  status: 'draft' | 'review' | 'approved' | 'rejected';
};

export type LGPDRisk = {
  id: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'confidentiality' | 'integrity' | 'availability';
  mitigation: string[];
};

export type LGPDRiskAssessment = {
  overallRisk: 'low' | 'medium' | 'high';
  recommendation: 'proceed' | 'proceed_with_measures' | 'reject';
  justification: string;
  assessedBy: string;
  assessedAt: Date;
};

export type LGPDAuditLog = {
  id: string;
  timestamp: Date;
  action: string;
  subjectId?: string;
  userId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
};

export type LGPDReport = {
  id: string;
  type: 'compliance' | 'breach' | 'dpia' | 'audit';
  period: {
    start: Date;
    end: Date;
  };
  data: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
};

// Configuration Types
export type LGPDConfig = {
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
};

// Utility Types
export type LGPDValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type LGPDExportFormat = 'json' | 'xml' | 'csv' | 'pdf';

export type LGPDExportOptions = {
  format: LGPDExportFormat;
  includeMetadata: boolean;
  anonymize: boolean;
  categories?: string[];
};

// Event Types
export type LGPDEvent = {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
};

export type LGPDEventHandler = (event: LGPDEvent) => void | Promise<void>;

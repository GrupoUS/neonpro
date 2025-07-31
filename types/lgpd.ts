/**
 * LGPD Compliance Framework - Type Definitions
 * Sistema completo de conformidade com LGPD para NeonPro
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º
 */

// ============================================================================
// CONSENT MANAGEMENT TYPES
// ============================================================================

/**
 * Tipos de consentimento LGPD
 */
export enum ConsentType {
  PERSONAL_DATA = 'personal_data',
  SENSITIVE_DATA = 'sensitive_data',
  MEDICAL_DATA = 'medical_data',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  AUTOMATED_PROCESSING = 'automated_processing'
}

/**
 * Status do consentimento
 */
export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

/**
 * Base legal para processamento (Art. 7º LGPD)
 */
export enum LegalBasis {
  CONSENT = 'consent',                    // Consentimento
  CONTRACT = 'contract',                  // Execução de contrato
  LEGAL_OBLIGATION = 'legal_obligation',  // Cumprimento de obrigação legal
  VITAL_INTERESTS = 'vital_interests',    // Proteção da vida
  PUBLIC_TASK = 'public_task',           // Exercício regular de direitos
  LEGITIMATE_INTERESTS = 'legitimate_interests' // Interesse legítimo
}

/**
 * Estrutura de consentimento granular
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  clinicId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  legalBasis: LegalBasis;
  purpose: string;
  description: string;
  grantedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DATA SUBJECT RIGHTS TYPES
// ============================================================================

/**
 * Direitos do titular (Art. 18º LGPD)
 */
export enum DataSubjectRight {
  ACCESS = 'access',                      // Confirmação e acesso
  RECTIFICATION = 'rectification',        // Correção
  ANONYMIZATION = 'anonymization',        // Anonimização
  BLOCKING = 'blocking',                  // Bloqueio
  ELIMINATION = 'elimination',            // Eliminação
  PORTABILITY = 'portability',           // Portabilidade
  INFORMATION = 'information',            // Informação sobre compartilhamento
  CONSENT_WITHDRAWAL = 'consent_withdrawal', // Revogação do consentimento
  OPPOSITION = 'opposition'               // Oposição
}

/**
 * Status da solicitação de direito
 */
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Solicitação de exercício de direito
 */
export interface DataSubjectRequest {
  id: string;
  userId: string;
  clinicId: string;
  requestType: DataSubjectRight;
  status: RequestStatus;
  description: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
  processorId?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AUDIT AND LOGGING TYPES
// ============================================================================

/**
 * Tipos de eventos de auditoria LGPD
 */
export enum AuditEventType {
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  DATA_EXPORT = 'data_export',
  DATA_SHARING = 'data_sharing',
  BREACH_DETECTED = 'breach_detected',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SYSTEM_ACCESS = 'system_access'
}

/**
 * Registro de auditoria LGPD
 */
export interface LGPDAuditLog {
  id: string;
  eventType: AuditEventType;
  userId?: string;
  clinicId: string;
  dataSubject?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  processed: boolean;
  createdAt: Date;
}

// ============================================================================
// DATA ENCRYPTION TYPES
// ============================================================================

/**
 * Tipos de dados sensíveis para criptografia
 */
export enum SensitiveDataType {
  CPF = 'cpf',
  RG = 'rg',
  MEDICAL_RECORD = 'medical_record',
  HEALTH_DATA = 'health_data',
  BIOMETRIC_DATA = 'biometric_data',
  FINANCIAL_DATA = 'financial_data',
  CONTACT_INFO = 'contact_info'
}

/**
 * Configuração de criptografia
 */
export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  saltSize: number;
  iterations: number;
}

/**
 * Dados criptografados
 */
export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  algorithm: string;
  timestamp: Date;
}

// ============================================================================
// COMPLIANCE REPORTING TYPES
// ============================================================================

/**
 * Tipos de relatórios de compliance
 */
export enum ComplianceReportType {
  CONSENT_SUMMARY = 'consent_summary',
  DATA_PROCESSING = 'data_processing',
  BREACH_REPORT = 'breach_report',
  AUDIT_TRAIL = 'audit_trail',
  DATA_INVENTORY = 'data_inventory',
  RISK_ASSESSMENT = 'risk_assessment'
}

/**
 * Relatório de compliance
 */
export interface ComplianceReport {
  id: string;
  clinicId: string;
  reportType: ComplianceReportType;
  title: string;
  description: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  data: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
  status: 'draft' | 'final' | 'submitted';
  metadata?: Record<string, any>;
}

// ============================================================================
// PRIVACY POLICY TYPES
// ============================================================================

/**
 * Versão da política de privacidade
 */
export interface PrivacyPolicyVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: Date;
  expirationDate?: Date;
  isActive: boolean;
  changes?: string[];
  approvedBy: string;
  createdAt: Date;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Configuração LGPD da clínica
 */
export interface LGPDConfig {
  clinicId: string;
  dpoEmail: string;
  dpoName: string;
  consentRetentionDays: number;
  dataRetentionDays: number;
  breachNotificationHours: number;
  automaticDeletion: boolean;
  encryptionEnabled: boolean;
  auditingEnabled: boolean;
  privacyPolicyVersion: string;
  lastReviewDate: Date;
  nextReviewDate: Date;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface LGPDApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  compliance: {
    processed: boolean;
    auditLogged: boolean;
    consentVerified: boolean;
  };
  timestamp: Date;
}

export interface ConsentCheckResult {
  hasConsent: boolean;
  consentType: ConsentType;
  grantedAt?: Date;
  expiresAt?: Date;
  legalBasis: LegalBasis;
  canProcess: boolean;
  warnings?: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LGPDContext = {
  userId: string;
  clinicId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
};

export type DataProcessingPurpose = {
  id: string;
  name: string;
  description: string;
  legalBasis: LegalBasis;
  dataTypes: SensitiveDataType[];
  retentionPeriod: number;
  isActive: boolean;
};

export type BreachIncident = {
  id: string;
  clinicId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords: number;
  dataTypes: SensitiveDataType[];
  detectedAt: Date;
  reportedAt?: Date;
  resolvedAt?: Date;
  actions: string[];
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
};

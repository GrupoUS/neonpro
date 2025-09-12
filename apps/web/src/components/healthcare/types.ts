/**
 * Healthcare Component Base Types for NeonPro
 * Defines standard interfaces for healthcare-specific components
 */

export interface HealthcareComponentProps {
  readonly patientId?: string;
  readonly userRole: 'admin' | 'professional' | 'coordinator';
  readonly lgpdCompliant: boolean;
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void;
}

export interface PatientDataProps extends HealthcareComponentProps {
  readonly patientData?: {
    id: string;
    name: string;
    cpf?: string;
    phone?: string;
    email?: string;
  };
  readonly sensitiveDataMasked?: boolean;
}

export interface AestheticProcedureProps extends HealthcareComponentProps {
  readonly procedureType?: 'botox' | 'preenchimento' | 'peeling' | 'laser' | 'limpeza';
  readonly procedureDuration?: number;
  readonly requiresConsent?: boolean;
}

export interface ComplianceProps extends HealthcareComponentProps {
  readonly complianceLevel: 'lgpd' | 'anvisa' | 'cfm';
  readonly auditRequired?: boolean;
  readonly dataRetentionDays?: number;
}

export interface AIAssistantProps extends HealthcareComponentProps {
  readonly context: 'scheduling' | 'procedures' | 'aftercare' | 'emergency';
  readonly onEmergencyDetected?: (severity: 'low' | 'medium' | 'high') => void;
  readonly language?: 'pt-BR' | 'en-US';
}
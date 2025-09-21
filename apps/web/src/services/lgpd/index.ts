/**
 * LGPD Compliance Services for Calendar Operations
 * Central export point for all LGPD compliance functionality
 */

// Main services
export { CALENDAR_LGPD_PURPOSES, calendarLGPDAuditService } from './audit-logging.service';
export { calendarLGPDConsentService } from './calendar-consent.service';
export { calendarDataMinimizationService } from './data-minimization.service';

// Type definitions
export type {
  CalendarLGPDPurpose,
  ConsentValidationResult,
  DataMinimizationLevel,
  MinimizedCalendarAppointment,
} from './calendar-consent.service';

export type {
  DataMinimizationConfig,
  LGPDDataCategory,
  MinimizationResult,
  PatientDataSensitivity,
} from './data-minimization.service';

export type {
  AuditDetails,
  AuditFilter,
  AuditReport,
  LGPDAuditAction,
  LGPDAuditLog,
} from './audit-logging.service';

// Constants
export { CALENDAR_LGPD_PURPOSES } from './audit-logging.service';

// Default configurations
export const DEFAULT_LGPD_CONFIG = {
  retentionDays: 2555, // 7 years for medical data
  consentRequired: true,
  dataMinimizationEnabled: true,
  auditLoggingEnabled: true,
  riskAssessmentEnabled: true,
  defaultMinimizationLevel: 'standard' as const,
  healthcareRoles: [
    'doctor',
    'nurse',
    'healthcare_professional',
    'medical_staff',
    'clinician',
    'therapist',
    'specialist',
  ],
};

// Utility functions
export const _isHealthcareRole = (userRole: string): boolean => {
  return DEFAULT_LGPD_CONFIG.healthcareRoles.some(role =>
    userRole.toLowerCase().includes(role.toLowerCase())
  );
};

export const _getLegalBasisText = (basis: string): string => {
  const legalBases: Record<string, string> = {
    consent: 'LGPD Art. 7º, I - Consentimento do titular',
    contract: 'LGPD Art. 7º, V - Execução de contrato',
    legal_obligation: 'LGPD Art. 7º, II - Obrigação legal',
    vital_interests: 'LGPD Art. 7º, IX - Proteção da vida ou segurança física',
    public_interest: 'LGPD Art. 7º, III - Administração pública',
    legitimate_interests: 'LGPD Art. 7º, IX - Legítimo interesse',
  };

  return legalBases[basis] || 'LGPD Art. 7º';
};

export const _formatComplianceScore = (score: number): string => {
  if (score >= 95) return 'Excelente';
  if (score >= 80) return 'Bom';
  if (score >= 60) return 'Regular';
  if (score >= 40) return 'Ruim';
  return 'Crítico';
};

// React hooks for easy integration
export const _useLGPDCompliance = () => {
  // This would typically use React context for LGPD compliance state
  // For now, it's a placeholder for future React hook implementation
  return {
    isCompliant: true,
    complianceScore: 95,
    lastAudit: new Date(),
    validateConsent: async (patientId: string, purpose: string) => {
      // Implementation would call the actual consent service
      return {
        isValid: true,
        purpose,
        patientId,
        isExplicit: true,
        legalBasis: 'consent',
      };
    },
    minimizeData: async (data: any, _level: string) => {
      // Implementation would call the actual minimization service
      return data;
    },
  };
};

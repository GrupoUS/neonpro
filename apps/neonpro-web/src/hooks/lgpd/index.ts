// LGPD Hooks - Sistema de Conformidade LGPD
// Hooks para gerenciamento de dados pessoais e conformidade

// Dashboard e métricas
export { useLGPDDashboard } from './useLGPDDashboard';

// Gerenciamento de consentimentos
export { useConsentManagement } from './useConsentManagement';
export { useConsentBanner } from './useConsentBanner';

// Direitos dos titulares
export { useDataSubjectRights } from './useDataSubjectRights';

// Avaliações de conformidade
export { useComplianceAssessment } from './useComplianceAssessment';

// Gestão de incidentes
export { useBreachManagement } from './useBreachManagement';

// Trilha de auditoria
export { useAuditTrail } from './useAuditTrail';

// Re-export tipos relacionados
export type {
  LGPDMetrics,
  ConsentRecord,
  ConsentPurpose,
  DataSubjectRequest,
  ComplianceAssessment,
  SecurityBreach,
  AuditEvent
} from '@/types/lgpd';

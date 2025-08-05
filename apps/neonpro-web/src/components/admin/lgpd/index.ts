// Componentes LGPD para administração

// Re-exportar tipos relacionados
export type {
  AuditEvent,
  BreachIncident,
  ComplianceAssessment,
  ConsentRecord,
  DataSubjectRequest,
  LGPDMetrics,
} from "@/types/lgpd";
export { AuditTrailPanel } from "./AuditTrailPanel";
export { BreachManagementPanel } from "./BreachManagementPanel";
export { ComplianceAssessmentPanel } from "./ComplianceAssessmentPanel";
export { ConsentManagementPanel } from "./ConsentManagementPanel";
export { DataSubjectRightsPanel } from "./DataSubjectRightsPanel";
export { LGPDDashboard } from "./LGPDDashboard";

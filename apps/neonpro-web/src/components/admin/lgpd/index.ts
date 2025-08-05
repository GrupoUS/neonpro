// Componentes LGPD para administração
export { LGPDDashboard } from "./LGPDDashboard";
export { ConsentManagementPanel } from "./ConsentManagementPanel";
export { DataSubjectRightsPanel } from "./DataSubjectRightsPanel";
export { ComplianceAssessmentPanel } from "./ComplianceAssessmentPanel";
export { BreachManagementPanel } from "./BreachManagementPanel";
export { AuditTrailPanel } from "./AuditTrailPanel";

// Re-exportar tipos relacionados
export type {
  LGPDMetrics,
  ConsentRecord,
  DataSubjectRequest,
  BreachIncident,
  AuditEvent,
  ComplianceAssessment,
} from "@/types/lgpd";

/**
 * Brazilian Healthcare UI Theme
 * Consolidated from @neonpro/brazilian-healthcare-ui package
 * LGPD compliant, accessibility-focused healthcare components
 */

// Re-export components from the consolidated structure
export { EmergencyAccessInterface } from "./components/emergency-access";
export { DataClassificationBadge, LGPDComplianceDashboard } from "./components/lgpd-compliance";
export { ResponsiveLayout } from "./components/responsive-layout";

// Design System
export { brazilianHealthcareTheme, colors, spacing, typography } from "./theme";
export type { BrazilianHealthcareTheme } from "./theme";

// Types
export type {
  AccessibilityOptions,
  Address,
  AuditEvent,
  ConnectivityLevel,
  EmergencyAlert,
  EmergencyContact,
  HealthcareProfessional,
  LGPDCompliance,
  LGPDConsent,
  MedicalAttachment,
  MedicalRecord,
  Medication,
  PatientInfo,
  RegionalSettings,
} from "./types";

// Theme configuration for Brazilian healthcare
export const BRAZILIAN_HEALTHCARE_CONFIG = {
  name: "Brazilian Healthcare UI",
  version: "2.0.0",
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
  },
  accessibility: {
    wcag: "2.1 AA+",
    screenReader: true,
    highContrast: true,
    emergencyMode: true,
  },
  localization: {
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
  },
} as const;

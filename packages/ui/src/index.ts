// packages/ui/src/index.ts - NeonPro Healthcare UI Components
export * from "./components/ui/accessibility-monitor";
export * from "./components/ui/alert";
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/contrast-validator";
export * from "./components/ui/dialog";
export * from "./components/ui/form";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/loading-spinner";
export * from "./components/ui/progress";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/skeleton";
export * from "./components/ui/skip-link";
export * from "./components/ui/switch";
export * from "./components/ui/table";
export * from "./components/ui/tabs";
export * from "./components/ui/textarea";
export * from "./components/ui/visually-hidden";

// Constants exports
export * from "./constants";
// Hooks exports
export * from "./hooks/use-debounce";
export * from "./hooks/use-mobile";
export * from "./hooks/use-permissions";
export * from "./hooks/use-toast";
export * from "./hooks/use-translation";
export * from "./hooks/useLayout";
// Domain-facing alias for healthcare permissions
export { usePermissions as useHealthcarePermissions } from "./hooks/use-permissions";
// Layout exports
export * from "./layouts";
// Utils exports
export * from "./utils";
// Type exports
export * from "./types";

// Theme exports - TweakCN NEONPRO Healthcare Theme System
export * from "./themes/neonpro";
export * from "./themes/neonpro/components";

// Brazilian Healthcare Theme - Consolidated from @neonpro/brazilian-healthcare-ui
// Note: Selective exports to avoid type conflicts
export {
  brazilianHealthcareTheme,
  colors,
  DataClassificationBadge,
  EmergencyAccessInterface,
  LGPDComplianceDashboard,
  ResponsiveLayout,
  spacing,
  typography,
} from "./themes/brazilian-healthcare";

export type {
  AccessibilityOptions,
  Address,
  AuditEvent,
  BrazilianHealthcareTheme,
  ConnectivityLevel,
  EmergencyAlert,
  HealthcareProfessional,
  LGPDCompliance,
  LGPDConsent,
  MedicalAttachment,
} from "./themes/brazilian-healthcare";

// Aliased exports to avoid conflicts with main types
export type {
  EmergencyContact as BrazilianEmergencyContact,
  MedicalRecord as BrazilianMedicalRecord,
} from "./themes/brazilian-healthcare";

// Health Dashboard Components - Consolidated from @neonpro/health-dashboard
export * from "./components/dashboard/health/cache-metrics";
export * from "./components/dashboard/health/dashboard";
export * from "./components/dashboard/health/metric-widgets";

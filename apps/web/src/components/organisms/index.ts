/**
 * Organisms - Complex components made of molecules and atoms
 * These are the most complex components that form distinct sections of the interface
 */

// AI Chat Organism
export { default as AIChatContainer } from "./ai-chat-container";

// Governance Organisms
export * from "./governance/GovernanceDashboard";
export * from "./governance/AIGovernanceMetrics";
export * from "./governance/AuditTrailTable";
export * from "./governance/ComplianceStatusPanel";
export * from "./governance/EscalationWorkflowStatus";
export * from "./governance/KPIOverviewCards";
export * from "./governance/PolicyManagementPanel";
export * from "./governance/RiskAssessmentTable";

// Re-export from ui directory for backward compatibility
export * from "../ui/aceternity-neonpro-sidebar";
export * from "../ui/aceternity-sidebar";
/**
 * Organisms - Complex components made of molecules and atoms
 * These are the most complex components that form distinct sections of the interface
 */

// AI Chat Organism
export { default as AIChatContainer } from './ai-chat-container';
export { default as NotificationCard } from './NotificationCard';

// Governance Organisms
export * from './governance/AIGovernanceMetrics';
export * from './governance/AuditTrailTable';
export * from './governance/ComplianceStatusPanel';
export * from './governance/EscalationWorkflowStatus';
export * from './governance/GovernanceDashboard';
export * from './governance/KPIOverviewCards';
export * from './governance/PolicyManagementPanel';
export * from './governance/RiskAssessmentTable';

// Re-export from ui directory for backward compatibility
// Note: Sidebar components removed during cleanup - use main sidebar from __root.tsx

/**
 * @fileoverview NeonPro Healthcare Deployment Automation
 * @description Consolidated automation infrastructure with Trigger.dev
 * @version 1.0.0
 * @compliance LGPD + ANVISA + CFM Healthcare Standards
 */

// Trigger.dev client and configuration
export * from "./trigger-client";

// Healthcare job implementations
export * from "./jobs/appointment-emails";
export * from "./jobs/billing-emails";

/**
 * Healthcare Deployment Automation Configuration
 */
export const HEALTHCARE_AUTOMATION_CONFIG = {
  name: "neonpro-clinic-automation",
  description:
    "Healthcare deployment automation with constitutional compliance",

  // Healthcare compliance requirements
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    dataRetention: "7-years",
    auditTrail: true,
  },

  // Automation categories for healthcare operations
  categories: {
    patient: "Patient communication and engagement",
    billing: "Financial operations and invoicing",
    compliance: "Regulatory compliance automation",
    monitoring: "System health and performance",
    backup: "Data backup and disaster recovery",
  },

  // Performance SLAs for healthcare operations
  sla: {
    criticalJobs: "≤30s",
    standardJobs: "≤2m",
    reportJobs: "≤5m",
    backupJobs: "≤15m",
  },
} as const;

export type HealthcareAutomationConfig = typeof HEALTHCARE_AUTOMATION_CONFIG;

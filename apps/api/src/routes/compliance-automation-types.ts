import { z } from "zod";
import { COMPLIANCE_AREAS } from "./compliance-automation-constants";

// Zod schemas
export const complianceAutomationSchema = z.object({
  anvisa_automation: z.boolean().default(true),
  cfm_automation: z.boolean().default(true),
  compliance_areas: z.array(z.enum(COMPLIANCE_AREAS)).default(["all"]),
  immediate_execution: z.boolean().default(true),
  lgpd_automation: z.boolean().default(true),
  tenant_id: z.string(),
  user_id: z.string(),
});

export const complianceReportSchema = z.object({
  end_date: z.string().optional(),
  period_days: z.number().default(30),
  report_type: z.enum(["detailed", "summary", "executive"]).default("detailed"),
  start_date: z.string().optional(),
  tenant_id: z.string(),
});

export const complianceMonitoringSchema = z.object({
  monitoring_active: z.boolean(),
  tenant_id: z.string(),
});

// Types
export type ComplianceAutomationRequest = z.infer<
  typeof complianceAutomationSchema
>;
export type ComplianceReportRequest = z.infer<typeof complianceReportSchema>;
export type ComplianceMonitoringRequest = z.infer<
  typeof complianceMonitoringSchema
>;

export {
  AnvisaDeviceClass,
  AnvisaService,
  AnvisaSoftwareClass,
  anvisaUtils,
  createAnvisaService,
} from "../services/anvisa-service";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function createAnvisaServices(_supabaseClient?: SupabaseClient) {
  // Async factory using dynamic import to avoid CommonJS require in ESM
  const { AnvisaService } = await import("../services/anvisa-service");
  return new AnvisaService();
}

export async function validateAnvisaCompliance(
  tenantId: string,
  services: {
    audit?: { hasRecentEntries?: (tenantId: string) => Promise<boolean> };
    storage?: { hasTemperatureLogs?: (tenantId: string) => Promise<boolean> };
    documents?: { hasRequiredDocs?: (tenantId: string) => Promise<boolean> };
  } | unknown,
) {
  try {
    const anvisa = await createAnvisaServices();

    // Use last 90 days for a practical compliance window
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 90);

    const report = await anvisa.generateComplianceReport({ startDate: start, endDate: now });

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Core checks
    if (!report.success || !report.report) {
      issues.push("Unable to generate ANVISA compliance report for the period");
      recommendations.push("Verify data sources and retry compliance report generation");
    } else {
      const r = report.report;
      if (r.complianceScore < 90) {
        issues.push("Compliance score below recommended threshold (< 90)");
        recommendations.push(...r.recommendations);
      }
      if (r.adverseEvents > 0) {
        recommendations.push("Review adverse event handling and reporting procedures");
      }
    }

    // Optional cross-service validations if provided
    const s = services as any;
    if (s?.documents?.hasRequiredDocs) {
      const hasDocs = await s.documents.hasRequiredDocs(tenantId);
      if (!hasDocs) {
        issues.push("Missing required ANVISA regulatory documentation");
        recommendations.push("Upload and maintain required ANVISA documents");
      }
    }
    if (s?.storage?.hasTemperatureLogs) {
      const hasLogs = await s.storage.hasTemperatureLogs(tenantId);
      if (!hasLogs) {
        issues.push("No storage/temperature control logs detected");
        recommendations.push("Implement temperature monitoring and retain logs for audits");
      }
    }
    if (s?.audit?.hasRecentEntries) {
      const hasAudit = await s.audit.hasRecentEntries(tenantId);
      if (!hasAudit) {
        issues.push("Audit trail missing or outdated");
        recommendations.push("Enable comprehensive audit logging for ANVISA-relevant actions");
      }
    }

    const baseScore = report.success && report.report ? report.report.complianceScore : 70;
    const penalty = Math.min(30, issues.length * 5);
    const score = Math.max(0, Math.min(100, baseScore - penalty));

    return {
      compliant: score >= 90 && issues.length === 0,
      score,
      issues,
      recommendations,
    } as const;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("ANVISA validation error", err);
    return {
      compliant: false,
      score: 0,
      issues: ["ANVISA validation failed: unexpected error"] as string[],
      recommendations: [
        "Retry validation and verify data sources",
        "Enable audit logging and documentation checks",
      ] as string[],
    } as const;
  }
}

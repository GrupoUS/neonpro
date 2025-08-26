import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock SecurityMetrics type - Complete interface
export interface SecurityMetrics {
  id: number;
  threat_level: "low" | "medium" | "high" | "critical";
  unresolved_alerts: number;
  active_sessions: number;
  high_risk_sessions: number;
  security_events_24h: number;
  failed_attempts_24h: number;
  compliance_score: number;
  avg_response_time_minutes: number;
  critical_alerts: number;
  pending_requests: number;
  requires_attention: number;
  assessed_at: string;
  overall_score: number;
  overall_status: string;
  lgpd_score: number;
  anvisa_score: number;
  cfm_score: number;
  // Legacy compatibility
  activeThreats: number;
  securityScore: number;
  lastScan: string;
  vulnerabilities: number;
}

// Mock compliance hooks
export const useComplianceScore = () => ({
  overall_score: 85,
  overall_status: "compliant",
  lgpd_score: 90,
  anvisa_score: 80,
  cfm_score: 88,
  critical_alerts: 2,
  pending_requests: 5,
  requires_attention: 3,
  assessed_at: new Date().toISOString(),
});

export const useComplianceAlerts = () => [
  {
    id: 1,
    severity: "high" as const,
    alert_type: "lgpd_violation",
    created_at: new Date().toISOString(),
    description: "Mock alert for testing",
    affected_systems: ["web", "api"],
  },
];

export const useComplianceReports = () => ({
  generateReport: (_type: string, _filters: any) => Promise.resolve(),
  scheduleReport: (_type: string, _schedule: any) => Promise.resolve(),
  downloadReport: (_reportId: string, _format: string) => Promise.resolve(),
  deleteReport: (_reportId: string) => Promise.resolve(),
});

export const useRealTimeCompliance = () => ({
  connectToComplianceStream: () => {},
  disconnectFromComplianceStream: () => {},
});

// Legacy shim for imports from "../lib/utils" and variants
// Re-export existing utils for backward compatibility
export * from "../utils";
export { cn } from "../utils/cn";

// Typed shims to satisfy legacy imports used by dashboards/components
// These are minimal no-op implementations and types used around the app.
// TODO: Replace with real implementations when backend wiring is ready.

// Security metrics shape used by security dashboards
export interface SecurityMetrics {
  threat_level: "low" | "medium" | "high" | "critical";
  unresolved_alerts: number;
  active_sessions: number;
  high_risk_sessions: number;
  security_events_24h: number;
  failed_attempts_24h: number;
  compliance_score: number; // 0-100
  avg_response_time_minutes: number;
}

// Compliance score and alerts used by compliance dashboard
export interface ComplianceStatus {
  overall_score: number;
  overall_status: string;
  lgpd_score: number;
  anvisa_score: number;
  cfm_score: number;
  critical_alerts: number;
  pending_requests: number;
  requires_attention: boolean;
  assessed_at: string; // ISO date
}

export interface ComplianceAlert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  created_at: string; // ISO date
  affected_systems: string[];
}

// Minimal stubbed hooks for UI-only rendering and tests
export function useComplianceScore(): ComplianceStatus {
  return {
    overall_score: 92,
    overall_status: "active",
    lgpd_score: 94,
    anvisa_score: 90,
    cfm_score: 91,
    critical_alerts: 0,
    pending_requests: 2,
    requires_attention: false,
    assessed_at: new Date().toISOString(),
  };
}

export function useComplianceAlerts(): ComplianceAlert[] {
  return [];
}

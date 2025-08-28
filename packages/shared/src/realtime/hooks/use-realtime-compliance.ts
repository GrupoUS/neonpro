import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getRealtimeManager } from "../connection-manager";

// Types for compliance monitoring
export interface ComplianceLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  clinic_id: string;
  timestamp: string;
}

export interface RealtimeCompliancePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  complianceType: keyof ComplianceEventType;
  new?: ComplianceLog;
  old?: ComplianceLog;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresAction: boolean;
}

export interface ComplianceEventType {
  LGPD_DATA_ACCESS: string;
  LGPD_CONSENT_GRANTED: string;
  LGPD_CONSENT_REVOKED: string;
  LGPD_DATA_DELETION: string;
  ANVISA_COMPLIANCE_CHECK: string;
  ANVISA_VIOLATION: string;
  DATA_BREACH_DETECTED: string;
  UNAUTHORIZED_ACCESS: string;
}

export interface UseRealtimeComplianceOptions {
  tenantId: string;
  complianceType?: keyof ComplianceEventType | "ALL";
  enabled?: boolean;
  enableAuditLog?: boolean;
  onComplianceEvent?: (payload: RealtimeCompliancePayload) => void;
  onCriticalViolation?: (payload: RealtimeCompliancePayload) => void;
  onError?: (error: Error) => void;
}

export interface UseRealtimeComplianceReturn {
  isConnected: boolean;
  connectionHealth: number;
  totalEvents: number;
  criticalEvents: number;
  lastEvent: ComplianceLog | null;
  complianceScore: number;
  subscribe: () => void;
  unsubscribe: () => void;
  generateComplianceReport: () => Promise<unknown>;
  triggerManualAudit: () => void;
}

/**
 * Real-time Compliance Hook
 * Sistema crítico para monitoramento LGPD e ANVISA em healthcare brasileiro
 */
export function useRealtimeCompliance(
  options: UseRealtimeComplianceOptions,
): UseRealtimeComplianceReturn {
  const {
    tenantId,
    complianceType,
    enabled = true,
    enableAuditLog = true,
    onComplianceEvent,
    onCriticalViolation,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [criticalEvents, setCriticalEvents] = useState(0);
  const [lastEvent, setLastEvent] = useState<ComplianceLog | null>(null);
  const [complianceScore, setComplianceScore] = useState(100);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  /**
   * Determine compliance type based on payload
   */
  const determineComplianceType = useCallback(
    (payload: unknown): keyof ComplianceEventType => {
      const typedPayload = payload as any;
      const eventData = typedPayload.new || typedPayload.old;

      if (!eventData) {
        return "LGPD_DATA_ACCESS";
      }

      // Map based on action categories
      if (eventData.action?.includes("consent")) {
        return eventData.action === "consent_granted"
          ? "LGPD_CONSENT_GRANTED"
          : "LGPD_CONSENT_REVOKED";
      }

      if (
        eventData.action?.includes("deletion") ||
        eventData.action?.includes("delete")
      ) {
        return "LGPD_DATA_DELETION";
      }

      if (eventData.action?.includes("anvisa")) {
        const metadata = (eventData.metadata as Record<string, unknown>) || {};
        if (metadata.severity === "CRITICAL") {
          return "ANVISA_VIOLATION";
        }
        return "ANVISA_COMPLIANCE_CHECK";
      }

      if (
        eventData.action?.includes("breach") ||
        eventData.action?.includes("vazamento")
      ) {
        return "DATA_BREACH_DETECTED";
      }

      if (
        eventData.action?.includes("unauthorized") ||
        eventData.action?.includes("nao_autorizado")
      ) {
        return "UNAUTHORIZED_ACCESS";
      }

      return "LGPD_DATA_ACCESS";
    },
    [],
  );

  /**
   * Determine severity level based on compliance event
   */
  const determineSeverity = useCallback(
    (payload: unknown): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" => {
      const typedPayload = payload as any;
      const eventData = typedPayload.new || typedPayload.old;
      const { eventType: eventType } = typedPayload;

      // Critical severity scenarios
      if (
        eventData?.action?.includes("breach") ||
        eventData?.action?.includes("unauthorized") ||
        eventData?.action?.includes("violation") ||
        eventData?.action?.includes("vazamento") ||
        eventData?.action?.includes("nao_autorizado")
      ) {
        return "CRITICAL";
      }

      // High severity scenarios
      if (
        eventType === "DELETE" ||
        eventData?.action?.includes("consent_revoked") ||
        eventData?.action?.includes("data_deletion") ||
        eventData?.action?.includes("anvisa_violation")
      ) {
        return "HIGH";
      }

      // Medium severity scenarios
      if (
        eventData?.action?.includes("consent_granted") ||
        eventData?.action?.includes("data_export") ||
        eventData?.action?.includes("anvisa_compliance_check")
      ) {
        return "MEDIUM";
      }

      return "LOW";
    },
    [],
  );

  // Helper functions for compliance processing
  const generateAuditEntry = useCallback(
    (payload: RealtimeCompliancePayload): ComplianceLog => {
      return {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        clinic_id: tenantId,
        action: `${payload.complianceType}_${payload.eventType}`,
        user_id: "system",
        resource_type: "compliance_audit",
        resource_id: payload.new?.id || payload.old?.id || null,
        metadata: {
          compliance_type: payload.complianceType,
          severity: payload.severity,
          requires_action: payload.requiresAction,
          event_type: payload.eventType,
        },
        ip_address: "127.0.0.1",
        user_agent: "NeonPro-Compliance-System",
        timestamp: new Date().toISOString(),
      };
    },
    [tenantId],
  );

  const updateComplianceCache = useCallback(
    (payload: RealtimeCompliancePayload) => {
      const { eventType, new: newData, old: oldData } = payload;

      // Update compliance logs cache
      queryClient.setQueryData(
        ["compliance-logs", tenantId],
        (oldCache: ComplianceLog[] | null) => {
          if (!oldCache) {
            return oldCache;
          }

          switch (eventType) {
            case "INSERT": {
              if (newData && newData.clinic_id === tenantId) {
                return [newData, ...oldCache].slice(0, 1000); // Keep only last 1000 events
              }
              return oldCache;
            }

            case "UPDATE": {
              if (newData) {
                return oldCache.map((log) =>
                  log.id === newData.id ? newData : log,
                );
              }
              return oldCache;
            }

            case "DELETE": {
              if (oldData) {
                return oldCache.filter((log) => log.id !== oldData.id);
              }
              return oldCache;
            }

            default: {
              return oldCache;
            }
          }
        },
      );

      // Update compliance statistics
      queryClient.invalidateQueries({
        queryKey: ["compliance-stats", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["compliance-score", tenantId],
      });
      queryClient.invalidateQueries({ queryKey: ["audit-trail", tenantId] });
    },
    [queryClient, tenantId],
  );

  const updateComplianceScore = useCallback(
    (payload: RealtimeCompliancePayload) => {
      const { severity, complianceType } = payload;

      setComplianceScore((prev) => {
        let scoreDelta = 0;

        // Score penalties based on severity
        switch (severity) {
          case "CRITICAL": {
            scoreDelta = -15; // Major penalty for critical issues
            break;
          }
          case "HIGH": {
            scoreDelta = -8;
            break;
          }
          case "MEDIUM": {
            scoreDelta = -3;
            break;
          }
          case "LOW": {
            scoreDelta = -1;
            break;
          }
        }

        // Additional penalties for specific violations
        if (complianceType === "DATA_BREACH_DETECTED") {
          scoreDelta -= 20;
        }
        if (complianceType === "UNAUTHORIZED_ACCESS") {
          scoreDelta -= 10;
        }

        // Positive adjustments for good compliance actions
        if (complianceType === "LGPD_CONSENT_GRANTED") {
          scoreDelta = 1; // Small positive for consent
        }

        // Ensure score stays within bounds
        const newScore = Math.max(0, Math.min(100, prev + scoreDelta));

        return newScore;
      });
    },
    [],
  );

  /**
   * Handle realtime compliance changes
   */
  const handleComplianceChange = useCallback(
    (payload: unknown) => {
      try {
        // Determine compliance type and severity
        const complianceType = determineComplianceType(payload);
        const severity = determineSeverity(payload);
        const requiresAction = severity === "HIGH" || severity === "CRITICAL";

        const typedPayload = payload as any;
        const realtimePayload: RealtimeCompliancePayload = {
          eventType: typedPayload.eventType,
          complianceType,
          new: typedPayload.new as ComplianceLog,
          old: typedPayload.old as ComplianceLog,
          severity,
          requiresAction,
        };

        // Update metrics
        setTotalEvents((prev) => prev + 1);
        setLastEvent(realtimePayload.new || realtimePayload.old || null);

        if (severity === "CRITICAL" || severity === "HIGH") {
          setCriticalEvents((prev) => prev + 1);
          if (onCriticalViolation) {
            onCriticalViolation(realtimePayload);
          }
        }

        // Update compliance score
        updateComplianceScore(realtimePayload);

        // Generate audit log if enabled
        if (enableAuditLog) {
          generateAuditEntry(realtimePayload);
        }

        // Update TanStack Query cache
        updateComplianceCache(realtimePayload);

        // Call user-provided handler
        if (onComplianceEvent) {
          onComplianceEvent(realtimePayload);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [
      onComplianceEvent,
      onCriticalViolation,
      onError,
      enableAuditLog,
      determineComplianceType,
      determineSeverity,
      generateAuditEntry,
      updateComplianceCache,
      updateComplianceScore,
    ],
  );

  /**
   * Subscribe to realtime compliance updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) {
      return;
    }

    const realtimeManager = getRealtimeManager();

    let filter = `clinic_id=eq.${tenantId}`;
    if (complianceType && complianceType !== "ALL") {
      filter += `,action=like.%${complianceType.toLowerCase()}%`;
    }

    const unsubscribe = realtimeManager.subscribe(
      `compliance:${filter}`,
      {
        table: "compliance_audit_logs",
        filter,
      },
      handleComplianceChange,
    );

    setUnsubscribeFn(() => unsubscribe);
    setIsConnected(true);
    setConnectionHealth(100);
  }, [
    enabled,
    tenantId,
    complianceType,
    unsubscribeFn,
    handleComplianceChange,
  ]);

  /**
   * Unsubscribe from realtime compliance updates
   */
  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
      setIsConnected(false);
      setConnectionHealth(0);
    }
  }, [unsubscribeFn]);

  /**
   * Generate compliance report
   */
  const generateComplianceReport = useCallback(async () => {
    // This would connect to the ML pipeline to generate compliance insights
    return {
      score: complianceScore,
      totalEvents,
      criticalEvents,
      recommendations: [],
      timeline: [],
    };
  }, [complianceScore, totalEvents, criticalEvents]);

  /**
   * Trigger manual audit
   */
  const triggerManualAudit = useCallback(() => {}, []);

  // Auto subscribe/unsubscribe
  useEffect(() => {
    if (enabled) {
      subscribe();
    } else {
      unsubscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [enabled, subscribe, unsubscribe]);

  return {
    // Connection status
    isConnected,
    connectionHealth,
    totalEvents,
    criticalEvents,
    lastEvent,
    complianceScore,

    // Actions
    subscribe,
    unsubscribe,
    generateComplianceReport,
    triggerManualAudit,
  };
}

/**
 * Enhanced React Hook para Real-time Compliance Updates
 * Monitoramento LGPD e ANVISA em tempo real para healthcare brasileiro
 * Sistema crítico para auditoria e compliance automático
 */

import type { Database } from '@neonpro/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { getRealtimeManager } from '../connection-manager';

type ComplianceLog = Database['public']['Tables']['compliance_logs']['Row'];
type DataProcessingLog =
  Database['public']['Tables']['data_processing_logs']['Row'];

export interface ComplianceEventType {
  LGPD_CONSENT_GRANTED: 'lgpd_consent_granted';
  LGPD_CONSENT_REVOKED: 'lgpd_consent_revoked';
  LGPD_DATA_ACCESS: 'lgpd_data_access';
  LGPD_DATA_DELETION: 'lgpd_data_deletion';
  ANVISA_AUDIT_START: 'anvisa_audit_start';
  ANVISA_COMPLIANCE_CHECK: 'anvisa_compliance_check';
  ANVISA_VIOLATION: 'anvisa_violation';
  DATA_BREACH_DETECTED: 'data_breach_detected';
  UNAUTHORIZED_ACCESS: 'unauthorized_access';
}

export interface RealtimeCompliancePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  complianceType: keyof ComplianceEventType;
  new?: ComplianceLog;
  old?: ComplianceLog;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresAction: boolean;
}

export interface UseRealtimeComplianceOptions {
  tenantId: string;
  complianceType?: keyof ComplianceEventType;
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
  complianceScore: number; // 0-100
  subscribe: () => void;
  unsubscribe: () => void;
  generateComplianceReport: () => Promise<any>;
  triggerManualAudit: () => void;
} /**
 * MANDATORY Real-time Compliance Hook
 * Sistema crítico para monitoramento LGPD e ANVISA em healthcare brasileiro
 */
export function useRealtimeCompliance(
  options: UseRealtimeComplianceOptions
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
   * Handle realtime compliance changes
   */
  const handleComplianceChange = useCallback(
    (payload: any) => {
      try {
        // Determine compliance type and severity
        const complianceType = determineComplianceType(payload);
        const severity = determineSeverity(payload);
        const requiresAction = severity === 'HIGH' || severity === 'CRITICAL';

        const realtimePayload: RealtimeCompliancePayload = {
          eventType: payload.eventType,
          complianceType,
          new: payload.new as ComplianceLog,
          old: payload.old as ComplianceLog,
          severity,
          requiresAction,
        };

        // Update metrics
        setTotalEvents((prev) => prev + 1);
        setLastEvent(realtimePayload.new || null);

        // Track critical events
        if (severity === 'CRITICAL') {
          setCriticalEvents((prev) => prev + 1);

          // Trigger critical violation callback
          if (onCriticalViolation) {
            onCriticalViolation(realtimePayload);
          }
        }

        // Update compliance score
        updateComplianceScore(realtimePayload);

        // Update TanStack Query cache
        updateComplianceCache(realtimePayload);

        // Generate audit log if enabled
        if (enableAuditLog) {
          generateAuditEntry(realtimePayload);
        }

        // Call user callback
        if (onComplianceEvent) {
          onComplianceEvent(realtimePayload);
        }

        // Critical logging for compliance audit
        console.log(
          `[RealtimeCompliance] ${complianceType} ${severity} event:`,
          {
            eventId: realtimePayload.new?.id || 'unknown',
            complianceType,
            severity,
            requiresAction,
            tenantId,
            timestamp: new Date().toISOString(),
          }
        );
      } catch (error) {
        console.error('[RealtimeCompliance] Payload processing error:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [onComplianceEvent, onCriticalViolation, onError, tenantId, enableAuditLog]
  ); /**
   * Determine compliance type based on payload
   */
  const determineComplianceType = useCallback(
    (payload: any): keyof ComplianceEventType => {
      const eventData = payload.new || payload.old;

      if (!eventData) return 'LGPD_DATA_ACCESS';

      // Map based on event categories
      if (eventData.event_type?.includes('consent')) {
        return eventData.action === 'granted'
          ? 'LGPD_CONSENT_GRANTED'
          : 'LGPD_CONSENT_REVOKED';
      }

      if (eventData.event_type?.includes('data_deletion')) {
        return 'LGPD_DATA_DELETION';
      }

      if (eventData.event_type?.includes('anvisa')) {
        if (eventData.severity === 'CRITICAL') return 'ANVISA_VIOLATION';
        return 'ANVISA_COMPLIANCE_CHECK';
      }

      if (eventData.event_type?.includes('breach')) {
        return 'DATA_BREACH_DETECTED';
      }

      if (eventData.event_type?.includes('unauthorized')) {
        return 'UNAUTHORIZED_ACCESS';
      }

      return 'LGPD_DATA_ACCESS';
    },
    []
  );

  /**
   * Determine severity level based on compliance event
   */
  const determineSeverity = useCallback(
    (payload: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
      const eventData = payload.new || payload.old;
      const eventType = payload.eventType;

      // Critical severity scenarios
      if (
        eventData?.event_type?.includes('breach') ||
        eventData?.event_type?.includes('unauthorized') ||
        eventData?.event_type?.includes('violation')
      ) {
        return 'CRITICAL';
      }

      // High severity for consent revocations and deletions
      if (
        eventType === 'DELETE' ||
        eventData?.event_type?.includes('consent_revoked')
      ) {
        return 'HIGH';
      }

      // Medium severity for ANVISA compliance checks
      if (eventData?.event_type?.includes('anvisa')) {
        return 'MEDIUM';
      }

      // Low severity for routine LGPD access logs
      return 'LOW';
    },
    []
  );

  /**
   * Update compliance score based on events
   */
  const updateComplianceScore = useCallback(
    (payload: RealtimeCompliancePayload) => {
      const { severity, complianceType } = payload;

      setComplianceScore((prev) => {
        let scoreDelta = 0;

        // Score penalties based on severity
        switch (severity) {
          case 'CRITICAL':
            scoreDelta = -15; // Major penalty for critical issues
            break;
          case 'HIGH':
            scoreDelta = -8;
            break;
          case 'MEDIUM':
            scoreDelta = -3;
            break;
          case 'LOW':
            scoreDelta = -1;
            break;
        }

        // Additional penalties for specific violations
        if (complianceType === 'DATA_BREACH_DETECTED') {
          scoreDelta -= 20;
        }
        if (complianceType === 'UNAUTHORIZED_ACCESS') {
          scoreDelta -= 10;
        }

        // Positive adjustments for good compliance actions
        if (complianceType === 'LGPD_CONSENT_GRANTED') {
          scoreDelta = 1; // Small positive for consent
        }

        // Ensure score stays within bounds
        const newScore = Math.max(0, Math.min(100, prev + scoreDelta));

        return newScore;
      });
    },
    []
  ); /**
   * Update TanStack Query cache para compliance
   */
  const updateComplianceCache = useCallback(
    (payload: RealtimeCompliancePayload) => {
      const { eventType, new: newData, old: oldData } = payload;

      // Update compliance logs cache
      queryClient.setQueryData(
        ['compliance-logs', tenantId],
        (oldCache: ComplianceLog[] | undefined) => {
          if (!oldCache) return oldCache;

          switch (eventType) {
            case 'INSERT':
              if (newData && newData.tenant_id === tenantId) {
                return [newData, ...oldCache].slice(0, 1000); // Keep only last 1000 events
              }
              return oldCache;

            case 'UPDATE':
              if (newData) {
                return oldCache.map((log) =>
                  log.id === newData.id ? newData : log
                );
              }
              return oldCache;

            case 'DELETE':
              if (oldData) {
                return oldCache.filter((log) => log.id !== oldData.id);
              }
              return oldCache;

            default:
              return oldCache;
          }
        }
      );

      // Update compliance statistics
      queryClient.invalidateQueries(['compliance-stats', tenantId]);
      queryClient.invalidateQueries(['compliance-score', tenantId]);
      queryClient.invalidateQueries(['audit-trail', tenantId]);
    },
    [queryClient, tenantId]
  );

  /**
   * Generate audit entry for compliance event
   */
  const generateAuditEntry = useCallback(
    (payload: RealtimeCompliancePayload) => {
      const auditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenant_id: tenantId,
        event_type: payload.complianceType,
        severity: payload.severity,
        requires_action: payload.requiresAction,
        payload_data: JSON.stringify(payload),
        created_at: new Date().toISOString(),
        processed: false,
      };

      // Add to audit cache
      queryClient.setQueryData(
        ['audit-trail', tenantId],
        (oldCache: any[] | undefined) => {
          if (!oldCache) return [auditEntry];
          return [auditEntry, ...oldCache].slice(0, 5000); // Keep audit trail manageable
        }
      );

      // Log critical events to console for immediate visibility
      if (payload.severity === 'CRITICAL') {
        console.warn('[CRITICAL COMPLIANCE EVENT]', auditEntry);
      }
    },
    [queryClient, tenantId]
  );

  /**
   * Subscribe to realtime compliance updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) return;

    const realtimeManager = getRealtimeManager();

    // Build filter for tenant-specific compliance logs
    let filter = `tenant_id=eq.${tenantId}`;
    if (complianceType) {
      filter += `,event_type=like.%${complianceType}%`;
    }

    const unsubscribe = realtimeManager.subscribe(
      `compliance-logs:${filter}`,
      {
        event: 'postgres_changes',
        schema: 'public',
        table: 'compliance_logs',
        filter,
      },
      handleComplianceChange
    );

    setUnsubscribeFn(() => unsubscribe);
  }, [
    enabled,
    tenantId,
    complianceType,
    handleComplianceChange,
    unsubscribeFn,
  ]); /**
   * Unsubscribe from realtime compliance updates
   */
  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
    }
  }, [unsubscribeFn]);

  /**
   * Generate compliance report
   */
  const generateComplianceReport = useCallback(async (): Promise<any> => {
    try {
      const logs =
        (queryClient.getQueryData([
          'compliance-logs',
          tenantId,
        ]) as ComplianceLog[]) || [];
      const auditTrail =
        (queryClient.getQueryData(['audit-trail', tenantId]) as any[]) || [];

      // Analyze compliance data
      const report = {
        generatedAt: new Date().toISOString(),
        tenantId,
        period: {
          start: logs[logs.length - 1]?.created_at || new Date().toISOString(),
          end: new Date().toISOString(),
        },
        summary: {
          totalEvents,
          criticalEvents,
          complianceScore,
          lastEventDate: lastEvent?.created_at,
        },
        eventBreakdown: {
          lgpdEvents: logs.filter((log) => log.event_type?.includes('lgpd'))
            .length,
          anvisaEvents: logs.filter((log) => log.event_type?.includes('anvisa'))
            .length,
          breachEvents: logs.filter((log) => log.event_type?.includes('breach'))
            .length,
          unauthorizedAccess: logs.filter((log) =>
            log.event_type?.includes('unauthorized')
          ).length,
        },
        severityBreakdown: {
          critical: logs.filter((log) => log.severity === 'CRITICAL').length,
          high: logs.filter((log) => log.severity === 'HIGH').length,
          medium: logs.filter((log) => log.severity === 'MEDIUM').length,
          low: logs.filter((log) => log.severity === 'LOW').length,
        },
        actionableItems: auditTrail.filter(
          (item) => item.requires_action && !item.processed
        ),
        recommendations: generateRecommendations(logs, complianceScore),
      };

      return report;
    } catch (error) {
      console.error('[RealtimeCompliance] Report generation error:', error);
      throw error;
    }
  }, [
    queryClient,
    tenantId,
    totalEvents,
    criticalEvents,
    complianceScore,
    lastEvent,
  ]);

  /**
   * Generate compliance recommendations
   */
  const generateRecommendations = useCallback(
    (logs: ComplianceLog[], score: number): string[] => {
      const recommendations: string[] = [];

      if (score < 50) {
        recommendations.push(
          'URGENTE: Score de compliance crítico. Implementar ações corretivas imediatas.'
        );
      } else if (score < 70) {
        recommendations.push(
          'Score de compliance baixo. Revisar processos de segurança.'
        );
      }

      const criticalCount = logs.filter(
        (log) => log.severity === 'CRITICAL'
      ).length;
      if (criticalCount > 0) {
        recommendations.push(
          `${criticalCount} eventos críticos detectados. Investigação imediata necessária.`
        );
      }

      const breachCount = logs.filter((log) =>
        log.event_type?.includes('breach')
      ).length;
      if (breachCount > 0) {
        recommendations.push(
          'Vazamentos de dados detectados. Notificar ANPD conforme LGPD Art. 48.'
        );
      }

      const unauthorizedCount = logs.filter((log) =>
        log.event_type?.includes('unauthorized')
      ).length;
      if (unauthorizedCount > 5) {
        recommendations.push(
          'Múltiplos acessos não autorizados. Revisar controles de segurança.'
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          'Compliance em bom estado. Manter monitoramento contínuo.'
        );
      }

      return recommendations;
    },
    []
  );

  /**
   * Trigger manual audit
   */
  const triggerManualAudit = useCallback(() => {
    const auditEvent = {
      id: `manual_audit_${Date.now()}`,
      tenant_id: tenantId,
      event_type: 'manual_audit_triggered',
      severity: 'MEDIUM' as const,
      metadata: {
        triggeredAt: new Date().toISOString(),
        triggeredBy: 'manual_request',
        complianceScore,
        totalEvents,
        criticalEvents,
      },
      created_at: new Date().toISOString(),
    };

    // Add manual audit to cache
    queryClient.setQueryData(
      ['compliance-logs', tenantId],
      (oldCache: ComplianceLog[] | undefined) => {
        if (!oldCache) return [auditEvent as ComplianceLog];
        return [auditEvent as ComplianceLog, ...oldCache];
      }
    );

    console.log('[RealtimeCompliance] Manual audit triggered:', auditEvent);
  }, [queryClient, tenantId, complianceScore, totalEvents, criticalEvents]); /**
   * Monitor connection status and auto-subscribe
   */
  useEffect(() => {
    if (!enabled) return;

    const realtimeManager = getRealtimeManager();

    const unsubscribeStatus = realtimeManager.onStatusChange((status) => {
      setIsConnected(status.isConnected);
      setConnectionHealth(status.healthScore);
    });

    // Auto-subscribe if enabled
    if (enabled) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [enabled, subscribe, unsubscribe]);

  return {
    isConnected,
    connectionHealth,
    totalEvents,
    criticalEvents,
    lastEvent,
    complianceScore,
    subscribe,
    unsubscribe,
    generateComplianceReport,
    triggerManualAudit,
  };
}

/**
 * Hook para compliance dashboard analytics
 * Fornece métricas agregadas para dashboards de compliance
 */
export function useComplianceAnalytics(tenantId: string) {
  const queryClient = useQueryClient();

  const getComplianceMetrics = useCallback(() => {
    const logs =
      (queryClient.getQueryData([
        'compliance-logs',
        tenantId,
      ]) as ComplianceLog[]) || [];

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(
      (log) => new Date(log.created_at) >= lastWeek
    );
    const monthlyLogs = logs.filter(
      (log) => new Date(log.created_at) >= lastMonth
    );

    return {
      weekly: {
        totalEvents: recentLogs.length,
        criticalEvents: recentLogs.filter((log) => log.severity === 'CRITICAL')
          .length,
        lgpdEvents: recentLogs.filter((log) => log.event_type?.includes('lgpd'))
          .length,
        anvisaEvents: recentLogs.filter((log) =>
          log.event_type?.includes('anvisa')
        ).length,
      },
      monthly: {
        totalEvents: monthlyLogs.length,
        criticalEvents: monthlyLogs.filter((log) => log.severity === 'CRITICAL')
          .length,
        trend: calculateTrend(monthlyLogs),
        avgDailyCritical:
          monthlyLogs.filter((log) => log.severity === 'CRITICAL').length / 30,
      },
      compliance: {
        lgpdCompliance: calculateLGPDCompliance(logs),
        anvisaCompliance: calculateANVISACompliance(logs),
        overallScore: calculateOverallScore(logs),
      },
    };
  }, [queryClient, tenantId]);

  const calculateTrend = useCallback(
    (logs: ComplianceLog[]): 'improving' | 'stable' | 'declining' => {
      if (logs.length < 10) return 'stable';

      const half = Math.floor(logs.length / 2);
      const firstHalf = logs.slice(0, half);
      const secondHalf = logs.slice(half);

      const firstCritical = firstHalf.filter(
        (log) => log.severity === 'CRITICAL'
      ).length;
      const secondCritical = secondHalf.filter(
        (log) => log.severity === 'CRITICAL'
      ).length;

      if (secondCritical < firstCritical * 0.8) return 'improving';
      if (secondCritical > firstCritical * 1.2) return 'declining';
      return 'stable';
    },
    []
  );

  const calculateLGPDCompliance = useCallback(
    (logs: ComplianceLog[]): number => {
      const lgpdLogs = logs.filter((log) => log.event_type?.includes('lgpd'));
      if (lgpdLogs.length === 0) return 100;

      const violations = lgpdLogs.filter(
        (log) => log.severity === 'HIGH' || log.severity === 'CRITICAL'
      ).length;
      return Math.max(0, 100 - (violations / lgpdLogs.length) * 50);
    },
    []
  );

  const calculateANVISACompliance = useCallback(
    (logs: ComplianceLog[]): number => {
      const anvisaLogs = logs.filter((log) =>
        log.event_type?.includes('anvisa')
      );
      if (anvisaLogs.length === 0) return 100;

      const violations = anvisaLogs.filter(
        (log) => log.severity === 'HIGH' || log.severity === 'CRITICAL'
      ).length;
      return Math.max(0, 100 - (violations / anvisaLogs.length) * 60);
    },
    []
  );

  const calculateOverallScore = useCallback((logs: ComplianceLog[]): number => {
    if (logs.length === 0) return 100;

    const criticalPenalty =
      logs.filter((log) => log.severity === 'CRITICAL').length * 15;
    const highPenalty =
      logs.filter((log) => log.severity === 'HIGH').length * 8;
    const mediumPenalty =
      logs.filter((log) => log.severity === 'MEDIUM').length * 3;

    return Math.max(0, 100 - criticalPenalty - highPenalty - mediumPenalty);
  }, []);

  return {
    getComplianceMetrics,
  };
}

/**
 * React Hook for Security Audit Monitoring
 *
 * Provides real-time security metrics, alerts, and audit trail monitoring
 * for the NeonPro application security dashboard.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type AuditEvent,
  AuditEventType,
  type SecurityMetrics,
  type SuspiciousPattern,
  securityAuditLogger,
} from './security-audit-logger';

export type SecurityDashboardData = {
  metrics: SecurityMetrics;
  suspiciousPatterns: SuspiciousPattern[];
  recentEvents: AuditEvent[];
  recommendations: string[];
  isLoading: boolean;
  error?: string;
};

export type UseSecurityAuditOptions = {
  refreshInterval?: number; // milliseconds
  hoursBack?: number;
  autoRefresh?: boolean;
  enableRealTimeAlerts?: boolean;
};

export function useSecurityAudit(options: UseSecurityAuditOptions = {}) {
  const {
    refreshInterval = 30_000, // 30 seconds
    hoursBack = 24,
    autoRefresh = true,
    enableRealTimeAlerts = true,
  } = options;

  const [data, setData] = useState<SecurityDashboardData>({
    metrics: {
      totalEvents: 0,
      successfulLogins: 0,
      failedLogins: 0,
      suspiciousActivities: 0,
      accountLockouts: 0,
      uniqueUsers: 0,
      uniqueIPs: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      timeRangeHours: hoursBack,
    },
    suspiciousPatterns: [],
    recentEvents: [],
    recommendations: [],
    isLoading: true,
  });

  const [alerts, setAlerts] = useState<SuspiciousPattern[]>([]);

  // Fetch security data
  const fetchSecurityData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const report = await securityAuditLogger.getSecurityReport(hoursBack);
      const recentEvents = await getRecentAuditEvents(50); // Last 50 events

      setData({
        metrics: report.metrics,
        suspiciousPatterns: report.suspiciousPatterns,
        recentEvents,
        recommendations: report.recommendations,
        isLoading: false,
      });

      // Check for new alerts
      if (enableRealTimeAlerts) {
        const newAlerts = report.suspiciousPatterns.filter(
          (pattern) =>
            pattern.riskLevel === 'high' || pattern.riskLevel === 'critical',
        );
        if (newAlerts.length > 0) {
          setAlerts((prev) => [...prev, ...newAlerts]);
        }
      }
    } catch (error) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao carregar dados de segurança',
      }));
    }
  }, [hoursBack, enableRealTimeAlerts]);

  // Auto-refresh effect
  useEffect(() => {
    fetchSecurityData();

    if (autoRefresh) {
      const interval = setInterval(fetchSecurityData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSecurityData, autoRefresh, refreshInterval]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear specific alert
  const clearAlert = useCallback((index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  return {
    ...data,
    alerts,
    clearAlerts,
    clearAlert,
    refresh,
  };
}

// Helper function to get recent audit events
async function getRecentAuditEvents(limit = 50): Promise<AuditEvent[]> {
  try {
    const stored = localStorage.getItem('security_audit_events');
    if (!stored) {
      return [];
    }

    const events: AuditEvent[] = JSON.parse(stored);
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  } catch {
    return [];
  }
}

// Hook for logging authentication events from components
export function useAuthAudit() {
  const logLoginAttempt = useCallback(
    async (email: string, method = 'oauth') => {
      await securityAuditLogger.logEvent(AuditEventType.LOGIN_ATTEMPT, {
        email,
        method,
        timestamp: Date.now(),
      });
    },
    [],
  );

  const logLoginSuccess = useCallback(
    async (userId: string, sessionId: string, method = 'oauth') => {
      await securityAuditLogger.logLoginSuccess(userId, sessionId, method);
    },
    [],
  );

  const logLoginFailure = useCallback(
    async (email: string, reason: string, method = 'oauth') => {
      await securityAuditLogger.logLoginFailure(email, reason, method);
    },
    [],
  );

  const logOAuthFlow = useCallback(
    async (
      stage: 'start' | 'success' | 'failure',
      details: Record<string, any>,
    ) => {
      await securityAuditLogger.logOAuthFlow(stage, details);
    },
    [],
  );

  const logSessionEvent = useCallback(
    async (
      type: 'created' | 'terminated',
      userId: string,
      sessionId: string,
      details?: Record<string, any>,
    ) => {
      if (type === 'created') {
        await securityAuditLogger.logSessionCreated(userId, sessionId);
      } else {
        await securityAuditLogger.logSessionTerminated(
          userId,
          sessionId,
          details?.reason || 'user_logout',
        );
      }
    },
    [],
  );

  const logPermissionDenied = useCallback(
    async (userId: string, resource: string, action: string) => {
      await securityAuditLogger.logPermissionDenied(userId, resource, action);
    },
    [],
  );

  return {
    logLoginAttempt,
    logLoginSuccess,
    logLoginFailure,
    logOAuthFlow,
    logSessionEvent,
    logPermissionDenied,
  };
}

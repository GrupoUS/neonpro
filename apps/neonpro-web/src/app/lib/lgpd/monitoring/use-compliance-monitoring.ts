/**
 * React Hook for Real-Time LGPD Compliance Monitoring
 *
 * Provides real-time compliance status, alerts, and violation management
 * for healthcare compliance dashboards and monitoring interfaces.
 */

import type { useState, useEffect, useCallback, useRef } from "react";
import type {
  realTimeComplianceMonitor,
  RealTimeComplianceStatus,
  ComplianceMetrics,
  ComplianceViolation,
  ComplianceAlert,
  ComplianceRecommendation,
  ComplianceLevel,
  ViolationType,
  ComplianceCategory,
} from "./compliance-monitoring";

export interface UseComplianceMonitoringResult {
  status: RealTimeComplianceStatus | null;
  isLoading: boolean;
  isMonitoring: boolean;
  error?: string;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  refresh: () => Promise<void>;
  reportViolation: (
    violation: Omit<ComplianceViolation, "id" | "detectedAt" | "status">,
  ) => Promise<void>;
  resolveViolation: (violationId: string, resolution: string, responsible: string) => Promise<void>;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<void>;
  triggerAssessment: () => Promise<void>;
}

export function useComplianceMonitoring(): UseComplianceMonitoringResult {
  const [status, setStatus] = useState<RealTimeComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const statusUpdateRef = useRef<(status: RealTimeComplianceStatus) => void>();

  // Status update handler
  const handleStatusUpdate = useCallback((newStatus: RealTimeComplianceStatus) => {
    setStatus(newStatus);
    setIsLoading(false);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      await realTimeComplianceMonitor.startMonitoring();

      // Add status listener
      statusUpdateRef.current = handleStatusUpdate;
      realTimeComplianceMonitor.addStatusListener(handleStatusUpdate);

      // Get initial status
      const initialStatus = await realTimeComplianceMonitor.getCurrentStatus();
      setStatus(initialStatus);
      setIsLoading(false);
    } catch (err) {
      console.error("Error starting compliance monitoring:", err);
      setError("Falha ao iniciar monitoramento de conformidade");
      setIsLoading(false);
    }
  }, [handleStatusUpdate]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    realTimeComplianceMonitor.stopMonitoring();

    if (statusUpdateRef.current) {
      realTimeComplianceMonitor.removeStatusListener(statusUpdateRef.current);
      statusUpdateRef.current = undefined;
    }
  }, []);

  // Refresh status
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const currentStatus = await realTimeComplianceMonitor.getCurrentStatus();
      setStatus(currentStatus);
      setIsLoading(false);
    } catch (err) {
      console.error("Error refreshing compliance status:", err);
      setError("Falha ao atualizar status de conformidade");
      setIsLoading(false);
    }
  }, []);

  // Report violation
  const reportViolation = useCallback(
    async (violation: Omit<ComplianceViolation, "id" | "detectedAt" | "status">) => {
      try {
        await realTimeComplianceMonitor.reportViolation(violation);
      } catch (err) {
        console.error("Error reporting violation:", err);
        setError("Falha ao reportar violação");
      }
    },
    [],
  );

  // Resolve violation
  const resolveViolation = useCallback(
    async (violationId: string, resolution: string, responsible: string) => {
      try {
        await realTimeComplianceMonitor.resolveViolation(violationId, resolution, responsible);
      } catch (err) {
        console.error("Error resolving violation:", err);
        setError("Falha ao resolver violação");
      }
    },
    [],
  );

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string, acknowledgedBy: string) => {
    try {
      await realTimeComplianceMonitor.acknowledgeAlert(alertId, acknowledgedBy);
    } catch (err) {
      console.error("Error acknowledging alert:", err);
      setError("Falha ao confirmar alerta");
    }
  }, []);

  // Trigger manual assessment
  const triggerAssessment = useCallback(async () => {
    try {
      await realTimeComplianceMonitor.triggerAssessment();
    } catch (err) {
      console.error("Error triggering assessment:", err);
      setError("Falha ao executar avaliação");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusUpdateRef.current) {
        realTimeComplianceMonitor.removeStatusListener(statusUpdateRef.current);
      }
    };
  }, []);

  return {
    status,
    isLoading,
    isMonitoring: status?.isMonitoring || false,
    error,
    startMonitoring,
    stopMonitoring,
    refresh,
    reportViolation,
    resolveViolation,
    acknowledgeAlert,
    triggerAssessment,
  };
}

// Hook for compliance metrics with filtering and sorting
export function useComplianceMetrics() {
  const { status, isLoading } = useComplianceMonitoring();

  const metrics = status?.metrics || null;

  const getComplianceLevelColor = useCallback((level: ComplianceLevel): string => {
    switch (level) {
      case ComplianceLevel.EXCELLENT:
        return "text-green-600";
      case ComplianceLevel.GOOD:
        return "text-blue-600";
      case ComplianceLevel.FAIR:
        return "text-yellow-600";
      case ComplianceLevel.POOR:
        return "text-orange-600";
      case ComplianceLevel.CRITICAL:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, []);

  const getComplianceLevelText = useCallback((level: ComplianceLevel): string => {
    switch (level) {
      case ComplianceLevel.EXCELLENT:
        return "Excelente";
      case ComplianceLevel.GOOD:
        return "Boa";
      case ComplianceLevel.FAIR:
        return "Regular";
      case ComplianceLevel.POOR:
        return "Ruim";
      case ComplianceLevel.CRITICAL:
        return "Crítica";
      default:
        return "Desconhecida";
    }
  }, []);

  return {
    metrics,
    isLoading,
    getComplianceLevelColor,
    getComplianceLevelText,
  };
}

// Hook for violations management
export function useComplianceViolations() {
  const { status, isLoading, reportViolation, resolveViolation } = useComplianceMonitoring();

  const violations = status?.violations || [];

  const getViolationsByType = useCallback(
    (type?: ViolationType) => {
      if (!type) return violations;
      return violations.filter((v) => v.type === type);
    },
    [violations],
  );

  const getViolationsByCategory = useCallback(
    (category?: ComplianceCategory) => {
      if (!category) return violations;
      return violations.filter((v) => v.category === category);
    },
    [violations],
  );

  const getCriticalViolations = useCallback(() => {
    return violations.filter((v) => v.severity === "critical");
  }, [violations]);

  const getViolationTypeText = useCallback((type: ViolationType): string => {
    switch (type) {
      case ViolationType.CONSENT_VIOLATION:
        return "Violação de Consentimento";
      case ViolationType.DATA_ACCESS_VIOLATION:
        return "Violação de Acesso a Dados";
      case ViolationType.RETENTION_VIOLATION:
        return "Violação de Retenção";
      case ViolationType.AUDIT_VIOLATION:
        return "Violação de Auditoria";
      case ViolationType.DISCLOSURE_VIOLATION:
        return "Violação de Divulgação";
      case ViolationType.SECURITY_VIOLATION:
        return "Violação de Segurança";
      case ViolationType.RESPONSE_TIME_VIOLATION:
        return "Violação de Prazo de Resposta";
      default:
        return "Violação Desconhecida";
    }
  }, []);

  const getSeverityColor = useCallback((severity: string): string => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);

  return {
    violations,
    isLoading,
    reportViolation,
    resolveViolation,
    getViolationsByType,
    getViolationsByCategory,
    getCriticalViolations,
    getViolationTypeText,
    getSeverityColor,
  };
}

// Hook for alerts management
export function useComplianceAlerts() {
  const { status, isLoading, acknowledgeAlert } = useComplianceMonitoring();

  const alerts = status?.alerts || [];

  const getUnacknowledgedAlerts = useCallback(() => {
    return alerts.filter((a) => !a.acknowledged);
  }, [alerts]);

  const getCriticalAlerts = useCallback(() => {
    return alerts.filter((a) => a.severity === "critical");
  }, [alerts]);

  const getAlertsByCategory = useCallback(
    (category?: ComplianceCategory) => {
      if (!category) return alerts;
      return alerts.filter((a) => a.category === category);
    },
    [alerts],
  );

  const getAlertSeverityColor = useCallback((severity: string): string => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "error":
        return "text-orange-600 bg-orange-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);

  return {
    alerts,
    isLoading,
    acknowledgeAlert,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    getAlertsByCategory,
    getAlertSeverityColor,
  };
}

// Hook for recommendations
export function useComplianceRecommendations() {
  const { status, isLoading } = useComplianceMonitoring();

  const recommendations = status?.recommendations || [];

  const getRecommendationsByPriority = useCallback(
    (priority?: string) => {
      if (!priority) return recommendations;
      return recommendations.filter((r) => r.priority === priority);
    },
    [recommendations],
  );

  const getCriticalRecommendations = useCallback(() => {
    return recommendations.filter((r) => r.priority === "critical");
  }, [recommendations]);

  const getRecommendationsByCategory = useCallback(
    (category?: ComplianceCategory) => {
      if (!category) return recommendations;
      return recommendations.filter((r) => r.category === category);
    },
    [recommendations],
  );

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);

  return {
    recommendations,
    isLoading,
    getRecommendationsByPriority,
    getCriticalRecommendations,
    getRecommendationsByCategory,
    getPriorityColor,
  };
}

/**
 * React hooks for compliance monitoring system
 * Provides real-time data and state management for compliance components
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { complianceService } from "./ComplianceService";
import type {
  ComplianceCheckResult,
  ComplianceFilters,
  ComplianceFramework,
  ComplianceScore,
  ComplianceTrendData,
  ComplianceViolation,
  MonitoringConfig,
} from "./types";

/**
 * Main hook for compliance dashboard data
 */
export const useCompliance = (framework: ComplianceFramework | "all" = "all") => {
  const [scores, setScores] = useState<ComplianceScore[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [scoresData, violationsData] = await Promise.all([
          complianceService.fetchComplianceScores(framework),
          complianceService.fetchViolations(framework !== "all" ? { framework } : {}),
        ]);

        setScores(scoresData);
        setViolations(violationsData);
        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Error loading compliance data:", err);
        setError(err instanceof Error ? err.message : "Failed to load compliance data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [framework]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = complianceService.subscribeToUpdates(framework, (newScores) => {
      setScores(newScores);
      setLastUpdated(Date.now());
    });

    return unsubscribe;
  }, [framework]);

  // Refresh data manually
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [scoresData, violationsData] = await Promise.all([
        complianceService.fetchComplianceScores(framework),
        complianceService.fetchViolations(framework !== "all" ? { framework } : {}),
      ]);

      setScores(scoresData);
      setViolations(violationsData);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("Error refreshing compliance data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [framework]);

  // Calculate overall metrics
  const overallScore = useMemo(() => {
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
  }, [scores]);

  const overallStatus = useMemo(() => {
    if (overallScore >= 90) return "excellent";
    if (overallScore >= 75) return "good";
    if (overallScore >= 60) return "warning";
    return "critical";
  }, [overallScore]);

  const totalViolations = useMemo(() => violations.length, [violations]);
  const openViolations = useMemo(() => violations.filter(v => v.status === "open").length, [
    violations,
  ]);
  const criticalViolations = useMemo(
    () => violations.filter(v => v.severity === "critical").length,
    [violations],
  );

  return {
    scores,
    violations,
    isLoading,
    error,
    lastUpdated,
    refresh,
    metrics: {
      overallScore,
      overallStatus,
      totalViolations,
      openViolations,
      criticalViolations,
    },
  };
};

/**
 * Hook for managing compliance violations
 */
export const useComplianceViolations = (filters?: ComplianceFilters) => {
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch violations with filters
  useEffect(() => {
    const loadViolations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const violationsData = await complianceService.fetchViolations({
          framework: filters?.frameworks?.[0],
          severity: filters?.violationSeverity?.[0],
          status: filters?.violationStatus?.[0],
        });

        setViolations(violationsData);
      } catch (err) {
        console.error("Error loading violations:", err);
        setError(err instanceof Error ? err.message : "Failed to load violations");
      } finally {
        setIsLoading(false);
      }
    };

    loadViolations();
  }, [filters]);

  // Update violation status
  const updateViolation = useCallback(async (violationId: string, updates: {
    status?: "open" | "in_progress" | "resolved";
    assignedTo?: string;
    notes?: string;
  }) => {
    try {
      const updatedViolation = await complianceService.updateViolation(violationId, updates);

      setViolations(prev => prev.map(v => v.id === violationId ? updatedViolation : v));

      return updatedViolation;
    } catch (err) {
      console.error("Error updating violation:", err);
      throw err;
    }
  }, []);

  // Filter violations
  const filteredViolations = useMemo(() => {
    if (!filters) return violations;

    return violations.filter(violation => {
      if (filters.frameworks && !filters.frameworks.includes(violation.framework)) return false;
      if (filters.violationStatus && !filters.violationStatus.includes(violation.status)) {
        return false;
      }
      if (filters.violationSeverity && !filters.violationSeverity.includes(violation.severity)) {
        return false;
      }
      if (
        filters.assignedTo && filters.assignedTo.length
        && (!violation.assignedTo || !filters.assignedTo.includes(violation.assignedTo))
      ) return false;
      if (
        filters.pages && filters.pages.length
        && !filters.pages.some(page => violation.page.includes(page))
      ) return false;

      return true;
    });
  }, [violations, filters]);

  return {
    violations: filteredViolations,
    isLoading,
    error,
    updateViolation,
    totalCount: violations.length,
    filteredCount: filteredViolations.length,
  };
};

/**
 * Hook for compliance trends and analytics
 */
export const useComplianceTrends = (framework: ComplianceFramework, days: number = 30) => {
  const [trendData, setTrendData] = useState<ComplianceTrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const trends = await complianceService.getComplianceTrends(framework, days);

        const data: ComplianceTrendData = {
          framework,
          data: trends.dates.map((date, index) => ({
            date,
            score: trends.scores[index],
            violations: trends.violations[index],
          })),
          summary: {
            averageScore: trends.scores.reduce((a, b) => a + b, 0) / trends.scores.length || 0,
            scoreImprovement: trends.scores.length >= 2
              ? ((trends.scores[trends.scores.length - 1] - trends.scores[0]) / trends.scores[0])
                * 100
              : 0,
            totalViolations: trends.violations.reduce((a, b) => a + b, 0),
            violationTrend: trends.violations.length >= 2
              ? trends.violations[trends.violations.length - 1] > trends.violations[0]
                ? "up"
                : trends.violations[trends.violations.length - 1] < trends.violations[0]
                ? "down"
                : "stable"
              : "stable",
          },
        };

        setTrendData(data);
      } catch (err) {
        console.error("Error loading trends:", err);
        setError(err instanceof Error ? err.message : "Failed to load trend data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTrends();
  }, [framework, days]);

  return {
    trendData,
    isLoading,
    error,
  };
};

/**
 * Hook for running compliance checks
 */
export const useComplianceCheck = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ComplianceCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async (framework: ComplianceFramework, config?: unknown) => {
    try {
      setIsRunning(true);
      setError(null);

      const result = await complianceService.runComplianceCheck(framework, config);

      // Transform to full result format
      const checkResult: ComplianceCheckResult = {
        framework,
        score: result.score,
        violations: [], // Would be populated by the actual check
        passes: 0, // Would be calculated
        incomplete: 0, // Would be calculated
        timestamp: Date.now(),
        metadata: {
          checkDurationMs: 0, // Would be measured
          pagesChecked: 1,
          rulesEvaluated: 0, // Would be counted
        },
      };

      setResults(checkResult);
      return checkResult;
    } catch (err) {
      console.error("Error running compliance check:", err);
      setError(err instanceof Error ? err.message : "Compliance check failed");
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runWCAGCheck = useCallback(async (url: string) => {
    try {
      setIsRunning(true);
      setError(null);

      const result = await complianceService.runWCAGCheck(url);
      return result;
    } catch (err) {
      console.error("Error running WCAG check:", err);
      setError(err instanceof Error ? err.message : "WCAG check failed");
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runLGPDCheck = useCallback(async () => {
    try {
      setIsRunning(true);
      setError(null);

      const result = await complianceService.runLGPDCheck();
      return result;
    } catch (err) {
      console.error("Error running LGPD check:", err);
      setError(err instanceof Error ? err.message : "LGPD check failed");
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    runCheck,
    runWCAGCheck,
    runLGPDCheck,
    isRunning,
    results,
    error,
  };
};

/**
 * Hook for generating compliance reports
 */
export const useComplianceReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState << unknown > [] > [];
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(
    async (frameworks: ComplianceFramework[], options?: unknown) => {
      try {
        setIsGenerating(true);
        setError(null);

        const result = await complianceService.generateReport(frameworks, options);

        const newReport = {
          id: result.reportId,
          title: `Relatório de Compliance - ${new Date().toLocaleDateString("pt-BR")}`,
          frameworks,
          generatedAt: Date.now(),
          status: "ready" as const,
          downloadUrl: result.downloadUrl,
        };

        setReports(prev => [...prev, newReport]);
        return newReport;
      } catch (err) {
        console.error("Error generating report:", err);
        setError(err instanceof Error ? err.message : "Report generation failed");
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return {
    generateReport,
    reports,
    isGenerating,
    error,
  };
};

/**
 * Hook for monitoring configuration
 */
export const useMonitoringConfig = () => {
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load monitoring configuration
    const loadConfig = async () => {
      try {
        // This would typically load from an API or local storage
        const defaultConfig: MonitoringConfig = {
          enabled: true,
          interval: 30,
          frameworks: ["WCAG", "LGPD", "ANVISA", "CFM"],
          alertThresholds: {
            scoreDropPercent: 5,
            newViolationSeverity: "high",
          },
          notifications: {
            email: {
              enabled: true,
              recipients: [],
            },
            dashboard: {
              enabled: true,
              showToasts: true,
            },
          },
        };

        setConfig(defaultConfig);
      } catch (err) {
        setError("Failed to load monitoring configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<MonitoringConfig>) => {
    if (!config) return;

    try {
      setIsSaving(true);
      setError(null);

      const updatedConfig = { ...config, ...newConfig };

      // This would typically save to an API
      // await saveMonitoringConfig(updatedConfig);

      setConfig(updatedConfig);
    } catch (err) {
      setError("Failed to save monitoring configuration");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  return {
    config,
    updateConfig,
    isLoading,
    isSaving,
    error,
  };
};

/**
 * Hook for real-time compliance alerts
 */
export const useComplianceAlerts = () => {
  const [alerts, setAlerts] = useState<{
    id: string;
    type: "score_drop" | "new_violation" | "system_error";
    framework: ComplianceFramework;
    message: string;
    timestamp: number;
    read: boolean;
  }[]>([]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, read: true } : alert));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const unreadCount = useMemo(() => alerts.filter(alert => !alert.read).length, [alerts]);

  return {
    alerts,
    markAsRead,
    dismissAlert,
    unreadCount,
  };
};

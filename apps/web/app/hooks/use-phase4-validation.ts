// Phase 4 Validation System Hook
// Sistema abrangente de validação para plataforma de saúde

"use client";

import type {
  SystemHealth,
  ValidationAlert,
  ValidationConfig,
  ValidationDashboard,
  ValidationRule,
  ValidationSession,
  ValidationStats,
  ValidationStatus,
  ValidationType,
} from "@/app/types/phase4-validation";
import {
  BrazilianHealthcareValidationPresets,
  ValidationLabels,
  ValidationLevel,
  ValidationRequest,
  ValidationResult,
} from "@/app/types/phase4-validation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UsePhase4ValidationOptions {
  clinic_id: string;
  auto_validate?: boolean;
  real_time_updates?: boolean;
  cache_results?: boolean;
  strict_mode?: boolean;
}

interface UsePhase4ValidationReturn {
  // Core validation functions
  validateEntity: (
    type: ValidationType,
    entityId: string,
    data: Record<string, unknown>,
  ) => Promise<ValidationSession>;
  getValidationResult: (sessionId: string) => ValidationSession | null;
  retryValidation: (sessionId: string) => Promise<ValidationSession>;

  // Rule management
  rules: ValidationRule[];
  loadRules: (type?: ValidationType) => Promise<void>;
  createRule: (
    rule: Omit<ValidationRule, "id" | "created_at" | "updated_at">,
  ) => Promise<ValidationRule>;
  updateRule: (
    id: string,
    updates: Partial<ValidationRule>,
  ) => Promise<ValidationRule>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string, enabled: boolean) => Promise<void>;

  // Configuration
  config: ValidationConfig | null;
  loadConfig: () => Promise<void>;
  updateConfig: (
    updates: Partial<ValidationConfig>,
  ) => Promise<ValidationConfig>;
  resetConfig: () => Promise<void>;

  // Statistics and monitoring
  stats: ValidationStats | null;
  dashboard: ValidationDashboard | null;
  loadStats: (period?: string) => Promise<void>;
  loadDashboard: () => Promise<void>;

  // Session management
  sessions: ValidationSession[];
  activeSessions: ValidationSession[];
  completedSessions: ValidationSession[];
  failedSessions: ValidationSession[];
  loadSessions: () => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;

  // Alerts and notifications
  alerts: ValidationAlert[];
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;

  // System health
  systemHealth: SystemHealth | null;
  checkSystemHealth: () => Promise<SystemHealth>;

  // Utility functions
  validateCPF: (cpf: string) => boolean;
  validateCNPJ: (cnpj: string) => boolean;
  validateCRM: (crm: string) => boolean;
  validatePhone: (phone: string) => boolean;
  formatValidationScore: (score: number) => string;
  getValidationStatusColor: (status: ValidationStatus) => string;

  // Export functions
  exportResults: (
    sessionIds: string[],
    format: "pdf" | "excel" | "csv",
  ) => Promise<Blob>;
  generateReport: (
    type: "compliance" | "performance" | "summary",
    filters: unknown,
  ) => Promise<Blob>;

  // State
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date | null;
}

export function usePhase4Validation(
  options: UsePhase4ValidationOptions,
): UsePhase4ValidationReturn {
  // State management
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [config, setConfig] = useState<ValidationConfig | null>(null);
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [dashboard, setDashboard] = useState<ValidationDashboard | null>(null);
  const [sessions, setSessions] = useState<ValidationSession[]>([]);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Memoized derived state
  const activeSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.status === "validating" || session.status === "pending",
      ),
    [sessions],
  );

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "passed"),
    [sessions],
  );

  const failedSessions = useMemo(
    () => sessions.filter((session) => session.status === "failed"),
    [sessions],
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!options.real_time_updates) {
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/validation`);

      ws.onopen = () => {
        setConnected(true);
        console.log("Validation WebSocket connected");

        // Subscribe to clinic-specific events
        ws.send(
          JSON.stringify({
            type: "subscribe",
            clinic_id: options.clinic_id,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("Validation WebSocket disconnected");

        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error("Validation WebSocket error:", error);
        setConnected(false);
      };

      setWsConnection(ws);
    };

    connectWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [options.real_time_updates, options.clinic_id]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: unknown) => {
    switch (data.type) {
      case "session_update":
        updateSessionInState(data.session);
        break;
      case "alert":
        addAlert(data.alert);
        break;
      case "health_update":
        setSystemHealth(data.health);
        break;
      case "stats_update":
        setStats(data.stats);
        break;
    }
    setLastUpdate(new Date());
  }, []);

  const updateSessionInState = useCallback(
    (updatedSession: ValidationSession) => {
      setSessions((prev) =>
        prev.map((session) => session.id === updatedSession.id ? updatedSession : session)
      );
    },
    [],
  );

  const addAlert = useCallback((alert: ValidationAlert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  // Core validation function
  const validateEntity = useCallback(
    async (
      type: ValidationType,
      entityId: string,
      data: Record<string, unknown>,
    ): Promise<ValidationSession> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/validation/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entity_type: type,
            entity_id: entityId,
            data,
            clinic_id: options.clinic_id,
            auto_validate: options.auto_validate,
            strict_mode: options.strict_mode,
          }),
        });

        if (!response.ok) {
          throw new Error(`Validation failed: ${response.statusText}`);
        }

        const session: ValidationSession = await response.json();

        // Update sessions in state
        setSessions((prev) => [session, ...prev]);

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro na validação";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options.clinic_id, options.auto_validate, options.strict_mode],
  );

  // Get validation result
  const getValidationResult = useCallback(
    (sessionId: string): ValidationSession | null => {
      return sessions.find((session) => session.id === sessionId) || null;
    },
    [sessions],
  );

  // Retry validation
  const retryValidation = useCallback(
    async (sessionId: string): Promise<ValidationSession> => {
      const session = getValidationResult(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      return validateEntity(session.entity_type, session.entity_id, {});
    },
    [getValidationResult, validateEntity],
  );

  // Load rules
  const loadRules = useCallback(
    async (type?: ValidationType) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          clinic_id: options.clinic_id,
          ...(type && { type }),
        });

        const response = await fetch(`/api/validation/rules?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to load rules");
        }

        const rulesData: ValidationRule[] = await response.json();
        setRules(rulesData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Erro ao carregar regras",
        );
      } finally {
        setLoading(false);
      }
    },
    [options.clinic_id],
  );

  // Create rule
  const createRule = useCallback(
    async (
      rule: Omit<ValidationRule, "id" | "created_at" | "updated_at">,
    ): Promise<ValidationRule> => {
      const response = await fetch("/api/validation/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rule, clinic_id: options.clinic_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rule");
      }

      const newRule: ValidationRule = await response.json();
      setRules((prev) => [newRule, ...prev]);
      return newRule;
    },
    [options.clinic_id],
  );

  // Update rule
  const updateRule = useCallback(
    async (
      id: string,
      updates: Partial<ValidationRule>,
    ): Promise<ValidationRule> => {
      const response = await fetch(`/api/validation/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      const updatedRule: ValidationRule = await response.json();
      setRules((prev) => prev.map((rule) => (rule.id === id ? updatedRule : rule)));
      return updatedRule;
    },
    [],
  );

  // Delete rule
  const deleteRule = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/validation/rules/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete rule");
    }

    setRules((prev) => prev.filter((rule) => rule.id !== id));
  }, []);

  // Toggle rule
  const toggleRule = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      await updateRule(id, { enabled });
    },
    [updateRule],
  );

  // Load configuration
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/validation/config?clinic_id=${options.clinic_id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load config");
      }

      const configData: ValidationConfig = await response.json();
      setConfig(configData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar configuração",
      );
    }
  }, [options.clinic_id]);

  // Update configuration
  const updateConfig = useCallback(
    async (updates: Partial<ValidationConfig>): Promise<ValidationConfig> => {
      const response = await fetch("/api/validation/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, clinic_id: options.clinic_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update config");
      }

      const updatedConfig: ValidationConfig = await response.json();
      setConfig(updatedConfig);
      return updatedConfig;
    },
    [options.clinic_id],
  );

  // Reset configuration
  const resetConfig = useCallback(async (): Promise<void> => {
    const response = await fetch("/api/validation/config/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinic_id: options.clinic_id }),
    });

    if (!response.ok) {
      throw new Error("Failed to reset config");
    }

    await loadConfig();
  }, [options.clinic_id, loadConfig]);

  // Load statistics
  const loadStats = useCallback(
    async (period = "30d") => {
      try {
        const response = await fetch(
          `/api/validation/stats?clinic_id=${options.clinic_id}&period=${period}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }

        const statsData: ValidationStats = await response.json();
        setStats(statsData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Erro ao carregar estatísticas",
        );
      }
    },
    [options.clinic_id],
  );

  // Load dashboard
  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/validation/dashboard?clinic_id=${options.clinic_id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const dashboardData: ValidationDashboard = await response.json();
      setDashboard(dashboardData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao carregar dashboard",
      );
    }
  }, [options.clinic_id]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/validation/sessions?clinic_id=${options.clinic_id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load sessions");
      }

      const sessionsData: ValidationSession[] = await response.json();
      setSessions(sessionsData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao carregar sessões",
      );
    }
  }, [options.clinic_id]);

  // Cancel session
  const cancelSession = useCallback(
    async (sessionId: string): Promise<void> => {
      const response = await fetch(
        `/api/validation/sessions/${sessionId}/cancel`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel session");
      }

      // Update session status in state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, status: "failed" as ValidationStatus }
            : session
        )
      );
    },
    [],
  );

  // Acknowledge alert
  const acknowledgeAlert = useCallback(
    async (alertId: string): Promise<void> => {
      const response = await fetch(
        `/api/validation/alerts/${alertId}/acknowledge`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to acknowledge alert");
      }

      setAlerts((prev) =>
        prev.map((alert) => alert.id === alertId ? { ...alert, acknowledged: true } : alert)
      );
    },
    [],
  );

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string): Promise<void> => {
    const response = await fetch(`/api/validation/alerts/${alertId}/dismiss`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to dismiss alert");
    }

    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  // Check system health
  const checkSystemHealth = useCallback(async (): Promise<SystemHealth> => {
    const response = await fetch("/api/validation/health");
    if (!response.ok) {
      throw new Error("Failed to check system health");
    }

    const health: SystemHealth = await response.json();
    setSystemHealth(health);
    return health;
  }, []);

  // Brazilian validation utilities
  const validateCPF = useCallback((cpf: string): boolean => {
    return BrazilianHealthcareValidationPresets.cpf_validation.pattern.test(
      cpf,
    );
  }, []);

  const validateCNPJ = useCallback((cnpj: string): boolean => {
    return BrazilianHealthcareValidationPresets.cnpj_validation.pattern.test(
      cnpj,
    );
  }, []);

  const validateCRM = useCallback((crm: string): boolean => {
    return BrazilianHealthcareValidationPresets.crm_validation.pattern.test(
      crm,
    );
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    return BrazilianHealthcareValidationPresets.phone_validation.pattern.test(
      phone,
    );
  }, []);

  // Utility functions
  const formatValidationScore = useCallback((score: number): string => {
    if (score >= 90) {
      return "Excelente";
    }
    if (score >= 70) {
      return "Bom";
    }
    if (score >= 50) {
      return "Regular";
    }
    return "Inadequado";
  }, []);

  const getValidationStatusColor = useCallback(
    (status: ValidationStatus): string => {
      switch (status) {
        case "passed":
          return "text-green-600";
        case "failed":
          return "text-red-600";
        case "validating":
          return "text-blue-600";
        case "requires_review":
          return "text-yellow-600";
        default:
          return "text-gray-600";
      }
    },
    [],
  );

  // Export functions
  const exportResults = useCallback(
    async (
      sessionIds: string[],
      format: "pdf" | "excel" | "csv",
    ): Promise<Blob> => {
      const response = await fetch("/api/validation/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_ids: sessionIds, format }),
      });

      if (!response.ok) {
        throw new Error("Failed to export results");
      }

      return await response.blob();
    },
    [],
  );

  const generateReport = useCallback(
    async (
      type: "compliance" | "performance" | "summary",
      filters: unknown,
    ): Promise<Blob> => {
      const response = await fetch("/api/validation/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, filters, clinic_id: options.clinic_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return await response.blob();
    },
    [options.clinic_id],
  );

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadRules(),
          loadConfig(),
          loadStats(),
          loadDashboard(),
          loadSessions(),
          checkSystemHealth(),
        ]);
      } catch (error) {
        console.error("Failed to initialize validation system:", error);
      }
    };

    initializeData();
  }, []);

  return {
    // Core validation functions
    validateEntity,
    getValidationResult,
    retryValidation,

    // Rule management
    rules,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,

    // Configuration
    config,
    loadConfig,
    updateConfig,
    resetConfig,

    // Statistics and monitoring
    stats,
    dashboard,
    loadStats,
    loadDashboard,

    // Session management
    sessions,
    activeSessions,
    completedSessions,
    failedSessions,
    loadSessions,
    cancelSession,

    // Alerts and notifications
    alerts,
    acknowledgeAlert,
    dismissAlert,

    // System health
    systemHealth,
    checkSystemHealth,

    // Utility functions
    validateCPF,
    validateCNPJ,
    validateCRM,
    validatePhone,
    formatValidationScore,
    getValidationStatusColor,

    // Export functions
    exportResults,
    generateReport,

    // State
    loading,
    error,
    connected,
    lastUpdate,
  };
}

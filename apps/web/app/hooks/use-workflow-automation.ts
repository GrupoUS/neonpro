"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  WorkflowRule,
  WorkflowExecution,
  WorkflowQueue,
  WorkflowTemplate,
} from "@/types/workflow-automation";
import { ActionResult } from "@/types/workflow-automation";

interface UseWorkflowAutomationOptions {
  clinicId?: string;
  realTimeUpdates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseWorkflowAutomationReturn {
  // Rules management
  rules: WorkflowRule[];
  templates: WorkflowTemplate[];
  isLoading: boolean;
  error: string | null;

  // Executions monitoring
  executions: WorkflowExecution[];
  queues: WorkflowQueue[];

  // Rule operations
  createRule: (rule: Partial<WorkflowRule>) => Promise<WorkflowRule>;
  updateRule: (ruleId: string, updates: Partial<WorkflowRule>) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  toggleRule: (ruleId: string, active: boolean) => Promise<void>;

  // Execution operations
  triggerRule: (ruleId: string, inputData?: any) => Promise<WorkflowExecution>;
  cancelExecution: (executionId: string) => Promise<void>;
  retryExecution: (executionId: string) => Promise<WorkflowExecution>;

  // Template operations
  createFromTemplate: (
    templateId: string,
    config: any,
  ) => Promise<WorkflowRule>;
  getTemplates: (category?: string) => Promise<WorkflowTemplate[]>;

  // Monitoring and analytics
  getExecutionStats: (
    period: "hour" | "day" | "week" | "month",
  ) => Promise<any>;
  getQueueMetrics: () => Promise<WorkflowQueue[]>;

  // Testing and validation
  testRule: (rule: Partial<WorkflowRule>, testData: any) => Promise<any>;
  validateRule: (
    rule: Partial<WorkflowRule>,
  ) => Promise<{ isValid: boolean; errors: string[] }>;

  // Bulk operations
  bulkToggleRules: (ruleIds: string[], active: boolean) => Promise<void>;
  bulkDeleteRules: (ruleIds: string[]) => Promise<void>;
}

/**
 * Hook for managing workflow automation engine
 * Handles rule creation, execution monitoring, and real-time updates
 */
export function useWorkflowAutomation({
  clinicId,
  realTimeUpdates = true,
  autoRefresh = true,
  refreshInterval = 30_000, // 30 seconds
}: UseWorkflowAutomationOptions = {}): UseWorkflowAutomationReturn {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [queues, setQueues] = useState<WorkflowQueue[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (clinicId) {
        params.append("clinicId", clinicId);
      }

      const response = await fetch(`/api/workflow-automation/rules?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRules(data.rules || []);
      } else {
        throw new Error(data.message || "Failed to fetch workflow rules");
      }
    } catch (err) {
      console.error("Error fetching workflow rules:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch workflow rules",
      );
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  const fetchExecutions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (clinicId) {
        params.append("clinicId", clinicId);
      }
      params.append("limit", "50"); // Get last 50 executions

      const response = await fetch(
        `/api/workflow-automation/executions?${params}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch executions: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setExecutions(data.executions || []);
      }
    } catch (err) {
      console.error("Error fetching workflow executions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch executions",
      );
    }
  }, [clinicId]);

  const fetchQueues = useCallback(async () => {
    try {
      const response = await fetch("/api/workflow-automation/queues");

      if (!response.ok) {
        throw new Error(`Failed to fetch queues: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setQueues(data.queues || []);
      }
    } catch (err) {
      console.error("Error fetching workflow queues:", err);
    }
  }, []);

  const createRule = useCallback(
    async (rule: Partial<WorkflowRule>): Promise<WorkflowRule> => {
      try {
        setError(null);

        const response = await fetch("/api/workflow-automation/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...rule,
            clinicId: rule.clinicId || clinicId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create rule: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          const newRule = data.rule;
          setRules((prev) => [...prev, newRule]);
          return newRule;
        } else {
          throw new Error(data.message || "Failed to create workflow rule");
        }
      } catch (err) {
        console.error("Error creating workflow rule:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create workflow rule",
        );
        throw err;
      }
    },
    [clinicId],
  );

  const updateRule = useCallback(
    async (ruleId: string, updates: Partial<WorkflowRule>) => {
      try {
        setError(null);

        const response = await fetch(
          `/api/workflow-automation/rules/${ruleId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to update rule: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setRules((prev) =>
            prev.map((rule) =>
              rule.id === ruleId
                ? { ...rule, ...updates, updatedAt: new Date() }
                : rule,
            ),
          );
        } else {
          throw new Error(data.message || "Failed to update workflow rule");
        }
      } catch (err) {
        console.error("Error updating workflow rule:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update workflow rule",
        );
      }
    },
    [],
  );

  const deleteRule = useCallback(async (ruleId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/workflow-automation/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete rule: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      } else {
        throw new Error(data.message || "Failed to delete workflow rule");
      }
    } catch (err) {
      console.error("Error deleting workflow rule:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete workflow rule",
      );
    }
  }, []);

  const toggleRule = useCallback(
    async (ruleId: string, active: boolean) => {
      await updateRule(ruleId, { isActive: active });
    },
    [updateRule],
  );

  const triggerRule = useCallback(
    async (ruleId: string, inputData: any = {}): Promise<WorkflowExecution> => {
      try {
        setError(null);

        const response = await fetch(
          `/api/workflow-automation/rules/${ruleId}/trigger`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputData }),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to trigger rule: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          const execution = data.execution;
          setExecutions((prev) => [execution, ...prev]);
          return execution;
        } else {
          throw new Error(data.message || "Failed to trigger workflow rule");
        }
      } catch (err) {
        console.error("Error triggering workflow rule:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to trigger workflow rule",
        );
        throw err;
      }
    },
    [],
  );

  const cancelExecution = useCallback(async (executionId: string) => {
    try {
      setError(null);

      const response = await fetch(
        `/api/workflow-automation/executions/${executionId}/cancel`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel execution: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setExecutions((prev) =>
          prev.map((exec) =>
            exec.id === executionId ? { ...exec, status: "cancelled" } : exec,
          ),
        );
      } else {
        throw new Error(data.message || "Failed to cancel execution");
      }
    } catch (err) {
      console.error("Error cancelling execution:", err);
      setError(
        err instanceof Error ? err.message : "Failed to cancel execution",
      );
    }
  }, []);

  const retryExecution = useCallback(
    async (executionId: string): Promise<WorkflowExecution> => {
      try {
        setError(null);

        const response = await fetch(
          `/api/workflow-automation/executions/${executionId}/retry`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to retry execution: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          const newExecution = data.execution;
          setExecutions((prev) => [newExecution, ...prev]);
          return newExecution;
        } else {
          throw new Error(data.message || "Failed to retry execution");
        }
      } catch (err) {
        console.error("Error retrying execution:", err);
        setError(
          err instanceof Error ? err.message : "Failed to retry execution",
        );
        throw err;
      }
    },
    [],
  );

  const createFromTemplate = useCallback(
    async (templateId: string, config: any): Promise<WorkflowRule> => {
      try {
        setError(null);

        const response = await fetch(
          "/api/workflow-automation/templates/create-rule",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateId,
              configuration: config,
              clinicId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create rule from template: ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.success) {
          const newRule = data.rule;
          setRules((prev) => [...prev, newRule]);
          return newRule;
        } else {
          throw new Error(
            data.message || "Failed to create rule from template",
          );
        }
      } catch (err) {
        console.error("Error creating rule from template:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create rule from template",
        );
        throw err;
      }
    },
    [clinicId],
  );

  const getTemplates = useCallback(
    async (category?: string): Promise<WorkflowTemplate[]> => {
      try {
        const params = new URLSearchParams();
        if (category) {
          params.append("category", category);
        }

        const response = await fetch(
          `/api/workflow-automation/templates?${params}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setTemplates(data.templates || []);
          return data.templates || [];
        } else {
          throw new Error(data.message || "Failed to fetch templates");
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch templates",
        );
        return [];
      }
    },
    [],
  );

  const getExecutionStats = useCallback(
    async (period: "hour" | "day" | "week" | "month") => {
      try {
        const response = await fetch(
          `/api/workflow-automation/stats?period=${period}&clinicId=${clinicId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch execution stats: ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.success) {
          return data.stats;
        } else {
          throw new Error(data.message || "Failed to fetch execution stats");
        }
      } catch (err) {
        console.error("Error fetching execution stats:", err);
        throw err;
      }
    },
    [clinicId],
  );

  const getQueueMetrics = useCallback(async (): Promise<WorkflowQueue[]> => {
    await fetchQueues();
    return queues;
  }, [fetchQueues, queues]);

  const testRule = useCallback(
    async (rule: Partial<WorkflowRule>, testData: any) => {
      try {
        setError(null);

        const response = await fetch("/api/workflow-automation/test-rule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rule, testData }),
        });

        if (!response.ok) {
          throw new Error(`Failed to test rule: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          return data.result;
        } else {
          throw new Error(data.message || "Failed to test rule");
        }
      } catch (err) {
        console.error("Error testing rule:", err);
        setError(err instanceof Error ? err.message : "Failed to test rule");
        throw err;
      }
    },
    [],
  );

  const validateRule = useCallback(async (rule: Partial<WorkflowRule>) => {
    try {
      const response = await fetch("/api/workflow-automation/validate-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate rule: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        isValid: data.isValid,
        errors: data.errors || [],
      };
    } catch (err) {
      console.error("Error validating rule:", err);
      return {
        isValid: false,
        errors: [err instanceof Error ? err.message : "Validation failed"],
      };
    }
  }, []);

  const bulkToggleRules = useCallback(
    async (ruleIds: string[], active: boolean) => {
      try {
        setError(null);

        const response = await fetch(
          "/api/workflow-automation/rules/bulk-toggle",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ruleIds, active }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to bulk toggle rules: ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.success) {
          setRules((prev) =>
            prev.map((rule) =>
              ruleIds.includes(rule.id) ? { ...rule, isActive: active } : rule,
            ),
          );
        } else {
          throw new Error(data.message || "Failed to bulk toggle rules");
        }
      } catch (err) {
        console.error("Error bulk toggling rules:", err);
        setError(
          err instanceof Error ? err.message : "Failed to bulk toggle rules",
        );
      }
    },
    [],
  );

  const bulkDeleteRules = useCallback(async (ruleIds: string[]) => {
    try {
      setError(null);

      const response = await fetch(
        "/api/workflow-automation/rules/bulk-delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruleIds }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to bulk delete rules: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRules((prev) => prev.filter((rule) => !ruleIds.includes(rule.id)));
      } else {
        throw new Error(data.message || "Failed to bulk delete rules");
      }
    } catch (err) {
      console.error("Error bulk deleting rules:", err);
      setError(
        err instanceof Error ? err.message : "Failed to bulk delete rules",
      );
    }
  }, []);

  // WebSocket for real-time updates
  const setupWebSocket = useCallback(() => {
    if (!realTimeUpdates || typeof window === "undefined") {
      return () => {};
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/workflow-automation/websocket`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("Workflow automation WebSocket connected");

        // Subscribe to updates for this clinic
        wsRef.current?.send(
          JSON.stringify({
            type: "subscribe",
            clinicId,
          }),
        );
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "rule_created":
            case "rule_updated":
              fetchRules();
              break;
            case "execution_started":
            case "execution_completed":
            case "execution_failed":
              fetchExecutions();
              break;
            case "queue_metrics_updated":
              fetchQueues();
              break;
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Workflow automation WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("Workflow automation WebSocket closed");
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (realTimeUpdates) {
            setupWebSocket();
          }
        }, 5000);
      };
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [realTimeUpdates, clinicId, fetchRules, fetchExecutions, fetchQueues]);

  // Initial data fetch
  useEffect(() => {
    fetchRules();
    fetchExecutions();
    fetchQueues();
    getTemplates();
  }, [fetchRules, fetchExecutions, fetchQueues, getTemplates]);

  // Set up real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      const cleanup = setupWebSocket();
      return cleanup;
    }
  }, [realTimeUpdates, setupWebSocket]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchRules();
        fetchExecutions();
        fetchQueues();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchRules, fetchExecutions, fetchQueues]);

  return {
    // Data
    rules,
    templates,
    executions,
    queues,
    isLoading,
    error,

    // Rule operations
    createRule,
    updateRule,
    deleteRule,
    toggleRule,

    // Execution operations
    triggerRule,
    cancelExecution,
    retryExecution,

    // Template operations
    createFromTemplate,
    getTemplates,

    // Monitoring and analytics
    getExecutionStats,
    getQueueMetrics,

    // Testing and validation
    testRule,
    validateRule,

    // Bulk operations
    bulkToggleRules,
    bulkDeleteRules,
  };
}

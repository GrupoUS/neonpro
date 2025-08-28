"use client";

import type {
  AlertDashboardStats,
  AlertFilters,
  Intervention,
  StaffAlert,
} from "@/types/staff-alerts";
import { EscalationRule, StaffMember } from "@/types/staff-alerts";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseStaffAlertsOptions {
  realTimeUpdates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  staffMemberId?: string;
  department?: string;
}

interface UseStaffAlertsReturn {
  alerts: StaffAlert[];
  stats: AlertDashboardStats;
  isLoading: boolean;
  error: string | null;
  filters: AlertFilters;
  // Alert management
  fetchAlerts: (filters?: AlertFilters) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  assignAlert: (alertId: string, staffMemberId: string) => Promise<void>;
  resolveAlert: (alertId: string, resolution: string) => Promise<void>;
  dismissAlert: (alertId: string, reason: string) => Promise<void>;
  escalateAlert: (alertId: string) => Promise<void>;
  // Interventions
  createIntervention: (
    alertId: string,
    intervention: Partial<Intervention>,
  ) => Promise<void>;
  updateIntervention: (
    interventionId: string,
    updates: Partial<Intervention>,
  ) => Promise<void>;
  // Filters and search
  setFilters: (filters: AlertFilters) => void;
  clearFilters: () => void;
  // Real-time features
  subscribeToAlerts: () => () => void;
  getUnreadCount: () => number;
}

/**
 * Hook for managing staff alerts and workflow system
 */
export function useStaffAlerts({
  realTimeUpdates = true,
  autoRefresh = true,
  refreshInterval = 30_000, // 30 seconds
  staffMemberId,
  department,
}: UseStaffAlertsOptions = {}): UseStaffAlertsReturn {
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [stats, setStats] = useState<AlertDashboardStats>({
    total: 0,
    pending: 0,
    acknowledged: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    dismissed: 0,
    overdue: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    interventionSuccessRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AlertFilters>({});

  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAlerts = useCallback(
    async (customFilters?: AlertFilters) => {
      setIsLoading(true);
      try {
        setError(null);

        const queryFilters = customFilters || filters;

        // Add staff and department filters if provided
        if (staffMemberId) {
          queryFilters.assignedTo = queryFilters.assignedTo || [];
          if (!queryFilters.assignedTo.includes(staffMemberId)) {
            queryFilters.assignedTo.push(staffMemberId);
          }
        }

        if (department) {
          queryFilters.department = queryFilters.department || [];
          if (!queryFilters.department.includes(department)) {
            queryFilters.department.push(department);
          }
        }

        const response = await fetch("/api/staff-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters: queryFilters }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch alerts: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setAlerts(data.alerts || []);
          setStats(data.stats || stats);
        } else {
          throw new Error(data.message || "Failed to fetch alerts");
        }
      } catch (err) {
        console.error("Error fetching staff alerts:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch alerts");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, staffMemberId, department, stats],
  );

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        const response = await fetch(
          `/api/staff-alerts/${alertId}/acknowledge`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to acknowledge alert: ${response.statusText}`,
          );
        }

        // Update local state optimistically
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: "acknowledged", acknowledgedAt: new Date() }
              : alert
          )
        );

        // Refresh to get updated stats
        await fetchAlerts();
      } catch (err) {
        console.error("Error acknowledging alert:", err);
        setError(
          err instanceof Error ? err.message : "Failed to acknowledge alert",
        );
      }
    },
    [fetchAlerts],
  );

  const assignAlert = useCallback(
    async (alertId: string, staffMemberId: string) => {
      try {
        const response = await fetch(`/api/staff-alerts/${alertId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffMemberId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to assign alert: ${response.statusText}`);
        }

        // Update local state optimistically
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                ...alert,
                status: "assigned",
                assignedTo: staffMemberId,
                assignedAt: new Date(),
              }
              : alert
          )
        );

        await fetchAlerts();
      } catch (err) {
        console.error("Error assigning alert:", err);
        setError(err instanceof Error ? err.message : "Failed to assign alert");
      }
    },
    [fetchAlerts],
  );

  const resolveAlert = useCallback(
    async (alertId: string, resolution: string) => {
      try {
        const response = await fetch(`/api/staff-alerts/${alertId}/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolution }),
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve alert: ${response.statusText}`);
        }

        // Update local state optimistically
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: "resolved", resolvedAt: new Date() }
              : alert
          )
        );

        await fetchAlerts();
      } catch (err) {
        console.error("Error resolving alert:", err);
        setError(
          err instanceof Error ? err.message : "Failed to resolve alert",
        );
      }
    },
    [fetchAlerts],
  );

  const dismissAlert = useCallback(
    async (alertId: string, reason: string) => {
      try {
        const response = await fetch(`/api/staff-alerts/${alertId}/dismiss`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error(`Failed to dismiss alert: ${response.statusText}`);
        }

        // Update local state optimistically
        setAlerts((prev) =>
          prev.map((alert) => alert.id === alertId ? { ...alert, status: "dismissed" } : alert)
        );

        await fetchAlerts();
      } catch (err) {
        console.error("Error dismissing alert:", err);
        setError(
          err instanceof Error ? err.message : "Failed to dismiss alert",
        );
      }
    },
    [fetchAlerts],
  );

  const escalateAlert = useCallback(
    async (alertId: string) => {
      try {
        const response = await fetch(`/api/staff-alerts/${alertId}/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to escalate alert: ${response.statusText}`);
        }

        await fetchAlerts();
      } catch (err) {
        console.error("Error escalating alert:", err);
        setError(
          err instanceof Error ? err.message : "Failed to escalate alert",
        );
      }
    },
    [fetchAlerts],
  );

  const createIntervention = useCallback(
    async (alertId: string, intervention: Partial<Intervention>) => {
      try {
        const response = await fetch("/api/staff-alerts/interventions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertId, ...intervention }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create intervention: ${response.statusText}`,
          );
        }

        await fetchAlerts();
      } catch (err) {
        console.error("Error creating intervention:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create intervention",
        );
      }
    },
    [fetchAlerts],
  );

  const updateIntervention = useCallback(
    async (interventionId: string, updates: Partial<Intervention>) => {
      try {
        const response = await fetch(
          `/api/staff-alerts/interventions/${interventionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update intervention: ${response.statusText}`,
          );
        }

        await fetchAlerts();
      } catch (err) {
        console.error("Error updating intervention:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update intervention",
        );
      }
    },
    [fetchAlerts],
  );

  const setFilters = useCallback(
    (newFilters: AlertFilters) => {
      setFiltersState(newFilters);
      fetchAlerts(newFilters);
    },
    [fetchAlerts],
  );

  const clearFilters = useCallback(() => {
    setFiltersState({});
    fetchAlerts({});
  }, [fetchAlerts]);

  const getUnreadCount = useCallback(() => {
    return alerts.filter((alert) => alert.status === "pending").length;
  }, [alerts]);

  const subscribeToAlerts = useCallback(() => {
    if (!realTimeUpdates || typeof window === "undefined") {
      return () => {};
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/staff-alerts/websocket`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("Staff alerts WebSocket connected");
        // Send subscription with filters
        wsRef.current?.send(
          JSON.stringify({
            type: "subscribe",
            filters: { staffMemberId, department, ...filters },
          }),
        );
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (
            message.type === "alert_created"
            || message.type === "alert_updated"
          ) {
            fetchAlerts();
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Staff alerts WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("Staff alerts WebSocket closed");
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (realTimeUpdates) {
            subscribeToAlerts();
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
  }, [realTimeUpdates, staffMemberId, department, filters, fetchAlerts]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (realTimeUpdates) {
      const unsubscribe = subscribeToAlerts();
      return unsubscribe;
    }
  }, [realTimeUpdates, subscribeToAlerts]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchAlerts();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchAlerts]);

  return {
    alerts,
    stats,
    isLoading,
    error,
    filters,
    fetchAlerts,
    acknowledgeAlert,
    assignAlert,
    resolveAlert,
    dismissAlert,
    escalateAlert,
    createIntervention,
    updateIntervention,
    setFilters,
    clearFilters,
    subscribeToAlerts,
    getUnreadCount,
  };
}

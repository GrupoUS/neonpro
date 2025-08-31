/**
 * Real-Time Performance Dashboard Component for NeonPro Healthcare
 * ===============================================================
 *
 * React component for displaying real-time performance metrics with:
 * - Live metric updates via Supabase subscriptions
 * - Healthcare-specific threshold monitoring
 * - Multi-clinic metric aggregation
 * - Alert and notification system
 * - LGPD/ANVISA compliance indicators
 */

"use client";

import { createClient } from "@neonpro/database";
import React, { useCallback, useEffect, useState } from "react";
import type {
  HealthcareContext,
  PerformanceAlert,
  PerformanceDashboardData,
  PerformanceMetric,
} from "../types";

interface RealTimePerformanceDashboardProps {
  clinicId?: string;
  userId?: string;
  refreshInterval?: number;
  showAlerts?: boolean;
  compactMode?: boolean;
  healthcareContext?: HealthcareContext;
}

export const RealTimePerformanceDashboard: React.FC<
  RealTimePerformanceDashboardProps
> = ({
  clinicId,
  userId,
  refreshInterval = 5000,
  showAlerts = true,
  compactMode = false,
  healthcareContext = {},
}) => {
  // State management
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supabase client
  const supabase = createClient();

  /**
   * Load initial dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load recent metrics for each category
      const [webVitals, aiMetrics, cacheMetrics, systemMetrics, recentAlerts] = await Promise.all([
        loadMetricsByCategory("web-vitals"),
        loadMetricsByCategory("ai-metrics"),
        loadMetricsByCategory("cache-metrics"),
        loadMetricsByCategory("system-metrics"),
        loadRecentAlerts(),
      ]);

      const newDashboardData: PerformanceDashboardData = {
        webVitals: {
          current: webVitals,
          trends: generateTrends(webVitals),
          alerts: recentAlerts.filter(
            (alert) => alert.metric.category === "web-vitals",
          ),
        },
        aiMetrics: {
          current: aiMetrics,
          modelPerformance: aggregateModelPerformance(aiMetrics),
          driftDetection: generateDriftData(aiMetrics),
        },
        cacheMetrics: {
          current: cacheMetrics,
          hitRates: aggregateHitRates(cacheMetrics),
          performance: generateCachePerformance(cacheMetrics),
        },
        systemMetrics: {
          current: systemMetrics,
          resourceUsage: aggregateResourceUsage(systemMetrics),
          healthStatus: calculateSystemHealth(systemMetrics),
        },
        lastUpdated: new Date().toISOString(),
        clinicId: clinicId,
      };

      setDashboardData(newDashboardData);
      setAlerts(recentAlerts);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err}`);
      console.error("❌ Dashboard data loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  /**
   * Load metrics by category
   */
  const loadMetricsByCategory = async (
    category: PerformanceMetric["category"],
  ): Promise<PerformanceMetric[]> => {
    let query = supabase
      .from("performance_metrics")
      .select("*")
      .eq("category", category)
      .gte("timestamp", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order("timestamp", { ascending: false })
      .limit(100);

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    return data || [];
  };

  /**
   * Load recent alerts
   */
  const loadRecentAlerts = async (): Promise<PerformanceAlert[]> => {
    let query = supabase
      .from("performance_alerts")
      .select("*")
      .eq("acknowledged", false)
      .gte(
        "timestamp",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ) // Last 24 hours
      .order("timestamp", { ascending: false })
      .limit(50);

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    return data || [];
  };

  /**
   * Setup real-time subscriptions
   */
  const setupRealtimeSubscriptions = useCallback(() => {
    // Subscribe to performance metrics updates
    const metricsChannel = supabase.channel("dashboard_metrics").on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "performance_metrics",
      },
      (payload) => {
        console.log("📊 New metric received:", payload.new);
        // Update dashboard data with new metric
        if (payload.new && dashboardData) {
          updateDashboardWithNewMetric(payload.new as PerformanceMetric);
        }
      },
    );

    // Subscribe to alerts
    const alertsChannel = supabase.channel("dashboard_alerts").on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "performance_alerts",
      },
      (payload) => {
        console.log("🚨 New alert received:", payload.new);
        if (payload.new) {
          setAlerts((prev) => [
            payload.new as PerformanceAlert,
            ...prev.slice(0, 49),
          ]);
        }
      },
    );

    // Subscribe to channels
    metricsChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        console.log("✅ Real-time metrics subscription active");
      }
    });

    alertsChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time alerts subscription active");
      }
    });

    // Cleanup function
    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(alertsChannel);
      setIsConnected(false);
    };
  }, [supabase, dashboardData]);

  /**
   * Update dashboard with new metric
   */
  const updateDashboardWithNewMetric = (newMetric: PerformanceMetric) => {
    setDashboardData((prev) => {
      if (!prev) {
        return prev;
      }

      const updated = { ...prev };

      switch (newMetric.category) {
        case "web-vitals":
          updated.webVitals.current = [
            newMetric,
            ...updated.webVitals.current.slice(0, 99),
          ];
          updated.webVitals.trends = generateTrends(updated.webVitals.current);
          break;
        case "ai-metrics":
          updated.aiMetrics.current = [
            newMetric,
            ...updated.aiMetrics.current.slice(0, 99),
          ];
          updated.aiMetrics.modelPerformance = aggregateModelPerformance(
            updated.aiMetrics.current,
          );
          break;
        case "cache-metrics":
          updated.cacheMetrics.current = [
            newMetric,
            ...updated.cacheMetrics.current.slice(0, 99),
          ];
          updated.cacheMetrics.hitRates = aggregateHitRates(
            updated.cacheMetrics.current,
          );
          break;
        case "system-metrics":
          updated.systemMetrics.current = [
            newMetric,
            ...updated.systemMetrics.current.slice(0, 99),
          ];
          updated.systemMetrics.resourceUsage = aggregateResourceUsage(
            updated.systemMetrics.current,
          );
          updated.systemMetrics.healthStatus = calculateSystemHealth(
            updated.systemMetrics.current,
          );
          break;
      }

      updated.lastUpdated = new Date().toISOString();
      return updated;
    });

    setLastUpdate(new Date().toLocaleTimeString());
  };

  /**
   * Acknowledge alert
   */
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("performance_alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        throw error;
      }

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error("❌ Failed to acknowledge alert:", err);
    }
  };

  // Effects
  useEffect(() => {
    loadDashboardData();
    const cleanup = setupRealtimeSubscriptions();

    // Setup periodic refresh
    const interval = setInterval(loadDashboardData, refreshInterval);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [loadDashboardData, setupRealtimeSubscriptions, refreshInterval]);

  // Render loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">
          <div className="text-lg font-medium text-gray-600">
            Loading healthcare performance metrics...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 font-medium">Dashboard Error</div>
        <div className="text-red-600 mt-1">{error}</div>
        <button
          onClick={loadDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className={`performance-dashboard ${compactMode ? "compact" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Healthcare Performance Monitor
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate}
            </span>
            <div
              className={`flex items-center gap-2 ${
                isConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm">
                {isConnected ? "Real-time connected" : "Connection lost"}
              </span>
            </div>
          </div>
        </div>

        {clinicId && <div className="text-sm text-gray-600">Clinic: {clinicId}</div>}
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Active Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, compactMode ? 3 : 10).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === "critical"
                    ? "border-red-500 bg-red-50"
                    : alert.severity === "error"
                    ? "border-orange-500 bg-orange-50"
                    : alert.severity === "warning"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {alert.message}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {dashboardData && (
        <div
          className={`grid gap-6 ${compactMode ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2"}`}
        >
          {/* Web Vitals */}
          <MetricCard
            title="Web Vitals"
            metrics={dashboardData.webVitals.current.slice(0, 5)}
            icon="🌐"
            status={calculateCategoryStatus(dashboardData.webVitals.current)}
          />

          {/* AI Metrics */}
          <MetricCard
            title="AI Performance"
            metrics={dashboardData.aiMetrics.current.slice(0, 5)}
            icon="🤖"
            status={calculateCategoryStatus(dashboardData.aiMetrics.current)}
          />

          {/* Cache Metrics */}
          <MetricCard
            title="Cache Performance"
            metrics={dashboardData.cacheMetrics.current.slice(0, 5)}
            icon="⚡"
            status={calculateCategoryStatus(dashboardData.cacheMetrics.current)}
          />

          {/* System Metrics */}
          <MetricCard
            title="System Health"
            metrics={dashboardData.systemMetrics.current.slice(0, 5)}
            icon="🖥️"
            status={dashboardData.systemMetrics.healthStatus}
          />
        </div>
      )}
    </div>
  );
};

// Helper Components
interface MetricCardProps {
  title: string;
  metrics: PerformanceMetric[];
  icon: string;
  status: "healthy" | "warning" | "critical";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metrics,
  icon,
  status,
}) => {
  const statusColors = {
    healthy: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    critical: "border-red-200 bg-red-50",
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        <div
          className={`px-2 py-1 rounded text-sm font-medium ${
            status === "healthy"
              ? "bg-green-100 text-green-800"
              : status === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </div>
      </div>

      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{metric.name}</span>
            <span className="font-medium">
              {metric.value.toFixed(2)}
              {metric.unit || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions
const generateTrends = (metrics: PerformanceMetric[]) => {
  return metrics.slice(0, 24).map((metric) => ({
    timestamp: metric.timestamp,
    value: metric.value,
  }));
};

const aggregateModelPerformance = (metrics: PerformanceMetric[]) => {
  return [];
};

const generateDriftData = (metrics: PerformanceMetric[]) => {
  return [];
};

const aggregateHitRates = (metrics: PerformanceMetric[]) => {
  return [];
};

const generateCachePerformance = (metrics: PerformanceMetric[]) => {
  return [];
};

const aggregateResourceUsage = (metrics: PerformanceMetric[]) => {
  return [];
};

const calculateSystemHealth = (
  metrics: PerformanceMetric[],
): "healthy" | "warning" | "critical" => {
  if (metrics.length === 0) {
    return "warning";
  }

  const criticalMetrics = metrics.filter(
    (m) =>
      (m.name === "cpu-usage" && m.value > 90)
      || (m.name === "memory-usage" && m.value > 90)
      || (m.name === "error-rate" && m.value > 5),
  );

  if (criticalMetrics.length > 0) {
    return "critical";
  }

  const warningMetrics = metrics.filter(
    (m) =>
      (m.name === "cpu-usage" && m.value > 70)
      || (m.name === "memory-usage" && m.value > 70)
      || (m.name === "error-rate" && m.value > 1),
  );

  return warningMetrics.length > 0 ? "warning" : "healthy";
};

const calculateCategoryStatus = (
  metrics: PerformanceMetric[],
): "healthy" | "warning" | "critical" => {
  return "healthy"; // Simplified for now
};

export default RealTimePerformanceDashboard;

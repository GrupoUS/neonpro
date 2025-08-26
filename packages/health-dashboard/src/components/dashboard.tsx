"use client";

import type {
  Alert,
  HealthCheckResult,
  PerformanceInsight,
} from "@neonpro/performance-monitor";
import { useEffect, useState } from "react";

interface DashboardProps {
  performanceMonitor?: any;
  refreshInterval?: number;
}

export function PerformanceDashboard({
  performanceMonitor,
  refreshInterval = 30_000,
}: DashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useEffect(() => {
    if (!performanceMonitor) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [currentAlerts, healthResults, recentInsights] =
          await Promise.all([
            performanceMonitor.getActiveAlerts(),
            performanceMonitor.performHealthCheck(),
            performanceMonitor.getRecentInsights(10),
          ]);

        setAlerts(currentAlerts);
        setHealthChecks(healthResults);
        setInsights(recentInsights);
        setLastUpdated(new Date());
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [performanceMonitor, refreshInterval]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await performanceMonitor.acknowledgeAlert(alertId, "dashboard-user");
      const updatedAlerts = await performanceMonitor.getActiveAlerts();
      setAlerts(updatedAlerts);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900">
            Performance Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring and analytics • Last updated:{" "}
            {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-semibold text-gray-900 text-xl">
              Active Alerts
            </h2>
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <div
                  className={`rounded-lg border-l-4 p-4 ${
                    alert.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : alert.severity === "high"
                        ? "border-orange-500 bg-orange-50"
                        : alert.severity === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                  }`}
                  key={alert.id}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {alert.message}
                      </h3>
                      <p className="mt-1 text-gray-600 text-sm">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Health Checks */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-gray-900 text-xl">
            System Health
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthChecks.map((check, index) => (
              <div className="rounded-lg bg-white p-4 shadow" key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {check.component}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      check.status === "healthy"
                        ? "bg-green-100 text-green-800"
                        : check.status === "degraded"
                          ? "bg-yellow-100 text-yellow-800"
                          : check.status === "unhealthy"
                            ? "bg-red-100 text-red-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{check.message}</p>
                <p className="mt-1 text-gray-500 text-xs">
                  Response: {check.responseTime}ms
                </p>
              </div>
            ))}
          </div>
        </div>{" "}
        {/* Performance Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-semibold text-gray-900 text-xl">
              Performance Insights
            </h2>
            <div className="grid gap-6">
              {insights.map((insight) => (
                <div
                  className="rounded-lg bg-white p-6 shadow"
                  key={insight.id}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {insight.title}
                      </h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${
                          insight.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : insight.severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : insight.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="mb-3 text-gray-700">{insight.description}</p>

                  <div className="mb-3 rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Recommendation
                    </h4>
                    <p className="text-blue-800">{insight.recommendation}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Impact: {insight.potentialImpact}
                    </span>
                    {insight.estimatedROI && (
                      <span className="font-medium text-green-600">
                        Potential ROI: ${insight.estimatedROI.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>NeonPro Performance Monitoring • Real-time Healthcare Analytics</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Monitor,
  Play,
  Square,
  TrendingUp,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { cn } from "@/lib/utils";
import type { usePerformanceMonitor } from "@/utils/performance-monitor";

// =====================================================================================
// PERFORMANCE DASHBOARD
// Real-time performance monitoring and visualization
// =====================================================================================

export function PerformanceDashboard() {
  const { report, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitor();
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-100";
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "D":
        return "text-orange-600 bg-orange-100";
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Monitor real-time performance metrics and get optimization suggestions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400",
              )}
            />
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? "Monitoring" : "Stopped"}
            </span>
          </div>

          <Button
            onClick={handleToggleMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={cn("text-4xl font-bold", getScoreColor(report.overall.score))}>
                    {report.overall.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>

                <Badge className={cn("text-lg px-3 py-1", getGradeColor(report.overall.grade))}>
                  Grade {report.overall.grade}
                </Badge>
              </div>

              <div className="flex-1 max-w-md">
                <Progress value={report.overall.score} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {report && report.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    alert.type === "critical"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        "h-5 w-5 mt-0.5",
                        alert.type === "critical" ? "text-red-500" : "text-yellow-500",
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.suggestion}</div>
                    </div>
                    <Badge variant={alert.type === "critical" ? "destructive" : "secondary"}>
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Memory Usage"
              value={getLatestMetric(report?.metrics, "heap-used")}
              unit="MB"
              icon={<HardDrive className="h-4 w-4" />}
              threshold={100}
            />

            <MetricCard
              title="FPS"
              value={getLatestMetric(report?.metrics, "fps")}
              unit="fps"
              icon={<Monitor className="h-4 w-4" />}
              threshold={30}
              reverse
            />

            <MetricCard
              title="DOM Nodes"
              value={getLatestMetric(report?.metrics, "node-count")}
              unit="nodes"
              icon={<Activity className="h-4 w-4" />}
              threshold={1500}
            />

            <MetricCard
              title="Event Listeners"
              value={getLatestMetric(report?.metrics, "listener-count")}
              unit="listeners"
              icon={<Zap className="h-4 w-4" />}
              threshold={100}
            />
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          {report && report.components.length > 0 ? (
            <div className="grid gap-4">
              {report.components.map((component) => (
                <Card key={component.componentName}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{component.componentName}</h3>
                        <div className="text-sm text-muted-foreground">
                          Renders: {component.renderCount} | Avg:{" "}
                          {component.averageRenderTime.toFixed(2)}ms
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={cn(
                            "text-lg font-semibold",
                            component.averageRenderTime > 16
                              ? component.averageRenderTime > 50
                                ? "text-red-600"
                                : "text-yellow-600"
                              : "text-green-600",
                          )}
                        >
                          {component.averageRenderTime.toFixed(2)}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(component.lastRender).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <Progress
                      value={Math.min(100, (component.averageRenderTime / 50) * 100)}
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Component Data</h3>
                <p className="text-muted-foreground">
                  Start monitoring to see component performance metrics
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {report && report.metrics.length > 0 ? (
            <div className="space-y-4">
              {report.metrics.slice(0, 20).map((metric, index) => (
                <Card key={`${metric.name}-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{metric.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={cn(
                            "text-lg font-semibold",
                            metric.threshold && metric.value > metric.threshold
                              ? "text-red-600"
                              : "text-green-600",
                          )}
                        >
                          {metric.value.toFixed(2)}
                          {metric.unit}
                        </div>
                        {metric.threshold && (
                          <div className="text-xs text-muted-foreground">
                            Threshold: {metric.threshold}
                            {metric.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Metrics Data</h3>
                <p className="text-muted-foreground">Start monitoring to see performance metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {report && report.recommendations.length > 0 ? (
            <div className="space-y-4">
              {report.recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  Your application is performing well! Keep monitoring for insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =====================================================================================
// METRIC CARD COMPONENT
// =====================================================================================

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  threshold?: number;
  reverse?: boolean; // For metrics where higher is better (like FPS)
}

function MetricCard({ title, value, unit, icon, threshold, reverse = false }: MetricCardProps) {
  const getStatusColor = () => {
    if (value === null || threshold === undefined) return "text-gray-600";

    if (reverse) {
      return value >= threshold ? "text-green-600" : "text-red-600";
    } else {
      return value <= threshold ? "text-green-600" : "text-red-600";
    }
  };

  const getProgressValue = () => {
    if (value === null || threshold === undefined) return 0;

    if (reverse) {
      return Math.min(100, (value / threshold) * 100);
    } else {
      return Math.min(100, (value / threshold) * 100);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className={cn("text-2xl font-bold", getStatusColor())}>
            {value !== null ? `${value.toFixed(1)}${unit}` : "N/A"}
          </div>

          {threshold && value !== null && (
            <>
              <Progress value={getProgressValue()} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Threshold: {threshold}
                {unit}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

function getLatestMetric(metrics: any[] | undefined, name: string): number | null {
  if (!metrics) return null;

  const filtered = metrics.filter((m) => m.name === name);
  if (filtered.length === 0) return null;

  return filtered[filtered.length - 1].value;
}

export default PerformanceDashboard;

/**
 * TASK-001: Foundation Setup & Baseline
 * System Health Widget Component
 *
 * Real-time system health monitoring widget with uptime tracking,
 * error rates, and resource monitoring for all epic functionality.
 */

"use client";

import type {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  RefreshCw,
  Server,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";

interface SystemHealthData {
  overall_status: "healthy" | "degraded" | "unhealthy";
  uptime_percentage: number;
  response_time_avg: number;
  error_rate: number;
  last_updated: string;
  components: {
    database: ComponentHealth;
    api: ComponentHealth;
    frontend: ComponentHealth;
    authentication: ComponentHealth;
    monitoring: ComponentHealth;
  };
  resource_usage: {
    cpu_percentage: number;
    memory_percentage: number;
    storage_percentage: number;
  };
}

interface ComponentHealth {
  status: "healthy" | "degraded" | "unhealthy";
  response_time: number;
  error_rate: number;
  last_error?: string;
  uptime_percentage: number;
}

export function SystemHealthWidget() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadHealthData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    try {
      const response = await fetch("/api/monitoring/health");
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.health);
        setLastRefresh(new Date());
      } else {
        throw new Error("Failed to fetch health data");
      }
    } catch (error) {
      console.error("Error loading health data:", error);
      toast.error("Failed to load system health data");
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = () => {
    setLoading(true);
    loadHealthData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: { variant: "default" as const, text: "Healthy", color: "text-green-500" },
      degraded: { variant: "secondary" as const, text: "Degraded", color: "text-yellow-500" },
      unhealthy: { variant: "destructive" as const, text: "Unhealthy", color: "text-red-500" },
    };

    const config = variants[status as keyof typeof variants] || variants.unhealthy;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.text}
      </Badge>
    );
  };

  if (loading && !healthData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading system health...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">Unable to load health data</p>
            <Button size="sm" onClick={refreshHealth} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time monitoring • Last updated: {lastRefresh.toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(healthData.overall_status)}
            <Button size="sm" variant="outline" onClick={refreshHealth} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthData.uptime_percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{healthData.response_time_avg}ms</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${healthData.error_rate > 1 ? "text-red-600" : "text-green-600"}`}
            >
              {healthData.error_rate.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(
                (healthData.resource_usage.cpu_percentage +
                  healthData.resource_usage.memory_percentage +
                  healthData.resource_usage.storage_percentage) /
                  3,
              )}
              %
            </div>
            <div className="text-xs text-muted-foreground">Resources</div>
          </div>
        </div>

        {/* Component Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Component Status</h4>
          <div className="space-y-3">
            {Object.entries(healthData.components).map(([name, component]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {name === "database" && <Database className="h-4 w-4" />}
                  {name === "api" && <Server className="h-4 w-4" />}
                  {name === "frontend" && <Wifi className="h-4 w-4" />}
                  {name === "authentication" && <Zap className="h-4 w-4" />}
                  {name === "monitoring" && <Activity className="h-4 w-4" />}
                  <span className="text-sm capitalize">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{component.response_time}ms</span>
                  {getStatusIcon(component.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Usage */}
        <div>
          <h4 className="text-sm font-medium mb-3">Resource Usage</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{healthData.resource_usage.cpu_percentage}%</span>
              </div>
              <Progress value={healthData.resource_usage.cpu_percentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span>{healthData.resource_usage.memory_percentage}%</span>
              </div>
              <Progress value={healthData.resource_usage.memory_percentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage</span>
                <span>{healthData.resource_usage.storage_percentage}%</span>
              </div>
              <Progress value={healthData.resource_usage.storage_percentage} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open("/dashboard/monitoring", "_blank")}
          >
            Full Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open("/api/monitoring/logs", "_blank")}
          >
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Security Dashboard Component
 * Main security management interface for NeonPro
 * Story 3.3: Security Hardening & Audit
 */

"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SecurityMetrics } from "../../../lib/utils";
import { Alert, AlertDescription } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ActiveSessionsTable } from "./ActiveSessionsTable";
import { AuditLogsTable } from "./AuditLogsTable";
import { ComplianceAuditsTable } from "./ComplianceAuditsTable";
import { SecurityAlertsTable } from "./SecurityAlertsTable";
import { SecurityEventsTable } from "./SecurityEventsTable";
import { SecurityMetricsOverview } from "./SecurityMetricsOverview";

interface SecurityDashboardProps {
  className?: string;
}

export function SecurityDashboard({ className }: SecurityDashboardProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>();

  const loadMetrics = async () => {
    try {
      setError(undefined);
      const response = await fetch("/api/security/metrics");

      if (!response.ok) {
        throw new Error("Failed to load security metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load metrics",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
  };

  useEffect(() => {
    loadMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30_000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low": {
        return "text-green-600 bg-green-50 border-green-200";
      }
      case "medium": {
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      }
      case "high": {
        return "text-orange-600 bg-orange-50 border-orange-200";
      }
      case "critical": {
        return "text-red-600 bg-red-50 border-red-200";
      }
      default: {
        return "text-gray-600 bg-gray-50 border-gray-200";
      }
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case "low": {
        return <CheckCircle className="h-4 w-4" />;
      }
      case "medium": {
        return <Eye className="h-4 w-4" />;
      }
      case "high": {
        return <AlertTriangle className="h-4 w-4" />;
      }
      case "critical": {
        return <XCircle className="h-4 w-4" />;
      }
      default: {
        return <Shield className="h-4 w-4" />;
      }
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {new Array(4).fill().map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-8 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              className="ml-2"
              disabled={refreshing}
              onClick={handleRefresh}
              size="sm"
              variant="outline"
            >
              {refreshing ? <RefreshCw className="h-3 w-3 animate-spin" /> : (
                "Retry"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metrics) {
    return;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Security Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Monitor and manage system security
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            className={`px-3 py-1 font-medium ${getThreatLevelColor(metrics.threat_level)}`}
            variant="outline"
          >
            {getThreatLevelIcon(metrics.threat_level)}
            <span className="ml-1 capitalize">
              {metrics.threat_level} Threat
            </span>
          </Badge>
          <Button
            disabled={refreshing}
            onClick={handleRefresh}
            size="sm"
            variant="outline"
          >
            {refreshing
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <SecurityMetricsOverview metrics={metrics} />

      {/* Main Content Tabs */}
      <Tabs className="space-y-4" defaultValue="events">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger className="flex items-center space-x-2" value="events">
            <Activity className="h-4 w-4" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger className="flex items-center space-x-2" value="alerts">
            <AlertTriangle className="h-4 w-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger className="flex items-center space-x-2" value="sessions">
            <Users className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger className="flex items-center space-x-2" value="audit">
            <Eye className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center space-x-2"
            value="compliance"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger className="flex items-center space-x-2" value="insights">
            <TrendingUp className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Security Events</span>
              </CardTitle>
              <CardDescription>
                Recent security events and incidents requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityEventsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Security Alerts</span>
              </CardTitle>
              <CardDescription>
                Active security alerts requiring investigation or response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityAlertsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Active Sessions</span>
              </CardTitle>
              <CardDescription>
                Monitor active user sessions and detect suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveSessionsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Audit Logs</span>
              </CardTitle>
              <CardDescription>
                Comprehensive audit trail of system activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Compliance Audits</span>
              </CardTitle>
              <CardDescription>
                LGPD, ANVISA, and CFM compliance audit status and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceAuditsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="insights">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Security Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Failed Login Attempts (24h)
                    </span>
                    <Badge
                      variant={metrics.failed_attempts_24h > 10
                        ? "destructive"
                        : "secondary"}
                    >
                      {metrics.failed_attempts_24h}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      High-Risk Sessions
                    </span>
                    <Badge
                      variant={metrics.high_risk_sessions > 5
                        ? "destructive"
                        : "secondary"}
                    >
                      {metrics.high_risk_sessions}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Avg Response Time
                    </span>
                    <Badge
                      variant={metrics.avg_response_time_minutes > 60
                        ? "destructive"
                        : "secondary"}
                    >
                      {metrics.avg_response_time_minutes}m
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.unresolved_alerts > 5 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Multiple unresolved alerts detected. Review and address high-priority
                        alerts.
                      </AlertDescription>
                    </Alert>
                  )}
                  {metrics.failed_attempts_24h > 20 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        High number of failed login attempts. Consider implementing additional
                        protections.
                      </AlertDescription>
                    </Alert>
                  )}
                  {metrics.compliance_score < 90 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Compliance score below threshold. Review compliance audit results.
                      </AlertDescription>
                    </Alert>
                  )}
                  {metrics.unresolved_alerts === 0
                    && metrics.failed_attempts_24h < 5
                    && metrics.compliance_score >= 95 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Security posture is strong. All systems operating normally.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

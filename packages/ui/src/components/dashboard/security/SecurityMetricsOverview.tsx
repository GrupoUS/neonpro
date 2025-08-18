/**
 * Security Metrics Overview Component
 * Displays key security metrics and status indicators
 * Story 3.3: Security Hardening & Audit
 */

"use client";

import { Activity, CheckCircle2, Clock, Shield, TrendingUp, Users, XCircle } from "lucide-react";
import type { SecurityMetrics } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";

type SecurityMetricsOverviewProps = {
  metrics: SecurityMetrics;
};

export function SecurityMetricsOverview({ metrics }: SecurityMetricsOverviewProps) {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) {
      return "text-green-600";
    }
    if (score >= 85) {
      return "text-yellow-600";
    }
    if (score >= 70) {
      return "text-orange-600";
    }
    return "text-red-600";
  };

  const _getComplianceVariant = (score: number) => {
    if (score >= 95) {
      return "default";
    }
    if (score >= 85) {
      return "secondary";
    }
    if (score >= 70) {
      return "outline";
    }
    return "destructive";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Threat Level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Threat Level</CardTitle>
          <Shield className={`h-4 w-4 ${getThreatLevelColor(metrics.threat_level)}`} />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl capitalize">{metrics.threat_level}</div>
          <div className="mt-2 flex items-center space-x-2">
            <Badge
              className="text-xs"
              variant={metrics.threat_level === "low" ? "default" : "destructive"}
            >
              {metrics.unresolved_alerts} unresolved alerts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Active Sessions</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{metrics.active_sessions}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-gray-600 text-xs">High risk:</span>
            <Badge
              className="text-xs"
              variant={metrics.high_risk_sessions > 0 ? "destructive" : "secondary"}
            >
              {metrics.high_risk_sessions}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Events (24h) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Events (24h)</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{metrics.security_events_24h}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-gray-600 text-xs">Failed logins:</span>
            <Badge
              className="text-xs"
              variant={metrics.failed_attempts_24h > 10 ? "destructive" : "secondary"}
            >
              {metrics.failed_attempts_24h}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Compliance Score</CardTitle>
          {metrics.compliance_score >= 95 ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`font-bold text-2xl ${getComplianceColor(metrics.compliance_score)}`}>
            {metrics.compliance_score}%
          </div>
          <div className="mt-2">
            <Progress className="h-2" value={metrics.compliance_score} />
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Average Response Time</CardTitle>
          <Clock className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {metrics.avg_response_time_minutes}
            <span className="ml-1 font-normal text-gray-600 text-sm">minutes</span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-gray-600 text-sm">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Target: &lt; 30 min</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  metrics.avg_response_time_minutes <= 30 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>Current: {metrics.avg_response_time_minutes}m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status Summary */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Security Status</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-semibold text-green-600 text-lg">
                {metrics.compliance_score >= 95 ? "✓" : "⚠"}
              </div>
              <div className="text-gray-600 text-xs">Compliance</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600 text-lg">{metrics.active_sessions}</div>
              <div className="text-gray-600 text-xs">Sessions</div>
            </div>
            <div>
              <div
                className={`font-semibold text-lg ${
                  metrics.unresolved_alerts === 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics.unresolved_alerts === 0 ? "✓" : metrics.unresolved_alerts}
              </div>
              <div className="text-gray-600 text-xs">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

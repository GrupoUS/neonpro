/**
 * Security Metrics Overview Component
 * Displays key security metrics and status indicators
 * Story 3.3: Security Hardening & Audit
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui/card';
import { Badge } from '@neonpro/ui/badge';
import { Progress } from '@neonpro/ui/progress';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SecurityMetrics } from '@neonpro/utils';

interface SecurityMetricsOverviewProps {
  metrics: SecurityMetrics;
}

export function SecurityMetricsOverview({ metrics }: SecurityMetricsOverviewProps) {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceVariant = (score: number) => {
    if (score >= 95) return 'default';
    if (score >= 85) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Threat Level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
          <Shield className={`h-4 w-4 ${getThreatLevelColor(metrics.threat_level)}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {metrics.threat_level}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge 
              variant={metrics.threat_level === 'low' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {metrics.unresolved_alerts} unresolved alerts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.active_sessions}</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">High risk:</span>
            <Badge 
              variant={metrics.high_risk_sessions > 0 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {metrics.high_risk_sessions}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Events (24h) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Events (24h)</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.security_events_24h}</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">Failed logins:</span>
            <Badge 
              variant={metrics.failed_attempts_24h > 10 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {metrics.failed_attempts_24h}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          {metrics.compliance_score >= 95 ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getComplianceColor(metrics.compliance_score)}`}>
            {metrics.compliance_score}%
          </div>
          <div className="mt-2">
            <Progress 
              value={metrics.compliance_score} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          <Clock className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avg_response_time_minutes}
            <span className="text-sm font-normal text-gray-600 ml-1">minutes</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Target: &lt; 30 min</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                metrics.avg_response_time_minutes <= 30 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Current: {metrics.avg_response_time_minutes}m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status Summary */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {metrics.compliance_score >= 95 ? '✓' : '⚠'}
              </div>
              <div className="text-xs text-gray-600">Compliance</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {metrics.active_sessions}
              </div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${
                metrics.unresolved_alerts === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.unresolved_alerts === 0 ? '✓' : metrics.unresolved_alerts}
              </div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
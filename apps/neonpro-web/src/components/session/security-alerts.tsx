"use client";

import type {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Monitor,
  Shield,
  Smartphone,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { useSessionSecurity } from "@/hooks/use-session";
import type { SecurityEvent, SecuritySeverity, SuspiciousActivity } from "@/types/session";

interface SecurityAlertsProps {
  userId: string;
  className?: string;
}

const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ userId, className = "" }) => {
  const { securityEvents, suspiciousActivities, loading, error, refreshSecurityData } =
    useSessionSecurity(userId);

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showResolved, setShowResolved] = useState(false);

  // Filter active alerts
  const activeAlerts = [
    ...securityEvents.filter(
      (event) =>
        !dismissedAlerts.has(event.id) &&
        (showResolved || !event.resolved) &&
        event.severity !== "LOW",
    ),
    ...suspiciousActivities.filter(
      (activity) =>
        !dismissedAlerts.has(activity.id) && (showResolved || activity.status === "PENDING"),
    ),
  ].sort((a, b) => {
    const aTime = new Date("created_at" in a ? a.created_at : a.detected_at).getTime();
    const bTime = new Date("created_at" in b ? b.created_at : b.detected_at).getTime();
    return bTime - aTime;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="h-4 w-4" />;
      case "MEDIUM":
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "DEVICE_REGISTERED":
      case "DEVICE_TRUSTED":
      case "DEVICE_UNTRUSTED":
        return <Smartphone className="h-4 w-4" />;
      case "IP_ADDRESS_CHANGED":
        return <MapPin className="h-4 w-4" />;
      case "SESSION_VALIDATION_FAILED":
      case "SUSPICIOUS_ACTIVITY_DETECTED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load security alerts: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowResolved(!showResolved)}>
              {showResolved ? "Hide Resolved" : "Show Resolved"}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshSecurityData}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">All Clear!</p>
            <p className="text-sm">No security alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlerts.map((alert) => {
              const isSecurityEvent = "event_type" in alert;
              const severity = isSecurityEvent
                ? alert.severity
                : alert.risk_score > 70
                  ? "HIGH"
                  : alert.risk_score > 40
                    ? "MEDIUM"
                    : "LOW";
              const timestamp = isSecurityEvent ? alert.created_at : alert.detected_at;
              const description = alert.description;
              const eventType = isSecurityEvent ? alert.event_type : alert.activity_type;

              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getSeverityIcon(severity)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(severity) as any} className="text-xs">
                        {severity}
                      </Badge>
                      {getEventIcon(eventType)}
                      <span className="text-sm font-medium truncate">
                        {eventType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(timestamp)}
                      </div>

                      {alert.ip_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.ip_address}
                        </div>
                      )}

                      {!isSecurityEvent && "risk_score" in alert && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Risk: {alert.risk_score}%
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAlerts;

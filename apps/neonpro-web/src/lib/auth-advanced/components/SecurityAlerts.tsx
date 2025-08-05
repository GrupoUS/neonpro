// Security Alerts Component
// Story 1.4: Session Management & Security Implementation

"use client";

import React, { useState } from "react";
import type { useSessionContext } from "../context";
import type { AuthUtils } from "../utils";
import type {
  AlertTriangle,
  Shield,
  X,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Monitor,
  User,
  Lock,
  Unlock,
  Activity,
  Bell,
  BellOff,
} from "lucide-react";
import type { SessionSecurityEvent, SecurityEventType } from "../types";

interface SecurityAlertsProps {
  className?: string;
  maxAlerts?: number;
  showDismissed?: boolean;
  autoHide?: boolean;
  compact?: boolean;
}

export function SecurityAlerts({
  className = "",
  maxAlerts = 10,
  showDismissed = false,
  autoHide = true,
  compact = false,
}: SecurityAlertsProps) {
  const { securityAlerts, securityEvents, clearSecurityAlerts } = useSessionContext();

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Filter alerts based on settings
  const filteredAlerts = securityAlerts
    .filter((alert) => showDismissed || !dismissedAlerts.has(alert.id))
    .slice(0, showAll ? undefined : maxAlerts);

  // Get icon for security event type
  const getEventIcon = (eventType: SecurityEventType) => {
    const iconMap: Record<SecurityEventType, React.ReactNode> = {
      login_success: <User className="w-4 h-4 text-green-500" />,
      login_failure: <User className="w-4 h-4 text-red-500" />,
      logout: <User className="w-4 h-4 text-gray-500" />,
      session_timeout: <Clock className="w-4 h-4 text-orange-500" />,
      session_extended: <Clock className="w-4 h-4 text-blue-500" />,
      password_change: <Lock className="w-4 h-4 text-blue-500" />,
      mfa_enabled: <Shield className="w-4 h-4 text-green-500" />,
      mfa_disabled: <Shield className="w-4 h-4 text-red-500" />,
      suspicious_location: <MapPin className="w-4 h-4 text-red-500" />,
      suspicious_device: <Monitor className="w-4 h-4 text-red-500" />,
      brute_force_attempt: <AlertTriangle className="w-4 h-4 text-red-600" />,
      privilege_escalation_attempt: <Unlock className="w-4 h-4 text-red-600" />,
      session_hijack_attempt: <AlertTriangle className="w-4 h-4 text-red-600" />,
      unusual_activity: <Activity className="w-4 h-4 text-yellow-500" />,
      concurrent_session_limit: <User className="w-4 h-4 text-orange-500" />,
      device_blocked: <Monitor className="w-4 h-4 text-red-500" />,
      user_blocked: <User className="w-4 h-4 text-red-600" />,
    };

    return iconMap[eventType] || <AlertTriangle className="w-4 h-4 text-gray-500" />;
  };

  // Get alert priority color
  const getAlertColor = (event: SessionSecurityEvent) => {
    const severity = AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
    const colorMap = {
      low: "border-blue-200 bg-blue-50",
      medium: "border-yellow-200 bg-yellow-50",
      high: "border-orange-200 bg-orange-50",
      critical: "border-red-200 bg-red-50",
    };

    return colorMap[severity];
  };

  // Get text color for severity
  const getTextColor = (event: SessionSecurityEvent) => {
    const severity = AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
    const colorMap = {
      low: "text-blue-800",
      medium: "text-yellow-800",
      high: "text-orange-800",
      critical: "text-red-800",
    };

    return colorMap[severity];
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  // Clear all alerts
  const handleClearAll = () => {
    clearSecurityAlerts();
    setDismissedAlerts(new Set());
  };

  // Format event metadata
  const formatMetadata = (metadata: Record<string, any>) => {
    const items = [];

    if (metadata.ip_address) {
      items.push(`IP: ${metadata.ip_address}`);
    }

    if (metadata.location) {
      items.push(`${metadata.location.city}, ${metadata.location.country}`);
    }

    if (metadata.device) {
      items.push(`Device: ${metadata.device}`);
    }

    if (metadata.failed_attempts) {
      items.push(`${metadata.failed_attempts} attempts`);
    }

    return items.join(" • ");
  };

  if (filteredAlerts.length === 0) {
    if (autoHide) {
      return null;
    }

    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-800">No security alerts</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {filteredAlerts.slice(0, 3).map((alert) => {
          const severity = AuthUtils.SecurityEvent.classifyEventSeverity(alert.event_type);
          const isDismissed = dismissedAlerts.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2 rounded border ${getAlertColor(
                alert,
              )} ${isDismissed ? "opacity-50" : ""}`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getEventIcon(alert.event_type)}
                <span className={`text-sm font-medium truncate ${getTextColor(alert)}`}>
                  {AuthUtils.SecurityEvent.generateEventDescription(
                    alert.event_type,
                    alert.metadata,
                  )}
                </span>
              </div>

              <button
                onClick={() => dismissAlert(alert.id)}
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded"
                title="Dismiss alert"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {filteredAlerts.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? "Show less" : `Show ${filteredAlerts.length - 3} more alerts`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
          {filteredAlerts.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {filteredAlerts.length}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
            title={showDismissed ? "Hide dismissed" : "Show dismissed"}
          >
            {showDismissed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {filteredAlerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              title="Clear all alerts"
            >
              <BellOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y">
        {filteredAlerts.map((alert) => {
          const severity = AuthUtils.SecurityEvent.classifyEventSeverity(alert.event_type);
          const riskScore = AuthUtils.SecurityEvent.calculateEventRiskScore(
            alert.event_type,
            alert.metadata,
          );
          const isDismissed = dismissedAlerts.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                isDismissed ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">{getEventIcon(alert.event_type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {AuthUtils.SecurityEvent.generateEventDescription(
                          alert.event_type,
                          alert.metadata,
                        )}
                      </h4>

                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {severity}
                      </span>

                      {riskScore > 50 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Risk: {riskScore}%
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <p className="text-xs text-gray-500">{formatMetadata(alert.metadata)}</p>
                    )}

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {AuthUtils.Format.formatRelativeTime(new Date(alert.created_at))}
                        </span>
                      </div>

                      {alert.ip_address && (
                        <div className="flex items-center space-x-1">
                          <span>IP: {alert.ip_address}</span>
                        </div>
                      )}

                      {alert.session_id && (
                        <div className="flex items-center space-x-1">
                          <span>Session: {alert.session_id.slice(-8)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {securityAlerts.length > maxAlerts && !showAll && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show {securityAlerts.length - maxAlerts} more alerts
          </button>
        </div>
      )}

      {showAll && securityAlerts.length > maxAlerts && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}

export default SecurityAlerts;

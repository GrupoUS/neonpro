// Session Status Component
// Story 1.4: Session Management & Security Implementation

"use client";

import React, { useState, useEffect } from "react";
import type { useSessionContext } from "../context";
import type { AuthUtils } from "../utils";
import type {
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Activity,
} from "lucide-react";

interface SessionStatusProps {
  className?: string;
  showDetails?: boolean;
  showRiskScore?: boolean;
  showDeviceInfo?: boolean;
  compact?: boolean;
}

export function SessionStatus({
  className = "",
  showDetails = true,
  showRiskScore = true,
  showDeviceInfo = true,
  compact = false,
}: SessionStatusProps) {
  const {
    currentSession,
    currentDevice,
    riskScore,
    isConnected,
    lastActivity,
    getTimeUntilExpiry,
    formatSessionDuration,
    isSessionValid,
  } = useSessionContext();

  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTimeUntilExpiry(getTimeUntilExpiry());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilExpiry]);

  // Get session status
  const sessionValid = isSessionValid();
  const riskLevel = AuthUtils.Format.formatRiskScore(riskScore);

  // Get device icon
  const getDeviceIcon = () => {
    if (!currentDevice) return <Monitor className="w-4 h-4" />;

    const deviceType = AuthUtils.Device.detectDeviceType(currentDevice.user_agent);
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  // Format time until expiry
  const formatTimeUntilExpiry = (ms: number): string => {
    if (ms <= 0) return "Expired";

    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (!currentSession) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <XCircle className="w-4 h-4" />
        <span className="text-sm">No active session</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Session Status */}
        <div className="flex items-center space-x-1">
          {sessionValid ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">{sessionValid ? "Active" : "Invalid"}</span>
        </div>

        {/* Time Until Expiry */}
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatTimeUntilExpiry(timeUntilExpiry)}</span>
        </div>

        {/* Risk Score */}
        {showRiskScore && (
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" style={{ color: riskLevel.color }} />
            <span className="text-sm" style={{ color: riskLevel.color }}>
              {riskScore}%
            </span>
          </div>
        )}

        {/* Connection Status */}
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Status</h3>
        <div className="flex items-center space-x-2">
          {sessionValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${sessionValid ? "text-green-700" : "text-red-700"}`}
          >
            {sessionValid ? "Active" : "Invalid"}
          </span>
        </div>
      </div>

      {/* Session Details */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Session Duration */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">{formatSessionDuration()}</p>
            </div>
          </div>

          {/* Time Until Expiry */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Expires In</p>
              <p
                className={`text-sm ${
                  timeUntilExpiry < 15 * 60 * 1000 ? "text-red-600" : "text-gray-600"
                }`}
              >
                {formatTimeUntilExpiry(timeUntilExpiry)}
              </p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Last Activity</p>
              <p className="text-sm text-gray-600">
                {lastActivity ? AuthUtils.Format.formatRelativeTime(lastActivity) : "Unknown"}
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connection</p>
              <p className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Score */}
      {showRiskScore && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" style={{ color: riskLevel.color }} />
              <span className="text-sm font-medium text-gray-900">Security Risk</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: riskLevel.color }}>
              {riskLevel.description}
            </span>
          </div>

          {/* Risk Score Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${riskScore}%`,
                backgroundColor: riskLevel.color,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
      )}

      {/* Device Information */}
      {showDeviceInfo && currentDevice && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Device</h4>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">{getDeviceIcon()}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {AuthUtils.Format.formatDeviceName({
                  userAgent: currentDevice.user_agent,
                  platform: currentDevice.platform,
                  screenWidth: currentDevice.screen_width,
                  screenHeight: currentDevice.screen_height,
                  timezone: currentDevice.timezone,
                  language: currentDevice.language,
                })}
              </p>

              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                {currentDevice.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {currentDevice.location.city}, {currentDevice.location.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentDevice.is_trusted ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span>{currentDevice.is_trusted ? "Trusted" : "Untrusted"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for expiring session */}
      {timeUntilExpiry < 15 * 60 * 1000 && timeUntilExpiry > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your session will expire in {formatTimeUntilExpiry(timeUntilExpiry)}. Activity will
              extend your session automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionStatus;

// Session Metrics Component
// Story 1.4: Session Management & Security Implementation

"use client";

import React, { useState, useEffect } from "react";
import type { useSessionContext } from "../context";
import type { AuthUtils } from "../utils";
import type {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Shield,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { SessionMetrics as SessionMetricsType } from "../types";

interface SessionMetricsProps {
  className?: string;
  timeRange?: "1h" | "24h" | "7d" | "30d";
  showExport?: boolean;
  compact?: boolean;
}

export function SessionMetrics({
  className = "",
  timeRange = "24h",
  showExport = true,
  compact = false,
}: SessionMetricsProps) {
  const { sessionMetrics, exportSessionData } = useSessionContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mock metrics data (in real implementation, this would come from the API)
  const [metrics, setMetrics] = useState<SessionMetricsType | null>(null);

  useEffect(() => {
    // Simulate loading metrics
    setIsLoading(true);
    const timer = setTimeout(() => {
      setMetrics({
        totalSessions: 156,
        activeSessions: 12,
        averageSessionDuration: 1800000, // 30 minutes in ms
        securityEvents: 3,
        deviceCount: 8,
        locationCount: 4,
        sessionsByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 20) + 1,
        })),
        securityEventsByType: [
          { type: "suspicious_login", count: 2 },
          { type: "unusual_location", count: 1 },
          { type: "device_change", count: 0 },
        ],
        topLocations: [
          { city: "São Paulo", country: "Brazil", count: 45 },
          { city: "Rio de Janeiro", country: "Brazil", count: 32 },
          { city: "Brasília", country: "Brazil", count: 18 },
        ],
        topDevices: [
          { type: "desktop", count: 89 },
          { type: "mobile", count: 45 },
          { type: "tablet", count: 22 },
        ],
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTimeRange]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSessionData({
        format: "csv",
        timeRange: selectedTimeRange,
        includeSecurityEvents: true,
        includeDeviceInfo: true,
      });
    } catch (error) {
      console.error("Failed to export session data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  // Get security status color
  const getSecurityStatusColor = (eventCount: number) => {
    if (eventCount === 0) return "text-green-600";
    if (eventCount <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  // Get security status icon
  const getSecurityStatusIcon = (eventCount: number) => {
    if (eventCount === 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (eventCount <= 2) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.activeSessions || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p
                  className={`text-2xl font-bold ${getSecurityStatusColor(metrics?.securityEvents || 0)}`}
                >
                  {metrics?.securityEvents || 0}
                </p>
              </div>
              {getSecurityStatusIcon(metrics?.securityEvents || 0)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Quick Stats</h4>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Session Duration</span>
              <span className="font-medium">
                {AuthUtils.Format.formatDuration(metrics?.averageSessionDuration || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registered Devices</span>
              <span className="font-medium">{metrics?.deviceCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Locations</span>
              <span className="font-medium">{metrics?.locationCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Session Metrics</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Export Button */}
          {showExport && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-sm text-gray-500">Loading metrics...</p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sessions */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics?.totalSessions || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedTimeRange === "1h"
                      ? "This hour"
                      : selectedTimeRange === "24h"
                        ? "Today"
                        : selectedTimeRange === "7d"
                          ? "This week"
                          : "This month"}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-900">
                    {metrics?.activeSessions || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Currently online</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Average Duration */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg. Duration</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {AuthUtils.Format.formatDuration(metrics?.averageSessionDuration || 0, true)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Per session</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Security Events */}
            <div
              className={`bg-gradient-to-r p-4 rounded-lg ${
                (metrics?.securityEvents || 0) === 0
                  ? "from-green-50 to-green-100"
                  : (metrics?.securityEvents || 0) <= 2
                    ? "from-yellow-50 to-yellow-100"
                    : "from-red-50 to-red-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      (metrics?.securityEvents || 0) === 0
                        ? "text-green-600"
                        : (metrics?.securityEvents || 0) <= 2
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    Security Events
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      (metrics?.securityEvents || 0) === 0
                        ? "text-green-900"
                        : (metrics?.securityEvents || 0) <= 2
                          ? "text-yellow-900"
                          : "text-red-900"
                    }`}
                  >
                    {metrics?.securityEvents || 0}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      (metrics?.securityEvents || 0) === 0
                        ? "text-green-600"
                        : (metrics?.securityEvents || 0) <= 2
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {(metrics?.securityEvents || 0) === 0 ? "All secure" : "Needs attention"}
                  </p>
                </div>
                {getSecurityStatusIcon(metrics?.securityEvents || 0)}
              </div>
            </div>
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions by Hour */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Sessions by Hour
              </h4>

              <div className="space-y-2">
                {metrics?.sessionsByHour?.slice(0, 8).map((item) => (
                  <div key={item.hour} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {String(item.hour).padStart(2, "0")}:00
                    </span>
                    <div className="flex items-center space-x-2 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(item.count / Math.max(...(metrics?.sessionsByHour?.map((s) => s.count) || [1]))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Events by Type */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security Events by Type
              </h4>

              <div className="space-y-3">
                {metrics?.securityEventsByType?.map((event) => (
                  <div key={event.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {event.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          event.count === 0
                            ? "bg-green-500"
                            : event.count <= 2
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900">{event.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Top Locations
              </h4>

              <div className="space-y-3">
                {metrics?.topLocations?.map((location, index) => (
                  <div
                    key={`${location.city}-${location.country}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500 w-4">#{index + 1}</span>
                      <span className="text-sm text-gray-900">
                        {location.city}, {location.country}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{location.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Devices */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Device Types
              </h4>

              <div className="space-y-3">
                {metrics?.topDevices?.map((device) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{device.type}</span>
                    <div className="flex items-center space-x-2 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{
                            width: `${(device.count / Math.max(...(metrics?.topDevices?.map((d) => d.count) || [1]))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{device.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionMetrics;

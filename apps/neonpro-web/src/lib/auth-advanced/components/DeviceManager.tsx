// Device Manager Component
// Story 1.4: Session Management & Security Implementation

"use client";

import React, { useState } from "react";
import type { useSessionContext } from "../context";
import type { AuthUtils } from "../utils";
import type {
  Monitor,
  Smartphone,
  Tablet,
  Shield,
  ShieldCheck,
  ShieldX,
  MapPin,
  Clock,
  MoreVertical,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
} from "lucide-react";
import type { DeviceRegistration } from "../types";

interface DeviceManagerProps {
  className?: string;
  showCurrentDevice?: boolean;
  allowDeviceActions?: boolean;
  compact?: boolean;
}

export function DeviceManager({
  className = "",
  showCurrentDevice = true,
  allowDeviceActions = true,
  compact = false,
}: DeviceManagerProps) {
  const { currentDevice, registeredDevices, trustDevice, blockDevice } = useSessionContext();

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());

  // Get device icon based on type
  const getDeviceIcon = (device: DeviceRegistration) => {
    const deviceType = AuthUtils.Device.detectDeviceType(device.user_agent);
    const iconClass = "w-5 h-5";

    switch (deviceType) {
      case "mobile":
        return <Smartphone className={iconClass} />;
      case "tablet":
        return <Tablet className={iconClass} />;
      default:
        return <Monitor className={iconClass} />;
    }
  };

  // Get device status color
  const getDeviceStatusColor = (device: DeviceRegistration) => {
    if (device.is_blocked) return "text-red-500";
    if (device.is_trusted) return "text-green-500";
    return "text-yellow-500";
  };

  // Get device status text
  const getDeviceStatusText = (device: DeviceRegistration) => {
    if (device.is_blocked) return "Blocked";
    if (device.is_trusted) return "Trusted";
    return "Untrusted";
  };

  // Get device status icon
  const getDeviceStatusIcon = (device: DeviceRegistration) => {
    if (device.is_blocked) return <ShieldX className="w-4 h-4 text-red-500" />;
    if (device.is_trusted) return <ShieldCheck className="w-4 h-4 text-green-500" />;
    return <Shield className="w-4 h-4 text-yellow-500" />;
  };

  // Handle trust device
  const handleTrustDevice = async (deviceId: string) => {
    setActionLoading(deviceId);
    try {
      await trustDevice(deviceId);
    } catch (error) {
      console.error("Failed to trust device:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle block device
  const handleBlockDevice = async (deviceId: string) => {
    setActionLoading(deviceId);
    try {
      await blockDevice(deviceId);
    } catch (error) {
      console.error("Failed to block device:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle device details
  const toggleDetails = (deviceId: string) => {
    const newShowDetails = new Set(showDetails);
    if (newShowDetails.has(deviceId)) {
      newShowDetails.delete(deviceId);
    } else {
      newShowDetails.add(deviceId);
    }
    setShowDetails(newShowDetails);
  };

  // Format device name
  const formatDeviceName = (device: DeviceRegistration) => {
    return AuthUtils.Format.formatDeviceName({
      userAgent: device.user_agent,
      platform: device.platform,
      screenWidth: device.screen_width,
      screenHeight: device.screen_height,
      timezone: device.timezone,
      language: device.language,
    });
  };

  // Get trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Current Device */}
        {showCurrentDevice && currentDevice && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {getDeviceIcon(currentDevice)}
              <div>
                <p className="text-sm font-medium text-gray-900">Current Device</p>
                <p className="text-xs text-gray-600 truncate max-w-48">
                  {formatDeviceName(currentDevice)}
                </p>
              </div>
            </div>
            {getDeviceStatusIcon(currentDevice)}
          </div>
        )}

        {/* Other Devices */}
        {registeredDevices
          .filter((device) => device.id !== currentDevice?.id)
          .slice(0, 3)
          .map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {getDeviceIcon(device)}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {formatDeviceName(device).split(" on ")[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {AuthUtils.Format.formatRelativeTime(new Date(device.last_seen))}
                  </p>
                </div>
              </div>
              {getDeviceStatusIcon(device)}
            </div>
          ))}

        {registeredDevices.length > 4 && (
          <p className="text-xs text-gray-500 text-center">
            +{registeredDevices.length - 4} more devices
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Device Management</h3>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {registeredDevices.length}
          </span>
        </div>

        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Current Device */}
      {showCurrentDevice && currentDevice && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Current Device</h4>
            {getDeviceStatusIcon(currentDevice)}
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">{getDeviceIcon(currentDevice)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{formatDeviceName(currentDevice)}</p>

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
                  <Clock className="w-3 h-3" />
                  <span>
                    {AuthUtils.Format.formatRelativeTime(new Date(currentDevice.last_seen))}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className={getTrustScoreColor(currentDevice.trust_score)}>
                    Trust: {currentDevice.trust_score}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registered Devices */}
      <div className="divide-y">
        {registeredDevices
          .filter((device) => device.id !== currentDevice?.id)
          .map((device) => {
            const isSelected = selectedDevice === device.id;
            const isLoading = actionLoading === device.id;
            const showDeviceDetails = showDetails.has(device.id);

            return (
              <div key={device.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">{getDeviceIcon(device)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {formatDeviceName(device)}
                        </h4>
                        {getDeviceStatusIcon(device)}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        {device.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {device.location.city}, {device.location.country}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Last seen{" "}
                            {AuthUtils.Format.formatRelativeTime(new Date(device.last_seen))}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className={getTrustScoreColor(device.trust_score)}>
                            Trust: {device.trust_score}%
                          </span>
                        </div>
                      </div>

                      {/* Device Actions */}
                      {allowDeviceActions && (
                        <div className="flex items-center space-x-2">
                          {!device.is_trusted && !device.is_blocked && (
                            <button
                              onClick={() => handleTrustDevice(device.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Trust
                            </button>
                          )}

                          {!device.is_blocked && (
                            <button
                              onClick={() => handleBlockDevice(device.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Block
                            </button>
                          )}

                          <button
                            onClick={() => toggleDetails(device.id)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {showDeviceDetails ? "Hide" : "Details"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Device Details */}
                {showDeviceDetails && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Device Information</h5>
                        <div className="space-y-1 text-gray-600">
                          <div>
                            <span className="font-medium">Platform:</span> {device.platform}
                          </div>
                          <div>
                            <span className="font-medium">Screen:</span> {device.screen_width}x
                            {device.screen_height}
                          </div>
                          <div>
                            <span className="font-medium">Timezone:</span> {device.timezone}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span> {device.language}
                          </div>
                          <div>
                            <span className="font-medium">Fingerprint:</span> {device.fingerprint}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Security Information</h5>
                        <div className="space-y-1 text-gray-600">
                          <div>
                            <span className="font-medium">Trust Score:</span>
                            <span className={getTrustScoreColor(device.trust_score)}>
                              {device.trust_score}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className={getDeviceStatusColor(device)}>
                              {getDeviceStatusText(device)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">First Seen:</span>
                            {new Date(device.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Last Seen:</span>
                            {AuthUtils.Format.formatRelativeTime(new Date(device.last_seen))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {device.location && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Location Information</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">City:</span> {device.location.city}
                          </div>
                          <div>
                            <span className="font-medium">Country:</span> {device.location.country}
                          </div>
                          <div>
                            <span className="font-medium">IP:</span> {device.location.ip_address}
                          </div>
                          {device.location.isVPN && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-600">VPN Detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Empty State */}
      {registeredDevices.length === 0 && (
        <div className="p-8 text-center">
          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No devices registered</h3>
          <p className="text-sm text-gray-500">
            Devices will appear here when you sign in from different browsers or devices.
          </p>
        </div>
      )}
    </div>
  );
}

export default DeviceManager;

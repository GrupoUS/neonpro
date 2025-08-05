// =====================================================
// DeviceManagement Component - Trusted Device Management
// Story 1.4: Session Management & Security
// =====================================================

"use client";

import type {
  AlertTriangle,
  CheckCircle,
  Clock,
  Laptop,
  MapPin,
  Monitor,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Separator } from "@/components/ui/separator";
import type { useDeviceManagement } from "@/hooks/auth";
import type { cn } from "@/lib/utils";

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface DeviceManagementProps {
  className?: string;
  showAddDevice?: boolean;
  showRemoveDevice?: boolean;
  maxDevices?: number;
}

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet" | "unknown";
  fingerprint: string;
  isTrusted: boolean;
  riskLevel: "low" | "medium" | "high";
  lastSeen: string;
  location?: string;
  ipAddress: string;
  userAgent: string;
  isCurrentDevice: boolean;
  createdAt: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DeviceManagement({
  className,
  showAddDevice = true,
  showRemoveDevice = true,
  maxDevices = 5,
}: DeviceManagementProps) {
  const {
    devices,
    currentDevice,
    isLoading,
    registerDevice,
    trustDevice,
    untrustDevice,
    removeDevice,
    reportSuspiciousDevice,
    refreshDevices,
  } = useDeviceManagement();

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showTrustDialog, setShowTrustDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    refreshDevices();
  }, []);

  // Device type icon mapping
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      case "laptop":
        return Laptop;
      default:
        return Monitor;
    }
  };

  // Risk level colors
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Risk level badge variant
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Handle device registration
  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    try {
      await registerDevice();
      await refreshDevices();
    } catch (error) {
      console.error("Failed to register device:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle device trust toggle
  const handleTrustToggle = async (device: Device) => {
    try {
      if (device.isTrusted) {
        await untrustDevice(device.id);
      } else {
        await trustDevice(device.id);
      }
      await refreshDevices();
      setShowTrustDialog(false);
    } catch (error) {
      console.error("Failed to toggle device trust:", error);
    }
  };

  // Handle device removal
  const handleRemoveDevice = async (device: Device) => {
    try {
      await removeDevice(device.id);
      await refreshDevices();
      setShowRemoveDialog(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error("Failed to remove device:", error);
    }
  };

  // Handle suspicious device report
  const handleReportSuspicious = async (device: Device) => {
    try {
      await reportSuspiciousDevice(device.id, "User reported as suspicious");
      await refreshDevices();
    } catch (error) {
      console.error("Failed to report device:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Device Management
            </div>
            <Badge variant="outline">
              {devices.length}/{maxDevices} devices
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Device Alert */}
          {currentDevice && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Current device: <strong>{currentDevice.name}</strong>
                {currentDevice.isTrusted ? " (Trusted)" : " (Not trusted)"}
              </AlertDescription>
            </Alert>
          )}

          {/* Add Device Button */}
          {showAddDevice && devices.length < maxDevices && (
            <Button onClick={handleRegisterDevice} disabled={isRegistering} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isRegistering ? "Registering..." : "Register This Device"}
            </Button>
          )}

          {/* Device List */}
          <div className="space-y-3">
            {devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);

              return (
                <div
                  key={device.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    device.isCurrentDevice
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{device.name}</span>
                          {device.isCurrentDevice && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{device.location || "Unknown location"}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            <span>{device.ipAddress}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(device.lastSeen).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Trust Status */}
                      <div className="flex items-center gap-1">
                        {device.isTrusted ? (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-orange-600" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
                            device.isTrusted ? "text-green-600" : "text-orange-600",
                          )}
                        >
                          {device.isTrusted ? "Trusted" : "Untrusted"}
                        </span>
                      </div>

                      {/* Risk Level */}
                      <Badge variant={getRiskBadgeVariant(device.riskLevel)} className="text-xs">
                        {device.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Device Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowTrustDialog(true);
                      }}
                    >
                      {device.isTrusted ? "Untrust" : "Trust"}
                    </Button>

                    {!device.isCurrentDevice && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportSuspicious(device)}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Report
                        </Button>

                        {showRemoveDevice && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedDevice(device);
                              setShowRemoveDialog(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {devices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No devices registered</p>
              <p className="text-sm">Register this device to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Dialog */}
      <Dialog open={showTrustDialog} onOpenChange={setShowTrustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDevice?.isTrusted ? "Untrust Device" : "Trust Device"}
            </DialogTitle>
            <DialogDescription>
              {selectedDevice?.isTrusted
                ? `Are you sure you want to untrust "${selectedDevice?.name}"? This device will require additional verification for future logins.`
                : `Are you sure you want to trust "${selectedDevice?.name}"? This device will be allowed to access your account with reduced security checks.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedDevice && handleTrustToggle(selectedDevice)}>
              {selectedDevice?.isTrusted ? "Untrust" : "Trust"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "<strong>{selectedDevice?.name}</strong>"? This action
              cannot be undone and the device will need to be re-registered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedDevice && handleRemoveDevice(selectedDevice)}
            >
              Remove Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default DeviceManagement;

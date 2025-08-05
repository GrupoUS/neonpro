// Device API Routes
// Story 1.4: Session Management & Security Implementation

import type { NextRequest, NextResponse } from "next/server";
import type { DeviceManager } from "../device-manager";
import type { SecurityMonitor } from "../security-monitor";
import type { SessionManager } from "../session-manager";
import type { DeviceInfo, DeviceRegistration } from "../types";
import type { ValidationUtils } from "../utils";

/**
 * Device API route handlers
 */
export class DeviceRoutes {
  constructor(
    private deviceManager: DeviceManager,
    private sessionManager: SessionManager,
    private securityMonitor: SecurityMonitor,
  ) {}

  /**
   * Register new device
   * POST /api/auth/devices/register
   */
  async registerDevice(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { userId, deviceInfo } = body;

      if (!userId || !deviceInfo) {
        return NextResponse.json(
          { error: "Missing required fields: userId, deviceInfo" },
          { status: 400 },
        );
      }

      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "unknown";

      // Validate device info
      if (!this.validateDeviceInfo(deviceInfo)) {
        return NextResponse.json({ error: "Invalid device information" }, { status: 400 });
      }

      const deviceRegistration: DeviceRegistration = {
        ...deviceInfo,
        userId,
        ipAddress: clientIP,
        userAgent,
        registeredAt: new Date(),
      };

      const deviceId = await this.deviceManager.registerDevice(deviceRegistration);

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: "device_registered",
        userId,
        severity: "info",
        details: {
          deviceId,
          deviceType: deviceInfo.type,
          platform: deviceInfo.platform,
          ipAddress: clientIP,
        },
        timestamp: new Date(),
        ipAddress: clientIP,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        deviceId,
        message: "Device registered successfully",
      });
    } catch (error) {
      console.error("Register device error:", error);
      return NextResponse.json({ error: "Failed to register device" }, { status: 500 });
    }
  }

  /**
   * Get user devices
   * GET /api/auth/devices/user/:userId
   */
  async getUserDevices(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      // Verify authorization
      const authResult = await this.verifyAuthorization(request, userId);
      if (authResult) return authResult;

      const devices = await this.deviceManager.getUserDevices(userId);

      return NextResponse.json({
        success: true,
        devices,
        count: devices.length,
      });
    } catch (error) {
      console.error("Get user devices error:", error);
      return NextResponse.json({ error: "Failed to get user devices" }, { status: 500 });
    }
  }

  /**
   * Get device info
   * GET /api/auth/devices/:deviceId
   */
  async getDevice(request: NextRequest, deviceId: string): Promise<NextResponse> {
    try {
      const device = await this.deviceManager.getDevice(deviceId);

      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      // Verify authorization
      const authResult = await this.verifyAuthorization(request, device.userId);
      if (authResult) return authResult;

      return NextResponse.json({
        success: true,
        device,
      });
    } catch (error) {
      console.error("Get device error:", error);
      return NextResponse.json({ error: "Failed to get device" }, { status: 500 });
    }
  }

  /**
   * Update device trust level
   * PUT /api/auth/devices/:deviceId/trust
   */
  async updateDeviceTrust(request: NextRequest, deviceId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { trusted, reason } = body;

      if (typeof trusted !== "boolean") {
        return NextResponse.json({ error: "Invalid trust value" }, { status: 400 });
      }

      const device = await this.deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      // Verify authorization
      const authResult = await this.verifyAuthorization(request, device.userId);
      if (authResult) return authResult;

      const success = await this.deviceManager.updateDeviceTrust(deviceId, trusted, reason);

      if (!success) {
        return NextResponse.json({ error: "Failed to update device trust" }, { status: 400 });
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: trusted ? "device_trusted" : "device_untrusted",
        userId: device.userId,
        severity: "info",
        details: {
          deviceId,
          trusted,
          reason,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: `Device ${trusted ? "trusted" : "untrusted"} successfully`,
      });
    } catch (error) {
      console.error("Update device trust error:", error);
      return NextResponse.json({ error: "Failed to update device trust" }, { status: 500 });
    }
  }

  /**
   * Block/unblock device
   * PUT /api/auth/devices/:deviceId/block
   */
  async blockDevice(request: NextRequest, deviceId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { blocked, reason } = body;

      if (typeof blocked !== "boolean") {
        return NextResponse.json({ error: "Invalid block value" }, { status: 400 });
      }

      const device = await this.deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      // Verify authorization (admin or device owner)
      const authResult = await this.verifyDeviceAuthorization(request, device.userId);
      if (authResult) return authResult;

      const success = await this.deviceManager.blockDevice(deviceId, blocked, reason);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update device block status" },
          { status: 400 },
        );
      }

      // If blocking device, terminate all sessions for this device
      if (blocked) {
        await this.sessionManager.terminateDeviceSessions(deviceId, "device_blocked");
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: blocked ? "device_blocked" : "device_unblocked",
        userId: device.userId,
        severity: blocked ? "warning" : "info",
        details: {
          deviceId,
          blocked,
          reason,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: `Device ${blocked ? "blocked" : "unblocked"} successfully`,
      });
    } catch (error) {
      console.error("Block device error:", error);
      return NextResponse.json({ error: "Failed to update device block status" }, { status: 500 });
    }
  }

  /**
   * Remove device
   * DELETE /api/auth/devices/:deviceId
   */
  async removeDevice(request: NextRequest, deviceId: string): Promise<NextResponse> {
    try {
      const device = await this.deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      // Verify authorization
      const authResult = await this.verifyAuthorization(request, device.userId);
      if (authResult) return authResult;

      // Terminate all sessions for this device
      await this.sessionManager.terminateDeviceSessions(deviceId, "device_removed");

      const success = await this.deviceManager.removeDevice(deviceId);

      if (!success) {
        return NextResponse.json({ error: "Failed to remove device" }, { status: 400 });
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: "device_removed",
        userId: device.userId,
        severity: "info",
        details: {
          deviceId,
          deviceType: device.type,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: "Device removed successfully",
      });
    } catch (error) {
      console.error("Remove device error:", error);
      return NextResponse.json({ error: "Failed to remove device" }, { status: 500 });
    }
  }

  /**
   * Validate device fingerprint
   * POST /api/auth/devices/validate
   */
  async validateDevice(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { deviceId, fingerprint } = body;

      if (!deviceId || !fingerprint) {
        return NextResponse.json(
          { error: "Missing required fields: deviceId, fingerprint" },
          { status: 400 },
        );
      }

      const isValid = await this.deviceManager.validateDevice(deviceId, fingerprint);

      const device = await this.deviceManager.getDevice(deviceId);
      const trustScore = device ? await this.deviceManager.calculateTrustScore(device) : 0;

      return NextResponse.json({
        success: true,
        valid: isValid,
        trustScore,
        device: device
          ? {
              id: device.id,
              name: device.name,
              type: device.type,
              trusted: device.trusted,
              blocked: device.blocked,
            }
          : null,
      });
    } catch (error) {
      console.error("Validate device error:", error);
      return NextResponse.json({ error: "Failed to validate device" }, { status: 500 });
    }
  }

  /**
   * Get device analytics
   * GET /api/auth/devices/analytics
   */
  async getDeviceAnalytics(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const period = url.searchParams.get("period") || "30d";
      const userId = url.searchParams.get("userId");

      const analytics = await this.deviceManager.getDeviceAnalytics({
        period,
        userId: userId || undefined,
      });

      return NextResponse.json({
        success: true,
        analytics,
        period,
      });
    } catch (error) {
      console.error("Get device analytics error:", error);
      return NextResponse.json({ error: "Failed to get device analytics" }, { status: 500 });
    }
  }

  /**
   * Update device info
   * PUT /api/auth/devices/:deviceId
   */
  async updateDevice(request: NextRequest, deviceId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { name, location } = body;

      const device = await this.deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      // Verify authorization
      const authResult = await this.verifyAuthorization(request, device.userId);
      if (authResult) return authResult;

      const updateData: Partial<DeviceInfo> = {};
      if (name) updateData.name = name;
      if (location) updateData.location = location;

      const success = await this.deviceManager.updateDevice(deviceId, updateData);

      if (!success) {
        return NextResponse.json({ error: "Failed to update device" }, { status: 400 });
      }

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: "device_updated",
        userId: device.userId,
        severity: "info",
        details: {
          deviceId,
          updates: updateData,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: "Device updated successfully",
      });
    } catch (error) {
      console.error("Update device error:", error);
      return NextResponse.json({ error: "Failed to update device" }, { status: 500 });
    }
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIP || "unknown";
  }

  private validateDeviceInfo(deviceInfo: any): boolean {
    const required = ["name", "type", "platform", "fingerprint"];
    return required.every((field) => deviceInfo[field]);
  }

  private async verifyAuthorization(
    request: NextRequest,
    userId: string,
  ): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
  }

  private async verifyDeviceAuthorization(
    request: NextRequest,
    userId: string,
  ): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Allow device owner or admin
    if (session.userId !== userId && !["owner", "manager"].includes(session.userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
  }

  private async verifyAdminAuthorization(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);

    if (!session || !["owner", "manager"].includes(session.userRole)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    return null;
  }
}

/**
 * Create device routes handler
 */
export function createDeviceRoutes(
  deviceManager: DeviceManager,
  sessionManager: SessionManager,
  securityMonitor: SecurityMonitor,
) {
  return new DeviceRoutes(deviceManager, sessionManager, securityMonitor);
}

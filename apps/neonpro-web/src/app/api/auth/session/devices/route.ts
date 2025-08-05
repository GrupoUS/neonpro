/**
 * Device Management API Route
 * Manages trusted devices and device registration
 */

import type { NextRequest, NextResponse } from "next/server";
import type { SessionManager } from "@/lib/auth/session/SessionManager";
import type { createClient } from "@/lib/supabase/server";
import type { SecurityEventType, SecuritySeverity, DeviceType } from "@/types/session";

// Initialize session manager
let sessionManager: SessionManager | null = null;

async function getSessionManager() {
  if (!sessionManager) {
    const supabase = await createClient();
    sessionManager = new SessionManager(supabase, {
      defaultTimeout: 30,
      maxConcurrentSessions: 5,
      enableDeviceTracking: true,
      enableSecurityMonitoring: true,
      enableSuspiciousActivityDetection: true,
      sessionCleanupInterval: 300000,
      securityEventRetention: 30 * 24 * 60 * 60 * 1000,
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY || "default-key-change-in-production",
    });
  }
  return sessionManager;
}

// Get user devices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const manager = await getSessionManager();
    const devices = await manager.getUserDevices(userId);

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Get devices error:", error);

    return NextResponse.json(
      { error: "Internal server error while fetching devices" },
      { status: 500 },
    );
  }
}

// Register new device
export async function POST(request: NextRequest) {
  try {
    const { userId, deviceName, deviceType, trusted = false } = await request.json();

    if (!userId || !deviceName || !deviceType) {
      return NextResponse.json(
        { error: "User ID, device name, and device type are required" },
        { status: 400 },
      );
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Register the device
    const device = await manager.registerDevice({
      user_id: userId,
      device_name: deviceName,
      device_type: deviceType as DeviceType,
      ip_address: clientIP,
      user_agent: userAgent,
      trusted,
      last_seen: new Date().toISOString(),
    });

    // Log device registration event
    await manager.logSecurityEvent({
      session_id: "device-registration",
      event_type: SecurityEventType.DEVICE_REGISTERED,
      severity: trusted ? SecuritySeverity.LOW : SecuritySeverity.MEDIUM,
      description: `New device registered: ${deviceName}`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        user_id: userId,
        device_id: device.id,
        device_name: deviceName,
        device_type: deviceType,
        trusted,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ device });
  } catch (error) {
    console.error("Device registration error:", error);

    return NextResponse.json(
      { error: "Internal server error during device registration" },
      { status: 500 },
    );
  }
}

// Update device (trust/untrust)
export async function PUT(request: NextRequest) {
  try {
    const { deviceId, trusted, deviceName } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Update device
    const updatedDevice = await manager.updateDevice(deviceId, {
      trusted,
      device_name: deviceName,
      last_seen: new Date().toISOString(),
    });

    if (!updatedDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Log device update event
    await manager.logSecurityEvent({
      session_id: "device-update",
      event_type: trusted ? SecurityEventType.DEVICE_TRUSTED : SecurityEventType.DEVICE_UNTRUSTED,
      severity: SecuritySeverity.MEDIUM,
      description: `Device ${trusted ? "trusted" : "untrusted"}: ${deviceName || deviceId}`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        device_id: deviceId,
        device_name: deviceName,
        trusted,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ device: updatedDevice });
  } catch (error) {
    console.error("Device update error:", error);

    return NextResponse.json(
      { error: "Internal server error during device update" },
      { status: 500 },
    );
  }
}

// Remove device
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Get device info before deletion
    const device = await manager.getDevice(deviceId);

    // Remove device
    const removed = await manager.removeDevice(deviceId);

    if (!removed) {
      return NextResponse.json(
        { error: "Device not found or could not be removed" },
        { status: 404 },
      );
    }

    // Log device removal event
    await manager.logSecurityEvent({
      session_id: "device-removal",
      event_type: SecurityEventType.DEVICE_REMOVED,
      severity: SecuritySeverity.MEDIUM,
      description: `Device removed: ${device?.device_name || deviceId}`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        device_id: deviceId,
        device_name: device?.device_name,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Device removed successfully",
    });
  } catch (error) {
    console.error("Device removal error:", error);

    return NextResponse.json(
      { error: "Internal server error during device removal" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

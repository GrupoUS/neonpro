// =====================================================
// Device Management API Routes
// Story 1.4: Session Management & Security
// =====================================================

import type { NextRequest } from "next/server";

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const registerDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["desktop", "mobile", "tablet", "unknown"]),
  fingerprint: z.string().min(1),
  userAgent: z.string().min(1),
  location: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const trustDeviceSchema = z.object({
  deviceId: z.string().uuid(),
  trusted: z.boolean(),
});

const reportDeviceSchema = z.object({
  deviceId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  metadata: z.record(z.any()).optional(),
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "127.0.0.1";
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "Unknown";
}

async function initializeSessionSystem() {
  const supabase = createRouteHandlerClient({ cookies });
  return new UnifiedSessionSystem(supabase);
}

async function getCurrentUser() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

// =====================================================
// GET - List User Devices
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();

    // Get user devices
    const devices = await sessionSystem.deviceManager.getUserDevices(user.id);

    // Get current device info
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    const currentDeviceFingerprint = await sessionSystem.deviceManager.generateFingerprint({
      userAgent,
      ipAddress: clientIP,
    });

    // Mark current device
    const devicesWithCurrent = devices.map((device) => ({
      ...device,
      isCurrentDevice: device.fingerprint === currentDeviceFingerprint,
    }));

    return NextResponse.json({
      devices: devicesWithCurrent,
      total: devices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Devices GET error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// POST - Register or Manage Device
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();
    const { action } = body;

    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    switch (action) {
      case "register": {
        // Auto-generate device info if not provided
        const deviceInfo = {
          name: body.name || `Device ${new Date().toLocaleDateString()}`,
          type: body.type || "unknown",
          fingerprint:
            body.fingerprint ||
            (await sessionSystem.deviceManager.generateFingerprint({
              userAgent,
              ipAddress: clientIP,
            })),
          userAgent,
          location: body.location,
          metadata: {
            ...body.metadata,
            registeredAt: new Date().toISOString(),
            registrationIP: clientIP,
          },
        };

        const validation = registerDeviceSchema.safeParse(deviceInfo);
        if (!validation.success) {
          return NextResponse.json(
            { error: "Invalid device data", details: validation.error.errors },
            { status: 400 },
          );
        }

        // Register device
        const device = await sessionSystem.deviceManager.registerDevice(user.id, validation.data);

        // Log security event
        await sessionSystem.securityEventLogger.logEvent({
          type: "device_registered",
          severity: "low",
          description: `New device registered: ${device.name}`,
          userId: user.id,
          deviceId: device.id,
          ipAddress: clientIP,
          userAgent,
          metadata: { deviceInfo: validation.data },
        });

        return NextResponse.json({
          success: true,
          device,
          message: "Device registered successfully",
          timestamp: new Date().toISOString(),
        });
      }

      case "trust": {
        const validation = trustDeviceSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: "Invalid request data", details: validation.error.errors },
            { status: 400 },
          );
        }

        const { deviceId, trusted } = validation.data;

        // Verify device ownership
        const device = await sessionSystem.deviceManager.getDevice(deviceId);
        if (!device || device.userId !== user.id) {
          return NextResponse.json({ error: "Device not found or access denied" }, { status: 404 });
        }

        // Update trust status
        const success = trusted
          ? await sessionSystem.deviceManager.trustDevice(deviceId)
          : await sessionSystem.deviceManager.untrustDevice(deviceId);

        if (!success) {
          return NextResponse.json(
            { error: "Failed to update device trust status" },
            { status: 400 },
          );
        }

        // Log security event
        await sessionSystem.securityEventLogger.logEvent({
          type: trusted ? "device_trusted" : "device_untrusted",
          severity: "medium",
          description: `Device ${trusted ? "trusted" : "untrusted"}: ${device.name}`,
          userId: user.id,
          deviceId,
          ipAddress: clientIP,
          userAgent,
        });

        return NextResponse.json({
          success: true,
          message: `Device ${trusted ? "trusted" : "untrusted"} successfully`,
          timestamp: new Date().toISOString(),
        });
      }

      case "report": {
        const validation = reportDeviceSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: "Invalid request data", details: validation.error.errors },
            { status: 400 },
          );
        }

        const { deviceId, reason, metadata } = validation.data;

        // Verify device ownership
        const device = await sessionSystem.deviceManager.getDevice(deviceId);
        if (!device || device.userId !== user.id) {
          return NextResponse.json({ error: "Device not found or access denied" }, { status: 404 });
        }

        // Report suspicious device
        await sessionSystem.deviceManager.reportSuspiciousDevice(deviceId, reason);

        // Log security event
        await sessionSystem.securityEventLogger.logEvent({
          type: "device_reported_suspicious",
          severity: "high",
          description: `Device reported as suspicious: ${device.name}. Reason: ${reason}`,
          userId: user.id,
          deviceId,
          ipAddress: clientIP,
          userAgent,
          metadata: { reason, ...metadata },
        });

        return NextResponse.json({
          success: true,
          message: "Device reported successfully",
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Devices POST error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// PUT - Update Device
// =====================================================

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();
    const { deviceId, updates } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    // Verify device ownership
    const device = await sessionSystem.deviceManager.getDevice(deviceId);
    if (!device || device.userId !== user.id) {
      return NextResponse.json({ error: "Device not found or access denied" }, { status: 404 });
    }

    // Update device
    const success = await sessionSystem.deviceManager.updateDevice(deviceId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to update device" }, { status: 400 });
    }

    // Log security event
    await sessionSystem.securityEventLogger.logEvent({
      type: "device_updated",
      severity: "low",
      description: `Device updated: ${device.name}`,
      userId: user.id,
      deviceId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { updates },
    });

    return NextResponse.json({
      success: true,
      message: "Device updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Devices PUT error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// DELETE - Remove Device
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    // Verify device ownership
    const device = await sessionSystem.deviceManager.getDevice(deviceId);
    if (!device || device.userId !== user.id) {
      return NextResponse.json({ error: "Device not found or access denied" }, { status: 404 });
    }

    // Check if it's the current device
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    const currentFingerprint = await sessionSystem.deviceManager.generateFingerprint({
      userAgent,
      ipAddress: clientIP,
    });

    if (device.fingerprint === currentFingerprint) {
      return NextResponse.json({ error: "Cannot remove current device" }, { status: 400 });
    }

    // Remove device
    const success = await sessionSystem.deviceManager.removeDevice(deviceId);

    if (!success) {
      return NextResponse.json({ error: "Failed to remove device" }, { status: 400 });
    }

    // Log security event
    await sessionSystem.securityEventLogger.logEvent({
      type: "device_removed",
      severity: "medium",
      description: `Device removed: ${device.name}`,
      userId: user.id,
      deviceId,
      ipAddress: clientIP,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Device removed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Devices DELETE error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

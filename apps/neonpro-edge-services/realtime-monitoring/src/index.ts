import { validator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { AlertProcessor } from "./alert-processor";
import { NotificationManager } from "./notification-manager";
import { MonitoringSessionManager } from "./session-manager";
import type { Env, VitalSigns } from "./types";

const app = new Hono<{ Bindings: Env }>();

// CORS configuration for healthcare applications
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "https://neonpro.com.br",
        "https://app.neonpro.com.br",
        "https://admin.neonpro.com.br",
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      return allowedOrigins.includes(origin) || !origin;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Tenant-ID", "X-Client-Version"],
    credentials: true,
    maxAge: 86400,
  }),
);

// JWT Authentication middleware
app.use("/api/v1/*", async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: "HS256",
  });
  return jwtMiddleware(c, next);
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "neonpro-realtime-monitoring",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Date.now(),
  });
});

// WebSocket connection endpoint for real-time monitoring
app.get("/api/v1/ws/monitor/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const tenantId = c.req.header("X-Tenant-ID");
  const payload = c.get("jwtPayload");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  // Upgrade to WebSocket
  if (c.req.header("Upgrade") !== "websocket") {
    return c.json({ error: "WebSocket upgrade required" }, 400);
  }

  try {
    // Get or create monitoring session
    const sessionManager = new MonitoringSessionManager(c.env);
    const _session = await sessionManager.getOrCreateSession(sessionId, {
      tenantId,
      userId: payload.sub,
      userRole: payload.role,
      connectedAt: new Date().toISOString(),
      isActive: true,
    });

    // Create WebSocket pair
    const [client, server] = new WebSocketPair();

    // Handle WebSocket connection
    server.accept();

    // Store connection in Durable Object
    const durableObjectId = c.env.MONITORING_SESSION.idFromName(sessionId);
    const durableObject = c.env.MONITORING_SESSION.get(durableObjectId);

    await durableObject.fetch("http://websocket/connect", {
      method: "POST",
      headers: { Upgrade: "websocket" },
      body: JSON.stringify({ tenantId, userId: payload.sub }),
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  } catch (error) {
    return c.json(
      {
        error: "Failed to establish monitoring connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Server-Sent Events endpoint for real-time updates
app.get("/api/v1/sse/monitor/:type", async (c) => {
  const monitorType = c.req.param("type");
  const tenantId = c.req.header("X-Tenant-ID");
  const payload = c.get("jwtPayload");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  // Validate monitor type
  const validTypes = ["vital-signs", "appointments", "system-alerts", "user-activity"];
  if (!validTypes.includes(monitorType)) {
    return c.json({ error: "Invalid monitor type" }, 400);
  }

  // Create SSE stream
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Set up SSE headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Start monitoring and send updates
  const startMonitoring = async () => {
    try {
      // Send initial connection event
      await writer.write(
        new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: "connection",
            status: "connected",
            monitorType,
            timestamp: new Date().toISOString(),
          })}\n\n`,
        ),
      );

      // Get monitoring data based on type
      const notificationManager = new NotificationManager(c.env);
      const events = await notificationManager.getRealtimeEvents(
        tenantId,
        monitorType,
        payload.sub,
      );

      for (const event of events) {
        await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(async () => {
        try {
          await writer.write(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: new Date().toISOString(),
              })}\n\n`,
            ),
          );
        } catch (_error) {
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 seconds
    } catch (_error) {
      await writer.write(
        new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: "error",
            message: "Monitoring stream error",
            timestamp: new Date().toISOString(),
          })}\n\n`,
        ),
      );
    }
  };

  // Start monitoring in background
  startMonitoring();

  return new Response(readable, { headers });
});

// Submit vital signs data
const VitalSignsSchema = z.object({
  patientId: z.string().min(1),
  systolicBP: z.number().min(60).max(300).optional(),
  diastolicBP: z.number().min(30).max(200).optional(),
  heartRate: z.number().min(30).max(220).optional(),
  temperature: z.number().min(32).max(45).optional(),
  respiratoryRate: z.number().min(8).max(60).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  bloodGlucose: z.number().min(30).max(800).optional(),
  weight: z.number().min(1).max(500).optional(), // kg
  height: z.number().min(30).max(250).optional(), // cm
  notes: z.string().max(500).optional(),
  recordedBy: z.string().min(1),
  deviceId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

app.post("/api/v1/vital-signs", validator("json", VitalSignsSchema), async (c) => {
  const data = c.req.valid("json");
  const tenantId = c.req.header("X-Tenant-ID");
  const payload = c.get("jwtPayload");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    const vitalSignsId = uuidv4();
    const timestamp = data.timestamp || new Date().toISOString();

    const vitalSigns: VitalSigns = {
      id: vitalSignsId,
      patientId: data.patientId,
      tenantId,
      systolicBP: data.systolicBP,
      diastolicBP: data.diastolicBP,
      heartRate: data.heartRate,
      temperature: data.temperature,
      respiratoryRate: data.respiratoryRate,
      oxygenSaturation: data.oxygenSaturation,
      bloodGlucose: data.bloodGlucose,
      weight: data.weight,
      height: data.height,
      notes: data.notes,
      recordedBy: data.recordedBy,
      deviceId: data.deviceId,
      timestamp,
      createdAt: new Date().toISOString(),
    };

    // Store in D1 database
    await c.env.NEONPRO_DB.prepare(`
        INSERT INTO vital_signs (
          id, patient_id, tenant_id, systolic_bp, diastolic_bp, heart_rate,
          temperature, respiratory_rate, oxygen_saturation, blood_glucose,
          weight, height, notes, recorded_by, device_id, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        vitalSignsId,
        data.patientId,
        tenantId,
        data.systolicBP,
        data.diastolicBP,
        data.heartRate,
        data.temperature,
        data.respiratoryRate,
        data.oxygenSaturation,
        data.bloodGlucose,
        data.weight,
        data.height,
        data.notes,
        data.recordedBy,
        data.deviceId,
        timestamp,
        vitalSigns.createdAt,
      )
      .run();

    // Cache recent vital signs
    await c.env.MONITORING_CACHE.put(
      `vital-signs:${tenantId}:${data.patientId}:latest`,
      JSON.stringify(vitalSigns),
      { expirationTtl: 3600 }, // 1 hour
    );

    // Process alerts
    const alertProcessor = new AlertProcessor(c.env);
    const alerts = await alertProcessor.processVitalSigns(vitalSigns);

    // Send real-time notifications if alerts exist
    if (alerts.length > 0) {
      const notificationManager = new NotificationManager(c.env);
      for (const alert of alerts) {
        await notificationManager.sendRealtimeAlert(alert);
      }
    }

    // Audit log
    await c.env.AUDIT_LOGS.put(
      `vital-signs:${vitalSignsId}:${Date.now()}`,
      JSON.stringify({
        action: "vital_signs_recorded",
        userId: payload.sub,
        tenantId,
        resourceId: vitalSignsId,
        timestamp: new Date().toISOString(),
        metadata: { patientId: data.patientId, recordedBy: data.recordedBy },
      }),
    );

    return c.json(
      {
        success: true,
        vitalSignsId,
        alertsGenerated: alerts.length,
        message: "Vital signs recorded successfully",
      },
      201,
    );
  } catch (error) {
    return c.json(
      {
        error: "Failed to record vital signs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Get real-time vital signs for a patient
app.get("/api/v1/vital-signs/:patientId/realtime", async (c) => {
  const patientId = c.req.param("patientId");
  const tenantId = c.req.header("X-Tenant-ID");
  const _payload = c.get("jwtPayload");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    // Check cached latest vital signs
    const cached = await c.env.MONITORING_CACHE.get(`vital-signs:${tenantId}:${patientId}:latest`);

    if (cached) {
      const vitalSigns = JSON.parse(cached);
      return c.json({
        success: true,
        data: vitalSigns,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Query from database if not cached
    const result = await c.env.NEONPRO_DB.prepare(`
      SELECT * FROM vital_signs 
      WHERE patient_id = ? AND tenant_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `)
      .bind(patientId, tenantId)
      .first();

    if (!result) {
      return c.json({
        success: true,
        data: null,
        message: "No vital signs found for patient",
      });
    }

    return c.json({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        error: "Failed to retrieve vital signs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default app;
export { MonitoringSessionManager } from "./session-manager";

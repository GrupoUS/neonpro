import { DurableObject } from "@cloudflare/workers-types";
import type {
  Env,
  MonitoringSession,
  WebSocketMessage,
  WSSubscription,
  MonitorType,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export class MonitoringSessionManager implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, WSSubscription[]> = new Map();
  private heartbeatInterval?: number;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.startHeartbeat();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (request.method) {
      case "POST":
        if (path === "/connect") {
          return this.handleWebSocketConnect(request);
        }
        if (path === "/broadcast") {
          return this.handleBroadcast(request);
        }
        break;
      case "GET":
        if (path === "/sessions") {
          return this.getSessions();
        }
        if (path === "/metrics") {
          return this.getMetrics();
        }
        break;
    }

    return new Response("Not Found", { status: 404 });
  }

  private async handleWebSocketConnect(request: Request): Promise<Response> {
    try {
      const { tenantId, userId } = await request.json();
      const connectionId = uuidv4();

      // Upgrade to WebSocket
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("WebSocket upgrade required", { status: 400 });
      }

      const [client, server] = new WebSocketPair();
      server.accept();

      // Store connection
      this.connections.set(connectionId, server);
      this.subscriptions.set(connectionId, []);

      // Handle WebSocket events
      server.addEventListener("message", async (event) => {
        await this.handleWebSocketMessage(connectionId, event.data, { tenantId, userId });
      });

      server.addEventListener("close", () => {
        this.handleWebSocketClose(connectionId);
      });

      server.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        this.handleWebSocketClose(connectionId);
      });

      // Send connection acknowledgment
      const ackMessage: WebSocketMessage = {
        type: "connection_ack",
        data: {
          connectionId,
          tenantId,
          serverTime: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        messageId: uuidv4(),
      };

      server.send(JSON.stringify(ackMessage));

      // Store session info
      await this.state.storage.put(`session:${connectionId}`, {
        connectionId,
        tenantId,
        userId,
        connectedAt: new Date().toISOString(),
        isActive: true,
      });

      // Update metrics
      await this.updateConnectionMetrics(tenantId, 1);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error) {
      return new Response("Failed to establish connection", { status: 500 });
    }
  }

  private async handleWebSocketMessage(
    connectionId: string,
    message: string,
    context: { tenantId: string; userId: string },
  ): Promise<void> {
    try {
      const data = JSON.parse(message);
      const messageType = data.type;

      switch (messageType) {
        case "subscribe":
          await this.handleSubscribe(connectionId, data.subscription, context);
          break;

        case "unsubscribe":
          await this.handleUnsubscribe(connectionId, data.subscription, context);
          break;

        case "heartbeat":
          await this.handleHeartbeat(connectionId, context);
          break;

        default:
          console.warn("Unknown message type:", messageType);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);

      const errorMessage: WebSocketMessage = {
        type: "error",
        data: {
          message: "Invalid message format",
          originalMessage: message,
        },
        timestamp: new Date().toISOString(),
        messageId: uuidv4(),
      };

      const ws = this.connections.get(connectionId);
      if (ws) {
        ws.send(JSON.stringify(errorMessage));
      }
    }
  }

  private async handleSubscribe(
    connectionId: string,
    subscription: WSSubscription,
    context: { tenantId: string; userId: string },
  ): Promise<void> {
    const currentSubscriptions = this.subscriptions.get(connectionId) || [];

    // Check if already subscribed to this type
    const existingIndex = currentSubscriptions.findIndex((s) => s.type === subscription.type);

    if (existingIndex >= 0) {
      // Update existing subscription
      currentSubscriptions[existingIndex] = subscription;
    } else {
      // Add new subscription
      currentSubscriptions.push(subscription);
    }

    this.subscriptions.set(connectionId, currentSubscriptions);

    // Send subscription confirmation
    const confirmMessage: WebSocketMessage = {
      type: "subscribe",
      data: {
        subscribed: true,
        monitorType: subscription.type,
        filters: subscription.filters,
      },
      timestamp: new Date().toISOString(),
      messageId: uuidv4(),
    };

    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.send(JSON.stringify(confirmMessage));
    }

    // Send initial data for the subscription
    await this.sendInitialData(connectionId, subscription, context);
  }

  private async handleUnsubscribe(
    connectionId: string,
    subscription: { type: MonitorType },
    context: { tenantId: string; userId: string },
  ): Promise<void> {
    const currentSubscriptions = this.subscriptions.get(connectionId) || [];
    const updatedSubscriptions = currentSubscriptions.filter((s) => s.type !== subscription.type);

    this.subscriptions.set(connectionId, updatedSubscriptions);

    // Send unsubscription confirmation
    const confirmMessage: WebSocketMessage = {
      type: "unsubscribe",
      data: {
        unsubscribed: true,
        monitorType: subscription.type,
      },
      timestamp: new Date().toISOString(),
      messageId: uuidv4(),
    };

    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.send(JSON.stringify(confirmMessage));
    }
  }

  private async handleHeartbeat(
    connectionId: string,
    context: { tenantId: string; userId: string },
  ): Promise<void> {
    // Update last activity
    const sessionKey = `session:${connectionId}`;
    const session = await this.state.storage.get(sessionKey);

    if (session) {
      await this.state.storage.put(sessionKey, {
        ...session,
        lastActivity: new Date().toISOString(),
      });
    }

    // Send heartbeat response
    const heartbeatMessage: WebSocketMessage = {
      type: "heartbeat",
      data: {
        serverTime: new Date().toISOString(),
        connectionId,
      },
      timestamp: new Date().toISOString(),
      messageId: uuidv4(),
    };

    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.send(JSON.stringify(heartbeatMessage));
    }
  }

  private handleWebSocketClose(connectionId: string): void {
    this.connections.delete(connectionId);
    this.subscriptions.delete(connectionId);

    // Clean up session storage
    this.state.storage.delete(`session:${connectionId}`);
  }

  private async sendInitialData(
    connectionId: string,
    subscription: WSSubscription,
    context: { tenantId: string; userId: string },
  ): Promise<void> {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    try {
      let initialData: any = null;

      switch (subscription.type) {
        case "vital-signs":
          if (subscription.filters?.patientIds) {
            // Get latest vital signs for subscribed patients
            const vitalSignsData = await this.getLatestVitalSigns(
              context.tenantId,
              subscription.filters.patientIds,
            );
            initialData = { type: "vital-signs", data: vitalSignsData };
          }
          break;

        case "system-alerts":
          // Get active alerts
          const alerts = await this.getActiveAlerts(context.tenantId, subscription.filters);
          initialData = { type: "system-alerts", data: alerts };
          break;

        case "appointments":
          // Get today's appointments
          const appointments = await this.getTodaysAppointments(context.tenantId);
          initialData = { type: "appointments", data: appointments };
          break;
      }

      if (initialData) {
        const message: WebSocketMessage = {
          type: (subscription.type.replace("-", "_") + "_update") as any,
          data: initialData,
          timestamp: new Date().toISOString(),
          messageId: uuidv4(),
        };

        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("Error sending initial data:", error);
    }
  }

  private async getLatestVitalSigns(tenantId: string, patientIds: string[]): Promise<any[]> {
    const vitalSigns = [];

    for (const patientId of patientIds) {
      const cached = await this.env.MONITORING_CACHE.get(
        `vital-signs:${tenantId}:${patientId}:latest`,
      );

      if (cached) {
        vitalSigns.push(JSON.parse(cached));
      } else {
        // Query from database
        const result = await this.env.NEONPRO_DB.prepare(`
          SELECT * FROM vital_signs 
          WHERE patient_id = ? AND tenant_id = ? 
          ORDER BY timestamp DESC 
          LIMIT 1
        `)
          .bind(patientId, tenantId)
          .first();

        if (result) {
          vitalSigns.push(result);

          // Cache for future use
          await this.env.MONITORING_CACHE.put(
            `vital-signs:${tenantId}:${patientId}:latest`,
            JSON.stringify(result),
            { expirationTtl: 3600 },
          );
        }
      }
    }

    return vitalSigns;
  }

  private async getActiveAlerts(tenantId: string, filters?: any): Promise<any[]> {
    // Get from cache first
    const cacheKey = `alerts:${tenantId}:active`;
    const cached = await this.env.ALERT_STORAGE.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Query from database
    const alerts = await this.env.NEONPRO_DB.prepare(`
      SELECT * FROM system_alerts 
      WHERE tenant_id = ? AND is_resolved = FALSE 
      ORDER BY created_at DESC 
      LIMIT 50
    `)
      .bind(tenantId)
      .all();

    const alertData = alerts.results || [];

    // Cache alerts
    await this.env.ALERT_STORAGE.put(cacheKey, JSON.stringify(alertData), { expirationTtl: 300 });

    return alertData;
  }

  private async getTodaysAppointments(tenantId: string): Promise<any[]> {
    const today = new Date().toISOString().split("T")[0];

    const appointments = await this.env.NEONPRO_DB.prepare(`
      SELECT * FROM appointments 
      WHERE tenant_id = ? AND DATE(scheduled_at) = ? 
      ORDER BY scheduled_at ASC
    `)
      .bind(tenantId, today)
      .all();

    return appointments.results || [];
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    try {
      const { tenantId, message, targetConnections } = await request.json();

      let targetConnectionIds: string[];

      if (targetConnections === "all") {
        // Broadcast to all connections for this tenant
        targetConnectionIds = Array.from(this.connections.keys());
      } else if (Array.isArray(targetConnections)) {
        targetConnectionIds = targetConnections;
      } else {
        return new Response("Invalid target connections", { status: 400 });
      }

      let successCount = 0;
      let failureCount = 0;

      for (const connectionId of targetConnectionIds) {
        const ws = this.connections.get(connectionId);
        if (ws && ws.readyState === WebSocket.READY_STATE_OPEN) {
          try {
            ws.send(JSON.stringify(message));
            successCount++;
          } catch (error) {
            console.error(`Failed to send message to connection ${connectionId}:`, error);
            failureCount++;
          }
        } else {
          failureCount++;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          sent: successCount,
          failed: failureCount,
          total: targetConnectionIds.length,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      return new Response("Broadcast failed", { status: 500 });
    }
  }

  private async getSessions(): Promise<Response> {
    const sessions = [];
    const sessionKeys = await this.state.storage.list({ prefix: "session:" });

    for (const [key, session] of sessionKeys) {
      const connectionId = key.replace("session:", "");
      const isConnected = this.connections.has(connectionId);

      sessions.push({
        ...session,
        isConnected,
        subscriptions: this.subscriptions.get(connectionId) || [],
      });
    }

    return new Response(
      JSON.stringify({
        sessions,
        totalConnections: this.connections.size,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  private async getMetrics(): Promise<Response> {
    const metrics = {
      activeConnections: this.connections.size,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (total, subs) => total + subs.length,
        0,
      ),
      connectionsByType: this.getConnectionsByType(),
      uptime: Date.now(),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(metrics), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private getConnectionsByType(): Record<string, number> {
    const types: Record<string, number> = {};

    for (const subscriptions of this.subscriptions.values()) {
      for (const subscription of subscriptions) {
        types[subscription.type] = (types[subscription.type] || 0) + 1;
      }
    }

    return types;
  }

  private startHeartbeat(): void {
    // Send periodic heartbeat to all connections
    this.heartbeatInterval = setInterval(() => {
      const heartbeatMessage: WebSocketMessage = {
        type: "heartbeat",
        data: { serverTime: new Date().toISOString() },
        timestamp: new Date().toISOString(),
        messageId: uuidv4(),
      };

      const message = JSON.stringify(heartbeatMessage);

      for (const [connectionId, ws] of this.connections) {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          try {
            ws.send(message);
          } catch (error) {
            console.error(`Heartbeat failed for connection ${connectionId}:`, error);
            this.handleWebSocketClose(connectionId);
          }
        } else {
          this.handleWebSocketClose(connectionId);
        }
      }
    }, 30000); // 30 seconds
  }

  private async updateConnectionMetrics(tenantId: string, delta: number): Promise<void> {
    const metricsKey = `metrics:${tenantId}:connections`;
    const current = await this.env.MONITORING_CACHE.get(metricsKey);
    const currentCount = current ? parseInt(current) : 0;
    const newCount = Math.max(0, currentCount + delta);

    await this.env.MONITORING_CACHE.put(metricsKey, newCount.toString(), { expirationTtl: 3600 });
  }

  // Public method for external usage
  async getOrCreateSession(
    sessionId: string,
    sessionData: Partial<MonitoringSession>,
  ): Promise<MonitoringSession> {
    const sessionKey = `session:${sessionId}`;
    let session = (await this.state.storage.get(sessionKey)) as MonitoringSession;

    if (!session) {
      session = {
        sessionId,
        tenantId: sessionData.tenantId!,
        userId: sessionData.userId!,
        userRole: sessionData.userRole!,
        monitorTypes: sessionData.monitorTypes || [],
        connectedAt: sessionData.connectedAt || new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
        connectionType: "websocket",
      };

      await this.state.storage.put(sessionKey, session);
    }

    return session;
  }
}

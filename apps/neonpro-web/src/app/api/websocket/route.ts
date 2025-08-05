import type { NextRequest, NextResponse } from "next/server";
import type { WebSocketServer } from "ws";
import type { createClient } from "@supabase/supabase-js";
import type { IncomingMessage } from "http";
import type { Socket } from "net";
import type { parse } from "url";

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Connected clients map
const clients = new Map<
  string,
  {
    ws: any;
    userId: string;
    subscriptions: Set<string>;
  }
>();

// Message types
type WSMessage = {
  type: "subscribe" | "unsubscribe" | "ping" | "analytics_update" | "trial_update";
  payload?: any;
  channel?: string;
};

/**
 * GET /api/websocket - WebSocket upgrade endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get("upgrade");

    if (upgrade !== "websocket") {
      return NextResponse.json(
        {
          error: "WebSocket upgrade required",
          message: "This endpoint only accepts WebSocket connections",
        },
        { status: 400 },
      );
    }

    // Initialize WebSocket server if not already done
    if (!wss) {
      wss = new WebSocketServer({ noServer: true });
      setupWebSocketHandlers();
    }

    return NextResponse.json({ message: "WebSocket server ready" }, { status: 200 });
  } catch (error) {
    console.error("WebSocket setup error:", error);
    return NextResponse.json({ error: "Failed to setup WebSocket server" }, { status: 500 });
  }
}

/**
 * Setup WebSocket event handlers
 */
function setupWebSocketHandlers() {
  if (!wss) return;

  wss.on("connection", async (ws: any, request: IncomingMessage) => {
    console.log("New WebSocket connection established");

    // Parse query parameters for authentication
    const { query } = parse(request.url || "", true);
    const token = query.token as string;

    if (!token) {
      ws.close(1008, "Authentication token required");
      return;
    }

    // Verify user authentication
    const userId = await verifyWebSocketAuth(token);
    if (!userId) {
      ws.close(1008, "Invalid authentication token");
      return;
    }

    // Generate client ID and store connection
    const clientId = generateClientId();
    clients.set(clientId, {
      ws,
      userId,
      subscriptions: new Set(),
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        clientId,
        message: "WebSocket connection established",
      }),
    );

    // Handle incoming messages
    ws.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        await handleWebSocketMessage(clientId, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        );
      }
    });

    // Handle connection close
    ws.on("close", () => {
      console.log(`WebSocket connection closed for client ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on("error", (error: Error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Setup ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    ws.on("pong", () => {
      // Connection is alive
    });
  });
}

/**
 * Handle WebSocket messages
 */
async function handleWebSocketMessage(clientId: string, message: WSMessage) {
  const client = clients.get(clientId);
  if (!client) return;

  const { ws, userId, subscriptions } = client;

  switch (message.type) {
    case "subscribe":
      if (message.channel) {
        // Verify user can subscribe to this channel
        const canSubscribe = await verifyChannelAccess(userId, message.channel);
        if (canSubscribe) {
          subscriptions.add(message.channel);
          ws.send(
            JSON.stringify({
              type: "subscribed",
              channel: message.channel,
              message: `Subscribed to ${message.channel}`,
            }),
          );
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Access denied to channel ${message.channel}`,
            }),
          );
        }
      }
      break;

    case "unsubscribe":
      if (message.channel) {
        subscriptions.delete(message.channel);
        ws.send(
          JSON.stringify({
            type: "unsubscribed",
            channel: message.channel,
            message: `Unsubscribed from ${message.channel}`,
          }),
        );
      }
      break;

    case "ping":
      ws.send(
        JSON.stringify({
          type: "pong",
          timestamp: new Date().toISOString(),
        }),
      );
      break;

    default:
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Unknown message type: ${message.type}`,
        }),
      );
  }
}

/**
 * Verify WebSocket authentication
 */
async function verifyWebSocketAuth(token: string): Promise<string | null> {
  try {
    // Verify JWT token (simplified - use your actual JWT verification)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("WebSocket auth verification error:", error);
    return null;
  }
}

/**
 * Verify channel access permissions
 */
async function verifyChannelAccess(userId: string, channel: string): Promise<boolean> {
  // Define channel access rules
  const channelRules: Record<string, (userId: string) => Promise<boolean>> = {
    analytics: async (uid) => {
      // Users can access their own analytics
      return true;
    },
    trials: async (uid) => {
      // Users can access their trial updates
      return true;
    },
    admin: async (uid) => {
      // Only admins can access admin channel
      const { data: user } = await supabase.from("users").select("role").eq("id", uid).single();

      return user?.role === "admin";
    },
    global: async (uid) => {
      // Global announcements - all authenticated users
      return true;
    },
  };

  const rule = channelRules[channel];
  if (!rule) {
    return false;
  }

  return await rule(userId);
}

/**
 * Generate unique client ID
 */
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Broadcast message to specific channel
 */
function broadcastToChannel(channel: string, message: any) {
  clients.forEach((client, clientId) => {
    if (client.subscriptions.has(channel) && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "broadcast",
          channel,
          data: message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });
}

/**
 * Broadcast message to specific user
 */
function broadcastToUser(userId: string, message: any) {
  clients.forEach((client, clientId) => {
    if (client.userId === userId && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "direct_message",
          data: message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });
}

/**
 * Get connected clients count
 */
function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * Get connected clients for a specific channel
 */
function getChannelSubscribers(channel: string): number {
  let count = 0;
  clients.forEach((client) => {
    if (client.subscriptions.has(channel)) {
      count++;
    }
  });
  return count;
}

// Export WebSocket utilities for use in other parts of the application

/**
 * WebSocket Connection API Route
 * GET /api/websocket - Establish WebSocket connection for real-time updates
 */

import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { authenticateRequest } from '@/lib/middleware/auth';
import { rateLimiter, createRateLimitIdentifier } from '@/lib/rate-limiting/memory-limiter';
import { analyticsService } from '@/lib/analytics';

interface WebSocketConnection {
  id: string;
  userId?: string;
  clinicId?: string;
  role?: string;
  lastPing: number;
  subscriptions: Set<string>;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: string;
}

// Global WebSocket server instance
let wss: WebSocketServer | null = null;
const connections = new Map<string, WebSocketConnection>();

/**
 * Initialize WebSocket server if not already created
 */
function initializeWebSocketServer() {
  if (wss) return wss;
  
  wss = new WebSocketServer({
    noServer: true,
    clientTracking: true,
  });
  
  // Connection handler
  wss.on('connection', (ws, request) => {
    const connectionId = generateConnectionId();
    const connection: WebSocketConnection = {
      id: connectionId,
      lastPing: Date.now(),
      subscriptions: new Set(),
    };
    
    connections.set(connectionId, connection);
    
    // Set up message handlers
    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await handleWebSocketMessage(ws, connection, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendErrorMessage(ws, 'Invalid message format');
      }
    });
    
    // Handle pong responses
    ws.on('pong', () => {
      connection.lastPing = Date.now();
    });
    
    // Clean up on close
    ws.on('close', () => {
      connections.delete(connectionId);
      console.log(`WebSocket connection closed: ${connectionId}`);
    });
    
    // Send welcome message
    sendMessage(ws, {
      type: 'connection:established',
      payload: { connectionId },
    });
    
    console.log(`WebSocket connection established: ${connectionId}`);
  });
  
  // Set up ping interval for connection health
  setInterval(() => {
    const now = Date.now();
    
    wss?.clients.forEach((ws) => {
      const connection = Array.from(connections.values()).find(
        conn => ws === ws // This would need proper connection tracking
      );
      
      if (connection && now - connection.lastPing > 30000) {
        // Close stale connections
        ws.terminate();
        connections.delete(connection.id);
      } else {
        // Send ping
        ws.ping();
      }
    });
  }, 10000); // Every 10 seconds
  
  return wss;
}

/**
 * Handle incoming WebSocket messages
 */
async function handleWebSocketMessage(
  ws: any,
  connection: WebSocketConnection,
  message: WebSocketMessage
) {
  switch (message.type) {
    case 'auth:authenticate':
      await handleAuthentication(ws, connection, message.payload);
      break;
      
    case 'subscribe':
      handleSubscription(ws, connection, message.payload);
      break;
      
    case 'unsubscribe':
      handleUnsubscription(ws, connection, message.payload);
      break;
      
    case 'ping':
      sendMessage(ws, { type: 'pong', timestamp: new Date().toISOString() });
      break;
      
    case 'analytics:track':
      await handleAnalyticsTracking(connection, message.payload);
      break;
      
    default:
      sendErrorMessage(ws, `Unknown message type: ${message.type}`);
  }
}

/**
 * Handle WebSocket authentication
 */
async function handleAuthentication(ws: any, connection: WebSocketConnection, payload: any) {
  try {
    const { token } = payload;
    
    if (!token) {
      sendErrorMessage(ws, 'Authentication token required');
      return;
    }
    
    // Create mock request for authentication
    const mockRequest = new Request('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    }) as any as NextRequest;
    
    const authResult = await authenticateRequest(mockRequest);
    
    if (!authResult.success || !authResult.user) {
      sendErrorMessage(ws, 'Authentication failed');
      return;
    }
    
    // Update connection with user info
    connection.userId = authResult.user.id;
    connection.clinicId = authResult.user.clinicId;
    connection.role = authResult.user.role;
    
    sendMessage(ws, {
      type: 'auth:success',
      payload: {
        userId: authResult.user.id,
        role: authResult.user.role,
        clinicId: authResult.user.clinicId,
      },
    });
    
    console.log(`WebSocket authenticated: ${connection.id} (${authResult.user.email})`);
    
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    sendErrorMessage(ws, 'Authentication error');
  }
}

/**
 * Handle subscription requests
 */
function handleSubscription(ws: any, connection: WebSocketConnection, payload: any) {
  const { channels } = payload;
  
  if (!Array.isArray(channels)) {
    sendErrorMessage(ws, 'Channels must be an array');
    return;
  }
  
  // Validate subscription permissions
  for (const channel of channels) {
    if (canSubscribeToChannel(connection, channel)) {
      connection.subscriptions.add(channel);
    } else {
      sendErrorMessage(ws, `Access denied to channel: ${channel}`);
    }
  }
  
  sendMessage(ws, {
    type: 'subscription:success',
    payload: { channels: Array.from(connection.subscriptions) },
  });
}

/**
 * Handle unsubscription requests
 */
function handleUnsubscription(ws: any, connection: WebSocketConnection, payload: any) {
  const { channels } = payload;
  
  if (!Array.isArray(channels)) {
    sendErrorMessage(ws, 'Channels must be an array');
    return;
  }
  
  channels.forEach(channel => connection.subscriptions.delete(channel));
  
  sendMessage(ws, {
    type: 'unsubscription:success',
    payload: { channels },
  });
}

/**
 * Handle real-time analytics tracking
 */
async function handleAnalyticsTracking(connection: WebSocketConnection, payload: any) {
  if (!connection.userId) {
    return; // Ignore analytics from unauthenticated connections
  }
  
  try {
    await analyticsService.trackEvent({
      ...payload,
      userId: connection.userId,
      clinicId: connection.clinicId,
      source: 'websocket',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('WebSocket analytics tracking error:', error);
  }
}

/**
 * Check if connection can subscribe to channel
 */
function canSubscribeToChannel(connection: WebSocketConnection, channel: string): boolean {
  // Public channels
  if (channel.startsWith('public:')) {
    return true;
  }
  
  // Require authentication for protected channels
  if (!connection.userId) {
    return false;
  }
  
  // Clinic-specific channels
  if (channel.startsWith('clinic:')) {
    const clinicId = channel.split(':')[1];
    return connection.role === 'admin' || connection.clinicId === clinicId;
  }
  
  // User-specific channels
  if (channel.startsWith('user:')) {
    const userId = channel.split(':')[1];
    return connection.userId === userId;
  }
  
  // Admin-only channels
  if (channel.startsWith('admin:')) {
    return connection.role === 'admin';
  }
  
  return false;
}

/**
 * Send message to WebSocket client
 */
function sendMessage(ws: any, message: WebSocketMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    }));
  }
}

/**
 * Send error message to WebSocket client
 */
function sendErrorMessage(ws: any, error: string) {
  sendMessage(ws, {
    type: 'error',
    payload: { error },
  });
}

/**
 * Generate unique connection ID
 */
function generateConnectionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Broadcast message to subscribed connections
 */
export function broadcastToChannel(channel: string, message: WebSocketMessage) {
  if (!wss) return;
  
  wss.clients.forEach((ws) => {
    const connection = Array.from(connections.values()).find(
      conn => conn.subscriptions.has(channel)
    );
    
    if (connection && ws.readyState === ws.OPEN) {
      sendMessage(ws, {
        ...message,
        channel,
      });
    }
  });
}

/**
 * API Route Handler
 * This sets up the WebSocket upgrade for Next.js
 */
export async function GET(request: NextRequest) {
  // Check rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  const identifier = createRateLimitIdentifier(ip, undefined, 'websocket');
  const config = rateLimiter.getRateLimitConfig('websocket');
  const rateLimitResult = await rateLimiter.checkRateLimit(identifier, config);
  
  if (!rateLimitResult.allowed) {
    return new Response('Rate limit exceeded for WebSocket connections', {
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
      },
    });
  }
  
  // Initialize WebSocket server
  const wss = initializeWebSocketServer();
  
  return new Response('WebSocket endpoint ready', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
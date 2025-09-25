// WebSocket types for AG-UI Protocol real-time communication
import { z } from 'zod';
import { AGUIEvent } from './agui-events';
import { AGUIResponse } from './agui-responses';
import { AGUIResponseType } from './agui-responses';

// WebSocket connection states
export const ConnectionStateSchema = z.enum([
  'connecting',
  'connected',
  'disconnecting',
  'disconnected',
  'reconnecting',
  'error'
]);

export type ConnectionState = z.infer<typeof ConnectionStateSchema>;

// WebSocket configuration
export const WebSocketConfigSchema = z.object({
  url: z.string(),
  protocols: z.array(z.string()).optional(),
  timeout: z.number().default(30000),
  reconnectAttempts: z.number().default(5),
  reconnectInterval: z.number().default(1000),
  maxReconnectInterval: z.number().default(30000),
  heartbeatInterval: z.number().default(30000),
  enableCompression: z.boolean().default(true),
  bufferSize: z.number().default(1024 * 1024), // 1MB
  enableBinary: z.boolean().default(true),
  headers: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
  authentication: z.object({
    enabled: z.boolean().default(true),
    method: z.enum(['token', 'api_key', 'jwt', 'custom']),
    credential: z.string().optional(),
    refreshInterval: z.number().default(3600000) // 1 hour
  }).optional()
});

export type WebSocketConfig = z.infer<typeof WebSocketConfigSchema>;

// WebSocket message types
export const WebSocketMessageTypeSchema = z.enum([
  'connect',
  'disconnect',
  'event',
  'response',
  'heartbeat',
  'ack',
  'error',
  'auth',
  'ping',
  'pong',
  'subscribe',
  'unsubscribe',
  'batch'
]);

export type WebSocketMessageType = z.infer<typeof WebSocketMessageTypeSchema>;

// WebSocket message base structure
export const WebSocketMessageSchema = z.object({
  id: z.string(),
  type: WebSocketMessageTypeSchema,
  timestamp: z.date(),
  version: z.string().default('1.0'),
  sessionId: z.string(),
  userId: z.string(),
  
  // Message content
  payload: z.record(z.unknown()).optional(),
  
  // Metadata
  metadata: z.object({
    correlationId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    ttl: z.number().default(300000), // 5 minutes
    requiresAck: z.boolean().default(true),
    compression: z.boolean().default(false),
    encrypted: z.boolean().default(false)
  }).default({}),
  
  // Routing
  routing: z.object({
    to: z.string().optional(),
    from: z.string(),
    channel: z.string().default('default'),
    broadcast: z.boolean().default(false)
  }).default({})
});

export type WebSocketMessage<T = any> = z.infer<typeof WebSocketMessageSchema> & {
  payload?: T;
};

// Connection event
export const ConnectionEventSchema = z.object({
  connectionId: z.string(),
  state: ConnectionStateSchema,
  timestamp: z.date(),
  url: z.string(),
  protocols: z.array(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  sessionId: z.string(),
  userId: z.string()
});

export type ConnectionEvent = z.infer<typeof ConnectionEventSchema>;

// Authentication request
export const AuthRequestSchema = WebSocketMessageSchema.extend({
  type: z.literal('auth'),
  payload: z.object({
    method: z.enum(['token', 'api_key', 'jwt', 'custom']),
    credential: z.string(),
    timestamp: z.date(),
    nonce: z.string()
  })
});

export type AuthRequest = z.infer<typeof AuthRequestSchema>;

// Authentication response
export const AuthResponseSchema = WebSocketMessageSchema.extend({
  type: z.literal('auth'),
  payload: z.object({
    success: z.boolean(),
    sessionId: z.string(),
    expiresAt: z.date(),
    permissions: z.array(z.string()).optional(),
    role: z.string().optional(),
    error: z.string().optional()
  })
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Event message
export const EventMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('event'),
  payload: z.object({
    event: AGUIEventSchema
  })
});

export type EventMessage = z.infer<typeof EventMessageSchema>;

// Response message
export const ResponseMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('response'),
  payload: z.object({
    response: AGUIResponseSchema
  })
});

export type ResponseMessage = z.infer<typeof ResponseMessageSchema>;

// Heartbeat message
export const HeartbeatMessageSchema = WebSocketMessageSchema.extend({
  type: z.enum(['ping', 'pong']),
  payload: z.object({
    timestamp: z.date(),
    sequence: z.number(),
    metrics: z.object({
      uptime: z.number(),
      memoryUsage: z.number(),
      cpuUsage: z.number(),
      activeConnections: z.number()
    }).optional()
  })
});

export type HeartbeatMessage = z.infer<typeof HeartbeatMessageSchema>;

// Subscription message
export const SubscriptionMessageSchema = WebSocketMessageSchema.extend({
  type: z.enum(['subscribe', 'unsubscribe']),
  payload: z.object({
    channel: z.string(),
    filter: z.record(z.unknown()).optional(),
    subscriptionId: z.string()
  })
});

export type SubscriptionMessage = z.infer<typeof SubscriptionMessageSchema>;

// Batch message
export const BatchMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('batch'),
  payload: z.object({
    batchId: z.string(),
    messages: z.array(WebSocketMessageSchema),
    compression: z.enum(['none', 'gzip', 'deflate']).default('none')
  })
});

export type BatchMessage = z.infer<typeof BatchMessageSchema>;

// Acknowledgment message
export const AckMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('ack'),
  payload: z.object({
    acknowledgedId: z.string(),
    timestamp: z.date(),
    result: z.enum(['success', 'error']),
    error: z.string().optional()
  })
});

export type AckMessage = z.infer<typeof AckMessageSchema>;

// Error message
export const ErrorMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    stack: z.string().optional(),
    context: z.record(z.unknown()).optional()
  })
});

export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

// WebSocket connection metrics
export const ConnectionMetricsSchema = z.object({
  connectionId: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  connectedAt: z.date(),
  disconnectedAt: z.date().optional(),
  duration: z.number().optional(),
  bytesSent: z.number(),
  bytesReceived: z.number(),
  messagesSent: z.number(),
  messagesReceived: z.number(),
  averageLatency: z.number(),
  maxLatency: z.number(),
  minLatency: z.number(),
  reconnectCount: z.number(),
  errorCount: z.number(),
  lastMessageAt: z.date(),
  protocol: z.string(),
  extensions: z.array(z.string())
});

export type ConnectionMetrics = z.infer<typeof ConnectionMetricsSchema>;

// WebSocket server metrics
export const ServerMetricsSchema = z.object({
  totalConnections: z.number(),
  activeConnections: z.number(),
  maxConcurrentConnections: z.number(),
  totalMessagesSent: z.number(),
  totalMessagesReceived: z.number(),
  averageMessageSize: z.number(),
  totalBytesTransferred: z.number(),
  uptime: z.number(),
  errorRate: z.number(),
  connectionRate: z.number(),
  disconnectionRate: z.number(),
  messageRate: z.number(),
  averageProcessingTime: z.number(),
  memoryUsage: z.number(),
  cpuUsage: z.number(),
  lastUpdated: z.date()
});

export type ServerMetrics = z.infer<typeof ServerMetricsSchema>;

// WebSocket session
export const WebSocketSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  lastActivity: z.date(),
  isActive: z.boolean().default(true),
  subscriptions: z.array(z.object({
    channel: z.string(),
    filter: z.record(z.unknown()),
    subscribedAt: z.date()
  })),
  context: z.record(z.unknown()).optional(),
  permissions: z.array(z.string()).optional(),
  role: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

export type WebSocketSession = z.infer<typeof WebSocketSessionSchema>;

// Reconnection strategy
export const ReconnectionStrategySchema = z.object({
  enabled: z.boolean().default(true),
  maxAttempts: z.number().default(5),
  initialDelay: z.number().default(1000),
  maxDelay: z.number().default(30000),
  multiplier: z.number().default(2),
  jitter: z.boolean().default(true),
  onReconnect: z.function().optional(),
  onMaxAttemptsReached: z.function().optional()
});

export type ReconnectionStrategy = z.infer<typeof ReconnectionStrategySchema>;

// WebSocket channel
export const WebSocketChannelSchema = z.object({
  name: z.string(),
  type: z.enum(['public', 'private', 'presence', 'system']),
  subscribers: z.array(z.string()),
  messages: z.array(z.object({
    id: z.string(),
    type: WebSocketMessageTypeSchema,
    payload: z.record(z.unknown()),
    timestamp: z.date()
  })),
  historyLimit: z.number().default(1000),
  persistent: z.boolean().default(false),
  permissions: z.object({
    subscribe: z.array(z.string()),
    publish: z.array(z.string()),
    history: z.array(z.string())
  }).optional()
});

export type WebSocketChannel = z.infer<typeof WebSocketChannelSchema>;

// Presence system
export const PresenceInfoSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  status: z.enum(['online', 'away', 'busy', 'offline']),
  lastSeen: z.date(),
  userData: z.record(z.unknown()).optional(),
  capabilities: z.array(z.string()).optional()
});

export type PresenceInfo = z.infer<typeof PresenceInfoSchema>;

// Message queue for offline support
export const MessageQueueSchema = z.object({
  sessionId: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    message: WebSocketMessageSchema,
    timestamp: z.date(),
    attempts: z.number().default(0),
    maxAttempts: z.number().default(3),
    nextAttempt: z.date(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
  })),
  maxSize: z.number().default(1000),
  processing: z.boolean().default(false)
});

export type MessageQueue = z.infer<typeof MessageQueueSchema>;

// WebSocket interface
export interface IWebSocketManager {
  readonly id: string;
  readonly config: WebSocketConfig;
  state: ConnectionState;
  sessionId: string | null;
  userId: string | null;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  
  // Message handling
  send(message: WebSocketMessage): Promise<void>;
  sendBatch(messages: WebSocketMessage[]): Promise<void>;
  
  // Subscriptions
  subscribe(channel: string, filter?: Record<string, unknown>): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  unsubscribeAll(): Promise<void>;
  
  // Session management
  authenticate(credentials: string): Promise<void>;
  refreshToken(): Promise<void>;
  extendSession(): Promise<void>;
  
  // Metrics and monitoring
  getMetrics(): ConnectionMetrics;
  getSession(): WebSocketSession | null;
  getChannels(): WebSocketChannel[];
  
  // Event handlers
  onConnect(handler: (event: ConnectionEvent) => void): void;
  onDisconnect(handler: (event: ConnectionEvent) => void): void;
  onMessage(handler: (message: WebSocketMessage) => void): void;
  onError(handler: (error: Error) => void): void;
  onReconnect(handler: (attempt: number) => void): void;
  
  // State management
  getState(): ConnectionState;
  isConnected(): boolean;
  isConnecting(): boolean;
  isReconnecting(): boolean;
}

// WebSocket server interface
export interface IWebSocketServer {
  readonly id: string;
  readonly config: WebSocketConfig;
  
  // Server management
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  
  // Connection management
  getConnection(connectionId: string): IWebSocketManager | undefined;
  getConnections(): IWebSocketManager[];
  getConnectionCount(): number;
  disconnectUser(userId: string): Promise<void>;
  disconnectSession(sessionId: string): Promise<void>;
  broadcast(message: WebSocketMessage, filter?: (conn: IWebSocketManager) => boolean): Promise<void>;
  
  // Channel management
  createChannel(name: string, type?: 'public' | 'private' | 'presence' | 'system'): Promise<WebSocketChannel>;
  getChannel(name: string): WebSocketChannel | undefined;
  getChannels(): WebSocketChannel[];
  deleteChannel(name: string): Promise<void>;
  
  // Session management
  getSession(sessionId: string): WebSocketSession | undefined;
  getSessions(): WebSocketSession[];
  cleanupExpiredSessions(): Promise<void>;
  
  // Metrics and monitoring
  getMetrics(): ServerMetrics;
  getHealth(): Promise<{
    healthy: boolean;
    connections: number;
    memoryUsage: number;
    uptime: number;
    lastCheck: Date;
  }>;
  
  // Event handlers
  onConnection(handler: (connection: IWebSocketManager) => void): void;
  onDisconnection(handler: (connection: IWebSocketManager) => void): void;
  onMessage(handler: (message: WebSocketMessage, connection: IWebSocketManager) => void): void;
  onError(handler: (error: Error, connection?: IWebSocketManager) => void): void;
  
  // Security
  authenticate(connection: IWebSocketManager, credentials: string): Promise<boolean>;
  authorize(connection: IWebSocketManager, channel: string, action: 'subscribe' | 'publish'): Promise<boolean>;
  
  // Message processing
  processMessage(message: WebSocketMessage, connection: IWebSocketManager): Promise<void>;
  validateMessage(message: WebSocketMessage): boolean;
}

// WebSocket factory interface
export interface IWebSocketFactory {
  createClient(config: WebSocketConfig): IWebSocketManager;
  createServer(config: WebSocketConfig): IWebSocketServer;
  createMessage<T>(type: WebSocketMessageType, payload: T, metadata?: Partial<WebSocketMessage['metadata']>): WebSocketMessage<T>;
  createEventMessage(event: AGUIEvent): EventMessage;
  createResponseMessage(response: AGUIResponse): ResponseMessage;
  createHeartbeatMessage(type: 'ping' | 'pong', sequence?: number): HeartbeatMessage;
}

// WebSocket event types
export type WebSocketEvent = 
  | { type: 'connection.established'; connection: IWebSocketManager }
  | { type: 'connection.closed'; connection: IWebSocketManager; code: number; reason: string }
  | { type: 'connection.error'; connection: IWebSocketManager; error: Error }
  | { type: 'connection.reconnecting'; connection: IWebSocketManager; attempt: number }
  | { type: 'message.received'; message: WebSocketMessage; connection: IWebSocketManager }
  | { type: 'message.sent'; message: WebSocketMessage; connection: IWebSocketManager }
  | { type: 'authentication.success'; session: WebSocketSession }
  | { type: 'authentication.failed'; error: Error }
  | { type: 'session.expired'; sessionId: string }
  | { type: 'subscription.created'; subscriptionId: string; channel: string }
  | { type: 'subscription.removed'; subscriptionId: string; channel: string }
  | { type: 'channel.created'; channel: WebSocketChannel }
  | { type: 'channel.deleted'; channelName: string }
  | { type: 'server.metrics.updated'; metrics: ServerMetrics }
  | { type: 'server.health.check'; result: { healthy: boolean; issues: string[] } };

// WebSocket event handler
export type WebSocketEventHandler = (event: WebSocketEvent) => Promise<void> | void;

// Type aliases for backward compatibility and protocol integration
export type RealtimeMessage = WebSocketMessage;
export type RealtimeEventType = WebSocketMessageType;
export type RealtimeSession = WebSocketSession;
export type RealtimeConnection = IWebSocketManager;
export type RealtimeConfig = WebSocketConfig;
export type MessageDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'acknowledged';
export type ConnectionStatus = ConnectionState;
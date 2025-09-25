/**
 * WebSocket and Real-time Communication Types
 * @package @neonpro/chat-services
 */

/**
 * WebSocket connection configuration types
 */
export interface WebSocketConfig {
  url: string
  protocols?: string | string[]
  binaryType?: 'blob' | 'arraybuffer'
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  heartbeatInterval?: number
  heartbeatTimeout?: number
  enableCompression?: boolean
  enableReconnection?: boolean
  connectionTimeout?: number
  maxMessageSize?: number
  maxQueueSize?: number
  enableEncryption?: boolean
  encryptionKey?: string
}

export interface WebSocketConnectionStatus {
  connected: boolean
  connecting: boolean
  reconnecting: boolean
  lastConnectedAt?: Date
  connectionAttempts: number
  lastError?: WebSocketError
  uptime: number
  latency: number
  messageQueue: number
  bytesSent: number
  bytesReceived: number
}

export interface WebSocketError {
  code: number
  message: string
  type: 'connection' | 'message' | 'authentication' | 'network' | 'protocol' | 'timeout'
  timestamp: Date
  retryable: boolean
  details?: any
}

/**
 * WebSocket message types and structures
 */
export interface WebSocketMessage<T = any> {
  id: string
  type: WebSocketMessageType
  timestamp: Date
  sessionId: string
  userId?: string
  payload: T
  metadata?: WebSocketMessageMetadata
  priority?: WebSocketMessagePriority
  requiresAck?: boolean
  encrypted?: boolean
  compressed?: boolean
}

export type WebSocketMessageType = 
  | 'connect'
  | 'disconnect'
  | 'chat_message'
  | 'session_update'
  | 'user_presence'
  | 'typing_indicator'
  | 'read_receipt'
  | 'delivery_receipt'
  | 'file_transfer'
  | 'screen_share'
  | 'video_call'
  | 'audio_call'
  | 'emergency_alert'
  | 'system_notification'
  | 'compliance_check'
  | 'audit_log'
  | 'heartbeat'
  | 'ping'
  | 'pong'
  | 'error'
  | 'acknowledgment'
  | 'subscription'
  | 'unsubscription'
  | 'broadcast'
  | 'direct_message'

export interface WebSocketMessageMetadata {
  source: string
  destination?: string
  correlationId?: string
  traceId?: string
  spanId?: string
  userId?: string
  sessionId?: string
  clientInfo?: WebSocketClientInfo
  tags?: string[]
  customHeaders?: Record<string, string>
}

export type WebSocketMessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency'

export interface WebSocketClientInfo {
  clientId: string
  userAgent: string
  platform: string
  browser?: string
  version?: string
  location?: string
  ipAddress?: string
  connectionType: 'websocket' | 'long_polling' | 'sse'
  timezone?: string
  language?: string
}

/**
 * WebSocket session management types
 */
export interface WebSocketSession {
  id: string
  clientId: string
  userId?: string
  type: WebSocketSessionType
  status: WebSocketSessionStatus
  createdAt: Date
  updatedAt: Date
  endedAt?: Date
  connections: WebSocketConnection[]
  metadata: WebSocketSessionMetadata
  settings: WebSocketSessionSettings
  compliance: WebSocketSessionCompliance
}

export type WebSocketSessionType = 
  | 'user_session'
  | 'professional_session'
  | 'ai_agent_session'
  | 'system_session'
  | 'anonymous_session'
  | 'integration_session'

export type WebSocketSessionStatus = 
  | 'initializing'
  | 'active'
  | 'idle'
  | 'reconnecting'
  | 'ending'
  | 'completed'
  | 'error'
  | 'terminated'

export interface WebSocketConnection {
  id: string
  sessionId: string
  clientId: string
  socketId: string
  status: WebSocketConnectionStatus
  connectedAt: Date
  disconnectedAt?: Date
  lastActivityAt: Date
  metadata: WebSocketConnectionMetadata
  statistics: WebSocketConnectionStatistics
}

export interface WebSocketConnectionMetadata {
  ipAddress: string
  userAgent: string
  platform: string
  location?: string
  timezone?: string
  language?: string
  connectionType: string
  protocolVersion: string
  customFields?: Record<string, any>
}

export interface WebSocketConnectionStatistics {
  messagesSent: number
  messagesReceived: number
  bytesSent: number
  bytesReceived: number
  averageLatency: number
  maxLatency: number
  minLatency: number
  connectionTime: number
  errorCount: number
  reconnectionCount: number
}

export interface WebSocketSessionMetadata {
  title?: string
  description?: string
  category?: string
  priority?: WebSocketMessagePriority
  estimatedDuration?: number
  actualDuration?: number
  tags?: string[]
  customFields?: Record<string, any>
}

export interface WebSocketSessionSettings {
  messageRetention: number
  enableCompression: boolean
  enableEncryption: boolean
  maxConnections?: number
  heartbeatInterval: number
  timeout: number
  maxMessageSize: number
  maxQueueSize: number
  deliveryGuarantee: WebSocketDeliveryGuarantee
}

export type WebSocketDeliveryGuarantee = 'at_most_once' | 'at_least_once' | 'exactly_once'

export interface WebSocketSessionCompliance {
  encryptionRequired: boolean
  auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive'
  dataRetentionPolicy: string
  consentStatus: 'granted' | 'revoked' | 'pending' | 'expired'
  complianceFramework: string[]
}

/**
 * WebSocket subscription and channel types
 */
export interface WebSocketSubscription {
  id: string
  sessionId: string
  channel: string
  type: WebSocketSubscriptionType
  status: WebSocketSubscriptionStatus
  createdAt: Date
  updatedAt: Date
  endedAt?: Date
  filters?: WebSocketSubscriptionFilter[]
  metadata?: Record<string, any>
}

export type WebSocketSubscriptionType = 
  | 'session_channel'
  | 'user_channel'
  | 'presence_channel'
  | 'notification_channel'
  | 'analytics_channel'
  | 'compliance_channel'
  | 'emergency_channel'
  | 'broadcast_channel'
  | 'direct_channel'

export type WebSocketSubscriptionStatus = 'active' | 'paused' | 'ended' | 'error'

export interface WebSocketSubscriptionFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex'
  value: any
  caseSensitive?: boolean
}

export interface WebSocketChannel {
  name: string
  type: WebSocketChannelType
  description?: string
  permissions: WebSocketChannelPermission[]
  settings: WebSocketChannelSettings
  statistics: WebSocketChannelStatistics
  createdAt: Date
  updatedAt: Date
}

export type WebSocketChannelType = 
  | 'public'
  | 'private'
  | 'presence'
  | 'notification'
  | 'system'
  | 'emergency'
  | 'compliance'
  | 'analytics'
  | 'integration'

export interface WebSocketChannelPermission {
  role: string
  permissions: ('read' | 'write' | 'admin' | 'subscribe' | 'unsubscribe' | 'manage')[]
  conditions?: Record<string, any>
}

export interface WebSocketChannelSettings {
  messageRetention: number
  maxSubscribers?: number
  enableHistory: boolean
  enableEncryption: boolean
  enableCompression: boolean
  enableModeration: boolean
  rateLimit?: number
  throttleLimit?: number
}

export interface WebSocketChannelStatistics {
  subscriberCount: number
  messageCount: number
  averageMessageRate: number
  peakMessageRate: number
  totalBytesTransferred: number
  errorRate: number
  lastActivityAt: Date
}

/**
 * WebSocket event types
 */
export interface WebSocketEvent {
  id: string
  type: WebSocketEventType
  timestamp: Date
  sessionId?: string
  userId?: string
  data: any
  metadata?: WebSocketEventMetadata
}

export type WebSocketEventType = 
  | 'connection_established'
  | 'connection_lost'
  | 'connection_restored'
  | 'connection_failed'
  | 'message_sent'
  | 'message_received'
  | 'message_delivered'
  | 'message_read'
  | 'message_failed'
  | 'session_created'
  | 'session_updated'
  | 'session_ended'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_ended'
  | 'user_joined'
  | 'user_left'
  | 'user_typing'
  | 'user_stopped_typing'
  | 'emergency_triggered'
  | 'compliance_violation'
  | 'system_alert'
  | 'error_occurred'

export interface WebSocketEventMetadata {
  source: string
  correlationId?: string
  traceId?: string
  spanId?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category?: string
  tags?: string[]
  customFields?: Record<string, any>
}

/**
 * WebSocket message queuing types
 */
export interface WebSocketMessageQueue {
  id: string
  name: string
  type: WebSocketQueueType
  status: WebSocketQueueStatus
  config: WebSocketQueueConfig
  messages: WebSocketQueuedMessage[]
  statistics: WebSocketQueueStatistics
  createdAt: Date
  updatedAt: Date
}

export type WebSocketQueueType = 'fifo' | 'priority' | 'topic' | 'broadcast' | 'direct'

export type WebSocketQueueStatus = 'active' | 'paused' | 'processing' | 'error'

export interface WebSocketQueueConfig {
  maxSize: number
  retentionPeriod: number
  priorityLevels: number
  retryPolicy: WebSocketRetryPolicy
  deadLetterQueue?: boolean
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface WebSocketRetryPolicy {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  jitter: boolean
  timeout: number
}

export interface WebSocketQueuedMessage {
  id: string
  sessionId: string
  message: WebSocketMessage
  priority: number
  status: WebSocketQueuedMessageStatus
  createdAt: Date
  scheduledAt?: Date
  processedAt?: Date
  failedAt?: Date
  attempts: number
  lastError?: string
  metadata?: Record<string, any>
}

export type WebSocketQueuedMessageStatus = 
  | 'queued'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'expired'
  | 'cancelled'

export interface WebSocketQueueStatistics {
  totalMessages: number
  messagesByStatus: Record<WebSocketQueuedMessageStatus, number>
  averageProcessingTime: number
  failureRate: number
  retryRate: number
  throughput: number
  backlogSize: number
}

/**
 * WebSocket authentication and security types
 */
export interface WebSocketAuthConfig {
  type: 'jwt' | 'apikey' | 'oauth' | 'custom'
  secret?: string
  algorithm?: string
  issuer?: string
  audience?: string
  expiration?: number
  refreshEnabled?: boolean
  customValidation?: (token: string) => Promise<boolean>
}

export interface WebSocketAuthContext {
  userId?: string
  sessionId?: string
  roles?: string[]
  permissions?: string[]
  clientId?: string
  ipAddress?: string
  userAgent?: string
  authenticated: boolean
  authenticatedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, any>
}

export interface WebSocketSecurityConfig {
  enableRateLimiting: boolean
  rateLimitWindow: number
  rateLimitMaxRequests: number
  enableCors: boolean
  corsOrigins: string[]
  enableWss: boolean
  sslCert?: string
  sslKey?: string
  enableMessageValidation: boolean
  messageSizeLimit: number
  enableIpFiltering: boolean
  allowedIps?: string[]
  blockedIps?: string[]
}

/**
 * WebSocket monitoring and metrics types
 */
export interface WebSocketMetrics {
  connections: WebSocketConnectionMetrics
  messages: WebSocketMessageMetrics
  sessions: WebSocketSessionMetrics
  performance: WebSocketPerformanceMetrics
  errors: WebSocketErrorMetrics
  system: WebSocketSystemMetrics
}

export interface WebSocketConnectionMetrics {
  totalConnections: number
  activeConnections: number
  connectionRate: number
  disconnectionRate: number
  averageConnectionTime: number
  connectionSuccessRate: number
  reconnectionRate: number
}

export interface WebSocketMessageMetrics {
  totalMessages: number
  messageRate: number
  averageMessageSize: number
  messageSuccessRate: number
  messageFailureRate: number
  averageLatency: number
  throughput: number
}

export interface WebSocketSessionMetrics {
  totalSessions: number
  activeSessions: number
  averageSessionDuration: number
  sessionSuccessRate: number
  averageMessagesPerSession: number
}

export interface WebSocketPerformanceMetrics {
  cpuUsage: number
  memoryUsage: number
  networkThroughput: number
  diskUsage: number
  responseTime: number
  uptime: number
}

export interface WebSocketErrorMetrics {
  totalErrors: number
  errorRate: number
  errorsByType: Record<string, number>
  averageRecoveryTime: number
  criticalErrors: number
}

export interface WebSocketSystemMetrics {
  loadAverage: number
  processCount: number
  fileDescriptors: number
  networkConnections: number
  timestamp: Date
}

/**
 * WebSocket health check types
 */
export interface WebSocketHealthCheck {
  id: string
  name: string
  type: WebSocketHealthCheckType
  status: WebSocketHealthCheckStatus
  lastCheckedAt: Date
  nextCheckAt: Date
  config: WebSocketHealthCheckConfig
  result?: WebSocketHealthCheckResult
  history: WebSocketHealthCheckHistory[]
}

export type WebSocketHealthCheckType = 
  | 'connection_check'
  | 'message_check'
  | 'performance_check'
  | 'security_check'
  | 'compliance_check'
  | 'integration_check'

export type WebSocketHealthCheckStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

export interface WebSocketHealthCheckConfig {
  interval: number
  timeout: number
  retries: number
  thresholds: WebSocketHealthThresholds
  actions: WebSocketHealthActions
}

export interface WebSocketHealthThresholds {
  connectionRate: { min: number; max: number }
  messageRate: { min: number; max: number }
  latency: { min: number; max: number }
  errorRate: { min: number; max: number }
  memoryUsage: { min: number; max: number }
  cpuUsage: { min: number; max: number }
}

export interface WebSocketHealthActions {
  onWarning: string[]
  onCritical: string[]
  escalationLevels: number
  notificationChannels: string[]
}

export interface WebSocketHealthCheckResult {
  status: WebSocketHealthCheckStatus
  score: number
  details: Record<string, any>
  issues: WebSocketHealthIssue[]
  recommendations: string[]
  timestamp: Date
}

export interface WebSocketHealthIssue {
  type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  description: string
  impact: string
  resolution?: string
  timestamp: Date
}

export interface WebSocketHealthCheckHistory {
  timestamp: Date
  status: WebSocketHealthCheckStatus
  score: number
  details: Record<string, any>
  duration: number
}
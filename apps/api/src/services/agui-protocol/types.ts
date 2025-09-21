/**
 * AG-UI Protocol Types and Interfaces
 * 
 * Defines the communication protocol between frontend and backend agents
 * using WebSocket-based real-time messaging.
 */

export interface AguiMessage {
  id: string;
  type: AguiMessageType;
  timestamp: string;
  sessionId: string;
  payload: Record<string, any>;
  metadata?: AguiMessageMetadata;
}

export type AguiMessageType = 
  | 'hello'
  | 'query'
  | 'response'
  | 'error'
  | 'status'
  | 'ping'
  | 'pong'
  | 'session_update'
  | 'feedback'
  | 'context_update'
  | 'streaming_start'
  | 'streaming_chunk'
  | 'streaming_end';

export interface AguiMessageMetadata {
  userId: string;
  patientId?: string;
  requestId?: string;
  version: string;
  compression?: 'gzip' | 'none';
  encryption?: boolean;
}

export interface AguiHelloMessage {
  version: string;
  capabilities: AguiCapability[];
  authentication?: AguiAuthentication;
}

export interface AguiCapability {
  name: string;
  version: string;
  features: string[];
}

export interface AguiAuthentication {
  token: string;
  type: 'jwt' | 'bearer';
}

export interface AguiQueryMessage {
  query: string;
  context?: AguiQueryContext;
  options?: AguiQueryOptions;
}

export interface AguiQueryContext {
  patientId?: string;
  userId: string;
  sessionHistory?: AguiSessionMessage[];
  userPreferences?: Record<string, any>;
  previousTopics?: string[];
}

export interface AguiQueryOptions {
  maxResults?: number;
  timeout?: number;
  includeSources?: boolean;
  streaming?: boolean;
  temperature?: number;
  model?: string;
}

export interface AguiResponseMessage {
  content: string;
  type: 'text' | 'structured' | 'error';
  sources?: AguiSource[];
  confidence?: number;
  usage?: AguiUsageStats;
  actions?: AguiAction[];
}

export interface AguiSource {
  id: string;
  type: 'patient_data' | 'medical_knowledge' | 'appointment' | 'financial' | 'document';
  title: string;
  snippet?: string;
  relevanceScore?: number;
  metadata?: Record<string, any>;
}

export interface AguiUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  processingTimeMs: number;
  databaseQueryTimeMs?: number;
  vectorSearchTimeMs?: number;
}

export interface AguiAction {
  id: string;
  type: 'schedule_appointment' | 'view_patient' | 'generate_report' | 'update_record';
  label: string;
  description?: string;
  payload: Record<string, any>;
  requiresConfirmation?: boolean;
}

export interface AguiErrorMessage {
  code: AguiErrorCode;
  message: string;
  details?: Record<string, any>;
  retryable?: boolean;
}

export type AguiErrorCode = 
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_FAILED'
  | 'INVALID_MESSAGE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'
  | 'PATIENT_NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'AI_SERVICE_ERROR';

export interface AguiStatusMessage {
  status: 'ready' | 'busy' | 'error' | 'maintenance';
  uptime: number;
  activeSessions: number;
  queueSize?: number;
  performance?: AguiPerformanceMetrics;
}

export interface AguiPerformanceMetrics {
  averageResponseTimeMs: number;
  requestsPerSecond: number;
  errorRate: number;
  databaseConnections: number;
  memoryUsageMb: number;
}

export interface AguiSessionUpdate {
  sessionId: string;
  updates: {
    title?: string;
    context?: Record<string, any>;
    expiresAt?: string;
    metadata?: Record<string, any>;
  };
}

export interface AguiFeedbackMessage {
  messageId: string;
  rating: number; // 1-5
  feedback?: string;
  category?: 'accuracy' | 'helpfulness' | 'clarity' | 'completeness';
}

export interface AguiContextUpdate {
  sessionId: string;
  context: Record<string, any>;
  source: 'user' | 'system' | 'ai';
}

export interface AguiStreamingChunk {
  chunkId: string;
  content: string;
  isFinal?: boolean;
  sources?: AguiSource[];
  confidence?: number;
}

// Session management types
export interface AguiSession {
  id: string;
  userId: string;
  title?: string;
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  messageCount: number;
  lastActivity: string;
}

export interface AguiSessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Health check types
export interface AguiHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: 'healthy' | 'unhealthy';
    ai_service: 'healthy' | 'degraded' | 'unhealthy';
    vector_store: 'healthy' | 'unhealthy';
    websocket_server: 'healthy' | 'unhealthy';
  };
  metrics: AguiPerformanceMetrics;
  lastCheck: string;
}

// Rate limiting types
export interface AguiRateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  currentUsage: {
    minute: number;
    hour: number;
  };
  resetTimes: {
    minute: string;
    hour: string;
  };
}

// Protocol version info
export interface AguiProtocolInfo {
  version: string;
  supportedVersions: string[];
  compatibility: 'full' | 'partial' | 'none';
  features: string[];
}

// CopilotKit specific types for frontend integration
export interface CopilotRequest {
  id: string;
  type: 'query' | 'command' | 'feedback';
  content: string;
  sessionId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface CopilotResponse {
  id: string;
  type: 'response' | 'error' | 'status';
  content: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    error?: string;
    [key: string]: any;
  };
}
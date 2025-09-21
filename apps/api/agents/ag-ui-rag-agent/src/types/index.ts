/**
 * Type definitions for AG-UI RAG Agent
 * Healthcare-compliant types for CopilotKit integration
 */

// User roles in healthcare system
export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'staff' 
  | 'receptionist' 
  | 'financial'

// Data access levels for LGPD compliance
export type DataAccessLevel = 'public' | 'standard' | 'sensitive' | 'admin'

// Query permissions structure
export interface QueryPermissions {
  canAccessPatients: boolean
  canAccessFinancials: boolean
  canAccessMedicalRecords: boolean
  canAccessReports: boolean
  canManageAppointments: boolean
  dataAccessLevel: DataAccessLevel
}

// Connection context for sessions
export interface ConnectionContext {
  userAgent: string
  ipAddress: string
  sessionId: string
}

// Session data structure
export interface SessionData {
  id: string
  userId: string
  clinicId: string
  permissions: QueryPermissions
  context: ConnectionContext
  createdAt: Date
  expiresAt: Date
}

// Client message types from frontend
export interface ClientMessage {
  type: 'healthcare_query' | 'ping' | 'disconnect'
  queryId?: string
  query?: string
  parameters?: Record<string, any>
  timestamp?: string
}

// Agent response types to frontend
export interface AgentMessage {
  type: 'connection_established' | 'agent_response' | 'agent_typing' | 'error' | 'pong'
  sessionId?: string
  queryId?: string
  response?: AgentResponse
  error?: string
  timestamp: string
  capabilities?: string[]
  security?: {
    lgpdCompliant: boolean
    encryptionEnabled: boolean
    auditingEnabled: boolean
  }
}

// Healthcare agent response structure
export interface AgentResponse {
  type: 'text' | 'list' | 'table' | 'chart' | 'error'
  content: string
  data?: any[]
  metadata?: {
    confidence: number
    sources?: string[]
    dataClassification: 'public' | 'internal' | 'sensitive' | 'restricted'
    lgpdCompliant: boolean
  }
  suggestions?: string[]
}

// User query structure
export interface UserQuery {
  query: string
  parameters: Record<string, any>
  context: ConnectionContext
}

// Intent parsing result
export interface IntentResult {
  intent: string
  entities: Record<string, any>
  confidence: number
  parameters: Record<string, any>
}

// Supabase query parameters
export interface QueryParameters {
  table?: string
  filters?: Record<string, any>
  dateRange?: {
    start: string
    end: string
  }
  limit?: number
  orderBy?: string
  searchTerm?: string
}

// Database query result
export interface QueryResult {
  data: any[]
  count: number
  metadata: {
    executionTime: number
    dataClassification: 'public' | 'internal' | 'sensitive' | 'restricted'
    accessedTables: string[]
  }
}

// Response formatting input
export interface FormattingInput {
  type: 'text' | 'list' | 'table' | 'chart'
  data: any
  query: string
  metadata?: Record<string, any>
}

// Formatted response for CopilotKit
export interface FormattedResponse {
  type: 'text' | 'list' | 'table' | 'chart'
  content: string
  data?: any[]
  metadata: {
    confidence: number
    sources?: string[]
    dataClassification: 'public' | 'internal' | 'sensitive' | 'restricted'
    lgpdCompliant: boolean
  }
  suggestions?: string[]
}

// Security validation result
export interface SecurityValidationResult {
  isValid: boolean
  permissions: QueryPermissions
  violations?: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

// Audit log entry
export interface AuditLogEntry {
  id: string
  userId: string
  clinicId: string
  action: string
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Healthcare data classification
export interface DataClassification {
  level: 'public' | 'internal' | 'sensitive' | 'restricted'
  categories: string[]
  retentionDays: number
  accessRestrictions: string[]
}

// AG-UI Protocol message envelope
export interface AguiMessageEnvelope {
  messageId: string
  sessionId: string
  timestamp: string
  version: string
  payload: ClientMessage | AgentMessage
  signature?: string
}

// CopilotKit integration types
export interface CopilotKitConfig {
  apiKey?: string
  baseUrl: string
  version: string
  healthcareMode: boolean
  lgpdCompliance: boolean
  features: {
    chatInterface: boolean
    dataVisualization: boolean
    voiceInput: boolean
    accessibility: boolean
  }
}

// Agent configuration
export interface AgentConfig {
  name: string
  type: 'ag-ui-rag-agent'
  version: string
  capabilities: string[]
  models: {
    primary: string
    fallback: string
    embedding: string
  }
  database: {
    provider: 'supabase'
    connectionString: string
    features: string[]
  }
  security: {
    lgpdCompliant: boolean
    encryptionEnabled: boolean
    auditLogging: boolean
    rateLimiting: boolean
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    retentionDays: number
    sanitization: boolean
  }
}
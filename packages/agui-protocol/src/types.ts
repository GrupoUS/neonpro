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
  _payload: Record<string, any>;
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
  | 'streaming_end'
  // Client-specific message types
  | 'client_registration'
  | 'client_profile_update'
  | 'client_search'
  | 'client_analytics'
  | 'client_retention_prediction'
  | 'client_communication'
  | 'document_ocr'
  | 'consent_management'
  | 'client_validation';

export interface AguiMessageMetadata {
  _userId: string;
  clientId?: string;
  requestId?: string;
  version: string;
  compression?: 'gzip' | 'none';
  encryption?: boolean;
}

// Client Registration Types
export interface AguiClientRegistrationMessage {
  name: string;
  email: string;
  phone: string;
  skinType?: string;
  concerns?: string[];
  lgpdConsent: boolean;
  documents?: DocumentUpload[];
}

export interface AguiClientRegistrationResponse {
  success: boolean;
  clientId?: string;
  errors?: string[];
  riskAssessment?: {
    noShowRisk: number;
    retentionPrediction: number;
    recommendedActions: string[];
  };
}

export interface DocumentUpload {
  type: 'id' | 'consent' | 'medical' | 'photo';
  url: string;
  uploadedAt: string;
}

// Service Types
export interface AguiServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface AguiConnectionStatus {
  connected: boolean;
  sessionId?: string;
  lastPing?: string;
  error?: string;
}

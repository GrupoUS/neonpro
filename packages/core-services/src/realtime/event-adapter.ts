/**
 * Realtime Event Adapter (T102.5)
 * Standardized interface for real-time communication events (join/leave/status)
 *
 * Features:
 * - Unified interface for different real-time providers
 * - Join/leave/status event management
 * - Healthcare-specific event patterns
 * - Mock implementation for testing
 * - Integration with existing Supabase real-time infrastructure
 */

// ============================================================================
// Core Event Types
// ============================================================================

export type RealtimeEventType =
  | "join"
  | "leave"
  | "status_change"
  | "presence_sync";

export interface RealtimeParticipant {
  /** Unique participant ID */
  id: string;

  /** Participant role in healthcare context */
  role: "doctor" | "patient" | "nurse" | "admin";

  /** Participant display name */
  name: string;

  /** Current connection status */
  status: "connecting" | "connected" | "disconnected" | "reconnecting";

  /** Optional avatar URL */
  avatar?: string;

  /** Participant capabilities */
  capabilities: {
    audio: boolean;
    video: boolean;
    screenShare: boolean;
    chat: boolean;
  };

  /** Metadata for healthcare context */
  metadata: {
    clinicId: string;
    sessionId: string;
    deviceType: "desktop" | "mobile" | "tablet";
    connectionQuality: "poor" | "fair" | "good" | "excellent";
    joinedAt: string;
    lastActivity: string;
  };
}

export interface RealtimeEvent<T = any> {
  /** Event type */
  type: RealtimeEventType;

  /** Event timestamp */
  timestamp: string;

  /** Channel/room identifier */
  channelId: string;

  /** Participant involved in the event */
  participant: RealtimeParticipant;

  /** Optional event data */
  data?: T;

  /** Event metadata */
  metadata: {
    /** Source of the event */
    source: "local" | "remote";

    /** Event ID for deduplication */
    eventId: string;

    /** Healthcare compliance flags */
    compliance: {
      lgpdLogged: boolean;
      auditRequired: boolean;
      sensitiveData: boolean;
    };
  };
}

export interface RealtimeChannelState {
  /** Channel identifier */
  channelId: string;

  /** All participants in the channel */
  participants: Map<string, RealtimeParticipant>;

  /** Channel metadata */
  metadata: {
    createdAt: string;
    lastActivity: string;
    totalParticipants: number;
    maxParticipants: number;
    channelType: "consultation" | "conference" | "emergency" | "support";
  };
}

// ============================================================================
// Event Handlers
// ============================================================================

export type RealtimeEventHandler<T = any> = (
  event: RealtimeEvent<T>,
) => void | Promise<void>;

export interface RealtimeEventHandlers {
  onJoin?: RealtimeEventHandler<{ welcomeMessage?: string }>;
  onLeave?: RealtimeEventHandler<{ reason?: string; duration?: number }>;
  onStatusChange?: RealtimeEventHandler<{
    previousStatus: RealtimeParticipant["status"];
    newStatus: RealtimeParticipant["status"];
  }>;
  onPresenceSync?: RealtimeEventHandler<{
    participants: RealtimeParticipant[];
  }>;
  onError?: (error: RealtimeAdapterError) => void | Promise<void>;
}

export interface RealtimeAdapterError {
  code: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  channelId?: string;
  participantId?: string;
  timestamp: string;
  details?: Record<string, any>;
}

// ============================================================================
// Event Adapter Interface
// ============================================================================

export interface RealtimeEventAdapter {
  /** Initialize the adapter */
  initialize(): Promise<void>;

  /** Clean up resources */
  cleanup(): Promise<void>;

  /** Join a channel */
  joinChannel(
    channelId: string,
    participant: Omit<RealtimeParticipant, "metadata">,
    initialState?: Record<string, any>,
  ): Promise<void>;

  /** Leave a channel */
  leaveChannel(
    channelId: string,
    participantId: string,
    reason?: string,
  ): Promise<void>;

  /** Update participant status */
  updateParticipantStatus(
    channelId: string,
    participantId: string,
    status: RealtimeParticipant["status"],
  ): Promise<void>;

  /** Get current channel state */
  getChannelState(channelId: string): RealtimeChannelState | null;

  /** Get all active channels */
  getActiveChannels(): string[];

  /** Register event handlers */
  setEventHandlers(handlers: RealtimeEventHandlers): void;

  /** Subscribe to specific channel events */
  subscribeToChannel(channelId: string): Promise<void>;

  /** Unsubscribe from channel events */
  unsubscribeFromChannel(channelId: string): Promise<void>;

  /** Check adapter health */
  getHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    latency: number;
    activeChannels: number;
    totalParticipants: number;
    lastHeartbeat: string;
  }>;
}

// ============================================================================
// Adapter Configuration
// ============================================================================

export interface RealtimeAdapterConfig {
  /** Provider type */
  provider: "supabase" | "mock" | "websocket";

  /** Connection settings */
  connection: {
    url?: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
    heartbeatInterval: number;
  };

  /** Healthcare-specific settings */
  healthcare: {
    enableAuditLogging: boolean;
    lgpdCompliance: boolean;
    maxSessionDuration: number; // minutes
    inactivityTimeout: number; // minutes
    emergencyEscalation: boolean;
  };

  /** Performance settings */
  performance: {
    maxChannels: number;
    maxParticipantsPerChannel: number;
    eventBatchSize: number;
    presenceSyncInterval: number; // ms
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createRealtimeEvent<T = any>(
  type: RealtimeEventType,
  channelId: string,
  participant: RealtimeParticipant,
  data?: T,
): RealtimeEvent<T> {
  return {
    type,
    timestamp: new Date().toISOString(),
    channelId,
    participant,
    data,
    metadata: {
      source: "local",
      eventId: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      compliance: {
        lgpdLogged: false,
        auditRequired: type === "join" || type === "leave",
        sensitiveData: false,
      },
    },
  };
}

export function validateParticipant(participant: RealtimeParticipant): boolean {
  return !!(
    participant.id &&
    participant.role &&
    participant.name &&
    participant.status &&
    participant.metadata?.clinicId &&
    participant.metadata?.sessionId
  );
}

export function isHealthcareCompliant(event: RealtimeEvent): boolean {
  return (
    event.metadata.compliance.lgpdLogged &&
    !event.metadata.compliance.sensitiveData
  );
}

// ============================================================================
// Factory Function
// ============================================================================

export function createRealtimeAdapter(
  config: RealtimeAdapterConfig,
): RealtimeEventAdapter {
  switch (config.provider) {
    case "supabase":
      // Will be implemented in supabase-adapter.ts
      throw new Error(
        "SupabaseRealtimeAdapter not yet implemented - use mock adapter for testing",
      );
    case "mock":
      // Will be implemented in mock-adapter.ts
      throw new Error(
        "MockRealtimeAdapter not yet implemented - import from index.ts",
      );
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

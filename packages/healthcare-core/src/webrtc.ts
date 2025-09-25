/**
 * @file WebRTC Types for Telemedicine Infrastructure
 * @version 1.0.0
 * @description TypeScript interfaces for healthcare-compliant WebRTC implementation
 *
 * Compliance Standards:
 * - LGPD (Lei Geral de Proteção de Dados) - Brazilian data protection
 * - ANVISA (Agência Nacional de Vigilância Sanitária) - Medical device standards
 * - CFM (Conselho Federal de Medicina) - Telemedicine regulations
 */

// ============================================================================
// Core WebRTC Connection Types
// ============================================================================

/**
 * WebRTC connection states for healthcare sessions
 */
export type RTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed'

// Runtime values for TypeScript enum-like behavior
export const RTCConnectionStates = {
  NEW: 'new',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  CLOSED: 'closed',
} as const

/**
 * Types of telemedicine calls with healthcare compliance
 */
export type TelemedicineCallType =
  | 'emergency'
  | 'scheduled'
  | 'consultation'
  | 'follow-up'
  | 'urgent-care'

// Runtime values for telemedicine call types
export const TelemedicineCallTypes = {
  EMERGENCY: 'emergency',
  SCHEDULED: 'scheduled',
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  URGENT_CARE: 'urgent-care',
} as const

/**
 * Classification levels for medical data according to LGPD
 */
export type MedicalDataClassification =
  | 'sensitive'
  | 'confidential'
  | 'internal'
  | 'public'

// Runtime values for medical data classification
export const MedicalDataClassifications = {
  SENSITIVE: 'sensitive',
  CONFIDENTIAL: 'confidential',
  INTERNAL: 'internal',
  PUBLIC: 'public',
} as const

/**
 * Healthcare-specific call types - expanded for comprehensive telemedicine
 */
export type TelemedicineCallTypeExpanded =
  | 'consultation' // Regular patient consultation
  | 'emergency' // Emergency medical consultation
  | 'follow-up' // Post-treatment follow-up
  | 'mental-health' // Mental health sessions
  | 'group-therapy' // Group therapy sessions
  | 'second-opinion' // Medical second opinion

/**
 * Medical data classification levels for LGPD compliance - expanded
 */
export type MedicalDataClassificationExpanded =
  | 'public' // Non-sensitive medical information
  | 'internal' // Internal clinic data
  | 'personal' // Personal patient information
  | 'sensitive' // Sensitive medical data (PHI)
  | 'confidential' // Highly confidential medical records

// ============================================================================
// Signaling Infrastructure
// ============================================================================

/**
 * WebRTC signaling message types for healthcare sessions
 */
export interface RTCSignalingMessage {
  /** Unique message identifier for audit trail */
  id: string

  /** Message type for signaling protocol */
  type: 'offer' | 'answer' | 'ice-candidate' | 'bye' | 'error' | 'heartbeat'

  /** Session identifier for call tracking */
  sessionId: string

  /** Sender participant ID (doctor, patient, etc.) */
  senderId: string

  /** Recipient participant ID */
  recipientId: string

  /** WebRTC payload (SDP or ICE candidate) */
  payload?: unknown

  /** Timestamp for audit logging (ISO 8601) */
  timestamp: string

  /** Medical data classification for LGPD compliance */
  dataClassification: MedicalDataClassification

  /** Optional metadata for healthcare context */
  metadata?: {
    callType?: TelemedicineCallType
    clinicId?: string
    patientId?: string
    doctorId?: string
  }
}

/**
 * Signaling server interface for healthcare compliance
 */
export interface RTCSignalingServer {
  /** Establish connection to signaling server */
  connect(): Promise<void>

  /** Disconnect from signaling server */
  disconnect(): Promise<void>

  /** Send signaling message with audit logging */
  sendMessage(message: RTCSignalingMessage): Promise<void>

  /** Subscribe to incoming messages for specific session */
  onMessage(
    sessionId: string,
    callback: (message: RTCSignalingMessage) => void,
  ): void

  /** Remove message subscription */
  offMessage(sessionId: string): void

  /** Check server connection status */
  isConnected(): boolean

  /** Get connection health status */
  getHealthStatus(): Promise<{
    connected: boolean
    latency: number
    lastHeartbeat: string
  }>
}

// ============================================================================
// Call Management
// ============================================================================

/**
 * Telemedicine call participant information
 */
export interface CallParticipant {
  /** Unique participant identifier */
  id: string

  /** Participant name for display */
  name: string

  /** Participant role in healthcare context */
  role: 'doctor' | 'patient' | 'nurse' | 'specialist' | 'observer'

  /** Professional registration (CRM, CRO, etc.) for healthcare providers */
  professionalId?: string

  /** Clinic or institution affiliation */
  clinicId?: string

  /** Audio/video capabilities */
  capabilities: {
    audio: boolean
    video: boolean
    screenShare: boolean
  }

  /** Current connection state */
  connectionState: RTCConnectionState

  /** Media stream status */
  mediaState: {
    audioEnabled: boolean
    videoEnabled: boolean
    screenShareEnabled: boolean
  }
}

/**
 * Telemedicine call session configuration
 */
export interface TelemedicineCallSession {
  /** Unique call session identifier */
  sessionId: string

  /** Call type for healthcare context */
  callType: TelemedicineCallType

  /** Call participants list */
  participants: CallParticipant[]

  /** Call initiator (usually the doctor) */
  initiatorId: string

  /** Primary patient for the consultation */
  patientId: string

  /** Primary healthcare provider */
  doctorId: string

  /** Associated clinic or institution */
  clinicId: string

  /** Call start timestamp (ISO 8601) */
  startTime: string

  /** Call end timestamp (ISO 8601, null if ongoing) */
  endTime?: string

  /** Call duration in seconds */
  duration?: number

  /** Current call state */
  state: RTCConnectionState

  /** Recording configuration (if enabled) */
  recording?: {
    enabled: boolean
    consentObtained: boolean
    storageLocation: string
    retentionPeriod: number // days
  }

  /** LGPD compliance metadata */
  compliance: {
    dataClassification: MedicalDataClassification
    consentVersion: string
    auditTrailId: string
    encryptionEnabled: boolean
  }

  /** Optional call metadata */
  metadata?: {
    appointmentId?: string
    medicalRecordId?: string
    emergencyLevel?: 'low' | 'medium' | 'high' | 'critical'
    specialtyArea?: string
  }
}

// ============================================================================
// WebRTC Connection Management
// ============================================================================

/**
 * WebRTC peer connection configuration for healthcare
 */
export interface RTCHealthcareConfiguration {
  /** ICE servers configuration */
  iceServers: {
    urls: string | string[]
    username?: string
    credential?: string
    credentialType?: 'password'
  }[]

  /** Certificate configuration for security */
  certificates?: {
    expires: number
    getFingerprints(): { algorithm: string; value: string }[]
  }[]

  /** Bundle policy for media optimization */
  bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle'

  /** ICE candidate pool size */
  iceCandidatePoolSize?: number

  /** Healthcare-specific settings */
  healthcare: {
    /** Enable end-to-end encryption */
    encryptionEnabled: boolean

    /** Audio quality settings for medical consultation */
    audioQuality: 'standard' | 'high' | 'medical-grade'

    /** Video quality settings */
    videoQuality: 'low' | 'medium' | 'high' | 'hd'

    /** Enable automatic recording (with consent) */
    autoRecording: boolean

    /** Maximum call duration (minutes) */
    maxDuration: number

    /** Bandwidth limits for network optimization */
    bandwidthLimits: {
      audio: number // kbps
      video: number // kbps
    }
  }
}

/**
 * WebRTC call manager interface for telemedicine
 */
export interface RTCCallManager {
  /** Initialize call manager with configuration */
  initialize(config: RTCHealthcareConfiguration): Promise<void>

  /** Create new telemedicine call session */
  createCall(
    session: Omit<TelemedicineCallSession, 'sessionId' | 'startTime' | 'state'>,
  ): Promise<TelemedicineCallSession>

  /** Join existing call session */
  joinCall(
    sessionId: string,
    participant: Omit<CallParticipant, 'connectionState'>,
  ): Promise<void>

  /** Leave current call session */
  leaveCall(sessionId: string, participantId: string): Promise<void>

  /** End call session (host only) */
  endCall(sessionId: string): Promise<void>

  /** Get current call session info */
  getCurrentSession(): TelemedicineCallSession | null

  /** Get all active sessions */
  getActiveSessions(): TelemedicineCallSession[]

  /** Toggle audio for participant */
  toggleAudio(sessionId: string, participantId: string): Promise<void>

  /** Toggle video for participant */
  toggleVideo(sessionId: string, participantId: string): Promise<void>

  /** Enable/disable screen sharing */
  toggleScreenShare(sessionId: string, participantId: string): Promise<void>

  /** Get call quality metrics */
  getCallQuality(sessionId: string): Promise<RTCCallQualityMetrics>

  /** Event listeners */
  onCallStateChange(callback: (session: TelemedicineCallSession) => void): void
  onParticipantJoined(callback: (participant: CallParticipant) => void): void
  onParticipantLeft(callback: (participantId: string) => void): void
  onError(callback: (error: RTCError) => void): void
}

// ============================================================================
// Quality & Monitoring
// ============================================================================

/**
 * WebRTC call quality metrics for healthcare monitoring
 */
export interface RTCCallQualityMetrics {
  /** Session identifier */
  sessionId: string

  /** Metrics collection timestamp */
  timestamp: string

  /** Audio quality metrics */
  audio: {
    packetsLost: number
    packetsSent: number
    packetsReceived: number
    jitter: number // ms
    roundTripTime: number // ms
    bitrate: number // kbps
    codecName: string
  }

  /** Video quality metrics */
  video: {
    packetsLost: number
    packetsSent: number
    packetsReceived: number
    frameRate: number // fps
    resolution: {
      width: number
      height: number
    }
    bitrate: number // kbps
    codecName: string
  }

  /** Connection quality metrics */
  connection: {
    state: RTCConnectionState
    iceConnectionState:
      | 'new'
      | 'checking'
      | 'connected'
      | 'completed'
      | 'failed'
      | 'disconnected'
      | 'closed'
    bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle'
    signalStrength: number // 0-100
    bandwidth: {
      available: number // kbps
      used: number // kbps
    }
  }

  /** Healthcare-specific quality indicators */
  healthcareMetrics: {
    audioClarity: number // 0-100 (important for medical consultations)
    videoClarity: number // 0-100 (important for visual diagnosis)
    latency: number // ms (critical for real-time interaction)
    reliability: number // 0-100 (connection stability)
  }
}

/**
 * WebRTC error types for healthcare context
 */
export interface RTCError {
  /** Error code for programmatic handling */
  code: string

  /** Human-readable error message */
  message: string

  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical'

  /** Session ID where error occurred */
  sessionId?: string

  /** Participant ID if error is participant-specific */
  participantId?: string

  /** Error timestamp */
  timestamp: string

  /** Detailed error information */
  details?: {
    /** WebRTC error object */
    webrtcError?: RTCError

    /** Network-related information */
    networkInfo?: {
      connectionType: string
      bandwidth: number
      latency: number
    }

    /** Browser/device information */
    deviceInfo?: {
      browser: string
      os: string
      deviceType: 'desktop' | 'mobile' | 'tablet'
    }
  }

  /** Suggested recovery actions */
  recoveryActions?: string[]

  /** Healthcare context */
  healthcareContext?: {
    /** Whether error affects patient safety */
    affectsPatientSafety: boolean

    /** Whether error requires immediate attention */
    requiresImmediateAction: boolean

    /** Impact on consultation quality */
    consultationImpact: 'none' | 'minimal' | 'moderate' | 'severe'
  }
}

// ============================================================================
// LGPD Compliance & Audit
// ============================================================================

/**
 * LGPD audit log entry for WebRTC sessions
 */
export interface RTCAuditLogEntry {
  /** Unique audit entry ID */
  id: string

  /** Session ID being audited */
  sessionId: string

  /** Audit event type */
  eventType:
    | 'session-start'
    | 'session-end'
    | 'participant-join'
    | 'participant-leave'
    | 'recording-start'
    | 'recording-stop'
    | 'data-access'
    | 'consent-given'
    | 'consent-revoked'
    | 'error-occurred'

  /** Timestamp of audited event */
  timestamp: string

  /** User ID who triggered the event */
  userId: string

  /** User role in healthcare context */
  userRole: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system'

  /** Data classification of accessed information */
  dataClassification: MedicalDataClassification

  /** Detailed event description */
  description: string

  /** IP address for security tracking */
  ipAddress: string

  /** User agent information */
  userAgent: string

  /** Clinic or institution context */
  clinicId: string

  /** Additional metadata */
  metadata?: Record<string, unknown>

  /** Compliance validation result */
  complianceCheck: {
    isCompliant: boolean
    violations?: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }
}

/**
 * Consent management for WebRTC healthcare sessions
 */
export interface RTCConsentManager {
  /** Request consent for specific data processing */
  requestConsent(
    userId: string,
    dataTypes: MedicalDataClassification[],
    purpose: string,
    sessionId: string,
  ): Promise<boolean>

  /** Verify existing consent is valid */
  verifyConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
  ): Promise<boolean>

  /** Revoke consent for data processing */
  revokeConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
  ): Promise<void>

  /** Get consent history for audit */
  getConsentHistory(userId: string): Promise<RTCAuditLogEntry[]>

  /** Export user data for LGPD compliance */
  exportUserData(userId: string): Promise<Record<string, unknown>>

  /** Delete user data (right to erasure) */
  deleteUserData(userId: string, sessionId?: string): Promise<void>
}

// Export all WebRTC types for proper module resolution

// Cloudflare Environment types for real-time monitoring service
export interface Env {
  // KV Namespaces
  MONITORING_CACHE: KVNamespace;
  SESSION_STORAGE: KVNamespace;
  ALERT_STORAGE: KVNamespace;
  NOTIFICATION_QUEUE: KVNamespace;
  AUDIT_LOGS: KVNamespace;

  // D1 Database
  NEONPRO_DB: D1Database;

  // Durable Objects
  MONITORING_SESSION: DurableObjectNamespace;
  ALERT_PROCESSOR: DurableObjectNamespace;
  NOTIFICATION_MANAGER: DurableObjectNamespace;

  // Secrets
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;

  // External integrations
  PUSHER_APP_ID?: string;
  PUSHER_KEY?: string;
  PUSHER_SECRET?: string;
  PUSHER_CLUSTER?: string;

  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;

  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;

  FCM_SERVER_KEY?: string; // Firebase Cloud Messaging

  // WhatsApp Business API (Brazilian healthcare commonly uses WhatsApp)
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
}

// Monitoring session types
export interface MonitoringSession {
  sessionId: string;
  tenantId: string;
  userId: string;
  userRole: "admin" | "doctor" | "nurse" | "receptionist" | "patient";
  patientIds?: string[]; // Patients being monitored in this session
  monitorTypes: MonitorType[];
  connectedAt: string;
  lastActivity: string;
  isActive: boolean;
  connectionType: "websocket" | "sse";
  deviceInfo?: DeviceInfo;
  location?: GeolocationInfo;
}

export type MonitorType =
  | "vital-signs"
  | "appointments"
  | "system-alerts"
  | "user-activity"
  | "equipment-status"
  | "emergency-alerts"
  | "medication-reminders"
  | "lab-results"
  | "treatment-progress";

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceType: "mobile" | "tablet" | "desktop";
  screenResolution?: string;
  timezone: string;
}

export interface GeolocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country: string;
  ipAddress: string;
}

// Vital signs monitoring types
export interface VitalSigns {
  id: string;
  patientId: string;
  tenantId: string;

  // Blood pressure
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg

  // Heart rate
  heartRate?: number; // bpm

  // Temperature
  temperature?: number; // Celsius

  // Respiratory
  respiratoryRate?: number; // breaths per minute
  oxygenSaturation?: number; // percentage

  // Metabolic
  bloodGlucose?: number; // mg/dL

  // Physical measurements
  weight?: number; // kg
  height?: number; // cm

  // Additional data
  notes?: string;
  recordedBy: string;
  deviceId?: string;
  timestamp: string;
  createdAt: string;
}

export interface VitalSignsRange {
  parameter: keyof VitalSigns;
  minNormal: number;
  maxNormal: number;
  minCritical?: number;
  maxCritical?: number;
  unit: string;
  ageGroup?: "pediatric" | "adult" | "elderly";
}

// Alert and notification types
export interface SystemAlert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: AlertSource;
  sourceId: string; // ID of the resource that triggered the alert
  patientId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export type AlertType =
  | "vital_signs_critical"
  | "vital_signs_abnormal"
  | "appointment_missed"
  | "appointment_overdue"
  | "medication_reminder"
  | "equipment_malfunction"
  | "system_error"
  | "security_breach"
  | "data_quality_issue"
  | "compliance_violation"
  | "emergency_situation";

export type AlertSeverity = "low" | "medium" | "high" | "critical" | "emergency";

export type AlertSource =
  | "vital_signs_monitor"
  | "appointment_system"
  | "medication_tracker"
  | "equipment_monitor"
  | "system_monitor"
  | "security_monitor"
  | "compliance_monitor"
  | "user_action";

export interface NotificationEvent {
  id: string;
  tenantId: string;
  type: NotificationType;
  targetUsers: string[]; // User IDs to notify
  targetRoles?: string[]; // Roles to notify
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  scheduledFor?: string; // ISO datetime for scheduled notifications
  isRead: boolean;
  readBy?: Record<string, string>; // userId -> readAt timestamp
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType =
  | "appointment_reminder"
  | "appointment_confirmation"
  | "appointment_cancellation"
  | "vital_signs_alert"
  | "medication_reminder"
  | "lab_results_available"
  | "treatment_update"
  | "system_maintenance"
  | "security_alert"
  | "compliance_notice"
  | "emergency_broadcast";

export type NotificationChannel = "in_app" | "push" | "email" | "sms" | "whatsapp" | "voice_call";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

// Real-time event types
export interface RealtimeEvent {
  id: string;
  type: string;
  tenantId: string;
  userId?: string;
  patientId?: string;
  data: Record<string, any>;
  timestamp: string;
  metadata?: {
    source: string;
    version: string;
    correlationId?: string;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: WSMessageType;
  data?: any;
  timestamp: string;
  messageId: string;
}

export type WSMessageType =
  | "connection_ack"
  | "heartbeat"
  | "vital_signs_update"
  | "alert_notification"
  | "appointment_update"
  | "system_notification"
  | "user_activity"
  | "error"
  | "subscribe"
  | "unsubscribe";

export interface WSSubscription {
  type: MonitorType;
  filters?: {
    patientIds?: string[];
    alertSeverity?: AlertSeverity[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// Equipment monitoring types (for healthcare devices)
export interface EquipmentStatus {
  equipmentId: string;
  tenantId: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatusType;
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  operatingHours: number;
  calibrationDue?: string;
  alerts?: EquipmentAlert[];
  metadata?: Record<string, any>;
  lastUpdated: string;
}

export type EquipmentType =
  | "vital_signs_monitor"
  | "ecg_machine"
  | "ultrasound"
  | "xray_machine"
  | "ct_scanner"
  | "mri_machine"
  | "defibrillator"
  | "ventilator"
  | "infusion_pump"
  | "dialysis_machine"
  | "autoclave"
  | "centrifuge"
  | "microscope"
  | "other";

export type EquipmentStatusType =
  | "operational"
  | "maintenance_required"
  | "offline"
  | "error"
  | "calibration_needed";

export interface EquipmentAlert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

// Emergency response types
export interface EmergencyAlert {
  id: string;
  tenantId: string;
  type: EmergencyType;
  location: string;
  description: string;
  patientId?: string;
  reportedBy: string;
  severity: EmergencySeverity;
  responseTeam?: string[];
  status: EmergencyStatus;
  createdAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
}

export type EmergencyType =
  | "cardiac_arrest"
  | "respiratory_failure"
  | "severe_allergic_reaction"
  | "stroke"
  | "seizure"
  | "trauma"
  | "fire"
  | "equipment_failure"
  | "security_incident"
  | "other";

export type EmergencySeverity = "level_1" | "level_2" | "level_3" | "level_4" | "level_5";

export type EmergencyStatus =
  | "reported"
  | "dispatched"
  | "responding"
  | "on_scene"
  | "resolved"
  | "cancelled";

// Brazilian healthcare compliance types
export interface LGPDMonitoringData {
  dataProcessingId: string;
  tenantId: string;
  patientId: string;
  dataType: "vital_signs" | "personal_data" | "sensitive_data";
  processingPurpose: string;
  legalBasis: string;
  consentId?: string;
  retentionPeriod: number;
  accessLog: AccessLogEntry[];
  isAnonymized: boolean;
  createdAt: string;
}

export interface AccessLogEntry {
  userId: string;
  action: "read" | "write" | "update" | "delete" | "export";
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  purpose: string;
}

export interface ANVISAComplianceEvent {
  eventId: string;
  tenantId: string;
  eventType: "adverse_event" | "device_malfunction" | "data_integrity_issue";
  description: string;
  severity: "minor" | "moderate" | "severe" | "critical";
  affectedPatients?: string[];
  affectedEquipment?: string[];
  reportingRequired: boolean;
  reportedAt?: string;
  investigationStatus: "pending" | "in_progress" | "completed";
  correctiveActions?: string[];
  createdAt: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  timestamp: string;
  tenantId: string;
  metrics: {
    activeConnections: number;
    messagesPerSecond: number;
    averageLatency: number;
    errorRate: number;
    alertsProcessed: number;
    notificationsSent: number;
    databaseQueries: number;
    cacheHitRate: number;
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    networkIO: number;
    storageIO: number;
  };
}

// Rate limiting types for healthcare APIs
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  emergencyOverride?: boolean; // Allow override during emergencies
}

// JWT payload for authentication
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: "admin" | "doctor" | "nurse" | "receptionist" | "patient";
  tenantId: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
  conditions?: Record<string, any>;
}

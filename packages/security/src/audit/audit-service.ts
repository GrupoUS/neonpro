import { z } from "zod";

/**
 * Comprehensive audit service for healthcare compliance
 * Implements LGPD, ANVISA, and CFM audit trail requirements
 * Provides tamper-evident logging with cryptographic integrity
 */

/**
 * Audit event types for healthcare operations
 */
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = "auth.login.success",
  LOGIN_FAILURE = "auth.login.failure",
  LOGOUT = "auth.logout",
  MFA_SETUP = "auth.mfa.setup",
  MFA_VERIFICATION = "auth.mfa.verification",
  PASSWORD_CHANGE = "auth.password.change",
  ACCOUNT_LOCKOUT = "auth.account.lockout",

  // Patient data access
  PATIENT_CREATE = "patient.create",
  PATIENT_READ = "patient.read",
  PATIENT_UPDATE = "patient.update",
  PATIENT_DELETE = "patient.delete",
  PATIENT_EXPORT = "patient.export",

  // Medical records
  MEDICAL_RECORD_CREATE = "medical_record.create",
  MEDICAL_RECORD_READ = "medical_record.read",
  MEDICAL_RECORD_UPDATE = "medical_record.update",
  MEDICAL_RECORD_DELETE = "medical_record.delete",
  MEDICAL_RECORD_SIGN = "medical_record.sign",

  // LGPD compliance
  CONSENT_GIVEN = "lgpd.consent.given",
  CONSENT_WITHDRAWN = "lgpd.consent.withdrawn",
  DATA_EXPORT_REQUEST = "lgpd.data.export_request",
  DATA_DELETION_REQUEST = "lgpd.data.deletion_request",
  DATA_RECTIFICATION = "lgpd.data.rectification",
  PRIVACY_ASSESSMENT = "lgpd.privacy.assessment",
  BREACH_DETECTED = "lgpd.breach.detected",
  BREACH_NOTIFICATION = "lgpd.breach.notification",

  // System security
  PERMISSION_GRANTED = "security.permission.granted",
  PERMISSION_DENIED = "security.permission.denied",
  RATE_LIMIT_EXCEEDED = "security.rate_limit.exceeded",
  SUSPICIOUS_ACTIVITY = "security.suspicious.activity",
  ENCRYPTION_KEY_ROTATION = "security.encryption.key_rotation",

  // File operations
  FILE_UPLOAD = "file.upload",
  FILE_DOWNLOAD = "file.download",
  FILE_DELETE = "file.delete",
  FILE_VIRUS_DETECTED = "file.virus.detected",

  // Administrative
  USER_ROLE_CHANGE = "admin.user.role_change",
  SYSTEM_CONFIG_CHANGE = "admin.system.config_change",
  BACKUP_CREATED = "admin.backup.created",
  BACKUP_RESTORED = "admin.backup.restored",
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Audit event outcome
 */
export enum AuditOutcome {
  SUCCESS = "success",
  FAILURE = "failure",
  PARTIAL = "partial",
}

/**
 * Base audit event schema
 */
export const auditEventSchema = z.object({
  eventType: z.nativeEnum(AuditEventType),
  severity: z.nativeEnum(AuditSeverity),
  outcome: z.nativeEnum(AuditOutcome),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  ipAddress: z.string().ip(),
  userAgent: z.string().optional(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  description: z.string().min(1).max(1000),
  details: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date()),
  source: z.string().default("neonpro-api"),
});

/**
 * Audit event interface
 */
export interface AuditEvent extends z.infer<typeof auditEventSchema> {
  id?: string;
  hash?: string;
  previousHash?: string;
}

/**
 * Audit configuration
 */
export type AuditConfig = {
  /** Whether to enable audit logging */
  enabled: boolean;

  /** Minimum severity level to log */
  minSeverity: AuditSeverity;

  /** Whether to include request/response bodies */
  includeBody: boolean;

  /** Maximum body size to log (bytes) */
  maxBodySize: number;

  /** Whether to hash events for integrity */
  enableHashing: boolean;

  /** Retention period in days */
  retentionDays: number;
};

/**
 * Default audit configuration for healthcare compliance
 */
const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  minSeverity: AuditSeverity.INFO,
  includeBody: false, // For privacy compliance
  maxBodySize: 10_240, // 10KB
  enableHashing: true,
  retentionDays: 2555, // 7 years (healthcare requirement)
};

/**
 * Audit store interface for different storage backends
 */
export type AuditStore = {
  /** Store audit event */
  store(event: AuditEvent): Promise<string>;

  /** Retrieve audit events */
  retrieve(filters: AuditFilters): Promise<AuditEvent[]>;

  /** Count audit events */
  count(filters: AuditFilters): Promise<number>;

  /** Delete old audit events */
  cleanup(olderThan: Date): Promise<number>;
};

/**
 * Audit event filters for retrieval
 */
export type AuditFilters = {
  eventTypes?: AuditEventType[];
  severities?: AuditSeverity[];
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
};

/**
 * Algorithm used for audit hash calculation
 */
const AUDIT_HASH_ALGORITHM = "sha256";

/**
 * Calculate hash for audit event
 */
export function calculateAuditHash(event: AuditEvent, previousHash?: string): string {
  const crypto = require("node:crypto");

  // Create canonical representation
  const canonical = {
    eventType: event.eventType,
    severity: event.severity,
    outcome: event.outcome,
    userId: event.userId,
    sessionId: event.sessionId,
    ipAddress: event.ipAddress,
    resourceId: event.resourceId,
    resourceType: event.resourceType,
    description: event.description,
    timestamp: event.timestamp.toISOString(),
    previousHash: previousHash || "",
  };

  const data = JSON.stringify(canonical, Object.keys(canonical).sort());
  return crypto.createHash(AUDIT_HASH_ALGORITHM).update(data).digest("hex");
}

/**
 * Verify audit chain integrity
 */
export function verifyAuditChain(events: AuditEvent[]): {
  valid: boolean;
  brokenAt?: number;
} {
  if (events.length === 0) {
    return { valid: true };
  }

  let previousHash = "";

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const expectedHash = calculateAuditHash(event, previousHash);

    if (event.hash !== expectedHash) {
      return { valid: false, brokenAt: i };
    }

    previousHash = event.hash || "";
  }

  return { valid: true };
}

/**
 * Main audit service implementation
 */
export class AuditService {
  private readonly config: AuditConfig;
  private readonly store: AuditStore;
  private lastHash = "";

  constructor(store: AuditStore, config: Partial<AuditConfig> = {}) {
    this.store = store;
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
  }

  /**
   * Log audit event
   */
  async logEvent(
    eventData: Omit<AuditEvent, "id" | "hash" | "previousHash">,
  ): Promise<string | null> {
    if (!this.config.enabled) {
      return null;
    }

    // Check minimum severity
    if (
      this.getSeverityLevel(eventData.severity) < this.getSeverityLevel(this.config.minSeverity)
    ) {
      return null;
    }

    // Validate event data
    const validationResult = auditEventSchema.safeParse(eventData);
    if (!validationResult.success) {
      return null;
    }

    const event: AuditEvent = validationResult.data;

    // Calculate hash if enabled
    if (this.config.enableHashing) {
      event.previousHash = this.lastHash;
      event.hash = calculateAuditHash(event, this.lastHash);
      this.lastHash = event.hash;
    }

    try {
      const eventId = await this.store.store(event);
      return eventId;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Log authentication success
   */
  async logLoginSuccess(
    userId: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<string | null> {
    return this.logEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      severity: AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      ipAddress,
      userAgent,
      description: "User logged in successfully",
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Log authentication failure
   */
  async logLoginFailure(
    email: string,
    ipAddress: string,
    reason: string,
    userAgent?: string,
  ): Promise<string | null> {
    return this.logEvent({
      eventType: AuditEventType.LOGIN_FAILURE,
      severity: AuditSeverity.WARNING,
      outcome: AuditOutcome.FAILURE,
      ipAddress,
      userAgent,
      description: `Login failed for ${email}: ${reason}`,
      details: { email, reason },
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Log patient data access
   */
  async logPatientAccess(
    userId: string,
    patientId: string,
    action: "create" | "read" | "update" | "delete",
    ipAddress: string,
    details?: Record<string, unknown>,
  ): Promise<string | null> {
    const eventTypeMap = {
      create: AuditEventType.PATIENT_CREATE,
      read: AuditEventType.PATIENT_READ,
      update: AuditEventType.PATIENT_UPDATE,
      delete: AuditEventType.PATIENT_DELETE,
    };

    return this.logEvent({
      eventType: eventTypeMap[action],
      severity: action === "delete" ? AuditSeverity.WARNING : AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      resourceId: patientId,
      resourceType: "patient",
      ipAddress,
      description: `Patient ${action} operation performed`,
      details,
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Log LGPD consent event
   */
  async logConsentEvent(
    userId: string,
    patientId: string,
    action: "given" | "withdrawn",
    purpose: string,
    ipAddress: string,
  ): Promise<string | null> {
    const eventType =
      action === "given" ? AuditEventType.CONSENT_GIVEN : AuditEventType.CONSENT_WITHDRAWN;

    return this.logEvent({
      eventType,
      severity: AuditSeverity.INFO,
      outcome: AuditOutcome.SUCCESS,
      userId,
      resourceId: patientId,
      resourceType: "consent",
      ipAddress,
      description: `LGPD consent ${action} for ${purpose}`,
      details: { purpose, action },
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    ipAddress: string,
    userId?: string,
    details?: Record<string, unknown>,
  ): Promise<string | null> {
    return this.logEvent({
      eventType,
      severity,
      outcome: AuditOutcome.SUCCESS,
      userId,
      ipAddress,
      description,
      details,
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Log data breach event
   */
  async logDataBreach(
    description: string,
    affectedRecords: number,
    severity: "low" | "medium" | "high" | "critical",
    userId?: string,
    ipAddress?: string,
    details?: Record<string, unknown>,
  ): Promise<string | null> {
    const severityMap = {
      low: AuditSeverity.WARNING,
      medium: AuditSeverity.WARNING,
      high: AuditSeverity.ERROR,
      critical: AuditSeverity.CRITICAL,
    };

    return this.logEvent({
      eventType: AuditEventType.BREACH_DETECTED,
      severity: severityMap[severity],
      outcome: AuditOutcome.FAILURE,
      userId,
      ipAddress: ipAddress || "system",
      description,
      details: { affectedRecords, severity, ...details },
      timestamp: new Date(),
      source: "neonpro-api",
    });
  }

  /**
   * Retrieve audit events with filters
   */
  async getEvents(filters: AuditFilters): Promise<AuditEvent[]> {
    return this.store.retrieve(filters);
  }

  /**
   * Get audit event count
   */
  async getEventCount(filters: AuditFilters): Promise<number> {
    return this.store.count(filters);
  }

  /**
   * Cleanup old audit events
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    return this.store.cleanup(cutoffDate);
  }

  /**
   * Verify audit chain integrity
   */
  async verifyIntegrity(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ valid: boolean; brokenAt?: number }> {
    const events = await this.getEvents({
      startDate,
      endDate,
      limit: 10_000, // Verify in chunks for large datasets
    });

    return verifyAuditChain(events);
  }

  /**
   * Get severity level number for comparison
   */
  private getSeverityLevel(severity: AuditSeverity): number {
    const levels = {
      [AuditSeverity.INFO]: 0,
      [AuditSeverity.WARNING]: 1,
      [AuditSeverity.ERROR]: 2,
      [AuditSeverity.CRITICAL]: 3,
    };
    return levels[severity];
  }
}

/**
 * Memory-based audit store for development
 * For production, use database-backed store
 */
export class MemoryAuditStore implements AuditStore {
  private events: (AuditEvent & { id: string })[] = [];
  private readonly nextId = 1;

  async store(event: AuditEvent): Promise<string> {
    const id = (this.nextId++).toString();
    this.events.push({ ...event, id });
    return id;
  }

  async retrieve(filters: AuditFilters): Promise<AuditEvent[]> {
    let filtered = this.events.filter((event) => {
      if (filters.eventTypes && !filters.eventTypes.includes(event.eventType)) {
        return false;
      }
      if (filters.severities && !filters.severities.includes(event.severity)) {
        return false;
      }
      if (filters.userId && event.userId !== filters.userId) {
        return false;
      }
      if (filters.resourceId && event.resourceId !== filters.resourceId) {
        return false;
      }
      if (filters.resourceType && event.resourceType !== filters.resourceType) {
        return false;
      }
      if (filters.ipAddress && event.ipAddress !== filters.ipAddress) {
        return false;
      }
      if (filters.startDate && event.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && event.timestamp > filters.endDate) {
        return false;
      }
      return true;
    });

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (filters.offset) {
      filtered = filtered.slice(filters.offset);
    }
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  async count(filters: AuditFilters): Promise<number> {
    const events = await this.retrieve({
      ...filters,
      limit: undefined,
      offset: undefined,
    });
    return events.length;
  }

  async cleanup(olderThan: Date): Promise<number> {
    const initialCount = this.events.length;
    this.events = this.events.filter((event) => event.timestamp >= olderThan);
    return initialCount - this.events.length;
  }
}

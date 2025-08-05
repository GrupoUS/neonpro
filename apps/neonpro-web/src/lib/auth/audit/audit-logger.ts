export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  async log(event: Omit<AuditEvent, "id" | "timestamp">) {
    const auditEvent: AuditEvent = {
      ...event,
      id: "audit-" + Date.now(),
      timestamp: new Date(),
    };

    // Implementation would save to database
    console.log("Audit Event:", auditEvent);
    return auditEvent;
  }

  async logDataAccess(
    userId: string,
    resource: string,
    action: string,
    details?: Record<string, any>,
  ) {
    return this.log({
      userId,
      action: `data_access:${action}`,
      resource,
      details: details || {},
    });
  }

  async logSecurityEvent(userId: string, event: string, details?: Record<string, any>) {
    return this.log({
      userId,
      action: `security:${event}`,
      resource: "security",
      details: details || {},
    });
  }

  async logComplianceEvent(userId: string, event: string, details?: Record<string, any>) {
    return this.log({
      userId,
      action: `compliance:${event}`,
      resource: "compliance",
      details: details || {},
    });
  }
}

export const auditLogger = new AuditLogger();

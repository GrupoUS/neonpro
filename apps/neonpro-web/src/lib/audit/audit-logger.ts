// Audit logger for compliance and security
export class AuditLogger {
  static log(event: any) {
    console.log('[AUDIT]', event);
  }
  
  static error(error: any) {
    console.error('[AUDIT ERROR]', error);
  }
}

export const auditLog = {
  log: (event: any) => AuditLogger.log(event),
  error: (error: any) => AuditLogger.error(error)
};

export const auditLogger = auditLog;

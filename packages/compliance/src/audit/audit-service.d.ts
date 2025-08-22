/**
 * @fileoverview Audit Service for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Service
 *
 * Quality Standard: ≥9.9/10
 */
import { type AuditConfig, type AuditEvent, type AuditFilters, type AuditLog, type AuditTrailValidation } from './types';
/**
 * Constitutional Audit Service
 * Manages audit logging and trail validation for healthcare compliance
 */
export declare class AuditService {
    private readonly supabaseClient;
    constructor(supabaseClient: any);
    /**
     * Log an audit event
     */
    logEvent(tenantId: string, event: AuditEvent): Promise<{
        success: boolean;
        auditLogId?: string;
        error?: string;
    }>;
    /**
     * Query audit logs with filters
     */
    queryLogs(filters: AuditFilters): Promise<{
        success: boolean;
        logs?: AuditLog[];
        error?: string;
    }>;
    /**
     * Validate audit trail integrity
     */
    validateAuditTrail(tenantId: string): Promise<AuditTrailValidation>;
    /**
     * Configure audit settings
     */
    configureAudit(config: AuditConfig): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Calculate compliance score based on event type and severity
     */
    private calculateComplianceScore;
    /**
     * Trigger real-time alert for critical events
     */
    private triggerRealTimeAlert;
}

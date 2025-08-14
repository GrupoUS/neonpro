/**
 * LGPD Immutable Audit System
 * Cryptographic verification and anomaly detection
 * NeonPro Health Platform - LGPD Compliance Module
 */

import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac, randomBytes } from 'crypto';
import { z } from 'zod';

// =====================================================
// TYPE DEFINITIONS & SCHEMAS
// =====================================================

export const AuditEventTypeSchema = z.enum([
  'data_access',
  'data_modification',
  'data_deletion',
  'consent_granted',
  'consent_withdrawn',
  'data_export',
  'data_anonymization',
  'system_access',
  'configuration_change',
  'security_event',
  'compliance_violation',
  'automated_action'
]);

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const AuditEventSchema = z.object({
  id: z.string().uuid().optional(),
  eventType: AuditEventTypeSchema,
  userId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  action: z.string(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  legalBasis: z.string().optional(),
  purpose: z.string().optional(),
  riskScore: z.number().min(0).max(100).default(0),
  automatedAction: z.boolean().default(false),
  complianceFlags: z.record(z.any()).default({}),
  metadata: z.record(z.any()).optional()
});

export const IntegrityCheckSchema = z.object({
  eventId: z.string().uuid(),
  computedHash: z.string(),
  storedHash: z.string(),
  previousHash: z.string().optional(),
  isValid: z.boolean(),
  timestamp: z.date(),
  verificationMethod: z.string()
});

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type IntegrityCheck = z.infer<typeof IntegrityCheckSchema>;

// =====================================================
// IMMUTABLE AUDIT SYSTEM CLASS
// =====================================================

export class LGPDImmutableAuditSystem {
  private supabase: any;
  private secretKey: string;
  private anomalyDetector: AnomalyDetector;
  private integrityVerifier: IntegrityVerifier;
  
  constructor(supabaseUrl: string, supabaseKey: string, secretKey?: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.secretKey = secretKey || process.env.LGPD_AUDIT_SECRET || this.generateSecretKey();
    this.anomalyDetector = new AnomalyDetector(this.supabase);
    this.integrityVerifier = new IntegrityVerifier(this.supabase, this.secretKey);
  }

  /**
   * Log immutable audit event with cryptographic verification
   */
  async logEvent(event: Omit<AuditEvent, 'id'>): Promise<{
    success: boolean;
    eventId?: string;
    hash?: string;
    riskAssessment?: any;
    error?: string;
  }> {
    try {
      // Validate event data
      const validatedEvent = AuditEventSchema.parse(event);
      
      // Get sequence number and previous hash
      const { sequenceNumber, previousHash } = await this.getNextSequenceInfo();
      
      // Calculate risk score if not provided
      if (!validatedEvent.riskScore || validatedEvent.riskScore === 0) {
        validatedEvent.riskScore = await this.anomalyDetector.calculateRiskScore(validatedEvent);
      }
      
      // Create event with timestamp and sequence
      const timestampedEvent = {
        ...validatedEvent,
        timestamp: new Date(),
        sequenceNumber,
        previousHash
      };
      
      // Generate cryptographic hash
      const eventHash = this.generateEventHash(timestampedEvent);
      const hmacSignature = this.generateHMACSignature(timestampedEvent);
      
      // Insert into audit log
      const { data, error } = await this.supabase
        .from('lgpd_audit_log')
        .insert({
          event_type: timestampedEvent.eventType,
          user_id: timestampedEvent.userId,
          actor_id: timestampedEvent.actorId || timestampedEvent.userId,
          resource_type: timestampedEvent.resourceType,
          resource_id: timestampedEvent.resourceId,
          action: timestampedEvent.action,
          old_values: timestampedEvent.oldValues,
          new_values: timestampedEvent.newValues,
          ip_address: timestampedEvent.ipAddress,
          user_agent: timestampedEvent.userAgent,
          session_id: timestampedEvent.sessionId,
          legal_basis: timestampedEvent.legalBasis,
          purpose: timestampedEvent.purpose,
          event_hash: eventHash,
          previous_hash: previousHash,
          hmac_signature: hmacSignature,
          sequence_number: sequenceNumber,
          risk_score: timestampedEvent.riskScore,
          automated_action: timestampedEvent.automatedAction,
          compliance_flags: timestampedEvent.complianceFlags,
          metadata: timestampedEvent.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log audit event: ${error.message}`);
      }

      // Store integrity verification
      await this.integrityVerifier.storeIntegrityRecord(data.id, eventHash, hmacSignature);
      
      // Perform anomaly detection
      const riskAssessment = await this.anomalyDetector.analyzeEvent({
        ...timestampedEvent,
        id: data.id
      });
      
      // Trigger alerts if high risk
      if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
        await this.triggerSecurityAlert(data.id, riskAssessment);
      }

      return {
        success: true,
        eventId: data.id,
        hash: eventHash,
        riskAssessment
      };
    } catch (error) {
      console.error('Error logging audit event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditTrailIntegrity(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    isValid: boolean;
    totalEvents: number;
    validEvents: number;
    invalidEvents: number;
    brokenChains: number;
    details: IntegrityCheck[];
    summary: any;
  }> {
    try {
      let query = this.supabase
        .from('lgpd_audit_log')
        .select('*')
        .order('sequence_number', { ascending: true });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: events, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch audit events: ${error.message}`);
      }

      const verificationResults: IntegrityCheck[] = [];
      let validEvents = 0;
      let brokenChains = 0;
      let previousHash: string | null = null;

      for (const event of events) {
        // Verify event hash
        const computedHash = this.generateEventHash({
          eventType: event.event_type,
          userId: event.user_id,
          actorId: event.actor_id,
          resourceType: event.resource_type,
          resourceId: event.resource_id,
          action: event.action,
          oldValues: event.old_values,
          newValues: event.new_values,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          sessionId: event.session_id,
          legalBasis: event.legal_basis,
          purpose: event.purpose,
          riskScore: event.risk_score,
          automatedAction: event.automated_action,
          complianceFlags: event.compliance_flags,
          metadata: event.metadata,
          timestamp: new Date(event.created_at),
          sequenceNumber: event.sequence_number,
          previousHash: event.previous_hash
        });

        const isHashValid = computedHash === event.event_hash;
        const isChainValid = previousHash === null || event.previous_hash === previousHash;
        const isEventValid = isHashValid && isChainValid;

        if (isEventValid) {
          validEvents++;
        }
        if (!isChainValid) {
          brokenChains++;
        }

        verificationResults.push({
          eventId: event.id,
          computedHash,
          storedHash: event.event_hash,
          previousHash: event.previous_hash,
          isValid: isEventValid,
          timestamp: new Date(event.created_at),
          verificationMethod: 'sha256_hmac'
        });

        previousHash = event.event_hash;
      }

      const summary = {
        verificationDate: new Date(),
        totalEvents: events.length,
        validEvents,
        invalidEvents: events.length - validEvents,
        brokenChains,
        integrityPercentage: events.length > 0 ? (validEvents / events.length) * 100 : 100,
        chainIntegrityPercentage: events.length > 0 ? ((events.length - brokenChains) / events.length) * 100 : 100
      };

      return {
        isValid: validEvents === events.length && brokenChains === 0,
        totalEvents: events.length,
        validEvents,
        invalidEvents: events.length - validEvents,
        brokenChains,
        details: verificationResults,
        summary
      };
    } catch (error) {
      console.error('Error verifying audit trail integrity:', error);
      throw error;
    }
  }

  /**
   * Search audit events with advanced filtering
   */
  async searchAuditEvents(filters: {
    userId?: string;
    eventType?: AuditEventType;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: RiskLevel;
    ipAddress?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    events: any[];
    total: number;
    summary: any;
  }> {
    try {
      let query = this.supabase
        .from('lgpd_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters.riskLevel) {
        const riskRanges = {
          low: [0, 25],
          medium: [26, 50],
          high: [51, 75],
          critical: [76, 100]
        };
        const [min, max] = riskRanges[filters.riskLevel];
        query = query.gte('risk_score', min).lte('risk_score', max);
      }
      if (filters.ipAddress) {
        query = query.eq('ip_address', filters.ipAddress);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data: events, error, count } = await query;

      if (error) {
        throw new Error(`Failed to search audit events: ${error.message}`);
      }

      // Generate summary statistics
      const summary = await this.generateSearchSummary(events || []);

      return {
        events: events || [],
        total: count || 0,
        summary
      };
    } catch (error) {
      console.error('Error searching audit events:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: Date; end: Date };
    overview: any;
    consentMetrics: any;
    dataAccessMetrics: any;
    securityMetrics: any;
    riskAssessment: any;
    recommendations: string[];
  }> {
    try {
      const { events } = await this.searchAuditEvents({
        startDate,
        endDate,
        limit: 10000 // Large limit for comprehensive report
      });

      // Calculate metrics
      const overview = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
        eventTypes: this.groupBy(events, 'event_type'),
        dailyActivity: this.groupEventsByDay(events)
      };

      const consentMetrics = {
        consentGranted: events.filter(e => e.event_type === 'consent_granted').length,
        consentWithdrawn: events.filter(e => e.event_type === 'consent_withdrawn').length,
        consentRatio: this.calculateConsentRatio(events)
      };

      const dataAccessMetrics = {
        dataAccess: events.filter(e => e.event_type === 'data_access').length,
        dataModification: events.filter(e => e.event_type === 'data_modification').length,
        dataExport: events.filter(e => e.event_type === 'data_export').length,
        dataAnonymization: events.filter(e => e.event_type === 'data_anonymization').length
      };

      const securityMetrics = {
        securityEvents: events.filter(e => e.event_type === 'security_event').length,
        complianceViolations: events.filter(e => e.event_type === 'compliance_violation').length,
        highRiskEvents: events.filter(e => e.risk_score > 75).length,
        averageRiskScore: events.reduce((sum, e) => sum + (e.risk_score || 0), 0) / events.length
      };

      const riskAssessment = await this.anomalyDetector.generateRiskAssessment(events);
      const recommendations = this.generateRecommendations(overview, securityMetrics, riskAssessment);

      return {
        period: { start: startDate, end: endDate },
        overview,
        consentMetrics,
        dataAccessMetrics,
        securityMetrics,
        riskAssessment,
        recommendations
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async getNextSequenceInfo(): Promise<{ sequenceNumber: number; previousHash: string | null }> {
    const { data, error } = await this.supabase
      .from('lgpd_audit_log')
      .select('sequence_number, event_hash')
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { sequenceNumber: 1, previousHash: null };
    }

    return {
      sequenceNumber: data.sequence_number + 1,
      previousHash: data.event_hash
    };
  }

  private generateEventHash(event: any): string {
    const hashData = {
      eventType: event.eventType,
      userId: event.userId,
      actorId: event.actorId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      action: event.action,
      oldValues: event.oldValues,
      newValues: event.newValues,
      timestamp: event.timestamp?.toISOString(),
      sequenceNumber: event.sequenceNumber,
      previousHash: event.previousHash
    };

    return createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  private generateHMACSignature(event: any): string {
    const signatureData = {
      eventType: event.eventType,
      timestamp: event.timestamp?.toISOString(),
      sequenceNumber: event.sequenceNumber,
      resourceType: event.resourceType,
      action: event.action
    };

    return createHmac('sha256', this.secretKey)
      .update(JSON.stringify(signatureData))
      .digest('hex');
  }

  private generateSecretKey(): string {
    return randomBytes(32).toString('hex');
  }

  private async triggerSecurityAlert(eventId: string, riskAssessment: any): Promise<void> {
    // Implement security alert logic
    console.log(`Security alert triggered for event ${eventId}:`, riskAssessment);
    
    // This would integrate with notification systems, SIEM, etc.
    // Example: Send to security team, create incident ticket, etc.
  }

  private async generateSearchSummary(events: any[]): Promise<any> {
    return {
      totalEvents: events.length,
      eventTypes: this.groupBy(events, 'event_type'),
      riskDistribution: this.groupByRiskLevel(events),
      timeRange: {
        earliest: events.length > 0 ? new Date(Math.min(...events.map(e => new Date(e.created_at).getTime()))) : null,
        latest: events.length > 0 ? new Date(Math.max(...events.map(e => new Date(e.created_at).getTime()))) : null
      },
      uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
      automatedActions: events.filter(e => e.automated_action).length
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private groupByRiskLevel(events: any[]): Record<RiskLevel, number> {
    return events.reduce((groups, event) => {
      const score = event.risk_score || 0;
      let level: RiskLevel;
      if (score <= 25) level = 'low';
      else if (score <= 50) level = 'medium';
      else if (score <= 75) level = 'high';
      else level = 'critical';
      
      groups[level] = (groups[level] || 0) + 1;
      return groups;
    }, { low: 0, medium: 0, high: 0, critical: 0 });
  }

  private groupEventsByDay(events: any[]): Record<string, number> {
    return events.reduce((groups, event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateConsentRatio(events: any[]): number {
    const granted = events.filter(e => e.event_type === 'consent_granted').length;
    const withdrawn = events.filter(e => e.event_type === 'consent_withdrawn').length;
    const total = granted + withdrawn;
    return total > 0 ? granted / total : 0;
  }

  private generateRecommendations(overview: any, securityMetrics: any, riskAssessment: any): string[] {
    const recommendations: string[] = [];

    if (securityMetrics.averageRiskScore > 50) {
      recommendations.push('Consider implementing additional security controls due to elevated risk scores');
    }

    if (securityMetrics.complianceViolations > 0) {
      recommendations.push('Review and address compliance violations to maintain LGPD compliance');
    }

    if (overview.uniqueUsers > 1000 && securityMetrics.securityEvents < 5) {
      recommendations.push('Consider enhancing security monitoring for large user base');
    }

    return recommendations;
  }
}

// =====================================================
// ANOMALY DETECTOR CLASS
// =====================================================

export class AnomalyDetector {
  private supabase: any;
  private riskThresholds: Record<string, number>;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.riskThresholds = {
      data_access: 10,
      data_modification: 25,
      data_deletion: 50,
      consent_withdrawn: 15,
      data_export: 30,
      security_event: 75,
      compliance_violation: 90
    };
  }

  async calculateRiskScore(event: AuditEvent): Promise<number> {
    let riskScore = this.riskThresholds[event.eventType] || 5;

    // Increase risk for sensitive operations
    if (event.action.includes('delete') || event.action.includes('export')) {
      riskScore += 20;
    }

    // Increase risk for automated actions
    if (event.automatedAction) {
      riskScore += 10;
    }

    // Increase risk for unusual times (outside business hours)
    const hour = new Date().getHours();
    if (hour < 8 || hour > 18) {
      riskScore += 15;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = await this.detectSuspiciousPatterns(event);
    riskScore += suspiciousPatterns.riskIncrease;

    return Math.min(riskScore, 100); // Cap at 100
  }

  async analyzeEvent(event: AuditEvent & { id: string }): Promise<{
    riskLevel: RiskLevel;
    anomalies: string[];
    patterns: any;
    recommendations: string[];
  }> {
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Detect anomalies
    const patterns = await this.detectSuspiciousPatterns(event);
    anomalies.push(...patterns.anomalies);

    // Determine risk level
    let riskLevel: RiskLevel;
    if (event.riskScore <= 25) riskLevel = 'low';
    else if (event.riskScore <= 50) riskLevel = 'medium';
    else if (event.riskScore <= 75) riskLevel = 'high';
    else riskLevel = 'critical';

    // Generate recommendations
    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Immediate review required');
      recommendations.push('Consider additional authentication');
    }

    return {
      riskLevel,
      anomalies,
      patterns,
      recommendations
    };
  }

  async generateRiskAssessment(events: any[]): Promise<any> {
    const riskDistribution = events.reduce((dist, event) => {
      const score = event.risk_score || 0;
      if (score <= 25) dist.low++;
      else if (score <= 50) dist.medium++;
      else if (score <= 75) dist.high++;
      else dist.critical++;
      return dist;
    }, { low: 0, medium: 0, high: 0, critical: 0 });

    const averageRisk = events.reduce((sum, e) => sum + (e.risk_score || 0), 0) / events.length;
    
    return {
      averageRiskScore: averageRisk,
      riskDistribution,
      totalEvents: events.length,
      highRiskEvents: events.filter(e => (e.risk_score || 0) > 75).length,
      riskTrend: 'stable' // This would be calculated based on historical data
    };
  }

  private async detectSuspiciousPatterns(event: AuditEvent): Promise<{
    anomalies: string[];
    riskIncrease: number;
  }> {
    const anomalies: string[] = [];
    let riskIncrease = 0;

    // Check for rapid successive actions
    if (event.userId) {
      const recentEvents = await this.getRecentUserEvents(event.userId, 5); // Last 5 minutes
      if (recentEvents.length > 10) {
        anomalies.push('Rapid successive actions detected');
        riskIncrease += 25;
      }
    }

    // Check for unusual IP addresses
    if (event.ipAddress) {
      const isUnusualIP = await this.isUnusualIPAddress(event.userId || '', event.ipAddress);
      if (isUnusualIP) {
        anomalies.push('Unusual IP address detected');
        riskIncrease += 20;
      }
    }

    return { anomalies, riskIncrease };
  }

  private async getRecentUserEvents(userId: string, minutes: number): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('lgpd_audit_log')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffTime.toISOString());

    return error ? [] : data;
  }

  private async isUnusualIPAddress(userId: string, ipAddress: string): Promise<boolean> {
    // Check if this IP has been used by this user in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('lgpd_audit_log')
      .select('ip_address')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(100);

    if (error || !data) return false;

    const knownIPs = new Set(data.map(record => record.ip_address).filter(Boolean));
    return !knownIPs.has(ipAddress);
  }
}

// =====================================================
// INTEGRITY VERIFIER CLASS
// =====================================================

export class IntegrityVerifier {
  private supabase: any;
  private secretKey: string;

  constructor(supabase: any, secretKey: string) {
    this.supabase = supabase;
    this.secretKey = secretKey;
  }

  async storeIntegrityRecord(
    eventId: string,
    eventHash: string,
    hmacSignature: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('lgpd_audit_integrity')
        .insert({
          event_id: eventId,
          event_hash: eventHash,
          hmac_signature: hmacSignature,
          verification_timestamp: new Date().toISOString(),
          verification_method: 'sha256_hmac'
        });

      if (error) {
        console.error('Failed to store integrity record:', error);
      }
    } catch (error) {
      console.error('Error storing integrity record:', error);
    }
  }

  async verifyEventIntegrity(eventId: string): Promise<IntegrityCheck> {
    try {
      // Get event and integrity record
      const [eventResult, integrityResult] = await Promise.all([
        this.supabase.from('lgpd_audit_log').select('*').eq('id', eventId).single(),
        this.supabase.from('lgpd_audit_integrity').select('*').eq('event_id', eventId).single()
      ]);

      if (eventResult.error || integrityResult.error) {
        throw new Error('Event or integrity record not found');
      }

      const event = eventResult.data;
      const integrity = integrityResult.data;

      // Recompute hash
      const computedHash = this.computeEventHash(event);
      const isValid = computedHash === integrity.event_hash;

      return {
        eventId,
        computedHash,
        storedHash: integrity.event_hash,
        previousHash: event.previous_hash,
        isValid,
        timestamp: new Date(),
        verificationMethod: 'sha256_hmac'
      };
    } catch (error) {
      console.error('Error verifying event integrity:', error);
      throw error;
    }
  }

  private computeEventHash(event: any): string {
    const hashData = {
      eventType: event.event_type,
      userId: event.user_id,
      actorId: event.actor_id,
      resourceType: event.resource_type,
      resourceId: event.resource_id,
      action: event.action,
      oldValues: event.old_values,
      newValues: event.new_values,
      timestamp: event.created_at,
      sequenceNumber: event.sequence_number,
      previousHash: event.previous_hash
    };

    return createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }
}

export default LGPDImmutableAuditSystem;
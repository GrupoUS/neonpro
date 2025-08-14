// LGPD Event Emitter - Utility Module
// Story 1.5: LGPD Compliance Automation
// Utility for event-driven communication between LGPD modules

import type {
  LGPDEventType,
  LGPDDataCategory,
  LGPDDataProcessingPurpose,
  LGPDLegalBasis
} from '../types';

/**
 * Event data interface for LGPD events
 */
export interface LGPDEventData {
  clinic_id: string;
  user_id?: string;
  event_type: LGPDEventType;
  timestamp: string;
  data: Record<string, any>;
  metadata?: {
    source_module: string;
    correlation_id?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    legal_basis?: LGPDLegalBasis;
    data_categories?: LGPDDataCategory[];
    processing_purpose?: LGPDDataProcessingPurpose;
    requires_notification?: boolean;
    compliance_impact?: 'none' | 'low' | 'medium' | 'high';
  };
}

/**
 * Event listener interface
 */
export interface LGPDEventListener {
  (eventData: LGPDEventData): void | Promise<void>;
}

/**
 * LGPD Event Emitter for inter-module communication
 * Provides event-driven architecture for LGPD compliance system
 */
export class LGPDEventEmitter {
  private listeners: Map<LGPDEventType, Set<LGPDEventListener>> = new Map();
  private eventHistory: LGPDEventData[] = [];
  private maxHistorySize = 1000;
  private isEnabled = true;

  /**
   * Subscribe to LGPD events
   */
  on(eventType: LGPDEventType, listener: LGPDEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Subscribe to LGPD events (one-time)
   */
  once(eventType: LGPDEventType, listener: LGPDEventListener): void {
    const onceListener: LGPDEventListener = async (eventData) => {
      await listener(eventData);
      this.off(eventType, onceListener);
    };
    this.on(eventType, onceListener);
  }

  /**
   * Unsubscribe from LGPD events
   */
  off(eventType: LGPDEventType, listener: LGPDEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Emit LGPD event
   */
  async emit(eventData: LGPDEventData): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // Add to event history
    this.addToHistory(eventData);

    // Get listeners for this event type
    const listeners = this.listeners.get(eventData.event_type);
    if (!listeners || listeners.size === 0) {
      return;
    }

    // Execute all listeners
    const promises: Promise<void>[] = [];
    for (const listener of listeners) {
      try {
        const result = listener(eventData);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`Error in LGPD event listener for ${eventData.event_type}:`, error);
      }
    }

    // Wait for all async listeners to complete
    if (promises.length > 0) {
      try {
        await Promise.allSettled(promises);
      } catch (error) {
        console.error('Error waiting for LGPD event listeners:', error);
      }
    }
  }

  /**
   * Emit consent-related events
   */
  async emitConsentEvent(
    clinicId: string,
    userId: string,
    action: 'collected' | 'withdrawn' | 'renewed' | 'expired',
    consentData: {
      consent_id: string;
      data_categories: LGPDDataCategory[];
      processing_purpose: LGPDDataProcessingPurpose;
      legal_basis: LGPDLegalBasis;
      expiry_date?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      user_id: userId,
      event_type: 'consent_updated',
      timestamp: new Date().toISOString(),
      data: {
        action,
        consent_id: consentData.consent_id,
        data_categories: consentData.data_categories,
        processing_purpose: consentData.processing_purpose,
        legal_basis: consentData.legal_basis,
        expiry_date: consentData.expiry_date
      },
      metadata: {
        source_module: 'consent_manager',
        severity: action === 'withdrawn' ? 'medium' : 'low',
        legal_basis: consentData.legal_basis,
        data_categories: consentData.data_categories,
        processing_purpose: consentData.processing_purpose,
        requires_notification: action === 'withdrawn',
        compliance_impact: action === 'withdrawn' ? 'medium' : 'low'
      }
    });
  }

  /**
   * Emit data subject rights events
   */
  async emitDataSubjectRightsEvent(
    clinicId: string,
    userId: string,
    action: 'request_submitted' | 'request_processed' | 'request_completed' | 'request_rejected',
    requestData: {
      request_id: string;
      request_type: 'access' | 'rectification' | 'deletion' | 'portability' | 'objection';
      data_categories: LGPDDataCategory[];
      processing_purpose?: LGPDDataProcessingPurpose;
      response_deadline?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      user_id: userId,
      event_type: 'data_subject_request',
      timestamp: new Date().toISOString(),
      data: {
        action,
        request_id: requestData.request_id,
        request_type: requestData.request_type,
        data_categories: requestData.data_categories,
        processing_purpose: requestData.processing_purpose,
        response_deadline: requestData.response_deadline
      },
      metadata: {
        source_module: 'data_subject_rights',
        severity: action === 'request_submitted' ? 'medium' : 'low',
        data_categories: requestData.data_categories,
        processing_purpose: requestData.processing_purpose,
        requires_notification: true,
        compliance_impact: requestData.request_type === 'deletion' ? 'high' : 'medium'
      }
    });
  }

  /**
   * Emit compliance monitoring events
   */
  async emitComplianceEvent(
    clinicId: string,
    action: 'assessment_completed' | 'violation_detected' | 'alert_generated' | 'remediation_required',
    complianceData: {
      assessment_id?: string;
      violation_type?: string;
      alert_id?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      compliance_score?: number;
      affected_data_categories?: LGPDDataCategory[];
      remediation_deadline?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      event_type: 'compliance_status_changed',
      timestamp: new Date().toISOString(),
      data: {
        action,
        assessment_id: complianceData.assessment_id,
        violation_type: complianceData.violation_type,
        alert_id: complianceData.alert_id,
        compliance_score: complianceData.compliance_score,
        affected_data_categories: complianceData.affected_data_categories,
        remediation_deadline: complianceData.remediation_deadline
      },
      metadata: {
        source_module: 'compliance_monitor',
        severity: complianceData.severity,
        data_categories: complianceData.affected_data_categories,
        requires_notification: complianceData.severity === 'high' || complianceData.severity === 'critical',
        compliance_impact: complianceData.severity === 'critical' ? 'high' : 'medium'
      }
    });
  }

  /**
   * Emit data breach events
   */
  async emitBreachEvent(
    clinicId: string,
    action: 'breach_detected' | 'breach_reported' | 'breach_contained' | 'breach_resolved',
    breachData: {
      incident_id: string;
      breach_type: string;
      affected_records_count: number;
      affected_data_categories: LGPDDataCategory[];
      severity: 'low' | 'medium' | 'high' | 'critical';
      notification_required: boolean;
      anpd_notification_deadline?: string;
      data_subject_notification_deadline?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      event_type: 'data_breach',
      timestamp: new Date().toISOString(),
      data: {
        action,
        incident_id: breachData.incident_id,
        breach_type: breachData.breach_type,
        affected_records_count: breachData.affected_records_count,
        affected_data_categories: breachData.affected_data_categories,
        notification_required: breachData.notification_required,
        anpd_notification_deadline: breachData.anpd_notification_deadline,
        data_subject_notification_deadline: breachData.data_subject_notification_deadline
      },
      metadata: {
        source_module: 'breach_detector',
        severity: breachData.severity,
        data_categories: breachData.affected_data_categories,
        requires_notification: breachData.notification_required,
        compliance_impact: 'high'
      }
    });
  }

  /**
   * Emit data retention events
   */
  async emitRetentionEvent(
    clinicId: string,
    action: 'policy_applied' | 'data_deleted' | 'data_anonymized' | 'retention_violation',
    retentionData: {
      policy_id: string;
      data_categories: LGPDDataCategory[];
      records_affected: number;
      retention_period: string;
      action_taken: 'deletion' | 'anonymization' | 'archival';
      violation_details?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      event_type: 'data_retention_action',
      timestamp: new Date().toISOString(),
      data: {
        action,
        policy_id: retentionData.policy_id,
        data_categories: retentionData.data_categories,
        records_affected: retentionData.records_affected,
        retention_period: retentionData.retention_period,
        action_taken: retentionData.action_taken,
        violation_details: retentionData.violation_details
      },
      metadata: {
        source_module: 'data_retention',
        severity: action === 'retention_violation' ? 'high' : 'low',
        data_categories: retentionData.data_categories,
        requires_notification: action === 'retention_violation',
        compliance_impact: action === 'retention_violation' ? 'high' : 'low'
      }
    });
  }

  /**
   * Emit third-party compliance events
   */
  async emitThirdPartyEvent(
    clinicId: string,
    action: 'agreement_created' | 'data_transferred' | 'compliance_violation' | 'agreement_terminated',
    thirdPartyData: {
      agreement_id: string;
      third_party_name: string;
      data_categories: LGPDDataCategory[];
      transfer_purpose: LGPDDataProcessingPurpose;
      records_transferred?: number;
      violation_type?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      event_type: 'third_party_data_sharing',
      timestamp: new Date().toISOString(),
      data: {
        action,
        agreement_id: thirdPartyData.agreement_id,
        third_party_name: thirdPartyData.third_party_name,
        data_categories: thirdPartyData.data_categories,
        transfer_purpose: thirdPartyData.transfer_purpose,
        records_transferred: thirdPartyData.records_transferred,
        violation_type: thirdPartyData.violation_type
      },
      metadata: {
        source_module: 'third_party_compliance',
        severity: action === 'compliance_violation' ? 'high' : 'medium',
        data_categories: thirdPartyData.data_categories,
        processing_purpose: thirdPartyData.transfer_purpose,
        requires_notification: action === 'compliance_violation',
        compliance_impact: action === 'compliance_violation' ? 'high' : 'medium'
      }
    });
  }

  /**
   * Emit legal documentation events
   */
  async emitDocumentationEvent(
    clinicId: string,
    userId: string,
    action: 'document_generated' | 'document_updated' | 'document_approved' | 'document_expired',
    documentData: {
      document_id: string;
      document_type: string;
      document_title: string;
      version?: string;
      approval_required?: boolean;
      expiry_date?: string;
    }
  ): Promise<void> {
    await this.emit({
      clinic_id: clinicId,
      user_id: userId,
      event_type: 'legal_document_updated',
      timestamp: new Date().toISOString(),
      data: {
        action,
        document_id: documentData.document_id,
        document_type: documentData.document_type,
        document_title: documentData.document_title,
        version: documentData.version,
        approval_required: documentData.approval_required,
        expiry_date: documentData.expiry_date
      },
      metadata: {
        source_module: 'legal_documentation',
        severity: action === 'document_expired' ? 'medium' : 'low',
        requires_notification: action === 'document_expired' || documentData.approval_required,
        compliance_impact: action === 'document_expired' ? 'medium' : 'low'
      }
    });
  }

  /**
   * Get event history
   */
  getEventHistory(
    filters?: {
      clinic_id?: string;
      event_type?: LGPDEventType;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      source_module?: string;
      limit?: number;
      since?: Date;
    }
  ): LGPDEventData[] {
    let filteredEvents = [...this.eventHistory];

    if (filters?.clinic_id) {
      filteredEvents = filteredEvents.filter(event => event.clinic_id === filters.clinic_id);
    }

    if (filters?.event_type) {
      filteredEvents = filteredEvents.filter(event => event.event_type === filters.event_type);
    }

    if (filters?.severity) {
      filteredEvents = filteredEvents.filter(event => event.metadata?.severity === filters.severity);
    }

    if (filters?.source_module) {
      filteredEvents = filteredEvents.filter(event => event.metadata?.source_module === filters.source_module);
    }

    if (filters?.since) {
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= filters.since!);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  /**
   * Get event statistics
   */
  getEventStatistics(
    clinicId?: string,
    timeRange?: { start: Date; end: Date }
  ): {
    total_events: number;
    events_by_type: Record<LGPDEventType, number>;
    events_by_severity: Record<string, number>;
    events_by_module: Record<string, number>;
    compliance_impact_events: number;
    notification_required_events: number;
  } {
    let events = this.eventHistory;

    if (clinicId) {
      events = events.filter(event => event.clinic_id === clinicId);
    }

    if (timeRange) {
      events = events.filter(event => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= timeRange.start && eventTime <= timeRange.end;
      });
    }

    const eventsByType: Record<LGPDEventType, number> = {} as Record<LGPDEventType, number>;
    const eventsBySeverity: Record<string, number> = {};
    const eventsByModule: Record<string, number> = {};
    let complianceImpactEvents = 0;
    let notificationRequiredEvents = 0;

    for (const event of events) {
      // Count by type
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;

      // Count by severity
      const severity = event.metadata?.severity || 'unknown';
      eventsBySeverity[severity] = (eventsBySeverity[severity] || 0) + 1;

      // Count by module
      const module = event.metadata?.source_module || 'unknown';
      eventsByModule[module] = (eventsByModule[module] || 0) + 1;

      // Count compliance impact events
      if (event.metadata?.compliance_impact && event.metadata.compliance_impact !== 'none') {
        complianceImpactEvents++;
      }

      // Count notification required events
      if (event.metadata?.requires_notification) {
        notificationRequiredEvents++;
      }
    }

    return {
      total_events: events.length,
      events_by_type: eventsByType,
      events_by_severity: eventsBySeverity,
      events_by_module: eventsByModule,
      compliance_impact_events: complianceImpactEvents,
      notification_required_events: notificationRequiredEvents
    };
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable event emitter
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if event emitter is enabled
   */
  isEventEmitterEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get active listeners count
   */
  getListenersCount(): Record<LGPDEventType, number> {
    const counts: Record<LGPDEventType, number> = {} as Record<LGPDEventType, number>;
    
    for (const [eventType, listeners] of this.listeners.entries()) {
      counts[eventType] = listeners.size;
    }
    
    return counts;
  }

  // Private helper methods

  private addToHistory(eventData: LGPDEventData): void {
    this.eventHistory.push(eventData);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.listeners.clear();
    this.eventHistory = [];
    this.isEnabled = false;
  }
}

// Export singleton instance
export const lgpdEventEmitter = new LGPDEventEmitter();

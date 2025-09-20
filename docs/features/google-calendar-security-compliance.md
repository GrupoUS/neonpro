# Google Calendar API Security & Compliance Guide

## Overview

This document provides comprehensive security and compliance guidelines for implementing Google Calendar API integration in healthcare environments, specifically focused on aesthetic clinics operating under Brazilian regulations (LGPD) and healthcare standards.

## Security Architecture

### Authentication & Authorization Framework

```yaml
AUTHENTICATION_LAYERS:
  layer_1_oauth2:
    component: "Google OAuth 2.0 with PKCE"
    purpose: "Primary authentication with Google services"
    security_controls:
      - "Proof Key for Code Exchange (PKCE)"
      - "State parameter to prevent CSRF"
      - "Token encryption at rest"
      - "Secure token storage"
  
  layer_2_application:
    component: "Application-level authentication"
    purpose: "User session management and authorization"
    security_controls:
      - "JWT tokens with proper claims"
      - "Session timeout management"
      - "Multi-factor authentication"
      - "Role-based access control"
  
  layer_3_compliance:
    component: "Healthcare compliance validation"
    purpose: "Regulatory compliance enforcement"
    security_controls:
      - "LGPD compliance checks"
      - "Audit trail logging"
      - "Data minimization enforcement"
      - "Consent verification"
```

### OAuth 2.0 Security Implementation

```typescript
// src/security/oauth2-security.service.ts
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';
import crypto from 'crypto';

export class OAuth2SecurityService {
  private oauth2Client: OAuth2Client;
  private logger: Logger;
  private readonly TOKEN_ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly TOKEN_IV_LENGTH = 16;
  private readonly TOKEN_TAG_LENGTH = 16;

  constructor(logger: Logger) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.logger = logger;
  }

  generateSecureState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePKCECodes(): { codeChallenge: string; codeVerifier: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    return { codeChallenge, codeVerifier };
  }

  generateAuthUrl(state: string, codeChallenge: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code,
        code_verifier: codeVerifier,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });

      // Encrypt tokens before storage
      const encryptedAccessToken = await this.encryptToken(tokens.access_token!);
      const encryptedRefreshToken = await this.encryptToken(tokens.refresh_token!);

      return {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: tokens.expiry_date! - Date.now()
      };
    } catch (error) {
      this.logger.error('Token exchange failed', { error });
      throw new Error('Authentication failed');
    }
  }

  private async encryptToken(token: string): Promise<string> {
    const iv = crypto.randomBytes(this.TOKEN_IV_LENGTH);
    const cipher = crypto.createCipher(
      this.TOKEN_ENCRYPTION_ALGORITHM,
      process.env.ENCRYPTION_KEY!
    );
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  async decryptToken(encryptedToken: string): Promise<string> {
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher(
      this.TOKEN_ENCRYPTION_ALGORITHM,
      process.env.ENCRYPTION_KEY!
    );
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## LGPD Compliance Implementation

### Data Protection Principles

```yaml
LGPD_PRINCIPLES_IMPLEMENTATION:
  lawfulness_fairness_transparency:
    - "Clear privacy policy for calendar data processing"
    - "Explicit patient consent for appointment data"
    - "Transparent data usage notifications"
    - "Purpose limitation enforcement"
  
  purpose_limitation:
    - "Data collected only for appointment management"
    - "No secondary data usage without consent"
    - "Regular purpose validation"
    - "Data minimization implementation"
  
  data_minimization:
    - "Collect only necessary appointment information"
    - "Avoid sensitive patient data in calendar events"
    - "Anonymize data where possible"
    - "Regular data collection reviews"
  
  accuracy:
    - "Maintain accurate appointment schedules"
    - "Implement data validation mechanisms"
    - "Regular data quality audits"
    - "Error correction procedures"
  
  storage_limitation:
    - "Data retention policies for appointment records"
    - "Automated data deletion after retention period"
    - "Archival procedures for historical data"
    - "Regular retention policy reviews"
  
  integrity_confidentiality:
    - "Encryption of appointment data at rest and in transit"
    - "Access controls and authentication mechanisms"
    - "Regular security assessments"
    - "Incident response procedures"
  
  accountability:
    - "Compliance officer designation"
    - "Regular compliance audits"
    - "Documentation of compliance measures"
    - "Staff training programs"
```

### Patient Data Protection Service

```typescript
// src/compliance/lgpd-service.ts
import { Logger } from 'winston';
import crypto from 'crypto';

export interface PatientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  dateOfBirth?: string;
}

export interface AppointmentData {
  id: string;
  patientId: string;
  procedureType: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  staffAssigned: string[];
}

export class LGPDService {
  private logger: Logger;
  private readonly SENSITIVE_DATA_PATTERNS = [
    /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF
    /\d{11}/, // Phone (simplified)
    /(\d{2})\/(\d{2})\/(\d{4})/, // Date (DD/MM/YYYY)
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ // Email
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async validateDataProcessingConsent(
    patientId: string,
    processingPurpose: string
  ): Promise<{ valid: boolean; consentRecord?: any }> {
    try {
      // Check database for patient consent
      const consentRecord = await this.getPatientConsent(patientId, processingPurpose);
      
      if (!consentRecord) {
        return { valid: false };
      }

      // Check if consent is still valid
      const now = new Date();
      if (consentRecord.expiresAt && now > new Date(consentRecord.expiresAt)) {
        return { valid: false };
      }

      // Check if consent covers the specific processing purpose
      if (!consentRecord.purposes.includes(processingPurpose)) {
        return { valid: false };
      }

      return { valid: true, consentRecord };
    } catch (error) {
      this.logger.error('Consent validation failed', { patientId, error });
      return { valid: false };
    }
  }

  anonymizeCalendarEventData(eventData: any): any {
    const anonymizedData = { ...eventData };

    // Remove or anonymize sensitive patient information
    if (anonymizedData.description) {
      anonymizedData.description = this.anonymizeText(anonymizedData.description);
    }

    // Use patient ID instead of name in summary
    if (anonymizedData.summary) {
      anonymizedData.summary = this.anonymizeSummary(anonymizedData.summary);
    }

    return anonymizedData;
  }

  private anonymizeText(text: string): string {
    let anonymized = text;
    
    // Replace CPF with masked version
    anonymized = anonymized.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '***.***.***-**');
    
    // Replace phone numbers with masked version
    anonymized = anonymized.replace(/\d{11}/g, '***********');
    
    // Replace email addresses with masked version
    anonymized = anonymized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
    
    return anonymized;
  }

  private anonymizeSummary(summary: string): string {
    // Replace patient names with patient ID pattern
    return summary.replace(/-\s*[A-Za-z\s]+$/, '- Patient ID: ***');
  }

  containsSensitiveData(data: any): boolean {
    const dataString = JSON.stringify(data);
    return this.SENSITIVE_DATA_PATTERNS.some(pattern => 
      pattern.test(dataString)
    );
  }

  async logDataProcessing(
    userId: string,
    action: string,
    dataType: string,
    purpose: string,
    ipAddress: string
  ): Promise<void> {
    const processingLog = {
      id: crypto.randomUUID(),
      userId,
      action,
      dataType,
      purpose,
      ipAddress,
      timestamp: new Date(),
      legalBasis: 'consent'
    };

    // Store in compliance database
    await this.storeProcessingLog(processingLog);

    this.logger.info('Data processing logged', { processingLogId: processingLog.id });
  }

  async handleDataAccessRequest(
    patientId: string,
    requestType: 'access' | 'deletion' | 'portability'
  ): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      switch (requestType) {
        case 'access':
          return await this.provideDataAccess(patientId);
        case 'deletion':
          return await this.processDataDeletion(patientId);
        case 'portability':
          return await this.exportDataPortability(patientId);
        default:
          return { success: false, message: 'Invalid request type' };
      }
    } catch (error) {
      this.logger.error('Data access request failed', { patientId, requestType, error });
      return { success: false, message: 'Request processing failed' };
    }
  }

  private async getPatientConsent(patientId: string, purpose: string): Promise<any> {
    // TODO: Implement database query for patient consent
    return null;
  }

  private async storeProcessingLog(log: any): Promise<void> {
    // TODO: Implement database storage for processing logs
  }

  private async provideDataAccess(patientId: string): Promise<{ success: boolean; data?: any; message: string }> {
    // TODO: Implement data access provision
    return { success: true, message: 'Data access request processed' };
  }

  private async processDataDeletion(patientId: string): Promise<{ success: boolean; data?: any; message: string }> {
    // TODO: Implement data deletion process
    return { success: true, message: 'Data deletion request processed' };
  }

  private async exportDataPortability(patientId: string): Promise<{ success: boolean; data?: any; message: string }> {
    // TODO: Implement data export for portability
    return { success: true, message: 'Data portability request processed' };
  }
}
```

## Audit Trail Implementation

### Comprehensive Audit Logging

```typescript
// src/security/audit-service.ts
import { Logger } from 'winston';
import crypto from 'crypto';

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceType: 'calendar_event' | 'appointment' | 'patient_data' | 'system';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: any;
  complianceFlags: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  complianceFlags?: string[];
  riskLevel?: string;
}

export class AuditService {
  private logger: Logger;
  private auditEvents: AuditEvent[] = [];
  private readonly MAX_AUDIT_EVENTS = 10000;

  constructor(logger: Logger) {
    this.logger = logger;
    this.setupAuditCleanup();
  }

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    // Assess risk level
    auditEvent.riskLevel = this.assessRiskLevel(auditEvent);

    // Add compliance flags
    auditEvent.complianceFlags = this.identifyComplianceFlags(auditEvent);

    // Store event
    this.auditEvents.push(auditEvent);

    // Ensure we don't exceed memory limits
    if (this.auditEvents.length > this.MAX_AUDIT_EVENTS) {
      await this.archiveOldEvents();
    }

    // Log to file for long-term storage
    await this.persistAuditEvent(auditEvent);

    // Alert on high-risk events
    if (auditEvent.riskLevel === 'high' || auditEvent.riskLevel === 'critical') {
      await this.alertHighRiskEvent(auditEvent);
    }

    this.logger.info('Audit event logged', { 
      auditId: auditEvent.id,
      action: auditEvent.action,
      riskLevel: auditEvent.riskLevel
    });

    return auditEvent.id;
  }

  async queryAuditLogs(filter: AuditFilter): Promise<AuditEvent[]> {
    let filteredEvents = [...this.auditEvents];

    if (filter.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === filter.userId);
    }

    if (filter.action) {
      filteredEvents = filteredEvents.filter(event => event.action.includes(filter.action!));
    }

    if (filter.resourceType) {
      filteredEvents = filteredEvents.filter(event => event.resourceType === filter.resourceType);
    }

    if (filter.startDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= filter.endDate!);
    }

    if (filter.complianceFlags && filter.complianceFlags.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        filter.complianceFlags!.some(flag => event.complianceFlags.includes(flag))
      );
    }

    if (filter.riskLevel) {
      filteredEvents = filteredEvents.filter(event => event.riskLevel === filter.riskLevel);
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    complianceViolations: number;
    highRiskEvents: number;
    criticalEvents: number;
    userActivity: Record<string, number>;
    commonViolations: string[];
    recommendations: string[];
  }> {
    const events = await this.queryAuditLogs({ startDate, endDate });

    const highRiskEvents = events.filter(e => e.riskLevel === 'high').length;
    const criticalEvents = events.filter(e => e.riskLevel === 'critical').length;
    const complianceViolations = events.filter(e => e.complianceFlags.length > 0).length;

    const userActivity = events.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const violationCounts = events.reduce((acc, event) => {
      event.complianceFlags.forEach(flag => {
        acc[flag] = (acc[flag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const commonViolations = Object.entries(violationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([flag]) => flag);

    const recommendations = this.generateRecommendations(events, violationCounts);

    return {
      totalEvents: events.length,
      complianceViolations,
      highRiskEvents,
      criticalEvents,
      userActivity,
      commonViolations,
      recommendations
    };
  }

  private assessRiskLevel(event: AuditEvent): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Action-based risk assessment
    const actionRiskMap: Record<string, number> = {
      'DELETE_APPOINTMENT': 8,
      'UPDATE_APPOINTMENT': 5,
      'CREATE_APPOINTMENT': 3,
      'VIEW_APPOINTMENT': 1,
      'SYNC_CALENDAR': 2
    };

    riskScore += actionRiskMap[event.action] || 3;

    // Resource type risk assessment
    const resourceRiskMap: Record<string, number> = {
      'patient_data': 7,
      'appointment': 5,
      'calendar_event': 3,
      'system': 2
    };

    riskScore += resourceRiskMap[event.resourceType] || 3;

    // Volume-based risk assessment
    if (this.getUserRecentEventCount(event.userId, 60) > 10) {
      riskScore += 5; // High activity in short time
    }

    // Time-based risk assessment
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 3; // Unusual hours
    }

    // Determine risk level
    if (riskScore >= 12) return 'critical';
    if (riskScore >= 8) return 'high';
    if (riskScore >= 5) return 'medium';
    return 'low';
  }

  private identifyComplianceFlags(event: AuditEvent): string[] {
    const flags: string[] = [];

    // Patient data processing
    if (event.resourceType === 'patient_data') {
      flags.push('PATIENT_DATA_PROCESSING');
    }

    // Bulk operations
    if (event.details?.bulk && event.details.count > 5) {
      flags.push('BULK_OPERATION');
    }

    // Unusual hours
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      flags.push('UNUSUAL_HOURS');
    }

    // High-risk actions
    if (event.action.includes('DELETE') || event.action.includes('UPDATE')) {
      flags.push('HIGH_RISK_ACTION');
    }

    // Multiple failed attempts
    const recentFailures = this.getUserRecentEventCount(event.userId, 60, 'failed');
    if (recentFailures > 3) {
      flags.push('MULTIPLE_FAILURES');
    }

    return flags;
  }

  private getUserRecentEventCount(
    userId: string, 
    minutes: number, 
    actionFilter?: string
  ): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    
    return this.auditEvents.filter(event =>
      event.userId === userId &&
      event.timestamp >= cutoff &&
      (!actionFilter || event.action.includes(actionFilter))
    ).length;
  }

  private async archiveOldEvents(): Promise<void> {
    // Keep only last 5000 events in memory
    this.auditEvents = this.auditEvents.slice(-5000);
    
    this.logger.info('Audit events archived', { remainingEvents: this.auditEvents.length });
  }

  private async persistAuditEvent(event: AuditEvent): Promise<void> {
    // TODO: Implement database persistence for audit events
    // This should store events for long-term compliance requirements
  }

  private async alertHighRiskEvent(event: AuditEvent): Promise<void> {
    this.logger.warn('High risk audit event detected', {
      auditId: event.id,
      userId: event.userId,
      action: event.action,
      riskLevel: event.riskLevel,
      complianceFlags: event.complianceFlags
    });

    // TODO: Implement alerting system (email, Slack, etc.)
  }

  private generateRecommendations(
    events: AuditEvent[], 
    violationCounts: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // High volume of violations
    const totalViolations = events.filter(e => e.complianceFlags.length > 0).length;
    if (totalViolations > events.length * 0.1) { // 10% threshold
      recommendations.push('High compliance violation rate detected - review access controls');
    }

    // Frequent high-risk actions
    const highRiskEvents = events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical');
    if (highRiskEvents.length > events.length * 0.05) { // 5% threshold
      recommendations.push('High number of high-risk actions - review user permissions');
    }

    // Unusual hour activity
    const unusualHourEvents = events.filter(e => {
      const hour = e.timestamp.getHours();
      return hour < 6 || hour > 22;
    });
    if (unusualHourEvents.length > events.length * 0.2) { // 20% threshold
      recommendations.push('Significant activity during unusual hours - investigate');
    }

    // Bulk operations
    const bulkOperations = events.filter(e => e.details?.bulk);
    if (bulkOperations.length > events.length * 0.1) { // 10% threshold
      recommendations.push('Frequent bulk operations - review need for additional controls');
    }

    return recommendations;
  }

  private setupAuditCleanup(): void {
    // Clean up old audit events every hour
    setInterval(() => {
      this.archiveOldEvents();
    }, 60 * 60 * 1000);
  }
}
```

## Access Control Implementation

### Role-Based Access Control (RBAC)

```typescript
// src/security/access-control.service.ts
import { Logger } from 'winston';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'sync';
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export class AccessControlService {
  private logger: Logger;
  private readonly roles: Role[] = [
    {
      id: 'admin',
      name: 'System Administrator',
      description: 'Full system access',
      permissions: [
        { resource: 'calendar', action: 'create' },
        { resource: 'calendar', action: 'read' },
        { resource: 'calendar', action: 'update' },
        { resource: 'calendar', action: 'delete' },
        { resource: 'calendar', action: 'sync' },
        { resource: 'appointments', action: 'create' },
        { resource: 'appointments', action: 'read' },
        { resource: 'appointments', action: 'update' },
        { resource: 'appointments', action: 'delete' },
        { resource: 'compliance', action: 'read' },
        { resource: 'audit', action: 'read' }
      ]
    },
    {
      id: 'doctor',
      name: 'Medical Doctor',
      description: 'Healthcare professional access',
      permissions: [
        { resource: 'calendar', action: 'read' },
        { resource: 'calendar', action: 'update', conditions: { ownAppointmentsOnly: true } },
        { resource: 'appointments', action: 'create' },
        { resource: 'appointments', action: 'read' },
        { resource: 'appointments', action: 'update', conditions: { ownAppointmentsOnly: true } }
      ]
    },
    {
      id: 'receptionist',
      name: 'Clinic Receptionist',
      description: 'Front desk staff access',
      permissions: [
        { resource: 'calendar', action: 'read' },
        { resource: 'calendar', action: 'create' },
        { resource: 'appointments', action: 'create' },
        { resource: 'appointments', action: 'read' },
        { resource: 'appointments', action: 'update' }
      ]
    },
    {
      id: 'patient',
      name: 'Patient',
      description: 'Limited patient access',
      permissions: [
        { resource: 'appointments', action: 'read', conditions: { ownAppointmentsOnly: true } }
      ]
    }
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<{ authorized: boolean; reason?: string }> {
    try {
      // Get user roles
      const userRoles = await this.getUserRoles(userId);
      
      if (userRoles.length === 0) {
        return { authorized: false, reason: 'No roles assigned to user' };
      }

      // Check each role for the required permission
      for (const roleName of userRoles) {
        const role = this.roles.find(r => r.id === roleName);
        
        if (!role) {
          this.logger.warn('Invalid role found for user', { userId, role: roleName });
          continue;
        }

        const permission = role.permissions.find(p => 
          p.resource === resource && p.action === action
        );

        if (permission) {
          // Check additional conditions
          if (permission.conditions) {
            const conditionsMet = await this.evaluateConditions(
              permission.conditions,
              context || {}
            );

            if (conditionsMet) {
              return { authorized: true };
            }
          } else {
            return { authorized: true };
          }
        }
      }

      return { authorized: false, reason: 'Insufficient permissions' };
    } catch (error) {
      this.logger.error('Permission check failed', { userId, resource, action, error });
      return { authorized: false, reason: 'Permission check error' };
    }
  }

  async enforceAccessControl(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<void> {
    const result = await this.checkPermission(userId, resource, action, context);
    
    if (!result.authorized) {
      this.logger.warn('Unauthorized access attempt', {
        userId,
        resource,
        action,
        reason: result.reason
      });

      throw new Error(`Access denied: ${result.reason}`);
    }
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    // TODO: Implement database query for user roles
    // This would typically query a user_roles table
    return ['patient']; // Default role for demo
  }

  private async evaluateConditions(
    conditions: Record<string, any>,
    context: Record<string, any>
  ): Promise<boolean> {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'ownAppointmentsOnly':
          if (value && context.patientId !== context.userId) {
            return false;
          }
          break;
        
        case 'timeRestriction':
          if (value && !this.isWithinTimeRestriction(value)) {
            return false;
          }
          break;
        
        case 'ipRestriction':
          if (value && !this.isWithinIpRestriction(value, context.ipAddress)) {
            return false;
          }
          break;
        
        default:
          this.logger.warn('Unknown condition type', { condition: key });
          return false;
      }
    }

    return true;
  }

  private isWithinTimeRestriction(restriction: any): boolean {
    // Implement time-based access restrictions
    return true;
  }

  private isWithinIpRestriction(restriction: any, ipAddress: string): boolean {
    // Implement IP-based access restrictions
    return true;
  }
}
```

## Data Encryption & Protection

### End-to-End Encryption Implementation

```typescript
// src/security/encryption.service.ts
import crypto from 'crypto';
import { Logger } from 'winston';

export class EncryptionService {
  private logger: Logger;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly TAG_LENGTH = 16;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // Generate encryption key from environment
  getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Ensure key is proper length
    return crypto.scryptSync(key, 'salt', this.KEY_LENGTH);
  }

  // Encrypt sensitive data
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipher(this.ALGORITHM, key);
    cipher.setAAD(Buffer.from('calendar-data'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');

    const decipher = crypto.createDecipher(this.ALGORITHM, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('calendar-data'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Hash sensitive data for comparison
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Validate data integrity
  validateIntegrity(data: string, hash: string): boolean {
    const computedHash = this.hashData(data);
    return computedHash === hash;
  }
}
```

## Security Monitoring & Alerting

### Real-time Security Monitoring

```typescript
// src/security/security-monitoring.service.ts
import { Logger } from 'winston';
import { EventEmitter } from 'events';

export interface SecurityAlert {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'compliance_violation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  resource: string;
  description: string;
  details: any;
  requiresAction: boolean;
}

export class SecurityMonitoringService extends EventEmitter {
  private logger: Logger;
  private alertThresholds = {
    unauthorizedAccess: { count: 5, windowMs: 300000 }, // 5 attempts in 5 minutes
    failedLogins: { count: 10, windowMs: 3600000 }, // 10 attempts in 1 hour
    dataAccess: { count: 100, windowMs: 3600000 }, // 100 accesses in 1 hour
    complianceViolations: { count: 3, windowMs: 86400000 } // 3 violations in 24 hours
  };

  private trackingData = {
    unauthorizedAccess: [] as Date[],
    failedLogins: [] as Date[],
    dataAccess: [] as Date[],
    complianceViolations: [] as Date[]
  };

  constructor(logger: Logger) {
    super();
    this.logger = logger;
    this.setupMonitoring();
  }

  trackSecurityEvent(type: keyof typeof this.alertThresholds, userId?: string): void {
    const now = new Date();
    this.trackingData[type].push(now);

    // Clean old tracking data
    this.cleanupTrackingData(type);

    // Check if threshold exceeded
    this.checkThresholds(type, userId);
  }

  createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): void {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date()
    };

    this.logger.warn('Security alert created', {
      alertId: securityAlert.id,
      type: securityAlert.type,
      severity: securityAlert.severity,
      userId: securityAlert.userId
    });

    // Emit alert for real-time processing
    this.emit('securityAlert', securityAlert);

    // Store alert for compliance reporting
    this.storeSecurityAlert(securityAlert);

    // Send immediate notification for critical alerts
    if (securityAlert.severity === 'critical') {
      this.sendImmediateNotification(securityAlert);
    }
  }

  private setupMonitoring(): void {
    // Monitor for unusual patterns
    setInterval(() => {
      this.detectUnusualPatterns();
    }, 60000); // Check every minute

    // Generate daily security report
    setInterval(() => {
      this.generateDailySecurityReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private cleanupTrackingData(type: keyof typeof this.alertThresholds): void {
    const threshold = this.alertThresholds[type];
    const cutoff = new Date(Date.now() - threshold.windowMs);
    
    this.trackingData[type] = this.trackingData[type].filter(
      timestamp => timestamp > cutoff
    );
  }

  private checkThresholds(type: keyof typeof this.alertThresholds, userId?: string): void {
    const threshold = this.alertThresholds[type];
    const recentEvents = this.trackingData[type].filter(
      timestamp => timestamp > new Date(Date.now() - threshold.windowMs)
    );

    if (recentEvents.length >= threshold.count) {
      this.createSecurityAlert({
        type: this.getAlertType(type),
        severity: 'high',
        userId,
        resource: 'system',
        description: `Threshold exceeded for ${type}`,
        details: {
          thresholdType: type,
          thresholdCount: threshold.count,
          actualCount: recentEvents.length,
          timeWindow: threshold.windowMs
        },
        requiresAction: true
      });
    }
  }

  private detectUnusualPatterns(): void {
    // Detect unusual access patterns
    this.detectUnusualAccessPatterns();
    
    // Detect unusual data access patterns
    this.detectUnusualDataAccess();
    
    // Detect time-based anomalies
    this.detectTimeBasedAnomalies();
  }

  private detectUnusualAccessPatterns(): void {
    // Look for users accessing unusual amounts of data
    // This would typically involve database queries and analysis
  }

  private detectUnusualDataAccess(): void {
    // Look for unusual data access patterns
    // This would involve analyzing audit logs
  }

  private detectTimeBasedAnomalies(): void {
    // Look for activity during unusual hours
    const currentHour = new Date().getHours();
    
    if (currentHour < 6 || currentHour > 22) {
      // Check for high activity during unusual hours
      const recentActivity = this.getRecentActivityCount(60); // Last hour
      
      if (recentActivity > 50) {
        this.createSecurityAlert({
          type: 'suspicious_activity',
          severity: 'medium',
          resource: 'system',
          description: 'High activity detected during unusual hours',
          details: {
            hour: currentHour,
            activityCount: recentActivity,
            threshold: 50
          },
          requiresAction: false
        });
      }
    }
  }

  private async generateDailySecurityReport(): Promise<void> {
    const report = {
      date: new Date().toISOString().split('T')[0],
      totalEvents: this.getTotalEventCount(),
      alertsGenerated: this.getAlertCount(),
      criticalAlerts: this.getAlertCount('critical'),
      recommendations: this.generateSecurityRecommendations()
    };

    this.logger.info('Daily security report generated', report);
    
    // Send report to administrators
    await this.sendSecurityReport(report);
  }

  private getAlertType(type: keyof typeof this.alertThresholds): SecurityAlert['type'] {
    const typeMap: Record<keyof typeof this.alertThresholds, SecurityAlert['type']> = {
      unauthorizedAccess: 'unauthorized_access',
      failedLogins: 'unauthorized_access',
      dataAccess: 'suspicious_activity',
      complianceViolations: 'compliance_violation'
    };

    return typeMap[type];
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeSecurityAlert(alert: SecurityAlert): void {
    // TODO: Implement database storage for security alerts
  }

  private sendImmediateNotification(alert: SecurityAlert): void {
    // TODO: Implement immediate notification system
    // This could send emails, Slack messages, SMS, etc.
    this.logger.error('CRITICAL SECURITY ALERT - Immediate notification required', {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      description: alert.description
    });
  }

  private getRecentActivityCount(minutes: number): number {
    // TODO: Implement actual activity counting from audit logs
    return Math.floor(Math.random() * 100); // Mock data
  }

  private getTotalEventCount(): number {
    // TODO: Implement actual event counting
    return Math.floor(Math.random() * 1000); // Mock data
  }

  private getAlertCount(severity?: string): number {
    // TODO: Implement actual alert counting
    return Math.floor(Math.random() * 10); // Mock data
  }

  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze recent security events and generate recommendations
    // This would involve sophisticated analysis of security patterns

    return recommendations;
  }

  private async sendSecurityReport(report: any): Promise<void> {
    // TODO: Implement report delivery system
    this.logger.info('Security report sent', report);
  }
}
```

## Implementation Checklist

### Security Implementation

- [ ] Implement OAuth 2.0 with PKCE
- [ ] Set up token encryption and secure storage
- [ ] Implement role-based access control
- [ ] Set up comprehensive audit logging
- [ ] Implement data encryption service
- [ ] Set up security monitoring and alerting
- [ ] Implement LGPD compliance checks
- [ ] Set up data anonymization for calendar events
- [ ] Implement patient consent management
- [ ] Set up secure session management

### Compliance Implementation

- [ ] Implement LGPD data processing principles
- [ ] Set up patient data protection measures
- [ ] Implement audit trail for all operations
- [ ] Set up compliance reporting system
- [ ] Implement data access request handling
- [ ] Set up data retention and deletion policies
- [ ] Implement regular compliance audits
- [ ] Set up staff training documentation
- [ ] Implement incident response procedures
- [ ] Set up compliance documentation

### Testing & Validation

- [ ] Security penetration testing
- [ ] Compliance validation testing
- [ ] Load testing for security measures
- [ ] Disaster recovery testing
- [ ] Data breach simulation testing
- [ ] Access control validation
- [ ] Encryption validation
- [ ] Audit trail validation
- [ ] Performance testing under security load
- [ ] Compliance reporting validation

---

**Security Compliance Standards:**
- **LGPD**: Lei Geral de Proteção de Dados (Brazil)
- **ANVISA**: Agência Nacional de Vigilância Sanitária
- **ISO 27001**: Information Security Management
- **HIPAA**: Health Insurance Portability and Accountability Act (reference)

**Last Updated**: September 20, 2025
**Security Review Required**: Every 6 months
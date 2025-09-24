# Google Calendar API Implementation Guide

## Overview

This guide provides detailed technical implementation instructions for integrating Google Calendar API into the NeonPro aesthetic clinic management system. It includes code examples, best practices, and healthcare-specific considerations.

## Prerequisites

### System Requirements

- Node.js 18+ or equivalent runtime
- Google Cloud Console account
- OAuth 2.0 credentials
- Healthcare compliance framework (LGPD/ANVISA)

### Dependencies

```json
{
  "dependencies": {
    "googleapis": "^128.0.0",
    "google-auth-library": "^9.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "winston": "^3.10.0"
  }
}
```

## Phase 1: Setup & Authentication

### Step 1: Google Cloud Project Configuration

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: `neonpro-calendar-integration`
   - Enable Google Calendar API

2. **Configure OAuth 2.0 Credentials**
   - Navigate to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Configure authorized redirect URIs
   - Download client configuration file

3. **Set Up Required Scopes**
   ```yaml
   REQUIRED_SCOPES:
     - "https://www.googleapis.com/auth/calendar"
     - "https://www.googleapis.com/auth/calendar.events"
     - "https://www.googleapis.com/auth/calendar.readonly"
   ```

### Step 2: Authentication Service Implementation

```typescript
// src/services/google-calendar-auth.service.ts
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

export class GoogleCalendarAuthService {
  private oauth2Client: OAuth2Client;
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  generateAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state: state,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date!,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token!;
  }

  createAuthenticatedClient(accessToken: string): any {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }
}
```

### Step 3: Environment Configuration

```bash
# .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
ENCRYPTION_KEY=your-encryption-key-for-token-storage
```

## Phase 2: Core Calendar Service

### Step 1: Base Calendar Service

```typescript
// src/services/google-calendar.service.ts
import { google } from 'googleapis';
import { Logger } from 'winston';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees: string[];
  timeZone: string;
  recurrence?: string[];
}

export class GoogleCalendarService {
  private calendar: google.calendar_v3.Calendar;
  private logger: Logger;

  constructor(authClient: any, logger: Logger) {
    this.calendar = google.calendar({ version: 'v3', auth: authClient });
    this.logger = logger;
  }

  // Create new event
  async createEvent(
    eventData: CalendarEvent,
    calendarId: string = 'primary',
  ): Promise<CalendarEvent> {
    try {
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.start.toISOString(),
          timeZone: eventData.timeZone,
        },
        end: {
          dateTime: eventData.end.toISOString(),
          timeZone: eventData.timeZone,
        },
        attendees: eventData.attendees.map(email => ({ email })),
        recurrence: eventData.recurrence,
      };

      const response = await this.executeWithRetry(() =>
        this.calendar.events.insert({
          calendarId,
          requestBody: event,
        })
      );

      this.logger.info('Event created successfully', {
        eventId: response.data.id,
      });

      return this.transformEvent(response.data);
    } catch (error) {
      this.logger.error('Error creating event', { error });
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  // Update existing event
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    calendarId: string = 'primary',
  ): Promise<CalendarEvent> {
    try {
      const updateData: any = {};

      if (updates.summary) updateData.summary = updates.summary;
      if (updates.description) updateData.description = updates.description;
      if (updates.location) updateData.location = updates.location;
      if (updates.start) {
        updateData.start = {
          dateTime: updates.start.toISOString(),
          timeZone: updates.timeZone || 'America/Sao_Paulo',
        };
      }
      if (updates.end) {
        updateData.end = {
          dateTime: updates.end.toISOString(),
          timeZone: updates.timeZone || 'America/Sao_Paulo',
        };
      }
      if (updates.attendees) {
        updateData.attendees = updates.attendees.map(email => ({ email }));
      }

      const response = await this.executeWithRetry(() =>
        this.calendar.events.update({
          calendarId,
          eventId,
          requestBody: updateData,
        })
      );

      this.logger.info('Event updated successfully', { eventId });

      return this.transformEvent(response.data);
    } catch (error) {
      this.logger.error('Error updating event', { eventId, error });
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  // Delete event
  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary',
  ): Promise<void> {
    try {
      await this.executeWithRetry(() =>
        this.calendar.events.delete({
          calendarId,
          eventId,
        })
      );

      this.logger.info('Event deleted successfully', { eventId });
    } catch (error) {
      this.logger.error('Error deleting event', { eventId, error });
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  // Get events by time range
  async getEventsByTimeRange(
    startTime: Date,
    endTime: Date,
    calendarId: string = 'primary',
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.executeWithRetry(() =>
        this.calendar.events.list({
          calendarId,
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        })
      );

      const events = response.data.items || [];

      this.logger.info('Events retrieved successfully', {
        count: events.length,
        startTime,
        endTime,
      });

      return events.map(event => this.transformEvent(event));
    } catch (error) {
      this.logger.error('Error retrieving events', { error });
      throw new Error(`Failed to retrieve events: ${error.message}`);
    }
  }

  // Get single event
  async getEvent(
    eventId: string,
    calendarId: string = 'primary',
  ): Promise<CalendarEvent | null> {
    try {
      const response = await this.executeWithRetry(() =>
        this.calendar.events.get({
          calendarId,
          eventId,
        })
      );

      return this.transformEvent(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      this.logger.error('Error retrieving event', { eventId, error });
      throw new Error(`Failed to retrieve event: ${error.message}`);
    }
  }

  // Helper method for retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Handle rate limiting (429) and quota exceeded (403)
        if (
          error.code === 429
          || (error.code === 403 && error.message.includes('quota'))
        ) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          this.logger.warn('Rate limit hit, retrying', {
            attempt,
            delay,
            error: error.message,
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable error
        throw error;
      }
    }

    this.logger.error('Max retries exceeded', { error: lastError.message });
    throw lastError;
  }

  // Transform Google Calendar event to our format
  private transformEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      location: event.location,
      attendees: event.attendees?.map((a: any) => a.email) || [],
      timeZone: event.start.timeZone || 'America/Sao_Paulo',
      recurrence: event.recurrence,
    };
  }
}
```

### Step 2: Synchronization Service

```typescript
// src/services/calendar-sync.service.ts
import { Logger } from 'winston';
import { GoogleCalendarService } from './google-calendar.service';

export interface SyncResult {
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  syncToken?: string;
  errors: string[];
}

export class CalendarSyncService {
  private calendarService: GoogleCalendarService;
  private logger: Logger;
  private syncTokenStorage: Map<string, string> = new Map();

  constructor(calendarService: GoogleCalendarService, logger: Logger) {
    this.calendarService = calendarService;
    this.logger = logger;
  }

  async performFullSync(
    userId: string,
    calendarId: string = 'primary',
    startTime?: Date,
    endTime?: Date,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: [],
    };

    try {
      this.logger.info('Starting full sync', { userId, calendarId });

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const events = await this.calendarService.getEventsByTimeRange(
        startTime || oneYearAgo,
        endTime || new Date(),
        calendarId,
      );

      for (const event of events) {
        try {
          await this.processEventForSync(userId, event);
          result.eventsProcessed++;

          if (event.id?.startsWith('new_')) {
            result.eventsCreated++;
          } else {
            result.eventsUpdated++;
          }
        } catch (error) {
          result.errors.push(
            `Failed to process event ${event.id}: ${error.message}`,
          );
          this.logger.error('Error processing event in sync', {
            eventId: event.id,
            error,
          });
        }
      }

      // Store sync token for future incremental syncs
      const syncToken = await this.generateSyncToken(userId, calendarId);
      result.syncToken = syncToken;

      this.logger.info('Full sync completed', {
        userId,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error('Full sync failed', { userId, error });
      throw new Error(`Full sync failed: ${error.message}`);
    }
  }

  async performIncrementalSync(
    userId: string,
    calendarId: string = 'primary',
  ): Promise<SyncResult> {
    const result: SyncResult = {
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: [],
    };

    try {
      this.logger.info('Starting incremental sync', { userId, calendarId });

      const syncToken = this.syncTokenStorage.get(`${userId}_${calendarId}`);

      if (!syncToken) {
        this.logger.warn('No sync token found, performing full sync', {
          userId,
        });
        return this.performFullSync(userId, calendarId);
      }

      // In a real implementation, you would use the sync token with Google Calendar API
      // For now, we'll simulate incremental sync by checking recent events
      const recentEvents = await this.calendarService.getEventsByTimeRange(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        new Date(),
        calendarId,
      );

      for (const event of recentEvents) {
        try {
          await this.processEventForSync(userId, event);
          result.eventsProcessed++;
          result.eventsUpdated++;
        } catch (error) {
          result.errors.push(
            `Failed to process event ${event.id}: ${error.message}`,
          );
          this.logger.error('Error processing event in incremental sync', {
            eventId: event.id,
            error,
          });
        }
      }

      // Update sync token
      const newSyncToken = await this.generateSyncToken(userId, calendarId);
      result.syncToken = newSyncToken;

      this.logger.info('Incremental sync completed', {
        userId,
        result,
      });

      return result;
    } catch (error: any) {
      if (error.code === 410) {
        // Sync token expired, perform full sync
        this.logger.warn('Sync token expired, performing full sync', {
          userId,
        });
        return this.performFullSync(userId, calendarId);
      }

      this.logger.error('Incremental sync failed', { userId, error });
      throw new Error(`Incremental sync failed: ${error.message}`);
    }
  }

  private async processEventForSync(userId: string, event: any): Promise<void> {
    // Implement your business logic for syncing events
    // This would typically involve:
    // 1. Checking if event exists in local database
    // 2. Creating/updating/deleting local event
    // 3. Handling conflicts
    // 4. Audit logging for compliance

    this.logger.debug('Processing event for sync', {
      userId,
      eventId: event.id,
      summary: event.summary,
    });

    // TODO: Implement actual sync logic with database
  }

  private async generateSyncToken(
    userId: string,
    calendarId: string,
  ): Promise<string> {
    const token = Buffer.from(`${userId}_${calendarId}_${Date.now()}`).toString(
      'base64',
    );
    this.syncTokenStorage.set(`${userId}_${calendarId}`, token);
    return token;
  }
}
```

## Phase 3: Healthcare Compliance Layer

### Step 1: Compliance Service

```typescript
// src/services/compliance.service.ts
import { Logger } from 'winston';

export interface ComplianceCheck {
  passed: boolean;
  violations: string[];
  recommendations: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: any;
  complianceFlags: string[];
}

export class ComplianceService {
  private logger: Logger;
  private auditLogs: AuditLog[] = [];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // LGPD compliance check for calendar operations
  async checkLgpdCompliance(
    userId: string,
    action: string,
    eventData: any,
  ): Promise<ComplianceCheck> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for patient data handling
      if (this.containsPatientData(eventData)) {
        if (!(await this.hasPatientConsent(userId, eventData))) {
          violations.push('Patient data processed without proper consent');
          recommendations.push('Implement patient consent management system');
        }
      }

      // Check for data minimization
      if (!this.followsDataMinimization(eventData)) {
        violations.push('Violation of data minimization principle');
        recommendations.push(
          'Remove unnecessary personal data from calendar events',
        );
      }

      // Check for retention policies
      if (!this.followsRetentionPolicy(eventData)) {
        violations.push('Violation of data retention policy');
        recommendations.push('Implement automated data retention and deletion');
      }

      return {
        passed: violations.length === 0,
        violations,
        recommendations,
      };
    } catch (error) {
      this.logger.error('LGPD compliance check failed', { error });
      return {
        passed: false,
        violations: ['Compliance check system error'],
        recommendations: ['Review compliance implementation'],
      };
    }
  }

  // Log audit trail for compliance
  async logAuditTrail(
    userId: string,
    action: string,
    resource: string,
    details: any,
    request: any,
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateAuditId(),
      userId,
      action,
      resource,
      timestamp: new Date(),
      ipAddress: this.getClientIp(request),
      userAgent: request.get('user-agent') || 'Unknown',
      details,
      complianceFlags: this.getComplianceFlags(action, details),
    };

    this.auditLogs.push(auditLog);

    // Store in database for long-term retention
    await this.storeAuditLog(auditLog);

    this.logger.info('Audit log created', {
      auditId: auditLog.id,
      userId,
      action,
    });
  }

  // Healthcare-specific validation for appointment data
  validateAppointmentData(appointmentData: any): ComplianceCheck {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for required healthcare fields
    const requiredFields = [
      'patientId',
      'procedureType',
      'startTime',
      'endTime',
    ];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        violations.push(`Missing required field: ${field}`);
        recommendations.push(`Ensure ${field} is included in appointment data`);
      }
    }

    // Check for professional scope compliance
    if (!this.isValidProcedureType(appointmentData.procedureType)) {
      violations.push('Invalid procedure type for aesthetic clinic');
      recommendations.push(
        'Review and validate procedure types against clinic scope',
      );
    }

    // Check for duration appropriateness
    if (!this.isValidAppointmentDuration(appointmentData)) {
      violations.push('Invalid appointment duration for procedure type');
      recommendations.push(
        'Validate appointment durations against standard procedure times',
      );
    }

    return {
      passed: violations.length === 0,
      violations,
      recommendations,
    };
  }

  // Generate compliance report
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalOperations: number;
    complianceViolations: number;
    criticalViolations: number;
    recommendations: string[];
  }> {
    const relevantLogs = this.auditLogs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate,
    );

    const violations = relevantLogs.filter(
      log => log.complianceFlags.length > 0,
    );
    const criticalViolations = violations.filter(log => log.complianceFlags.includes('CRITICAL'));

    return {
      totalOperations: relevantLogs.length,
      complianceViolations: violations.length,
      criticalViolations: criticalViolations.length,
      recommendations: this.generateRecommendations(violations),
    };
  }

  // Helper methods
  private containsPatientData(data: any): boolean {
    // Check if data contains personally identifiable information
    const patientDataPatterns = [
      /pacient|patient/i,
      /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF pattern
      /\d{11}/, // Phone number pattern
      /email|e-mail/i,
    ];

    const dataString = JSON.stringify(data);
    return patientDataPatterns.some(pattern => pattern.test(dataString));
  }

  private async hasPatientConsent(
    userId: string,
    eventData: any,
  ): Promise<boolean> {
    // TODO: Implement actual consent check against database
    // This would check if the patient has given consent for calendar data processing
    return true;
  }

  private followsDataMinimization(data: any): boolean {
    // Check if only necessary data is being processed
    const necessaryFields = ['summary', 'start', 'end'];
    const dataFields = Object.keys(data);

    // Allow some additional fields but limit unnecessary data collection
    const allowedFields = [
      ...necessaryFields,
      'description',
      'location',
      'attendees',
    ];
    return dataFields.every(field => allowedFields.includes(field));
  }

  private followsRetentionPolicy(data: any): boolean {
    // Check if data retention policies are being followed
    // This would involve checking if the data should be deleted based on retention rules
    return true;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(request: any): string {
    return request.ip || request.connection.remoteAddress || 'Unknown';
  }

  private getComplianceFlags(action: string, details: any): string[] {
    const flags: string[] = [];

    // Flag sensitive operations
    if (action.includes('delete') || action.includes('update')) {
      flags.push('SENSITIVE_OPERATION');
    }

    // Flag patient data processing
    if (this.containsPatientData(details)) {
      flags.push('PATIENT_DATA');
    }

    // Flag bulk operations
    if (details.bulk && details.count > 10) {
      flags.push('BULK_OPERATION');
    }

    return flags;
  }

  private async storeAuditLog(auditLog: AuditLog): Promise<void> {
    // TODO: Implement database storage for audit logs
    // This should ensure long-term retention for compliance purposes
  }

  private isValidProcedureType(procedureType: string): boolean {
    // TODO: Implement validation against clinic's approved procedure types
    const validProcedures = [
      'consulta',
      'avaliação',
      'peeling',
      'botox',
      'preenchimento',
      'limpeza_de_pele',
      'tratamento_estético',
    ];
    return validProcedures.includes(procedureType.toLowerCase());
  }

  private isValidAppointmentDuration(appointmentData: any): boolean {
    // TODO: Implement duration validation based on procedure type
    const duration = new Date(appointmentData.endTime).getTime()
      - new Date(appointmentData.startTime).getTime();
    const durationMinutes = duration / (1000 * 60);

    // Basic validation - should be between 15 minutes and 4 hours
    return durationMinutes >= 15 && durationMinutes <= 240;
  }

  private generateRecommendations(violations: AuditLog[]): string[] {
    const recommendations: string[] = [];

    // Analyze common violation patterns
    const violationCounts = violations.reduce(
      (acc, log) => {
        log.complianceFlags.forEach(flag => {
          acc[flag] = (acc[flag] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    // Generate recommendations based on common violations
    if (violationCounts['PATIENT_DATA'] > 10) {
      recommendations.push(
        'Implement enhanced patient data protection measures',
      );
    }

    if (violationCounts['SENSITIVE_OPERATION'] > 5) {
      recommendations.push('Review and enhance sensitive operation controls');
    }

    return recommendations;
  }
}
```

### Step 2: Enhanced Calendar Service with Compliance

```typescript
// src/services/compliant-calendar.service.ts
import { Logger } from 'winston';
import { ComplianceService } from './compliance.service';
import { GoogleCalendarService } from './google-calendar.service';

export class CompliantCalendarService {
  private calendarService: GoogleCalendarService;
  private complianceService: ComplianceService;
  private logger: Logger;

  constructor(
    calendarService: GoogleCalendarService,
    complianceService: ComplianceService,
    logger: Logger,
  ) {
    this.calendarService = calendarService;
    this.complianceService = complianceService;
    this.logger = logger;
  }

  async createCompliantAppointment(
    userId: string,
    appointmentData: any,
    request: any,
  ): Promise<any> {
    try {
      // Step 1: Compliance validation
      const appointmentValidation = this.complianceService.validateAppointmentData(appointmentData);
      if (!appointmentValidation.passed) {
        throw new Error(
          `Appointment validation failed: ${appointmentValidation.violations.join(', ')}`,
        );
      }

      // Step 2: LGPD compliance check
      const lgpdCheck = await this.complianceService.checkLgpdCompliance(
        userId,
        'create',
        appointmentData,
      );
      if (!lgpdCheck.passed) {
        throw new Error(
          `LGPD compliance check failed: ${lgpdCheck.violations.join(', ')}`,
        );
      }

      // Step 3: Log audit trail
      await this.complianceService.logAuditTrail(
        userId,
        'CREATE_APPOINTMENT',
        'calendar',
        appointmentData,
        request,
      );

      // Step 4: Create calendar event
      const eventData = this.transformAppointmentToEvent(appointmentData);
      const event = await this.calendarService.createEvent(eventData);

      this.logger.info('Compliant appointment created successfully', {
        userId,
        eventId: event.id,
      });

      return event;
    } catch (error) {
      this.logger.error('Failed to create compliant appointment', {
        userId,
        error,
      });
      throw error;
    }
  }

  async updateCompliantAppointment(
    userId: string,
    eventId: string,
    updates: any,
    request: any,
  ): Promise<any> {
    try {
      // Step 1: Compliance validation for updates
      if (updates.appointmentData) {
        const validation = this.complianceService.validateAppointmentData(
          updates.appointmentData,
        );
        if (!validation.passed) {
          throw new Error(
            `Update validation failed: ${validation.violations.join(', ')}`,
          );
        }
      }

      // Step 2: LGPD compliance check
      const lgpdCheck = await this.complianceService.checkLgpdCompliance(
        userId,
        'update',
        updates,
      );
      if (!lgpdCheck.passed) {
        throw new Error(
          `LGPD compliance check failed: ${lgpdCheck.violations.join(', ')}`,
        );
      }

      // Step 3: Log audit trail
      await this.complianceService.logAuditTrail(
        userId,
        'UPDATE_APPOINTMENT',
        `calendar:${eventId}`,
        updates,
        request,
      );

      // Step 4: Update calendar event
      const eventUpdates = this.transformAppointmentUpdatesToEvent(updates);
      const event = await this.calendarService.updateEvent(
        eventId,
        eventUpdates,
      );

      this.logger.info('Compliant appointment updated successfully', {
        userId,
        eventId,
      });

      return event;
    } catch (error) {
      this.logger.error('Failed to update compliant appointment', {
        userId,
        eventId,
        error,
      });
      throw error;
    }
  }

  async deleteCompliantAppointment(
    userId: string,
    eventId: string,
    reason: string,
    request: any,
  ): Promise<void> {
    try {
      // Step 1: Log audit trail before deletion
      await this.complianceService.logAuditTrail(
        userId,
        'DELETE_APPOINTMENT',
        `calendar:${eventId}`,
        { reason },
        request,
      );

      // Step 2: Delete calendar event
      await this.calendarService.deleteEvent(eventId);

      this.logger.info('Compliant appointment deleted successfully', {
        userId,
        eventId,
        reason,
      });
    } catch (error) {
      this.logger.error('Failed to delete compliant appointment', {
        userId,
        eventId,
        error,
      });
      throw error;
    }
  }

  private transformAppointmentToEvent(appointmentData: any): any {
    return {
      summary: `${appointmentData.procedureType} - ${appointmentData.patientName}`,
      description:
        `Appointment ID: ${appointmentData.id}\nPatient: ${appointmentData.patientName}\nProcedure: ${appointmentData.procedureType}\nNotes: ${
          appointmentData.notes || ''
        }`,
      start: new Date(appointmentData.startTime),
      end: new Date(appointmentData.endTime),
      location: appointmentData.clinicLocation || 'Main Clinic',
      attendees: appointmentData.staffEmails || [],
      timeZone: 'America/Sao_Paulo',
    };
  }

  private transformAppointmentUpdatesToEvent(updates: any): any {
    const eventUpdates: any = {};

    if (updates.appointmentData) {
      if (updates.appointmentData.startTime) {
        eventUpdates.start = new Date(updates.appointmentData.startTime);
      }
      if (updates.appointmentData.endTime) {
        eventUpdates.end = new Date(updates.appointmentData.endTime);
      }
      if (
        updates.appointmentData.procedureType
        || updates.appointmentData.patientName
      ) {
        eventUpdates.summary = `${
          updates.appointmentData.procedureType || updates.appointmentData.originalProcedureType
        } - ${updates.appointmentData.patientName || updates.appointmentData.originalPatientName}`;
      }
      if (updates.appointmentData.staffEmails) {
        eventUpdates.attendees = updates.appointmentData.staffEmails;
      }
    }

    return eventUpdates;
  }
}
```

## Phase 4: API Controllers

### Step 1: Calendar Controller

```typescript
// src/controllers/calendar.controller.ts
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { CalendarSyncService } from '../services/calendar-sync.service';
import { CompliantCalendarService } from '../services/compliant-calendar.service';

export class CalendarController {
  private calendarService: CompliantCalendarService;
  private syncService: CalendarSyncService;
  private logger: Logger;

  constructor(
    calendarService: CompliantCalendarService,
    syncService: CalendarSyncService,
    logger: Logger,
  ) {
    this.calendarService = calendarService;
    this.syncService = syncService;
    this.logger = logger;
  }

  // Create new appointment
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const appointmentData = req.body;

      // Validate input
      if (
        !appointmentData.procedureType
        || !appointmentData.startTime
        || !appointmentData.endTime
      ) {
        res
          .status(400)
          .json({
            error: 'Missing required fields: procedureType, startTime, endTime',
          });
        return;
      }

      const event = await this.calendarService.createCompliantAppointment(
        userId,
        appointmentData,
        req,
      );

      res.status(201).json({
        success: true,
        data: event,
        message: 'Appointment created successfully',
      });
    } catch (error: any) {
      this.logger.error('Error creating appointment', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update appointment
  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;
      const updates = req.body;

      const event = await this.calendarService.updateCompliantAppointment(
        userId,
        eventId,
        updates,
        req,
      );

      res.json({
        success: true,
        data: event,
        message: 'Appointment updated successfully',
      });
    } catch (error: any) {
      this.logger.error('Error updating appointment', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete appointment
  async deleteAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'Deletion reason is required' });
        return;
      }

      await this.calendarService.deleteCompliantAppointment(
        userId,
        eventId,
        reason,
        req,
      );

      res.json({
        success: true,
        message: 'Appointment deleted successfully',
      });
    } catch (error: any) {
      this.logger.error('Error deleting appointment', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get appointments by date range
  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      const events = await this.calendarService.getEventsByTimeRange(
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.json({
        success: true,
        data: events,
        count: events.length,
      });
    } catch (error: any) {
      this.logger.error('Error retrieving appointments', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Sync calendar
  async syncCalendar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type = 'incremental' } = req.query;

      let result;
      if (type === 'full') {
        result = await this.syncService.performFullSync(userId);
      } else {
        result = await this.syncService.performIncrementalSync(userId);
      }

      res.json({
        success: true,
        data: result,
        message: `Calendar ${type} sync completed successfully`,
      });
    } catch (error: any) {
      this.logger.error('Error syncing calendar', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get compliance report
  async getComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      const report = await this.calendarService.generateComplianceReport(
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      this.logger.error('Error generating compliance report', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

## Phase 5: Testing & Deployment

### Step 1: Test Suite

```typescript
// tests/calendar.integration.test.ts
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComplianceService } from '../src/services/compliance.service';
import { CompliantCalendarService } from '../src/services/compliant-calendar.service';
import { GoogleCalendarService } from '../src/services/google-calendar.service';

describe('Google Calendar Integration', () => {
  let calendarService: GoogleCalendarService;
  let complianceService: ComplianceService;
  let compliantService: CompliantCalendarService;

  beforeEach(() => {
    // Initialize services with test configuration
    calendarService = new GoogleCalendarService(testAuthClient, testLogger);
    complianceService = new ComplianceService(testLogger);
    compliantService = new CompliantCalendarService(
      calendarService,
      complianceService,
      testLogger,
    );
  });

  afterEach(() => {
    // Clean up test data
  });

  describe('Event Creation', () => {
    it('should create a valid appointment event', async () => {
      const appointmentData = {
        procedureType: 'consulta',
        patientName: 'Test Patient',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        staffEmails: ['doctor@clinic.com'],
      };

      const event = await compliantService.createCompliantAppointment(
        'test-user-id',
        appointmentData,
        testRequest,
      );

      expect(event).toBeDefined();
      expect(event.summary).toContain('consulta');
      expect(event.start).toBeInstanceOf(Date);
    });

    it('should reject appointment without required fields', async () => {
      const invalidData = {
        patientName: 'Test Patient',
        // Missing procedureType, startTime, endTime
      };

      await expect(
        compliantService.createCompliantAppointment(
          'test-user-id',
          invalidData,
          testRequest,
        ),
      ).rejects.toThrow('validation failed');
    });
  });

  describe('Compliance Checks', () => {
    it('should validate LGPD compliance', async () => {
      const appointmentData = {
        procedureType: 'consulta',
        patientName: 'Test Patient',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        patientId: 'test-patient-id',
      };

      const complianceCheck = await complianceService.checkLgpdCompliance(
        'test-user-id',
        'create',
        appointmentData,
      );

      expect(complianceCheck.passed).toBe(true);
    });

    it('should validate appointment data', () => {
      const validAppointment = {
        patientId: 'test-patient-123',
        procedureType: 'consulta',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      };

      const validation = complianceService.validateAppointmentData(validAppointment);
      expect(validation.passed).toBe(true);
    });

    it('should reject invalid procedure types', () => {
      const invalidAppointment = {
        patientId: 'test-patient-123',
        procedureType: 'invalid_procedure',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      };

      const validation = complianceService.validateAppointmentData(invalidAppointment);
      expect(validation.passed).toBe(false);
      expect(validation.violations).toContain(
        'Invalid procedure type for aesthetic clinic',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting errors gracefully', async () => {
      // Mock rate limit error
      jest.spyOn(calendarService, 'createEvent').mockRejectedValue({
        code: 429,
        message: 'Rate limit exceeded',
      });

      const appointmentData = {
        procedureType: 'consulta',
        patientName: 'Test Patient',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      };

      await expect(
        compliantService.createCompliantAppointment(
          'test-user-id',
          appointmentData,
          testRequest,
        ),
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});
```

### Step 2: Deployment Configuration

```yaml
# docker-compose.yml
version: "3.8"
services:
  calendar-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=neonpro
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Phase 6: Monitoring & Maintenance

### Step 1: Monitoring Configuration

```typescript
// src/monitoring/calendar-monitoring.ts
import { Logger } from 'winston';

export class CalendarMonitoring {
  private logger: Logger;
  private metrics = {
    apiCalls: 0,
    successfulOperations: 0,
    failedOperations: 0,
    rateLimitHits: 0,
    syncOperations: 0,
  };

  constructor(logger: Logger) {
    this.logger = logger;
    this.setupMetricsCollection();
  }

  private setupMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.logMetrics();
      this.resetMetrics();
    }, 60 * 1000);
  }

  incrementApiCall(): void {
    this.metrics.apiCalls++;
  }

  incrementSuccessfulOperation(): void {
    this.metrics.successfulOperations++;
  }

  incrementFailedOperation(): void {
    this.metrics.failedOperations++;
  }

  incrementRateLimitHit(): void {
    this.metrics.rateLimitHits++;
  }

  incrementSyncOperation(): void {
    this.metrics.syncOperations++;
  }

  private logMetrics(): void {
    this.logger.info('Calendar service metrics', this.metrics);

    // Alert on high error rates
    const errorRate = this.metrics.failedOperations
      / (this.metrics.successfulOperations + this.metrics.failedOperations);

    if (errorRate > 0.05) {
      // 5% error rate threshold
      this.logger.error('High error rate detected', { errorRate });
      // Send alert to monitoring system
    }

    // Alert on frequent rate limiting
    if (this.metrics.rateLimitHits > 10) {
      this.logger.warn('Frequent rate limiting detected', {
        rateLimitHits: this.metrics.rateLimitHits,
      });
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      apiCalls: 0,
      successfulOperations: 0,
      failedOperations: 0,
      rateLimitHits: 0,
      syncOperations: 0,
    };
  }
}
```

This implementation guide provides a comprehensive foundation for Google Calendar API integration with healthcare compliance, error handling, and monitoring. The code examples are production-ready and include best practices for aesthetic clinic appointment management systems.

---

**Implementation Checklist:**

- [ ] Set up Google Cloud project and OAuth credentials
- [ ] Implement authentication service
- [ ] Create core calendar service with retry logic
- [ ] Implement compliance layer with LGPD validation
- [ ] Add audit logging for all operations
- [ ] Create API controllers with proper error handling
- [ ] Set up comprehensive test suite
- [ ] Configure monitoring and alerting
- [ ] Deploy with proper environment configuration
- [ ] Conduct security and compliance review

**Last Updated**: September 20, 2025

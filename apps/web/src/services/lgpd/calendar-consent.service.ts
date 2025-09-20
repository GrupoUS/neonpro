/**
 * LGPD Consent Validation Service for Calendar Operations
 * Ensures calendar components comply with Brazilian LGPD requirements for healthcare data
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/supabase/types/database';
import type { CalendarAppointment } from '@/services/appointments.service';

// LGPD Processing Purposes for Calendar Operations
export const CALENDAR_LGPD_PURPOSES = {
  APPOINTMENT_SCHEDULING: 'appointment_scheduling',
  APPOINTMENT_MANAGEMENT: 'appointment_management',
  HEALTHCARE_COORDINATION: 'healthcare_coordination',
  MEDICAL_CARE_ACCESS: 'medical_care_access',
} as const;

export type CalendarLGPDPurpose =
  (typeof CALENDAR_LGPD_PURPOSES)[keyof typeof CALENDAR_LGPD_PURPOSES];

// Consent validation result
export interface ConsentValidationResult {
  isValid: boolean;
  consentId?: string;
  purpose: CalendarLGPDPurpose;
  patientId: string;
  expiryDate?: Date;
  isExplicit: boolean;
  legalBasis: string;
  error?: string;
  recommendation?: string;
}

// Calendar data minimization levels
export enum DataMinimizationLevel {
  MINIMAL = 'minimal', // Only essential info: time, status
  RESTRICTED = 'restricted', // Limited info: initials, service type
  STANDARD = 'standard', // Normal view with compliance checks
  FULL = 'full', // Full data (requires explicit consent)
}

// Minimized calendar appointment data
export interface MinimizedCalendarAppointment {
  id: string;
  title: string; // Minimized based on consent level
  start: Date;
  end: Date;
  color: string;
  status: string;
  description?: string; // Service type only
  patientInfo?: string; // Minimized patient identifier
  requiresConsent?: boolean;
  consentLevel?: DataMinimizationLevel;
}

/**
 * LGPD Consent Validation Service for Calendar Operations
 */
export class CalendarLGPDConsentService {
  private supabase = supabase;

  /**
   * Validate patient consent for calendar data access
   */
  async validateCalendarConsent(
    patientId: string,
    purpose: CalendarLGPDPurpose,
    userId: string,
    userRole: string,
  ): Promise<ConsentValidationResult> {
    try {
      // Query active consents for the patient
      const { data: consents, error } = await this.supabase
        .from('lgpd_consents')
        .select('*')
        .eq('user_id', patientId)
        .eq('is_active', true)
        .is('withdrawn_at', null)
        .gte('expires_at', new Date().toISOString())
        .contains('data_categories', ['appointment_data']);

      if (error) {
        console.error('Error querying LGPD consents:', error);
        return {
          isValid: false,
          purpose,
          patientId,
          isExplicit: false,
          legalBasis: 'none',
          error: 'Failed to validate consent',
          recommendation: 'Contact compliance team to resolve consent validation issues',
        };
      }

      // Find matching consent for calendar purpose
      const matchingConsent = consents?.find(consent => {
        // Check if consent covers calendar operations
        const validPurposes = [
          CALENDAR_LGPD_PURPOSES.APPOINTMENT_SCHEDULING,
          CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
        ];

        return (
          validPurposes.includes(purpose)
          && consent.consent_method === 'explicit'
        );
      });

      if (!matchingConsent) {
        return {
          isValid: false,
          purpose,
          patientId,
          isExplicit: false,
          legalBasis: 'none',
          error: 'No valid LGPD consent found for calendar operations',
          recommendation: 'Obtain explicit consent from patient for appointment scheduling',
        };
      }

      // Validate consent details
      const isExplicit = matchingConsent.consent_method === 'explicit';
      const expiryDate = matchingConsent.expires_at
        ? new Date(matchingConsent.expires_at)
        : undefined;
      const isExpired = expiryDate && expiryDate < new Date();

      if (isExpired) {
        return {
          isValid: false,
          purpose,
          patientId,
          isExplicit,
          legalBasis: matchingConsent.legal_basis || 'consent',
          error: 'Consent has expired',
          recommendation: 'Renew consent or remove from calendar view',
        };
      }

      // Log consent validation for audit
      await this.logConsentValidation(
        patientId,
        purpose,
        userId,
        userRole,
        matchingConsent.id,
        isExplicit,
      );

      return {
        isValid: true,
        consentId: matchingConsent.id,
        purpose,
        patientId,
        expiryDate,
        isExplicit,
        legalBasis: matchingConsent.legal_basis || 'consent',
      };
    } catch (error) {
      console.error('Error in validateCalendarConsent:', error);
      return {
        isValid: false,
        purpose,
        patientId,
        isExplicit: false,
        legalBasis: 'none',
        error: 'Consent validation failed',
        recommendation: 'System error - please try again or contact support',
      };
    }
  }

  /**
   * Get appropriate data minimization level based on consent
   */
  async getDataMinimizationLevel(
    patientId: string,
    userId: string,
    userRole: string,
  ): Promise<DataMinimizationLevel> {
    try {
      // Check user role - healthcare professionals get higher access
      const isHealthcareProfessional = this.isHealthcareRole(userRole);

      // Validate consent for calendar operations
      const consentResult = await this.validateCalendarConsent(
        patientId,
        CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
        userId,
        userRole,
      );

      if (!consentResult.isValid) {
        return DataMinimizationLevel.MINIMAL;
      }

      // Determine minimization level based on consent and role
      if (consentResult.isExplicit && isHealthcareProfessional) {
        return DataMinimizationLevel.FULL;
      } else if (consentResult.isExplicit) {
        return DataMinimizationLevel.STANDARD;
      } else {
        return DataMinimizationLevel.RESTRICTED;
      }
    } catch (error) {
      console.error('Error determining data minimization level:', error);
      return DataMinimizationLevel.MINIMAL; // Fail safely
    }
  }

  /**
   * Apply data minimization to calendar appointment
   */
  async minimizeAppointmentData(
    appointment: CalendarAppointment,
    userId: string,
    userRole: string,
  ): Promise<MinimizedCalendarAppointment> {
    try {
      const minimizationLevel = await this.getDataMinimizationLevel(
        appointment.id, // Using appointment ID as patient identifier proxy
        userId,
        userRole,
      );

      const baseMinimized: MinimizedCalendarAppointment = {
        id: appointment.id,
        start: appointment.start,
        end: appointment.end,
        color: appointment.color,
        status: appointment.status,
        consentLevel: minimizationLevel,
        requiresConsent: minimizationLevel !== DataMinimizationLevel.FULL,
      };

      // Apply minimization based on level
      switch (minimizationLevel) {
        case DataMinimizationLevel.MINIMAL:
          return {
            ...baseMinimized,
            title: 'Agendamento Reservado',
            description: 'Tipo não disponível',
            patientInfo: 'Paciente',
          };

        case DataMinimizationLevel.RESTRICTED:
          return {
            ...baseMinimized,
            title: `Consulta - ${this.getPatientInitials(appointment.patientName)}`,
            description: appointment.serviceName,
            patientInfo: this.getPatientInitials(appointment.patientName),
          };

        case DataMinimizationLevel.STANDARD:
          return {
            ...baseMinimized,
            title: `Consulta - ${appointment.patientName}`,
            description: appointment.serviceName,
            patientInfo: appointment.patientName,
          };

        case DataMinimizationLevel.FULL:
          return {
            ...baseMinimized,
            title: appointment.title,
            description: appointment.description,
            patientInfo: appointment.patientName,
          };

        default:
          return baseMinimized;
      }
    } catch (error) {
      console.error('Error minimizing appointment data:', error);
      // Return minimal data on error
      return {
        id: appointment.id,
        title: 'Agendamento Reservado',
        start: appointment.start,
        end: appointment.end,
        color: appointment.color,
        status: appointment.status,
        consentLevel: DataMinimizationLevel.MINIMAL,
        requiresConsent: true,
      };
    }
  }

  /**
   * Batch process appointments with LGPD compliance
   */
  async processAppointmentsWithCompliance(
    appointments: CalendarAppointment[],
    userId: string,
    userRole: string,
  ): Promise<{
    compliantAppointments: MinimizedCalendarAppointment[];
    consentIssues: ConsentValidationResult[];
    auditLogId?: string;
  }> {
    const compliantAppointments: MinimizedCalendarAppointment[] = [];
    const consentIssues: ConsentValidationResult[] = [];
    const auditActions: any[] = [];

    try {
      for (const appointment of appointments) {
        try {
          // Validate consent for this appointment
          const consentResult = await this.validateCalendarConsent(
            appointment.id, // Using appointment ID as patient identifier proxy
            CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
            userId,
            userRole,
          );

          if (!consentResult.isValid) {
            consentIssues.push(consentResult);
            auditActions.push({
              action: 'CONSENT_DENIED',
              appointmentId: appointment.id,
              reason: consentResult.error,
              timestamp: new Date().toISOString(),
            });
          } else {
            // Apply data minimization
            const minimizedAppointment = await this.minimizeAppointmentData(
              appointment,
              userId,
              userRole,
            );

            compliantAppointments.push(minimizedAppointment);
            auditActions.push({
              action: 'APPOINTMENT_ACCESSED',
              appointmentId: appointment.id,
              consentLevel: minimizedAppointment.consentLevel,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(
            `Error processing appointment ${appointment.id}:`,
            error,
          );
          consentIssues.push({
            isValid: false,
            purpose: CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
            patientId: appointment.id,
            isExplicit: false,
            legalBasis: 'error',
            error: 'Processing error',
            recommendation: 'Contact system administrator',
          });
        }
      }

      // Log batch processing for audit
      const auditLogId = await this.logBatchProcessing(
        userId,
        userRole,
        auditActions,
      );

      return {
        compliantAppointments,
        consentIssues,
        auditLogId,
      };
    } catch (error) {
      console.error('Error in batch processing:', error);
      return {
        compliantAppointments: [],
        consentIssues: appointments.map(appointment => ({
          isValid: false,
          purpose: CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
          patientId: appointment.id,
          isExplicit: false,
          legalBasis: 'error',
          error: 'Batch processing failed',
          recommendation: 'Contact system administrator',
        })),
      };
    }
  }

  /**
   * Check if user role is healthcare professional
   */
  private isHealthcareRole(userRole: string): boolean {
    const healthcareRoles = [
      'doctor',
      'nurse',
      'healthcare_professional',
      'medical_staff',
      'clinician',
      'therapist',
      'specialist',
    ];

    return healthcareRoles.some(role => userRole.toLowerCase().includes(role.toLowerCase()));
  }

  /**
   * Get patient initials for data minimization
   */
  private getPatientInitials(fullName: string): string {
    if (!fullName) return 'P';

    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return names
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  }

  /**
   * Log consent validation for audit
   */
  private async logConsentValidation(
    patientId: string,
    purpose: CalendarLGPDPurpose,
    userId: string,
    userRole: string,
    consentId: string,
    isExplicit: boolean,
  ): Promise<void> {
    try {
      await this.supabase.from('lgpd_audit_logs').insert({
        patient_id: patientId,
        action: 'CONSENT_VALIDATED',
        data_category: 'appointment_data',
        purpose,
        user_id: userId,
        user_role: userRole,
        consent_id: consentId,
        is_explicit: isExplicit,
        timestamp: new Date().toISOString(),
        details: {
          purpose,
          isExplicit,
          validation_method: 'calendar_service',
        },
      });
    } catch (error) {
      console.error('Error logging consent validation:', error);
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Log batch processing for audit
   */
  private async logBatchProcessing(
    userId: string,
    userRole: string,
    actions: any[],
  ): Promise<string | undefined> {
    try {
      const { data: log } = await this.supabase
        .from('lgpd_audit_logs')
        .insert({
          patient_id: 'batch_processing',
          action: 'CALENDAR_BATCH_PROCESSED',
          data_category: 'appointment_data',
          purpose: CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
          user_id: userId,
          user_role: userRole,
          timestamp: new Date().toISOString(),
          details: {
            totalAppointments: actions.length,
            actions,
            processing_method: 'calendar_lgpd_service',
          },
        })
        .select('id')
        .single();

      return log?.id;
    } catch (error) {
      console.error('Error logging batch processing:', error);
      return undefined;
    }
  }
}

export const calendarLGPDConsentService = new CalendarLGPDConsentService();

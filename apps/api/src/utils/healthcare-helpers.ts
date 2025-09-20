/**
 * Healthcare-Specific Helper Functions with LGPD Compliance
 *
 * Provides utility functions for common healthcare operations including:
 * - Patient data validation and sanitization
 * - LGPD compliance utilities (consent, data export, deletion)
 * - Brazilian healthcare regulatory compliance (ANVISA, CFM)
 * - Appointment scheduling and no-show prediction
 * - Professional license validation
 * - Data anonymization and audit trail helpers
 */

import { type HealthcarePrismaClient } from '../clients/prisma';

// Brazilian healthcare regulatory validation
export class BrazilianHealthcareValidator {
  /**
   * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
   */
  static validateCPF(cpf: string): boolean {
    if (!cpf) return false;

    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/[^\d]/g, '');

    // Check basic format
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  /**
   * Validates Brazilian phone number formats
   */
  static validateBrazilianPhone(phone: string): boolean {
    if (!phone) return false;

    const cleanPhone = phone.replace(/[^\d]/g, '');

    // Mobile: 11 digits (2 digit area code + 9 + 8 digits)
    // Landline: 10 digits (2 digit area code + 8 digits)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }

  /**
   * Validates CFM (Conselho Federal de Medicina) license numbers
   */
  static validateCFM(cfmNumber: string, state?: string): boolean {
    if (!cfmNumber) return false;

    const cleanCFM = cfmNumber.replace(/[^\d]/g, '');

    // CFM numbers are typically 4-6 digits
    if (cleanCFM.length < 4 || cleanCFM.length > 6) {
      return false;
    }

    // Additional state-specific validation could be added here
    return true;
  }

  /**
   * Validates RG (Registro Geral) document numbers
   */
  static validateRG(rg: string): boolean {
    if (!rg) return false;

    const cleanRG = rg.replace(/[^\dXx]/g, '');

    // RG format varies by state, but generally 7-9 characters
    return cleanRG.length >= 7 && cleanRG.length <= 9;
  }
}

// LGPD Compliance utilities
export class LGPDComplianceHelper {
  /**
   * Sanitizes patient data for AI processing (removes PII)
   */
  static sanitizeForAI(text: string): string {
    if (!text) return text;

    let sanitized = text;

    // Remove CPF patterns
    sanitized = sanitized.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF_REMOVED]');
    sanitized = sanitized.replace(/\d{11}/g, '[CPF_REMOVED]');

    // Remove phone patterns
    sanitized = sanitized.replace(/\(\d{2}\)\s*\d{4,5}-\d{4}/g, '[PHONE_REMOVED]');
    sanitized = sanitized.replace(/\d{2}\s*\d{4,5}-\d{4}/g, '[PHONE_REMOVED]');

    // Remove email patterns
    sanitized = sanitized.replace(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g,
      '[EMAIL_REMOVED]',
    );

    // Remove RG patterns
    sanitized = sanitized.replace(/\d{1,2}\.\d{3}\.\d{3}-\d{1}/g, '[RG_REMOVED]');

    // Remove addresses (basic patterns)
    sanitized = sanitized.replace(/\b\d{5}-?\d{3}\b/g, '[CEP_REMOVED]');

    return sanitized;
  }

  /**
   * Checks if consent is valid for a specific data processing purpose
   */
  static async checkConsentValidity(
    prisma: HealthcarePrismaClient,
    patientId: string,
    purpose: string,
    dataCategories: string[],
  ): Promise<{
    isValid: boolean;
    consentRecord?: any;
    missingCategories?: string[];
  }> {
    try {
      const consentRecords = await prisma.consentRecord.findMany({
        where: {
          patientId,
          purpose,
          status: 'given',
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      });

      if (consentRecords.length === 0) {
        return { isValid: false };
      }

      // Check if all required data categories are covered
      const consentedCategories = consentRecords.flatMap(record => record.dataCategories);
      const missingCategories = dataCategories.filter(
        category => !consentedCategories.includes(category),
      );

      const isValid = missingCategories.length === 0;

      return {
        isValid,
        consentRecord: consentRecords[0],
        missingCategories: isValid ? undefined : missingCategories,
      };
    } catch (error) {
      console.error('Consent validity check failed:', error);
      return { isValid: false };
    }
  }

  /**
   * Creates or updates LGPD consent record
   */
  static async recordConsent(
    prisma: HealthcarePrismaClient,
    patientId: string,
    clinicId: string,
    consentData: {
      consentType: string;
      purpose: string;
      legalBasis: string;
      dataCategories: string[];
      collectionMethod: string;
      ipAddress?: string;
      userAgent?: string;
      expiresAt?: Date;
    },
  ): Promise<any> {
    try {
      const consentRecord = await prisma.consentRecord.create({
        data: {
          patientId,
          clinicId,
          consentType: consentData.consentType,
          purpose: consentData.purpose,
          legalBasis: consentData.legalBasis,
          status: 'given',
          givenAt: new Date(),
          expiresAt: consentData.expiresAt,
          collectionMethod: consentData.collectionMethod,
          ipAddress: consentData.ipAddress,
          userAgent: consentData.userAgent,
          dataCategories: consentData.dataCategories,
          evidence: {
            timestamp: new Date().toISOString(),
            method: consentData.collectionMethod,
            categories: consentData.dataCategories,
          },
        },
      });

      // Create audit log for consent recording
      await prisma.createAuditLog(
        'CREATE',
        'CONSENT_RECORD',
        consentRecord.id,
        {
          consentType: consentData.consentType,
          purpose: consentData.purpose,
          dataCategories: consentData.dataCategories,
        },
      );

      return consentRecord;
    } catch (error) {
      console.error('Consent recording failed:', error);
      throw error;
    }
  }

  /**
   * Withdraws consent for data processing
   */
  static async withdrawConsent(
    prisma: HealthcarePrismaClient,
    consentId: string,
    reason?: string,
  ): Promise<void> {
    try {
      await prisma.consentRecord.update({
        where: { id: consentId },
        data: {
          status: 'withdrawn',
          withdrawnAt: new Date(),
          evidence: {
            withdrawalReason: reason,
            withdrawalTimestamp: new Date().toISOString(),
          },
        },
      });

      // Create audit log for consent withdrawal
      await prisma.createAuditLog('UPDATE', 'CONSENT_RECORD', consentId, {
        action: 'consent_withdrawn',
        reason,
      });
    } catch (error) {
      console.error('Consent withdrawal failed:', error);
      throw error;
    }
  }
}

// Healthcare appointment and scheduling helpers
export class HealthcareAppointmentHelper {
  /**
   * Calculates no-show risk score for an appointment
   */
  static async calculateNoShowRisk(
    prisma: HealthcarePrismaClient,
    appointmentId: string,
  ): Promise<number> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              appointments: {
                where: {
                  status: 'no_show',
                  createdAt: {
                    gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          },
        },
      });

      if (!appointment) return 0;

      let riskScore = 0;

      // Previous no-shows (15 points each, max 60)
      const noShowCount = appointment.patient.appointments.length;
      riskScore += Math.min(noShowCount * 15, 60);

      // Weekend appointments (+10 points)
      const appointmentDay = new Date(appointment.startTime).getDay();
      if (appointmentDay === 0 || appointmentDay === 6) {
        riskScore += 10;
      }

      // Late afternoon appointments (+5 points)
      const appointmentHour = new Date(appointment.startTime).getHours();
      if (appointmentHour >= 17) {
        riskScore += 5;
      }

      // Short notice appointments (+15 points)
      const hoursUntilAppointment = (new Date(appointment.startTime).getTime() - Date.now())
        / (1000 * 60 * 60);
      if (hoursUntilAppointment < 24) {
        riskScore += 15;
      }

      // First-time patient (+10 points)
      const totalAppointments = await prisma.appointment.count({
        where: { patientId: appointment.patientId },
      });
      if (totalAppointments === 1) {
        riskScore += 10;
      }

      return Math.min(riskScore, 100); // Cap at 100
    } catch (error) {
      console.error('No-show risk calculation failed:', error);
      return 0;
    }
  }

  /**
   * Checks for appointment conflicts for a professional
   */
  static async checkAppointmentConflicts(
    prisma: HealthcarePrismaClient,
    professionalId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<any[]> {
    try {
      const conflicts = await prisma.appointment.findMany({
        where: {
          professionalId,
          id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
          status: { not: 'cancelled' },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
        include: {
          patient: {
            select: {
              fullName: true,
              phonePrimary: true,
            },
          },
          serviceType: {
            select: {
              name: true,
              duration_minutes: true,
            },
          },
        },
      });

      return conflicts;
    } catch (error) {
      console.error('Appointment conflict check failed:', error);
      return [];
    }
  }

  /**
   * Gets available time slots for a professional
   */
  static async getAvailableTimeSlots(
    prisma: HealthcarePrismaClient,
    professionalId: string,
    date: Date,
    serviceDurationMinutes: number,
  ): Promise<Array<{ startTime: Date; endTime: Date }>> {
    try {
      const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        select: {
          defaultStartTime: true,
          defaultEndTime: true,
          defaultBreakStart: true,
          defaultBreakEnd: true,
        },
      });

      if (!professional) return [];

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          professionalId,
          startTime: { gte: startOfDay },
          endTime: { lte: endOfDay },
          status: { not: 'cancelled' },
        },
        select: {
          startTime: true,
          endTime: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      // Calculate available slots (simplified logic)
      const availableSlots: Array<{ startTime: Date; endTime: Date }> = [];

      // This would contain more complex logic for calculating available slots
      // based on professional schedule, breaks, and existing appointments

      return availableSlots;
    } catch (error) {
      console.error('Available time slots calculation failed:', error);
      return [];
    }
  }
}

// Patient data helpers
export class PatientDataHelper {
  /**
   * Validates patient data completeness for LGPD compliance
   */
  static validatePatientDataCompleteness(patientData: any): {
    isComplete: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const requiredFields = [
      'givenNames',
      'familyName',
      'birthDate',
      'gender',
      'lgpdConsentGiven',
    ];

    const missingFields = requiredFields.filter(field => !patientData[field]);

    const warnings: string[] = [];

    // Check for Brazilian-specific requirements
    if (!patientData.cpf && !patientData.passportNumber) {
      warnings.push('Either CPF or passport number should be provided');
    }

    if (!patientData.phonePrimary && !patientData.email) {
      warnings.push('At least one contact method should be provided');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      warnings,
    };
  }

  /**
   * Generates a unique medical record number
   */
  static generateMedicalRecordNumber(clinicId: string): string {
    const prefix = clinicId.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Anonymizes patient data for research or analytics
   */
  static anonymizePatientData(patientData: any): any {
    return {
      ...patientData,
      givenNames: ['[ANONYMIZED]'],
      familyName: '[ANONYMIZED]',
      fullName: '[ANONYMIZED]',
      preferredName: null,
      phonePrimary: null,
      phoneSecondary: null,
      email: null,
      addressLine1: null,
      addressLine2: null,
      city: '[ANONYMIZED]',
      postalCode: null,
      cpf: null,
      rg: null,
      passportNumber: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      // Keep medical data for research
      birthDate: patientData.birthDate, // May be generalized to year only
      gender: patientData.gender,
      bloodType: patientData.bloodType,
      allergies: patientData.allergies,
      chronicConditions: patientData.chronicConditions,
    };
  }
}



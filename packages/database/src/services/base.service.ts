/**
 * Base Service Class with LGPD Compliance and Audit Logging
 * Provides common functionality for all database services
 */

import type { PrismaClient } from "@prisma/client";

// Lazy load prisma to avoid test environment issues
let _prismaInstance: PrismaClient | null = null;
const getPrisma = (): PrismaClient => {
  if (!_prismaInstance) {
    const { prisma } = require("../client.js");
    _prismaInstance = prisma;
  }
  return _prismaInstance!;
};

export interface AuditLogData {
  operation: string;
  userId: string;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export abstract class BaseService {
  /**
   * Execute operation with comprehensive audit logging for LGPD compliance
   */
  protected async withAuditLog<T>(
    auditData: AuditLogData,
    action: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await action();

      // LGPD-compliant audit logging for successful operations
      await getPrisma().auditTrail.create({
        data: {
          userId: auditData.userId,
          action: "VIEW", // Default action, should be parameterized
          resource: auditData.tableName,
          resourceType: "PATIENT_RECORD", // Default type, should be parameterized
          resourceId: auditData.recordId,
          ipAddress: auditData.ipAddress || "unknown",
          userAgent: auditData.userAgent || "unknown",
          status: "SUCCESS",
          riskLevel: "LOW",
          additionalInfo: JSON.stringify({
            operation: auditData.operation,
            duration: Date.now() - startTime,
            oldValues: auditData.oldValues,
            newValues: auditData.newValues,
          }),
        },
      });

      return result;
    } catch (error) {
      // Log failed operations for security monitoring
      await getPrisma().auditTrail.create({
        data: {
          userId: auditData.userId,
          action: "VIEW", // Default action, should be parameterized
          resource: auditData.tableName,
          resourceType: "PATIENT_RECORD", // Default type, should be parameterized
          resourceId: auditData.recordId,
          ipAddress: auditData.ipAddress || "unknown",
          userAgent: auditData.userAgent || "unknown",
          status: "FAILED",
          riskLevel: "HIGH", // Failed operations are higher risk
          additionalInfo: JSON.stringify({
            operation: auditData.operation,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      });
      throw error;
    }
  } /**
   * Validate LGPD consent before processing patient data
   */

  protected async validateLGPDConsent(
    patientId: string,
    purpose:
      | "medical_treatment"
      | "ai_assistance"
      | "communication"
      | "marketing",
  ): Promise<boolean> {
    const consent = await getPrisma().consentRecord.findFirst({
      where: {
        patientId,
        purpose,
        status: "granted",
        expiresAt: { gt: new Date() },
      },
    });

    return !!consent;
  }

  /**
   * Sanitize data for AI processing (remove PHI/PII)
   */
  protected sanitizeForAI(text: string): string {
    if (!text) return text;

    // Remove CPF patterns (Brazilian tax ID)
    let sanitized = text.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "[CPF_REMOVED]");

    // Remove phone patterns
    sanitized = sanitized.replace(
      /\(\d{2}\)\s*\d{4,5}-\d{4}/g,
      "[PHONE_REMOVED]",
    );

    // Remove email patterns
    sanitized = sanitized.replace(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g,
      "[EMAIL_REMOVED]",
    );

    // Remove RG patterns (Brazilian ID)
    sanitized = sanitized.replace(
      /\d{1,2}\.\d{3}\.\d{3}-\d{1}/g,
      "[RG_REMOVED]",
    );

    return sanitized;
  }

  /**
   * Calculate appointment no-show risk score using ML patterns
   */
  protected async calculateNoShowRisk(appointmentId: string): Promise<number> {
    const appointment = await getPrisma().appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            appointments: {
              where: {
                status: "no_show",
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
    const noShowCount = appointment.patient.appointments.length;
    riskScore += Math.min(noShowCount * 15, 60);

    const appointmentDay = new Date(appointment.startTime).getDay();
    if (appointmentDay === 0 || appointmentDay === 6) {
      riskScore += 10;
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Validate Brazilian CPF
   */
  protected validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Get user's clinic access permissions
   */
  protected async getUserClinicAccess(userId: string): Promise<string[]> {
    const professional = await getPrisma().professional.findFirst({
      where: {
        userId,
        isActive: true,
      },
      select: { clinicId: true },
    });

    if (professional) {
      return [professional.clinicId];
    }

    // For now, return empty array for admin access
    // TODO: Implement clinic admin model if needed
    return [];
  }

  /**
   * Validate user has access to specific clinic
   */
  protected async validateClinicAccess(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    const accessibleClinics = await this.getUserClinicAccess(userId);
    return accessibleClinics.includes(clinicId);
  }
}

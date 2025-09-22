/**
 * tRPC v11 Patient API Contracts
 * Comprehensive patient management with LGPD compliance
 */

import {
  CreatePatientRequestSchema,
  GetPatientRequestSchema,
  HealthcareTRPCError,
  ListPatientsRequestSchema,
  PatientResponseSchema,
  PatientsListResponseSchema,
  UpdatePatientRequestSchema,
} from '@neonpro/types/api/contracts';
import { protectedProcedure, router } from '../trpc';

export const patientRouter = router({
  /**
   * Create new patient with LGPD compliance validation
   */
  create: protectedProcedure
    .meta({
      description: 'Create new patient with LGPD consent validation',
      tags: ['patient', 'create', 'lgpd'],
      requiresPermission: 'patient:create',
    })
    .input(CreatePatientRequestSchema)
    .output(PatientResponseSchema)
    .mutation(async ({ input,_ctx }) => {
      // Validate LGPD consent
      if (!input.lgpdConsent) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'LGPD consent is required for patient registration',
          'LGPD_CONSENT_REQUIRED',
          { patientData: { cpf: input.cpf } },
        );
      }

      // Validate CPF format and check digit
      const cpfValidation = validateCPF(input.cpf);
      if (!cpfValidation.isValid) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Invalid CPF format or check digit',
          'INVALID_CPF',
          { cpf: input.cpf, reason: cpfValidation.reason },
        );
      }

      // Check for duplicate CPF
      const existingPatient = await ctx.prisma.patient.findUnique({
        where: { cpf: input.cpf },
      });

      if (existingPatient) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Patient with this CPF already exists',
          'PATIENT_ALREADY_EXISTS',
          { existingPatientId: existingPatient.id },
        );
      }

      // Create patient with audit trail
      const patient = await ctx.prisma.patient.create({
        data: {
          ...input,
          consentDate: new Date().toISOString(),
          dataRetentionUntil: calculateDataRetention(),
          consentVersion: '1.0',
          createdBy: ctx.user.id,
        },
      });

      // Log LGPD consent
      await ctx.prisma.lgpdAuditLog.create({
        data: {
          patientId: patient.id,
          action: 'consent_given',
          details: {
            consentVersion: '1.0',
            ipAddress: ctx.ip,
            userAgent: ctx.userAgent,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: patient,
        message: 'Patient created successfully with LGPD compliance',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Get patient by ID with access control
   */
  getById: protectedProcedure
    .meta({
      description: 'Get patient by ID with LGPD audit logging',
      tags: ['patient', 'read', 'audit'],
      requiresPermission: 'patient:read',
    })
    .input(GetPatientRequestSchema)
    .output(PatientResponseSchema)
    .query(async ({ input,_ctx }) => {
      // Check clinic access
      await validateClinicAccess(ctx.user.id, input.id);

      const patient = await ctx.prisma.patient.findUnique({
        where: {
          id: input.id,
          isActive: true,
        },
        include: {
          appointments: input.includeAppointments,
          medicalHistory: input.includeMedicalHistory,
        },
      });

      if (!patient) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Patient not found or access denied',
          'PATIENT_NOT_FOUND',
          { patientId: input.id },
        );
      }

      // LGPD audit log for data access
      await ctx.prisma.lgpdAuditLog.create({
        data: {
          patientId: patient.id,
          action: 'data_access',
          details: {
            accessedFields: Object.keys(patient),
            includeAppointments: input.includeAppointments,
            includeMedicalHistory: input.includeMedicalHistory,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: patient,
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * List patients with filtering and pagination
   */
  list: protectedProcedure
    .meta({
      description: 'List patients with filtering, search, and pagination',
      tags: ['patient', 'list', 'search'],
      requiresPermission: 'patient:list',
    })
    .input(ListPatientsRequestSchema)
    .output(PatientsListResponseSchema)
    .query(async ({ input,_ctx }) => {
      // Validate clinic access
      await validateClinicAccess(ctx.user.id, input.clinicId);

      const where = {
        clinicId: input.clinicId,
        isActive: input.status === 'active'
          ? true
          : input.status === 'inactive'
          ? false
          : undefined,
        ...(input.search && {
          OR: [
            { fullName: { contains: input.search, mode: 'insensitive' } },
            { email: { contains: input.search, mode: 'insensitive' } },
          ],
        }),
      };

      const [patients, total] = await Promise.all([
        ctx.prisma.patient.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: {
            [input.sortBy]: input.sortOrder,
          },
        }),
        ctx.prisma.patient.count({ where }),
      ]);

      return {
        success: true,
        data: {
          patients,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Update patient with change tracking
   */
  update: protectedProcedure
    .meta({
      description: 'Update patient with LGPD compliance and change tracking',
      tags: ['patient', 'update', 'audit'],
      requiresPermission: 'patient:update',
    })
    .input(UpdatePatientRequestSchema)
    .output(PatientResponseSchema)
    .mutation(async ({ input,_ctx }) => {
      // Get current patient data for change tracking
      const currentPatient = await ctx.prisma.patient.findUnique({
        where: { id: input.id },
      });

      if (!currentPatient) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Patient not found',
          'PATIENT_NOT_FOUND',
          { patientId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, currentPatient.clinicId);

      // Track changes for audit
      const changes = {};
      Object.keys(input).forEach(key => {
        if (key !== 'id' && input[key] !== currentPatient[key]) {
          changes[key] = {
            from: currentPatient[key],
            to: input[key],
          };
        }
      });

      // Update patient
      const updatedPatient = await ctx.prisma.patient.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        },
      });

      // Log changes for LGPD compliance
      if (Object.keys(changes).length > 0) {
        await ctx.prisma.lgpdAuditLog.create({
          data: {
            patientId: input.id,
            action: 'data_update',
            details: {
              changes,
              updateReason: input.updateReason || 'Patient data update',
            },
            _userId: ctx.user.id,
          },
        });
      }

      return {
        success: true,
        data: updatedPatient,
        message: 'Patient updated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Soft delete patient with LGPD compliance
   */
  delete: protectedProcedure
    .meta({
      description: 'Soft delete patient with LGPD audit trail',
      tags: ['patient', 'delete', 'lgpd'],
      requiresPermission: 'patient:delete',
    })
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().min(10).max(500),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ input,_ctx }) => {
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.id },
      });

      if (!patient) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Patient not found',
          'PATIENT_NOT_FOUND',
          { patientId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, patient.clinicId);

      // Soft delete patient
      await ctx.prisma.patient.update({
        where: { id: input.id },
        data: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: ctx.user.id,
          deletionReason: input.reason,
        },
      });

      // LGPD audit log
      await ctx.prisma.lgpdAuditLog.create({
        data: {
          patientId: input.id,
          action: 'data_deletion',
          details: {
            deletionType: 'soft_delete',
            reason: input.reason,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        message: 'Patient deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),
});

// Helper functions
function validateCPF(cpf: string): { isValid: boolean; reason?: string } {
  // Remove formatting
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) {
    return { isValid: false, reason: 'CPF must have 11 digits' };
  }

  // Check for repeated digits
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, reason: 'CPF cannot have all identical digits' };
  }

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCPF[9]) !== digit1) {
    return { isValid: false, reason: 'Invalid first check digit' };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCPF[10]) !== digit2) {
    return { isValid: false, reason: 'Invalid second check digit' };
  }

  return { isValid: true };
}

function calculateDataRetention(): string {
  // LGPD compliance: 5 years retention for healthcare data
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + 5);
  return retentionDate.toISOString();
}

async function validateClinicAccess(
  _userId: string,
  clinicId: string,
): Promise<void> {
  // Implementation depends on your authorization system
  // This is a placeholder for clinic access validation
  return Promise.resolve();
}

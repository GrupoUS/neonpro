/**
 * Patients tRPC Router
 * Implements LGPD compliance, audit logging, and Brazilian healthcare standards
 */

import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, patientProcedure } from '../trpc';
import { 
  CreatePatientSchema, 
  UpdatePatientSchema, 
  GetPatientSchema, 
  ListPatientsSchema 
} from '../schemas';
import { AuditAction, ResourceType, AuditStatus, RiskLevel } from '@prisma/client';

export const patientsRouter = router({
  /**
   * Create Patient
   * Requires LGPD consent and creates audit trail
   */
  create: protectedProcedure
    .input(CreatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify clinic access
        if (!ctx.clinicId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Clinic context required',
          });
        }

        // Create patient with LGPD compliance
        const patient = await ctx.prisma.patient.create({
          data: {
            ...input,
            clinicId: ctx.clinicId,
            createdBy: ctx.userId,
            updatedBy: ctx.userId,
          },
        });

        // Create LGPD consent record
        await ctx.prisma.consentRecord.create({
          data: {
            patientId: patient.id,            clinicId: ctx.clinicId,
            consentType: 'data_processing',
            purpose: 'Healthcare service provision',
            legalBasis: 'LGPD Art. 7, VI - vital interests protection',
            status: 'active',
            givenAt: new Date(),
            collectionMethod: 'web_interface',
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            dataCategories: ['personal_data', 'health_data'],
            evidence: {
              consentVersion: input.lgpdConsentVersion,
              timestamp: new Date().toISOString(),
              method: 'explicit_consent',
            },
          },
        });

        // Log successful creation
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: ctx.clinicId,
            patientId: patient.id,
            action: AuditAction.CREATE,
            resource: 'patient',
            resourceType: ResourceType.PATIENT_RECORD,
            resourceId: patient.id,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.LOW,
            additionalInfo: JSON.stringify({
              action: 'patient_created',
              medicalRecordNumber: patient.medicalRecordNumber,
            }),
          },
        });

        return patient;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create patient',
          cause: error,
        });
      }
    }),  /**
   * Get Patient by ID
   * Includes consent verification
   */
  get: patientProcedure
    .input(GetPatientSchema)
    .query(async ({ ctx, input }) => {
      const patient = await ctx.prisma.patient.findFirst({
        where: {
          id: input.id,
          clinicId: ctx.clinicId,
          isActive: true,
        },
        include: {
          consentRecords: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!patient) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      return patient;
    }),

  /**
   * List Patients
   * With pagination and search
   */
  list: protectedProcedure
    .input(ListPatientsSchema)
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, search, isActive = true } = input;

      const where = {
        clinicId: ctx.clinicId,
        isActive,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { medicalRecordNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [patients, total] = await Promise.all([
        ctx.prisma.patient.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.patient.count({ where }),
      ]);

      return {
        patients,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),  /**
   * Update Patient
   * Logs changes for audit trail
   */
  update: patientProcedure
    .input(UpdatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingPatient = await ctx.prisma.patient.findFirst({
        where: { id, clinicId: ctx.clinicId },
      });

      if (!existingPatient) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      const updatedPatient = await ctx.prisma.patient.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.userId,
        },
      });

      // Log update for audit trail
      await ctx.prisma.auditTrail.create({
        data: {
          userId: ctx.userId,
          clinicId: ctx.clinicId,
          patientId: id,          action: AuditAction.UPDATE,
          resource: 'patient',
          resourceType: ResourceType.PATIENT_RECORD,
          resourceId: id,
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: AuditStatus.SUCCESS,
          riskLevel: RiskLevel.LOW,
          additionalInfo: JSON.stringify({
            action: 'patient_updated',
            updatedFields: Object.keys(updateData),
          }),
        },
      });

      return updatedPatient;
    }),

  /**
   * Delete Patient (LGPD compliant soft delete)
   */
  delete: patientProcedure
    .input(GetPatientSchema)
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.prisma.patient.findFirst({
        where: { id: input.id, clinicId: ctx.clinicId },
      });

      if (!patient) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      // Soft delete with LGPD compliance
      const deletedPatient = await ctx.prisma.patient.update({
        where: { id: input.id },        data: {
          isActive: false,
          updatedBy: ctx.userId,
        },
      });

      // Log deletion for audit trail
      await ctx.prisma.auditTrail.create({
        data: {
          userId: ctx.userId,
          clinicId: ctx.clinicId,
          patientId: input.id,
          action: AuditAction.DELETE,
          resource: 'patient',
          resourceType: ResourceType.PATIENT_RECORD,
          resourceId: input.id,
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: AuditStatus.SUCCESS,
          riskLevel: RiskLevel.MEDIUM,
          additionalInfo: JSON.stringify({
            action: 'patient_soft_deleted',
            medicalRecordNumber: patient.medicalRecordNumber,
          }),
        },
      });

      return deletedPatient;
    }),
});
/**
 * Aesthetic Clinic tRPC Router
 *
 * Comprehensive API endpoints for aesthetic clinic operations with Brazilian healthcare compliance.
 * Simplified version using Prisma directly for better compatibility.
 */

import { AuditAction, AuditStatus, ResourceType, RiskLevel } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { healthcareProcedure, protectedProcedure, router } from '../trpc';

// Import schemas (assuming they're defined in the schemas file)
// These would typically be imported from '../schemas'

/**
 * Aesthetic Clinic Router
 *
 * Provides comprehensive endpoints for aesthetic clinic management with full Brazilian healthcare compliance:
 * - Client profile management with LGPD compliance
 * - Treatment catalog management with ANVISA compliance
 * - Session management with professional validation
 * - Photo assessment with secure storage
 * - Treatment planning and progress tracking
 * - Financial management with Brazilian payment systems
 * - Analytics and retention metrics
 */
export const aestheticClinicRouter = router({
  // =====================================
  // CLIENT PROFILE MANAGEMENT
  // =====================================

  /**
   * Create Aesthetic Client Profile
   * Creates a new client profile with comprehensive medical history and LGPD compliance
   */
  createAestheticClientProfile: healthcareProcedure
    .input(v.object({
      clinicId: v.string(),
      fullName: v.string(),
      email: v.optional(v.string()),
      phonePrimary: v.string(),
      phoneSecondary: v.optional(v.string()),
      birthDate: v.string(),
      cpf: v.optional(v.string()),
      rg: v.optional(v.string()),
      gender: v.enum(['male', 'female', 'other']),
      skinType: v.enum(['I', 'II', 'III', 'IV', 'V', 'VI']),
      fitzpatrickType: v.optional(v.enum(['I', 'II', 'III', 'IV', 'V', 'VI'])),
      medicalHistory: v.array(v.object({
        condition: v.string(),
        severity: v.enum(['mild', 'moderate', 'severe']),
        diagnosedDate: v.optional(v.string()),
        isActive: v.boolean(),
        notes: v.optional(v.string()),
      })),
      allergies: v.array(v.object({
        substance: v.string(),
        reaction: v.string(),
        severity: v.enum(['mild', 'moderate', 'severe']),
        firstObserved: v.optional(v.string()),
      })),
      medications: v.array(v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        startDate: v.string(),
        isActive: v.boolean(),
        prescribedBy: v.optional(v.string()),
      })),
      previousTreatments: v.array(v.object({
        treatment: v.string(),
        date: v.string(),
        professional: v.string(),
        clinic: v.string(),
        results: v.optional(v.string()),
        complications: v.optional(v.string()),
      })),
      aestheticGoals: v.array(v.string()),
      concerns: v.array(v.string()),
      expectations: v.optional(v.string()),
      budgetRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
        currency: v.enum(['BRL', 'USD', 'EUR']),
      })),
      preferredContactMethod: v.enum(['phone', 'email', 'whatsapp']),
      preferredLanguage: v.enum(['pt-BR', 'en-US', 'es-ES']),
      lgpdConsentGiven: v.boolean(),
      lgpdConsentVersion: v.string(),
      marketingConsent: v.optional(v.boolean()),
      photoConsent: v.optional(v.boolean()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        relationship: v.string(),
        phone: v.string(),
      })),
      referralSource: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate LGPD consent
        if (!input.lgpdConsentGiven) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'LGPD consent is required for client profile creation',
          });
        }

        // Check for existing client with same CPF
        if (input.cpf) {
          const existingClient = await ctx.prisma.aestheticClientProfile.findFirst({
            where: { cpf: input.cpf, clinicId: input.clinicId },
          });

          if (existingClient) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Client with this CPF already exists in this clinic',
            });
          }
        }

        // Create client profile
        const client = await ctx.prisma.aestheticClientProfile.create({
          data: {
            clinicId: input.clinicId,
            fullName: input.fullName,
            email: input.email,
            phonePrimary: input.phonePrimary,
            phoneSecondary: input.phoneSecondary,
            birthDate: new Date(input.birthDate),
            cpf: input.cpf,
            rg: input.rg,
            gender: input.gender,
            skinType: input.skinType,
            fitzpatrickType: input.fitzpatrickType,
            medicalHistory: input.medicalHistory,
            allergies: input.allergies,
            medications: input.medications,
            previousTreatments: input.previousTreatments,
            aestheticGoals: input.aestheticGoals,
            concerns: input.concerns,
            expectations: input.expectations,
            budgetRange: input.budgetRange,
            preferredContactMethod: input.preferredContactMethod,
            preferredLanguage: input.preferredLanguage,
            lgpdConsentGiven: input.lgpdConsentGiven,
            lgpdConsentVersion: input.lgpdConsentVersion,
            lgpdConsentDate: new Date(),
            marketingConsent: input.marketingConsent,
            photoConsent: input.photoConsent,
            emergencyContact: input.emergencyContact,
            referralSource: input.referralSource,
            notes: input.notes,
            status: 'active',
            createdBy: ctx._userId,
            updatedBy: ctx._userId,
          },
        });

        // Log audit trail
        await ctx.prisma.auditLog.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.AESTHETIC_CLIENT,
            resourceId: client.id,
            userId: ctx._userId,
            clinicId: input.clinicId,
            details: {
              operation: 'create_aesthetic_client_profile',
              clientName: input.fullName,
              consentVersion: input.lgpdConsentVersion,
            },
            riskLevel: RiskLevel.MEDIUM,
            status: AuditStatus.COMPLETED,
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'],
          },
        });

        return {
          success: true,
          data: client,
          message: 'Aesthetic client profile created successfully',
        };
      } catch {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create aesthetic client profile',
          cause: error,
        });
      }
    }),

  /**
   * Get Aesthetic Client Profile by ID
   * Retrieves client profile with comprehensive medical history
   */
  getAestheticClientProfileById: protectedProcedure
    .input(v.object({
      id: v.string(),
      includeMedicalHistory: v.optional(v.boolean()),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const client = await ctx.prisma.aestheticClientProfile.findUnique({
          where: { id: input.id },
          include: {
            treatmentPlans: input.includeMedicalHistory,
            sessions: input.includeMedicalHistory,
            photoAssessments: input.includeMedicalHistory,
            financialTransactions: input.includeMedicalHistory,
          },
        });

        if (!client) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aesthetic client profile not found',
          });
        }

        // Verify clinic access
        if (client.clinicId !== ctx.clinicId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this client profile',
          });
        }

        return {
          success: true,
          data: client,
        };
      } catch {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve aesthetic client profile',
          cause: error,
        });
      }
    }),

  /**
   * Update Aesthetic Client Profile
   * Updates client profile with comprehensive audit trail
   */
  updateAestheticClientProfile: healthcareProcedure
    .input(v.object({
      id: v.string(),
      fullName: v.optional(v.string()),
      email: v.optional(v.string()),
      phonePrimary: v.optional(v.string()),
      phoneSecondary: v.optional(v.string()),
      skinType: v.optional(v.enum(['I', 'II', 'III', 'IV', 'V', 'VI'])),
      fitzpatrickType: v.optional(v.enum(['I', 'II', 'III', 'IV', 'V', 'VI'])),
      medicalHistory: v.optional(v.array(v.any())),
      allergies: v.optional(v.array(v.any())),
      medications: v.optional(v.array(v.any())),
      aestheticGoals: v.optional(v.array(v.string())),
      concerns: v.optional(v.array(v.string())),
      expectations: v.optional(v.string()),
      budgetRange: v.optional(v.any()),
      preferredContactMethod: v.optional(v.enum(['phone', 'email', 'whatsapp'])),
      marketingConsent: v.optional(v.boolean()),
      photoConsent: v.optional(v.boolean()),
      emergencyContact: v.optional(v.any()),
      notes: v.optional(v.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if client exists and belongs to clinic
        const existingClient = await ctx.prisma.aestheticClientProfile.findFirst({
          where: {
            id: input.id,
            clinicId: ctx.clinicId,
          },
        });

        if (!existingClient) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aesthetic client profile not found',
          });
        }

        // Update client profile
        const updatedClient = await ctx.prisma.aestheticClientProfile.update({
          where: { id: input.id },
          data: {
            ...(input.fullName && { fullName: input.fullName }),
            ...(input.email !== undefined && { email: input.email }),
            ...(input.phonePrimary !== undefined && { phonePrimary: input.phonePrimary }),
            ...(input.phoneSecondary !== undefined && { phoneSecondary: input.phoneSecondary }),
            ...(input.skinType !== undefined && { skinType: input.skinType }),
            ...(input.fitzpatrickType !== undefined && { fitzpatrickType: input.fitzpatrickType }),
            ...(input.medicalHistory !== undefined && { medicalHistory: input.medicalHistory }),
            ...(input.allergies !== undefined && { allergies: input.allergies }),
            ...(input.medications !== undefined && { medications: input.medications }),
            ...(input.aestheticGoals !== undefined && { aestheticGoals: input.aestheticGoals }),
            ...(input.concerns !== undefined && { concerns: input.concerns }),
            ...(input.expectations !== undefined && { expectations: input.expectations }),
            ...(input.budgetRange !== undefined && { budgetRange: input.budgetRange }),
            ...(input.preferredContactMethod !== undefined
              && { preferredContactMethod: input.preferredContactMethod }),
            ...(input.marketingConsent !== undefined
              && { marketingConsent: input.marketingConsent }),
            ...(input.photoConsent !== undefined && { photoConsent: input.photoConsent }),
            ...(input.emergencyContact !== undefined
              && { emergencyContact: input.emergencyContact }),
            ...(input.notes !== undefined && { notes: input.notes }),
            updatedBy: ctx._userId,
            updatedAt: new Date(),
          },
        });

        // Log audit trail
        await ctx.prisma.auditLog.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.AESTHETIC_CLIENT,
            resourceId: input.id,
            userId: ctx._userId,
            clinicId: ctx.clinicId,
            details: {
              operation: 'update_aesthetic_client_profile',
              clientName: updatedClient.fullName,
              updatedFields: Object.keys(input).filter(key => key !== 'id'),
            },
            riskLevel: RiskLevel.MEDIUM,
            status: AuditStatus.COMPLETED,
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'],
          },
        });

        return {
          success: true,
          data: updatedClient,
          message: 'Aesthetic client profile updated successfully',
        };
      } catch {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update aesthetic client profile',
          cause: error,
        });
      }
    }),

  /**
   * Search Aesthetic Client Profiles
   * Search clients with filters and pagination
   */
  searchAestheticClientProfiles: protectedProcedure
    .input(v.object({
      clinicId: v.string(),
      query: v.optional(v.string()),
      skinType: v.optional(v.enum(['I', 'II', 'III', 'IV', 'V', 'VI'])),
      status: v.optional(v.enum(['active', 'inactive', 'archived'])),
      page: v.optional(v.number().min(1).default(1)),
      limit: v.optional(v.number().min(1).max(100).default(20)),
      sortBy: v.optional(v.enum(['fullName', 'createdAt', 'lastVisitDate'])),
      sortOrder: v.optional(v.enum(['asc', 'desc'])),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { clinicId, query, skinType, status, page, limit, sortBy, sortOrder } = input;
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {
          clinicId,
          ...(query && {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phonePrimary: { contains: query, mode: 'insensitive' } },
              { cpf: { contains: query, mode: 'insensitive' } },
            ],
          }),
          ...(skinType && { skinType }),
          ...(status && { status }),
        };

        // Get total count for pagination
        const total = await ctx.prisma.aestheticClientProfile.count({ where });

        // Get clients
        const clients = await ctx.prisma.aestheticClientProfile.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { fullName: 'asc' },
        });

        return {
          success: true,
          data: {
            clients,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          },
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search aesthetic client profiles',
          cause: error,
        });
      }
    }),

  // =====================================
  // TREATMENT CATALOG MANAGEMENT
  // =====================================

  /**
   * Create Aesthetic Treatment
   * Creates a new treatment in the catalog with ANVISA compliance
   */
  createAestheticTreatment: healthcareProcedure
    .input(v.object({
      clinicId: v.string(),
      name: v.string(),
      description: v.string(),
      category: v.enum(['facial', 'body', 'injectable', 'laser', 'surgical', 'other']),
      procedureType: v.enum(['non-invasive', 'minimally-invasive', 'surgical']),
      duration: v.number(), // in minutes
      basePrice: v.number(),
      currency: v.enum(['BRL', 'USD', 'EUR']).default('BRL'),
      sessionCount: v.optional(v.number().min(1)),
      recoveryTime: v.optional(v.number()), // in days
      contraindications: v.array(v.string()),
      aftercareInstructions: v.array(v.string()),
      expectedResults: v.array(v.string()),
      risks: v.array(v.string()),
      anvisaRegistration: v.optional(v.string()),
      anvisaCategory: v.optional(v.string()),
      requiresPrescription: v.boolean(),
      requiresMedicalSupervision: v.boolean(),
      ageRestriction: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      skinTypeRestrictions: v.optional(v.array(v.enum(['I', 'II', 'III', 'IV', 'V', 'VI']))),
      pregnancyRestriction: v.enum(['allowed', 'not_recommended', 'contraindicated']),
      isActive: v.boolean().default(true),
      professionalLevel: v.enum(['basic', 'intermediate', 'advanced', 'expert']),
      equipmentRequired: v.array(v.string()),
      productsRequired: v.array(v.string()),
      images: v.array(v.any()),
      tags: v.array(v.string()),
      notes: v.optional(v.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate ANVISA requirements for certain procedures
        if (input.procedureType === 'surgical' || input.procedureType === 'laser') {
          if (!input.anvisaRegistration) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'ANVISA registration is required for surgical and laser procedures',
            });
          }
        }

        // Create treatment
        const treatment = await ctx.prisma.aestheticTreatment.create({
          data: {
            clinicId: input.clinicId,
            name: input.name,
            description: input.description,
            category: input.category,
            procedureType: input.procedureType,
            duration: input.duration,
            basePrice: input.basePrice,
            currency: input.currency,
            sessionCount: input.sessionCount,
            recoveryTime: input.recoveryTime,
            contraindications: input.contraindications,
            aftercareInstructions: input.aftercareInstructions,
            expectedResults: input.expectedResults,
            risks: input.risks,
            anvisaRegistration: input.anvisaRegistration,
            anvisaCategory: input.anvisaCategory,
            requiresPrescription: input.requiresPrescription,
            requiresMedicalSupervision: input.requiresMedicalSupervision,
            ageRestriction: input.ageRestriction,
            skinTypeRestrictions: input.skinTypeRestrictions,
            pregnancyRestriction: input.pregnancyRestriction,
            isActive: input.isActive,
            professionalLevel: input.professionalLevel,
            equipmentRequired: input.equipmentRequired,
            productsRequired: input.productsRequired,
            images: input.images,
            tags: input.tags,
            notes: input.notes,
            createdBy: ctx._userId,
            updatedBy: ctx._userId,
          },
        });

        // Log audit trail
        await ctx.prisma.auditLog.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.AESTHETIC_TREATMENT,
            resourceId: treatment.id,
            userId: ctx._userId,
            clinicId: input.clinicId,
            details: {
              operation: 'create_aesthetic_treatment',
              treatmentName: input.name,
              category: input.category,
              anvisaRegistered: !!input.anvisaRegistration,
            },
            riskLevel: RiskLevel.HIGH,
            status: AuditStatus.COMPLETED,
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'],
          },
        });

        return {
          success: true,
          data: treatment,
          message: 'Aesthetic treatment created successfully',
        };
      } catch {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create aesthetic treatment',
          cause: error,
        });
      }
    }),

  /**
   * Get Treatment Catalog
   * Retrieves all active treatments for a clinic
   */
  getTreatmentCatalog: protectedProcedure
    .input(v.object({
      clinicId: v.string(),
      category: v.optional(v.enum(['facial', 'body', 'injectable', 'laser', 'surgical', 'other'])),
      activeOnly: v.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {
          clinicId: input.clinicId,
          ...(input.activeOnly && { isActive: true }),
          ...(input.category && { category: input.category }),
        };

        const treatments = await ctx.prisma.aestheticTreatment.findMany({
          where,
          orderBy: [
            { category: 'asc' },
            { name: 'asc' },
          ],
        });

        return {
          success: true,
          data: treatments,
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve treatment catalog',
          cause: error,
        });
      }
    }),

  // =====================================
  // SESSION MANAGEMENT
  // =====================================

  /**
   * Create Aesthetic Session
   * Creates a new treatment session with professional validation
   */
  createAestheticSession: healthcareProcedure
    .input(v.object({
      clinicId: v.string(),
      clientId: v.string(),
      treatmentId: v.string(),
      professionalId: v.string(),
      scheduledDate: v.string(),
      scheduledTime: v.string(),
      duration: v.number(),
      room: v.string(),
      status: v.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).default(
        'scheduled',
      ),
      notes: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      price: v.number(),
      currency: v.enum(['BRL', 'USD', 'EUR']).default('BRL'),
      paymentStatus: v.enum(['pending', 'paid', 'partial', 'refunded']).default('pending'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate client exists
        const client = await ctx.prisma.aestheticClientProfile.findUnique({
          where: { id: input.clientId },
        });

        if (!client || client.clinicId !== input.clinicId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Client not found',
          });
        }

        // Validate treatment exists and is active
        const treatment = await ctx.prisma.aestheticTreatment.findUnique({
          where: { id: input.treatmentId },
        });

        if (!treatment || treatment.clinicId !== input.clinicId || !treatment.isActive) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Treatment not found or inactive',
          });
        }

        // Check for scheduling conflicts
        const sessionDate = new Date(input.scheduledDate);
        const [hour, minute] = input.scheduledTime.split(':').map(Number);
        sessionDate.setHours(hour, minute, 0, 0);

        const endTime = new Date(sessionDate.getTime() + input.duration * 60000);

        const conflict = await ctx.prisma.aestheticTreatmentSession.findFirst({
          where: {
            clinicId: input.clinicId,
            room: input.room,
            professionalId: input.professionalId,
            status: { in: ['scheduled', 'in_progress'] },
            OR: [
              {
                scheduledDate: sessionDate,
              },
              {
                scheduledDate: { lt: endTime },
                endDate: { gt: sessionDate },
              },
            ],
          },
        });

        if (conflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Scheduling conflict detected',
          });
        }

        // Create session
        const session = await ctx.prisma.aestheticTreatmentSession.create({
          data: {
            clinicId: input.clinicId,
            clientId: input.clientId,
            treatmentId: input.treatmentId,
            professionalId: input.professionalId,
            scheduledDate: sessionDate,
            duration: input.duration,
            endDate: endTime,
            room: input.room,
            status: input.status,
            notes: input.notes,
            specialInstructions: input.specialInstructions,
            price: input.price,
            currency: input.currency,
            paymentStatus: input.paymentStatus,
            createdBy: ctx._userId,
            updatedBy: ctx._userId,
          },
        });

        // Update client's last visit date
        await ctx.prisma.aestheticClientProfile.update({
          where: { id: input.clientId },
          data: { lastVisitDate: sessionDate },
        });

        // Log audit trail
        await ctx.prisma.auditLog.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.AESTHETIC_SESSION,
            resourceId: session.id,
            userId: ctx._userId,
            clinicId: input.clinicId,
            details: {
              operation: 'create_aesthetic_session',
              clientId: input.clientId,
              treatmentId: input.treatmentId,
              professionalId: input.professionalId,
              scheduledDate: input.scheduledDate,
            },
            riskLevel: RiskLevel.MEDIUM,
            status: AuditStatus.COMPLETED,
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'],
          },
        });

        return {
          success: true,
          data: session,
          message: 'Aesthetic session created successfully',
        };
      } catch {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create aesthetic session',
          cause: error,
        });
      }
    }),

  /**
   * List Aesthetic Sessions
   * Lists sessions with filters and pagination
   */
  listAestheticSessions: protectedProcedure
    .input(v.object({
      clinicId: v.string(),
      clientId: v.optional(v.string()),
      professionalId: v.optional(v.string()),
      status: v.optional(v.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])),
      dateFrom: v.optional(v.string()),
      dateTo: v.optional(v.string()),
      page: v.optional(v.number().min(1).default(1)),
      limit: v.optional(v.number().min(1).max(100).default(20)),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { clinicId, clientId, professionalId, status, dateFrom, dateTo, page, limit } = input;
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {
          clinicId,
          ...(clientId && { clientId }),
          ...(professionalId && { professionalId }),
          ...(status && { status }),
          ...(dateFrom && { scheduledDate: { gte: new Date(dateFrom) } }),
          ...(dateTo && {
            scheduledDate: {
              ...where.scheduledDate,
              lte: new Date(dateTo),
            },
          }),
        };

        // Get total count for pagination
        const total = await ctx.prisma.aestheticTreatmentSession.count({ where });

        // Get sessions with related data
        const sessions = await ctx.prisma.aestheticTreatmentSession.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                phonePrimary: true,
              },
            },
            treatment: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
            professional: {
              select: {
                id: true,
                fullName: true,
                specialty: true,
              },
            },
          },
          orderBy: { scheduledDate: 'asc' },
        });

        return {
          success: true,
          data: {
            sessions,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          },
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list aesthetic sessions',
          cause: error,
        });
      }
    }),

  // =====================================
  // BASIC ANALYTICS
  // =====================================

  /**
   * Get Client Retention Metrics
   * Calculates retention metrics for the clinic
   */
  getClientRetentionMetrics: protectedProcedure
    .input(v.object({
      clinicId: v.string(),
      period: v.enum(['30d', '60d', '90d', '180d', '1y']).default('90d'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const endDate = new Date();
        const startDate = new Date();

        // Calculate start date based on period
        switch (input.period) {
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '60d':
            startDate.setDate(endDate.getDate() - 60);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case '180d':
            startDate.setDate(endDate.getDate() - 180);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        // Get client metrics
        const [
          totalClients,
          activeClients,
          newClients,
          returningClients,
          totalSessions,
          completedSessions,
          cancelledSessions,
          totalRevenue,
        ] = await Promise.all([
          // Total clients
          ctx.prisma.aestheticClientProfile.count({
            where: {
              clinicId: input.clinicId,
              status: 'active',
            },
          }),

          // Active clients (visited in period)
          ctx.prisma.aestheticClientProfile.count({
            where: {
              clinicId: input.clinicId,
              status: 'active',
              lastVisitDate: { gte: startDate },
            },
          }),

          // New clients (created in period)
          ctx.prisma.aestheticClientProfile.count({
            where: {
              clinicId: input.clinicId,
              createdAt: { gte: startDate },
            },
          }),

          // Returning clients (visited in period but created before period)
          ctx.prisma.aestheticClientProfile.count({
            where: {
              clinicId: input.clinicId,
              createdAt: { lt: startDate },
              lastVisitDate: { gte: startDate },
            },
          }),

          // Total sessions in period
          ctx.prisma.aestheticTreatmentSession.count({
            where: {
              clinicId: input.clinicId,
              scheduledDate: { gte: startDate, lte: endDate },
            },
          }),

          // Completed sessions in period
          ctx.prisma.aestheticTreatmentSession.count({
            where: {
              clinicId: input.clinicId,
              scheduledDate: { gte: startDate, lte: endDate },
              status: 'completed',
            },
          }),

          // Cancelled sessions in period
          ctx.prisma.aestheticTreatmentSession.count({
            where: {
              clinicId: input.clinicId,
              scheduledDate: { gte: startDate, lte: endDate },
              status: 'cancelled',
            },
          }),

          // Total revenue in period
          ctx.prisma.aestheticFinancialTransaction.aggregate({
            where: {
              clinicId: input.clinicId,
              transactionDate: { gte: startDate, lte: endDate },
              status: 'completed',
              type: { in: ['payment', 'installment'] },
            },
            _sum: { amount: true },
          }),
        ]);

        const revenue = totalRevenue._sum.amount || 0;

        // Calculate metrics
        const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;
        const avgRevenuePerClient = activeClients > 0 ? revenue / activeClients : 0;

        return {
          success: true,
          data: {
            period: input.period,
            dateRange: {
              start: startDate,
              end: endDate,
            },
            metrics: {
              totalClients,
              activeClients,
              newClients,
              returningClients,
              retentionRate: Math.round(retentionRate * 100) / 100,
              totalSessions,
              completedSessions,
              completionRate: Math.round(completionRate * 100) / 100,
              cancelledSessions,
              cancellationRate: Math.round(cancellationRate * 100) / 100,
              totalRevenue: revenue,
              avgRevenuePerClient: Math.round(avgRevenuePerClient * 100) / 100,
            },
          },
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate client retention metrics',
          cause: error,
        });
      }
    }),
});

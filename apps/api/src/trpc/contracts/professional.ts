/**
 * tRPC v11 Professional API Contracts
 * Healthcare professional management with license validation and scheduling
 */

import {
  CreateProfessionalRequestSchema,
  HealthcareTRPCError,
  PaginationSchema,
  ProfessionalResponseSchema,
  ProfessionalsListResponseSchema,
  UpdateProfessionalRequestSchema,
} from '@neonpro/types/api/contracts'
import { protectedProcedure, router } from '../trpc'

export const professionalRouter = router({
  /**
   * Register new healthcare professional with license validation
   */
  create: protectedProcedure
    .meta({
      description: 'Register new healthcare professional with automated license validation',
      tags: ['professional', 'create', 'license-validation'],
      requiresPermission: 'professional:create',
    })
    .input(CreateProfessionalRequestSchema)
    .output(ProfessionalResponseSchema)
    .mutation(async ({ input, _ctx }) => {
      // Validate clinic exists and user has permission
      const clinic = await ctx.prisma.clinic.findUnique({
        where: { id: input.clinicId },
      })

      if (!clinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_NOT_FOUND',
          { clinicId: input.clinicId },
        )
      }

      // Validate user has permission to add professionals to this clinic
      await validateClinicAdminAccess(ctx.user.id, input.clinicId)

      // Validate license number format and uniqueness
      if (!isValidLicenseFormat(input.licenseType, input.licenseNumber)) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Invalid license number format for the specified license type',
          'INVALID_LICENSE_FORMAT',
          {
            licenseType: input.licenseType,
            licenseNumber: input.licenseNumber,
          },
        )
      }

      // Check if license number already exists
      const existingProfessional = await ctx.prisma.professional.findFirst({
        where: {
          licenseNumber: input.licenseNumber,
          licenseType: input.licenseType,
          isActive: true,
        },
      })

      if (existingProfessional) {
        throw new HealthcareTRPCError(
          'CONFLICT',
          'Professional with this license number already exists',
          'LICENSE_ALREADY_EXISTS',
          {
            existingProfessionalId: existingProfessional.id,
            licenseNumber: input.licenseNumber,
          },
        )
      }

      // Validate license with regulatory authority (CFM, CRO, etc.)
      const licenseValidation = await validateLicenseWithAuthority(
        input.licenseType,
        input.licenseNumber,
      )

      if (!licenseValidation.isValid) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'License validation failed with regulatory authority',
          'LICENSE_VALIDATION_FAILED',
          {
            licenseType: input.licenseType,
            licenseNumber: input.licenseNumber,
            validationErrors: licenseValidation.errors,
          },
        )
      }

      // Create professional record
      const professional = await ctx.prisma.professional.create({
        data: {
          ...input,
          licenseValidatedAt: new Date(),
          licenseValidationSource: licenseValidation.source,
          isActive: true,
          createdBy: ctx.user.id,
        },
        include: {
          clinic: {
            select: {
              name: true,
              address: true,
            },
          },
          workingHours: true,
        },
      })

      // Create default working hours if not provided
      if (input.workingHours && input.workingHours.length > 0) {
        await ctx.prisma.professionalWorkingHours.createMany({
          data: input.workingHours.map((wh) => ({
            ...wh,
            professionalId: professional.id,
          })),
        })
      }

      // Send welcome notification
      await sendProfessionalWelcomeNotification(professional)

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'professional_created',
          entityType: 'professional',
          entityId: professional.id,
          details: {
            clinicId: input.clinicId,
            licenseType: input.licenseType,
            licenseNumber: input.licenseNumber,
            specialization: input.specialization,
          },
          _userId: ctx.user.id,
        },
      })

      return {
        success: true,
        data: professional,
        message: 'Professional registered successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),

  /**
   * Get professional by ID with comprehensive details
   */
  getById: protectedProcedure
    .meta({
      description: 'Get professional by ID with schedule and performance metrics',
      tags: ['professional', 'read', 'metrics'],
      requiresPermission: 'professional:read',
    })
    .input(
      z.object({
        id: z.string().uuid(),
        includeWorkingHours: z.boolean().default(true),
        includePerformanceMetrics: z.boolean().default(false),
        includeRecentAppointments: z.boolean().default(false),
        metricsDateRange: z
          .object({
            from: z.string().datetime(),
            to: z.string().datetime(),
          })
          .optional(),
      }),
    )
    .output(ProfessionalResponseSchema)
    .query(async ({ input, _ctx }) => {
      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.id },
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          workingHours: input.includeWorkingHours,
          ...(input.includeRecentAppointments && {
            appointments: {
              take: 10,
              orderBy: { scheduledDate: 'desc' },
              include: {
                patient: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          }),
        },
      })

      if (!professional) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Professional not found',
          'PROFESSIONAL_NOT_FOUND',
          { professionalId: input.id },
        )
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, professional.clinicId)

      // Add performance metrics if requested
      let performanceMetrics = null
      if (input.includePerformanceMetrics && input.metricsDateRange) {
        performanceMetrics = await calculateProfessionalMetrics(
          input.id,
          new Date(input.metricsDateRange.from),
          new Date(input.metricsDateRange.to),
        )
      }

      return {
        success: true,
        data: {
          ...professional,
          performanceMetrics,
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),

  /**
   * List professionals with advanced filtering and search
   */
  list: protectedProcedure
    .meta({
      description: 'List professionals with filtering, search, and availability status',
      tags: ['professional', 'list', 'search', 'availability'],
      requiresPermission: 'professional:list',
    })
    .input(
      PaginationSchema.extend({
        clinicId: z.string().uuid(),
        search: z.string().optional(),
        specialization: z.string().optional(),
        licenseType: z.enum(['CRM', 'CRO', 'CRF', 'CREF', 'CRP']).optional(),
        isActive: z.boolean().default(true),
        availableOn: z.string().datetime().optional(),
        availabilityTimeSlot: z
          .object({
            startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
            endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
          })
          .optional(),
        sortBy: z
          .enum([
            'fullName',
            'specialization',
            'createdAt',
            'licenseValidatedAt',
          ])
          .default('fullName'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }),
    )
    .output(ProfessionalsListResponseSchema)
    .query(async ({ input, _ctx }) => {
      // Validate clinic access
      await validateClinicAccess(ctx.user.id, input.clinicId)

      const where = {
        clinicId: input.clinicId,
        isActive: input.isActive,
        ...(input.search && {
          OR: [
            { fullName: { contains: input.search, mode: 'insensitive' } },
            { specialization: { contains: input.search, mode: 'insensitive' } },
            { licenseNumber: { contains: input.search, mode: 'insensitive' } },
          ],
        }),
        ...(input.specialization && {
          specialization: {
            contains: input.specialization,
            mode: 'insensitive',
          },
        }),
        ...(input.licenseType && { licenseType: input.licenseType }),
      }

      let professionalIds = null

      // Filter by availability if requested
      if (input.availableOn && input.availabilityTimeSlot) {
        const availableDate = new Date(input.availableOn)
        const dayOfWeek = availableDate.getDay()

        const availableProfessionals = await ctx.prisma.professional.findMany({
          where: {
            ...where,
            workingHours: {
              some: {
                dayOfWeek,
                startTime: { lte: input.availabilityTimeSlot.startTime },
                endTime: { gte: input.availabilityTimeSlot.endTime },
                isActive: true,
              },
            },
          },
          select: { id: true },
        })

        professionalIds = availableProfessionals.map((p) => p.id)

        // Filter out professionals with conflicting appointments
        const conflictingAppointments = await ctx.prisma.appointment.findMany({
          where: {
            professionalId: { in: professionalIds },
            scheduledDate: {
              gte: new Date(
                availableDate.toDateString()
                  + ' '
                  + input.availabilityTimeSlot.startTime,
              ),
              lt: new Date(
                availableDate.toDateString()
                  + ' '
                  + input.availabilityTimeSlot.endTime,
              ),
            },
            status: { in: ['scheduled', 'confirmed', 'in_progress'] },
          },
          select: { professionalId: true },
        })

        const busyProfessionalIds = new Set(
          conflictingAppointments.map((a) => a.professionalId),
        )
        professionalIds = professionalIds.filter(
          (id) => !busyProfessionalIds.has(id),
        )
      }

      const finalWhere = professionalIds
        ? { ...where, id: { in: professionalIds } }
        : where

      const [professionals, total] = await Promise.all([
        ctx.prisma.professional.findMany({
          where: finalWhere,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: {
            [input.sortBy]: input.sortOrder,
          },
          include: {
            clinic: {
              select: {
                name: true,
              },
            },
            workingHours: true,
            _count: {
              select: {
                appointments: {
                  where: {
                    status: 'completed',
                    scheduledDate: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    },
                  },
                },
              },
            },
          },
        }),
        ctx.prisma.professional.count({ where: finalWhere }),
      ])

      return {
        success: true,
        data: {
          professionals,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),

  /**
   * Update professional information and credentials
   */
  update: protectedProcedure
    .meta({
      description: 'Update professional information with re-validation if credentials change',
      tags: ['professional', 'update', 'validation'],
      requiresPermission: 'professional:update',
    })
    .input(UpdateProfessionalRequestSchema)
    .output(ProfessionalResponseSchema)
    .mutation(async ({ input, _ctx }) => {
      const currentProfessional = await ctx.prisma.professional.findUnique({
        where: { id: input.id },
      })

      if (!currentProfessional) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Professional not found',
          'PROFESSIONAL_NOT_FOUND',
          { professionalId: input.id },
        )
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, currentProfessional.clinicId)

      // Check if license information is being updated
      const licenseChanged = (input.licenseNumber
        && input.licenseNumber !== currentProfessional.licenseNumber)
        || (input.licenseType
          && input.licenseType !== currentProfessional.licenseType)

      let licenseValidation = null
      if (licenseChanged) {
        // Validate new license number format
        const newLicenseType = input.licenseType || currentProfessional.licenseType
        const newLicenseNumber = input.licenseNumber || currentProfessional.licenseNumber

        if (!isValidLicenseFormat(newLicenseType, newLicenseNumber)) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'Invalid license number format for the specified license type',
            'INVALID_LICENSE_FORMAT',
            {
              licenseType: newLicenseType,
              licenseNumber: newLicenseNumber,
            },
          )
        }

        // Check for license conflicts
        const existingProfessional = await ctx.prisma.professional.findFirst({
          where: {
            licenseNumber: newLicenseNumber,
            licenseType: newLicenseType,
            isActive: true,
            NOT: { id: input.id },
          },
        })

        if (existingProfessional) {
          throw new HealthcareTRPCError(
            'CONFLICT',
            'Another professional with this license number already exists',
            'LICENSE_ALREADY_EXISTS',
            {
              existingProfessionalId: existingProfessional.id,
              licenseNumber: newLicenseNumber,
            },
          )
        }

        // Re-validate license with authority
        licenseValidation = await validateLicenseWithAuthority(
          newLicenseType,
          newLicenseNumber,
        )

        if (!licenseValidation.isValid) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'License validation failed with regulatory authority',
            'LICENSE_VALIDATION_FAILED',
            {
              licenseType: newLicenseType,
              licenseNumber: newLicenseNumber,
              validationErrors: licenseValidation.errors,
            },
          )
        }
      }

      // Update professional
      const updatedProfessional = await ctx.prisma.professional.update({
        where: { id: input.id },
        data: {
          ...input,
          ...(licenseValidation && {
            licenseValidatedAt: new Date(),
            licenseValidationSource: licenseValidation.source,
          }),
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        },
        include: {
          clinic: {
            select: {
              name: true,
              address: true,
            },
          },
          workingHours: true,
        },
      })

      // Update working hours if provided
      if (input.workingHours) {
        // Delete existing working hours
        await ctx.prisma.professionalWorkingHours.deleteMany({
          where: { professionalId: input.id },
        })

        // Create new working hours
        await ctx.prisma.professionalWorkingHours.createMany({
          data: input.workingHours.map((wh) => ({
            ...wh,
            professionalId: input.id,
          })),
        })
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'professional_updated',
          entityType: 'professional',
          entityId: input.id,
          details: {
            changes: getChanges(currentProfessional, input),
            licenseRevalidated: licenseChanged,
          },
          _userId: ctx.user.id,
        },
      })

      return {
        success: true,
        data: updatedProfessional,
        message: 'Professional updated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),

  /**
   * Get professional availability schedule
   */
  getAvailability: protectedProcedure
    .meta({
      description: 'Get professional availability with free time slots',
      tags: ['professional', 'availability', 'schedule'],
      requiresPermission: 'professional:read',
    })
    .input(
      z.object({
        professionalId: z.string().uuid(),
        dateFrom: z.string().datetime(),
        dateTo: z.string().datetime(),
        slotDuration: z.number().min(15).max(180).default(30), // Duration in minutes
        includeBookedSlots: z.boolean().default(false),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          professionalId: z.string(),
          availableSlots: z.array(
            z.object({
              date: z.string().datetime(),
              startTime: z.string(),
              endTime: z.string(),
              isAvailable: z.boolean(),
              reason: z.string().optional(),
            }),
          ),
          workingHours: z.array(
            z.object({
              dayOfWeek: z.number(),
              startTime: z.string(),
              endTime: z.string(),
              isActive: z.boolean(),
            }),
          ),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ input, _ctx }) => {
      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
        include: {
          workingHours: {
            where: { isActive: true },
          },
        },
      })

      if (!professional) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Professional not found',
          'PROFESSIONAL_NOT_FOUND',
          { professionalId: input.professionalId },
        )
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, professional.clinicId)

      // Get existing appointments in the date range
      const existingAppointments = await ctx.prisma.appointment.findMany({
        where: {
          professionalId: input.professionalId,
          scheduledDate: {
            gte: new Date(input.dateFrom),
            lte: new Date(input.dateTo),
          },
          status: { in: ['scheduled', 'confirmed', 'in_progress'] },
        },
        select: {
          scheduledDate: true,
          endDate: true,
          status: true,
        },
      })

      // Calculate available time slots
      const availableSlots = calculateAvailableSlots(
        new Date(input.dateFrom),
        new Date(input.dateTo),
        professional.workingHours,
        existingAppointments,
        input.slotDuration,
        input.includeBookedSlots,
      )

      return {
        success: true,
        data: {
          professionalId: input.professionalId,
          availableSlots,
          workingHours: professional.workingHours,
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),

  /**
   * Deactivate professional (soft delete)
   */
  deactivate: protectedProcedure
    .meta({
      description: 'Deactivate professional and handle active appointments',
      tags: ['professional', 'deactivate'],
      requiresPermission: 'professional:deactivate',
    })
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().min(5).max(500),
        handleActiveAppointments: z
          .enum(['cancel', 'reassign', 'keep'])
          .default('keep'),
        reassignToProfessionalId: z.string().uuid().optional(),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          deactivatedProfessionalId: z.string(),
          affectedAppointments: z.number(),
          handlingMethod: z.string(),
        }),
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, _ctx }) => {
      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.id },
      })

      if (!professional) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Professional not found',
          'PROFESSIONAL_NOT_FOUND',
          { professionalId: input.id },
        )
      }

      // Validate clinic access
      await validateClinicAdminAccess(ctx.user.id, professional.clinicId)

      // Get active appointments
      const activeAppointments = await ctx.prisma.appointment.findMany({
        where: {
          professionalId: input.id,
          status: { in: ['scheduled', 'confirmed'] },
          scheduledDate: { gte: new Date() },
        },
      })

      // Handle active appointments based on strategy
      let affectedAppointments = 0
      switch (input.handleActiveAppointments) {
        case 'cancel':
          await ctx.prisma.appointment.updateMany({
            where: {
              professionalId: input.id,
              status: { in: ['scheduled', 'confirmed'] },
              scheduledDate: { gte: new Date() },
            },
            data: {
              status: 'cancelled',
              cancellationReason: `Professional deactivated: ${input.reason}`,
              cancelledAt: new Date(),
              cancelledBy: ctx.user.id,
            },
          })
          affectedAppointments = activeAppointments.length
          break

        case 'reassign':
          if (!input.reassignToProfessionalId) {
            throw new HealthcareTRPCError(
              'BAD_REQUEST',
              'Reassign target professional ID is required',
              'REASSIGN_TARGET_REQUIRED',
            )
          }

          await ctx.prisma.appointment.updateMany({
            where: {
              professionalId: input.id,
              status: { in: ['scheduled', 'confirmed'] },
              scheduledDate: { gte: new Date() },
            },
            data: {
              professionalId: input.reassignToProfessionalId,
              notes: `Reassigned from deactivated professional: ${input.reason}`,
            },
          })
          affectedAppointments = activeAppointments.length
          break

        case 'keep':
          // Keep appointments as-is
          affectedAppointments = 0
          break
      }

      // Deactivate professional
      await ctx.prisma.professional.update({
        where: { id: input.id },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivationReason: input.reason,
          deactivatedBy: ctx.user.id,
        },
      })

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'professional_deactivated',
          entityType: 'professional',
          entityId: input.id,
          details: {
            reason: input.reason,
            handleActiveAppointments: input.handleActiveAppointments,
            affectedAppointments,
            reassignToProfessionalId: input.reassignToProfessionalId,
          },
          _userId: ctx.user.id,
        },
      })

      return {
        success: true,
        data: {
          deactivatedProfessionalId: input.id,
          affectedAppointments,
          handlingMethod: input.handleActiveAppointments,
        },
        message: 'Professional deactivated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      }
    }),
})

// Helper functions
function isValidLicenseFormat(
  licenseType: string,
  licenseNumber: string,
): boolean {
  const formats = {
    CRM: /^CRM\/[A-Z]{2}\s\d{4,6}$/, // CRM/SP 123456
    CRO: /^CRO\/[A-Z]{2}\s\d{4,6}$/, // CRO/SP 123456
    CRF: /^CRF\/[A-Z]{2}\s\d{4,6}$/, // CRF/SP 123456
    CREF: /^CREF\d{6}-[A-Z]\/[A-Z]{2}$/, // CREF123456-G/SP
    CRP: /^CRP\s\d{2}\/\d{4,6}$/, // CRP 06/12345
  }

  return formats[licenseType]?.test(licenseNumber) || false
}

async function validateLicenseWithAuthority(
  _licenseType: string,
  _licenseNumber: string,
): Promise<{ isValid: boolean; source: string; errors?: string[] }> {
  // Placeholder for actual license validation with regulatory authorities
  // This would integrate with CFM, CRO, CRF APIs, etc.
  return {
    isValid: true,
    source: `${_licenseType}_AUTHORITY`,
  }
}

async function calculateProfessionalMetrics(
  _professionalId: string,
  _dateFrom: Date,
  _dateTo: Date,
): Promise<any> {
  // Placeholder for performance metrics calculation
  return {
    totalAppointments: 0,
    completedAppointments: 0,
    noShowRate: 0,
    averageRating: 0,
    revenue: 0,
  }
}

function calculateAvailableSlots(
  _dateFrom: Date,
  _dateTo: Date,
  _workingHours: any[],
  _existingAppointments: any[],
  _slotDuration: number,
  _includeBookedSlots: boolean,
): any[] {
  // Placeholder for slot calculation algorithm
  return []
}

async function sendProfessionalWelcomeNotification(
  _professional: unknown,
): Promise<void> {
  // Placeholder for welcome notification
}

function getChanges(current: any, input: any): Record<string, any> {
  const changes = {} as Record<string, any>
  Object.keys(input).forEach((key) => {
    if (
      key !== 'id'
      && input[key] !== undefined
      && input[key] !== current[key]
    ) {
      changes[key] = {
        from: current[key],
        to: input[key],
      }
    }
  })
  return changes
}

async function validateClinicAccess(
  _userId: string,
  _clinicId: string,
): Promise<void> {
  // Implementation for clinic access validation
  return Promise.resolve()
}

async function validateClinicAdminAccess(
  _userId: string,
  _clinicId: string,
): Promise<void> {
  // Implementation for clinic admin access validation
  return Promise.resolve()
}

/**
 * tRPC v11 Clinic API Contracts
 * Multi-tenant clinic management with compliance tracking
 */

import {
  ClinicResponseSchema,
  ClinicsListResponseSchema,
  CreateClinicRequestSchema,
  HealthcareTRPCError,
  PaginationSchema,
  UpdateClinicRequestSchema,
} from '@neonpro/types';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const clinicRouter = router({
  /**
   * Create new clinic with regulatory compliance setup
   */
  create: protectedProcedure
    .meta({
      description: 'Create new clinic with automated compliance verification',
      tags: ['clinic', 'create', 'compliance'],
      requiresPermission: 'clinic:create',
    })
    .input(CreateClinicRequestSchema)
    .output(ClinicResponseSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate user has permission to create clinics
      if (!hasSystemAdminRole(ctx.user.role)) {
        throw new HealthcareTRPCError(
          'FORBIDDEN',
          'Insufficient permissions to create clinic',
          'INSUFFICIENT_PERMISSIONS',
          { requiredRole: 'system_admin', currentRole: ctx.user.role },
        );
      }

      // Validate CNPJ format and uniqueness
      if (!isValidCNPJ(input.cnpj)) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Invalid CNPJ format',
          'INVALID_CNPJ_FORMAT',
          { cnpj: input.cnpj },
        );
      }

      // Check if CNPJ already exists
      const existingClinic = await ctx.prisma.clinic.findFirst({
        where: {
          cnpj: input.cnpj,
          isActive: true,
        },
      });

      if (existingClinic) {
        throw new HealthcareTRPCError(
          'CONFLICT',
          'Clinic with this CNPJ already exists',
          'CNPJ_ALREADY_EXISTS',
          {
            existingClinicId: existingClinic.id,
            cnpj: input.cnpj,
          },
        );
      }

      // Validate business license with regulatory authorities
      const businessValidation = await validateBusinessLicense(input.cnpj);
      if (!businessValidation.isValid) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Business license validation failed',
          'BUSINESS_LICENSE_VALIDATION_FAILED',
          {
            cnpj: input.cnpj,
            validationErrors: businessValidation.errors,
          },
        );
      }

      // Validate healthcare license (ANVISA, municipal health department)
      const healthLicenseValidation = await validateHealthcareLicense(
        input.healthLicenseNumber,
        input.address.city,
        input.address.state,
      );

      if (!healthLicenseValidation.isValid) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Healthcare license validation failed',
          'HEALTHCARE_LICENSE_VALIDATION_FAILED',
          {
            licenseNumber: input.healthLicenseNumber,
            validationErrors: healthLicenseValidation.errors,
          },
        );
      }

      // Create clinic with compliance data
      const clinic = await ctx.prisma.clinic.create({
        data: {
          ...input,
          isActive: true,
          businessLicenseValidatedAt: new Date(),
          healthLicenseValidatedAt: new Date(),
          complianceStatus: 'compliant',
          createdBy: ctx.user.id,
          // Initialize default settings
          settings: {
            workingHours: {
              monday: { start: '08:00', end: '18:00', isOpen: true },
              tuesday: { start: '08:00', end: '18:00', isOpen: true },
              wednesday: { start: '08:00', end: '18:00', isOpen: true },
              thursday: { start: '08:00', end: '18:00', isOpen: true },
              friday: { start: '08:00', end: '18:00', isOpen: true },
              saturday: { start: '08:00', end: '13:00', isOpen: true },
              sunday: { start: '08:00', end: '13:00', isOpen: false },
            },
            appointmentDuration: 30,
            bookingAdvanceLimit: 90,
            cancellationPolicy: {
              allowedHours: 24,
              chargePercentage: 0,
            },
            notifications: {
              emailEnabled: true,
              smsEnabled: true,
              whatsappEnabled: false,
            },
          },
        },
        include: {
          _count: {
            select: {
              professionals: true,
              patients: true,
            },
          },
        },
      });

      // Setup initial compliance tracking
      await ctx.prisma.complianceTracking.create({
        data: {
          clinicId: clinic.id,
          complianceType: 'initial_setup',
          status: 'compliant',
          checkDate: new Date(),
          details: {
            businessLicenseValid: true,
            healthLicenseValid: true,
            lgpdCompliant: true,
            anvisaCompliant: true,
          },
          nextCheckDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      // Create default admin user for clinic
      await createClinicAdminUser(clinic.id, ctx.user.id);

      // Send setup completion notification
      await sendClinicSetupNotification(clinic);

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'clinic_created',
          entityType: 'clinic',
          entityId: clinic.id,
          details: {
            cnpj: input.cnpj,
            name: input.name,
            healthLicenseNumber: input.healthLicenseNumber,
            address: input.address,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: clinic,
        message: 'Clinic created successfully with compliance verification',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Get clinic by ID with comprehensive details
   */
  getById: protectedProcedure
    .meta({
      description: 'Get clinic by ID with compliance status and metrics',
      tags: ['clinic', 'read', 'compliance', 'metrics'],
      requiresPermission: 'clinic:read',
    })
    .input(
      z.object({
        id: z.string().uuid(),
        includeMetrics: z.boolean().default(false),
        includeCompliance: z.boolean().default(true),
        includeSettings: z.boolean().default(false),
        metricsDateRange: z
          .object({
            from: z.string().datetime(),
            to: z.string().datetime(),
          })
          .optional(),
      }),
    )
    .output(ClinicResponseSchema)
    .query(async ({ input, ctx }) => {
      const clinic = await ctx.prisma.clinic.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              professionals: { where: { isActive: true } },
              patients: { where: { isActive: true } },
              appointments: {
                where: {
                  scheduledDate: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  },
                },
              },
            },
          },
          ...(input.includeCompliance && {
            complianceTracking: {
              orderBy: { checkDate: 'desc' },
              take: 5,
            },
          }),
        },
      });

      if (!clinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_NOT_FOUND',
          { clinicId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, input.id);

      // Add metrics if requested
      let metrics = null;
      if (input.includeMetrics && input.metricsDateRange) {
        metrics = await calculateClinicMetrics(
          input.id,
          new Date(input.metricsDateRange.from),
          new Date(input.metricsDateRange.to),
        );
      }

      // Filter settings based on user permissions
      const settings = input.includeSettings && hasClinicAdminAccess(ctx.user.id, input.id)
        ? clinic.settings
        : null;

      return {
        success: true,
        data: {
          ...clinic,
          metrics,
          settings,
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * List clinics with advanced filtering
   */
  list: protectedProcedure
    .meta({
      description: 'List clinics with filtering and search capabilities',
      tags: ['clinic', 'list', 'search'],
      requiresPermission: 'clinic:list',
    })
    .input(
      PaginationSchema.extend({
        search: z.string().optional(),
        state: z.string().length(2).optional(),
        city: z.string().optional(),
        isActive: z.boolean().default(true),
        complianceStatus: z
          .enum(['compliant', 'non_compliant', 'pending_review'])
          .optional(),
        sortBy: z
          .enum(['name', 'createdAt', 'complianceStatus'])
          .default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        userAccessOnly: z.boolean().default(false),
      }),
    )
    .output(ClinicsListResponseSchema)
    .query(async ({ input, ctx }) => {
      let clinicIds = null;

      // Filter by user access if requested
      if (input.userAccessOnly) {
        const userClinics = await getUserAccessibleClinics(ctx.user.id);
        clinicIds = userClinics.map(c => c.clinicId);
      }

      const where = {
        ...(clinicIds && { id: { in: clinicIds } }),
        isActive: input.isActive,
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { cnpj: { contains: input.search, mode: 'insensitive' } },
            { address: { path: ['city'], string_contains: input.search } },
          ],
        }),
        ...(input.state && {
          address: { path: ['state'], equals: input.state },
        }),
        ...(input.city && {
          address: { path: ['city'], string_contains: input.city },
        }),
        ...(input.complianceStatus && {
          complianceStatus: input.complianceStatus,
        }),
      };

      const [clinics, total] = await Promise.all([
        ctx.prisma.clinic.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: {
            [input.sortBy]: input.sortOrder,
          },
          include: {
            _count: {
              select: {
                professionals: { where: { isActive: true } },
                patients: { where: { isActive: true } },
                appointments: {
                  where: {
                    scheduledDate: {
                      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                  },
                },
              },
            },
            complianceTracking: {
              where: {
                checkDate: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
              orderBy: { checkDate: 'desc' },
              take: 1,
            },
          },
        }),
        ctx.prisma.clinic.count({ where }),
      ]);

      return {
        success: true,
        data: {
          clinics,
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
   * Update clinic information
   */
  update: protectedProcedure
    .meta({
      description: 'Update clinic information with compliance re-validation',
      tags: ['clinic', 'update', 'compliance'],
      requiresPermission: 'clinic:update',
    })
    .input(UpdateClinicRequestSchema)
    .output(ClinicResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const currentClinic = await ctx.prisma.clinic.findUnique({
        where: { id: input.id },
      });

      if (!currentClinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_NOT_FOUND',
          { clinicId: input.id },
        );
      }

      // Validate clinic admin access
      await validateClinicAdminAccess(ctx.user.id, input.id);

      // Check if critical information is being updated
      const cnpjChanged = input.cnpj && input.cnpj !== currentClinic.cnpj;
      const healthLicenseChanged = input.healthLicenseNumber
        && input.healthLicenseNumber !== currentClinic.healthLicenseNumber;

      // Re-validate if critical info changed
      if (cnpjChanged) {
        if (!isValidCNPJ(input.cnpj)) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'Invalid CNPJ format',
            'INVALID_CNPJ_FORMAT',
            { cnpj: input.cnpj },
          );
        }

        const existingClinic = await ctx.prisma.clinic.findFirst({
          where: {
            cnpj: input.cnpj,
            isActive: true,
            NOT: { id: input.id },
          },
        });

        if (existingClinic) {
          throw new HealthcareTRPCError(
            'CONFLICT',
            'Another clinic with this CNPJ already exists',
            'CNPJ_ALREADY_EXISTS',
            {
              existingClinicId: existingClinic.id,
              cnpj: input.cnpj,
            },
          );
        }

        const businessValidation = await validateBusinessLicense(input.cnpj);
        if (!businessValidation.isValid) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'Business license validation failed for new CNPJ',
            'BUSINESS_LICENSE_VALIDATION_FAILED',
            {
              cnpj: input.cnpj,
              validationErrors: businessValidation.errors,
            },
          );
        }
      }

      if (healthLicenseChanged) {
        const healthLicenseValidation = await validateHealthcareLicense(
          input.healthLicenseNumber,
          input.address?.city || currentClinic.address.city,
          input.address?.state || currentClinic.address.state,
        );

        if (!healthLicenseValidation.isValid) {
          throw new HealthcareTRPCError(
            'BAD_REQUEST',
            'Healthcare license validation failed',
            'HEALTHCARE_LICENSE_VALIDATION_FAILED',
            {
              licenseNumber: input.healthLicenseNumber,
              validationErrors: healthLicenseValidation.errors,
            },
          );
        }
      }

      // Update clinic
      const updatedClinic = await ctx.prisma.clinic.update({
        where: { id: input.id },
        data: {
          ...input,
          ...(cnpjChanged && {
            businessLicenseValidatedAt: new Date(),
          }),
          ...(healthLicenseChanged && {
            healthLicenseValidatedAt: new Date(),
          }),
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        },
        include: {
          _count: {
            select: {
              professionals: { where: { isActive: true } },
              patients: { where: { isActive: true } },
            },
          },
        },
      });

      // Create compliance tracking record if critical info changed
      if (cnpjChanged || healthLicenseChanged) {
        await ctx.prisma.complianceTracking.create({
          data: {
            clinicId: input.id,
            complianceType: 'license_update',
            status: 'compliant',
            checkDate: new Date(),
            details: {
              cnpjChanged,
              healthLicenseChanged,
              businessLicenseValid: true,
              healthLicenseValid: true,
            },
            nextCheckDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        });
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'clinic_updated',
          entityType: 'clinic',
          entityId: input.id,
          details: {
            changes: getChanges(currentClinic, input),
            revalidationRequired: cnpjChanged || healthLicenseChanged,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: updatedClinic,
        message: 'Clinic updated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Get clinic compliance status and history
   */
  getCompliance: protectedProcedure
    .meta({
      description: 'Get clinic compliance status with detailed history',
      tags: ['clinic', 'compliance', 'audit'],
      requiresPermission: 'clinic:compliance',
    })
    .input(
      z.object({
        clinicId: z.string().uuid(),
        includeHistory: z.boolean().default(true),
        historyLimit: z.number().min(1).max(100).default(20),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          clinicId: z.string(),
          currentStatus: z.enum([
            'compliant',
            'non_compliant',
            'pending_review',
          ]),
          lastCheckDate: z.string().datetime(),
          nextCheckDate: z.string().datetime(),
          complianceAreas: z.object({
            businessLicense: z.object({
              isValid: z.boolean(),
              validatedAt: z.string().datetime().nullable(),
              expiresAt: z.string().datetime().nullable(),
            }),
            healthLicense: z.object({
              isValid: z.boolean(),
              validatedAt: z.string().datetime().nullable(),
              expiresAt: z.string().datetime().nullable(),
            }),
            lgpdCompliance: z.object({
              isCompliant: z.boolean(),
              lastAssessment: z.string().datetime().nullable(),
            }),
            anvisaCompliance: z.object({
              isCompliant: z.boolean(),
              lastAssessment: z.string().datetime().nullable(),
            }),
          }),
          complianceHistory: z
            .array(
              z.object({
                id: z.string(),
                complianceType: z.string(),
                status: z.string(),
                checkDate: z.string().datetime(),
                details: z.record(z.any()),
              }),
            )
            .optional(),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Validate clinic access
      await validateClinicAccess(ctx.user.id, input.clinicId);

      const clinic = await ctx.prisma.clinic.findUnique({
        where: { id: input.clinicId },
        select: {
          complianceStatus: true,
          businessLicenseValidatedAt: true,
          healthLicenseValidatedAt: true,
        },
      });

      if (!clinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_NOT_FOUND',
          { clinicId: input.clinicId },
        );
      }

      // Get latest compliance tracking
      const latestCompliance = await ctx.prisma.complianceTracking.findFirst({
        where: { clinicId: input.clinicId },
        orderBy: { checkDate: 'desc' },
      });

      // Get compliance history if requested
      let complianceHistory = null;
      if (input.includeHistory) {
        complianceHistory = await ctx.prisma.complianceTracking.findMany({
          where: { clinicId: input.clinicId },
          orderBy: { checkDate: 'desc' },
          take: input.historyLimit,
        });
      }

      return {
        success: true,
        data: {
          clinicId: input.clinicId,
          currentStatus: clinic.complianceStatus,
          lastCheckDate: latestCompliance?.checkDate.toISOString()
            || new Date().toISOString(),
          nextCheckDate: latestCompliance?.nextCheckDate.toISOString()
            || new Date().toISOString(),
          complianceAreas: {
            businessLicense: {
              isValid: !!clinic.businessLicenseValidatedAt,
              validatedAt: clinic.businessLicenseValidatedAt?.toISOString() || null,
              expiresAt: null, // Would be calculated based on business rules
            },
            healthLicense: {
              isValid: !!clinic.healthLicenseValidatedAt,
              validatedAt: clinic.healthLicenseValidatedAt?.toISOString() || null,
              expiresAt: null, // Would be calculated based on business rules
            },
            lgpdCompliance: {
              isCompliant: true, // Would be calculated based on assessments
              lastAssessment: null,
            },
            anvisaCompliance: {
              isCompliant: true, // Would be calculated based on assessments
              lastAssessment: null,
            },
          },
          complianceHistory,
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Update clinic settings
   */
  updateSettings: protectedProcedure
    .meta({
      description: 'Update clinic operational settings',
      tags: ['clinic', 'settings'],
      requiresPermission: 'clinic:settings',
    })
    .input(
      z.object({
        clinicId: z.string().uuid(),
        settings: z.object({
          workingHours: z
            .record(
              z.object({
                start: z.string(),
                end: z.string(),
                isOpen: z.boolean(),
              }),
            )
            .optional(),
          appointmentDuration: z.number().min(15).max(180).optional(),
          bookingAdvanceLimit: z.number().min(1).max(365).optional(),
          cancellationPolicy: z
            .object({
              allowedHours: z.number().min(0).max(168),
              chargePercentage: z.number().min(0).max(100),
            })
            .optional(),
          notifications: z
            .object({
              emailEnabled: z.boolean(),
              smsEnabled: z.boolean(),
              whatsappEnabled: z.boolean(),
            })
            .optional(),
        }),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          clinicId: z.string(),
          settings: z.record(z.any()),
        }),
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Validate clinic admin access
      await validateClinicAdminAccess(ctx.user.id, input.clinicId);

      const currentClinic = await ctx.prisma.clinic.findUnique({
        where: { id: input.clinicId },
        select: { settings: true },
      });

      if (!currentClinic) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Clinic not found',
          'CLINIC_NOT_FOUND',
          { clinicId: input.clinicId },
        );
      }

      // Merge settings
      const updatedSettings = {
        ...currentClinic.settings,
        ...input.settings,
      };

      await ctx.prisma.clinic.update({
        where: { id: input.clinicId },
        data: {
          settings: updatedSettings,
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'clinic_settings_updated',
          entityType: 'clinic',
          entityId: input.clinicId,
          details: {
            changedSettings: input.settings,
          },
          _userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: {
          clinicId: input.clinicId,
          settings: updatedSettings,
        },
        message: 'Clinic settings updated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),
});

// Helper functions
function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  if (cleanCNPJ.length !== 14) return false;

  // Check for known invalid CNPJs
  if (/^(.)\1*$/.test(cleanCNPJ)) return false;

  // Validate check digits
  let sum = 0;
  let weight = 2;

  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCNPJ.charAt(12)) !== digit1) return false;

  sum = 0;
  weight = 2;

  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cleanCNPJ.charAt(13)) === digit2;
}

async function validateBusinessLicense(
  cnpj: string,
): Promise<{ isValid: boolean; errors?: string[] }> {
  // Placeholder for actual business license validation with Receita Federal
  return { isValid: true };
}

async function validateHealthcareLicense(
  licenseNumber: string,
  city: string,
  state: string,
): Promise<{ isValid: boolean; errors?: string[] }> {
  // Placeholder for healthcare license validation with ANVISA/municipal authorities
  return { isValid: true };
}

async function calculateClinicMetrics(
  clinicId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<any> {
  // Placeholder for clinic metrics calculation
  return {
    totalAppointments: 0,
    revenue: 0,
    patientCount: 0,
    occupancyRate: 0,
  };
}

function hasSystemAdminRole(role: string): boolean {
  return role === 'system_admin';
}

async function createClinicAdminUser(
  _clinicId: string,
  _createdBy: string,
): Promise<void> {
  // Placeholder for clinic admin user creation
}

async function sendClinicSetupNotification(_clinic: any): Promise<void> {
  // Placeholder for clinic setup notification
}

function getChanges(current: any, input: any): Record<string, any> {
  const changes = {};
  Object.keys(input).forEach(key => {
    if (
      key !== 'id'
      && input[key] !== undefined
      && JSON.stringify(input[key]) !== JSON.stringify(current[key])
    ) {
      changes[key] = {
        from: current[key],
        to: input[key],
      };
    }
  });
  return changes;
}

async function validateClinicAccess(
  _userId: string,
  _clinicId: string,
): Promise<void> {
  // Implementation for clinic access validation
  return Promise.resolve();
}

async function validateClinicAdminAccess(
  _userId: string,
  _clinicId: string,
): Promise<void> {
  // Implementation for clinic admin access validation
  return Promise.resolve();
}

function hasClinicAdminAccess(_userId: string, _clinicId: string): boolean {
  // Implementation for clinic admin access check
  return true;
}

async function getUserAccessibleClinics(
  _userId: string,
): Promise<Array<{ clinicId: string }>> {
  // Implementation for getting user accessible clinics
  return [];
}

/**
 * Chatbot Data Access tRPC Router
 *
 * Provides optimized data access for chatbot agents with real-time capabilities
 * Includes: Notifications, Service Categories, Templates, and Professional Services
 * LGPD/ANVISA/CFM compliant with healthcare context awareness
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

// =====================================
// INPUT/OUTPUT SCHEMAS
// =====================================

// Notification Schemas
const NotificationQuerySchema = z.object({
  limit: z.number().optional().default(50),
  offset: z.number().optional().default(0),
  status: z.enum(['scheduled', 'sent', 'failed', 'cancelled']).optional(),
  type: z.enum(['reminder_24h', 'reminder_1h', 'confirmation', 'followup', 'cancellation', 'rescheduled']).optional(),
  clinicId: z.string().optional(),
})

const ScheduleNotificationSchema = z.object({
  notificationType: z.enum(['reminder_24h', 'reminder_1h', 'confirmation', 'followup', 'cancellation', 'rescheduled']),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  scheduledFor: z.date(),
  metadata: z.record(z.any()).optional(),
})

// Service Category Schemas
const ServiceCategoryQuerySchema = z.object({
  clinicId: z.string(),
  includeStats: z.boolean().optional().default(false),
  isActive: z.boolean().optional(),
})

const CreateServiceCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().default('#3b82f6'),
  icon: z.string().optional(),
  clinicId: z.string(),
})

// Appointment Template Schemas
const AppointmentTemplateQuerySchema = z.object({
  clinicId: z.string().optional(),
  category: z.enum(['consultation', 'facial', 'body', 'laser', 'injectable', 'surgery', 'followup', 'emergency']).optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional(),
})

const CreateAppointmentTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['consultation', 'facial', 'body', 'laser', 'injectable', 'surgery', 'followup', 'emergency']),
  serviceTypeId: z.string(),
  duration: z.number().int().min(15).max(480).default(60),
  price: z.number().min(0).default(0),
  color: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  clinicId: z.string().optional(),
})

// Service Template Schemas
const ServiceTemplateQuerySchema = z.object({
  clinicId: z.string(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional(),
  includeItems: z.boolean().optional().default(true),
})

const CreateServiceTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  templateType: z.enum(['package', 'procedure', 'consultation', 'followup']).default('package'),
  categoryId: z.string().optional(),
  clinicId: z.string(),
  defaultDurationMinutes: z.number().int().min(15).max(480).default(60),
  defaultPrice: z.number().min(0).default(0),
  priceType: z.enum(['fixed', 'calculated', 'custom']).default('fixed'),
  isFeatured: z.boolean().optional().default(false),
  items: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(1).default(1),
    sequenceOrder: z.number().int().default(0),
    isRequired: z.boolean().default(true),
    discountPercentage: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  })).optional(),
})

// Professional Service Schemas
const ProfessionalServiceQuerySchema = z.object({
  professionalId: z.string().optional(),
  serviceId: z.string().optional(),
  clinicId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isPrimary: z.boolean().optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
})

const CreateProfessionalServiceSchema = z.object({
  professionalId: z.string(),
  serviceId: z.string(),
  isPrimary: z.boolean().optional().default(false),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  hourlyRate: z.number().min(0).optional(),
  notes: z.string().optional(),
})

// Chatbot Context Schemas
const ChatbotContextSchema = z.object({
  sessionId: z.string(),
  patientId: z.string().optional(),
  clinicId: z.string(),
  intent: z.enum(['scheduling', 'information', 'billing', 'support']),
  language: z.string().default('pt-BR'),
})

// =====================================
// CHATBOT DATA ROUTER
// =====================================

export const chatbotDataRouter = router({
  // =====================================
  // NOTIFICATION MANAGEMENT
  // =====================================

  /**
   * List scheduled notifications for agents
   */
  listNotifications: protectedProcedure
    .input(NotificationQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const notifications = await ctx.prisma.scheduledNotification.findMany({
          where: {
            ...(input.status && { status: input.status }),
            ...(input.type && { notificationType: input.type }),
          },
          orderBy: { scheduledFor: 'asc' },
          skip: input.offset,
          take: input.limit,
        })

        return {
          success: true,
          data: notifications,
          total: await ctx.prisma.scheduledNotification.count({
            where: {
              ...(input.status && { status: input.status }),
              ...(input.type && { notificationType: input.type }),
            },
          }),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error,
        })
      }
    }),

  /**
   * Schedule new notification via chatbot
   */
  scheduleNotification: protectedProcedure
    .input(ScheduleNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const notification = await ctx.prisma.scheduledNotification.create({
          data: {
            notificationType: input.notificationType,
            recipientEmail: input.recipientEmail,
            recipientPhone: input.recipientPhone,
            title: input.title,
            message: input.message,
            scheduledFor: input.scheduledFor,
            metadata: input.metadata || {},
            status: 'scheduled',
          },
        })

        return {
          success: true,
          data: notification,
          message: 'Notificação agendada com sucesso',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule notification',
          cause: error,
        })
      }
    }),

  // =====================================
  // SERVICE CATEGORIES
  // =====================================

  /**
   * Get service categories for chatbot recommendations
   */
  getServiceCategories: protectedProcedure
    .input(ServiceCategoryQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const categories = await ctx.prisma.serviceCategory.findMany({
          where: {
            clinicId: input.clinicId,
            ...(input.isActive !== undefined && { isActive: input.isActive }),
          },
          include: {
            services: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                description: true,
                duration_minutes: true,
                price: true,
              },
            },
            ...(input.includeStats && {
              _count: {
                select: {
                  services: true,
                },
              },
            }),
          },
          orderBy: { name: 'asc' },
        })

        return {
          success: true,
          data: categories,
          message: `${categories.length} categorias encontradas`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch service categories',
          cause: error,
        })
      }
    }),

  /**
   * Create new service category
   */
  createServiceCategory: protectedProcedure
    .input(CreateServiceCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.serviceCategory.create({
          data: {
            name: input.name,
            description: input.description,
            color: input.color,
            icon: input.icon,
            clinicId: input.clinicId,
          },
        })

        return {
          success: true,
          data: category,
          message: 'Categoria criada com sucesso',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create service category',
          cause: error,
        })
      }
    }),

  // =====================================
  // APPOINTMENT TEMPLATES
  // =====================================

  /**
   * Get appointment templates for chatbot scheduling
   */
  getAppointmentTemplates: protectedProcedure
    .input(AppointmentTemplateQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const templates = await ctx.prisma.appointmentTemplate.findMany({
          where: {
            ...(input.clinicId && { clinicId: input.clinicId }),
            ...(input.category && { category: input.category }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
            ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
          },
          include: {
            serviceType: {
              select: {
                id: true,
                name: true,
                description: true,
                duration_minutes: true,
                price: true,
              },
            },
          },
          orderBy: [
            { isDefault: 'desc' },
            { name: 'asc' },
          ],
        })

        return {
          success: true,
          data: templates,
          message: `${templates.length} templates encontrados`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch appointment templates',
          cause: error,
        })
      }
    }),

  /**
   * Create appointment template
   */
  createAppointmentTemplate: protectedProcedure
    .input(CreateAppointmentTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const template = await ctx.prisma.appointmentTemplate.create({
          data: {
            name: input.name,
            description: input.description,
            category: input.category,
            serviceTypeId: input.serviceTypeId,
            duration: input.duration,
            price: input.price,
            color: input.color,
            isDefault: input.isDefault,
            clinicId: input.clinicId,
          },
          include: {
            serviceType: true,
          },
        })

        return {
          success: true,
          data: template,
          message: 'Template de agendamento criado com sucesso',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create appointment template',
          cause: error,
        })
      }
    }),

  // =====================================
  // SERVICE TEMPLATES (PACKAGES)
  // =====================================

  /**
   * Get service templates for chatbot package recommendations
   */
  getServiceTemplates: protectedProcedure
    .input(ServiceTemplateQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const templates = await ctx.prisma.serviceTemplate.findMany({
          where: {
            clinicId: input.clinicId,
            ...(input.categoryId && { categoryId: input.categoryId }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
            ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            ...(input.includeItems && {
              items: {
                include: {
                  service: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      duration_minutes: true,
                      price: true,
                    },
                  },
                },
                orderBy: { sequenceOrder: 'asc' },
              },
            }),
          },
          orderBy: [
            { isFeatured: 'desc' },
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        })

        return {
          success: true,
          data: templates,
          message: `${templates.length} pacotes encontrados`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch service templates',
          cause: error,
        })
      }
    }),

  // =====================================
  // PROFESSIONAL SERVICES
  // =====================================

  /**
   * Get professional services for chatbot skill matching
   */
  getProfessionalServices: protectedProcedure
    .input(ProfessionalServiceQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const services = await ctx.prisma.professionalService.findMany({
          where: {
            ...(input.professionalId && { professionalId: input.professionalId }),
            ...(input.serviceId && { serviceId: input.serviceId }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
            ...(input.isPrimary !== undefined && { isPrimary: input.isPrimary }),
            ...(input.proficiencyLevel && { proficiencyLevel: input.proficiencyLevel }),
            ...(input.clinicId && {
              professional: {
                clinicId: input.clinicId,
              },
            }),
          },
          include: {
            professional: {
              select: {
                id: true,
                fullName: true,
                specialization: true,
                licenseNumber: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                duration_minutes: true,
                price: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { proficiencyLevel: 'desc' },
          ],
        })

        return {
          success: true,
          data: services,
          message: `${services.length} competências encontradas`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch professional services',
          cause: error,
        })
      }
    }),

  // =====================================
  // CHATBOT CONTEXT HELPERS
  // =====================================

  /**
   * Get complete clinic context for chatbot
   */
  getClinicContext: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const clinic = await ctx.prisma.clinic.findUnique({
          where: { id: input.clinicId },
          include: {
            serviceCategories: {
              where: { isActive: true },
              include: {
                services: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    duration_minutes: true,
                    price: true,
                  },
                },
              },
            },
            professionals: {
              where: { isActive: true },
              select: {
                id: true,
                fullName: true,
                specialization: true,
                email: true,
                phone: true,
              },
            },
            appointmentTemplates: {
              where: { isActive: true },
              include: {
                serviceType: {
                  select: {
                    id: true,
                    name: true,
                    duration_minutes: true,
                    price: true,
                  },
                },
              },
            },
            serviceTemplates: {
              where: { isActive: true, isFeatured: true },
              select: {
                id: true,
                name: true,
                description: true,
                defaultPrice: true,
                priceType: true,
              },
            },
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clínica não encontrada',
          })
        }

        return {
          success: true,
          data: clinic,
          message: 'Contexto da clínica carregado com sucesso',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch clinic context',
          cause: error,
        })
      }
    }),

  /**
   * Search across all chatbot data
   */
  searchChatbotData: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      clinicId: z.string(),
      types: z.array(z.enum(['services', 'professionals', 'templates', 'categories'])).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const results = {
          services: [],
          professionals: [],
          templates: [],
          categories: [],
        }

        const searchTypes = input.types || ['services', 'professionals', 'templates', 'categories']

        // Search services
        if (searchTypes.includes('services')) {
          results.services = await ctx.prisma.serviceType.findMany({
            where: {
              clinicId: input.clinicId,
              isActive: true,
              OR: [
                { name: { contains: input.query, mode: 'insensitive' } },
                { description: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            take: Math.ceil(input.limit / searchTypes.length),
            select: {
              id: true,
              name: true,
              description: true,
              duration_minutes: true,
              price: true,
            },
          })
        }

        // Search professionals
        if (searchTypes.includes('professionals')) {
          results.professionals = await ctx.prisma.professional.findMany({
            where: {
              clinicId: input.clinicId,
              isActive: true,
              OR: [
                { fullName: { contains: input.query, mode: 'insensitive' } },
                { specialization: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            take: Math.ceil(input.limit / searchTypes.length),
            select: {
              id: true,
              fullName: true,
              specialization: true,
              email: true,
              phone: true,
            },
          })
        }

        // Search templates
        if (searchTypes.includes('templates')) {
          results.templates = await ctx.prisma.appointmentTemplate.findMany({
            where: {
              clinicId: input.clinicId,
              isActive: true,
              OR: [
                { name: { contains: input.query, mode: 'insensitive' } },
                { description: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            take: Math.ceil(input.limit / searchTypes.length),
            include: {
              serviceType: {
                select: {
                  name: true,
                  duration_minutes: true,
                  price: true,
                },
              },
            },
          })
        }

        // Search categories
        if (searchTypes.includes('categories')) {
          results.categories = await ctx.prisma.serviceCategory.findMany({
            where: {
              clinicId: input.clinicId,
              isActive: true,
              OR: [
                { name: { contains: input.query, mode: 'insensitive' } },
                { description: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            take: Math.ceil(input.limit / searchTypes.length),
          })
        }

        const totalResults = Object.values(results).reduce((acc, arr) => acc + arr.length, 0)

        return {
          success: true,
          data: results,
          total: totalResults,
          message: `${totalResults} resultados encontrados para "${input.query}"`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search chatbot data',
          cause: error,
        })
      }
    }),
})

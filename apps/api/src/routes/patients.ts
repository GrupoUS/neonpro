/**
 * Optimized Hono Patient Routes with Prisma and Real-time Capabilities
 * Healthcare-compliant API with LGPD audit logging
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '@neonpro/database'
import { BaseService } from '@neonpro/database/services'
import { cache } from 'hono/cache'
import { etag } from 'hono/etag'

const app = new Hono()

// Patient validation schemas
const PatientCreateSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  cpf: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  lgpdConsentGiven: z.boolean().default(false),
})

const PatientUpdateSchema = PatientCreateSchema.partial().extend({
  id: z.string().uuid(),
})

const PatientQuerySchema = z.object({
  clinicId: z.string().uuid(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 20, 100) : 20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional().default('active'),
})

class PatientService extends BaseService {
  async getPatients(
    clinicId: string, 
    userId: string, 
    options: {
      page: number
      limit: number
      search?: string
      status: string
    }
  ) {
    return this.withAuditLog(
      {
        operation: 'GET_PATIENTS',
        userId,
        tableName: 'patients',
        recordId: clinicId,
      },
      async () => {
        const offset = (options.page - 1) * options.limit
        
        const whereClause: any = {
          clinicId,
          ...(options.status !== 'all' && {
            isActive: options.status === 'active'
          }),
          ...(options.search && {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search } },
            ]
          })
        }

        const [patients, total] = await Promise.all([
          prisma.patients.findMany({
            where: whereClause,
            include: {
              appointments: {
                where: {
                  scheduledAt: { gte: new Date() }
                },
                take: 3,
                orderBy: { scheduledAt: 'asc' },
                select: {
                  id: true,
                  scheduledAt: true,
                  status: true,
                  service: {
                    select: { name: true }
                  }
                }
              },
              _count: {
                select: {
                  appointments: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: options.limit,
          }),
          prisma.patients.count({ where: whereClause })
        ])

        return {
          data: patients,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages: Math.ceil(total / options.limit)
          }
        }
      }
    )
  }

  async getPatientById(patientId: string, userId: string) {
    return this.withAuditLog(
      {
        operation: 'GET_PATIENT',
        userId,
        tableName: 'patients',
        recordId: patientId,
      },
      async () => {
        const patient = await prisma.patients.findUnique({
          where: { id: patientId },
          include: {
            appointments: {
              orderBy: { scheduledAt: 'desc' },
              take: 10,
              include: {
                professional: {
                  select: { fullName: true }
                },
                service: {
                  select: { name: true, duration: true }
                }
              }
            },
            consentRecords: {
              where: { status: 'granted' },
              orderBy: { grantedAt: 'desc' }
            }
          }
        })

        if (!patient) {
          throw new Error('Patient not found')
        }

        return patient
      }
    )
  }  async createPatient(data: z.infer<typeof PatientCreateSchema>, userId: string) {
    // Validate LGPD consent if processing personal data
    if (data.cpf || data.email) {
      if (!data.lgpdConsentGiven) {
        throw new Error('LGPD consent required for processing personal data')
      }
    }

    // Validate CPF if provided
    if (data.cpf && !this.validateCPF(data.cpf)) {
      throw new Error('Invalid CPF format')
    }

    return this.withAuditLog(
      {
        operation: 'CREATE_PATIENT',
        userId,
        tableName: 'patients',
        recordId: 'new',
        newValues: data,
      },
      async () => {
        const patient = await prisma.patients.create({
          data: {
            ...data,
            lgpdConsentDate: data.lgpdConsentGiven ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { appointments: true }
            }
          }
        })

        // Create initial consent record if LGPD consent given
        if (data.lgpdConsentGiven) {
          await prisma.consentRecords.create({
            data: {
              patientId: patient.id,
              purpose: 'medical_treatment',
              status: 'granted',
              grantedAt: new Date(),
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            }
          })
        }

        return patient
      }
    )
  }

  async updatePatient(data: z.infer<typeof PatientUpdateSchema>, userId: string) {
    const existingPatient = await prisma.patients.findUnique({
      where: { id: data.id }
    })

    if (!existingPatient) {
      throw new Error('Patient not found')
    }

    return this.withAuditLog(
      {
        operation: 'UPDATE_PATIENT',
        userId,
        tableName: 'patients',
        recordId: data.id,
        oldValues: existingPatient,
        newValues: data,
      },
      async () => {
        const { id, ...updateData } = data
        
        return prisma.patients.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { appointments: true }
            }
          }
        })
      }
    )
  }
}

const patientService = new PatientService()

// Middleware for authentication and clinic access validation
const validateClinicAccess = async (c: any, next: any) => {
  const userId = c.get('userId') // From auth middleware
  const clinicId = c.req.query('clinicId') || c.req.json()?.clinicId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  if (!clinicId) {
    return c.json({ error: 'Clinic ID required' }, 400)
  }

  const hasAccess = await patientService.validateClinicAccess(userId, clinicId)
  if (!hasAccess) {
    return c.json({ error: 'Access denied to clinic' }, 403)
  }

  await next()
}

// Routes with optimized caching and validation
app.get(
  '/patients',
  cache({
    cacheName: 'patients-list',
    cacheControl: 'private, max-age=300', // 5 minutes cache
  }),
  etag(),
  zValidator('query', PatientQuerySchema),
  validateClinicAccess,
  async (c) => {
    const query = c.req.valid('query')
    const userId = c.get('userId')

    try {
      const result = await patientService.getPatients(
        query.clinicId,
        userId,
        {
          page: query.page,
          limit: query.limit,
          search: query.search,
          status: query.status,
        }
      )

      // Add performance headers
      c.header('X-Total-Count', result.pagination.total.toString())
      c.header('X-Page', result.pagination.page.toString())
      
      return c.json(result)
    } catch (error) {
      console.error('Error fetching patients:', error)
      return c.json({ 
        error: 'Failed to fetch patients',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
  }
)

export default app
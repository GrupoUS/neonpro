/**
 * Optimized Hono Patient Routes with Prisma and Real-time Capabilities
 * Healthcare-compliant API with LGPD audit logging
 */

import { zValidator } from '@hono/zod-validator';
import { BaseService, prisma } from '@neonpro/database';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { etag } from 'hono/etag';
import { z } from 'zod';

const app = new Hono();

// Patient validation schemas
const PatientCreateSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  cpf: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  lgpdConsentGiven: z.boolean().default(false),
});

const PatientUpdateSchema = PatientCreateSchema.partial().extend({
  id: z.string().uuid(),
});

const PatientQuerySchema = z.object({
  clinicId: z.string().uuid(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 20, 100) : 20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional().default('active'),
});

class PatientService extends BaseService {
  async getPatients(
    clinicId: string,
    userId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status: string;
    },
  ) {
    return this.withAuditLog(
      {
        operation: 'GET_PATIENTS',
        userId,
        tableName: 'patients',
        recordId: clinicId,
      },
      async () => {
        const offset = (options.page - 1) * options.limit;

        const whereClause: any = {
          clinicId,
          ...(options.status !== 'all' && {
            isActive: options.status === 'active',
          }),
          ...(options.search && {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search } },
            ],
          }),
        };

        const [patients, total] = await Promise.all([
          prisma.patient.findMany({
            where: whereClause,
            include: {
              appointments: {
                where: {
                  startTime: { gte: new Date() },
                },
                take: 3,
                orderBy: { startTime: 'asc' },
                select: {
                  id: true,
                  startTime: true,
                  status: true,
                  service: {
                    select: { name: true },
                  },
                },
              },
              _count: {
                select: {
                  appointments: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: options.limit,
          }),
          prisma.patient.count({ where: whereClause }),
        ]);

        return {
          data: patients,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages: Math.ceil(total / options.limit),
          },
        };
      },
    );
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
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          include: {
            appointments: {
              orderBy: { startTime: 'desc' },
              take: 10,
              include: {
                professional: {
                  select: { fullName: true },
                },
                service: {
                  select: { name: true, duration: true },
                },
              },
            },
            consentRecord: {
              where: { status: 'GRANTED' },
              orderBy: { grantedAt: 'desc' },
            },
          },
        });

        if (!patient) {
          throw new Error('Patient not found');
        }

        return patient;
      },
    );
  }
  async createPatient(data: z.infer<typeof PatientCreateSchema>, userId: string) {
    // Validate LGPD consent if processing personal data
    if (data.cpf || data.email) {
      if (!data.lgpdConsentGiven) {
        throw new Error('LGPD consent required for processing personal data');
      }
    }

    // Validate CPF if provided
    if (data.cpf && !this.validateCPF(data.cpf)) {
      throw new Error('Invalid CPF format');
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
        const patient = await prisma.patient.create({
          data: {
            ...data,
            lgpdConsentDate: data.lgpdConsentGiven ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { appointments: true },
            },
          },
        });

        // Create initial consent record if LGPD consent given
        if (data.lgpdConsentGiven) {
          await prisma.consentRecord.create({
            data: {
              patientId: patient.id,
              purpose: 'MEDICAL_TREATMENT',
              status: 'GRANTED',
              grantedAt: new Date(),
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          });
        }

        return patient;
      },
    );
  }

  async updatePatient(data: z.infer<typeof PatientUpdateSchema>, userId: string) {
    const existingPatient = await prisma.patient.findUnique({
      where: { id: data.id },
    });

    if (!existingPatient) {
      throw new Error('Patient not found');
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
        const { id, ...updateData } = data;

        return prisma.patient.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { appointments: true },
            },
          },
        });
      },
    );
  }
}

const patientService = new PatientService();

// Middleware for authentication and clinic access validation
const validateClinicAccess = async (c: any, next: any) => {
  const userId = c.get('userId'); // From auth middleware
  const clinicId = c.req.query('clinicId') || c.req.json()?.clinicId;

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!clinicId) {
    return c.json({ error: 'Clinic ID required' }, 400);
  }

  const hasAccess = await patientService.validateClinicAccess(userId, clinicId);
  if (!hasAccess) {
    return c.json({ error: 'Access denied to clinic' }, 403);
  }

  await next();
};

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
  async c => {
    const query = c.req.valid('query');
    const userId = c.get('userId');

    try {
      const result = await patientService.getPatients(
        query.clinicId,
        userId,
        {
          page: query.page,
          limit: query.limit,
          search: query.search,
          status: query.status,
        },
      );

      // Add performance headers
      c.header('X-Total-Count', result.pagination.total.toString());
      c.header('X-Page', result.pagination.page.toString());

      return c.json(result);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return c.json({
        error: 'Failed to fetch patients',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  },
);

// Get single patient by ID
app.get(
  '/patients/:id',
  cache({
    cacheName: 'patient-detail',
    cacheControl: 'private, max-age=600', // 10 minutes cache for patient details
  }),
  etag(),
  validateClinicAccess,
  async c => {
    const patientId = c.req.param('id');
    const userId = c.get('userId');

    try {
      const patient = await patientService.getPatientById(patientId, userId);

      // Add LGPD compliance headers
      c.header('X-Data-Classification', 'sensitive');
      c.header('X-Retention-Policy', '7-years');

      return c.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      return c.json({
        error: 'Failed to fetch patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, error instanceof Error && error.message === 'Patient not found' ? 404 : 500);
    }
  },
);

// Create new patient
app.post(
  '/patients',
  zValidator('json', PatientCreateSchema),
  validateClinicAccess,
  async c => {
    const data = c.req.valid('json');
    const userId = c.get('userId');

    try {
      const patient = await patientService.createPatient(data, userId);

      // Add performance headers
      c.header('X-Created-At', new Date().toISOString());
      c.header('Location', `/patients/${patient.id}`);

      return c.json(patient, 201);
    } catch (error) {
      console.error('Error creating patient:', error);
      return c.json({
        error: 'Failed to create patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 400);
    }
  },
);

export default app;

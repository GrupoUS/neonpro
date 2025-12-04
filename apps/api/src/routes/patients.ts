/**
 * Optimized Hono Patient Routes with Prisma and Real-time Capabilities
 * Healthcare-compliant API with LGPD audit logging
 */

import { zValidator } from '@hono/zod-validator';
import { BaseService, prisma } from '@neonpro/database';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cache } from 'hono/cache';
import { etag } from 'hono/etag';
import { z } from 'zod';
import { badRequest, created, notFound, ok, serverError } from '../utils/responses';
import { requireAuth } from '../middleware/authn';
import { encryptPII, decryptPII, maskPII, validateCPF } from '@neonpro/security';

// Consent duration configuration (defaults to 1 year)
const DEFAULT_CONSENT_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const CONSENT_DURATION_MS = (() => {
  const v = process.env.CONSENT_DURATION_MS;
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CONSENT_DURATION_MS;
})();

// Define context variables interface
interface Variables {
  userId: string;
}

// Create typed Hono instance
const app = new Hono<{ Variables: Variables }>();

// Patient validation schemas
const PatientCreateSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  familyName: z.string().min(1).max(50),
  cpf: z.string().optional(),
  rg: z.string().optional(),
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
  mask: z.string().optional().transform(val => val === 'true'),
});

// Helper function to mask or decrypt PII fields
function processPIIFields(patient: any, shouldMask: boolean) {
  if (shouldMask) {
    // Mask sensitive data for display
    return {
      ...patient,
      cpf: patient.cpf ? maskPII(decryptPII(patient.cpf), 'cpf') : null,
      rg: patient.rg ? maskPII(decryptPII(patient.rg), 'rg') : null,
      email: patient.email ? maskPII(patient.email, 'email') : null,
      phone_primary: patient.phonePrimary ? maskPII(patient.phonePrimary, 'phone') : null,
      phone_secondary: patient.phoneSecondary ? maskPII(patient.phoneSecondary, 'phone') : null,
    };
  }

  // Decrypt for full access (authorized users only)
  return {
    ...patient,
    cpf: patient.cpf ? decryptPII(patient.cpf) : null,
    rg: patient.rg ? decryptPII(patient.rg) : null,
  };
}

class PatientService extends BaseService {
  // Add public wrapper method for clinic access validation
  async checkClinicAccess(userId: string, clinicId: string): Promise<boolean> {
    return this.validateClinicAccess(userId, clinicId);
  }

  async getPatients(
    clinicId: string,
    userId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status: string;
      mask?: boolean;
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
                  // Remove the invalid service relation for now
                  // service: {
                  //   select: { name: true },
                  // },
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

        // Process PII data - either mask or decrypt based on options
        const processedPatients = patients.map(patient =>
          processPIIFields(patient, options.mask || false)
        );

        return {
          data: processedPatients,
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
                // Remove the invalid service relation for now
                // service: {
                //   select: { name: true, duration: true },
                // },
              },
            },
            consentRecords: {
              where: { status: 'GRANTED' },
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (!patient) {
          throw new Error('Patient not found');
        }

        // Decrypt PII data for response
        return {
          ...patient,
          cpf: patient.cpf ? decryptPII(patient.cpf) : null,
          rg: patient.rg ? decryptPII(patient.rg) : null,
        };
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

    // Validate CPF if provided (using real Brazilian CPF validation algorithm)
    if (data.cpf && !validateCPF(data.cpf)) {
      throw new Error('Invalid CPF - check digits verification failed');
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
        // Generate medical record number
        const medicalRecordNumber = await this.generateMedicalRecordNumber(data.clinicId);

        // Encrypt sensitive PII data before storing (LGPD Article 46)
        const encryptedData = { ...data };
        if (data.cpf) {
          encryptedData.cpf = encryptPII(data.cpf);
        }
        if (data.rg) {
          encryptedData.rg = encryptPII(data.rg);
        }

        const patient = await prisma.patient.create({
          data: {
            ...encryptedData,
            medicalRecordNumber,
            dataConsentDate: data.lgpdConsentGiven ? new Date() : null,
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
              clinicId: data.clinicId,
              purpose: 'MEDICAL_TREATMENT',
              status: 'GRANTED',
              consentType: 'EXPLICIT',
              legalBasis: 'CONSENT',
              collectionMethod: 'ONLINE_FORM',
              expiresAt: new Date(Date.now() + CONSENT_DURATION_MS), // default 1 year, configurable via CONSENT_DURATION_MS
            },
          });
        }

        // Decrypt PII data for response (keep encrypted in DB)
        const patientResponse = {
          ...patient,
          cpf: patient.cpf ? decryptPII(patient.cpf) : null,
          rg: patient.rg ? decryptPII(patient.rg) : null,
        };

        return patientResponse;
      },
    );
  }

  // Add method to generate medical record number
  private async generateMedicalRecordNumber(clinicId: string): Promise<string> {
    const count = await prisma.patient.count({
      where: { clinicId },
    });
    return `MR${clinicId.slice(-6).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
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

        // Encrypt sensitive PII data if provided (LGPD Article 46)
        const encryptedUpdateData = { ...updateData };
        if (updateData.cpf) {
          encryptedUpdateData.cpf = encryptPII(updateData.cpf);
        }
        if (updateData.rg) {
          encryptedUpdateData.rg = encryptPII(updateData.rg);
        }

        const updatedPatient = await prisma.patient.update({
          where: { id },
          data: {
            ...encryptedUpdateData,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { appointments: true },
            },
          },
        });

        // Decrypt PII data for response
        return {
          ...updatedPatient,
          cpf: updatedPatient.cpf ? decryptPII(updatedPatient.cpf) : null,
          rg: updatedPatient.rg ? decryptPII(updatedPatient.rg) : null,
        };
      },
    );
  }

  async deletePatient(patientId: string, userId: string) {
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    return this.withAuditLog(
      {
        operation: 'DELETE_PATIENT_LGPD',
        userId,
        tableName: 'patients',
        recordId: patientId,
        oldValues: existingPatient,
        newValues: {
          reason: 'LGPD_RIGHT_TO_ERASURE',
          anonymized: true,
        },
      },
      async () => {
        // Soft delete with LGPD-compliant data anonymization
        const anonymizedPatient = await prisma.patient.update({
          where: { id: patientId },
          data: {
            // Mark as inactive
            isActive: false,
            deceasedIndicator: true, // Use this field to mark as "deleted"
            deceasedDate: new Date(),

            // Anonymize personal data
            fullName: `ANONYMIZED_PATIENT_${patientId.substring(0, 8)}`,
            givenNames: ['ANONYMIZED'],
            familyName: 'ANONYMIZED',
            preferredName: null,
            email: null,
            phonePrimary: null,
            phoneSecondary: null,

            // Anonymize address
            addressLine1: null,
            addressLine2: null,
            city: null,
            state: null,
            postalCode: null,

            // Anonymize identity documents
            cpf: null,
            rg: null,
            passportNumber: null,

            // Anonymize medical data (keep allergies/conditions for safety)
            photoUrl: null,
            insuranceProvider: null,
            insuranceNumber: null,
            insurancePlan: null,

            // Anonymize emergency contact
            emergencyContactName: null,
            emergencyContactPhone: null,
            emergencyContactRelationship: null,

            // Update consent status
            dataConsentStatus: 'withdrawn',
            lgpdConsentGiven: false,
            marketingConsent: false,
            researchConsent: false,

            // Record anonymization
            patientNotes: `[LGPD ERASURE] Patient data anonymized on ${new Date().toISOString()} by user ${userId}`,
            updatedAt: new Date(),
            updatedBy: userId,
          },
          select: {
            id: true,
            fullName: true,
            isActive: true,
            dataConsentStatus: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          patientId,
          anonymized: true,
          erasureDate: new Date().toISOString(),
          lgpdCompliance: {
            rightToErasure: true,
            dataAnonymized: true,
            auditTrailRetained: true,
            medicalHistoryRetained: true, // For legal compliance
          },
          patient: anonymizedPatient,
        };
      },
    );
  }
}

const patientService = new PatientService();

// Middleware for authentication and clinic access validation
const validateClinicAccess = async (c: Context<{ Variables: Variables }>, next: any) => {
  const userId = c.get('userId'); // Now properly typed
  const clinicId = c.req.query('clinicId') || (await c.req.json())?.clinicId;

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!clinicId) {
    return c.json({ error: 'Clinic ID required' }, 400);
  }

  const hasAccess = await patientService.checkClinicAccess(userId, clinicId);
  if (!hasAccess) {
    return c.json({ error: 'Access denied to clinic' }, 403);
  }

  return await next();
};

// Routes with optimized caching and validation
app.get(
  '/patients',
  requireAuth, 
  cache({
    cacheName: 'patients-list',
    cacheControl: 'private, max-age=300', // 5 minutes cache
  }),
  etag(),
  zValidator('query', PatientQuerySchema),
  validateClinicAccess,
  async c => {
    const query = c.req.valid('query');
    const userId = c.get('userId'); // Now properly typed

    try {
      const result = await patientService.getPatients(
        query.clinicId,
        userId,
        {
          page: query.page,
          limit: query.limit,
          search: query.search,
          status: query.status,
          mask: query.mask,
        },
      );

      // Add performance headers
      c.header('X-Total-Count', result.pagination.total.toString());
      c.header('X-Page', result.pagination.page.toString());

      return ok(c, result);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return serverError(c, 'Failed to fetch patients', error instanceof Error ? error : undefined);
    }
  },
);

// Get single patient by ID
app.get(
  '/patients/:id',
  requireAuth, 
  cache({
    cacheName: 'patient-detail',
    cacheControl: 'private, max-age=600', // 10 minutes cache for patient details
  }),
  etag(),
  validateClinicAccess,
  async c => {
    const patientId = c.req.param('id');
    const userId = c.get('userId'); // Now properly typed

    try {
      const patient = await patientService.getPatientById(patientId, userId);

      // Add LGPD compliance headers
      c.header('X-Data-Classification', 'sensitive');
      c.header('X-Retention-Policy', '7-years');

      return ok(c, patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      if (error instanceof Error && error.message === 'Patient not found') {
        return notFound(c, 'Patient not found');
      }
      return serverError(c, 'Failed to fetch patient', error instanceof Error ? error : undefined);
    }
  },
);

// Create new patient
app.post(
  '/patients',
  requireAuth,
  zValidator('json', PatientCreateSchema),
  validateClinicAccess,
  async c => {
    const data = c.req.valid('json');
    const userId = c.get('userId'); // Now properly typed

    try {
      const patient = await patientService.createPatient(data, userId);

      // Add performance headers
      c.header('X-Created-At', new Date().toISOString());
      c.header('Location', `/patients/${patient.id}`);

      return created(c, patient, `/patients/${patient.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      return badRequest(c, 'VALIDATION_ERROR', error instanceof Error ? error.message : 'Failed to create patient', error instanceof Error ? error : undefined);
    }
  },
);

// Update patient
app.put(
  '/patients/:id',
  requireAuth,
  zValidator('json', PatientUpdateSchema),
  validateClinicAccess,
  async c => {
    const patientId = c.req.param('id');
    const data = c.req.valid('json');
    const userId = c.get('userId');

    try {
      const patient = await patientService.updatePatient(
        { ...data, id: patientId },
        userId,
      );

      // Add LGPD compliance headers
      c.header('X-Data-Classification', 'sensitive');
      c.header('X-Last-Modified', new Date().toISOString());

      return ok(c, patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      if (error instanceof Error && error.message === 'Patient not found') {
        return notFound(c, 'Patient not found');
      }
      return serverError(c, 'Failed to update patient', error instanceof Error ? error : undefined);
    }
  },
);

// Delete patient (LGPD-compliant soft delete with anonymization)
app.delete(
  '/patients/:id',
  requireAuth,
  validateClinicAccess,
  async c => {
    const patientId = c.req.param('id');
    const userId = c.get('userId');

    try {
      const result = await patientService.deletePatient(patientId, userId);

      // Add LGPD compliance headers
      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Erasure', 'true');
      c.header('X-Erasure-Date', result.erasureDate);

      return ok(c, result);
    } catch (error) {
      console.error('Error deleting patient:', error);
      if (error instanceof Error && error.message === 'Patient not found') {
        return notFound(c, 'Patient not found');
      }
      return serverError(c, 'Failed to delete patient', error instanceof Error ? error : undefined);
    }
  },
);

export default app;

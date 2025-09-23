/**
 * Optimized Hono Patient Routes with Prisma and Real-time Capabilities
 * Healthcare-compliant API with LGPD audit logging
 */

import { zValidator } from "@hono/zod-validator";
import { BaseService, prisma } from "@neonpro/database";
import { Hono } from "hono";
import type { Context } from "hono";
import { cache } from "hono/cache";
import { etag } from "hono/etag";
import {
  badRequest,
  created,
  notFound,
  ok,
  serverError,
} from "../utils/responses";

// Consent duration configuration (defaults to 1 year)
const DEFAULT_CONSENT_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const CONSENT_DURATION_MS = (() => {
  const v = process.env.CONSENT_DURATION_MS;
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CONSENT_DURATION_MS;
})();

// Define context variables interface
interface Variables {
  _userId: string;
}

// Create typed Hono instance
const app = new Hono<{ Variables: Variables }>();

// Patient validation schemas
const PatientCreateSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  familyName: z.string().min(1).max(50),
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
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val) || 20, 100) : 20)),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
});

class PatientService extends BaseService {
  // Add public wrapper method for clinic access validation
  async checkClinicAccess(_userId: string, clinicId: string): Promise<boolean> {
    return this.validateClinicAccess(userId, clinicId);
  }

  async getPatients(
    clinicId: string,
    _userId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status: string;
    },
  ) {
    return this.withAuditLog(
      {
        operation: "GET_PATIENTS",
        userId,
        tableName: "patients",
        recordId: clinicId,
      },
      async () => {
        const offset = (options.page - 1) * options.limit;

        const whereClause: any = {
          clinicId,
          ...(options.status !== "all" && {
            isActive: options.status === "active",
          }),
          ...(options.search && {
            OR: [
              { fullName: { contains: options.search, mode: "insensitive" } },
              { email: { contains: options.search, mode: "insensitive" } },
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
                orderBy: { startTime: "asc" },
                select: {
                  id: true,
                  startTime: true,
                  status: true,
                  // Remove the invalid service relation for now
                  // _service: {
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
            orderBy: { createdAt: "desc" },
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

  async getPatientById(patientId: string, _userId: string) {
    return this.withAuditLog(
      {
        operation: "GET_PATIENT",
        userId,
        tableName: "patients",
        recordId: patientId,
      },
      async () => {
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          include: {
            appointments: {
              orderBy: { startTime: "desc" },
              take: 10,
              include: {
                professional: {
                  select: { fullName: true },
                },
                // Remove the invalid service relation for now
                // _service: {
                //   select: { name: true, duration: true },
                // },
              },
            },
            consentRecords: {
              where: { status: "GRANTED" },
              orderBy: { createdAt: "desc" },
            },
          },
        });

        if (!patient) {
          throw new Error("Patient not found");
        }

        return patient;
      },
    );
  }
  async createPatient(
    data: z.infer<typeof PatientCreateSchema>,
    _userId: string,
  ) {
    // Validate LGPD consent if processing personal data
    if (data.cpf || data.email) {
      if (!data.lgpdConsentGiven) {
        throw new Error("LGPD consent required for processing personal data");
      }
    }

    // Validate CPF if provided
    if (data.cpf && !this.validateCPF(data.cpf)) {
      throw new Error("Invalid CPF format");
    }

    return this.withAuditLog(
      {
        operation: "CREATE_PATIENT",
        userId,
        tableName: "patients",
        recordId: "new",
        newValues: data,
      },
      async () => {
        // Generate medical record number
        const medicalRecordNumber = await this.generateMedicalRecordNumber(
          data.clinicId,
        );

        const patient = await prisma.patient.create({
          data: {
            ...data,
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
              purpose: "MEDICAL_TREATMENT",
              status: "GRANTED",
              consentType: "EXPLICIT",
              legalBasis: "CONSENT",
              collectionMethod: "ONLINE_FORM",
              expiresAt: new Date(Date.now() + CONSENT_DURATION_MS), // default 1 year, configurable via CONSENT_DURATION_MS
            },
          });
        }

        return patient;
      },
    );
  }

  // Add method to generate medical record number
  private async generateMedicalRecordNumber(clinicId: string): Promise<string> {
    const count = await prisma.patient.count({
      where: { clinicId },
    });
    return `MR${clinicId.slice(-6).toUpperCase()}${(count + 1).toString().padStart(4, "0")}`;
  }

  async updatePatient(
    data: z.infer<typeof PatientUpdateSchema>,
    _userId: string,
  ) {
    const existingPatient = await prisma.patient.findUnique({
      where: { id: data.id },
    });

    if (!existingPatient) {
      throw new Error("Patient not found");
    }

    return this.withAuditLog(
      {
        operation: "UPDATE_PATIENT",
        userId,
        tableName: "patients",
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
const validateClinicAccess = async (
  c: Context<{ Variables: Variables }>,
  next: any,
) => {
  const userId = c.get("userId"); // Now properly typed
  const clinicId = c.req.query("clinicId") || (await c.req.json())?.clinicId;

  if (!_userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!clinicId) {
    return c.json({ error: "Clinic ID required" }, 400);
  }

  const hasAccess = await patientService.checkClinicAccess(userId, clinicId);
  if (!hasAccess) {
    return c.json({ error: "Access denied to clinic" }, 403);
  }

  return await next();
};

import { requireAuth } from "../middleware/authn";

// Routes with optimized caching and validation
app.get(
  "/patients",
  requireAuth,
  cache({
    cacheName: "patients-list",
    cacheControl: "private, max-age=300", // 5 minutes cache
  }),
  etag(),
  zValidator("query", PatientQuerySchema),
  validateClinicAccess,
  async (c) => {
    const query = c.req.valid("query");
    const userId = c.get("userId"); // Now properly typed

    try {
      const result = await patientService.getPatients(query.clinicId, userId, {
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
      });

      // Add performance headers
      c.header("X-Total-Count", result.pagination.total.toString());
      c.header("X-Page", result.pagination.page.toString());

      return ok(c, result);
    } catch (error) {
      console.error("Error fetching patients:", error);

      return serverError(
        c,
        "Failed to fetch patients",
        error instanceof Error ? error : undefined,
      );
    }
  },
);

// Get single patient by ID
app.get(
  "/patients/:id",
  requireAuth,
  cache({
    cacheName: "patient-detail",
    cacheControl: "private, max-age=600", // 10 minutes cache for patient details
  }),
  etag(),
  validateClinicAccess,
  async (c) => {
    const patientId = c.req.param("id");
    const userId = c.get("userId"); // Now properly typed

    try {
      const patient = await patientService.getPatientById(patientId, _userId);

      // Add LGPD compliance headers
      c.header("X-Data-Classification", "sensitive");
      c.header("X-Retention-Policy", "7-years");

      return ok(c, patient);
    } catch (error) {
      console.error("Error fetching patient:", error);

      if (error instanceof Error && error.message === "Patient not found") {
        return notFound(c, "Patient not found");
      }
      return serverError(
        c,
        "Failed to fetch patient",
        error instanceof Error ? error : undefined,
      );
    }
  },
);

// Create new patient
app.post(
  "/patients",
  requireAuth,
  zValidator("json", PatientCreateSchema),
  validateClinicAccess,
  async (c) => {
    const data = c.req.valid("json");
    const userId = c.get("userId"); // Now properly typed

    try {
      const patient = await patientService.createPatient(data, _userId);

      // Add performance headers
      c.header("X-Created-At", new Date().toISOString());
      c.header("Location", `/patients/${patient.id}`);

      return created(c, patient, `/patients/${patient.id}`);
    } catch (error) {
      console.error("Error creating patient:", error);

      return badRequest(
        c,
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to create patient",
        error instanceof Error ? error : undefined,
      );
    }
  },
);

export default app;

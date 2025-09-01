/**
 * Healthcare API Endpoint Template
 * Standardized patterns for AI agents to implement healthcare API endpoints
 * with Brazilian regulatory compliance, LGPD audit logging, and proper error handling.
 */

import type { Context, Next } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
// TODO: Import from @neonpro/utils when implementing
// import { Logger } from '@neonpro/utils';
import type { HealthcareContext, HealthcareFeatureTemplate } from "./healthcare-feature-template";
import { HealthcareFeatureConfig } from "./healthcare-feature-template";
// TODO: Import from @neonpro/api/middleware when implementing
// import { healthcareSecurityMiddleware, healthcareValidationMiddleware } from '@neonpro/api/middleware';

// Placeholder Logger for template compilation
const Logger = {
  info: (message: string, meta?: Record<string, unknown>) => console.log(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => console.error(message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => console.warn(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => console.debug(message, meta),
};

// Placeholder middleware for template compilation
const healthcareSecurityMiddleware = async (c: Context, next: Next) => await next();
const healthcareValidationMiddleware = async (c: Context, next: Next) => await next();

// Standard API response types
export interface HealthcareApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    auditId?: string;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends HealthcareApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error codes for Brazilian healthcare context
export const HealthcareErrorCodes = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: "HC_AUTH_001",
  INSUFFICIENT_PERMISSIONS: "HC_AUTH_002",
  PROFESSIONAL_LICENSE_REQUIRED: "HC_AUTH_003",
  PROFESSIONAL_LICENSE_INVALID: "HC_AUTH_004",

  // Patient Data & LGPD
  PATIENT_NOT_FOUND: "HC_PATIENT_001",
  LGPD_CONSENT_REQUIRED: "HC_PATIENT_002",
  LGPD_CONSENT_WITHDRAWN: "HC_PATIENT_003",
  CPF_VALIDATION_FAILED: "HC_PATIENT_004",

  // Medical Operations
  EMERGENCY_ACCESS_DENIED: "HC_MEDICAL_001",
  MEDICAL_RECORD_LOCKED: "HC_MEDICAL_002",
  APPOINTMENT_CONFLICT: "HC_MEDICAL_003",
  TREATMENT_NOT_AUTHORIZED: "HC_MEDICAL_004",

  // System & Compliance
  ENCRYPTION_FAILED: "HC_SYSTEM_001",
  AUDIT_LOG_FAILED: "HC_SYSTEM_002",
  RATE_LIMIT_EXCEEDED: "HC_SYSTEM_003",
  MAINTENANCE_MODE: "HC_SYSTEM_004",

  // Validation
  VALIDATION_FAILED: "HC_VALID_001",
  REQUIRED_FIELD_MISSING: "HC_VALID_002",
  INVALID_FORMAT: "HC_VALID_003",
  BUSINESS_RULE_VIOLATION: "HC_VALID_004",
} as const;

export type HealthcareErrorCode = (typeof HealthcareErrorCodes)[keyof typeof HealthcareErrorCodes];

// Template for healthcare API endpoint implementation
export abstract class HealthcareApiTemplate<T, CreateInput, UpdateInput> {
  protected readonly app: Hono;
  protected readonly feature: HealthcareFeatureTemplate<
    T,
    CreateInput,
    UpdateInput
  >;
  protected readonly logger: typeof Logger;
  private readonly basePath: string;

  constructor(
    basePath: string,
    feature: HealthcareFeatureTemplate<T, CreateInput, UpdateInput>,
    config?: { enableCors?: boolean; enableRateLimit?: boolean; },
  ) {
    this.basePath = basePath;
    this.feature = feature;
    this.logger = Logger;
    this.app = new Hono();

    // Apply healthcare-specific middleware
    this.app.use("*", healthcareSecurityMiddleware);
    this.app.use("*", healthcareValidationMiddleware);

    // Setup standard routes
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /resource - List with pagination
    this.app.get("/", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const pagination = this.extractPaginationParams(c);

        const result = await this.handleList(context, pagination);
        return c.json(this.formatResponse(result));
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // GET /resource/:id - Get single item
    this.app.get("/:id", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const id = c.req.param("id");

        if (!id || !z.string().uuid().safeParse(id).success) {
          throw new HTTPException(400, { message: "Invalid ID format" });
        }

        const result = await this.feature.read(id, context);
        if (!result) {
          throw new HTTPException(404, { message: "Resource not found" });
        }

        return c.json(this.formatResponse(result));
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // POST /resource - Create new item
    this.app.post("/", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const input = await c.req.json();

        const result = await this.feature.create(input, context);
        return c.json(this.formatResponse(result), 201);
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // PUT /resource/:id - Update existing item
    this.app.put("/:id", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const id = c.req.param("id");
        const input = await c.req.json();

        if (!id || !z.string().uuid().safeParse(id).success) {
          throw new HTTPException(400, { message: "Invalid ID format" });
        }

        const result = await this.feature.update(id, input, context);
        return c.json(this.formatResponse(result));
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // DELETE /resource/:id - Delete item
    this.app.delete("/:id", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const id = c.req.param("id");

        if (!id || !z.string().uuid().safeParse(id).success) {
          throw new HTTPException(400, { message: "Invalid ID format" });
        }

        await this.feature.delete(id, context);
        return c.json(
          this.formatResponse(null, "Resource deleted successfully"),
        );
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // POST /resource/batch - Batch create
    this.app.post("/batch", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const inputs = await c.req.json();

        if (!Array.isArray(inputs)) {
          throw new HTTPException(400, { message: "Expected array of items" });
        }

        const results = await this.feature.batchCreate(inputs, context);
        return c.json(this.formatResponse(results));
      } catch (error) {
        return this.handleError(c, error);
      }
    });

    // POST /resource/:id/emergency - Emergency access
    this.app.post("/:id/emergency", async (c) => {
      try {
        const context = this.extractHealthcareContext(c);
        const id = c.req.param("id");
        const { justification } = await c.req.json();

        if (!justification || typeof justification !== "string") {
          throw new HTTPException(400, {
            message: "Emergency access justification required",
          });
        }

        const result = await this.feature.emergencyRead(
          id,
          context,
          justification,
        );
        return c.json(this.formatResponse(result));
      } catch (error) {
        return this.handleError(c, error);
      }
    });
  }

  // Abstract method for custom list implementation
  protected abstract handleList(
    context: HealthcareContext,
    pagination: PaginationParams,
  ): Promise<T[] | PaginatedResponse<T>>;

  // Extract healthcare context from request
  private extractHealthcareContext(c: Record<string, unknown>): HealthcareContext {
    const user = c.get("user");
    const isEmergency = c.req.header("X-Emergency-Access") === "true";
    const lgpdConsent = c.req.header("X-LGPD-Consent") === "true";

    return {
      userId: user?.id || "anonymous",
      userRole: user?.role || "anonymous",
      professionalLicense: user?.professionalLicense,
      clinicId: user?.clinicId || c.req.header("X-Clinic-ID"),
      isEmergencyAccess: isEmergency,
      lgpdConsent: lgpdConsent,
    };
  }

  // Extract pagination parameters
  private extractPaginationParams(c: Record<string, unknown>): PaginationParams {
    const query = c.req.query();

    return {
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 20, 100), // Max 100 items per page
      sortBy: query.sortBy,
      sortOrder: query.sortOrder === "desc" ? "desc" : "asc",
    };
  }

  // Format standard API response
  private formatResponse<D>(
    data: D,
    message?: string,
  ): HealthcareApiResponse<D> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };
  }

  // Handle errors with proper healthcare context
  private handleError(c: Record<string, unknown>, error: Record<string, unknown>): Response {
    let statusCode = 500;
    let errorCode = "HC_SYSTEM_001";
    let message = "Internal server error";

    if (error instanceof HTTPException) {
      statusCode = error.status;
      message = error.message;
    } else if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = HealthcareErrorCodes.VALIDATION_FAILED;
      message = "Validation failed";
    } else if (error.message?.includes("Professional license")) {
      statusCode = 403;
      errorCode = HealthcareErrorCodes.PROFESSIONAL_LICENSE_REQUIRED;
      message = error.message;
    } else if (error.message?.includes("LGPD consent")) {
      statusCode = 403;
      errorCode = HealthcareErrorCodes.LGPD_CONSENT_REQUIRED;
      message = error.message;
    } else if (error.message?.includes("Emergency access")) {
      statusCode = 403;
      errorCode = HealthcareErrorCodes.EMERGENCY_ACCESS_DENIED;
      message = error.message;
    }

    this.logger.error("API Error", {
      error: error.message,
      stack: error.stack,
      statusCode,
      errorCode,
    });

    const response: HealthcareApiResponse<never> = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(error instanceof z.ZodError ? { details: error.errors } : {}),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };

    return c.json(response, statusCode);
  }

  // Get the configured Hono app
  public getApp(): Hono {
    return this.app;
  }

  // Health check endpoint
  public addHealthCheck(): void {
    this.app.get("/health", (c) => {
      return c.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: this.basePath,
      });
    });
  }

  // Add custom routes
  protected addCustomRoute(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    handler: (c: Context) => Promise<Response> | Response,
  ): void {
    const fullPath = path.startsWith("/") ? path : `/${path}`;

    switch (method) {
      case "GET":
        this.app.get(fullPath, handler);
        break;
      case "POST":
        this.app.post(fullPath, handler);
        break;
      case "PUT":
        this.app.put(fullPath, handler);
        break;
      case "DELETE":
        this.app.delete(fullPath, handler);
        break;
      case "PATCH":
        this.app.patch(fullPath, handler);
        break;
    }
  }
}

// Helper function to create healthcare API
export function createHealthcareApi<T, CreateInput, UpdateInput>(
  basePath: string,
  feature: HealthcareFeatureTemplate<T, CreateInput, UpdateInput>,
  listHandler: (
    context: HealthcareContext,
    pagination: PaginationParams,
  ) => Promise<T[] | PaginatedResponse<T>>,
  options?: { enableHealthCheck?: boolean; },
): Hono {
  class ConcreteHealthcareApi extends HealthcareApiTemplate<
    T,
    CreateInput,
    UpdateInput
  > {
    protected async handleList(
      context: HealthcareContext,
      pagination: PaginationParams,
    ): Promise<T[] | PaginatedResponse<T>> {
      return listHandler(context, pagination);
    }
  }

  const api = new ConcreteHealthcareApi(basePath, feature);

  if (options?.enableHealthCheck) {
    api.addHealthCheck();
  }

  return api.getApp();
}

// Brazilian healthcare-specific validation schemas
export const BrazilianHealthcareSchemas = {
  CPF: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      "CPF must be in format 000.000.000-00",
    ),
  Phone: z
    .string()
    .regex(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      "Phone must be in format (00) 0000-0000 or (00) 00000-0000",
    ),
  CEP: z.string().regex(/^\d{5}-\d{3}$/, "CEP must be in format 00000-000"),
  CRM: z.string().regex(/^\d{4,6}\/[A-Z]{2}$/, "CRM must be in format 0000/UF"),
  CRF: z.string().regex(/^\d{4,6}-[A-Z]{2}$/, "CRF must be in format 0000-UF"),
  CREFITO: z.string().regex(/^\d{5,6}-F$/, "CREFITO must be in format 00000-F"),

  Address: z.object({
    street: z.string().min(5).max(100),
    number: z.string().min(1).max(10),
    complement: z.string().max(50).optional(),
    neighborhood: z.string().min(2).max(50),
    city: z.string().min(2).max(50),
    state: z
      .string()
      .length(2)
      .regex(/^[A-Z]{2}$/),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/),
  }),

  EmergencyContact: z.object({
    name: z.string().min(2).max(100),
    relationship: z.enum([
      "spouse",
      "parent",
      "child",
      "sibling",
      "friend",
      "other",
    ]),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
    email: z.string().email().optional(),
  }),

  LGPDConsent: z.object({
    granted: z.boolean(),
    purpose: z.array(z.string()),
    timestamp: z.date(),
    ipAddress: z.string().ip(),
    userAgent: z.string().optional(),
    withdrawalDate: z.date().optional(),
  }),
};

export { HealthcareApiTemplate as default };

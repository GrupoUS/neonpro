/**
 * Base Service Class with LGPD Compliance and Audit Logging
 * Provides common functionality for all database services
 */

import type { PrismaClient } from "@prisma/client";

// Lazy load prisma to avoid test environment issues
let _prismaInstance: PrismaClient | null = null;
const getPrisma = async (): Promise<PrismaClient> => {
  if (!_prismaInstance) {
    // Conditional import to avoid test environment issues
    if (process.env.NODE_ENV === "test") {
      // Return a mock prisma client for tests
      _prismaInstance = {
        auditTrail: {
          create: async () => ({ id: "mock-audit-id" }),
        },
        consentRecord: {
          findFirst: async () => null,
          findMany: async () => [],
          create: async (data: any) => ({ id: "mock-consent-id", ...data.data }),
          update: async (params: any) => ({ id: params.where.id, ...params.data }),
          delete: async (params: any) => ({ id: params.where.id }),
        },
        user: {
          findUnique: async () => null,
          findMany: async () => [],
          create: async (data: any) => ({ id: "mock-user-id", ...data.data }),
          update: async (params: any) => ({ id: params.where.id, ...params.data }),
          delete: async (params: any) => ({ id: params.where.id }),
        },
        clinic: {
          findUnique: async () => null,
          findMany: async () => [],
          create: async (data: any) => ({ id: "mock-clinic-id", ...data.data }),
          update: async (params: any) => ({ id: params.where.id, ...params.data }),
          delete: async (params: any) => ({ id: params.where.id }),
        },
        $connect: async () => {},
        $disconnect: async () => {},
        $transaction: async (fn: any) => fn({}),
      } as any;
    } else {
      // Dynamic import to avoid module-level initialization
      const { prisma } = await import("../client.js");
      _prismaInstance = prisma;
    }
  }
  return _prismaInstance;
};

// Audit context interface
export interface AuditContext {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// LGPD compliance interface
export interface LGPDContext {
  dataSubjectId: string;
  legalBasis: string;
  purpose: string;
  retention?: string;
  consentId?: string;
}

// Data sanitization options
export interface SanitizationOptions {
  removePersonalData?: boolean;
  anonymizeIds?: boolean;
  maskSensitiveFields?: string[];
}

/**
 * Abstract base service class with LGPD compliance and audit logging
 */
export abstract class BaseService {
  protected async getPrismaClient(): Promise<PrismaClient> {
    return getPrisma();
  }

  /**
   * Create audit trail entry
   */
  protected async createAuditTrail(context: AuditContext): Promise<void> {
    try {
      const prisma = await this.getPrismaClient();
      await prisma.auditTrail.create({
        data: {
          userId: context.userId,
          action: context.action,
          resource: context.resource,
          resourceId: context.resourceId,
          metadata: context.metadata || {},
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to create audit trail:", error);
      // Don't throw - audit failures shouldn't break business logic
    }
  }

  /**
   * Verify LGPD compliance for data processing
   */
  protected async verifyLGPDCompliance(context: LGPDContext): Promise<boolean> {
    try {
      const prisma = await this.getPrismaClient();
      
      // Check if we have valid consent for this data subject
      const consent = await prisma.consentRecord.findFirst({
        where: {
          dataSubjectId: context.dataSubjectId,
          purpose: context.purpose,
          status: "granted",
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      return !!consent;
    } catch (error) {
      console.error("LGPD compliance check failed:", error);
      return false;
    }
  }

  /**
   * Sanitize data according to LGPD requirements
   */
  protected sanitizeData<T extends Record<string, any>>(
    data: T,
    options: SanitizationOptions = {}
  ): Partial<T> {
    const sanitized = { ...data };

    if (options.removePersonalData) {
      // Remove common personal data fields
      const personalFields = [
        "email",
        "phone",
        "cpf",
        "rg",
        "address",
        "birthDate",
        "fullName",
      ];
      personalFields.forEach((field) => {
        delete sanitized[field];
      });
    }

    if (options.anonymizeIds) {
      // Replace IDs with anonymous versions
      Object.keys(sanitized).forEach((key) => {
        if (key.includes("Id") || key === "id") {
          sanitized[key] = `anon_${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    if (options.maskSensitiveFields) {
      options.maskSensitiveFields.forEach((field) => {
        if (sanitized[field]) {
          sanitized[field] = "***MASKED***";
        }
      });
    }

    return sanitized;
  }

  /**
   * Execute operation with audit logging
   */
  protected async withAudit<T>(
    operation: () => Promise<T>,
    auditContext: AuditContext
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      
      await this.createAuditTrail({
        ...auditContext,
        metadata: {
          ...auditContext.metadata,
          duration: Date.now() - startTime,
          status: "success",
        },
      });
      
      return result;
    } catch (error) {
      await this.createAuditTrail({
        ...auditContext,
        metadata: {
          ...auditContext.metadata,
          duration: Date.now() - startTime,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      
      throw error;
    }
  }

  /**
   * Execute operation with LGPD compliance check
   */
  protected async withLGPDCompliance<T>(
    operation: () => Promise<T>,
    lgpdContext: LGPDContext
  ): Promise<T> {
    const isCompliant = await this.verifyLGPDCompliance(lgpdContext);
    
    if (!isCompliant) {
      throw new Error(
        `LGPD compliance check failed for data subject ${lgpdContext.dataSubjectId} and purpose ${lgpdContext.purpose}`
      );
    }
    
    return operation();
  }

  /**
   * Execute database transaction with error handling
   */
  protected async executeTransaction<T>(
    operation: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const prisma = await this.getPrismaClient();
    
    try {
      return await prisma.$transaction(async (tx) => {
        return operation(tx as PrismaClient);
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): void {
    const missingFields = requiredFields.filter(
      (field) => data[field] === undefined || data[field] === null
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * Format error response
   */
  protected formatError(error: unknown): {
    message: string;
    code?: string;
    details?: any;
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code,
        details: (error as any).meta,
      };
    }

    return {
      message: "An unknown error occurred",
      details: error,
    };
  }

  /**
   * Log service operation
   */
  protected logOperation(
    operation: string,
    data?: any,
    level: "info" | "warn" | "error" = "info"
  ): void {
    const logData = {
      service: this.constructor.name,
      operation,
      timestamp: new Date().toISOString(),
      data: data ? this.sanitizeData(data, { maskSensitiveFields: ["password", "token", "secret"] }) : undefined,
    };

    switch (level) {
      case "error":
        console.error(JSON.stringify(logData));
        break;
      case "warn":
        console.warn(JSON.stringify(logData));
        break;
      default:
        console.log(JSON.stringify(logData));
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{
    status: "healthy" | "unhealthy";
    service: string;
    timestamp: string;
    details?: any;
  }> {
    try {
      const prisma = await this.getPrismaClient();
      await prisma.$connect();
      
      return {
        status: "healthy",
        service: this.constructor.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        service: this.constructor.name,
        timestamp: new Date().toISOString(),
        details: this.formatError(error),
      };
    }
  }
}

// Export utility functions
export { getPrisma };
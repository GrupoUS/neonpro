/**
 * Base Service Class with LGPD Compliance and Audit Logging
 * Provides common functionality for all database services
 */

import type { PrismaClient } from "@prisma/client";

// Lazy load prisma to avoid test environment issues
let _prismaInstance: PrismaClient | null = null;

// Prisma operation parameters interface
export interface PrismaCreateParams<T> {
  data: T;
}

export interface PrismaUpdateParams<T> {
  where: { id: string };
  data: T;
}

export interface PrismaDeleteParams {
  where: { id: string };
}

const getPrisma = async (): Promise<PrismaClient> => {
  if (!_prismaInstance) {
    // Dynamic import to avoid module-level initialization
    const { prisma } = await import("../client.js");
    _prismaInstance = prisma;
  }
  return _prismaInstance;
};

// Audit context interface
export interface AuditContext {
  _userId?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

// Error details interface
export interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  _context?: Record<string, unknown>;
}

// Base service class
export abstract class BaseService {
  protected abstract serviceName: string;

  // Get Prisma client instance
  protected async getPrisma(): Promise<PrismaClient> {
    return getPrisma();
  }

  // Create audit log entry
  protected async createAuditLog(
    action: "VIEW" | "CREATE" | "READ" | "UPDATE" | "DELETE" | "EXPORT" | "LOGIN" | "LOGOUT" | "AI_CHAT" | "AI_PREDICTION" | "AI_ANALYSIS" | "AI_RECOMMENDATION",
    resource: string,
    additionalInfo?: Record<string, unknown>,
    _userId?: string
  ): Promise<void> {
    try {
      const prisma = await this.getPrisma();
      await prisma.auditTrail.create({
        data: {
          _userId: userId || "system",
          action,
          resource,
          resourceType: "SYSTEM_CONFIG",
          additionalInfo: additionalInfo ? JSON.stringify(additionalInfo) : undefined,
          ipAddress: "127.0.0.1",
          userAgent: "NeonPro-Service",
          status: "SUCCESS",
        },
      });
    } catch (_error) {
      console.error("Failed to create audit log:", error);
    }
  }

  // Generic create method with audit logging
  protected async createWithAudit<T>(
    model: string,
    data: T,
    _userId?: string
  ): Promise<T> {
    const prisma = await this.getPrisma();
    
    try {
      const result = await (prisma as any)[model].create({
        data,
      });

      await this.createAuditLog(
        "CREATE",
        model,
        { id: (result as any).id, data },
        userId
      );

      return result;
    } catch (_error) {
      await this.createAuditLog(
        "CREATE",
        model,
        { 
          action: "CREATE",
          error: (error as Error).message,
          data 
        },
        userId
      );
      throw error;
    }
  }

  // Generic update method with audit logging
  protected async updateWithAudit<T>(
    model: string,
    id: string,
    data: Partial<T>,
    _userId?: string
  ): Promise<T> {
    const prisma = await this.getPrisma();
    
    try {
      const result = await (prisma as any)[model].update({
        where: { id },
        data,
      });

      await this.createAuditLog(
        "UPDATE",
        model,
        { id, data },
        userId
      );

      return result;
    } catch (_error) {
      await this.createAuditLog(
        "UPDATE",
        model,
        { 
          action: "UPDATE",
          id,
          error: (error as Error).message,
          data 
        },
        userId
      );
      throw error;
    }
  }

  // Generic delete method with audit logging
  protected async deleteWithAudit(
    model: string,
    id: string,
    _userId?: string
  ): Promise<void> {
    const prisma = await this.getPrisma();
    
    try {
      await (prisma as any)[model].delete({
        where: { id },
      });

      await this.createAuditLog(
        "DELETE",
        model,
        { id },
        userId
      );
    } catch (_error) {
      await this.createAuditLog(
        "DELETE",
        model,
        { 
          action: "DELETE",
          id,
          error: (error as Error).message
        },
        userId
      );
      throw error;
    }
  }

  // Generic find method with error handling
  protected async findById<T>(
    model: string,
    id: string
  ): Promise<T | null> {
    const prisma = await this.getPrisma();
    
    try {
      const result = await (prisma as any)[model].findUnique({
        where: { id },
      });
      return result;
    } catch (_error) {
      console.error(`Error finding ${model} by id ${id}:`, error);
      throw error;
    }
  }

  // Generic find many method with error handling
  protected async findMany<T>(
    model: string,
    options: Record<string, unknown> = {}
  ): Promise<T[]> {
    const prisma = await this.getPrisma();
    
    try {
      const result = await (prisma as any)[model].findMany(options);
      return result;
    } catch (_error) {
      console.error(`Error finding many ${model}:`, error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: Date; _service: string }> {
    try {
      await this.getPrisma();
      return {
        status: "healthy",
        timestamp: new Date(),
        _service: this.serviceName,
      };
    } catch (_error) {
      return {
        status: "unhealthy",
        timestamp: new Date(),
        _service: this.serviceName,
      };
    }
  }
}
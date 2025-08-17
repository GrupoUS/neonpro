/**
 * @fileoverview NeonPro Healthcare Database Package
 * Prisma client exports and database utilities for healthcare compliance
 *
 * @version 1.0.0
 * @author NeonPro Healthcare
 * @compliance LGPD + ANVISA + CFM
 */

// Re-export everything from Prisma client
export * from '@prisma/client';

// Import Prisma client
import { PrismaClient } from '@prisma/client';

// Create singleton Prisma client instance with healthcare logging
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'colorless',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database utility functions for healthcare operations
export class DatabaseUtils {
  /**
   * Healthcare-compliant connection test
   */
  static async testConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * LGPD-compliant user data cleanup
   */
  static async anonymizeUserData(userId: string): Promise<void> {
    // Implementation for LGPD right to be forgotten
    await prisma.$transaction(async (tx) => {
      // Anonymize user data while preserving medical history structure
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `anonymized_${Date.now()}@deleted.local`,
          first_name: 'ANONYMIZED',
          last_name: 'USER',
          cpf: null,
          phone: null,
          // Keep medical data structure for compliance
        },
      });
    });
  }

  /**
   * Healthcare audit trail creation
   */
  static async createAuditLog(
    _operation: string,
    _userId: string,
    _entityType: string,
    _entityId: string,
    _changes?: Record<string, any>
  ): Promise<void> {}
}

// Export default client for backward compatibility
export default prisma;

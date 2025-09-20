/**
 * Audit Trail Compatibility Layer
 *
 * This service provides backward compatibility for code that misuses auditTrail
 * for state management. It intercepts auditTrail queries and redirects them
 * to the proper operation state management system.
 *
 * This is a temporary solution until the full refactoring is complete.
 */

import { PrismaClient } from '@prisma/client';
import { createOperationStateService, OperationStateService } from './operation-state-service';

export class AuditTrailCompatibility {
  private operationStateService: OperationStateService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.operationStateService = createOperationStateService(prisma);
  }

  /**
   * Compatibility method for auditTrail.findFirst with operationId queries
   * This intercepts the misuse of auditTrail for state management
   */
  async findFirstWithOperationId(params: {
    where: {
      additionalInfo: {
        path: string[];
        equals: string;
      };
    };
    orderBy?: any;
  }): Promise<any> {
    const { where, orderBy } = params;

    // Check if this is an operationId query (the misuse pattern)
    if (where.additionalInfo?.path?.includes('operationId') && where.additionalInfo?.equals) {
      const operationId = where.additionalInfo.equals;

      // Use proper state management instead
      const state = await this.operationStateService.getStateByOperationId(operationId);

      if (state) {
        // Convert state to auditTrail format for backward compatibility
        return {
          id: state.id,
          status: this.mapStatusToAuditStatus(state.status),
          additionalInfo: JSON.stringify({
            operationId: state.operationId,
            step: state.step,
            entity: state.entity,
            operation: state.operation,
            data: state.data,
            error: state.errorMessage,
            metadata: state.metadata,
          }),
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
          // Add other required auditTrail fields
          userId: state.userId,
          action: 'CRUD_OPERATION',
          resourceType: state.entity.toUpperCase(),
          resourceId: `${state.entity}_${state.operationId}`,
          ipAddress: 'unknown',
          userAgent: 'system',
          riskLevel: 'LOW',
        };
      }
    }

    // If not an operationId query or no state found, return null
    return null;
  }

  /**
   * Create audit trail entry for actual audit purposes (not state management)
   */
  async createAuditEntry(params: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    riskLevel?: string;
  }): Promise<any> {
    return this.prisma.auditTrail.create({
      data: {
        user_id: params.userId,
        action: params.action as any,
        resource_type: params.resourceType as any,
        resource_id: params.resourceId,
        additional_info: params.details ? JSON.stringify(params.details) : null,
        ip_address: params.ipAddress || 'unknown',
        user_agent: params.userAgent || 'unknown',
        risk_level: (params.riskLevel || 'LOW') as any,
        status: 'SUCCESS',
      },
    });
  }

  /**
   * Map operation state status to audit trail status
   */
  private mapStatusToAuditStatus(status: string): string {
    switch (status) {
      case 'completed':
        return 'SUCCESS';
      case 'failed':
        return 'FAILED';
      case 'processing':
        return 'PROCESSING';
      default:
        return 'PENDING';
    }
  }
}

// Factory function
export function createAuditTrailCompatibility(prisma: PrismaClient): AuditTrailCompatibility {
  return new AuditTrailCompatibility(prisma);
}

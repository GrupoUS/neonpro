/**
 * Operation State Management Service
 *
 * This service provides proper state management for the 3-step CRUD flow,
 * replacing the misuse of auditTrail for state storage.
 *
 * Features:
 * - Proper state management for 3-step CRUD operations
 * - Audit trail for state changes
 * - AI validation result storage
 * - LGPD compliance tracking
 * - Efficient querying with proper indexes
 */

import { PrismaClient } from '@prisma/client';

export interface OperationStateData {
  operationId: string;
  step: 'intent' | 'confirm' | 'execute';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entity: string;
  operation: string;
  userId: string;
  clinicId?: string;
  sessionId?: string;
  data?: any;
  metadata?: any;
  errorMessage?: string;
  aiValidationResult?: any;
  lgpdComplianceResult?: any;
}

export interface OperationState {
  id: string;
  operationId: string;
  step: 'intent' | 'confirm' | 'execute';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entity: string;
  operation: string;
  userId: string;
  clinicId?: string;
  sessionId?: string;
  data: any;
  metadata: any;
  errorMessage?: string;
  aiValidationResult?: any;
  lgpdComplianceResult?: any;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class OperationStateService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new operation state
   */
  async createState(data: OperationStateData): Promise<OperationState> {
    const state = await this.prisma.operationState.create({
      data: {
        operation_id: data.operationId,
        step: data.step,
        status: data.status,
        entity: data.entity,
        operation: data.operation,
        user_id: data.userId,
        clinic_id: data.clinicId,
        session_id: data.sessionId,
        data: data.data,
        metadata: data.metadata,
        error_message: data.errorMessage,
        ai_validation_result: data.aiValidationResult,
        lgpd_compliance_result: data.lgpdComplianceResult,
      },
    });

    return this.mapToOperationState(state);
  }

  /**
   * Get operation state by operation ID
   */
  async getStateByOperationId(operationId: string): Promise<OperationState | null> {
    const state = await this.prisma.operationState.findFirst({
      where: {
        operation_id: operationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return state ? this.mapToOperationState(state) : null;
  }

  /**
   * Update operation state
   */
  async updateState(
    operationId: string,
    updates: Partial<OperationStateData>,
    changeReason?: string,
  ): Promise<OperationState> {
    const currentState = await this.getStateByOperationId(operationId);
    if (!currentState) {
      throw new Error(`Operation state not found for operation ID: ${operationId}`);
    }

    // Update the state using the unique ID
    const updatedState = await this.prisma.operationState.update({
      where: {
        id: currentState.id,
      },
      data: {
        step: updates.step,
        status: updates.status,
        data: updates.data,
        metadata: updates.metadata,
        error_message: updates.errorMessage,
        ai_validation_result: updates.aiValidationResult,
        lgpd_compliance_result: updates.lgpdComplianceResult,
        updated_at: new Date(),
        completed_at: updates.status === 'completed' || updates.status === 'failed'
          ? new Date()
          : null,
      },
    });

    // Create audit entry for state change
    if (currentState.step !== updates.step || currentState.status !== updates.status) {
      await this.prisma.operationStateAudit.create({
        data: {
          operation_state_id: updatedState.id,
          old_status: currentState.status,
          new_status: updates.status || currentState.status,
          old_step: currentState.step,
          new_step: updates.step || currentState.step,
          user_id: updates.userId || currentState.userId,
          change_reason,
          metadata: {
            changes: updates,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return this.mapToOperationState(updatedState);
  }

  /**
   * Get states by user ID
   */
  async getStatesByUserId(userId: string, limit: number = 50): Promise<OperationState[]> {
    const states = await this.prisma.operationState.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return states.map(state => this.mapToOperationState(state));
  }

  /**
   * Get states by status
   */
  async getStatesByStatus(status: string, limit: number = 100): Promise<OperationState[]> {
    const states = await this.prisma.operationState.findMany({
      where: {
        status: status,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return states.map(state => this.mapToOperationState(state));
  }

  /**
   * Get states by step
   */
  async getStatesByStep(step: string, limit: number = 100): Promise<OperationState[]> {
    const states = await this.prisma.operationState.findMany({
      where: {
        step: step,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return states.map(state => this.mapToOperationState(state));
  }

  /**
   * Delete old completed states (cleanup)
   */
  async cleanupOldStates(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.operationState.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate,
        },
        status: {
          in: ['completed', 'failed'],
        },
      },
    });

    return result.count;
  }

  /**
   * Get state statistics
   */
  async getStateStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byStep: Record<string, number>;
    byEntity: Record<string, number>;
  }> {
    const [total, statusStats, stepStats, entityStats] = await Promise.all([
      this.prisma.operationState.count(),
      this.prisma.operationState.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      this.prisma.operationState.groupBy({
        by: ['step'],
        _count: {
          step: true,
        },
      }),
      this.prisma.operationState.groupBy({
        by: ['entity'],
        _count: {
          entity: true,
        },
      }),
    ]);

    return {
      total,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      byStep: stepStats.reduce((acc, stat) => {
        acc[stat.step] = stat._count.step;
        return acc;
      }, {} as Record<string, number>),
      byEntity: entityStats.reduce((acc, stat) => {
        acc[stat.entity] = stat._count.entity;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Map database record to OperationState interface
   */
  private mapToOperationState(record: any): OperationState {
    return {
      id: record.id,
      operationId: record.operation_id,
      step: record.step,
      status: record.status,
      entity: record.entity,
      operation: record.operation,
      userId: record.user_id,
      clinicId: record.clinic_id,
      sessionId: record.session_id,
      data: record.data,
      metadata: record.metadata,
      errorMessage: record.error_message,
      aiValidationResult: record.ai_validation_result,
      lgpdComplianceResult: record.lgpd_compliance_result,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      completedAt: record.completed_at,
    };
  }
}

// Factory function for easy instantiation
export function createOperationStateService(prisma: PrismaClient): OperationStateService {
  return new OperationStateService(prisma);
}

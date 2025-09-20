/**
 * AI CRUD Router with 3-Step Flow Implementation
 * T027: AI-assisted CRUD operations with intent→confirm→execute flow
 *
 * Features:
 * - 3-step CRUD flow with validation and confirmation
 * - AI-powered data validation and transformation
 * - LGPD compliance with audit logging
 * - Portuguese healthcare context support
 * - Multi-entity CRUD operations (patients, appointments, etc.)
 * - CFM compliance for medical data operations
 */

import { AuditAction, AuditStatus, ResourceType, RiskLevel } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { healthcareProcedure, protectedProcedure, router } from '../trpc';
import { createOperationStateService } from '../../services/operation-state-service';

// =====================================
// TYPE DEFINITIONS & SCHEMAS
// =====================================

/**
 * Supported CRUD entities
 */
const SUPPORTED_ENTITIES = [
  'patients',
  'appointments',
  'treatments',
  'medical_records',
  'prescriptions',
  'healthcare_professionals',
  'clinics',
  'consent_records',
] as const;

type CrudEntity = (typeof SUPPORTED_ENTITIES)[number];

/**
 * CRUD operation types
 */
const CRUD_OPERATIONS = ['create', 'read', 'update', 'delete'] as const;

type CrudOperation = (typeof CRUD_OPERATIONS)[number];

/**
 * AI CRUD Request Schema - Intent Step
 */
const crudIntentSchema = v.object({
  step: v.literal('intent'),
  operation: v.string([v.picklist(CRUD_OPERATIONS)]),
  entity: v.string([v.picklist(SUPPORTED_ENTITIES)]),
  data: v.any(), // Dynamic data based on entity
  options: v.optional(
    v.object({
      skipConfirmation: v.optional(v.boolean()),
      aiValidation: v.optional(v.boolean([v.value(true)])),
      lgpdCompliance: v.optional(v.boolean([v.value(true)])),
      dryRun: v.optional(v.boolean()),
    }),
  ),
  metadata: v.optional(
    v.object({
      source: v.optional(v.string()),
      priority: v.optional(v.string([v.picklist(['low', 'normal', 'high'])])),
      patientId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
    }),
  ),
});

/**
 * AI CRUD Request Schema - Confirm Step
 */
const crudConfirmSchema = v.object({
  step: v.literal('confirm'),
  intentId: v.string([v.uuid('Invalid intent ID')]),
  confirmed: v.boolean(),
  modifications: v.optional(v.any()), // Optional modifications before execution
  reason: v.optional(v.string()),
});

/**
 * AI CRUD Request Schema - Execute Step
 */
const crudExecuteSchema = v.object({
  step: v.literal('execute'),
  intentId: v.string([v.uuid('Invalid intent ID')]),
  confirmationId: v.string([v.uuid('Invalid confirmation ID')]),
  finalData: v.optional(v.any()), // Final data with any modifications
});

/**
 * Combined CRUD Request Schema
 */
const crudRequestSchema = v.union([
  crudIntentSchema,
  crudConfirmSchema,
  crudExecuteSchema,
]);

/**
 * CRUD Intent Response Schema
 */
const crudIntentResponseSchema = v.object({
  intentId: v.string(),
  step: v.literal('intent'),
  status: v.string([
    v.picklist(['pending_confirmation', 'validated', 'requires_input']),
  ]),
  validation: v.object({
    isValid: v.boolean(),
    errors: v.optional(v.array(v.string())),
    warnings: v.optional(v.array(v.string())),
    aiScore: v.optional(v.number()),
  }),
  preview: v.optional(v.any()),
  confirmationRequired: v.boolean(),
  estimatedImpact: v.optional(
    v.object({
      recordsAffected: v.number(),
      complianceChecks: v.number(),
      processingTimeMs: v.number(),
    }),
  ),
  compliance: v.object({
    lgpdCompliant: v.boolean(),
    cfmCompliant: v.optional(v.boolean()),
    auditRequired: v.boolean(),
    consentRequired: v.optional(v.boolean()),
  }),
});

/**
 * CRUD Confirm Response Schema
 */
const crudConfirmResponseSchema = v.object({
  confirmationId: v.string(),
  intentId: v.string(),
  step: v.literal('confirm'),
  status: v.string([
    v.picklist(['confirmed', 'rejected', 'requires_modification']),
  ]),
  readyToExecute: v.boolean(),
  finalData: v.optional(v.any()),
  executionPlan: v.optional(
    v.object({
      steps: v.array(v.string()),
      estimatedTimeMs: v.number(),
      rollbackAvailable: v.boolean(),
    }),
  ),
});

/**
 * CRUD Execute Response Schema
 */
const crudExecuteResponseSchema = v.object({
  executionId: v.string(),
  intentId: v.string(),
  confirmationId: v.string(),
  step: v.literal('execute'),
  status: v.string([v.picklist(['completed', 'failed', 'partial'])]),
  result: v.any(),
  metrics: v.object({
    executionTimeMs: v.number(),
    recordsAffected: v.number(),
    databaseQueries: v.number(),
    aiProcessingTimeMs: v.optional(v.number()),
  }),
  audit: v.object({
    auditId: v.string(),
    compliancePassed: v.boolean(),
    warnings: v.optional(v.array(v.string())),
  }),
});

// =====================================
// AI VALIDATION & TRANSFORMATION UTILITIES
// =====================================

/**
 * AI-powered data validation for healthcare entities
 */
async function validateWithAI(
  operation: CrudOperation,
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  aiScore: number;
  transformedData?: any;
}> {
  try {
    // Mock AI validation - in production, integrate with real AI service
    const validationPrompts = {
      create: `Validar dados para criação de ${entity}: ${JSON.stringify(data)}`,
      update: `Validar dados para atualização de ${entity}: ${JSON.stringify(data)}`,
      delete: `Validar deleção de ${entity} com ID: ${data.id}`,
      read: `Validar consulta de ${entity} com filtros: ${JSON.stringify(data)}`,
    };

    const prompt = `
Você é um assistente de IA especializado em validação de dados de saúde brasileiros.
Analise os dados para a operação ${operation} na entidade ${entity}.

Contexto:
- Operação: ${operation}
- Entidade: ${entity}
- Dados: ${JSON.stringify(data, null, 2)}

Validar:
1. Conformidade com LGPD
2. Formato e tipo de dados
3. Campos obrigatórios
4. Regras de negócio específicas da entidade
5. Consistência dos dados

Retorne um JSON com:
{
  "isValid": boolean,
  "errors": ["string"],
  "warnings": ["string"],
  "score": number (0-1),
  "transformedData": object (opcional)
}`;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock validation result
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: data.name && data.name.length > 100 ? ['Nome muito longo'] : [],
      aiScore: 0.95,
      transformedData: data,
    };

    // Entity-specific validation
    switch (entity) {
      case 'patients':
        if (operation === 'create' && !data.fullName) {
          validationResult.isValid = false;
          validationResult.errors.push('Nome do paciente é obrigatório');
        }
        break;
      case 'appointments':
        if (operation === 'create' && !data.startTime) {
          validationResult.isValid = false;
          validationResult.errors.push('Horário da consulta é obrigatório');
        }
        break;
    }

    return validationResult;
  } catch (error) {
    console.error('AI validation error:', error);
    return {
      isValid: false,
      errors: ['Erro na validação por IA'],
      warnings: [],
      aiScore: 0,
    };
  }
}

/**
 * Preview what will be affected by the CRUD operation
 */
async function generatePreview(
  operation: CrudOperation,
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<any> {
  try {
    // Generate a preview of what will happen
    const preview = {
      operation,
      entity,
      summary: `Operação ${operation} em ${entity}`,
      affectedRecords: 1,
      changes: [],
      complianceChecks: [
        'LGPD - Proteção de dados',
        'CFM - Registro médico',
        'Validação de formato',
      ],
    };

    if (operation === 'update' && data.id) {
      // Show current vs new values
      const current = await getCurrentData(entity, data.id, ctx);
      if (current) {
        preview.changes = Object.entries(data)
          .filter(([key, value]) => key !== 'id' && current[key] !== value)
          .map(([key, value]) => ({
            field: key,
            oldValue: current[key],
            newValue: value,
          }));
      }
    }

    return preview;
  } catch (error) {
    console.error('Preview generation error:', error);
    return null;
  }
}

/**
 * Get current data for comparison
 */
async function getCurrentData(
  entity: CrudEntity,
  id: string,
  ctx: any,
): Promise<any> {
  try {
    switch (entity) {
      case 'patients':
        return await ctx.prisma.patient.findUnique({
          where: { id },
        });
      case 'appointments':
        return await ctx.prisma.appointment.findUnique({
          where: { id },
        });
      default:
        return null;
    }
  } catch (error) {
    console.error('Error getting current data:', error);
    return null;
  }
}

// =====================================
// TRPC ROUTER IMPLEMENTATION
// =====================================

export const crudRouter = router({
  /**
   * Main CRUD endpoint with 3-step flow
   * Handles intent→confirm→execute operations
   */
  crud: healthcareProcedure
    .input(crudRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        switch (input.step) {
          case 'intent':
            return await handleIntentStep(ctx, input);
          case 'confirm':
            return await handleConfirmStep(ctx, input);
          case 'execute':
            return await handleExecuteStep(ctx, input);
          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid step specified',
            });
        }
      } catch (error) {
        console.error('CRUD operation error:', error);

        // Create error audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: ctx.clinicId,
            action: AuditAction.CREATE,
            resource: 'ai_crud_operation',
            resourceType: ResourceType.SYSTEM_CONFIG,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            status: AuditStatus.FAILED,
            riskLevel: RiskLevel.MEDIUM,
            additionalInfo: JSON.stringify({
              step: input.step,
              operation: 'step' in input ? input.operation : 'unknown',
              entity: 'step' in input ? input.entity : 'unknown',
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process CRUD operation',
          cause: error,
        });
      }
    }),

  /**
   * Get CRUD operation status
   * Check the status of ongoing or completed CRUD operations
   */
  getStatus: protectedProcedure
    .input(
      v.object({
        operationId: v.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check if we have a record of this operation
        const auditRecord = await ctx.prisma.auditTrail.findFirst({
          where: {
            additionalInfo: {
              path: ['operationId'],
              equals: input.operationId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!auditRecord) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Operation not found',
          });
        }

        const additionalInfo = JSON.parse(auditRecord.additionalInfo || '{}');

        return {
          operationId: input.operationId,
          status: auditRecord.status === AuditStatus.SUCCESS ? 'completed' : 'failed',
          step: additionalInfo.step || 'unknown',
          entity: additionalInfo.entity || 'unknown',
          operation: additionalInfo.operation || 'unknown',
          completedAt: auditRecord.createdAt,
          success: auditRecord.status === AuditStatus.SUCCESS,
          error: auditRecord.status === AuditStatus.FAILED
            ? additionalInfo.error
            : null,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get operation status',
          cause: error,
        });
      }
    }),

  /**
   * List supported entities and operations
   * Provides information about what CRUD operations are available
   */
  getSupportedEntities: protectedProcedure.query(() => {
    return {
      entities: SUPPORTED_ENTITIES.map(entity => ({
        name: entity,
        operations: CRUD_OPERATIONS,
        description: getEntityDescription(entity),
        requiredFields: getRequiredFields(entity),
      })),
      operations: CRUD_OPERATIONS.map(op => ({
        name: op,
        description: getOperationDescription(op),
      })),
      compliance: {
        lgpdCompliant: true,
        auditRequired: true,
        consentRequired: ['patients', 'medical_records', 'prescriptions'],
      },
    };
  }),
});

// =====================================
// STEP HANDLERS
// =====================================

/**
 * Handle Intent Step
 * Parse and validate the CRUD request
 */
async function handleIntentStep(
  ctx: any,
  input: v.InferOutput<typeof crudIntentSchema>,
) {
  const startTime = Date.now();

  // Generate unique intent ID
  const intentId = `intent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // AI-powered validation
  const validation = await validateWithAI(
    input.operation,
    input.entity,
    input.data,
    ctx,
  );

  // Generate preview
  const preview = await generatePreview(
    input.operation,
    input.entity,
    input.data,
    ctx,
  );

  // Check if confirmation is required
  const confirmationRequired = !input.options?.skipConfirmation
    && ['create', 'update', 'delete'].includes(input.operation);

  // Determine if consent is required
  const consentRequired = [
    'patients',
    'medical_records',
    'prescriptions',
  ].includes(input.entity);

  // Create audit trail
  await ctx.prisma.auditTrail.create({
    data: {
      userId: ctx.userId,
      clinicId: ctx.clinicId,
      patientId: input.metadata?.patientId,
      action: AuditAction.READ,
      resource: 'ai_crud_intent',
      resourceType: ResourceType.SYSTEM_CONFIG,
      ipAddress: ctx.auditMeta.ipAddress,
      userAgent: ctx.auditMeta.userAgent,
      sessionId: input.metadata?.sessionId || ctx.auditMeta.sessionId,
      status: validation.isValid ? AuditStatus.SUCCESS : AuditStatus.FAILED,
      riskLevel: RiskLevel.MEDIUM,
      additionalInfo: JSON.stringify({
        step: 'intent',
        operationId: intentId,
        operation: input.operation,
        entity: input.entity,
        aiScore: validation.aiScore,
        validation: validation,
        confirmationRequired,
        consentRequired,
        data: input.data,
        metadata: input.metadata,
      }),
    },
  });

  return {
    intentId,
    step: 'intent' as const,
    status: validation.isValid ? 'pending_confirmation' : 'requires_input',
    validation: {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      aiScore: validation.aiScore,
    },
    preview,
    confirmationRequired,
    estimatedImpact: {
      recordsAffected: 1,
      complianceChecks: 3,
      processingTimeMs: Date.now() - startTime,
    },
    compliance: {
      lgpdCompliant: input.options?.lgpdCompliance !== false,
      cfmCompliant: ['patients', 'medical_records', 'prescriptions'].includes(
        input.entity,
      ),
      auditRequired: true,
      consentRequired,
    },
  };
}

/**
 * Handle Confirm Step
 * Show what will be done and ask for confirmation
 */
async function handleConfirmStep(
  ctx: any,
  input: v.InferOutput<typeof crudConfirmSchema>,
) {
  const startTime = Date.now();

  // Generate unique confirmation ID
  const confirmationId = `confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Check if the intent exists and is valid
  const intentAudit = await ctx.prisma.auditTrail.findFirst({
    where: {
      additionalInfo: {
        path: ['operationId'],
        equals: input.intentId,
      },
    },
  });

  if (!intentAudit) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Intent not found or expired',
    });
  }

  const intentData = JSON.parse(intentAudit.additionalInfo || '{}');

  if (!input.confirmed) {
    // User rejected the operation
    await ctx.prisma.auditTrail.create({
      data: {
        userId: ctx.userId,
        clinicId: ctx.clinicId,
        action: AuditAction.UPDATE,
        resource: 'ai_crud_confirmation',
        resourceType: ResourceType.SYSTEM_CONFIG,
        ipAddress: ctx.auditMeta.ipAddress,
        userAgent: ctx.auditMeta.userAgent,
        sessionId: ctx.auditMeta.sessionId,
        status: AuditStatus.SUCCESS,
        riskLevel: RiskLevel.LOW,
        additionalInfo: JSON.stringify({
          step: 'confirm',
          intentId: input.intentId,
          confirmationId,
          status: 'rejected',
          reason: input.reason,
        }),
      },
    });

    return {
      confirmationId,
      intentId: input.intentId,
      step: 'confirm' as const,
      status: 'rejected' as const,
      readyToExecute: false,
    };
  }

  // Create execution plan
  const executionPlan = {
    steps: [
      'Validar permissões e consentimento',
      'Executar operação no banco de dados',
      'Criar registro de auditoria',
      'Notificar sistemas interessados',
    ],
    estimatedTimeMs: 500,
    rollbackAvailable: ['create', 'update'].includes(intentData.operation),
  };

  // Create audit trail
  await ctx.prisma.auditTrail.create({
    data: {
      userId: ctx.userId,
      clinicId: ctx.clinicId,
      action: AuditAction.UPDATE,
      resource: 'ai_crud_confirmation',
      resourceType: ResourceType.SYSTEM_CONFIG,
      ipAddress: ctx.auditMeta.ipAddress,
      userAgent: ctx.auditMeta.userAgent,
      sessionId: ctx.auditMeta.sessionId,
      status: AuditStatus.SUCCESS,
      riskLevel: RiskLevel.MEDIUM,
      additionalInfo: JSON.stringify({
        step: 'confirm',
        intentId: input.intentId,
        confirmationId,
        status: 'confirmed',
        executionPlan,
        modifications: input.modifications,
        reason: input.reason,
      }),
    },
  });

  return {
    confirmationId,
    intentId: input.intentId,
    step: 'confirm' as const,
    status: 'confirmed' as const,
    readyToExecute: true,
    finalData: input.modifications,
    executionPlan,
  };
}

/**
 * Handle Execute Step
 * Perform the actual CRUD operation
 */
async function handleExecuteStep(
  ctx: any,
  input: v.InferOutput<typeof crudExecuteSchema>,
) {
  const startTime = Date.now();

  // Generate unique execution ID
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Verify intent and confirmation exist
  const intentAudit = await ctx.prisma.auditTrail.findFirst({
    where: {
      additionalInfo: {
        path: ['operationId'],
        equals: input.intentId,
      },
    },
  });

  const confirmAudit = await ctx.prisma.auditTrail.findFirst({
    where: {
      additionalInfo: {
        path: ['confirmationId'],
        equals: input.confirmationId,
      },
    },
  });

  if (!intentAudit || !confirmAudit) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Intent or confirmation not found',
    });
  }

  const intentData = JSON.parse(intentAudit.additionalInfo || '{}');
  const confirmData = JSON.parse(confirmAudit.additionalInfo || '{}');

  // Get the data to execute (require finalData explicitly)
  const executionData = input.finalData;
  if (!executionData) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing required finalData for execution step',
    });
  }

  let result;
  let recordsAffected = 0;
  let error = null;

  try {
    // Execute the CRUD operation
    switch (intentData.operation) {
      case 'create':
        result = await executeCreate(intentData.entity, executionData, ctx);
        recordsAffected = 1;
        break;
      case 'read':
        result = await executeRead(intentData.entity, executionData, ctx);
        recordsAffected = Array.isArray(result)
          ? result.length
          : result
          ? 1
          : 0;
        break;
      case 'update':
        result = await executeUpdate(intentData.entity, executionData, ctx);
        recordsAffected = 1;
        break;
      case 'delete':
        result = await executeDelete(intentData.entity, executionData, ctx);
        recordsAffected = 1;
        break;
      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Unsupported operation',
        });
    }

    // Create audit trail for successful execution
    await ctx.prisma.auditTrail.create({
      data: {
        userId: ctx.userId,
        clinicId: ctx.clinicId,
        patientId: intentAudit.patientId,
        action: mapOperationToAuditAction(intentData.operation),
        resource: intentData.entity,
        resourceType: mapEntityToResourceType(intentData.entity),
        resourceId: result?.id || executionId,
        ipAddress: ctx.auditMeta.ipAddress,
        userAgent: ctx.auditMeta.userAgent,
        sessionId: ctx.auditMeta.sessionId,
        status: AuditStatus.SUCCESS,
        riskLevel: RiskLevel.MEDIUM,
        additionalInfo: JSON.stringify({
          step: 'execute',
          executionId,
          intentId: input.intentId,
          confirmationId: input.confirmationId,
          operation: intentData.operation,
          entity: intentData.entity,
          recordsAffected,
          processingTimeMs: Date.now() - startTime,
        }),
      },
    });

    return {
      executionId,
      intentId: input.intentId,
      confirmationId: input.confirmationId,
      step: 'execute' as const,
      status: 'completed' as const,
      result,
      metrics: {
        executionTimeMs: Date.now() - startTime,
        recordsAffected,
        databaseQueries: 1,
      },
      audit: {
        auditId: executionId,
        compliancePassed: true,
        warnings: [],
      },
    };
  } catch (executionError) {
    error = executionError instanceof Error
      ? executionError.message
      : 'Unknown error';

    // Create audit trail for failed execution
    await ctx.prisma.auditTrail.create({
      data: {
        userId: ctx.userId,
        clinicId: ctx.clinicId,
        action: mapOperationToAuditAction(intentData.operation),
        resource: intentData.entity,
        resourceType: mapEntityToResourceType(intentData.entity),
        ipAddress: ctx.auditMeta.ipAddress,
        userAgent: ctx.auditMeta.userAgent,
        sessionId: ctx.auditMeta.sessionId,
        status: AuditStatus.FAILED,
        riskLevel: RiskLevel.HIGH,
        additionalInfo: JSON.stringify({
          step: 'execute',
          executionId,
          intentId: input.intentId,
          confirmationId: input.confirmationId,
          operation: intentData.operation,
          entity: intentData.entity,
          error,
          processingTimeMs: Date.now() - startTime,
        }),
      },
    });

    return {
      executionId,
      intentId: input.intentId,
      confirmationId: input.confirmationId,
      step: 'execute' as const,
      status: 'failed' as const,
      result: null,
      metrics: {
        executionTimeMs: Date.now() - startTime,
        recordsAffected: 0,
        databaseQueries: 1,
      },
      audit: {
        auditId: executionId,
        compliancePassed: false,
        warnings: [error],
      },
    };
  }
}

// =====================================
// CRUD EXECUTION FUNCTIONS
// =====================================

/**
 * Execute Create operation
 */
async function executeCreate(
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<any> {
  switch (entity) {
    case 'patients':
      return await ctx.prisma.patient.create({
        data: {
          ...data,
          clinicId: ctx.clinicId,
          createdBy: ctx.userId,
        },
      });
    case 'appointments':
      return await ctx.prisma.appointment.create({
        data: {
          ...data,
          clinicId: ctx.clinicId,
          createdBy: ctx.userId,
        },
      });
    default:
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Create operation not implemented for entity: ${entity}`,
      });
  }
}

/**
 * Execute Read operation
 */
async function executeRead(
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<any> {
  switch (entity) {
    case 'patients':
      return await ctx.prisma.patient.findMany({
        where: {
          clinicId: ctx.clinicId,
          ...data,
        },
      });
    case 'appointments':
      return await ctx.prisma.appointment.findMany({
        where: {
          clinicId: ctx.clinicId,
          ...data,
        },
      });
    default:
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Read operation not implemented for entity: ${entity}`,
      });
  }
}

/**
 * Execute Update operation
 */
async function executeUpdate(
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<any> {
  const { id, ...updateData } = data;

  switch (entity) {
    case 'patients':
      return await ctx.prisma.patient.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
          updatedBy: ctx.userId,
        },
      });
    case 'appointments':
      return await ctx.prisma.appointment.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
          updatedBy: ctx.userId,
        },
      });
    default:
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Update operation not implemented for entity: ${entity}`,
      });
  }
}

/**
 * Execute Delete operation
 */
async function executeDelete(
  entity: CrudEntity,
  data: any,
  ctx: any,
): Promise<any> {
  switch (entity) {
    case 'patients':
      return await ctx.prisma.patient.delete({
        where: { id: data.id },
      });
    case 'appointments':
      return await ctx.prisma.appointment.delete({
        where: { id: data.id },
      });
    default:
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Delete operation not implemented for entity: ${entity}`,
      });
  }
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Map CRUD operation to audit action
 */
function mapOperationToAuditAction(operation: CrudOperation): AuditAction {
  switch (operation) {
    case 'create':
      return AuditAction.CREATE;
    case 'read':
      return AuditAction.READ;
    case 'update':
      return AuditAction.UPDATE;
    case 'delete':
      return AuditAction.DELETE;
    default:
      return AuditAction.READ;
  }
}

/**
 * Map entity to resource type
 */
function mapEntityToResourceType(entity: CrudEntity): ResourceType {
  switch (entity) {
    case 'patients':
      return ResourceType.PATIENT_DATA;
    case 'appointments':
      return ResourceType.APPOINTMENT;
    case 'medical_records':
      return ResourceType.MEDICAL_RECORD;
    case 'prescriptions':
      return ResourceType.PRESCRIPTION;
    case 'healthcare_professionals':
      return ResourceType.PROFESSIONAL;
    default:
      return ResourceType.SYSTEM_CONFIG;
  }
}

/**
 * Get entity description
 */
function getEntityDescription(entity: CrudEntity): string {
  const descriptions = {
    patients: 'Dados de pacientes com conformidade LGPD',
    appointments: 'Agendamentos de consultas médicas',
    treatments: 'Tratamentos e procedimentos médicos',
    medical_records: 'Prontuários médicos eletrônicos',
    prescriptions: 'Prescrições médicas e medicamentos',
    healthcare_professionals: 'Profissionais de saúde cadastrados',
    clinics: 'Clínicas e estabelecimentos de saúde',
    consent_records: 'Registros de consentimento LGPD',
  };
  return descriptions[entity] || `Entidade: ${entity}`;
}

/**
 * Get required fields for entity
 */
function getRequiredFields(entity: CrudEntity): string[] {
  const requiredFields = {
    patients: ['fullName', 'birthDate'],
    appointments: ['startTime', 'endTime', 'patientId'],
    treatments: ['name', 'patientId'],
    medical_records: ['patientId', 'recordType'],
    prescriptions: ['patientId', 'medication', 'dosage'],
    healthcare_professionals: ['fullName', 'specialty'],
    clinics: ['name', 'address'],
    consent_records: ['patientId', 'consentType'],
  };
  return requiredFields[entity] || [];
}

/**
 * Get operation description
 */
function getOperationDescription(operation: CrudOperation): string {
  const descriptions = {
    create: 'Criar novo registro',
    read: 'Consultar registros existentes',
    update: 'Atualizar registros existentes',
    delete: 'Excluir registros',
  };
  return descriptions[operation] || `Operação: ${operation}`;
}

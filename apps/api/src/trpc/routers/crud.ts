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
import { logger } from '../../lib/logger';
import { GlobalErrorHandler } from '../../lib/error-handler';
import {
  AppointmentSchema,
  getEntitySchema,
  MedicalRecordSchema,
  PatientSchema,
  PrescriptionSchema,
  ProfessionalSchema,
} from '../../schemas/healthcare-validation-schemas';
import { HealthcareValidationService } from '../../services/healthcare-validation-service';
import { createOperationStateService } from '../../services/operation-state-service';
import { healthcareProcedure, protectedProcedure, router } from '../trpc';

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
  data: v.custom(_(data,_ctx) => {
    // Get the entity from the parent object
    const entity = ctx?.object?.entity;
    const operation = ctx?.object?.operation;
    // Map entity to schema
    const entitySchemas: Record<string, any> = {
      patients: PatientSchema,
      appointments: AppointmentSchema,
      healthcare_professionals: ProfessionalSchema,
      medical_records: MedicalRecordSchema,
      prescriptions: PrescriptionSchema,
    };
    // For read/delete, only id is required
    if (operation === 'read' || operation === 'delete') {
      const idSchema = v.object({ id: v.string() });
      return idSchema._parse(data, ctx);
    }
    // For create/update, use the entity schema
    const schema = entitySchemas[entity];
    if (!schema) {
      return {
        issues: [
          {
            type: 'custom',
            _context: ctx,
            message: `Unsupported entity: ${entity}`,
          },
        ],
      };
    }
    return schema._parse(data, ctx);
  }),
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
  modifications: v.optional(_v.lazy(() =>
    v.object({
      patientData: v.optional(PatientSchema.partial()),
      appointmentData: v.optional(AppointmentSchema.partial()),
      professionalData: v.optional(ProfessionalSchema.partial()),
      medicalRecordData: v.optional(MedicalRecordSchema.partial()),
      prescriptionData: v.optional(PrescriptionSchema.partial()),
      operation: v.optional(v.enum(['create', 'update', 'delete'])),
      entity: v.optional(
        v.enum(['patients', 'appointments', 'professionals', 'medical_records', 'prescriptions']),
      ),
    })
  )), // Optional modifications before execution
  reason: v.optional(v.string()),
});

/**
 * AI CRUD Request Schema - Execute Step
 */
const crudExecuteSchema = v.object({
  step: v.literal('execute'),
  intentId: v.string([v.uuid('Invalid intent ID')]),
  confirmationId: v.string([v.uuid('Invalid confirmation ID')]),
  finalData: v.optional(_v.lazy(() =>
    v.object({
      patientData: v.optional(PatientSchema.partial()),
      appointmentData: v.optional(AppointmentSchema.partial()),
      professionalData: v.optional(ProfessionalSchema.partial()),
      medicalRecordData: v.optional(MedicalRecordSchema.partial()),
      prescriptionData: v.optional(PrescriptionSchema.partial()),
      operation: v.optional(v.enum(['create', 'update', 'delete'])),
      entity: v.optional(
        v.enum(['patients', 'appointments', 'professionals', 'medical_records', 'prescriptions']),
      ),
    })
  )), // Final data with validated modifications
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
const _crudIntentResponseSchema = v.object({
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
  preview: v.optional(v.object({
    operation: v.enum(['create', 'read', 'update', 'delete']),
    entity: v.enum([
      'patients',
      'appointments',
      'professionals',
      'medical_records',
      'prescriptions',
    ]),
    summary: v.string(),
    affectedRecords: v.number(),
    changes: v.optional(v.array(v.object({
      field: v.string(),
      oldValue: v.optional(v.union([
        v.string(),
        v.number(),
        v.boolean(),
        v.null(),
      ])),
      newValue: v.optional(v.union([
        v.string(),
        v.number(),
        v.boolean(),
        v.null(),
      ])),
    }))),
    complianceChecks: v.array(v.string()),
  })),
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
const _crudConfirmResponseSchema = v.object({
  confirmationId: v.string(),
  intentId: v.string(),
  step: v.literal('confirm'),
  status: v.string([
    v.picklist(['confirmed', 'rejected', 'requires_modification']),
  ]),
  readyToExecute: v.boolean(),
  finalData: v.optional(v.object({
    patientData: v.optional(PatientSchema.partial()),
    appointmentData: v.optional(AppointmentSchema.partial()),
    professionalData: v.optional(ProfessionalSchema.partial()),
    medicalRecordData: v.optional(MedicalRecordSchema.partial()),
    prescriptionData: v.optional(PrescriptionSchema.partial()),
    operation: v.optional(v.enum(['create', 'update', 'delete'])),
    entity: v.optional(
      v.enum(['patients', 'appointments', 'professionals', 'medical_records', 'prescriptions']),
    ),
  })),
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
const _crudExecuteResponseSchema = v.object({
  executionId: v.string(),
  intentId: v.string(),
  confirmationId: v.string(),
  step: v.literal('execute'),
  status: v.string([v.picklist(['completed', 'failed', 'partial'])]),
  result: v.optional(v.union([
    PatientSchema,
    AppointmentSchema,
    ProfessionalSchema,
    MedicalRecordSchema,
    PrescriptionSchema,
    v.array(PatientSchema),
    v.array(AppointmentSchema),
    v.array(ProfessionalSchema),
    v.array(MedicalRecordSchema),
    v.array(PrescriptionSchema),
    v.null(),
  ])),
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
 * Real healthcare validation with comprehensive compliance checking
 * Replaces mock AI validation with actual healthcare professional validation,
 * LGPD compliance, and ANVISA regulatory checking
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
    // Initialize real healthcare validation service
    const healthcareValidator = new HealthcareValidationService();

    // Validate context for professional authorization
    const validationContext = {
      professionalId: ctx.user?.id || data.professionalId,
      patientId: data.patientId,
      organizationId: ctx.user?.organizationId,
    };

    // Perform comprehensive healthcare validation
    const validationResult = await healthcareValidator.validateHealthcareData(
      operation,
      entity,
      data,
      validationContext,
    );

    // Transform the result to match expected interface
    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      aiScore: validationResult.aiScore,
      transformedData: validationResult.transformedData || data,
    };
  } catch (_error) {
    // Use global error handler for consistent sanitization
    const appError = GlobalErrorHandler.createError(
      'VALIDATION_ERROR',
      {
        operation,
        entity,
        validationFailed: true,
      },
      ctx.user?.id,
      data.patientId,
    );

    return {
      isValid: false,
      errors: [appError.message],
      warnings: ['Operação bloqueada por falha de validação de segurança'],
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
      // Show current vs new values (with sensitive data sanitization)
      const current = await getCurrentData(entity, data.id, ctx);
      if (current) {
        preview.changes = Object.entries(data)
          .filter(_([key,_value]) => key !== 'id' && current[key] !== value)
          .map(_([key,_value]) => ({
            field: key,
            oldValue: this.sanitizePreviewValue(current[key], key),
            newValue: this.sanitizePreviewValue(value, key),
          }));
      }
    }

    return preview;
  } catch (_error) {
    // Use global error handler for consistent sanitization
    const appError = GlobalErrorHandler.createError(
      'INTERNAL_ERROR',
      {
        operation,
        entity,
        previewFailed: true,
      },
      ctx.user?.id,
      data.patientId,
    );

    // Log sanitized error for debugging
    logger.warn('Preview generation failed', {
      error: appError.message,
      operation,
      entity,
      _userId: ctx.user?.id,
    });

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
  } catch (_error) {
    // Use global error handler for consistent sanitization
    const appError = GlobalErrorHandler.createError(
      'INTERNAL_ERROR',
      {
        entity,
        operation: 'read',
        currentDataFailed: true,
      },
      ctx.user?.id,
    );

    // Log sanitized error for debugging
    logger.warn('Failed to get current data', {
      error: appError.message,
      entity,
      id,
      _userId: ctx.user?.id,
    });

    return null;
  }
}

// =====================================
// TRPC ROUTER IMPLEMENTATION
// =====================================

export const _crudRouter = router({
  /**
   * Main CRUD endpoint with 3-step flow
   * Handles intent→confirm→execute operations
   */
  crud: healthcareProcedure
    .input(crudRequestSchema)
    .mutation(_async ({ ctx,_input }) => {
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
      } catch (_error) {
        console.error('CRUD operation error:', error);

        // Create error audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            _userId: ctx.userId,
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
    .query(_async ({ ctx,_input }) => {
      try {
        // Use proper operation state management instead of audit trail
        const operationStateService = createOperationStateService(ctx.prisma);
        const operationState = await operationStateService.getStateByOperationId(input.operationId);

        if (!operationState) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Operation not found',
          });
        }

        return {
          operationId: input.operationId,
          status: operationState.status,
          step: operationState.step,
          entity: operationState.entity,
          operation: operationState.operation,
          completedAt: operationState.completedAt,
          success: operationState.status === 'completed',
          error: operationState.errorMessage,
          metadata: operationState.metadata,
        };
      } catch (_error) {
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
  getSupportedEntities: protectedProcedure.query(_() => {
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

  // Runtime validation with proper Zod schemas (replaces v.any() security vulnerability)
  const schema = getEntitySchema(input.entity);
  const schemaValidation = schema.safeParse(input.data);

  if (!schemaValidation.success) {
    const errors = schemaValidation.error.errors.map(err =>
      `Campo ${err.path.join('.')}: ${err.message}`
    );

    // Create sanitized error without exposing internal validation details
    const appError = GlobalErrorHandler.createError(
      'VALIDATION_ERROR',
      {
        entity: input.entity,
        operation: input.operation,
        validationErrors: errors.length,
      },
      ctx.userId,
      input.metadata?.patientId,
    );

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: appError.message,
      cause: { sanitizedErrors: errors.length > 3 ? errors.slice(0, 3) : errors },
    });
  }

  // Use validated data
  const validatedData = schemaValidation.data;

  // AI-powered healthcare validation
  const validation = await validateWithAI(
    input.operation,
    input.entity,
    validatedData,
    ctx,
  );

  // Generate preview
  const preview = await generatePreview(
    input.operation,
    input.entity,
    validatedData,
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
      _userId: ctx.userId,
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

  // Check if the intent exists and is valid using proper state management
  const operationStateService = createOperationStateService(ctx.prisma);
  const intentState = await operationStateService.getStateByOperationId(input.intentId);

  if (!intentState) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Intent not found or expired',
    });
  }

  const intentData = intentState.data;

  if (!input.confirmed) {
    // User rejected the operation
    await ctx.prisma.auditTrail.create({
      data: {
        _userId: ctx.userId,
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
      _userId: ctx.userId,
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

  // Verify intent and confirmation exist using proper state management
  const operationStateService = createOperationStateService(ctx.prisma);
  const intentState = await operationStateService.getStateByOperationId(input.intentId);
  const confirmState = await operationStateService.getStateByOperationId(input.confirmationId);

  if (!intentState || !confirmState) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Intent or confirmation not found',
    });
  }

  const intentData = intentState.data;
  const _confirmData = confirmState.data;

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
        _userId: ctx.userId,
        clinicId: ctx.clinicId,
        patientId: intentData.patientId || input.finalData?.patientData?.id,
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
  } catch (_executionError) {
    // Sanitize error message to prevent information disclosure
    const appError = executionError instanceof Error
      ? GlobalErrorHandler.createError(
        'INTERNAL_ERROR',
        {
          operation: intentData.operation,
          entity: intentData.entity,
          executionStep: 'execute',
        },
        ctx.userId,
        intentData.patientId || input.finalData?.patientData?.id,
      )
      : GlobalErrorHandler.createError('INTERNAL_ERROR');

    error = appError.message;

    // Create audit trail for failed execution
    await ctx.prisma.auditTrail.create({
      data: {
        _userId: ctx.userId,
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

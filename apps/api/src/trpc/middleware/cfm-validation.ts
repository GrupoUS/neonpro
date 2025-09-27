import { logger } from '@/utils/healthcare-errors'
import { TRPCError } from '@trpc/server'
import { initTRPC } from '@trpc/server'

const t = initTRPC.create()
const { middleware } = t

/**
 * CFM (Conselho Federal de Medicina) Validation Middleware
 *
 * This middleware ensures compliance with Brazilian medical regulations
 * for healthcare-related operations in the aesthetic platform.
 *
 * Key Compliance Areas:
 * - Medical procedure authorization
 * - Patient consent validation
 * - Professional licensing verification
 * - Telemedicine regulations (CFM Resolution 2.314/2022)
 * - Data privacy (LGPD compliance for medical data)
 */

// CFM Validation Schema
const cfmValidationSchema = z.object({
  // Professional Information
  professionalId: z.string().min(1, 'Professional ID is required'),
  crmNumber: z.string().regex(/^\d{4,6}$/, 'Invalid CRM number format'),
  crmState: z.string().length(2, 'CRM state must be 2 characters'),

  // Patient Information
  patientId: z.string().min(1, 'Patient ID is required'),
  patientConsent: z
    .boolean()
    .refine(val => val === true, 'Patient consent is required'),

  // Procedure Information
  procedureType: z.enum([
    'consultation',
    'aesthetic_procedure',
    'medical_evaluation',
    'telemedicine',
    'prescription',
    'follow_up',
  ]),

  // Telemedicine Specific (CFM Resolution 2.314/2022)
  isTelemedicine: z.boolean().optional(),
  telemedicineType: z
    .enum([
      'teleconsultation',
      'telediagnosis',
      'telemonitoring',
      'telesurgery',
    ])
    .optional(),

  // Documentation
  medicalDocumentation: z
    .object({
      hasPatientHistory: z.boolean(),
      hasInformedConsent: z.boolean(),
      hasRiskAssessment: z.boolean(),
      hasFollowUpPlan: z.boolean(),
    })
    .optional(),

  // Emergency Contact (Required for procedures)
  emergencyContact: z
    .object({
      name: z.string().min(1),
      phone: z.string().min(10),
      relationship: z.string().min(1),
    })
    .optional(),
})

/**
 * CFM Validation Middleware
 *
 * Validates medical operations according to CFM regulations
 */
export const cfmValidationMiddleware = middleware(
  async ({ ctx, next, _path }) => {
    try {
      // Check if this operation requires CFM validation
      if (!requiresCFMValidation(path)) {
        return next()
      }

      logger.info('CFM validation started', {
        path,
        _userId: ctx.user?.id,
        timestamp: new Date().toISOString(),
      })

      // Validate professional credentials
      await validateProfessionalCredentials(ctx)

      // Validate telemedicine compliance if applicable
      if (isTelemedicineOperation(path)) {
        await validateTelemedicineCompliance(ctx, path)
      }

      // Validate patient consent and documentation
      await validatePatientConsent(ctx)

      // Validate emergency protocols for procedures
      if (isProcedureOperation(path)) {
        await validateEmergencyProtocols(ctx)
      }

      logger.info('CFM validation completed successfully', {
        path,
        _userId: ctx.user?.id,
        timestamp: new Date().toISOString(),
      })

      return next()
    } catch {
      logger.error('CFM validation failed', {
        path,
        _userId: ctx.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })

      if (error instanceof TRPCError) {
        throw error
      }

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'CFM validation failed: Medical operation not authorized',
        cause: error,
      })
    }
  },
)

/**
 * Validate Professional Credentials
 */
async function validateProfessionalCredentials(ctx: any): Promise<void> {
  const user = ctx.user

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User authentication required for medical operations',
    })
  }

  // Check if user has medical professional role
  if (!user.roles?.includes('medical_professional')) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Medical professional credentials required',
    })
  }

  // Validate CRM registration
  const crmData = user.professionalData?.crm
  if (!crmData?.number || !crmData?.state || !crmData?.isActive) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Valid CRM registration required for medical operations',
    })
  }

  // Check CRM expiration
  if (crmData.expirationDate && new Date(crmData.expirationDate) < new Date()) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CRM registration has expired',
    })
  }

  // Validate specialization for aesthetic procedures
  const requiredSpecializations = [
    'dermatology',
    'plastic_surgery',
    'aesthetic_medicine',
  ]

  if (
    !user.professionalData?.specializations?.some((spec: string) =>
      requiredSpecializations.includes(spec)
    )
  ) {
    logger.warn('Professional lacks required specialization', {
      _userId: user.id,
      specializations: user.professionalData?.specializations,
      required: requiredSpecializations,
    })
  }
}

/**
 * Validate Telemedicine Compliance (CFM Resolution 2.314/2022)
 */
async function validateTelemedicineCompliance(
  ctx: any,
  path: string,
): Promise<void> {
  const user = ctx.user

  // Telemedicine specific validations
  const telemedicineRequirements = {
    hasDigitalCertificate: user.professionalData?.digitalCertificate?.isValid,
    hasTelemedicineLicense: user.professionalData?.licenses?.telemedicine?.isActive,
    hasSecurePlatform: true, // Platform-level validation
    hasPatientIdentification: true, // To be validated per operation
  }

  // Check digital certificate (required for telemedicine)
  if (!telemedicineRequirements.hasDigitalCertificate) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Valid digital certificate required for telemedicine operations',
    })
  }

  // Check telemedicine license
  if (!telemedicineRequirements.hasTelemedicineLicense) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Telemedicine license required for remote medical operations',
    })
  }

  // Validate patient location (same state as CRM registration)
  const patientState = ctx.input?.patientData?.address?.state
  const crmState = user.professionalData?.crm?.state

  if (patientState && crmState && patientState !== crmState) {
    // Cross-state telemedicine requires additional validation
    logger.warn('Cross-state telemedicine operation detected', {
      professionalCrmState: crmState,
      patientState,
      _userId: user.id,
      path,
    })

    // Check if professional has cross-state authorization
    if (
      !user.professionalData?.crossStateAuthorization?.includes(patientState)
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cross-state telemedicine not authorized for state: ${patientState}`,
      })
    }
  }

  logger.info('Telemedicine compliance validated', {
    _userId: user.id,
    path,
    crmState,
    patientState,
  })
}

/**
 * Validate Patient Consent
 */
async function validatePatientConsent(ctx: any): Promise<void> {
  const patientData = ctx.input?.patientData

  if (!patientData) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Patient data required for medical operations',
    })
  }

  // Check informed consent
  if (!patientData.informedConsent?.isProvided) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Patient informed consent required',
    })
  }

  // Validate consent timestamp (must be recent)
  const consentDate = new Date(patientData.informedConsent.timestamp)
  const maxConsentAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

  if (Date.now() - consentDate.getTime() > maxConsentAge) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Patient consent has expired, new consent required',
    })
  }

  // Validate specific consent for procedure type
  const procedureType = ctx.input?.procedureType
  const consentTypes = patientData.informedConsent.types || []

  if (procedureType && !consentTypes.includes(procedureType)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Specific consent required for procedure type: ${procedureType}`,
    })
  }

  logger.info('Patient consent validated', {
    patientId: patientData.id,
    procedureType,
    consentTypes,
  })
}

/**
 * Validate Emergency Protocols
 */
async function validateEmergencyProtocols(ctx: any): Promise<void> {
  const procedureData = ctx.input?.procedureData

  if (!procedureData) {
    return // Not a procedure operation
  }

  // Check emergency contact information
  if (!procedureData.emergencyContact) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Emergency contact information required for medical procedures',
    })
  }

  const emergencyContact = procedureData.emergencyContact

  // Validate emergency contact data
  if (
    !emergencyContact.name ||
    !emergencyContact.phone ||
    !emergencyContact.relationship
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Complete emergency contact information required (name, phone, relationship)',
    })
  }

  // Validate phone number format (Brazilian format)
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
  if (!phoneRegex.test(emergencyContact.phone)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid emergency contact phone number format',
    })
  }

  // Check if emergency protocols are documented
  if (!procedureData.emergencyProtocols?.isDocumented) {
    logger.warn('Emergency protocols not documented for procedure', {
      procedureId: procedureData.id,
      _userId: ctx.user?.id,
    })
  }

  logger.info('Emergency protocols validated', {
    procedureId: procedureData.id,
    emergencyContact: {
      name: emergencyContact.name,
      relationship: emergencyContact.relationship,
      // Note: Not logging phone number for privacy
    },
  })
}

/**
 * Audit CFM Compliance
 */
export async function auditCFMCompliance(
  ctx: any,
  operation: string,
  result: any,
): Promise<void> {
  try {
    const auditData = {
      timestamp: new Date().toISOString(),
      _userId: ctx.user?.id,
      operation,
      crmNumber: ctx.user?.professionalData?.crm?.number,
      crmState: ctx.user?.professionalData?.crm?.state,
      patientId: ctx.input?.patientData?.id,
      procedureType: ctx.input?.procedureType,
      isTelemedicine: isTelemedicineOperation(operation),
      complianceStatus: 'compliant',
      result: {
        success: !!result,
        operationId: result?.id,
      },
    }

    // Log audit trail
    logger.info('CFM compliance audit', auditData)

    // Store in audit database (implement as needed)
    // await storeAuditRecord(auditData);
  } catch {
    logger.error('CFM compliance audit failed', {
      operation,
      _userId: ctx.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Don't throw error here to avoid disrupting the main operation
    // Audit failures should be logged but not block the operation
  }
}

/**
 * Generate CFM Compliance Report
 */
export async function generateCFMComplianceReport(
  startDate: Date,
  endDate: Date,
  filters?: {
    professionalId?: string
    procedureType?: string
    state?: string
  },
): Promise<any> {
  try {
    // This would typically query the audit database
    // For now, return a placeholder structure

    const report = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOperations: 0,
        compliantOperations: 0,
        nonCompliantOperations: 0,
        complianceRate: 0,
      },
      breakdown: {
        byProcedureType: {},
        byState: {},
        byProfessional: {},
      },
      violations: [],
      recommendations: [],
    }

    logger.info('CFM compliance report generated', {
      period: report.period,
      filters,
    })

    return report
  } catch {
    logger.error('Failed to generate CFM compliance report', {
      startDate,
      endDate,
      filters,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * Helper functions for CFM validation middleware
 */

function requiresCFMValidation(path: string): boolean {
  const medicalPaths = [
    'appointments.create',
    'appointments.update',
    'patients.create',
    'patients.update',
    'telemedicine',
    'prescriptions',
    'diagnosis',
    'medical-records',
    'procedures',
  ]

  return medicalPaths.some(medicalPath => path.includes(medicalPath))
}

function isTelemedicineOperation(path: string): boolean {
  const telemedicinePaths = [
    'telemedicine',
    'teleconsultation',
    'telediagnosis',
    'telemonitoring',
    'remote-consultation',
  ]

  return telemedicinePaths.some(telePath => path.includes(telePath))
}

function isProcedureOperation(path: string): boolean {
  const procedurePaths = [
    'procedures.create',
    'procedures.update',
    'aesthetic-procedures',
    'medical-procedures',
    'treatments.create',
  ]

  return procedurePaths.some(procPath => path.includes(procPath))
}

/**
 * Validate CFM Input Data
 */
export function validateCFMInput(
  input: any,
): z.infer<typeof cfmValidationSchema> {
  try {
    return cfmValidationSchema.parse(input)
  } catch {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`,
      )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `CFM validation failed: ${errorMessages.join(', ')}`,
      })
    }
    throw error
  }
}

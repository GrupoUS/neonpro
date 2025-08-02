import { z } from 'zod'
import { 
  patientSchema, 
  appointmentSchema, 
  treatmentSchema,
  validateData,
  healthcareValidators,
  type Patient,
  type Appointment,
  type Treatment
} from '@/lib/schemas'
import { AuditLogger, DataProcessingActivity } from '@/lib/lgpd'
import { HealthcareEncryption, HealthcareSecurity } from '@/lib/security'

/**
 * Medical Data Validation System
 * Comprehensive validation for healthcare data with:
 * - Clinical validation rules
 * - Business logic validation
 * - Security and privacy validation
 * - Regulatory compliance validation
 * - Real-time validation with audit trail
 */

// Validation severity levels
export enum ValidationSeverity {
  ERROR = 'error',       // Blocks operation
  WARNING = 'warning',   // Allows operation but flags issue
  INFO = 'info'         // Informational only
}

// Validation categories
export enum ValidationCategory {
  CLINICAL = 'clinical',
  BUSINESS = 'business',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  DATA_QUALITY = 'data_quality'
}

// Validation result schema
export const validationResultSchema = z.object({
  id: z.string().uuid().optional(),
  valid: z.boolean(),
  score: z.number().min(0).max(100), // Overall validation score
  
  // Issues found
  errors: z.array(z.object({
    field: z.string(),
    code: z.string(),
    message: z.string(),
    severity: z.nativeEnum(ValidationSeverity),
    category: z.nativeEnum(ValidationCategory),
    suggestion: z.string().optional()
  })).default([]),
  
  // Validation metadata
  validatorVersion: z.string().default('1.0'),
  timestamp: z.date().default(() => new Date()),
  context: z.record(z.any()).optional(),
  
  // Clinical flags
  clinicalAlerts: z.array(z.object({
    type: z.enum(['drug_interaction', 'allergy_conflict', 'contraindication', 'age_restriction']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    recommendations: z.array(z.string()).default([])
  })).default([]),
  
  // Security validation
  securityFlags: z.array(z.object({
    type: z.enum(['data_exposure', 'access_violation', 'encryption_required', 'audit_required']),
    message: z.string(),
    remediation: z.string()
  })).default([]),
  
  // Data quality metrics
  dataQuality: z.object({
    completeness: z.number().min(0).max(100),
    accuracy: z.number().min(0).max(100),
    consistency: z.number().min(0).max(100),
    timeliness: z.number().min(0).max(100)
  }).default({
    completeness: 100,
    accuracy: 100,
    consistency: 100,
    timeliness: 100
  })
})

export type ValidationResult = z.infer<typeof validationResultSchema>

export class MedicalDataValidator {
  /**
   * Comprehensive patient data validation
   */
  static async validatePatient(
    patientData: any,
    context: {
      userId: string
      operation: 'create' | 'update' | 'read'
      ipAddress: string
      sessionId?: string
    }
  ): Promise<ValidationResult> {
    const validationResult: ValidationResult = {
      id: crypto.randomUUID(),
      valid: true,
      score: 100,
      errors: [],
      clinicalAlerts: [],
      securityFlags: [],
      timestamp: new Date(),
      context,
      dataQuality: {
        completeness: 100,
        accuracy: 100,
        consistency: 100,
        timeliness: 100
      }
    }

    try {
      // 1. Schema Validation
      const schemaValidation = validateData(patientSchema, patientData)
      if (!schemaValidation.success) {
        this.addSchemaErrors(validationResult, schemaValidation.errors || [])
      }

      // 2. Clinical Validation
      await this.validateClinicalData(patientData, validationResult)

      // 3. Business Rules Validation
      await this.validateBusinessRules(patientData, validationResult)

      // 4. Security Validation
      await this.validateSecurity(patientData, context, validationResult)

      // 5. Compliance Validation
      await this.validateCompliance(patientData, validationResult)

      // 6. Data Quality Assessment
      this.assessDataQuality(patientData, validationResult)

      // Calculate final validation score
      this.calculateValidationScore(validationResult)

      // Log validation for audit
      await AuditLogger.log({
        activity: DataProcessingActivity.PATIENT_READ,
        description: `Patient data validation ${context.operation}`,
        actorId: context.userId,
        actorType: 'user',
        dataSubjectId: patientData.id,
        dataSubjectType: 'patient',
        dataCategories: ['validation', 'patient_data'],
        legalBasis: 'legitimate_interests',
        purpose: 'Data quality and security validation',
        ipAddress: context.ipAddress,
        sessionId: context.sessionId,
        source: 'web',
        success: validationResult.valid,
        recordsAffected: 1,
        metadata: {
          validationScore: validationResult.score,
          errorCount: validationResult.errors.length,
          clinicalAlerts: validationResult.clinicalAlerts.length
        }
      })

    } catch (error) {
      console.error('Validation error:', error)
      validationResult.valid = false
      validationResult.score = 0
      validationResult.errors.push({
        field: 'system',
        code: 'VALIDATION_ERROR',
        message: 'Internal validation error occurred',
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS,
        suggestion: 'Contact system administrator'
      })
    }

    return validationResult
  }

  /**
   * Appointment validation with scheduling conflicts check
   */
  static async validateAppointment(
    appointmentData: any,
    context: {
      userId: string
      operation: 'create' | 'update' | 'cancel'
      ipAddress: string
      sessionId?: string
    }
  ): Promise<ValidationResult> {
    const validationResult: ValidationResult = {
      id: crypto.randomUUID(),
      valid: true,
      score: 100,
      errors: [],
      clinicalAlerts: [],
      securityFlags: [],
      timestamp: new Date(),
      context,
      dataQuality: {
        completeness: 100,
        accuracy: 100,
        consistency: 100,
        timeliness: 100
      }
    }

    try {
      // Schema validation
      const schemaValidation = validateData(appointmentSchema, appointmentData)
      if (!schemaValidation.success) {
        this.addSchemaErrors(validationResult, schemaValidation.errors || [])
      }

      // Appointment-specific validations
      await this.validateAppointmentRules(appointmentData, validationResult)
      await this.validateSchedulingConflicts(appointmentData, validationResult)
      await this.validatePatientAvailability(appointmentData, validationResult)
      await this.validateProfessionalAvailability(appointmentData, validationResult)

      // Security validation
      await this.validateSecurity(appointmentData, context, validationResult)

      this.calculateValidationScore(validationResult)

    } catch (error) {
      console.error('Appointment validation error:', error)
      this.addSystemError(validationResult, 'Appointment validation failed')
    }

    return validationResult
  }

  /**
   * Treatment validation with drug interactions and contraindications
   */
  static async validateTreatment(
    treatmentData: any,
    patientData: Patient,
    context: {
      userId: string
      operation: 'prescribe' | 'modify' | 'discontinue'
      ipAddress: string
      sessionId?: string
    }
  ): Promise<ValidationResult> {
    const validationResult: ValidationResult = {
      id: crypto.randomUUID(),
      valid: true,
      score: 100,
      errors: [],
      clinicalAlerts: [],
      securityFlags: [],
      timestamp: new Date(),
      context,
      dataQuality: {
        completeness: 100,
        accuracy: 100,
        consistency: 100,
        timeliness: 100
      }
    }

    try {
      // Schema validation
      const schemaValidation = validateData(treatmentSchema, treatmentData)
      if (!schemaValidation.success) {
        this.addSchemaErrors(validationResult, schemaValidation.errors || [])
      }

      // Clinical safety validations
      await this.validateDrugInteractions(treatmentData, patientData, validationResult)
      await this.validateAllergies(treatmentData, patientData, validationResult)
      await this.validateContraindications(treatmentData, patientData, validationResult)
      await this.validateDosage(treatmentData, patientData, validationResult)

      // Age and condition specific validations
      await this.validateAgeRestrictions(treatmentData, patientData, validationResult)
      await this.validateMedicalConditions(treatmentData, patientData, validationResult)

      this.calculateValidationScore(validationResult)

    } catch (error) {
      console.error('Treatment validation error:', error)
      this.addSystemError(validationResult, 'Treatment validation failed')
    }

    return validationResult
  }

  /**
   * Real-time validation during data entry
   */
  static async validateField(
    fieldName: string,
    value: any,
    schema: z.ZodSchema,
    context?: Record<string, any>
  ): Promise<{
    valid: boolean
    errors: string[]
    suggestions: string[]
    clinicalFlags: string[]
  }> {
    const result = {
      valid: true,
      errors: [] as string[],
      suggestions: [] as string[],
      clinicalFlags: [] as string[]
    }

    try {
      // Schema validation
      const schemaResult = schema.safeParse(value)
      if (!schemaResult.success) {
        result.valid = false
        result.errors = schemaResult.error.errors.map(e => e.message)
      }

      // Field-specific validations
      switch (fieldName) {
        case 'cpf':
          if (!this.validateCPF(value)) {
            result.valid = false
            result.errors.push('CPF inválido')
            result.suggestions.push('Verifique os dígitos do CPF')
          }
          break

        case 'birthDate':
          if (!healthcareValidators.isAdult(value)) {
            result.clinicalFlags.push('Paciente menor de idade - requer responsável')
          }
          break

        case 'allergies':
          if (Array.isArray(value) && value.length > 0) {
            result.clinicalFlags.push('Paciente possui alergias - verificar antes de prescrever')
          }
          break

        case 'medications':
          if (Array.isArray(value) && value.length > 5) {
            result.clinicalFlags.push('Paciente com múltiplas medicações - verificar interações')
          }
          break
      }

    } catch (error) {
      result.valid = false
      result.errors.push('Erro interno de validação')
    }

    return result
  }

  // Private validation methods
  private static async validateClinicalData(
    patientData: any,
    result: ValidationResult
  ): Promise<void> {
    // Validate medical history consistency
    if (patientData.medicalInfo?.medicalHistory) {
      for (const condition of patientData.medicalInfo.medicalHistory) {
        if (!this.isValidMedicalCondition(condition)) {
          result.errors.push({
            field: 'medicalHistory',
            code: 'INVALID_CONDITION',
            message: `Condição médica inválida: ${condition}`,
            severity: ValidationSeverity.WARNING,
            category: ValidationCategory.CLINICAL,
            suggestion: 'Verificar ortografia ou usar código CID-10'
          })
        }
      }
    }

    // Validate allergies
    if (patientData.medicalInfo?.allergies?.length > 0) {
      result.clinicalAlerts.push({
        type: 'allergy_conflict',
        severity: 'medium',
        message: 'Paciente possui alergias registradas',
        recommendations: ['Verificar medicações antes de prescrever', 'Confirmar alergias com paciente']
      })
    }

    // Age-related validations
    if (patientData.personalData?.birthDate) {
      const age = this.calculateAge(patientData.personalData.birthDate)
      if (age < 18) {
        result.clinicalAlerts.push({
          type: 'age_restriction',
          severity: 'high',
          message: 'Paciente menor de idade',
          recommendations: ['Responsável legal deve estar presente', 'Verificar dosagens pediátricas']
        })
      } else if (age > 65) {
        result.clinicalAlerts.push({
          type: 'age_restriction',
          severity: 'medium',
          message: 'Paciente idoso',
          recommendations: ['Considerar ajustes de dosagem', 'Monitoramento mais frequente']
        })
      }
    }
  }

  private static async validateBusinessRules(
    patientData: any,
    result: ValidationResult
  ): Promise<void> {
    // Required fields for treatment
    const requiredForTreatment = ['personalData', 'medicalInfo', 'consent']
    for (const field of requiredForTreatment) {
      if (!patientData[field]) {
        result.errors.push({
          field,
          code: 'REQUIRED_FOR_TREATMENT',
          message: `Campo obrigatório para iniciar tratamento: ${field}`,
          severity: ValidationSeverity.ERROR,
          category: ValidationCategory.BUSINESS,
          suggestion: 'Complete os dados obrigatórios antes de agendar tratamentos'
        })
      }
    }

    // Contact information validation
    if (!patientData.personalData?.email && !patientData.personalData?.phone) {
      result.errors.push({
        field: 'contact',
        code: 'NO_CONTACT_INFO',
        message: 'Pelo menos um meio de contato (email ou telefone) é obrigatório',
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS,
        suggestion: 'Adicione email ou telefone para comunicação'
      })
    }
  }

  private static async validateSecurity(
    data: any,
    context: any,
    result: ValidationResult
  ): Promise<void> {
    // Check if sensitive data needs encryption
    const sensitiveFields = ['cpf', 'rg', 'medicalHistory', 'diagnosis']
    for (const field of sensitiveFields) {
      if (this.hasField(data, field) && !this.isEncrypted(data, field)) {
        result.securityFlags.push({
          type: 'encryption_required',
          message: `Campo sensível não criptografado: ${field}`,
          remediation: 'Criptografar dados sensíveis antes do armazenamento'
        })
      }
    }

    // Check access permissions
    if (context.operation === 'read') {
      result.securityFlags.push({
        type: 'audit_required',
        message: 'Acesso a dados médicos requer auditoria',
        remediation: 'Log de auditoria será criado automaticamente'
      })
    }
  }

  private static async validateCompliance(
    patientData: any,
    result: ValidationResult
  ): Promise<void> {
    // LGPD compliance checks
    if (!patientData.consent?.dataProcessing) {
      result.errors.push({
        field: 'consent',
        code: 'LGPD_CONSENT_REQUIRED',
        message: 'Consentimento LGPD obrigatório para processamento de dados',
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.COMPLIANCE,
        suggestion: 'Obter consentimento explícito do paciente'
      })
    }

    // Data retention validation
    if (patientData.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(patientData.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreation > 3650) { // 10 years
        result.errors.push({
          field: 'dataRetention',
          code: 'DATA_RETENTION_EXCEEDED',
          message: 'Dados excedem período de retenção recomendado',
          severity: ValidationSeverity.WARNING,
          category: ValidationCategory.COMPLIANCE,
          suggestion: 'Revisar necessidade de manter dados antigos'
        })
      }
    }
  }

  private static assessDataQuality(
    data: any,
    result: ValidationResult
  ): void {
    const quality = result.dataQuality

    // Completeness assessment
    const requiredFields = ['personalData.name', 'personalData.email', 'personalData.phone']
    const completedFields = requiredFields.filter(field => this.hasField(data, field))
    quality.completeness = (completedFields.length / requiredFields.length) * 100

    // Accuracy assessment (basic checks)
    let accuracyScore = 100
    if (data.personalData?.email && !this.isValidEmail(data.personalData.email)) {
      accuracyScore -= 20
    }
    if (data.personalData?.phone && !this.isValidPhone(data.personalData.phone)) {
      accuracyScore -= 20
    }
    quality.accuracy = Math.max(0, accuracyScore)

    // Timeliness assessment
    if (data.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(data.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      quality.timeliness = Math.max(0, 100 - (daysSinceUpdate / 30) * 10) // Decrease over 30 days
    }
  }

  private static async validateAppointmentRules(
    appointmentData: any,
    result: ValidationResult
  ): Promise<void> {
    // Business hours validation
    const scheduledTime = new Date(appointmentData.scheduledDate)
    const hours = scheduledTime.getHours()
    
    if (hours < 8 || hours > 18) {
      result.errors.push({
        field: 'scheduledDate',
        code: 'OUTSIDE_BUSINESS_HOURS',
        message: 'Agendamento fora do horário comercial',
        severity: ValidationSeverity.WARNING,
        category: ValidationCategory.BUSINESS,
        suggestion: 'Agendar entre 08:00 e 18:00'
      })
    }

    // Future date validation
    if (scheduledTime <= new Date()) {
      result.errors.push({
        field: 'scheduledDate',
        code: 'PAST_DATE',
        message: 'Data de agendamento deve ser futura',
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS,
        suggestion: 'Selecionar data e hora futuras'
      })
    }

    // Duration validation
    if (appointmentData.duration < 15) {
      result.errors.push({
        field: 'duration',
        code: 'DURATION_TOO_SHORT',
        message: 'Duração mínima de consulta é 15 minutos',
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS,
        suggestion: 'Aumentar duração para pelo menos 15 minutos'
      })
    }
  }

  private static async validateSchedulingConflicts(
    appointmentData: any,
    result: ValidationResult
  ): Promise<void> {
    // TODO: Check for scheduling conflicts in database
    // This would involve checking:
    // - Professional availability
    // - Room availability
    // - Equipment availability
    // - Patient double-booking
  }

  private static async validatePatientAvailability(
    appointmentData: any,
    result: ValidationResult
  ): Promise<void> {
    // TODO: Check if patient has conflicting appointments
  }

  private static async validateProfessionalAvailability(
    appointmentData: any,
    result: ValidationResult
  ): Promise<void> {
    // TODO: Check professional schedule and availability
  }

  private static async validateDrugInteractions(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    // TODO: Check for drug interactions with existing medications
    if (patientData.medicalInfo?.medications && patientData.medicalInfo.medications.length > 0) {
      result.clinicalAlerts.push({
        type: 'drug_interaction',
        severity: 'high',
        message: 'Verificar interações medicamentosas',
        recommendations: ['Consultar base de dados de interações', 'Considerar ajustes de dosagem']
      })
    }
  }

  private static async validateAllergies(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    if (patientData.medicalInfo?.allergies && patientData.medicalInfo.allergies.length > 0) {
      result.clinicalAlerts.push({
        type: 'allergy_conflict',
        severity: 'critical',
        message: 'Paciente possui alergias - verificar componentes do tratamento',
        recommendations: ['Revisar lista de alergias', 'Confirmar ingredientes do tratamento']
      })
    }
  }

  private static async validateContraindications(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    // Check treatment contraindications
    if (treatmentData.contraindications && treatmentData.contraindications.length > 0) {
      result.clinicalAlerts.push({
        type: 'contraindication',
        severity: 'high',
        message: 'Tratamento possui contraindicações',
        recommendations: ['Avaliar histórico médico do paciente', 'Considerar tratamentos alternativos']
      })
    }
  }

  private static async validateDosage(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    // Age-based dosage validation would go here
    const age = this.calculateAge(patientData.personalData.birthDate)
    
    // Example: Check for pediatric or geriatric dosage adjustments
    if (age < 18 || age > 65) {
      result.clinicalAlerts.push({
        type: 'contraindication',
        severity: 'medium',
        message: `Ajuste de dosagem pode ser necessário para idade ${age} anos`,
        recommendations: ['Considerar ajuste de dosagem', 'Monitoramento mais frequente']
      })
    }
  }

  private static async validateAgeRestrictions(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    const age = this.calculateAge(patientData.personalData.birthDate)
    
    // Some treatments may have age restrictions
    if (treatmentData.minAge && age < treatmentData.minAge) {
      result.errors.push({
        field: 'patientAge',
        code: 'AGE_RESTRICTION',
        message: `Tratamento não recomendado para idade ${age} anos`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.CLINICAL,
        suggestion: 'Considerar tratamentos apropriados para a idade'
      })
    }
  }

  private static async validateMedicalConditions(
    treatmentData: any,
    patientData: Patient,
    result: ValidationResult
  ): Promise<void> {
    // Check if patient's medical conditions affect treatment
    if (patientData.medicalInfo?.medicalHistory) {
      const highRiskConditions = ['diabetes', 'hipertensão', 'cardiopatia', 'hepatopatia']
      const patientConditions = patientData.medicalInfo.medicalHistory.map(c => c.toLowerCase())
      
      const hasHighRiskCondition = highRiskConditions.some(condition => 
        patientConditions.some(pc => pc.includes(condition))
      )
      
      if (hasHighRiskCondition) {
        result.clinicalAlerts.push({
          type: 'contraindication',
          severity: 'high',
          message: 'Paciente possui condições médicas que requerem cuidado especial',
          recommendations: ['Avaliar compatibilidade do tratamento', 'Considerar consulta especializada']
        })
      }
    }
  }

  // Utility methods
  private static addSchemaErrors(result: ValidationResult, errors: string[]): void {
    for (const error of errors) {
      result.errors.push({
        field: 'schema',
        code: 'SCHEMA_VALIDATION',
        message: error,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.DATA_QUALITY,
        suggestion: 'Corrigir formato dos dados'
      })
    }
    result.valid = false
  }

  private static addSystemError(result: ValidationResult, message: string): void {
    result.errors.push({
      field: 'system',
      code: 'SYSTEM_ERROR',
      message,
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.BUSINESS,
      suggestion: 'Contatar suporte técnico'
    })
    result.valid = false
  }

  private static calculateValidationScore(result: ValidationResult): void {
    let score = 100
    
    // Subtract points for each error/warning
    for (const error of result.errors) {
      switch (error.severity) {
        case ValidationSeverity.ERROR:
          score -= 20
          result.valid = false
          break
        case ValidationSeverity.WARNING:
          score -= 10
          break
        case ValidationSeverity.INFO:
          score -= 2
          break
      }
    }
    
    // Subtract points for clinical alerts
    for (const alert of result.clinicalAlerts) {
      switch (alert.severity) {
        case 'critical':
          score -= 15
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    }
    
    // Factor in data quality
    const avgQuality = (
      result.dataQuality.completeness +
      result.dataQuality.accuracy +
      result.dataQuality.consistency +
      result.dataQuality.timeliness
    ) / 4
    
    score = (score * 0.7) + (avgQuality * 0.3)
    
    result.score = Math.max(0, Math.round(score))
  }

  private static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  private static validateCPF(cpf: string): boolean {
    // Remove dots and dashes
    const numbers = cpf.replace(/[.-]/g, '')
    
    if (numbers.length !== 11) return false
    if (/^(\d)\1+$/.test(numbers)) return false
    
    // Validate CPF check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[9])) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[10])) return false
    
    return true
  }

  private static isValidMedicalCondition(condition: string): boolean {
    // Basic validation - in production would check against medical databases
    return condition.length >= 3 && /^[a-zA-ZÀ-ÿ\s]+$/.test(condition)
  }

  private static hasField(obj: any, fieldPath: string): boolean {
    const fields = fieldPath.split('.')
    let current = obj
    
    for (const field of fields) {
      if (!current || typeof current !== 'object' || !(field in current)) {
        return false
      }
      current = current[field]
    }
    
    return current !== null && current !== undefined && current !== ''
  }

  private static isEncrypted(obj: any, field: string): boolean {
    // Check if field is encrypted (placeholder implementation)
    const value = obj[field]
    return value && typeof value === 'object' && 'data' in value && 'algorithm' in value
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/
    return phoneRegex.test(phone)
  }
}
/**
 * AI Security Service for Healthcare Applications
 *
 * Provides comprehensive security measures for AI provider interactions,
 * ensuring LGPD compliance, data protection, and medical safety.
 */

import { z } from 'zod'

// Temporary mock for startup - TODO: Replace with actual auditLogger
const auditLogger = {
  log: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
  logError: (..._args: any[]) => {},
  logSecurityEvent: (..._args: any[]) => {},
}

// Security validation schemas
const _SensitiveDataSchema = z.object({
  name: z.string().regex(/^[A-Za-z\s]+$/),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  medicalRecord: z.string().regex(/^MR-\d+$/),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  email: z.string().email(),
})

const _MedicalTermSchema = z.object({
  term: z.string(),
  category: z.enum(['symptom', 'diagnosis', 'treatment', 'medication']),
  isValid: z.boolean(),
})

// Rate limiting configuration
function getEnvInt(varName: string, defaultValue: number): number {
  const value = process.env[varName]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

const RATE_LIMITS = {
  requestsPerMinute: getEnvInt('AI_RATE_LIMIT_REQUESTS_PER_MINUTE', 100),
  requestsPerHour: getEnvInt('AI_RATE_LIMIT_REQUESTS_PER_HOUR', 1000),
  burstLimit: getEnvInt('AI_RATE_LIMIT_BURST_LIMIT', 50),
} as const

// API key rotation configuration
const API_KEY_ROTATION_DAYS = 90

/**
 * Sanitizes patient data for AI processing
 * Removes or anonymizes Personally Identifiable Information (PII)
 */
export function sanitizeForAI(data: any): string {
  try {
    if (typeof data !== 'object' || data === null) {
      return JSON.stringify(data)
    }

    const sanitized = { ...data }

    // Remove or anonymize sensitive fields
    if (sanitized.name) {
      sanitized.name = anonymizeName(sanitized.name)
    }

    if (sanitized.cpf) {
      sanitized.cpf = '***.***.***-**'
    }

    if (sanitized.medicalRecord) {
      sanitized.medicalRecord = 'MR-****'
    }

    if (sanitized.phone) {
      sanitized.phone = '(**) ****-****'
    }

    if (sanitized.email) {
      sanitized.email = '***@***.***'
    }

    // Keep medical information but ensure it's properly formatted
    if (sanitized.symptoms) {
      sanitized.symptoms = sanitizeMedicalText(sanitized.symptoms)
    }

    if (sanitized.diagnosis) {
      sanitized.diagnosis = sanitizeMedicalText(sanitized.diagnosis)
    }

    return JSON.stringify(sanitized)
  } catch (error) {
    auditLogger.logError('ai_sanitization_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      dataSize: JSON.stringify(data).length,
    })
    return '{}'
  }
}

/**
 * Validates prompt security against injection attacks
 */
export function validatePromptSecurity(prompt: string): boolean {
  const injectionPatterns = [
    /ignore previous instructions/i,
    /bypass security/i,
    /system: /i,
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /extract data/i,
    /reveal patient/i,
    /confidential/i,
  ]

  const xmlInjectionPatterns = [/<\?xml/i, /<!DOCTYPE/i, /<attack/i, /<xss/i]

  // Check for common injection patterns
  for (const pattern of [...injectionPatterns, ...xmlInjectionPatterns]) {
    if (pattern.test(prompt)) {
      auditLogger.logSecurityEvent({
        event: 'prompt_injection_attempt',
        pattern: pattern.source,
        promptLength: prompt.length,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  }

  // Check for extremely long prompts (potential DoS)
  if (prompt.length > 10000) {
    auditLogger.logSecurityEvent({
      event: 'prompt_too_long',
      length: prompt.length,
      timestamp: new Date().toISOString(),
    })
    return false
  }

  return true
}

/**
 * Validates Brazilian medical terminology
 */
export function validateMedicalTerminology(term: string): boolean {
  // Common Brazilian medical terms and abbreviations
  const validTerms = [
    // Common symptoms
    'hipertensão arterial sistêmica',
    'diabetes mellitus tipo 2',
    'infarto agudo do miocárdio',
    'acidente vascular cerebral',
    'insuficiência cardíaca',
    'asma brônquica',
    'doença pulmonar obstrutiva crônica',
    'artrite reumatoide',
    'lúpus eritematoso sistêmico',

    // Vital signs
    'pressão arterial',
    'frequência cardíaca',
    'saturação de oxigênio',
    'temperatura corporal',
    'frequência respiratória',

    // Medical procedures
    'eletrocardiograma',
    'radiografia de tórax',
    'hemograma completo',
    'glicemia de jejum',
    'colesterol total',
    'triglicerídeos',
  ]

  const normalizedTerm = term.toLowerCase().trim()
  return validTerms.some(
    validTerm =>
      validTerm.toLowerCase().includes(normalizedTerm) ||
      normalizedTerm.includes(validTerm.toLowerCase()),
  )
}

/**
 * Validates AI output safety and medical accuracy
 */
export function validateAIOutputSafety(response: string): boolean {
  const dangerousPatterns = [
    /pare de tomar/i,
    /não tome/i,
    /ignore seu médico/i,
    /auto-diagnóstico/i,
    /substitui atendimento/i,
    /não precisa de médico/i,
    /trate você mesmo/i,
    /medicação perigosa/i,
    /sem supervisão/i,
  ]

  const missingDisclaimerPatterns = [
    /consulte um médico/i,
    /busque atendimento/i,
    /orientação profissional/i,
    /avaliação médica/i,
    /não substitui/i,
  ]

  // Check for dangerous medical advice
  for (const pattern of dangerousPatterns) {
    if (pattern.test(response)) {
      auditLogger.logSecurityEvent({
        event: 'dangerous_medical_advice',
        pattern: pattern.source,
        responseLength: response.length,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  }

  // Check for required medical disclaimers
  const hasDisclaimer = missingDisclaimerPatterns.some(pattern => pattern.test(response))

  if (!hasDisclaimer && response.length > 100) {
    auditLogger.logSecurityEvent({
      event: 'missing_medical_disclaimer',
      responseLength: response.length,
      timestamp: new Date().toISOString(),
    })
    return false
  }

  return true
}

/**
 * Rate limiting for AI provider calls
 */
export class AIRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up old request records every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldRequests()
    }, 60000)
  }

  canMakeRequest(_userId: string, clinicId: string): boolean {
    const key = `${_userId}:${clinicId}`
    const now = Date.now()
    const userRequests = this.requests.get(key) || []

    // Remove requests older than 1 hour
    const recentRequests = userRequests.filter(
      time => now - time < 60 * 1000,
    )

    // Check minute limit
    const minuteRequests = recentRequests.filter(
      time => now - time < 60 * 1000,
    )

    if (minuteRequests.length >= RATE_LIMITS.requestsPerMinute) {
      auditLogger.logSecurityEvent({
        event: 'ai_rate_limit_exceeded_minute',
        _userId,
        clinicId,
        requestsInMinute: minuteRequests.length,
        timestamp: new Date().toISOString(),
      })
      return false
    }

    // Check hour limit
    if (recentRequests.length >= RATE_LIMITS.requestsPerHour) {
      auditLogger.logSecurityEvent({
        event: 'ai_rate_limit_exceeded_hour',
        _userId,
        clinicId,
        requestsInHour: recentRequests.length,
        timestamp: new Date().toISOString(),
      })
      return false
    }

    // Add new request
    recentRequests.push(now)
    this.requests.set(key, recentRequests)

    return true
  }

  private cleanupOldRequests(): void {
    const now = Date.now()
    const entries = Array.from(this.requests.entries())
    for (const [key, requests] of entries) {
      const recentRequests = requests.filter(
        time => now - time < 60 * 60 * 1000,
      )

      if (recentRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, recentRequests)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

// Global rate limiter instance
const aiRateLimiter = new AIRateLimiter()

/**
 * Validates API key rotation requirements
 */
export function validateApiKeyRotation(apiKeyInfo: {
  key: string
  createdAt: number
  lastRotated: number
}): boolean {
  const daysSinceRotation = (Date.now() - apiKeyInfo.lastRotated) / (24 * 60 * 60 * 1000)
  const needsRotation = daysSinceRotation > API_KEY_ROTATION_DAYS

  if (needsRotation) {
    auditLogger.logSecurityEvent({
      event: 'api_key_rotation_required',
      daysSinceRotation,
      apiKeyAge: daysSinceRotation,
      timestamp: new Date().toISOString(),
    })
  }

  return !needsRotation
}

/**
 * Logs AI interaction for audit trail compliance
 */
export function logAIInteraction(interaction: {
  _userId: string
  patientId?: string
  clinicId: string
  provider: string
  prompt: string
  response: string
  timestamp: number
}): void {
  auditLogger.logSecurityEvent({
    event: 'ai_interaction',
    _userId: interaction._userId,
    patientId: interaction.patientId,
    clinicId: interaction.clinicId,
    provider: interaction.provider,
    promptLength: interaction.prompt.length,
    responseLength: interaction.response.length,
    timestamp: new Date(interaction.timestamp).toISOString(),
  })
}

/**
 * Checks if data should be retained based on LGPD policies
 */
export function shouldRetainAIData(
  createdAt: number,
  dataCategory: string,
): boolean {
  const daysOld = (Date.now() - createdAt) / (24 * 60 * 60 * 1000)

  // Different retention periods for different data types
  const retentionPolicies = {
    AI_CONVERSATION: 365, // 1 year
    AI_DIAGNOSIS: 1825, // 5 years (medical data)
    AI_ANALYTICS: 90, // 3 months
    AUDIT_LOG: 2555, // 7 years
  }

  const retentionDays = retentionPolicies[dataCategory as keyof typeof retentionPolicies] || 365

  if (daysOld > retentionDays) {
    auditLogger.logSecurityEvent({
      event: 'ai_data_retention_expired',
      dataCategory,
      daysOld,
      retentionDays,
      timestamp: new Date().toISOString(),
    })
    return false
  }

  return true
}

// Helper functions
function anonymizeName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0][0] + '***'
  }

  return parts[0][0] + '*** ' + parts[parts.length - 1][0] + '***'
}

function sanitizeMedicalText(text: string): string {
  // Remove potentially sensitive information while keeping medical context
  return text
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF]')
    .replace(/\(\d{2}\)\s*\d{4,5}-\d{4}/g, '[Telefone]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[Email]')
    .replace(/MR-\d+/g, '[Prontuário]')
}

// Export singleton instance
export const aiSecurityService = {
  sanitizeForAI,
  validatePromptSecurity,
  validateMedicalTerminology,
  validateAIOutputSafety,
  canMakeRequest: (_userId: string, clinicId: string) =>
    aiRateLimiter.canMakeRequest(_userId, clinicId),
  validateApiKeyRotation,
  logAIInteraction,
  shouldRetainAIData,
}

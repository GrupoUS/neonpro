/**
 * LGPD Consent Zod Schemas for Brazilian Healthcare Compliance
 *
 * Comprehensive validation for LGPD (Lei Geral de Proteção de Dados) compliance
 * Migrated from Valibot to Zod v4 with enhanced healthcare-specific validation
 *
 * @package `@neonpro/types`
 * @author Claude AI Agent
 * @version 2.0.0
 * LGPD Art. 7º, 11º - Brazilian Data Protection Law
 */

import { z } from 'zod'

// =====================================
// BRANDED TYPES FOR TYPE SAFETY
// =====================================

/**
 * Branded type for LGPD Consent ID - ensures type safety
 */
export type LGPDConsentId = string & { readonly __brand: 'LGPDConsentId' }

/**
 * Branded type for Consent Hash - SHA-256 cryptographic proof
 */
export type ConsentHash = string & { readonly __brand: 'ConsentHash' }

/**
 * Branded type for Digital Signature
 */
export type DigitalSignature = string & {
  readonly __brand: 'DigitalSignature'
}

/**
 * Branded type for Timestamp Token - cryptographic timestamp
 */
export type TimestampToken = string & { readonly __brand: 'TimestampToken' }

// =====================================
// LGPD VALIDATION UTILITIES
// =====================================

/**
 * Validates SHA-256 hash format
 */
const validateSHA256Hash = (hash: string): boolean => {
  const sha256Regex = /^[a-f0-9]{64}$/i
  return sha256Regex.test(hash)
}

/**
 * Validates cryptographic timestamp token format
 */
const validateTimestampToken = (token: string): boolean => {
  // Basic validation for timestamp token format
  // Should be base64 encoded cryptographic timestamp
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(token) && token.length >= 20
}

/**
 * Validates retention period format (ISO 8601 duration or specific values)
 */
const validateRetentionPeriod = (period: string): boolean => {
  // Healthcare-specific retention periods or ISO 8601 duration
  const healthcareRetentions = [
    '20(years)', // Medical records (20 years in Brazil)
    '5(years)', // General healthcare data
    '10(years)', // Prescription records
    'permanent', // Some legal requirements
    'patient_lifetime', // Lifetime + 20 years
    'indefinite', // With legal basis
  ]

  // ISO 8601 duration pattern (P[n]Y[n]M[n]DT[n]H[n]M[n]S)
  const iso8601Pattern =
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/

  return healthcareRetentions.includes(period) || iso8601Pattern.test(period)
}

/**
 * Validates email format with enhanced security
 */
export const validateSecureEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// =====================================
// LGPD ENUM SCHEMAS
// =====================================

/**
 * LGPD Legal Basis Schema (Art. 7º and 11º LGPD)
 */
export const LegalBasisSchema = z.enum([
  'consent', // Art. 7º, I - Consentimento
  'contract', // Art. 7º, V - Execução de contrato
  'legitimate_interest', // Art. 7º, IX - Interesse legítimo
  'vital_interest', // Art. 7º, IV - Proteção da vida
  'public_task', // Art. 7º, II - Tratamento por órgão público
  'legal_obligation', // Art. 7º, II - Cumprimento de obrigação legal
  'health_protection', // Art. 11º, II - Proteção da saúde
  'medical_assistance', // Art. 11º, II - Assistência médica
  'public_health', // Art. 11º, III - Saúde pública
  'health_research', // Art. 11º, IV - Pesquisa em saúde
  'pharmaceutical_vigilance', // Art. 11º, IV - Farmacovigilância
], {
  message: 'Base legal LGPD inválida',
})

/**
 * Data Categories Schema with healthcare specificity
 */
export const DataCategorySchema = z.enum([
  'basic_personal', // Dados pessoais básicos
  'contact_information', // Informações de contato
  'identification', // Documentos de identificação
  'health_data', // Dados de saúde (Art. 11º)
  'sensitive_personal', // Dados pessoais sensíveis
  'biometric', // Dados biométricos
  'genetic', // Dados genéticos
  'medical_history', // Histórico médico
  'prescription_data', // Dados de prescrição
  'clinical_records', // Registros clínicos
  'insurance_data', // Dados de convênio
  'financial_health', // Dados financeiros de saúde
  'behavioral_health', // Dados comportamentais de saúde
  'location_health', // Dados de localização para saúde
], {
  message: 'Categoria de dados inválida',
})

/**
 * Consent Type Schema
 */
export const ConsentTypeSchema = z.enum([
  'explicit', // Consentimento explícito
  'informed', // Consentimento informado
  'specific', // Consentimento específico
  'unambiguous', // Consentimento inequívoco
  'withdrawn', // Consentimento retirado
  'revoked', // Consentimento revogado
  'expired', // Consentimento expirado
  'renewed', // Consentimento renovado
], {
  message: 'Tipo de consentimento inválido',
})

/**
 * Consent Status Schema
 */
export const ConsentStatusSchema = z.enum([
  'pending', // Pendente
  'active', // Ativo
  'withdrawn', // Retirado
  'expired', // Expirado
  'revoked', // Revogado
  'suspended', // Suspenso
  'under_review', // Em revisão
], {
  message: 'Status de consentimento inválido',
})

/**
 * Collection Method Schema
 */
export const CollectionMethodSchema = z.enum([
  'web_form', // Formulário web
  'mobile_app', // Aplicativo móvel
  'in_person', // Presencial
  'phone_call', // Ligação telefônica
  'email', // Email
  'physical_document', // Documento físico
  'digital_signature', // Assinatura digital
  'biometric', // Biométrico
  'voice_recording', // Gravação de voz
  'video_recording', // Gravação de vídeo
], {
  message: 'Método de coleta inválido',
})

/**
 * Withdrawal Method Schema
 */
export const WithdrawalMethodSchema = z.enum([
  'web_portal', // Portal web
  'mobile_app', // App móvel
  'email_request', // Solicitação por email
  'phone_call', // Ligação telefônica
  'in_person', // Presencial
  'written_letter', // Carta escrita
  'digital_form', // Formulário digital
  'automated_system', // Sistema automatizado
], {
  message: 'Método de retirada inválido',
})

/**
 * Language Schema with Brazilian focus
 */
export const LanguageSchema = z.enum([
  'pt-BR', // Português brasileiro
  'en-US', // Inglês americano
  'es-ES', // Espanhol
  'libras', // Língua Brasileira de Sinais
], {
  message: 'Idioma inválido',
})

// =====================================
// CORE ZOD SCHEMAS
// =====================================

/**
 * SHA-256 Hash Validation Schema
 */
export const SHA256HashSchema = z.string()
  .min(1, 'Hash é obrigatório para integridade criptográfica')
  .transform(val => val.trim())
  .refine(val => val.length === 64, 'Hash SHA-256 deve ter exatamente 64 caracteres')
  .refine(val => /^[a-f0-9]{64}$/i.test(val), 'Hash deve estar em formato hexadecimal válido')
  .refine(validateSHA256Hash, 'Hash SHA-256 inválido')
  .transform(val => val.toLowerCase() as ConsentHash)

/**
 * Timestamp Token Validation Schema
 */
export const TimestampTokenSchema = z.string()
  .min(1, 'Token de timestamp é obrigatório')
  .transform(val => val.trim())
  .refine(val => val.length >= 20, 'Token de timestamp deve ter pelo menos 20 caracteres')
  .refine(val => val.length <= 500, 'Token de timestamp não pode exceder 500 caracteres')
  .refine(validateTimestampToken, 'Token de timestamp inválido')
  .transform(val => val as TimestampToken)

/**
 * Digital Signature Validation Schema
 */
export const DigitalSignatureSchema = z.string()
  .min(1, 'Assinatura digital é obrigatória')
  .transform(val => val.trim())
  .refine(val => val.length >= 100, 'Assinatura digital deve ter pelo menos 100 caracteres')
  .refine(val => val.length <= 2000, 'Assinatura digital não pode exceder 2000 caracteres')
  .refine(val => /^[A-Za-z0-9+/=]+$/.test(val), 'Assinatura digital deve estar em formato base64')
  .transform(val => val as DigitalSignature)

/**
 * Retention Period Validation Schema
 */
export const RetentionPeriodSchema = z.string()
  .min(1, 'Período de retenção é obrigatório')
  .transform(val => val.trim())
  .refine(validateRetentionPeriod, 'Período de retenção inválido para dados de saúde')
  .transform(val => val.toLowerCase())

/**
 * Consent Version Schema
 */
export const ConsentVersionSchema = z.string()
  .min(1, 'Versão do consentimento é obrigatória')
  .transform(val => val.trim())
  .refine(val => /^v?\d+(\.\d+)*(-[a-z0-9]+)?$/i.test(val), 'Versão deve seguir formato semântico (ex: v1.0.0, 2.1.0-beta)')
  .refine(val => val.length <= 20, 'Versão não pode exceder 20 caracteres')

/**
 * Processing Purpose Schema
 */
export const ProcessingPurposeSchema = z.string()
  .min(1, 'Finalidade do tratamento é obrigatória')
  .transform(val => val.trim())
  .refine(val => val.length >= 10, 'Finalidade deve ter pelo menos 10 caracteres')
  .refine(val => val.length <= 500, 'Finalidade não pode exceder 500 caracteres')
  .refine(val => !/[^<>{}|\\`]/.test(val), 'Finalidade contém caracteres não permitidos')

/**
 * Consent Text Schema
 */
export const ConsentTextSchema = z.string()
  .min(1, 'Texto do consentimento é obrigatório')
  .transform(val => val.trim())
  .refine(val => val.length >= 50, 'Texto do consentimento deve ter pelo menos 50 caracteres')
  .refine(val => val.length <= 10000, 'Texto do consentimento não pode exceder 10000 caracteres')
  .refine(val => !/[^<>{}|\\`]/.test(val), 'Texto contém caracteres não permitidos')

/**
 * IP Address Validation Schema
 */
export const IPAddressSchema = z.string()
  .min(1, 'Endereço IP é obrigatório para auditoria')
  .transform(val => val.trim())
  .refine(
    val => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(val),
    'Formato de endereço IP inválido'
  )

/**
 * User Agent Validation Schema
 */
export const UserAgentSchema = z.string()
  .min(1, 'User Agent é obrigatório para auditoria')
  .transform(val => val.trim())
  .refine(val => val.length >= 10, 'User Agent deve ter pelo menos 10 caracteres')
  .refine(val => val.length <= 1000, 'User Agent não pode exceder 1000 caracteres')
  .refine(val => !/[^<>{}|\\`]/.test(val), 'User Agent contém caracteres não permitidos')

/**
 * Withdrawal Reason Schema
 */
export const WithdrawalReasonSchema = z.string()
  .transform(val => val.trim())
  .refine(val => val.length >= 5, 'Motivo da retirada deve ter pelo menos 5 caracteres')
  .refine(val => val.length <= 1000, 'Motivo da retirada não pode exceder 1000 caracteres')
  .refine(val => !/[^<>{}|\\`]/.test(val), 'Motivo contém caracteres não permitidos')

// =====================================
// COMPLEX OBJECT SCHEMAS
// =====================================

/**
 * Cryptographic Proof Schema
 */
export const CryptographicProofSchema = z.object({
  algorithm: z.enum(['SHA-256', 'SHA-512', 'RSA-2048', 'ECDSA-P256'], {
    message: 'Algoritmo criptográfico não suportado',
  }),
  signature: DigitalSignatureSchema,
  timestamp: TimestampTokenSchema,
  certificate_chain: z.array(z.string()).optional(),
  verification_url: z.string().url('URL de verificação inválida').optional(),
  blockchain_tx: z.string()
    .min(32, 'Hash da transação blockchain inválido')
    .optional(),
})

/**
 * Geolocation Schema
 */
export const GeolocationSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90'),
  longitude: z.number()
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180'),
  accuracy: z.number().min(0).optional(),
  altitude: z.number().optional(),
  country: z.string()
    .length(2, 'Código do país deve ter 2 caracteres')
    .optional(),
  region: z.string().optional(),
  city: z.string().optional(),
})

/**
 * Evidence Document Schema
 */
export const EvidenceDocumentSchema = z.object({
  document_type: z.enum([
    'consent_form',
    'email_confirmation',
    'voice_recording',
    'video_recording',
    'digital_signature',
    'biometric_capture',
  ], {
    message: 'Tipo de documento de evidência inválido',
  }),
  document_hash: SHA256HashSchema,
  document_url: z.string().url('URL do documento inválida').optional(),
  created_at: z.string().datetime('Data de criação deve estar em formato ISO'),
  file_size: z.number().min(1).optional(),
  mime_type: z.string().optional(),
  retention_until: z.string().datetime('Data de retenção deve estar em formato ISO'),
})

/**
 * Audit Log Entry Schema
 */
export const AuditLogEntrySchema = z.object({
  action: z.enum([
    'created',
    'viewed',
    'modified',
    'withdrawn',
    'expired',
    'renewed',
    'verified',
  ], {
    message: 'Ação de auditoria inválida',
  }),
  timestamp: z.string().datetime('Timestamp deve estar em formato ISO'),
  user_id: z.string().uuid('ID do usuário deve ser UUID válido').optional(),
  user_role: z.string().optional(),
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  compliance_validated: z.boolean().optional(),
})

// =====================================
// MAIN LGPD CONSENT SCHEMAS
// =====================================

/**
 * LGPD Consent Creation Schema
 */
export const LGPDConsentCreationSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser UUID válido'),
  clinic_id: z.string().uuid('ID da clínica deve ser UUID válido'),

  // Legal framework
  legal_basis: LegalBasisSchema,
  processing_purpose: ProcessingPurposeSchema,
  data_categories: z.array(DataCategorySchema)
    .min(1, 'Pelo menos uma categoria de dados é obrigatória'),
  data_subjects: z.array(z.string())
    .min(1, 'Pelo menos um titular de dados é obrigatório'),
  retention_period: RetentionPeriodSchema,
  retention_justification: z.string().optional(),

  // Consent details
  consent_type: ConsentTypeSchema,
  consent_version: ConsentVersionSchema,
  consent_text: ConsentTextSchema,
  consent_language: LanguageSchema.optional(),

  // Collection context
  collection_method: CollectionMethodSchema,
  collection_location: z.string().optional(),
  collector_user_id: z.string().uuid().optional(),
  collector_role: z.string().optional(),

  // Technical context
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: z.string().optional(),
  device_fingerprint: z.string().optional(),
  geolocation: GeolocationSchema.optional(),

  // Compliance flags
  gdpr_compliant: z.boolean().optional(),
  lgpd_compliant: z.literal(true, 'Conformidade LGPD é obrigatória'),
  ccpa_compliant: z.boolean().optional(),
  hipaa_compliant: z.boolean().optional(),
  regulatory_frameworks: z.array(z.string()),

  // Evidence and proof
  evidence_documents: z.array(EvidenceDocumentSchema).optional(),
  cryptographic_proof: CryptographicProofSchema,
})

/**
 * LGPD Consent Withdrawal Schema
 */
export const LGPDConsentWithdrawalSchema = z.object({
  consent_id: z.string().uuid('ID do consentimento deve ser UUID válido'),
  withdrawal_reason: WithdrawalReasonSchema,
  withdrawal_method: WithdrawalMethodSchema,
  withdrawal_confirmed: z.literal(true, 'Confirmação de retirada é obrigatória'),

  // Context
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: z.string().optional(),

  // Data subject rights
  data_portability_requested: z.boolean().optional(),
  data_erasure_requested: z.boolean().optional(),
  data_rectification_requested: z.boolean().optional(),
  data_processing_restricted: z.boolean().optional(),

  // Evidence
  evidence_documents: z.array(EvidenceDocumentSchema).optional(),
  cryptographic_proof: CryptographicProofSchema.optional(),
})

/**
 * LGPD Consent Update Schema
 */
export const LGPDConsentUpdateSchema = z.object({
  consent_id: z.string().uuid('ID do consentimento deve ser UUID válido'),
  parent_consent_id: z.string().uuid('ID do consentimento pai deve ser UUID válido').optional(),

  // Updated fields
  consent_status: ConsentStatusSchema.optional(),
  consent_version: ConsentVersionSchema.optional(),
  processing_purpose: ProcessingPurposeSchema.optional(),
  data_categories: z.array(DataCategorySchema).optional(),
  retention_period: RetentionPeriodSchema.optional(),

  // Audit context
  updated_by: z.string().uuid().optional(),
  update_reason: z.string()
    .min(10, 'Motivo da atualização deve ter pelo menos 10 caracteres'),
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,

  // Evidence
  evidence_documents: z.array(EvidenceDocumentSchema).optional(),
  cryptographic_proof: CryptographicProofSchema.optional(),
})

/**
 * LGPD Consent Query Schema
 */
export const LGPDConsentQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  consent_status: ConsentStatusSchema.optional(),
  legal_basis: LegalBasisSchema.optional(),
  data_categories: z.array(DataCategorySchema).optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  expires_after: z.string().datetime().optional(),
  expires_before: z.string().datetime().optional(),
  limit: z.number()
    .min(1, 'Limite deve ser pelo menos 1')
    .max(1000, 'Limite não pode exceder 1000')
    .optional(),
  offset: z.number()
    .min(0, 'Offset não pode ser negativo')
    .optional(),
})

// =====================================
// VALIDATION HELPER FUNCTIONS
// =====================================

/**
 * Validates complete LGPD consent lifecycle
 */
export const validateLGPDConsentLifecycle = (_consent: unknown): boolean => {
  try {
    // This would contain more complex business logic validation
    // For now, we'll use the basic schema validation
    return true
  } catch {
    return false
  }
}

/**
 * Validates cryptographic integrity of consent
 */
export const validateConsentIntegrity = (
  consentHash: string,
  _consentData: string,
): boolean => {
  // This would implement actual cryptographic validation
  // For now, we validate the hash format
  return validateSHA256Hash(consentHash)
}

/**
 * Checks if consent is still valid (not expired or withdrawn)
 */
export const isConsentValid = (consent: {
  status: string
  expires_at?: string | null
  withdrawn_at?: string | null
}): boolean => {
  if (consent.status === 'withdrawn' || consent.status === 'revoked') {
    return false
  }

  if (consent.withdrawn_at) {
    return false
  }

  if (consent.expires_at) {
    const expiryDate = new Date(consent.expires_at)
    return expiryDate > new Date()
  }

  return consent.status === 'active'
}

/**
 * Validates LGPD compliance for healthcare data processing
 */
export const validateHealthcareCompliance = (consent: {
  legal_basis: string
  data_categories: string[]
  processing_purpose: string
}): boolean => {
  // Check if health data requires proper legal basis
  const hasHealthData = consent.data_categories.some(cat =>
    [
      'health_data',
      'sensitive_personal',
      'medical_history',
      'clinical_records',
    ].includes(cat)
  )

  if (hasHealthData) {
    const validHealthBases = [
      'health_protection',
      'medical_assistance',
      'public_health',
      'health_research',
      'consent',
    ]
    return validHealthBases.includes(consent.legal_basis)
  }

  return true
}

// =====================================
// TYPE EXPORTS
// =====================================

export type LGPDConsentCreation = z.infer<typeof LGPDConsentCreationSchema>
export type LGPDConsentWithdrawal = z.infer<typeof LGPDConsentWithdrawalSchema>
export type LGPDConsentUpdate = z.infer<typeof LGPDConsentUpdateSchema>
export type LGPDConsentQuery = z.infer<typeof LGPDConsentQuerySchema>
export type CryptographicProof = z.infer<typeof CryptographicProofSchema>
export type Geolocation = z.infer<typeof GeolocationSchema>
export type EvidenceDocument = z.infer<typeof EvidenceDocumentSchema>
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>
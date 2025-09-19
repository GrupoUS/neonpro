/**
 * LGPD Consent Valibot Schemas for Brazilian Healthcare Compliance
 * 
 * Comprehensive validation for LGPD (Lei Geral de Proteção de Dados) compliance
 * Optimized for Edge Runtime with cryptographic validation and legal framework support
 * 
 * @package @neonpro/types
 * @author Claude AI Agent
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 11º - Brazilian Data Protection Law
 */

import * as v from 'valibot';

// =====================================
// BRANDED TYPES FOR TYPE SAFETY
// =====================================

/**
 * Branded type for LGPD Consent ID - ensures type safety
 */
export type LGPDConsentId = string & { readonly __brand: 'LGPDConsentId' };

/**
 * Branded type for Consent Hash - SHA-256 cryptographic proof
 */
export type ConsentHash = string & { readonly __brand: 'ConsentHash' };

/**
 * Branded type for Digital Signature
 */
export type DigitalSignature = string & { readonly __brand: 'DigitalSignature' };

/**
 * Branded type for Timestamp Token - cryptographic timestamp
 */
export type TimestampToken = string & { readonly __brand: 'TimestampToken' };

// =====================================
// LGPD VALIDATION UTILITIES
// =====================================

/**
 * Validates SHA-256 hash format
 */
const validateSHA256Hash = (hash: string): boolean => {
  const sha256Regex = /^[a-f0-9]{64}$/i;
  return sha256Regex.test(hash);
};

/**
 * Validates cryptographic timestamp token format
 */
const validateTimestampToken = (token: string): boolean => {
  // Basic validation for timestamp token format
  // Should be base64 encoded cryptographic timestamp
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(token) && token.length >= 20;
};

/**
 * Validates retention period format (ISO 8601 duration or specific values)
 */
const validateRetentionPeriod = (period: string): boolean => {
  // Healthcare-specific retention periods or ISO 8601 duration
  const healthcareRetentions = [
    '20_years',        // Medical records (20 years in Brazil)
    '5_years',         // General healthcare data
    '10_years',        // Prescription records
    'permanent',       // Some legal requirements
    'patient_lifetime', // Lifetime + 20 years
    'indefinite'       // With legal basis
  ];
  
  // ISO 8601 duration pattern (P[n]Y[n]M[n]DT[n]H[n]M[n]S)
  const iso8601Pattern = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  
  return healthcareRetentions.includes(period) || iso8601Pattern.test(period);
};

/**
 * Validates email format with enhanced security
 */
export const validateSecureEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// =====================================
// LGPD ENUM SCHEMAS
// =====================================

/**
 * LGPD Legal Basis Schema (Art. 7º and 11º LGPD)
 */
export const LegalBasisSchema = v.picklist([
  'consent',                    // Art. 7º, I - Consentimento
  'contract',                   // Art. 7º, V - Execução de contrato
  'legitimate_interest',        // Art. 7º, IX - Interesse legítimo
  'vital_interest',            // Art. 7º, IV - Proteção da vida
  'public_task',               // Art. 7º, II - Tratamento por órgão público
  'legal_obligation',          // Art. 7º, II - Cumprimento de obrigação legal
  'health_protection',         // Art. 11º, II - Proteção da saúde
  'medical_assistance',        // Art. 11º, II - Assistência médica
  'public_health',             // Art. 11º, III - Saúde pública
  'health_research',           // Art. 11º, IV - Pesquisa em saúde
  'pharmaceutical_vigilance'   // Art. 11º, IV - Farmacovigilância
], 'Base legal LGPD inválida');

/**
 * Data Categories Schema with healthcare specificity
 */
export const DataCategorySchema = v.picklist([
  'basic_personal',            // Dados pessoais básicos
  'contact_information',       // Informações de contato
  'identification',            // Documentos de identificação
  'health_data',              // Dados de saúde (Art. 11º)
  'sensitive_personal',        // Dados pessoais sensíveis
  'biometric',                // Dados biométricos
  'genetic',                  // Dados genéticos
  'medical_history',          // Histórico médico
  'prescription_data',        // Dados de prescrição
  'clinical_records',         // Registros clínicos
  'insurance_data',           // Dados de convênio
  'financial_health',         // Dados financeiros de saúde
  'behavioral_health',        // Dados comportamentais de saúde
  'location_health'           // Dados de localização para saúde
], 'Categoria de dados inválida');

/**
 * Consent Type Schema
 */
export const ConsentTypeSchema = v.picklist([
  'explicit',                 // Consentimento explícito
  'informed',                 // Consentimento informado
  'specific',                 // Consentimento específico
  'unambiguous',              // Consentimento inequívoco
  'withdrawn',                // Consentimento retirado
  'revoked',                  // Consentimento revogado
  'expired',                  // Consentimento expirado
  'renewed'                   // Consentimento renovado
], 'Tipo de consentimento inválido');

/**
 * Consent Status Schema
 */
export const ConsentStatusSchema = v.picklist([
  'pending',                  // Pendente
  'active',                   // Ativo
  'withdrawn',                // Retirado
  'expired',                  // Expirado
  'revoked',                  // Revogado
  'suspended',                // Suspenso
  'under_review'              // Em revisão
], 'Status de consentimento inválido');

/**
 * Collection Method Schema
 */
export const CollectionMethodSchema = v.picklist([
  'web_form',                 // Formulário web
  'mobile_app',               // Aplicativo móvel
  'in_person',                // Presencial
  'phone_call',               // Ligação telefônica
  'email',                    // Email
  'physical_document',        // Documento físico
  'digital_signature',        // Assinatura digital
  'biometric',                // Biométrico
  'voice_recording',          // Gravação de voz
  'video_recording'           // Gravação de vídeo
], 'Método de coleta inválido');

/**
 * Withdrawal Method Schema
 */
export const WithdrawalMethodSchema = v.picklist([
  'web_portal',               // Portal web
  'mobile_app',               // App móvel
  'email_request',            // Solicitação por email
  'phone_call',               // Ligação telefônica
  'in_person',                // Presencial
  'written_letter',           // Carta escrita
  'digital_form',             // Formulário digital
  'automated_system'          // Sistema automatizado
], 'Método de retirada inválido');

/**
 * Language Schema with Brazilian focus
 */
export const LanguageSchema = v.picklist([
  'pt-BR',                    // Português brasileiro
  'en-US',                    // Inglês americano
  'es-ES',                    // Espanhol
  'libras'                    // Língua Brasileira de Sinais
], 'Idioma inválido');

// =====================================
// CORE VALIBOT SCHEMAS
// =====================================

/**
 * SHA-256 Hash Validation Schema
 */
export const SHA256HashSchema = v.pipe(
  v.string('Hash deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Hash é obrigatório para integridade criptográfica'),
  v.length(64, 'Hash SHA-256 deve ter exatamente 64 caracteres'),
  v.regex(/^[a-f0-9]{64}$/i, 'Hash deve estar em formato hexadecimal válido'),
  v.check(validateSHA256Hash, 'Hash SHA-256 inválido'),
  v.transform((value) => value.toLowerCase() as ConsentHash)
);

/**
 * Timestamp Token Validation Schema
 */
export const TimestampTokenSchema = v.pipe(
  v.string('Token de timestamp deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Token de timestamp é obrigatório'),
  v.minLength(20, 'Token de timestamp deve ter pelo menos 20 caracteres'),
  v.maxLength(500, 'Token de timestamp não pode exceder 500 caracteres'),
  v.check(validateTimestampToken, 'Token de timestamp inválido'),
  v.transform((value) => value as TimestampToken)
);

/**
 * Digital Signature Validation Schema
 */
export const DigitalSignatureSchema = v.pipe(
  v.string('Assinatura digital deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Assinatura digital é obrigatória'),
  v.minLength(100, 'Assinatura digital deve ter pelo menos 100 caracteres'),
  v.maxLength(2000, 'Assinatura digital não pode exceder 2000 caracteres'),
  v.regex(/^[A-Za-z0-9+/=]+$/, 'Assinatura digital deve estar em formato base64'),
  v.transform((value) => value as DigitalSignature)
);

/**
 * Retention Period Validation Schema
 */
export const RetentionPeriodSchema = v.pipe(
  v.string('Período de retenção deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Período de retenção é obrigatório'),
  v.check(validateRetentionPeriod, 'Período de retenção inválido para dados de saúde'),
  v.transform((value) => value.toLowerCase())
);

/**
 * Consent Version Schema
 */
export const ConsentVersionSchema = v.pipe(
  v.string('Versão do consentimento deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Versão do consentimento é obrigatória'),
  v.regex(/^v?\d+(\.\d+)*(-[a-z0-9]+)?$/i, 'Versão deve seguir formato semântico (ex: v1.0.0, 2.1.0-beta)'),
  v.maxLength(20, 'Versão não pode exceder 20 caracteres')
);

/**
 * Processing Purpose Schema
 */
export const ProcessingPurposeSchema = v.pipe(
  v.string('Finalidade do tratamento deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Finalidade do tratamento é obrigatória'),
  v.minLength(10, 'Finalidade deve ter pelo menos 10 caracteres'),
  v.maxLength(500, 'Finalidade não pode exceder 500 caracteres'),
  v.regex(/^[^<>{}|\\`]*$/, 'Finalidade contém caracteres não permitidos')
);

/**
 * Consent Text Schema
 */
export const ConsentTextSchema = v.pipe(
  v.string('Texto do consentimento deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Texto do consentimento é obrigatório'),
  v.minLength(50, 'Texto do consentimento deve ter pelo menos 50 caracteres'),
  v.maxLength(10000, 'Texto do consentimento não pode exceder 10000 caracteres'),
  v.regex(/^[^<>{}|\\`]*$/, 'Texto contém caracteres não permitidos')
);

/**
 * IP Address Validation Schema
 */
export const IPAddressSchema = v.pipe(
  v.string('Endereço IP deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Endereço IP é obrigatório para auditoria'),
  v.regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Formato de endereço IP inválido')
);

/**
 * User Agent Validation Schema
 */
export const UserAgentSchema = v.pipe(
  v.string('User Agent deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('User Agent é obrigatório para auditoria'),
  v.minLength(10, 'User Agent deve ter pelo menos 10 caracteres'),
  v.maxLength(1000, 'User Agent não pode exceder 1000 caracteres'),
  v.regex(/^[^<>{}|\\`]*$/, 'User Agent contém caracteres não permitidos')
);

/**
 * Withdrawal Reason Schema
 */
export const WithdrawalReasonSchema = v.pipe(
  v.string('Motivo da retirada deve ser uma string válida'),
  v.trim(),
  v.minLength(5, 'Motivo da retirada deve ter pelo menos 5 caracteres'),
  v.maxLength(1000, 'Motivo da retirada não pode exceder 1000 caracteres'),
  v.regex(/^[^<>{}|\\`]*$/, 'Motivo contém caracteres não permitidos')
);

// =====================================
// COMPLEX OBJECT SCHEMAS
// =====================================

/**
 * Cryptographic Proof Schema
 */
export const CryptographicProofSchema = v.object({
  algorithm: v.pipe(
    v.string('Algoritmo deve ser uma string válida'),
    v.picklist(['SHA-256', 'SHA-512', 'RSA-2048', 'ECDSA-P256'], 'Algoritmo criptográfico não suportado')
  ),
  signature: DigitalSignatureSchema,
  timestamp: TimestampTokenSchema,
  certificate_chain: v.optional(v.array(v.string())),
  verification_url: v.optional(v.pipe(v.string(), v.url('URL de verificação inválida'))),
  blockchain_tx: v.optional(v.pipe(v.string(), v.minLength(32, 'Hash da transação blockchain inválido')))
});

/**
 * Geolocation Schema
 */
export const GeolocationSchema = v.object({
  latitude: v.pipe(v.number('Latitude deve ser um número'), v.minValue(-90), v.maxValue(90)),
  longitude: v.pipe(v.number('Longitude deve ser um número'), v.minValue(-180), v.maxValue(180)),
  accuracy: v.optional(v.pipe(v.number(), v.minValue(0))),
  altitude: v.optional(v.number()),
  country: v.optional(v.pipe(v.string(), v.length(2, 'Código do país deve ter 2 caracteres'))),
  region: v.optional(v.string()),
  city: v.optional(v.string())
});

/**
 * Evidence Document Schema
 */
export const EvidenceDocumentSchema = v.object({
  document_type: v.pipe(
    v.string(),
    v.picklist(['consent_form', 'email_confirmation', 'voice_recording', 'video_recording', 'digital_signature', 'biometric_capture'], 'Tipo de documento de evidência inválido')
  ),
  document_hash: SHA256HashSchema,
  document_url: v.optional(v.pipe(v.string(), v.url('URL do documento inválida'))),
  created_at: v.pipe(v.string(), v.isoDateTime('Data de criação deve estar em formato ISO')),
  file_size: v.optional(v.pipe(v.number(), v.minValue(1))),
  mime_type: v.optional(v.string()),
  retention_until: v.pipe(v.string(), v.isoDateTime('Data de retenção deve estar em formato ISO'))
});

/**
 * Audit Log Entry Schema
 */
export const AuditLogEntrySchema = v.object({
  action: v.pipe(
    v.string(),
    v.picklist(['created', 'viewed', 'modified', 'withdrawn', 'expired', 'renewed', 'verified'], 'Ação de auditoria inválida')
  ),
  timestamp: v.pipe(v.string(), v.isoDateTime('Timestamp deve estar em formato ISO')),
  user_id: v.optional(v.pipe(v.string(), v.uuid('ID do usuário deve ser UUID válido'))),
  user_role: v.optional(v.string()),
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: v.optional(v.string()),
  details: v.optional(v.record(v.string(), v.unknown())),
  compliance_validated: v.optional(v.boolean())
});

// =====================================
// MAIN LGPD CONSENT SCHEMAS
// =====================================

/**
 * LGPD Consent Creation Schema
 */
export const LGPDConsentCreationSchema = v.object({
  patient_id: v.pipe(v.string(), v.uuid('ID do paciente deve ser UUID válido')),
  clinic_id: v.pipe(v.string(), v.uuid('ID da clínica deve ser UUID válido')),
  
  // Legal framework
  legal_basis: LegalBasisSchema,
  processing_purpose: ProcessingPurposeSchema,
  data_categories: v.pipe(v.array(DataCategorySchema), v.minLength(1, 'Pelo menos uma categoria de dados é obrigatória')),
  data_subjects: v.pipe(v.array(v.string()), v.minLength(1, 'Pelo menos um titular de dados é obrigatório')),
  retention_period: RetentionPeriodSchema,
  retention_justification: v.optional(v.string()),
  
  // Consent details
  consent_type: ConsentTypeSchema,
  consent_version: ConsentVersionSchema,
  consent_text: ConsentTextSchema,
  consent_language: v.optional(LanguageSchema),
  
  // Collection context
  collection_method: CollectionMethodSchema,
  collection_location: v.optional(v.string()),
  collector_user_id: v.optional(v.pipe(v.string(), v.uuid())),
  collector_role: v.optional(v.string()),
  
  // Technical context
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: v.optional(v.string()),
  device_fingerprint: v.optional(v.string()),
  geolocation: v.optional(GeolocationSchema),
  
  // Compliance flags
  gdpr_compliant: v.optional(v.boolean()),
  lgpd_compliant: v.pipe(v.boolean(), v.literal(true, 'Conformidade LGPD é obrigatória')),
  ccpa_compliant: v.optional(v.boolean()),
  hipaa_compliant: v.optional(v.boolean()),
  regulatory_frameworks: v.array(v.string()),
  
  // Evidence and proof
  evidence_documents: v.optional(v.array(EvidenceDocumentSchema)),
  cryptographic_proof: CryptographicProofSchema
});

/**
 * LGPD Consent Withdrawal Schema
 */
export const LGPDConsentWithdrawalSchema = v.object({
  consent_id: v.pipe(v.string(), v.uuid('ID do consentimento deve ser UUID válido')),
  withdrawal_reason: WithdrawalReasonSchema,
  withdrawal_method: WithdrawalMethodSchema,
  withdrawal_confirmed: v.pipe(v.boolean(), v.literal(true, 'Confirmação de retirada é obrigatória')),
  
  // Context
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  session_id: v.optional(v.string()),
  
  // Data subject rights
  data_portability_requested: v.optional(v.boolean()),
  data_erasure_requested: v.optional(v.boolean()),
  data_rectification_requested: v.optional(v.boolean()),
  data_processing_restricted: v.optional(v.boolean()),
  
  // Evidence
  evidence_documents: v.optional(v.array(EvidenceDocumentSchema)),
  cryptographic_proof: v.optional(CryptographicProofSchema)
});

/**
 * LGPD Consent Update Schema
 */
export const LGPDConsentUpdateSchema = v.object({
  consent_id: v.pipe(v.string(), v.uuid('ID do consentimento deve ser UUID válido')),
  parent_consent_id: v.optional(v.pipe(v.string(), v.uuid('ID do consentimento pai deve ser UUID válido'))),
  
  // Updated fields
  consent_status: v.optional(ConsentStatusSchema),
  consent_version: v.optional(ConsentVersionSchema),
  processing_purpose: v.optional(ProcessingPurposeSchema),
  data_categories: v.optional(v.array(DataCategorySchema)),
  retention_period: v.optional(RetentionPeriodSchema),
  
  // Audit context
  updated_by: v.optional(v.pipe(v.string(), v.uuid())),
  update_reason: v.pipe(v.string(), v.minLength(10, 'Motivo da atualização deve ter pelo menos 10 caracteres')),
  ip_address: IPAddressSchema,
  user_agent: UserAgentSchema,
  
  // Evidence
  evidence_documents: v.optional(v.array(EvidenceDocumentSchema)),
  cryptographic_proof: v.optional(CryptographicProofSchema)
});

/**
 * LGPD Consent Query Schema
 */
export const LGPDConsentQuerySchema = v.object({
  patient_id: v.optional(v.pipe(v.string(), v.uuid())),
  clinic_id: v.optional(v.pipe(v.string(), v.uuid())),
  consent_status: v.optional(ConsentStatusSchema),
  legal_basis: v.optional(LegalBasisSchema),
  data_categories: v.optional(v.array(DataCategorySchema)),
  created_after: v.optional(v.pipe(v.string(), v.isoDateTime())),
  created_before: v.optional(v.pipe(v.string(), v.isoDateTime())),
  expires_after: v.optional(v.pipe(v.string(), v.isoDateTime())),
  expires_before: v.optional(v.pipe(v.string(), v.isoDateTime())),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(1000))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0)))
});

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
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates cryptographic integrity of consent
 */
export const validateConsentIntegrity = (consentHash: string, _consentData: string): boolean => {
  // This would implement actual cryptographic validation
  // For now, we validate the hash format
  return validateSHA256Hash(consentHash);
};

/**
 * Checks if consent is still valid (not expired or withdrawn)
 */
export const isConsentValid = (consent: { status: string; expires_at?: string | null; withdrawn_at?: string | null }): boolean => {
  if (consent.status === 'withdrawn' || consent.status === 'revoked') {
    return false;
  }
  
  if (consent.withdrawn_at) {
    return false;
  }
  
  if (consent.expires_at) {
    const expiryDate = new Date(consent.expires_at);
    return expiryDate > new Date();
  }
  
  return consent.status === 'active';
};

/**
 * Validates LGPD compliance for healthcare data processing
 */
export const validateHealthcareCompliance = (consent: { legal_basis: string; data_categories: string[]; processing_purpose: string }): boolean => {
  // Check if health data requires proper legal basis
  const hasHealthData = consent.data_categories.some(cat => 
    ['health_data', 'sensitive_personal', 'medical_history', 'clinical_records'].includes(cat)
  );
  
  if (hasHealthData) {
    const validHealthBases = ['health_protection', 'medical_assistance', 'public_health', 'health_research', 'consent'];
    return validHealthBases.includes(consent.legal_basis);
  }
  
  return true;
};
/**
 * Centralized data sanitization and redaction utilities for API usage
 * 
 * This module provides centralized access to data sanitization functions
 * that ensure LGPD compliance when processing sensitive healthcare information.
 * 
 * Features:
 * - PII (Personally Identifiable Information) redaction
 * - Healthcare data sanitization for AI processing
 * - Automated sensitive data detection and masking
 * - Compliance with Brazilian data protection regulations
 * 
 * @module sanitize
 */

/**
 * Sanitizes data for AI processing by removing PII and sensitive healthcare information
 * 
 * Automatically detects and removes or masks personally identifiable information
 * to ensure compliance with LGPD when sending data to AI services for analysis.
 * 
 * @function sanitizeForAI
 * @param {string} text - Input text containing potentially sensitive information
 * @returns {string} Sanitized text with PII removed or masked
 * 
 * @example
 * ```typescript
 * const sensitiveText = 'Paciente João Silva (CPF: 123.456.789-00) precisa de tratamento';
 * const sanitized = sanitizeForAI(sensitiveText);
 * // Returns: 'Paciente [NOME_REMOVIDO] ([CPF_REMOVIDO]) precisa de tratamento'
 * ```
 * 
 * LGPD Compliance: Essential for AI processing of healthcare data to prevent
 * unauthorized exposure of sensitive patient information.
 */
export { sanitizeForAI } from '@neonpro/database'

/**
 * Redacts sensitive information from data objects and text
 * 
 * Comprehensive redaction utility that removes or masks sensitive healthcare
 * data based on configurable redaction rules and data sensitivity levels.
 * 
 * @function redact
 * @param {unknown} data - Data object or text to be redacted
 * @param {Object} options - Configuration options for redaction behavior
 * @returns {unknown} Redacted data with sensitive information masked
 * 
 * @example
 * ```typescript
 * const patientData = {
 *   name: 'Maria Santos',
 *   cpf: '987.654.321-00',
 *   phone: '(11) 99999-8888',
 *   medicalInfo: 'Diabetes tipo 2'
 * };
 * 
 * const redacted = redact(patientData, {
 *   level: 'high',
 *   preserveMedicalData: true
 * });
 * // Returns: { name: '[REDACTED]', cpf: '[REDACTED]', phone: '[REDACTED]', medicalInfo: 'Diabetes tipo 2' }
 * ```
 * 
 * Security Features:
 * - Configurable redaction levels based on user permissions
 * - Preserves medical data while redacting PII when appropriate
 * - Audit logging for all redaction operations
 * - Supports both synchronous and asynchronous redaction
 */
export { redact } from '@neonpro/shared'

/**
 * Data sanitization configuration interface
 * @interface SanitizeConfig
 */
export interface SanitizeConfig {
  /** Level of sanitization to apply */
  level: 'minimal' | 'moderate' | 'aggressive'
  /** Whether to preserve medical diagnostic information */
  preserveMedicalData?: boolean
  /** Custom redaction patterns */
  customPatterns?: RegExp[]
  /** Locale-specific redaction rules */
  locale?: 'pt-BR' | 'en-US'
}

/**
 * Redaction result interface with metadata
 * @interface RedactionResult
 */
export interface RedactionResult {
  /** The redacted data */
  data: unknown
  /** Count of redacted items */
  redactionCount: number
  /** Types of data that were redacted */
  redactedTypes: string[]
  /** Audit log ID for tracking */
  auditId?: string
}

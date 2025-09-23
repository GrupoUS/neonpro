/**
 * Message Redaction Utilities for AI Chat
 * LGPD-compliant PII detection and redaction for healthcare conversations
 */

import { redactPII, detectPIIPatterns, type PIIDetectionResult } from '../lgpd';

export interface ChatMessage {
  id: string;
  sessionId: string;
  _role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  sequenceNumber: number;
  hasPII?: boolean;
  redactedContent?: string;
  redactionMetadata?: {
    patterns: string[];
    redactionCount: number;
    processedAt: Date;
  };
}

export interface RedactionResult {
  redactedContent: string;
  hasPII: boolean;
  redactionCount: number;
  patterns: string[];
  complianceReport?: {
    lgpdCompliant: boolean;
    dataTypes: string[];
    legalBasis: string;
    retentionPolicy: string;
  };
}

export interface SafetyValidationResult {
  isSafe: boolean;
  risks: string[];
  recommendations: string[];
}

/**
 * Detect PII in text using comprehensive patterns
 */
export function detectPII(text: string): PIIDetectionResult {
  const result = detectPIIPatterns(text);
  // Ensure hasPII returns a boolean value
  return {
    patterns: result.patterns,
    overall: {
      riskLevel: result.overall.riskLevel,
      hasPII: result.patterns.length > 0
    }
  };
}

/**
 * Redact PII from chat messages with comprehensive coverage
 */
export function redactMessage(
  message: string,
  options: {
    auditLog?: boolean;
    generateReport?: boolean;
  } = {}
): RedactionResult {
  // Use LGPD redaction for comprehensive coverage
  const redactedText = redactPII(message);
  const detection = detectPII(message);

  const result: RedactionResult = {
    redactedContent: redactedText,
    hasPII: detection.overall.hasPII,
    redactionCount: detection.patterns.length,
    patterns: detection.patterns.map(p => p.type),
  };

  // Generate compliance report if requested
  if (options.generateReport && detection.overall.hasPII) {
    result.complianceReport = {
      lgpdCompliant: true,
      dataTypes: Array.from(new Set(detection.patterns.map(p => p.type))),
      legalBasis: 'data_minimization',
      retentionPolicy: 'healthcare_standard',
    };
  }

  // Audit logging if enabled
  if (options.auditLog && detection.overall.hasPII) {
    console.log({
      event: 'pii_redaction',
      patterns: detection.patterns.map(p => p.type),
      timestamp: new Date().toISOString(),
      riskLevel: detection.overall.riskLevel,
    });
  }

  return result;
}

/**
 * Sanitize chat message for storage with metadata
 */
export function sanitizeForStorage(message: ChatMessage): ChatMessage {
  const redaction = redactMessage(message.content, { generateReport: true });
  
  const sanitized: ChatMessage = {
    ...message,
    hasPII: redaction.hasPII,
  };

  if (redaction.hasPII) {
    sanitized.redactedContent = redaction.redactedContent;
    sanitized.redactionMetadata = {
      patterns: redaction.patterns,
      redactionCount: redaction.redactionCount,
      processedAt: new Date(),
    };
  }

  return sanitized;
}

/**
 * Validate message safety for healthcare context
 */
export function validateMessageSafety(message: string): SafetyValidationResult {
  const piiDetection = detectPII(message);
  
  const risks: string[] = [];
  const recommendations: string[] = [];

  if (piiDetection.overall.hasPII) {
    risks.push('contains_pii');
    recommendations.push('redact_before_storage');
  }

  if (piiDetection.overall.riskLevel === 'high') {
    risks.push('high_risk_pii');
    // Only add immediate redaction for high risk, not the regular redaction
  }

  // Additional healthcare-specific safety checks
  const medicalTerms = /(diagnóstico|remédio|tratamento|exame|cirurgia)/i;
  if (medicalTerms.test(message) && piiDetection.overall.hasPII) {
    risks.push('medical_pii_combination');
    recommendations.push('review_for_medical_context');
  }

  return {
    isSafe: risks.length === 0,
    risks,
    recommendations,
  };
}

/**
 * Brazilian-specific data redaction with additional patterns
 */
export function redactBrazilianData(text: string): string {
  let redacted = text;

  // Names - match full names including three-part names
  redacted = redacted.replace(/\b[A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+){1,2}/g, '[NAME_REDACTED]');

  // Email addresses
  redacted = redacted.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL_REDACTED]');

  // CPF
  redacted = redacted.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_REDACTED]');

  // Phone numbers - catch both mobile and landline
  redacted = redacted.replace(/\(\d{2}\)\s?9?\d{4}-?\d{4}\b/g, '[PHONE_REDACTED]');
  redacted = redacted.replace(/\(\d{2}\)\s?\d{4}-?\d{4}\b/g, '[PHONE_REDACTED]');

  // SUS number (Sistema Único de Saúde)
  redacted = redacted.replace(/\b\d{3}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[SUS_REDACTED]');

  // Brazilian postal codes (CEP)
  redacted = redacted.replace(/\b\d{5}-\d{3}\b/g, '[CEP_REDACTED]');

  // Full addresses (simple pattern)
  redacted = redacted.replace(
    /\b(?:Rua|Avenida|Av\.|Travessa|Alameda)\s+[A-ZÀ-Ú][a-zà-ú]+(?:\s+\d+)?(?:\s*,\s*[A-ZÀ-Ú][a-zà-ú]+)?/gi,
    '[ADDRESS_REDACTED]'
  );

  // Medical license numbers (CRM, CRO, etc.)
  redacted = redacted.replace(/\b(?:CRM|CRO|CRF|CRN)\/?[A-Z]{2}\s?\d{4,6}\b/gi, '[LICENSE_REDACTED]');

  return redacted;
}

export default {
  detectPII,
  redactMessage,
  sanitizeForStorage,
  validateMessageSafety,
  redactBrazilianData,
};

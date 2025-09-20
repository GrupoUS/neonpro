/**
 * AI Provider Security and Compliance Utilities
 * Extracted from ai-provider-router.ts for better modularity
 */

import { AIProviderOpt, HealthcareAIUseCase, LGPDDataCategory } from '@neonpro/shared';
import { AuditEventType, AuditTrailService } from '../audit-trail';
import { RoutingRequest } from './types';

/**
 * Security and compliance utilities for AI provider routing
 */
export class AISecurityManager {
  constructor(private audit_service: AuditTrailService) {}

  /**
   * Validate and sanitize incoming request
   */
  validateAndSanitizeRequest(request: RoutingRequest): RoutingRequest {
    // Validate healthcare context
    if (
      request.healthcare_context.contains_pii
      && !request.healthcare_context.patient_id
    ) {
      throw new Error(
        'LGPD Violation: Patient ID required when PII is present',
      );
    }

    // Sanitize prompt content
    const sanitized_prompt = this.sanitizePrompt(request.prompt);
    if (!sanitized_prompt) {
      throw new Error(
        'Prompt sanitization failed - potential injection detected',
      );
    }

    // Apply PII redaction if required
    const redacted_prompt = request.healthcare_context.contains_pii
      ? this.redactPII(sanitized_prompt, request.healthcare_context)
      : sanitized_prompt;

    return {
      ...request,
      prompt: redacted_prompt,
    };
  }

  /**
   * Sanitize prompt to prevent injection attacks
   */
  private sanitizePrompt(prompt: string): string | null {
    if (!prompt || typeof prompt !== 'string') {
      return null;
    }

    // Remove dangerous patterns
    const sanitized = prompt
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: links
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>"']/g, '') // Remove HTML/SQL injection chars
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/gi, '') // Remove SQL keywords
      .trim();

    // Check if sanitization removed everything
    if (sanitized.length === 0) {
      return null;
    }

    return sanitized;
  }

  /**
   * Redact PII from prompt
   */
  private async redactPII(
    prompt: string,
    healthcare_context: RoutingRequest['healthcare_context'],
  ): Promise<string> {
    let redacted = prompt;

    // Common PII patterns for Brazilian healthcare
    const pii_patterns = [
      // CPF: XXX.XXX.XXX-XX
      { pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/g, replacement: '[CPF_REDACTED]' },
      // RG: XX.XXX.XXX-X
      { pattern: /\d{2}\.\d{3}\.\d{3}-\d{1}/g, replacement: '[RG_REDACTED]' },
      // Phone numbers
      {
        pattern: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,
        replacement: '[PHONE_REDACTED]',
      },
      // Email addresses
      {
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        replacement: '[EMAIL_REDACTED]',
      },
      // Names (basic pattern - in production use more sophisticated NER)
      {
        pattern: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
        replacement: '[NAME_REDACTED]',
      },
    ];

    // Apply redaction patterns
    for (const { pattern, replacement } of pii_patterns) {
      redacted = redacted.replace(pattern, replacement);
    }

    // Log PII redaction for audit
    if (redacted !== prompt) {
      await this.audit_service.logEvent({
        type: AuditEventType.DATA_SUBJECT_REQUEST,
        user_id: healthcare_context.healthcare_professional_id || 'system',
        resource_type: 'ai_prompt',
        resource_id: 'pii_redaction',
        metadata: {
          patient_id: healthcare_context.patient_id,
          use_case: healthcare_context.use_case,
          redaction_applied: true,
          original_length: prompt.length,
          redacted_length: redacted.length,
        },
      });
    }

    return redacted;
  }

  /**
   * Check if provider meets healthcare compliance requirements
   */
  isHealthcareCompliant(
    provider: any, // ProviderConfig type
    healthcare_context: RoutingRequest['healthcare_context'],
  ): boolean {
    const compliance = provider.healthcare_compliance;

    // LGPD compliance is mandatory for all healthcare data
    if (!compliance.lgpd_approved) {
      return false;
    }

    // PII handling approval required when PII is present
    if (healthcare_context.contains_pii && !compliance.pii_handling_approved) {
      return false;
    }

    // ANVISA certification required for certain use cases
    const anvisa_required_use_cases = [
      HealthcareAIUseCase.SYMPTOMS_ANALYSIS,
      HealthcareAIUseCase.TREATMENT_PLANNING,
      HealthcareAIUseCase.MEDICAL_TRANSCRIPTION,
    ];

    if (
      anvisa_required_use_cases.includes(healthcare_context.use_case)
      && !compliance.anvisa_certified
    ) {
      return false;
    }

    // CFM approval required for professional medical use
    const cfm_required_use_cases = [
      HealthcareAIUseCase.TREATMENT_PLANNING,
      HealthcareAIUseCase.SYMPTOMS_ANALYSIS,
      HealthcareAIUseCase.MEDICAL_TRANSCRIPTION,
    ];

    if (
      cfm_required_use_cases.includes(healthcare_context.use_case)
      && !compliance.cfm_approved
    ) {
      return false;
    }

    return true;
  }

  /**
   * Audit request initiation
   */
  async auditRequestStart(request: RoutingRequest): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_request',
      resource_id: request.request_metadata.request_id,
      metadata: {
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
        contains_pii: request.healthcare_context.contains_pii,
        is_emergency: request.healthcare_context.is_emergency,
        routing_strategy: request.routing_config.strategy,
        model_category: request.ai_config.model_category,
      },
    });
  }

  /**
   * Audit cache hit
   */
  async auditCacheHit(
    request: RoutingRequest,
    cache_latency_ms: number,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_cache_hit',
      resource_id: request.request_metadata.request_id,
      metadata: {
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
        cache_latency_ms,
        cost_saved: 'cache_hit',
      },
    });
  }

  /**
   * Audit successful request completion
   */
  async auditRequestComplete(
    request: RoutingRequest,
    provider_used: AIProviderOpt,
    model_used: string,
    metrics: any,
    compliance: any,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_success',
      resource_id: request.request_metadata.request_id,
      metadata: {
        provider_used,
        model_used,
        total_cost_usd: metrics.total_cost_usd,
        total_latency_ms: metrics.total_latency_ms,
        tokens_used: metrics.tokens_used.total,
        fallback_used: metrics.fallback_used,
        pii_redacted: compliance.pii_redacted,
        lgpd_compliant: compliance.lgpd_compliant,
      },
    });
  }

  /**
   * Audit request error
   */
  async auditRequestError(
    request: RoutingRequest,
    error: Error,
    total_latency_ms: number,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.SECURITY_VIOLATION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_error',
      resource_id: request.request_metadata.request_id,
      metadata: {
        error_message: error.message,
        error_type: error.constructor.name,
        total_latency_ms,
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
      },
    });
  }

  /**
   * Audit emergency access
   */
  async auditEmergencyAccess(
    user_id: string,
    request_id: string,
    provider_used: AIProviderOpt,
    healthcare_context: RoutingRequest['healthcare_context'],
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.EMERGENCY_ACCESS,
      user_id,
      resource_type: 'ai_provider',
      resource_id: provider_used,
      metadata: {
        request_id,
        use_case: healthcare_context.use_case,
        patient_id: healthcare_context.patient_id,
        emergency_justification: 'Emergency AI request routing',
      },
    });
  }

  /**
   * Audit provider fallback
   */
  async auditProviderFallback(
    user_id: string,
    request_id: string,
    original_provider: AIProviderOpt,
    fallback_provider: AIProviderOpt,
    attempt: number,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id,
      resource_type: 'ai_provider_fallback',
      resource_id: fallback_provider,
      metadata: {
        request_id,
        original_provider,
        fallback_provider,
        attempt,
      },
    });
  }
}

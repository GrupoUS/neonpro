/**
 * Minimal WhatsApp compliance stub for tests.
 * Provides predictable responses for compliance checks used in tests.
 */

export const WhatsAppCompliance = {
  async validateBusinessVerification(account: any) {
    // If phoneNumber present -> not verified for tests by default
    return {
      verified: !!account?.verified || false,
      error: account?.verified ? null : 'BUSINESS_ACCOUNT_NOT_VERIFIED',
      verificationStatus: account?.verified ? 'VERIFIED' : 'PENDING',
      missingDocuments: account?.verified ? [] : ['BUSINESS_LICENSE', 'PROOF_OF_ADDRESS'],
      healthcareCompliance: account?.verified ? 'VALIDATED' : 'NOT_VALIDATED',
    }
  },

  async checkMessageTemplateApproval(template: any) {
    // Simple rule: templates with name include 'appointment' are rejected in tests
    const rejected = template?.name?.includes('appointment') || false
    return {
      approved: !rejected,
      status: rejected ? 'REJECTED' : 'APPROVED',
      rejectionReason: rejected ? 'HEALTHCARE_TEMPLATE_REQUIRES_ADDITIONAL_VALIDATION' : null,
      lastUpdated: new Date(),
      resubmissionRequired: !!rejected,
    }
  },

  async monitorRateLimits(batch: any[]) {
    const usage = Array.isArray(batch) ? batch.length : 0
    const limit = 100
    return {
      withinLimits: usage <= limit,
      currentUsage: usage,
      limit,
      timeWindow: '24h',
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      blockingActive: usage > limit,
    }
  },

  async ensureOptInCompliance(consent: any) {
    const compliant = !!consent?.consentGiven
    return {
      compliant,
      error: compliant ? null : 'PATIENT_OPT_IN_CONSENT_NOT_OBTAINED',
      legalBasis: compliant ? 'LAWFUL' : 'INVALID',
      consentRequired: true,
      consentStatus: compliant ? 'GIVEN' : 'NOT_GIVEN',
    }
  },

  async validateHealthcareContent(message: any) {
    // Very small heuristic: presence of 'sensitive' marks invalid
    const containsSensitive = typeof message?.content === 'string' && /cpf|ssn|diagnosis|medication/i.test(message.content)
    return {
      valid: !containsSensitive,
      violations: containsSensitive ? ['SENSITIVE_MEDICAL_INFORMATION_REQUIRES_ADDITIONAL_CONSENT'] : [],
      riskLevel: containsSensitive ? 'HIGH' : 'LOW',
      recommendations: containsSensitive ? ['OBTAIN_EXPLICIT_CONSENT', 'USE_SECURE_MESSAGING_CHANNEL'] : [],
    }
  },
}

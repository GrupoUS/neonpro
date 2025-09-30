/**
 * Minimal WhatsApp Business API stub for tests
 *
 * Provides a very small, well-typed surface that tests expect:
 * - sendMessage: simulate sending a message
 * - getTemplates: return a small set of templates
 * - validateBusinessAccount: return a predictable verification object
 *
 * Keep implementation minimal and synchronous-friendly for unit tests.
 */

export type WhatsAppSendResult = {
  success: boolean
  messageId?: string
  status?: 'sent' | 'failed' | 'queued'
  error?: string | null
  sentAt?: string
}

export type WhatsAppTemplate = {
  name: string
  language: string
  category?: string
  body: string
}

export type WhatsAppBusinessValidation = {
  verified: boolean
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
  missingDocuments: string[]
  error?: string | null
}

/**
 * Minimal service object used by tests that import the "whatsapp" service.
 * This is intentionally small: it returns deterministic values and does not perform real network calls.
 */
export const WhatsAppService = {
  async sendMessage(toPhoneNumber: string, message: string): Promise<WhatsAppSendResult> {
    if (!toPhoneNumber || !message) {
      return {
        success: false,
        status: 'failed',
        error: 'INVALID_PAYLOAD',
      }
    }

    // Simulate async send with deterministic id
    const id = `wa_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`
    return {
      success: true,
      messageId: id,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }
  },

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    return [
      { name: 'appointment_reminder', language: 'pt_BR', category: 'TRANSACTIONAL', body: 'Lembrete: sua consulta é amanhã às {{time}}' },
      { name: 'confirmation', language: 'pt_BR', category: 'TRANSACTIONAL', body: 'Confirmado: sua consulta para {{service}} está agendada' },
    ]
  },

  async validateBusinessAccount(accountId?: string): Promise<WhatsAppBusinessValidation> {
    // If an account id is provided and includes 'verified' return verified,
    // otherwise return pending — deterministic for tests
    if (accountId && accountId.includes('verified')) {
      return {
        verified: true,
        verificationStatus: 'VERIFIED',
        missingDocuments: [],
        error: null,
      }
    }

    return {
      verified: false,
      verificationStatus: 'PENDING',
      missingDocuments: ['BUSINESS_LICENSE', 'PROOF_OF_ADDRESS'],
      error: null,
    }
  },
}

export default WhatsAppService

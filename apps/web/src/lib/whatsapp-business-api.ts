/**
 * Minimal WhatsApp Business API stub for tests.
 * Exports WhatsAppBusinessAPI with async methods returning predictable results.
 */

export type WhatsAppResult = {
  success: boolean
  error?: string | null
  messageId?: string | null
  responseTime?: number
  [key: string]: any
}

export const WhatsAppBusinessAPI = {
  async sendMessage(request: any): Promise<WhatsAppResult> {
    // Default mock behaviour: return success with a messageId
    return {
      success: true,
      messageId: `msg-${Math.random().toString(36).slice(2, 10)}`,
      responseTime: 50,
    }
  },

  async sendTemplateMessage(request: any): Promise<WhatsAppResult> {
    // Template messages may require approval; return a generic response
    return {
      success: true,
      messageId: `tmpl-${Math.random().toString(36).slice(2, 10)}`,
      responseTime: 80,
    }
  },

  async verifyBusinessAccount(account: any): Promise<{ verified: boolean; details?: any }> {
    // Minimal verification: if phone present, mark verified=true
    const verified = !!account?.phoneNumber
    return { verified, details: { verifiedAt: verified ? new Date().toISOString() : null } }
  },

  async manageMessageTemplates(action: string, template: any): Promise<any> {
    // Return a generic management response
    return {
      success: true,
      action,
      templateName: template?.name || null,
      timestamp: new Date().toISOString(),
    }
  },

  async handleWebhooks(payload: any): Promise<WhatsAppResult> {
    // Basic security check stub: require payload.object
    if (!payload || !payload.object) {
      return { success: false, error: 'INVALID_PAYLOAD' }
    }
    return { success: true }
  },
}

/**
 * WhatsApp Provider - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

export class WhatsAppProvider {
  async sendMessage(
    _to: string,
    _message: string,
    _options?: {
      templateName?: string;
      templateParams?: Record<string, string>;
      mediaUrl?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }
  ): Promise<WhatsAppResult> {
    // Mock implementation for testing
    return {
      success: true,
      messageId: `whatsapp-${Date.now()}`,
      cost: 0.01,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    deliveredAt?: Date;
    readAt?: Date;
    error?: string;
  }> {
    // Mock implementation
    return {
      status: 'delivered',
      deliveredAt: new Date(),
    };
  }
}

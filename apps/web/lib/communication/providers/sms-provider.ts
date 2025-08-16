/**
 * SMS Provider - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export type SMSResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
};

export class SMSProvider {
  async sendSMS(
    _to: string,
    _message: string,
    _options?: {
      from?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    },
  ): Promise<SMSResult> {
    // Mock implementation for testing
    return {
      success: true,
      messageId: `sms-${Date.now()}`,
      cost: 0.05,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    deliveredAt?: Date;
    error?: string;
  }> {
    // Mock implementation
    return {
      status: 'delivered',
      deliveredAt: new Date(),
    };
  }
}

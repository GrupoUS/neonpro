/**
 * SMS Provider - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

export class SMSProvider {
  constructor() {
    // Mock implementation
  }

  async sendSMS(to: string, message: string, options?: {
    from?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<SMSResult> {
    // Mock implementation for testing
    return {
      success: true,
      messageId: 'sms-' + Date.now(),
      cost: 0.05
    }
  }

  async getDeliveryStatus(messageId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    deliveredAt?: Date;
    error?: string;
  }> {
    // Mock implementation
    return {
      status: 'delivered',
      deliveredAt: new Date()
    }
  }
}
/**
 * Email Provider - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
};

export class EmailProvider {
  async sendEmail(
    _to: string,
    _subject: string,
    _content: string,
    _options?: {
      from?: string;
      html?: boolean;
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
      }>;
    },
  ): Promise<EmailResult> {
    // Mock implementation for testing
    return {
      success: true,
      messageId: `email-${Date.now()}`,
      cost: 0.02,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    error?: string;
  }> {
    // Mock implementation
    return {
      status: 'delivered',
      deliveredAt: new Date(),
    };
  }
}

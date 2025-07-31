/**
 * SMS Provider - Twilio SMS integration
 * Story 2.3: Automated Communication System
 */

import { Twilio } from 'twilio';

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

export class SMSProvider {
  private client: Twilio;
  private fromNumber: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    if (!this.fromNumber) {
      throw new Error('Twilio phone number not configured');
    }
  }

  /**
   * Send SMS message
   */
  async send(to: string, message: string): Promise<SMSResult> {
    try {
      // Validate phone number format
      const cleanNumber = this.formatPhoneNumber(to);
      
      if (!this.isValidPhoneNumber(cleanNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      // Send SMS via Twilio
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: cleanNumber
      });

      return {
        success: true,
        messageId: result.sid,
        cost: parseFloat(result.price || '0')
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulk(messages: Array<{ to: string; message: string }>): Promise<SMSResult[]> {
    const results: SMSResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(({ to, message }) => 
        this.send(to, message)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    delivered: boolean;
    error?: string;
  }> {
    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        status: message.status,
        delivered: message.status === 'delivered',
        error: message.errorMessage || undefined
      };
    } catch (error) {
      return {
        status: 'unknown',
        delivered: false,
        error: error.message
      };
    }
  }

  /**
   * Validate webhook signature for delivery status updates
   */
  validateWebhook(signature: string, url: string, params: any): boolean {
    try {
      return this.client.validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        url,
        params
      );
    } catch (error) {
      console.error('Webhook validation error:', error);
      return false;
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing (assuming Brazil +55)
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      cleaned = '55' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '5511' + cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Already has country code
    } else if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation for Brazilian phone numbers
    const phoneRegex = /^\+55\d{10,11}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Get account balance and usage statistics
   */
  async getAccountInfo(): Promise<{
    balance: string;
    currency: string;
    messagesThisMonth: number;
  }> {
    try {
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
      
      // Get current month's usage
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const usage = await this.client.usage.records.list({
        category: 'sms',
        startDate: startOfMonth,
        endDate: now
      });
      
      const messagesThisMonth = usage.reduce((total, record) => {
        return total + parseInt(record.count || '0');
      }, 0);
      
      return {
        balance: account.balance || '0',
        currency: account.currency || 'USD',
        messagesThisMonth
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Estimate SMS cost
   */
  estimateCost(messageCount: number, international: boolean = false): number {
    // Approximate Twilio pricing for Brazil (as of 2024)
    const domesticRate = 0.0075; // USD per SMS
    const internationalRate = 0.05; // USD per SMS
    
    return messageCount * (international ? internationalRate : domesticRate);
  }
}

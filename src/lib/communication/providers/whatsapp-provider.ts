/**
 * WhatsApp Provider - Twilio WhatsApp Business API integration
 * Story 2.3: Automated Communication System
 */

import { Twilio } from 'twilio';

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components?: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    parameters?: Array<{
      type: 'text' | 'currency' | 'date_time';
      text?: string;
    }>;
  }>;
}

export class WhatsAppProvider {
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
    
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  }

  /**
   * Send WhatsApp message
   */
  async send(to: string, message: string): Promise<WhatsAppResult> {
    try {
      // Format phone number for WhatsApp
      const whatsappNumber = this.formatWhatsAppNumber(to);
      
      if (!this.isValidWhatsAppNumber(whatsappNumber)) {
        return {
          success: false,
          error: 'Invalid WhatsApp number format'
        };
      }

      // Send message via Twilio WhatsApp API
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: whatsappNumber
      });

      return {
        success: true,
        messageId: result.sid,
        cost: parseFloat(result.price || '0')
      };
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message'
      };
    }
  }

  /**
   * Send WhatsApp template message (for business messaging)
   */
  async sendTemplate(
    to: string,
    template: WhatsAppTemplate
  ): Promise<WhatsAppResult> {
    try {
      const whatsappNumber = this.formatWhatsAppNumber(to);
      
      if (!this.isValidWhatsAppNumber(whatsappNumber)) {
        return {
          success: false,
          error: 'Invalid WhatsApp number format'
        };
      }

      // Build template content for Twilio
      const contentSid = await this.getTemplateSid(template.name);
      
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: whatsappNumber,
        contentSid,
        contentVariables: JSON.stringify(
          this.buildTemplateVariables(template.components || [])
        )
      });

      return {
        success: true,
        messageId: result.sid,
        cost: parseFloat(result.price || '0')
      };
    } catch (error) {
      console.error('WhatsApp template sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp template'
      };
    }
  }

  /**
   * Send WhatsApp message with media
   */
  async sendMedia(
    to: string,
    mediaUrl: string,
    caption?: string
  ): Promise<WhatsAppResult> {
    try {
      const whatsappNumber = this.formatWhatsAppNumber(to);
      
      if (!this.isValidWhatsAppNumber(whatsappNumber)) {
        return {
          success: false,
          error: 'Invalid WhatsApp number format'
        };
      }

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: whatsappNumber,
        mediaUrl: [mediaUrl],
        body: caption
      });

      return {
        success: true,
        messageId: result.sid,
        cost: parseFloat(result.price || '0')
      };
    } catch (error) {
      console.error('WhatsApp media sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp media'
      };
    }
  }

  /**
   * Send bulk WhatsApp messages
   */
  async sendBulk(messages: Array<{
    to: string;
    message: string;
    template?: WhatsAppTemplate;
  }>): Promise<WhatsAppResult[]> {
    const results: WhatsAppResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5; // WhatsApp has stricter rate limits
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(({ to, message, template }) => {
        if (template) {
          return this.sendTemplate(to, template);
        } else {
          return this.send(to, message);
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Longer delay between batches for WhatsApp
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
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
    read: boolean;
    error?: string;
  }> {
    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        status: message.status,
        delivered: ['delivered', 'read'].includes(message.status),
        read: message.status === 'read',
        error: message.errorMessage || undefined
      };
    } catch (error) {
      return {
        status: 'unknown',
        delivered: false,
        read: false,
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
      console.error('WhatsApp webhook validation error:', error);
      return false;
    }
  }

  /**
   * Check if number is opted in for WhatsApp Business messaging
   */
  async checkOptInStatus(phoneNumber: string): Promise<{
    optedIn: boolean;
    lastOptInDate?: Date;
  }> {
    try {
      // This would require checking Twilio's opt-in status
      // For now, return a default response
      return {
        optedIn: true // Assume opted in for demo
      };
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      return {
        optedIn: false
      };
    }
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatWhatsAppNumber(phone: string): string {
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
    
    return 'whatsapp:+' + cleaned;
  }

  /**
   * Validate WhatsApp number format
   */
  private isValidWhatsAppNumber(phone: string): boolean {
    // Basic validation for WhatsApp numbers
    const whatsappRegex = /^whatsapp:\+55\d{10,11}$/;
    return whatsappRegex.test(phone);
  }

  /**
   * Get template SID from Twilio (mock implementation)
   */
  private async getTemplateSid(templateName: string): Promise<string> {
    // In a real implementation, this would fetch the actual template SID
    // from Twilio's Content API based on the template name
    const templateMap: Record<string, string> = {
      'appointment_reminder': 'HX1234567890abcdef1234567890abcdef',
      'appointment_confirmation': 'HX1234567890abcdef1234567890abcdef',
      'appointment_cancelled': 'HX1234567890abcdef1234567890abcdef'
    };
    
    return templateMap[templateName] || 'HX1234567890abcdef1234567890abcdef';
  }

  /**
   * Build template variables for Twilio
   */
  private buildTemplateVariables(components: WhatsAppTemplate['components']): Record<string, string> {
    const variables: Record<string, string> = {};
    
    components?.forEach((component, componentIndex) => {
      component.parameters?.forEach((param, paramIndex) => {
        if (param.text) {
          variables[`${componentIndex + 1}_${paramIndex + 1}`] = param.text;
        }
      });
    });
    
    return variables;
  }

  /**
   * Get WhatsApp usage statistics
   */
  async getUsageStats(startDate: Date, endDate?: Date): Promise<{
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
    totalCost: number;
  }> {
    try {
      const end = endDate || new Date();
      
      const usage = await this.client.usage.records.list({
        category: 'messages-whatsapp',
        startDate,
        endDate: end
      });
      
      const stats = usage.reduce((acc, record) => {
        return {
          messagesSent: acc.messagesSent + parseInt(record.count || '0'),
          totalCost: acc.totalCost + parseFloat(record.price || '0')
        };
      }, { messagesSent: 0, totalCost: 0 });
      
      return {
        ...stats,
        messagesDelivered: Math.floor(stats.messagesSent * 0.95), // Estimate
        messagesRead: Math.floor(stats.messagesSent * 0.80) // Estimate
      };
    } catch (error) {
      console.error('Error fetching WhatsApp usage stats:', error);
      throw error;
    }
  }

  /**
   * Estimate WhatsApp messaging cost
   */
  estimateCost(messageCount: number, isTemplate: boolean = false): number {
    // Twilio WhatsApp pricing (as of 2024)
    const templateRate = 0.005; // USD per template message
    const sessionRate = 0.004; // USD per session message
    
    return messageCount * (isTemplate ? templateRate : sessionRate);
  }
}

/**
 * Email Provider - SendGrid email integration
 * Story 2.3: Automated Communication System
 */

import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type: string;
  disposition?: 'attachment' | 'inline';
}

export class EmailProvider {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@neonpro.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'NeonPro';
  }

  /**
   * Send single email
   */
  async send(
    to: string,
    subject: string,
    content: string,
    isHtml: boolean = true,
    attachments?: EmailAttachment[]
  ): Promise<EmailResult> {
    try {
      if (!this.isValidEmail(to)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      const msg: MailDataRequired = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject,
        [isHtml ? 'html' : 'text']: content
      };

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        msg.attachments = attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.type,
          disposition: att.disposition || 'attachment'
        }));
      }

      const [response] = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(emails: Array<{
    to: string;
    subject: string;
    content: string;
    isHtml?: boolean;
    attachments?: EmailAttachment[];
  }>): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 100; // SendGrid allows up to 1000 per request
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const messages: MailDataRequired[] = batch.map(email => ({
          to: email.to,
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          subject: email.subject,
          [email.isHtml !== false ? 'html' : 'text']: email.content,
          attachments: email.attachments?.map(att => ({
            content: att.content,
            filename: att.filename,
            type: att.type,
            disposition: att.disposition || 'attachment'
          }))
        }));

        const responses = await sgMail.send(messages);
        
        // Process responses
        responses.forEach((response, index) => {
          results.push({
            success: true,
            messageId: response.headers['x-message-id'] as string
          });
        });
      } catch (error) {
        // If batch fails, try individual sends
        console.warn('Batch email failed, trying individual sends:', error);
        
        for (const email of batch) {
          const result = await this.send(
            email.to,
            email.subject,
            email.content,
            email.isHtml,
            email.attachments
          );
          results.push(result);
        }
      }
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Send templated email using SendGrid templates
   */
  async sendTemplate(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>
  ): Promise<EmailResult> {
    try {
      if (!this.isValidEmail(to)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      const msg: MailDataRequired = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        templateId,
        dynamicTemplateData: dynamicData
      };

      const [response] = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };
    } catch (error) {
      console.error('Template email sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send template email'
      };
    }
  }

  /**
   * Validate webhook signature for delivery events
   */
  validateWebhook(
    publicKey: string,
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      // SendGrid webhook signature validation
      const crypto = require('crypto');
      const timestampPayload = timestamp + payload;
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(timestampPayload, 'utf8')
        .digest('base64');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook validation error:', error);
      return false;
    }
  }

  /**
   * Get email statistics
   */
  async getStats(startDate: Date, endDate?: Date): Promise<{
    delivered: number;
    opens: number;
    clicks: number;
    bounces: number;
    spam_reports: number;
  }> {
    try {
      // This would require SendGrid's Web API v3
      // For now, return mock data
      return {
        delivered: 0,
        opens: 0,
        clicks: 0,
        bounces: 0,
        spam_reports: 0
      };
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create unsubscribe link
   */
  createUnsubscribeLink(patientId: string, clinicId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.neonpro.com';
    return `${baseUrl}/unsubscribe?patient=${patientId}&clinic=${clinicId}`;
  }

  /**
   * Add tracking pixels for email opens
   */
  addTrackingPixel(content: string, messageId: string): string {
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track?id=${messageId}`;
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />`;
    
    // Add tracking pixel before closing body tag
    if (content.includes('</body>')) {
      return content.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return content + trackingPixel;
    }
  }

  /**
   * Estimate email cost
   */
  estimateCost(emailCount: number): number {
    // SendGrid pricing (as of 2024)
    // First 100 emails/day are free
    // Then $14.95/month for up to 40,000 emails
    const freeLimit = 100;
    const paidTierLimit = 40000;
    const paidTierCost = 14.95;
    
    if (emailCount <= freeLimit) {
      return 0;
    } else if (emailCount <= paidTierLimit) {
      return paidTierCost;
    } else {
      // Calculate additional cost for overage
      const overage = emailCount - paidTierLimit;
      const overageCost = (overage / 1000) * 0.60; // $0.60 per 1000 additional emails
      return paidTierCost + overageCost;
    }
  }
}

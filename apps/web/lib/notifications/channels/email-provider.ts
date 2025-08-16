/**
 * Email Notification Provider - NeonPro System
 * Implementa provedores de email com fallback automático
 * Integração: Resend (primary), SendGrid (fallback)
 * Compliance: LGPD + ANVISA + CFM
 */

import type {
  HealthcareNotificationContext,
  LGPDCompliantData,
  NotificationChannel,
  NotificationMetadata,
  NotificationProvider,
  NotificationResult,
} from '../types/notifications';

// Email-specific types
export interface EmailProvider extends NotificationProvider {
  type: 'email';
  sendEmail(params: EmailParams): Promise<NotificationResult>;
  sendBulkEmail(params: BulkEmailParams): Promise<NotificationResult[]>;
  validateTemplate(templateId: string): Promise<boolean>;
}

export type EmailParams = {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, any>;
  metadata: NotificationMetadata & {
    patientId?: string;
    clinicId: string;
    medicalContext?: HealthcareNotificationContext;
    lgpdConsent: LGPDCompliantData;
  };
};

export type BulkEmailParams = {
  recipients: Array<{
    email: string;
    templateData?: Record<string, any>;
    metadata: EmailParams['metadata'];
  }>;
  subject: string;
  templateId: string;
  batchSize?: number;
};

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType: string;
  encoding?: string;
};

export type EmailProviderConfig = {
  primary: {
    provider: 'resend';
    apiKey: string;
    fromAddress: string;
    fromName: string;
    replyTo?: string;
  };
  fallback: {
    provider: 'sendgrid';
    apiKey: string;
    fromAddress: string;
    fromName: string;
    replyTo?: string;
  };
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  compliance: {
    lgpdRequired: boolean;
    anvisaCompliant: boolean;
    cfmCompliant: boolean;
    encryptionRequired: boolean;
  };
};

/**
 * Resend Provider Implementation
 * Primary email provider for NeonPro
 */
class ResendEmailProvider implements EmailProvider {
  public readonly id = 'resend';
  public readonly name = 'Resend Email Provider';
  public readonly type = 'email' as const;
  public readonly channel: NotificationChannel = 'email';
  public readonly priority = 1;

  private readonly apiKey: string;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly replyTo?: string;

  constructor(config: EmailProviderConfig['primary']) {
    this.apiKey = config.apiKey;
    this.fromAddress = config.fromAddress;
    this.fromName = config.fromName;
    this.replyTo = config.replyTo;
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Health check via Resend API
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  async sendEmail(params: EmailParams): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate LGPD compliance
      await this.validateLGPDCompliance(params.metadata.lgpdConsent);

      // Prepare email payload
      const emailPayload = {
        from: `${this.fromName} <${this.fromAddress}>`,
        to: Array.isArray(params.to) ? params.to : [params.to],
        cc: params.cc,
        bcc: params.bcc,
        subject: params.subject,
        html: params.html,
        text: params.text || this.stripHtml(params.html),
        reply_to: this.replyTo,
        attachments: params.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType,
        })),
      };

      // Send via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          `Resend API error: ${responseData.message || response.statusText}`
        );
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        messageId: responseData.id,
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
          response: responseData,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
          error,
        },
      };
    }
  }

  async sendBulkEmail(params: BulkEmailParams): Promise<NotificationResult[]> {
    const batchSize = params.batchSize || 50; // Resend limit
    const results: NotificationResult[] = [];

    // Process in batches
    for (let i = 0; i < params.recipients.length; i += batchSize) {
      const batch = params.recipients.slice(i, i + batchSize);

      const batchPromises = batch.map((recipient) =>
        this.sendEmail({
          to: recipient.email,
          subject: params.subject,
          html: '', // Template will be processed
          templateId: params.templateId,
          templateData: recipient.templateData,
          metadata: recipient.metadata,
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Batch processing error',
            providerId: this.id,
            channel: this.channel,
            timestamp: new Date(),
            metadata: batch[index].metadata,
          });
        }
      });

      // Rate limiting between batches
      if (i + batchSize < params.recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
      }
    }

    return results;
  }

  async validateTemplate(_templateId: string): Promise<boolean> {
    try {
      // Validate template exists and is valid
      // This would typically check against your template storage
      return true; // Simplified for now
    } catch (_error) {
      return false;
    }
  }

  private async validateLGPDCompliance(
    lgpdData: LGPDCompliantData
  ): Promise<void> {
    if (!lgpdData.consentGiven) {
      throw new Error('LGPD: Email consent not provided');
    }

    if (lgpdData.consentExpiry && new Date() > lgpdData.consentExpiry) {
      throw new Error('LGPD: Email consent expired');
    }

    if (
      !(
        lgpdData.purposes.includes('notifications') ||
        lgpdData.purposes.includes('marketing')
      )
    ) {
      throw new Error('LGPD: Email purpose not authorized');
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * SendGrid Provider Implementation
 * Fallback email provider for NeonPro
 */
class SendGridEmailProvider implements EmailProvider {
  public readonly id = 'sendgrid';
  public readonly name = 'SendGrid Email Provider';
  public readonly type = 'email' as const;
  public readonly channel: NotificationChannel = 'email';
  public readonly priority = 2;

  private readonly apiKey: string;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly replyTo?: string;

  constructor(config: EmailProviderConfig['fallback']) {
    this.apiKey = config.apiKey;
    this.fromAddress = config.fromAddress;
    this.fromName = config.fromName;
    this.replyTo = config.replyTo;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  async sendEmail(params: EmailParams): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate LGPD compliance
      await this.validateLGPDCompliance(params.metadata.lgpdConsent);

      const emailPayload = {
        personalizations: [
          {
            to: Array.isArray(params.to)
              ? params.to.map((email) => ({ email }))
              : [{ email: params.to }],
            cc: params.cc?.map((email) => ({ email })),
            bcc: params.bcc?.map((email) => ({ email })),
            subject: params.subject,
          },
        ],
        from: {
          email: this.fromAddress,
          name: this.fromName,
        },
        reply_to: this.replyTo ? { email: this.replyTo } : undefined,
        content: [
          {
            type: 'text/html',
            value: params.html,
          },
          {
            type: 'text/plain',
            value: params.text || this.stripHtml(params.html),
          },
        ],
        attachments: params.attachments?.map((att) => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64'),
          type: att.contentType,
          disposition: 'attachment',
        })),
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `SendGrid API error: ${errorData.errors?.[0]?.message || response.statusText}`
        );
      }

      // SendGrid returns empty response on success
      const messageId =
        response.headers.get('x-message-id') || `sendgrid-${Date.now()}`;

      return {
        success: true,
        messageId,
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
          error,
        },
      };
    }
  }

  async sendBulkEmail(params: BulkEmailParams): Promise<NotificationResult[]> {
    // SendGrid batch implementation
    const results: NotificationResult[] = [];

    // Process individually for fallback provider
    for (const recipient of params.recipients) {
      const result = await this.sendEmail({
        to: recipient.email,
        subject: params.subject,
        html: '', // Template processing needed
        templateId: params.templateId,
        templateData: recipient.templateData,
        metadata: recipient.metadata,
      });

      results.push(result);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
    }

    return results;
  }

  async validateTemplate(templateId: string): Promise<boolean> {
    try {
      // SendGrid template validation
      const response = await fetch(
        `https://api.sendgrid.com/v3/templates/${templateId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  private async validateLGPDCompliance(
    lgpdData: LGPDCompliantData
  ): Promise<void> {
    if (!lgpdData.consentGiven) {
      throw new Error('LGPD: Email consent not provided');
    }

    if (lgpdData.consentExpiry && new Date() > lgpdData.consentExpiry) {
      throw new Error('LGPD: Email consent expired');
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Email Provider Factory
 * Manages provider selection and fallback logic
 */
class EmailProviderFactory {
  private readonly primaryProvider: EmailProvider;
  private readonly fallbackProvider: EmailProvider;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    this.primaryProvider = new ResendEmailProvider(config.primary);
    this.fallbackProvider = new SendGridEmailProvider(config.fallback);
  }

  async getHealthyProvider(): Promise<EmailProvider> {
    // Check primary provider health
    if (await this.primaryProvider.isHealthy()) {
      return this.primaryProvider;
    }

    // Fallback to secondary provider
    if (await this.fallbackProvider.isHealthy()) {
      return this.fallbackProvider;
    }

    throw new Error('All email providers are unhealthy');
  }

  async sendWithFallback(params: EmailParams): Promise<NotificationResult> {
    try {
      const provider = await this.getHealthyProvider();
      return await provider.sendEmail(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'All providers failed',
        providerId: 'email-factory',
        channel: 'email',
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  async sendBulkWithFallback(
    params: BulkEmailParams
  ): Promise<NotificationResult[]> {
    try {
      const provider = await this.getHealthyProvider();
      return await provider.sendBulkEmail(params);
    } catch (error) {
      // Return failed results for all recipients
      return params.recipients.map((recipient) => ({
        success: false,
        error: error instanceof Error ? error.message : 'All providers failed',
        providerId: 'email-factory',
        channel: 'email',
        timestamp: new Date(),
        metadata: recipient.metadata,
      }));
    }
  }
}

// Export types and implementations
export type {
  EmailProvider,
  EmailParams,
  BulkEmailParams,
  EmailAttachment,
  EmailProviderConfig,
};
export { ResendEmailProvider, SendGridEmailProvider, EmailProviderFactory };

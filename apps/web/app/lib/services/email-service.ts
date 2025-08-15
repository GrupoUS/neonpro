import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import type {
  BulkEmailResponse,
  EmailAnalytics,
  EmailDeliveryReport,
  EmailEvent,
  EmailMessage,
  EmailPreview,
  EmailProvider,
  EmailProviderConfig,
  EmailServiceInterface,
  EmailServiceResponse,
  EmailSettings,
  EmailStatus,
  EmailTemplate,
  EmailValidationResult,
  MailgunConfig,
  PostmarkConfig,
  ResendConfig,
  SESConfig,
  SendGridConfig,
  SMTPConfig,
} from '@/app/types/email';

// =======================================
// EMAIL SERVICE CLASS
// =======================================

export class EmailService {
  private readonly providers: Map<EmailProvider, EmailServiceInterface> =
    new Map();
  private settings: EmailSettings | null = null;

  constructor(
    private readonly supabase: any,
    private readonly clinicId: string
  ) {}

  // =======================================
  // PROVIDER MANAGEMENT
  // =======================================

  async initializeProviders(configs: EmailProviderConfig[]): Promise<void> {
    for (const config of configs) {
      if (!config.isActive) {
        continue;
      }

      try {
        const provider = await this.createProvider(config);
        if (provider) {
          this.providers.set(config.provider, provider);
        }
      } catch (error) {
        console.error(
          `Failed to initialize email provider ${config.provider}:`,
          error
        );
      }
    }
  }

  private async createProvider(
    config: EmailProviderConfig
  ): Promise<EmailServiceInterface | null> {
    switch (config.provider) {
      case 'smtp':
        return new SMTPEmailProvider(config.settings as SMTPConfig);
      case 'ses':
        return new SESEmailProvider(config.settings as SESConfig);
      case 'sendgrid':
        return new SendGridEmailProvider(config.settings as SendGridConfig);
      case 'mailgun':
        return new MailgunEmailProvider(config.settings as MailgunConfig);
      case 'resend':
        return new ResendEmailProvider(config.settings as ResendConfig);
      case 'postmark':
        return new PostmarkEmailProvider(config.settings as PostmarkConfig);
      default:
        console.warn(`Unknown email provider: ${config.provider}`);
        return null;
    }
  }

  // =======================================
  // EMAIL SENDING
  // =======================================

  async sendEmail(
    message: EmailMessage,
    providerPreference?: EmailProvider
  ): Promise<EmailServiceResponse> {
    try {
      // Select best provider
      const provider = this.selectProvider(providerPreference);
      if (!provider) {
        throw new Error('No email provider available');
      }

      // Validate message
      const validationResult = await this.validateMessage(message);
      if (!validationResult.isValid) {
        throw new Error(
          `Message validation failed: ${validationResult.reason}`
        );
      }

      // Apply settings
      const processedMessage = await this.applySettings(message);

      // Send email
      const result = await provider.sendEmail(processedMessage);

      // Log the send attempt
      await this.logEmailEvent({
        id: crypto.randomUUID(),
        emailId: message.id || crypto.randomUUID(),
        messageId: result.messageId || crypto.randomUUID(),
        event: result.success ? 'sent' : 'failed',
        timestamp: new Date(),
        metadata: {
          provider: this.getProviderName(provider),
          recipient: message.to[0]?.email,
          subject: message.subject,
          error: result.error,
        },
      });

      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sendBulkEmail(
    messages: EmailMessage[],
    providerPreference?: EmailProvider,
    batchSize = 10
  ): Promise<BulkEmailResponse> {
    try {
      const provider = this.selectProvider(providerPreference);
      if (!provider) {
        throw new Error('No email provider available');
      }

      const results: BulkEmailResponse['results'] = [];
      let totalSent = 0;
      let totalFailed = 0;

      // Process in batches
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);

        try {
          const batchResult = await provider.sendBulkEmail(batch);
          results.push(...batchResult.results);
          totalSent += batchResult.totalSent;
          totalFailed += batchResult.totalFailed;

          // Add delay between batches to respect rate limits
          if (i + batchSize < messages.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Log batch events
          for (const result of batchResult.results) {
            await this.logEmailEvent({
              id: crypto.randomUUID(),
              emailId: crypto.randomUUID(),
              messageId: result.messageId || crypto.randomUUID(),
              event: result.success ? 'sent' : 'failed',
              timestamp: new Date(),
              metadata: {
                provider: this.getProviderName(provider),
                recipient: result.email,
                error: result.error,
                batch: Math.floor(i / batchSize) + 1,
              },
            });
          }
        } catch (batchError) {
          console.error(
            `Batch ${Math.floor(i / batchSize) + 1} failed:`,
            batchError
          );

          // Mark all emails in batch as failed
          for (const message of batch) {
            results.push({
              email: message.to[0]?.email || 'unknown',
              success: false,
              error:
                batchError instanceof Error
                  ? batchError.message
                  : 'Batch failed',
            });
            totalFailed++;
          }
        }
      }

      return {
        success: totalSent > 0,
        results,
        totalSent,
        totalFailed,
      };
    } catch (error) {
      console.error('Bulk email sending failed:', error);
      return {
        success: false,
        results: messages.map((msg) => ({
          email: msg.to[0]?.email || 'unknown',
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })),
        totalSent: 0,
        totalFailed: messages.length,
      };
    }
  }

  // =======================================
  // TEMPLATE MANAGEMENT
  // =======================================

  async createTemplate(
    template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailTemplate> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .insert([
        {
          ...template,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create email template: ${error.message}`);
    }

    return this.mapDatabaseTemplate(data);
  }

  async updateTemplate(
    id: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', this.clinicId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update email template: ${error.message}`);
    }

    return this.mapDatabaseTemplate(data);
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
      .eq('clinic_id', this.clinicId);

    if (error) {
      throw new Error(`Failed to delete email template: ${error.message}`);
    }
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', this.clinicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get email template: ${error.message}`);
    }

    return this.mapDatabaseTemplate(data);
  }

  async getTemplates(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<EmailTemplate[]> {
    let query = this.supabase
      .from('email_templates')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get email templates: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseTemplate);
  }

  // =======================================
  // PREVIEW & VALIDATION
  // =======================================

  async previewTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<EmailPreview> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return {
      subject: this.interpolateTemplate(template.subject, variables),
      htmlContent: this.interpolateTemplate(template.htmlContent, variables),
      textContent: template.textContent
        ? this.interpolateTemplate(template.textContent, variables)
        : undefined,
      variables,
    };
  }

  async validateEmail(email: string): Promise<EmailValidationResult> {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        email,
        reason: 'Invalid email format',
      };
    }

    // Check suppression list
    const { data: suppressedEmail } = await this.supabase
      .from('email_suppressions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('clinic_id', this.clinicId)
      .single();

    if (suppressedEmail) {
      return {
        isValid: false,
        email,
        reason: `Email is suppressed: ${suppressedEmail.reason}`,
      };
    }

    return {
      isValid: true,
      email,
    };
  }

  // =======================================
  // ANALYTICS & REPORTING
  // =======================================

  async getEmailAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    templateId?: string;
    campaignId?: string;
  }): Promise<EmailAnalytics> {
    let query = this.supabase
      .from('email_events')
      .select('*')
      .eq('clinic_id', this.clinicId);

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }

    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    const { data: events = [], error } = await query;

    if (error) {
      throw new Error(`Failed to get email analytics: ${error.message}`);
    }

    return this.calculateAnalytics(events);
  }

  async getDeliveryReport(
    messageId: string
  ): Promise<EmailDeliveryReport | null> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('*')
      .eq('message_id', messageId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to get delivery report: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const events = data.map(this.mapDatabaseEvent);
    const sentEvent = events.find((e) => e.event === 'sent');
    const deliveredEvent = events.find((e) => e.event === 'delivered');
    const openedEvent = events.find((e) => e.event === 'opened');
    const clickedEvent = events.find((e) => e.event === 'clicked');
    const bouncedEvent = events.find((e) => e.event === 'bounced');

    return {
      messageId,
      recipient: events[0]?.metadata?.recipient || 'unknown',
      status: events.at(-1)?.event || 'unknown',
      sentAt: sentEvent?.timestamp || new Date(),
      deliveredAt: deliveredEvent?.timestamp,
      openedAt: openedEvent?.timestamp,
      clickedAt: clickedEvent?.timestamp,
      bounceReason: bouncedEvent?.reason,
      provider: events[0]?.metadata?.provider || 'unknown',
      cost: events[0]?.metadata?.cost,
    } as EmailDeliveryReport;
  }

  // =======================================
  // PRIVATE HELPER METHODS
  // =======================================

  private selectProvider(
    preference?: EmailProvider
  ): EmailServiceInterface | null {
    if (preference && this.providers.has(preference)) {
      return this.providers.get(preference)!;
    }

    // Return first available provider
    const providers = Array.from(this.providers.values());
    return providers.length > 0 ? providers[0] : null;
  }

  private getProviderName(provider: EmailServiceInterface): string {
    for (const [name, p] of this.providers.entries()) {
      if (p === provider) {
        return name;
      }
    }
    return 'unknown';
  }

  private async validateMessage(
    message: EmailMessage
  ): Promise<{ isValid: boolean; reason?: string }> {
    if (!message.to || message.to.length === 0) {
      return { isValid: false, reason: 'No recipients specified' };
    }

    if (!message.subject || message.subject.trim() === '') {
      return { isValid: false, reason: 'Subject is required' };
    }

    if (!message.htmlContent || message.htmlContent.trim() === '') {
      return { isValid: false, reason: 'Content is required' };
    }

    for (const recipient of message.to) {
      const validation = await this.validateEmail(recipient.email);
      if (!validation.isValid) {
        return {
          isValid: false,
          reason: `Invalid recipient ${recipient.email}: ${validation.reason}`,
        };
      }
    }

    return { isValid: true };
  }

  private async applySettings(message: EmailMessage): Promise<EmailMessage> {
    if (!this.settings) {
      this.settings = await this.getEmailSettings();
    }

    // Apply default from if not specified
    if (!message.from.email && this.settings?.defaultFrom) {
      message.from = this.settings.defaultFrom;
    }

    // Apply default reply-to if not specified
    if (!message.replyTo && this.settings?.defaultReplyTo) {
      message.replyTo = this.settings.defaultReplyTo;
    }

    return message;
  }

  private async getEmailSettings(): Promise<EmailSettings | null> {
    const { data, error } = await this.supabase
      .from('email_settings')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get email settings: ${error.message}`);
    }

    return data;
  }

  private interpolateTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private mapDatabaseTemplate(data: any): EmailTemplate {
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      htmlContent: data.html_content,
      textContent: data.text_content,
      variables: data.variables || [],
      category: data.category,
      isActive: data.is_active,
      clinicId: data.clinic_id,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDatabaseEvent(data: any): EmailEvent {
    return {
      id: data.id,
      emailId: data.email_id,
      messageId: data.message_id,
      event: data.event,
      timestamp: new Date(data.timestamp),
      metadata: data.metadata || {},
      providerEventId: data.provider_event_id,
      reason: data.reason,
      userAgent: data.user_agent,
      ipAddress: data.ip_address,
      linkUrl: data.link_url,
    };
  }

  private calculateAnalytics(events: any[]): EmailAnalytics {
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalSent = eventCounts.sent || 0;
    const delivered = eventCounts.delivered || 0;
    const bounced = eventCounts.bounced || 0;
    const opened = eventCounts.opened || 0;
    const clicked = eventCounts.clicked || 0;
    const unsubscribed = eventCounts.unsubscribed || 0;
    const complained = eventCounts.complained || 0;
    const failed = eventCounts.failed || 0;

    return {
      totalSent,
      delivered,
      bounced,
      opened,
      clicked,
      unsubscribed,
      complained,
      failed,
      deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
      complaintRate: delivered > 0 ? (complained / delivered) * 100 : 0,
    };
  }

  private async logEmailEvent(event: EmailEvent): Promise<void> {
    try {
      await this.supabase.from('email_events').insert([
        {
          ...event,
          clinic_id: this.clinicId,
          timestamp: event.timestamp.toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to log email event:', error);
    }
  }
}

// =======================================
// EMAIL PROVIDER IMPLEMENTATIONS
// =======================================

class SMTPEmailProvider implements EmailServiceInterface {
  private readonly transporter: nodemailer.Transporter;

  constructor(config: SMTPConfig) {
    this.transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      pool: config.pool,
      maxConnections: config.maxConnections,
      maxMessages: config.maxMessages,
    });
  }

  async sendEmail(message: EmailMessage): Promise<EmailServiceResponse> {
    try {
      const result = await this.transporter.sendMail({
        from: `${message.from.name || ''} <${message.from.email}>`,
        to: message.to.map((r) => `${r.name || ''} <${r.email}>`).join(', '),
        cc: message.cc?.map((r) => `${r.name || ''} <${r.email}>`).join(', '),
        bcc: message.bcc?.map((r) => `${r.name || ''} <${r.email}>`).join(', '),
        replyTo: message.replyTo
          ? `${message.replyTo.name || ''} <${message.replyTo.email}>`
          : undefined,
        subject: message.subject,
        html: message.htmlContent,
        text: message.textContent,
        attachments: message.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          cid: att.cid,
        })),
      });

      return {
        success: true,
        messageId: result.messageId,
        providerMessageId: result.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMTP send failed',
      };
    }
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    const results: BulkEmailResponse['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const message of messages) {
      const result = await this.sendEmail(message);
      results.push({
        email: message.to[0]?.email || 'unknown',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        totalSent++;
      } else {
        totalFailed++;
      }
    }

    return {
      success: totalSent > 0,
      results,
      totalSent,
      totalFailed,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    // SMTP doesn't provide delivery status by default
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    // SMTP doesn't have quota limits by default
    return { used: 0, limit: Number.MAX_SAFE_INTEGER };
  }
}

class SESEmailProvider implements EmailServiceInterface {
  private readonly client: SESClient;

  constructor(private readonly config: SESConfig) {
    this.client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async sendEmail(message: EmailMessage): Promise<EmailServiceResponse> {
    try {
      const command = new SendEmailCommand({
        Source: `${message.from.name || ''} <${message.from.email}>`,
        Destination: {
          ToAddresses: message.to.map((r) => `${r.name || ''} <${r.email}>`),
          CcAddresses: message.cc?.map((r) => `${r.name || ''} <${r.email}>`),
          BccAddresses: message.bcc?.map((r) => `${r.name || ''} <${r.email}>`),
        },
        Message: {
          Subject: { Data: message.subject },
          Body: {
            Html: { Data: message.htmlContent },
            Text: message.textContent
              ? { Data: message.textContent }
              : undefined,
          },
        },
        ReplyToAddresses: message.replyTo
          ? [`${message.replyTo.name || ''} <${message.replyTo.email}>`]
          : undefined,
        ConfigurationSetName: this.config.configurationSet,
      });

      const result = await this.client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        providerMessageId: result.MessageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SES send failed',
      };
    }
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    // Implementation for SES bulk sending would go here
    // For now, fall back to individual sends
    const results: BulkEmailResponse['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const message of messages) {
      const result = await this.sendEmail(message);
      results.push({
        email: message.to[0]?.email || 'unknown',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        totalSent++;
      } else {
        totalFailed++;
      }
    }

    return {
      success: totalSent > 0,
      results,
      totalSent,
      totalFailed,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    // Would need to implement SES event tracking
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      // Try to get sending quota to validate credentials
      const { SendingEnabled } = await this.client.send({ input: {} } as any);
      return SendingEnabled !== false;
    } catch {
      return false;
    }
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    // Would need to implement SES quota checking
    return { used: 0, limit: 200 }; // SES default for new accounts
  }
}

// Placeholder implementations for other providers
class SendGridEmailProvider implements EmailServiceInterface {
  async sendEmail(_message: EmailMessage): Promise<EmailServiceResponse> {
    // SendGrid implementation would go here
    return { success: false, error: 'SendGrid not implemented yet' };
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    return {
      success: false,
      results: [],
      totalSent: 0,
      totalFailed: messages.length,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    return false;
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    return { used: 0, limit: 100 };
  }
}

class MailgunEmailProvider implements EmailServiceInterface {
  async sendEmail(_message: EmailMessage): Promise<EmailServiceResponse> {
    return { success: false, error: 'Mailgun not implemented yet' };
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    return {
      success: false,
      results: [],
      totalSent: 0,
      totalFailed: messages.length,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    return false;
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    return { used: 0, limit: 100 };
  }
}

class ResendEmailProvider implements EmailServiceInterface {
  async sendEmail(_message: EmailMessage): Promise<EmailServiceResponse> {
    return { success: false, error: 'Resend not implemented yet' };
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    return {
      success: false,
      results: [],
      totalSent: 0,
      totalFailed: messages.length,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    return false;
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    return { used: 0, limit: 100 };
  }
}

class PostmarkEmailProvider implements EmailServiceInterface {
  async sendEmail(_message: EmailMessage): Promise<EmailServiceResponse> {
    return { success: false, error: 'Postmark not implemented yet' };
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    return {
      success: false,
      results: [],
      totalSent: 0,
      totalFailed: messages.length,
    };
  }

  async getDeliveryStatus(_messageId: string): Promise<EmailStatus> {
    return 'sent';
  }

  async validateConfiguration(): Promise<boolean> {
    return false;
  }

  async getQuotaUsage(): Promise<{
    used: number;
    limit: number;
    resetDate?: Date;
  }> {
    return { used: 0, limit: 100 };
  }
}

// =======================================
// EXPORT
// =======================================

export default EmailService;

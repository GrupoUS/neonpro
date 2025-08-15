/**
 * WhatsApp Notification Provider - NeonPro System
 * Implementa provedores de WhatsApp Business API com Twilio
 * Compliance: LGPD + ANVISA + CFM + WhatsApp Business Policies
 */

import type {
  HealthcareNotificationContext,
  LGPDCompliantData,
  NotificationChannel,
  NotificationMetadata,
  NotificationProvider,
  NotificationResult,
} from '../types/notifications';

// WhatsApp-specific types
export interface WhatsAppProvider extends NotificationProvider {
  type: 'whatsapp';
  sendWhatsApp(params: WhatsAppParams): Promise<NotificationResult>;
  sendBulkWhatsApp(params: BulkWhatsAppParams): Promise<NotificationResult[]>;
  sendTemplate(params: WhatsAppTemplateParams): Promise<NotificationResult>;
  validatePhoneNumber(phoneNumber: string): Promise<boolean>;
  getMessageStatus(messageId: string): Promise<WhatsAppMessageStatus>;
}

export interface WhatsAppParams {
  to: string | string[]; // E.164 format (+5511999999999)
  message?: string; // For session messages only
  templateName?: string;
  templateLanguage?: string;
  templateParams?: WhatsAppTemplateParameter[];
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio';
  mediaCaption?: string;
  metadata: NotificationMetadata & {
    patientId?: string;
    clinicId: string;
    medicalContext?: HealthcareNotificationContext;
    lgpdConsent: LGPDCompliantData;
    whatsappContext?: WhatsAppBusinessContext;
  };
}

export interface BulkWhatsAppParams {
  messages: Array<{
    to: string;
    templateName: string;
    templateLanguage?: string;
    templateParams?: WhatsAppTemplateParameter[];
    metadata: WhatsAppParams['metadata'];
  }>;
  batchSize?: number;
}

export interface WhatsAppTemplateParams {
  to: string | string[];
  templateName: string;
  templateLanguage: string;
  templateParams?: WhatsAppTemplateParameter[];
  metadata: WhatsAppParams['metadata'];
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
    calendar?: string;
    day_of_week?: number;
    hour?: number;
    minute?: number;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
  video?: {
    link: string;
    caption?: string;
  };
}

export interface WhatsAppBusinessContext {
  businessPhone: string;
  businessName: string;
  isSession: boolean; // 24h session window
  sessionExpiresAt?: Date;
  messageType: 'template' | 'session' | 'hsm';
  category?: 'authentication' | 'marketing' | 'utility';
}

export interface WhatsAppMessageStatus {
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
  errorCode?: string;
  errorMessage?: string;
  pricing?: {
    category: string;
    price: string;
    currency: string;
  };
}

export interface WhatsAppProviderConfig {
  twilio: {
    accountSid: string;
    authToken: string;
    fromNumber: string; // WhatsApp Business number
  };
  templates: {
    [key: string]: {
      name: string;
      language: string;
      category: 'authentication' | 'marketing' | 'utility';
      parameters?: Array<{
        name: string;
        type: WhatsAppTemplateParameter['type'];
        required: boolean;
      }>;
    };
  };
  business: {
    displayName: string;
    profileUrl?: string;
    description?: string;
    email?: string;
    website?: string;
  };
  compliance: {
    lgpdRequired: boolean;
    sessionWindowHours: number; // Default 24h
    requireOptIn: boolean;
    marketingRestrictions: {
      maxPerDay: number;
      cooldownHours: number;
    };
  };
}

/**
 * Twilio WhatsApp Business API Provider
 * Primary WhatsApp provider for NeonPro
 */
class TwilioWhatsAppProvider implements WhatsAppProvider {
  public readonly id = 'twilio-whatsapp';
  public readonly name = 'Twilio WhatsApp Business API';
  public readonly type = 'whatsapp' as const;
  public readonly channel: NotificationChannel = 'whatsapp';
  public readonly priority = 1;

  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private config: WhatsAppProviderConfig;

  constructor(config: WhatsAppProviderConfig) {
    this.accountSid = config.twilio.accountSid;
    this.authToken = config.twilio.authToken;
    this.fromNumber = config.twilio.fromNumber;
    this.config = config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`[${this.id}] Health check failed:`, error);
      return false;
    }
  }

  async sendWhatsApp(params: WhatsAppParams): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate LGPD compliance
      await this.validateLGPDCompliance(params.metadata.lgpdConsent);

      // Validate WhatsApp Business compliance
      if (params.metadata.whatsappContext) {
        await this.validateWhatsAppCompliance(params);
      }

      const phoneNumbers = Array.isArray(params.to) ? params.to : [params.to];
      const results: NotificationResult[] = [];

      for (const phoneNumber of phoneNumbers) {
        if (!(await this.validatePhoneNumber(phoneNumber))) {
          throw new Error(`Invalid WhatsApp number: ${phoneNumber}`);
        }

        let messageResult: NotificationResult;

        if (params.templateName) {
          // Send template message
          messageResult = await this.sendTemplateMessage({
            to: phoneNumber,
            templateName: params.templateName,
            templateLanguage: params.templateLanguage || 'pt_BR',
            templateParams: params.templateParams,
            metadata: params.metadata,
          });
        } else if (params.message) {
          // Send session message (requires active 24h session)
          messageResult = await this.sendSessionMessage(phoneNumber, params);
        } else {
          throw new Error('Either templateName or message must be provided');
        }

        results.push(messageResult);

        // Rate limiting between messages
        if (phoneNumbers.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Return single result for single number, combined for multiple
      if (results.length === 1) {
        return results[0];
      }

      return {
        success: results.every((r) => r.success),
        messageId: results.map((r) => r.messageId).join(','),
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration: Date.now() - startTime,
          bulkResults: results,
          totalSent: results.filter((r) => r.success).length,
          totalFailed: results.filter((r) => !r.success).length,
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

  async sendBulkWhatsApp(
    params: BulkWhatsAppParams
  ): Promise<NotificationResult[]> {
    const batchSize = params.batchSize || 5; // Conservative for WhatsApp limits
    const results: NotificationResult[] = [];

    for (let i = 0; i < params.messages.length; i += batchSize) {
      const batch = params.messages.slice(i, i + batchSize);

      const batchPromises = batch.map((message) =>
        this.sendTemplate({
          to: message.to,
          templateName: message.templateName,
          templateLanguage: message.templateLanguage || 'pt_BR',
          templateParams: message.templateParams,
          metadata: message.metadata,
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

      // Rate limiting between batches (WhatsApp is strict)
      if (i + batchSize < params.messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
      }
    }

    return results;
  }

  async sendTemplate(
    params: WhatsAppTemplateParams
  ): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      const phoneNumbers = Array.isArray(params.to) ? params.to : [params.to];

      // Prepare template content
      const templateContent = this.buildTemplateContent(
        params.templateName,
        params.templateLanguage,
        params.templateParams
      );

      const results: NotificationResult[] = [];

      for (const phoneNumber of phoneNumbers) {
        const payload = new URLSearchParams({
          To: `whatsapp:${phoneNumber}`,
          From: `whatsapp:${this.fromNumber}`,
          Body: templateContent,
          ContentSid: params.templateName, // Template SID if using Twilio templates
        });

        // Add template parameters if any
        if (params.templateParams) {
          params.templateParams.forEach((param, index) => {
            if (param.type === 'text' && param.text) {
              payload.append(
                'ContentVariables',
                JSON.stringify({
                  [`${index + 1}`]: param.text,
                })
              );
            }
          });
        }

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            `Twilio WhatsApp API error: ${responseData.message || response.statusText}`
          );
        }

        results.push({
          success: true,
          messageId: responseData.sid,
          providerId: this.id,
          channel: this.channel,
          timestamp: new Date(),
          metadata: {
            ...params.metadata,
            duration: Date.now() - startTime,
            response: responseData,
            phoneNumber,
            templateName: params.templateName,
            templateLanguage: params.templateLanguage,
          },
        });
      }

      return results.length === 1
        ? results[0]
        : {
            success: results.every((r) => r.success),
            messageId: results.map((r) => r.messageId).join(','),
            providerId: this.id,
            channel: this.channel,
            timestamp: new Date(),
            metadata: {
              ...params.metadata,
              duration: Date.now() - startTime,
              bulkResults: results,
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

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      // WhatsApp number validation (E.164 format)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return false;
      }

      // Brazil specific validation
      if (phoneNumber.startsWith('+55')) {
        const brazilRegex = /^\+55[1-9]{2}9?[6-9]\d{7}$/;
        return brazilRegex.test(phoneNumber);
      }

      return true;
    } catch (error) {
      console.error(`[${this.id}] Phone validation failed:`, error);
      return false;
    }
  }

  async getMessageStatus(messageId: string): Promise<WhatsAppMessageStatus> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageId}.json`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Twilio API error: ${data.message}`);
      }

      return {
        status: this.mapTwilioStatus(data.status),
        timestamp: data.date_updated ? new Date(data.date_updated) : undefined,
        errorCode: data.error_code,
        errorMessage: data.error_message,
        pricing: data.price
          ? {
              category: data.subresource_uris?.media ? 'media' : 'text',
              price: data.price,
              currency: data.price_unit,
            }
          : undefined,
      };
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendSessionMessage(
    phoneNumber: string,
    params: WhatsAppParams
  ): Promise<NotificationResult> {
    // Session messages can only be sent within 24h window after user interaction
    const auth = btoa(`${this.accountSid}:${this.authToken}`);

    const payload = new URLSearchParams({
      To: `whatsapp:${phoneNumber}`,
      From: `whatsapp:${this.fromNumber}`,
      Body: params.message!,
    });

    // Add media if present
    if (params.mediaUrl) {
      payload.append('MediaUrl', params.mediaUrl);
      if (params.mediaCaption) {
        payload.append('Body', params.mediaCaption);
      }
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Twilio WhatsApp API error: ${responseData.message || response.statusText}`
      );
    }

    return {
      success: true,
      messageId: responseData.sid,
      providerId: this.id,
      channel: this.channel,
      timestamp: new Date(),
      metadata: {
        ...params.metadata,
        response: responseData,
        phoneNumber,
        messageType: 'session',
      },
    };
  }

  private buildTemplateContent(
    templateName: string,
    _language: string,
    parameters?: WhatsAppTemplateParameter[]
  ): string {
    // This would typically fetch template from Twilio or your template store
    // For now, return template name as placeholder
    let content = `{{${templateName}}}`;

    if (parameters) {
      parameters.forEach((param, index) => {
        if (param.type === 'text' && param.text) {
          content = content.replace(`{{${index + 1}}}`, param.text);
        }
      });
    }

    return content;
  }

  private mapTwilioStatus(
    twilioStatus: string
  ): WhatsAppMessageStatus['status'] {
    const statusMap: Record<string, WhatsAppMessageStatus['status']> = {
      queued: 'queued',
      sending: 'sent',
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
      undelivered: 'failed',
    };

    return statusMap[twilioStatus] || 'failed';
  }

  private async validateLGPDCompliance(
    lgpdData: LGPDCompliantData
  ): Promise<void> {
    if (!lgpdData.consentGiven) {
      throw new Error('LGPD: WhatsApp consent not provided');
    }

    if (lgpdData.consentExpiry && new Date() > lgpdData.consentExpiry) {
      throw new Error('LGPD: WhatsApp consent expired');
    }

    if (
      !(
        lgpdData.purposes.includes('notifications') ||
        lgpdData.purposes.includes('marketing')
      )
    ) {
      throw new Error('LGPD: WhatsApp purpose not authorized');
    }
  }

  private async validateWhatsAppCompliance(
    params: WhatsAppParams
  ): Promise<void> {
    const context = params.metadata.whatsappContext!;

    // Check 24-hour session window for session messages
    if (
      context.messageType === 'session' &&
      context.sessionExpiresAt &&
      new Date() > context.sessionExpiresAt
    ) {
      throw new Error(
        'WhatsApp: 24-hour session window expired, must use template message'
      );
    }

    // Marketing message restrictions
    if (context.category === 'marketing') {
      const now = new Date();
      const hour = now.getHours();

      // No marketing messages outside business hours (8 AM - 8 PM)
      if (hour < 8 || hour >= 20) {
        throw new Error(
          'WhatsApp: Marketing messages restricted outside business hours'
        );
      }
    }

    // Require opt-in for marketing
    if (
      this.config.compliance.requireOptIn &&
      context.category === 'marketing' &&
      !params.metadata.lgpdConsent.purposes.includes('marketing')
    ) {
      throw new Error('WhatsApp: Marketing opt-in required');
    }
  }
}

/**
 * WhatsApp Provider Factory
 * Manages WhatsApp providers and compliance
 */
class WhatsAppProviderFactory {
  private provider: WhatsAppProvider;

  constructor(config: WhatsAppProviderConfig) {
    this.config = config;
    this.provider = new TwilioWhatsAppProvider(config);
  }

  async getProvider(): Promise<WhatsAppProvider> {
    if (await this.provider.isHealthy()) {
      return this.provider;
    }

    throw new Error('WhatsApp provider is unhealthy');
  }

  async sendWhatsApp(params: WhatsAppParams): Promise<NotificationResult> {
    try {
      const provider = await this.getProvider();
      return await provider.sendWhatsApp(params);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'WhatsApp provider failed',
        providerId: 'whatsapp-factory',
        channel: 'whatsapp',
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  async sendTemplate(
    params: WhatsAppTemplateParams
  ): Promise<NotificationResult> {
    try {
      const provider = await this.getProvider();
      return await provider.sendTemplate(params);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'WhatsApp template failed',
        providerId: 'whatsapp-factory',
        channel: 'whatsapp',
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  async sendBulkWhatsApp(
    params: BulkWhatsAppParams
  ): Promise<NotificationResult[]> {
    try {
      const provider = await this.getProvider();
      return await provider.sendBulkWhatsApp(params);
    } catch (error) {
      return params.messages.map((message) => ({
        success: false,
        error:
          error instanceof Error ? error.message : 'WhatsApp provider failed',
        providerId: 'whatsapp-factory',
        channel: 'whatsapp',
        timestamp: new Date(),
        metadata: message.metadata,
      }));
    }
  }
}

// Export types and implementations
export type {
  WhatsAppProvider,
  WhatsAppParams,
  BulkWhatsAppParams,
  WhatsAppTemplateParams,
  WhatsAppTemplateParameter,
  WhatsAppBusinessContext,
  WhatsAppMessageStatus,
  WhatsAppProviderConfig,
};
export { TwilioWhatsAppProvider, WhatsAppProviderFactory };

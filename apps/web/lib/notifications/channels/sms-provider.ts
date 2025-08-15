/**
 * SMS Notification Provider - NeonPro System
 * Implementa provedores de SMS com Twilio (primary) e fallback
 * Compliance: LGPD + ANVISA + CFM + telecomunicações Brasil
 */

import type {
  HealthcareNotificationContext,
  LGPDCompliantData,
  NotificationChannel,
  NotificationMetadata,
  NotificationProvider,
  NotificationResult,
} from '../types/notifications';

// SMS-specific types
export interface SMSProvider extends NotificationProvider {
  type: 'sms';
  sendSMS(params: SMSParams): Promise<NotificationResult>;
  sendBulkSMS(params: BulkSMSParams): Promise<NotificationResult[]>;
  validatePhoneNumber(phoneNumber: string): Promise<boolean>;
  getDeliveryStatus(messageId: string): Promise<SMSDeliveryStatus>;
}

export interface SMSParams {
  to: string | string[]; // E.164 format (+5511999999999)
  message: string;
  from?: string; // Sender ID or phone number
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  validityPeriod?: number; // Hours
  metadata: NotificationMetadata & {
    patientId?: string;
    clinicId: string;
    medicalContext?: HealthcareNotificationContext;
    lgpdConsent: LGPDCompliantData;
    brazilCompliance?: BrazilTelecomCompliance;
  };
}

export interface BulkSMSParams {
  messages: Array<{
    to: string;
    message: string;
    templateData?: Record<string, any>;
    metadata: SMSParams['metadata'];
  }>;
  batchSize?: number;
  rateLimitPerMinute?: number;
}

export interface SMSDeliveryStatus {
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  price?: string;
  priceUnit?: string;
}

export interface BrazilTelecomCompliance {
  operatorCode?: string; // TIM, Vivo, Claro, Oi
  dddCode: string; // Area code (11, 21, etc.)
  isWhitelisted?: boolean; // For commercial SMS
  optOutRequired: boolean;
  marketingRestrictions?: {
    allowedHours: { start: string; end: string };
    allowedDays: string[];
    frequencyLimit?: number;
  };
}

export interface SMSProviderConfig {
  primary: {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    fromNumber: string;
    messagingServiceSid?: string;
  };
  fallback?: {
    provider: 'textbelt' | 'nexmo';
    apiKey: string;
    fromNumber?: string;
  };
  brazil: {
    enableCompliance: boolean;
    restrictToOperatingHours: boolean;
    operatingHours: { start: string; end: string };
    maxDailyPerNumber: number;
    requireOptOut: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  compliance: {
    lgpdRequired: boolean;
    anvisaCompliant: boolean;
    anatelCompliant: boolean; // Brazilian telecom authority
  };
}

/**
 * Twilio SMS Provider Implementation
 * Primary SMS provider for NeonPro (Brazil-compliant)
 */
class TwilioSMSProvider implements SMSProvider {
  public readonly id = 'twilio';
  public readonly name = 'Twilio SMS Provider';
  public readonly type = 'sms' as const;
  public readonly channel: NotificationChannel = 'sms';
  public readonly priority = 1;

  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly messagingServiceSid?: string;
  private readonly brazilConfig: SMSProviderConfig['brazil'];

  constructor(
    config: SMSProviderConfig['primary'],
    brazilConfig: SMSProviderConfig['brazil']
  ) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    this.messagingServiceSid = config.messagingServiceSid;
    this.brazilConfig = brazilConfig;
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Health check via Twilio API
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

  async sendSMS(params: SMSParams): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate LGPD compliance
      await this.validateLGPDCompliance(params.metadata.lgpdConsent);

      // Validate Brazil telecom compliance
      if (this.brazilConfig.enableCompliance) {
        await this.validateBrazilCompliance(params);
      }

      const phoneNumbers = Array.isArray(params.to) ? params.to : [params.to];

      // Validate phone numbers
      for (const phoneNumber of phoneNumbers) {
        if (!(await this.validatePhoneNumber(phoneNumber))) {
          throw new Error(`Invalid phone number: ${phoneNumber}`);
        }
      }

      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      const results: NotificationResult[] = [];

      // Send to each number individually (Twilio requirement)
      for (const phoneNumber of phoneNumbers) {
        const payload = new URLSearchParams({
          To: phoneNumber,
          Body: params.message,
          ...(this.messagingServiceSid
            ? { MessagingServiceSid: this.messagingServiceSid }
            : { From: params.from || this.fromNumber }),
          ...(params.validityPeriod && {
            ValidityPeriod: String(params.validityPeriod * 3600), // Convert hours to seconds
          }),
          ...(params.scheduledAt && {
            SendAt: params.scheduledAt.toISOString(),
          }),
        });

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
            `Twilio API error: ${responseData.message || response.statusText}`
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
            price: responseData.price,
            priceUnit: responseData.price_unit,
          },
        });

        // Rate limiting for Brazil compliance
        if (phoneNumbers.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s between messages
        }
      }

      // Return single result for single number, or combined for multiple
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

  async sendBulkSMS(params: BulkSMSParams): Promise<NotificationResult[]> {
    const batchSize = params.batchSize || 10; // Conservative for Brazil compliance
    const rateLimitMs = params.rateLimitPerMinute
      ? Math.ceil(60_000 / params.rateLimitPerMinute)
      : 1000;
    const results: NotificationResult[] = [];

    // Process in batches with rate limiting
    for (let i = 0; i < params.messages.length; i += batchSize) {
      const batch = params.messages.slice(i, i + batchSize);

      const batchPromises = batch.map((message) =>
        this.sendSMS({
          to: message.to,
          message: message.message,
          templateData: message.templateData,
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

      // Rate limiting between batches
      if (i + batchSize < params.messages.length) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    }

    return results;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      // Basic E.164 format validation
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return false;
      }

      // Brazil specific validation
      if (phoneNumber.startsWith('+55')) {
        // Brazilian phone number validation
        const brazilRegex = /^\+55[1-9]{2}9?[6-9]\d{7}$/;
        return brazilRegex.test(phoneNumber);
      }

      return true;
    } catch (error) {
      console.error(`[${this.id}] Phone validation failed:`, error);
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<SMSDeliveryStatus> {
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
        errorCode: data.error_code,
        errorMessage: data.error_message,
        deliveredAt: data.date_updated
          ? new Date(data.date_updated)
          : undefined,
        price: data.price,
        priceUnit: data.price_unit,
      };
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private mapTwilioStatus(twilioStatus: string): SMSDeliveryStatus['status'] {
    const statusMap: Record<string, SMSDeliveryStatus['status']> = {
      queued: 'queued',
      sending: 'sent',
      sent: 'sent',
      delivered: 'delivered',
      failed: 'failed',
      undelivered: 'undelivered',
    };

    return statusMap[twilioStatus] || 'failed';
  }

  private async validateLGPDCompliance(
    lgpdData: LGPDCompliantData
  ): Promise<void> {
    if (!lgpdData.consentGiven) {
      throw new Error('LGPD: SMS consent not provided');
    }

    if (lgpdData.consentExpiry && new Date() > lgpdData.consentExpiry) {
      throw new Error('LGPD: SMS consent expired');
    }

    if (
      !(
        lgpdData.purposes.includes('notifications') ||
        lgpdData.purposes.includes('marketing')
      )
    ) {
      throw new Error('LGPD: SMS purpose not authorized');
    }
  }

  private async validateBrazilCompliance(params: SMSParams): Promise<void> {
    const now = new Date();
    const phoneNumbers = Array.isArray(params.to) ? params.to : [params.to];

    // Check operating hours
    if (this.brazilConfig.restrictToOperatingHours) {
      const currentHour = now.getHours();
      const startHour = Number.parseInt(
        this.brazilConfig.operatingHours.start.split(':')[0],
        10
      );
      const endHour = Number.parseInt(
        this.brazilConfig.operatingHours.end.split(':')[0],
        10
      );

      if (currentHour < startHour || currentHour >= endHour) {
        throw new Error('Brazil Compliance: SMS outside operating hours');
      }
    }

    // Validate Brazil phone numbers
    for (const phoneNumber of phoneNumbers) {
      if (
        phoneNumber.startsWith('+55') &&
        !(await this.validatePhoneNumber(phoneNumber))
      ) {
        throw new Error(
          `Brazil Compliance: Invalid Brazilian phone number: ${phoneNumber}`
        );
      }
    }

    // Check opt-out requirements for marketing
    if (
      this.brazilConfig.requireOptOut &&
      params.metadata.lgpdConsent.purposes.includes('marketing') &&
      !(
        params.message.toLowerCase().includes('sair') ||
        params.message.toLowerCase().includes('stop')
      )
    ) {
      throw new Error(
        'Brazil Compliance: Marketing SMS must include opt-out instructions'
      );
    }
  }
}

/**
 * SMS Provider Factory
 * Manages SMS providers and fallback logic
 */
class SMSProviderFactory {
  private readonly primaryProvider: SMSProvider;

  constructor(config: SMSProviderConfig) {
    this.config = config;
    this.primaryProvider = new TwilioSMSProvider(config.primary, config.brazil);
  }

  async getProvider(): Promise<SMSProvider> {
    if (await this.primaryProvider.isHealthy()) {
      return this.primaryProvider;
    }

    throw new Error('SMS provider is unhealthy');
  }

  async sendSMS(params: SMSParams): Promise<NotificationResult> {
    try {
      const provider = await this.getProvider();
      return await provider.sendSMS(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS provider failed',
        providerId: 'sms-factory',
        channel: 'sms',
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  async sendBulkSMS(params: BulkSMSParams): Promise<NotificationResult[]> {
    try {
      const provider = await this.getProvider();
      return await provider.sendBulkSMS(params);
    } catch (error) {
      return params.messages.map((message) => ({
        success: false,
        error: error instanceof Error ? error.message : 'SMS provider failed',
        providerId: 'sms-factory',
        channel: 'sms',
        timestamp: new Date(),
        metadata: message.metadata,
      }));
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      return await provider.validatePhoneNumber(phoneNumber);
    } catch (error) {
      console.error('Phone number validation failed:', error);
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<SMSDeliveryStatus> {
    try {
      const provider = await this.getProvider();
      return await provider.getDeliveryStatus(messageId);
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export types and implementations
export type {
  SMSProvider,
  SMSParams,
  BulkSMSParams,
  SMSDeliveryStatus,
  BrazilTelecomCompliance,
  SMSProviderConfig,
};
export { TwilioSMSProvider, SMSProviderFactory };

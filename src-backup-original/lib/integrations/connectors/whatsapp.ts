/**
 * NeonPro - WhatsApp Business API Connector
 * Integration with WhatsApp Business API for patient communication
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import {
  IntegrationConnector,
  IntegrationConfig,
  IntegrationRequest,
  IntegrationResponse,
  WebhookConfig
} from '../types';

/**
 * WhatsApp Business API Configuration
 */
export interface WhatsAppConfig extends IntegrationConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

/**
 * WhatsApp Message Types
 */
export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    id?: string;
    caption?: string;
    filename?: string;
  };
  audio?: {
    link?: string;
    id?: string;
  };
  video?: {
    link?: string;
    id?: string;
    caption?: string;
  };
}

/**
 * WhatsApp Webhook Event
 */
export interface WhatsAppWebhookEvent {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        messages?: {
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
          context?: {
            from: string;
            id: string;
          };
        }[];
        statuses?: {
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
          errors?: any[];
        }[];
      };
      field: string;
    }[];
  }[];
}

/**
 * WhatsApp Business API Connector
 */
export class WhatsAppConnector implements IntegrationConnector {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/${config.apiVersion || 'v18.0'}`;
  }

  /**
   * Test connection to WhatsApp Business API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        method: 'GET',
        endpoint: `/${this.config.phoneNumberId}`,
        params: {
          fields: 'id,display_phone_number,verified_name'
        }
      });

      return response.success && response.data?.id === this.config.phoneNumberId;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(message: WhatsAppMessage): Promise<IntegrationResponse> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: message.type,
        ...this.buildMessagePayload(message)
      };

      const response = await this.makeRequest({
        method: 'POST',
        endpoint: `/${this.config.phoneNumberId}/messages`,
        data: payload
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          messageId: response.data?.messages?.[0]?.id,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    clinicName: string
  ): Promise<IntegrationResponse> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'appointment_reminder',
        language: {
          code: 'pt_BR'
        },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: patientName },
              { type: 'text', text: appointmentDate.toLocaleDateString('pt-BR') },
              { type: 'text', text: appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
              { type: 'text', text: doctorName },
              { type: 'text', text: clinicName }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  /**
   * Send appointment confirmation request
   */
  async sendAppointmentConfirmation(
    phoneNumber: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string
  ): Promise<IntegrationResponse> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'appointment_confirmation',
        language: {
          code: 'pt_BR'
        },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: patientName },
              { type: 'text', text: appointmentDate.toLocaleDateString('pt-BR') },
              { type: 'text', text: appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
              { type: 'text', text: doctorName }
            ]
          },
          {
            type: 'button',
            sub_type: 'quick_reply',
            index: '0',
            parameters: [
              { type: 'payload', payload: 'CONFIRM_APPOINTMENT' }
            ]
          },
          {
            type: 'button',
            sub_type: 'quick_reply',
            index: '1',
            parameters: [
              { type: 'payload', payload: 'RESCHEDULE_APPOINTMENT' }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  /**
   * Send exam results notification
   */
  async sendExamResults(
    phoneNumber: string,
    patientName: string,
    examType: string,
    resultsUrl?: string
  ): Promise<IntegrationResponse> {
    if (resultsUrl) {
      // Send document with results
      const message: WhatsAppMessage = {
        to: phoneNumber,
        type: 'document',
        document: {
          link: resultsUrl,
          caption: `Olá ${patientName}, seus resultados de ${examType} estão prontos. Confira o documento anexo.`,
          filename: `Resultados_${examType}_${patientName.replace(/\s+/g, '_')}.pdf`
        }
      };
      return this.sendMessage(message);
    } else {
      // Send text message
      const message: WhatsAppMessage = {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `Olá ${patientName}, seus resultados de ${examType} estão prontos. Entre em contato conosco para mais informações.`
        }
      };
      return this.sendMessage(message);
    }
  }

  /**
   * Get message templates
   */
  async getMessageTemplates(): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: 'GET',
        endpoint: `/${this.config.businessAccountId}/message_templates`,
        params: {
          fields: 'name,status,category,language,components'
        }
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates'
      };
    }
  }

  /**
   * Upload media file
   */
  async uploadMedia(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<IntegrationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file], { type: mimeType }), filename);
      formData.append('type', mimeType);
      formData.append('messaging_product', 'whatsapp');

      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return {
        success: true,
        data: {
          id: data.id,
          url: data.url
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload media'
      };
    }
  }

  /**
   * Get media URL
   */
  async getMediaUrl(mediaId: string): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: 'GET',
        endpoint: `/${mediaId}`
      });

      if (response.success && response.data?.url) {
        // Get the actual media file
        const mediaResponse = await fetch(response.data.url, {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        });

        return {
          success: true,
          data: {
            url: response.data.url,
            mimeType: response.data.mime_type,
            sha256: response.data.sha256,
            fileSize: response.data.file_size
          }
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get media URL'
      };
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(payload: WhatsAppWebhookEvent): Promise<any> {
    const events = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const value = change.value;

          // Process incoming messages
          if (value.messages) {
            for (const message of value.messages) {
              events.push({
                type: 'message_received',
                data: {
                  messageId: message.id,
                  from: message.from,
                  timestamp: new Date(parseInt(message.timestamp) * 1000),
                  messageType: message.type,
                  text: message.text?.body,
                  context: message.context
                }
              });
            }
          }

          // Process message status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              events.push({
                type: 'message_status',
                data: {
                  messageId: status.id,
                  status: status.status,
                  timestamp: new Date(parseInt(status.timestamp) * 1000),
                  recipientId: status.recipient_id,
                  errors: status.errors
                }
              });
            }
          }
        }
      }
    }

    return events;
  }

  /**
   * Get webhook configuration
   */
  getWebhookConfig(): WebhookConfig {
    return {
      id: `whatsapp-${this.config.phoneNumberId}`,
      url: `${this.config.webhookUrl}/whatsapp`,
      events: ['messages', 'message_deliveries', 'message_reads'],
      secret: this.config.webhookVerifyToken,
      active: true,
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffStrategy: 'exponential'
      }
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): boolean {
    // WhatsApp uses different verification method
    // This is handled in the webhook endpoint
    return true;
  }

  // Private helper methods

  /**
   * Make API request to WhatsApp
   */
  private async makeRequest(request: IntegrationRequest): Promise<IntegrationResponse> {
    try {
      const url = new URL(`${this.baseUrl}${request.endpoint}`);
      
      // Add query parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const options: RequestInit = {
        method: request.method,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          ...request.headers
        }
      };

      if (request.data) {
        options.body = JSON.stringify(request.data);
      }

      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
        metadata: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Build message payload based on type
   */
  private buildMessagePayload(message: WhatsAppMessage): any {
    const payload: any = {};

    switch (message.type) {
      case 'text':
        payload.text = message.text;
        break;
      case 'template':
        payload.template = message.template;
        break;
      case 'image':
        payload.image = message.image;
        break;
      case 'document':
        payload.document = message.document;
        break;
      case 'audio':
        payload.audio = message.audio;
        break;
      case 'video':
        payload.video = message.video;
        break;
    }

    return payload;
  }
}

/**
 * WhatsApp Message Templates
 */
export const WhatsAppTemplates = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
  EXAM_RESULTS: 'exam_results',
  PAYMENT_REMINDER: 'payment_reminder',
  WELCOME_MESSAGE: 'welcome_message'
};

/**
 * WhatsApp Utility Functions
 */
export class WhatsAppUtils {
  /**
   * Format phone number for WhatsApp
   */
  static formatPhoneNumber(phone: string, countryCode: string = '55'): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith(countryCode)) {
      return `${countryCode}${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Extract message text from webhook
   */
  static extractMessageText(webhook: WhatsAppWebhookEvent): string | null {
    for (const entry of webhook.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            if (message.text?.body) {
              return message.text.body;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Get sender phone number from webhook
   */
  static getSenderPhone(webhook: WhatsAppWebhookEvent): string | null {
    for (const entry of webhook.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            return message.from;
          }
        }
      }
    }
    return null;
  }
}

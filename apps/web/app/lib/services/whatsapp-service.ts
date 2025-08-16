// WhatsApp Business API Service
// Integrates with Meta's WhatsApp Cloud API for NeonPro
// Uses official whatsapp library with TypeScript support

import {
  type SendMessageRequest,
  type SendMessageResponse,
  type WhatsAppAnalytics,
  type WhatsAppConfig,
  type WhatsAppMessage,
  WhatsAppMessageStatus,
  WhatsAppMessageType,
  type WhatsAppTemplate,
  type WhatsAppWebhookPayload,
} from '@/app/types/whatsapp';
import { createClient } from '@/app/utils/supabase/client';

// WhatsApp Cloud API configuration
const WHATSAPP_API_BASE = 'https://graph.facebook.com/v18.0';

class WhatsAppService {
  private readonly supabase = createClient();

  // Configuration Management
  async getConfig(): Promise<WhatsAppConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error('Failed to fetch WhatsApp configuration');
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  async updateConfig(
    config: Omit<WhatsAppConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WhatsAppConfig> {
    const { data, error } = await this.supabase
      .from('whatsapp_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update WhatsApp configuration');
    }

    return data;
  }

  // Message Management
  async sendMessage(
    phoneNumber: string,
    content: string,
    type: WhatsAppMessageType = WhatsAppMessageType.TEXT,
    patientId?: string,
    templateName?: string
  ): Promise<string> {
    const config = await this.getConfig();
    if (!config?.isActive) {
      throw new Error('WhatsApp is not configured or inactive');
    }

    try {
      // Prepare message request
      const messageRequest: SendMessageRequest = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type,
      };

      // Add content based on message type
      if (type === WhatsAppMessageType.TEXT) {
        messageRequest.text = {
          preview_url: true,
          body: content,
        };
      } else if (type === WhatsAppMessageType.TEMPLATE && templateName) {
        messageRequest.template = {
          name: templateName,
          language: {
            code: 'pt_BR',
          },
        };
      }

      // Send via WhatsApp API
      const response = await fetch(
        `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageRequest),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const result: SendMessageResponse = await response.json();
      const messageId = result.messages[0]?.id;

      if (!messageId) {
        throw new Error('No message ID returned from WhatsApp API');
      }

      // Store message in database
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: type,
        templateName,
        content,
        status: WhatsAppMessageStatus.SENT,
        sentAt: new Date(),
        metadata: { whatsappMessageId: messageId },
      });

      return messageId;
    } catch (error) {
      // Store failed message
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: type,
        templateName,
        content,
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    parameters: Record<string, string> = {},
    patientId?: string
  ): Promise<string> {
    const config = await this.getConfig();
    if (!config?.isActive) {
      throw new Error('WhatsApp is not configured or inactive');
    }

    try {
      const template = await this.getTemplate(templateName);
      if (!template?.isActive) {
        throw new Error(`Template '${templateName}' not found or inactive`);
      }

      // Build template components with parameters
      const components = this.buildTemplateComponents(template, parameters);

      const messageRequest: SendMessageRequest = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: template.language,
          },
          components,
        },
      };

      const response = await fetch(
        `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageRequest),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const result: SendMessageResponse = await response.json();
      const messageId = result.messages[0]?.id;

      if (!messageId) {
        throw new Error('No message ID returned from WhatsApp API');
      }

      // Store message in database
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: WhatsAppMessageType.TEMPLATE,
        templateName,
        content: JSON.stringify(parameters),
        status: WhatsAppMessageStatus.SENT,
        sentAt: new Date(),
        metadata: { whatsappMessageId: messageId, parameters },
      });

      return messageId;
    } catch (error) {
      // Store failed message
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: WhatsAppMessageType.TEMPLATE,
        templateName,
        content: JSON.stringify(parameters),
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private async storeMessage(
    message: Omit<WhatsAppMessage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('whatsapp_messages').insert({
        ...message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
      }
    } catch (_error) {}
  }

  // Template Management
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch WhatsApp templates');
    }

    return data || [];
  }

  async getTemplate(name: string): Promise<WhatsAppTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error('Failed to fetch WhatsApp template');
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  private buildTemplateComponents(
    template: WhatsAppTemplate,
    parameters: Record<string, string>
  ): any[] {
    return template.components.map((component) => {
      if (component.type === 'BODY' && component.text) {
        // Replace placeholders with actual parameters
        let text = component.text;
        Object.entries(parameters).forEach(([key, value]) => {
          text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        return {
          type: 'body',
          parameters: Object.values(parameters).map((value) => ({
            type: 'text',
            text: value,
          })),
        };
      }

      return component;
    });
  }

  // Webhook handling
  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    try {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.processWebhookMessages(change.value);
          }
        }
      }
    } catch (_error) {}
  }

  private async processWebhookMessages(value: any): Promise<void> {
    // Process status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await this.updateMessageStatus(
          status.id,
          status.status,
          status.timestamp
        );
      }
    }

    // Process incoming messages (if needed for two-way communication)
    if (value.messages) {
      for (const message of value.messages) {
        await this.handleIncomingMessage(message);
      }
    }
  }

  private async updateMessageStatus(
    whatsappMessageId: string,
    status: string,
    timestamp: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date(
          Number.parseInt(timestamp, 10) * 1000
        ).toISOString();
      } else if (status === 'read') {
        updateData.read_at = new Date(
          Number.parseInt(timestamp, 10) * 1000
        ).toISOString();
      }

      const { error } = await this.supabase
        .from('whatsapp_messages')
        .update(updateData)
        .eq('metadata->whatsappMessageId', whatsappMessageId);

      if (error) {
      }
    } catch (_error) {}
  }

  private async handleIncomingMessage(message: any): Promise<void> {
    try {
      // Store incoming message for future reference
      await this.storeMessage({
        phoneNumber: message.from,
        messageType: WhatsAppMessageType.TEXT,
        content: message.text?.body || 'Mensagem recebida',
        status: WhatsAppMessageStatus.DELIVERED,
        sentAt: new Date(Number.parseInt(message.timestamp, 10) * 1000),
        metadata: { whatsappMessageId: message.id, incoming: true },
      });
    } catch (_error) {}
  }

  // Opt-in Management
  async checkOptIn(phoneNumber: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_opt_ins')
        .select('is_opted_in')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return data?.is_opted_in;
    } catch (_error) {
      return false;
    }
  }

  async recordOptIn(
    patientId: string,
    phoneNumber: string,
    source = 'manual',
    consentMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase.from('whatsapp_opt_ins').upsert({
      patient_id: patientId,
      phone_number: phoneNumber,
      is_opted_in: true,
      opt_in_source: source,
      opt_in_date: new Date().toISOString(),
      consent_message: consentMessage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error('Failed to record WhatsApp opt-in');
    }
  }

  // Analytics
  async getAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<WhatsAppAnalytics[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch WhatsApp analytics');
    }

    return data || [];
  }

  // Bulk messaging
  async sendBulkMessages(
    phoneNumbers: string[],
    templateName: string,
    parameters: Record<string, string> = {}
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const phoneNumber of phoneNumbers) {
      try {
        // Check opt-in status
        const isOptedIn = await this.checkOptIn(phoneNumber);
        if (!isOptedIn) {
          results.failed++;
          results.errors.push(
            `${phoneNumber}: Not opted in for WhatsApp communications`
          );
          continue;
        }

        await this.sendTemplateMessage(phoneNumber, templateName, parameters);
        results.sent++;

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return results;
  }
}

export const whatsAppService = new WhatsAppService();

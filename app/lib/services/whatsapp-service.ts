// WhatsApp Business API Service
// Integrates with Meta's WhatsApp Cloud API for NeonPro
// Uses official whatsapp library with TypeScript support

import { createClient } from '@/app/utils/supabase/client';
import {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppTemplate,
  WhatsAppOptIn,
  WhatsAppAnalytics,
  SendMessageRequest,
  SendMessageResponse,
  WhatsAppMessageType,
  WhatsAppMessageStatus,
  PatientWhatsAppNotification,
  WhatsAppWebhookPayload
} from '@/app/types/whatsapp';

// WhatsApp Cloud API configuration
const WHATSAPP_API_BASE = 'https://graph.facebook.com/v18.0';

class WhatsAppService {
  private supabase = createClient();

  // Configuration Management
  async getConfig(): Promise<WhatsAppConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp config:', error);
        throw new Error('Failed to fetch WhatsApp configuration');
      }

      return data;
    } catch (error) {
      console.error('WhatsApp config fetch error:', error);
      return null;
    }
  }

  async updateConfig(config: Omit<WhatsAppConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WhatsAppConfig> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_config')
        .upsert({
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating WhatsApp config:', error);
        throw new Error('Failed to update WhatsApp configuration');
      }

      return data;
    } catch (error) {
      console.error('WhatsApp config update error:', error);
      throw error;
    }
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
    if (!config || !config.isActive) {
      throw new Error('WhatsApp is not configured or inactive');
    }

    try {
      // Prepare message request
      const messageRequest: SendMessageRequest = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: type
      };

      // Add content based on message type
      if (type === WhatsAppMessageType.TEXT) {
        messageRequest.text = {
          preview_url: true,
          body: content
        };
      } else if (type === WhatsAppMessageType.TEMPLATE && templateName) {
        messageRequest.template = {
          name: templateName,
          language: {
            code: 'pt_BR'
          }
        };
      }

      // Send via WhatsApp API
      const response = await fetch(
        `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageRequest)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
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
        metadata: { whatsappMessageId: messageId }
      });

      return messageId;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Store failed message
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: type,
        templateName,
        content,
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
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
    if (!config || !config.isActive) {
      throw new Error('WhatsApp is not configured or inactive');
    }

    try {
      const template = await this.getTemplate(templateName);
      if (!template || !template.isActive) {
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
            code: template.language
          },
          components
        }
      };

      const response = await fetch(
        `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageRequest)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
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
        metadata: { whatsappMessageId: messageId, parameters }
      });

      return messageId;
    } catch (error) {
      console.error('Error sending template message:', error);
      
      // Store failed message
      await this.storeMessage({
        patientId,
        phoneNumber,
        messageType: WhatsAppMessageType.TEMPLATE,
        templateName,
        content: JSON.stringify(parameters),
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async storeMessage(message: Omit<WhatsAppMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('whatsapp_messages')
        .insert({
          ...message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing WhatsApp message:', error);
      }
    } catch (error) {
      console.error('Database error storing message:', error);
    }
  }

  // Template Management
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw new Error('Failed to fetch WhatsApp templates');
      }

      return data || [];
    } catch (error) {
      console.error('Templates fetch error:', error);
      throw error;
    }
  }

  async getTemplate(name: string): Promise<WhatsAppTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching template:', error);
        throw new Error('Failed to fetch WhatsApp template');
      }

      return data;
    } catch (error) {
      console.error('Template fetch error:', error);
      return null;
    }
  }

  private buildTemplateComponents(template: WhatsAppTemplate, parameters: Record<string, string>): any[] {
    return template.components.map(component => {
      if (component.type === 'BODY' && component.text) {
        // Replace placeholders with actual parameters
        let text = component.text;
        Object.entries(parameters).forEach(([key, value]) => {
          text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        return {
          type: 'body',
          parameters: Object.values(parameters).map(value => ({
            type: 'text',
            text: value
          }))
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
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  private async processWebhookMessages(value: any): Promise<void> {
    // Process status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await this.updateMessageStatus(status.id, status.status, status.timestamp);
      }
    }

    // Process incoming messages (if needed for two-way communication)
    if (value.messages) {
      for (const message of value.messages) {
        await this.handleIncomingMessage(message);
      }
    }
  }

  private async updateMessageStatus(whatsappMessageId: string, status: string, timestamp: string): Promise<void> {
    try {
      const updateData: any = {
        status: status.toLowerCase(),
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date(parseInt(timestamp) * 1000).toISOString();
      } else if (status === 'read') {
        updateData.read_at = new Date(parseInt(timestamp) * 1000).toISOString();
      }

      const { error } = await this.supabase
        .from('whatsapp_messages')
        .update(updateData)
        .eq('metadata->whatsappMessageId', whatsappMessageId);

      if (error) {
        console.error('Error updating message status:', error);
      }
    } catch (error) {
      console.error('Database error updating message status:', error);
    }
  }

  private async handleIncomingMessage(message: any): Promise<void> {
    try {
      // Store incoming message for future reference
      await this.storeMessage({
        phoneNumber: message.from,
        messageType: WhatsAppMessageType.TEXT,
        content: message.text?.body || 'Mensagem recebida',
        status: WhatsAppMessageStatus.DELIVERED,
        sentAt: new Date(parseInt(message.timestamp) * 1000),
        metadata: { whatsappMessageId: message.id, incoming: true }
      });
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
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
        console.error('Error checking opt-in:', error);
        return false;
      }

      return data?.is_opted_in || false;
    } catch (error) {
      console.error('Opt-in check error:', error);
      return false;
    }
  }

  async recordOptIn(
    patientId: string,
    phoneNumber: string,
    source: string = 'manual',
    consentMessage?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('whatsapp_opt_ins')
        .upsert({
          patient_id: patientId,
          phone_number: phoneNumber,
          is_opted_in: true,
          opt_in_source: source,
          opt_in_date: new Date().toISOString(),
          consent_message: consentMessage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording opt-in:', error);
        throw new Error('Failed to record WhatsApp opt-in');
      }
    } catch (error) {
      console.error('Opt-in record error:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(startDate: Date, endDate: Date): Promise<WhatsAppAnalytics[]> {
    try {
      const { data, error } = await this.supabase
        .from('whatsapp_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        throw new Error('Failed to fetch WhatsApp analytics');
      }

      return data || [];
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw error;
    }
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
          results.errors.push(`${phoneNumber}: Not opted in for WhatsApp communications`);
          continue;
        }

        await this.sendTemplateMessage(phoneNumber, templateName, parameters);
        results.sent++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        results.errors.push(`${phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }
}

export const whatsAppService = new WhatsAppService();
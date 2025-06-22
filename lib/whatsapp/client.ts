// WhatsApp Business API Integration
// Configuração para envio de mensagens via WhatsApp Business

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppClient {
  private apiKey: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER || '';
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      // Simular envio para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 WhatsApp Message (Development Mode):', {
          to: message.to,
          type: message.type,
          content: message.text?.body || message.template?.name
        });
        
        return {
          success: true,
          messageId: `dev_msg_${Date.now()}`
        };
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages[0].id
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Erro ao enviar mensagem'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'text',
      text: { body: text }
    });
  }

  async sendAppointmentConfirmation(to: string, clientName: string, service: string, date: string, time: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: 'appointment_confirmation',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: service },
              { type: 'text', text: date },
              { type: 'text', text: time }
            ]
          }
        ]
      }
    });
  }

  async sendAppointmentReminder(to: string, clientName: string, service: string, date: string, time: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: 'appointment_reminder',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: service },
              { type: 'text', text: date },
              { type: 'text', text: time }
            ]
          }
        ]
      }
    });
  }

  async sendPromotionalMessage(to: string, clientName: string, promotion: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: 'promotional_message',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: promotion }
            ]
          }
        ]
      }
    });
  }

  // Método para testar a conexão
  async testConnection(): Promise<WhatsAppResponse> {
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        messageId: 'test_connection_dev'
      };
    }

    try {
      const testMessage = {
        to: this.phoneNumberId, // Enviar para o próprio número como teste
        type: 'text' as const,
        text: { body: 'Teste de conexão WhatsApp Business API' }
      };

      return await this.sendMessage(testMessage);
    } catch (error) {
      return {
        success: false,
        error: 'Falha no teste de conexão'
      };
    }
  }
}

export const whatsappClient = new WhatsAppClient();
export type { WhatsAppMessage, WhatsAppResponse };

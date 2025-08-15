/**
 * NeonPro Notification System - Channels
 * Story 1.7: Sistema de Notificações
 *
 * Sistema de canais de entrega de notificações
 * Suporte a Email, SMS, Push e In-App
 */

import {
  type ChannelConfig,
  DeliveryStatus,
  NotificationChannel,
  type NotificationContext,
  type NotificationDelivery,
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ChannelProvider {
  readonly name: string;
  readonly channel: NotificationChannel;
  readonly isEnabled: boolean;

  initialize(config: ChannelConfig): Promise<void>;
  send(
    context: NotificationContext,
    content: any
  ): Promise<NotificationDelivery>;
  validateConfig(config: ChannelConfig): string[];
  getStatus(): Promise<{ healthy: boolean; message?: string }>;
}

export interface ChannelManager {
  registerProvider(provider: ChannelProvider): void;
  getProvider(channel: NotificationChannel): ChannelProvider | undefined;
  send(
    channel: NotificationChannel,
    context: NotificationContext,
    content: any
  ): Promise<NotificationDelivery>;
  getAvailableChannels(): NotificationChannel[];
  validateChannelConfig(
    channel: NotificationChannel,
    config: ChannelConfig
  ): string[];
}

// ============================================================================
// CHANNEL MANAGER IMPLEMENTATION
// ============================================================================

/**
 * Gerenciador de canais de notificação
 */
export class NotificationChannelManager implements ChannelManager {
  private readonly providers: Map<NotificationChannel, ChannelProvider> =
    new Map();

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  /**
   * Inicializa o gerenciador de canais
   */
  async initialize(): Promise<void> {
    // Registrar provedores padrão
    await this.registerDefaultProviders();

    // Inicializar provedores
    for (const provider of this.providers.values()) {
      try {
        const config = await this.getChannelConfig(provider.channel);
        if (config) {
          await provider.initialize(config);
        }
      } catch (error) {
        console.error(`Erro ao inicializar provedor ${provider.name}:`, error);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Registra provedores padrão
   */
  private async registerDefaultProviders(): Promise<void> {
    const { EmailProvider } = await import('./email-provider');
    const { SMSProvider } = await import('./sms-provider');
    const { PushProvider } = await import('./push-provider');
    const { InAppProvider } = await import('./in-app-provider');

    this.registerProvider(new EmailProvider());
    this.registerProvider(new SMSProvider());
    this.registerProvider(new PushProvider());
    this.registerProvider(new InAppProvider());
  }

  // ============================================================================
  // GERENCIAMENTO DE PROVEDORES
  // ============================================================================

  /**
   * Registra um provedor de canal
   */
  registerProvider(provider: ChannelProvider): void {
    this.providers.set(provider.channel, provider);
  }

  /**
   * Obtém provedor por canal
   */
  getProvider(channel: NotificationChannel): ChannelProvider | undefined {
    return this.providers.get(channel);
  }

  /**
   * Lista canais disponíveis
   */
  getAvailableChannels(): NotificationChannel[] {
    return Array.from(this.providers.keys()).filter((channel) => {
      const provider = this.providers.get(channel);
      return provider?.isEnabled ?? false;
    });
  }

  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Envia notificação através do canal especificado
   */
  async send(
    channel: NotificationChannel,
    context: NotificationContext,
    content: any
  ): Promise<NotificationDelivery> {
    const provider = this.getProvider(channel);

    if (!provider) {
      return {
        id: this.generateDeliveryId(),
        notificationId: context.notificationId || '',
        channel,
        recipient: context.recipient,
        status: DeliveryStatus.FAILED,
        error: `Provedor não encontrado para canal: ${channel}`,
        attempts: 1,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    if (!provider.isEnabled) {
      return {
        id: this.generateDeliveryId(),
        notificationId: context.notificationId || '',
        channel,
        recipient: context.recipient,
        status: DeliveryStatus.FAILED,
        error: `Canal ${channel} está desabilitado`,
        attempts: 1,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    try {
      return await provider.send(context, content);
    } catch (error) {
      console.error(`Erro ao enviar notificação via ${channel}:`, error);

      return {
        id: this.generateDeliveryId(),
        notificationId: context.notificationId || '',
        channel,
        recipient: context.recipient,
        status: DeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        attempts: 1,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // ============================================================================
  // VALIDAÇÃO
  // ============================================================================

  /**
   * Valida configuração de canal
   */
  validateChannelConfig(
    channel: NotificationChannel,
    config: ChannelConfig
  ): string[] {
    const provider = this.getProvider(channel);

    if (!provider) {
      return [`Provedor não encontrado para canal: ${channel}`];
    }

    return provider.validateConfig(config);
  }

  // ============================================================================
  // MONITORAMENTO
  // ============================================================================

  /**
   * Verifica status de todos os canais
   */
  async getChannelsStatus(): Promise<
    Record<NotificationChannel, { healthy: boolean; message?: string }>
  > {
    const status: Record<string, { healthy: boolean; message?: string }> = {};

    for (const [channel, provider] of this.providers.entries()) {
      try {
        status[channel] = await provider.getStatus();
      } catch (error) {
        status[channel] = {
          healthy: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }

    return status as Record<
      NotificationChannel,
      { healthy: boolean; message?: string }
    >;
  }

  /**
   * Verifica se canal está saudável
   */
  async isChannelHealthy(channel: NotificationChannel): Promise<boolean> {
    const provider = this.getProvider(channel);

    if (!provider?.isEnabled) {
      return false;
    }

    try {
      const status = await provider.getStatus();
      return status.healthy;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Gera ID único para entrega
   */
  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém configuração do canal
   */
  private async getChannelConfig(
    channel: NotificationChannel
  ): Promise<ChannelConfig | undefined> {
    // Em uma implementação real, isso viria do banco de dados
    // Por enquanto, retornamos configurações padrão baseadas em variáveis de ambiente

    switch (channel) {
      case NotificationChannel.EMAIL:
        return {
          provider: 'resend',
          settings: {
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@neonpro.com',
            fromName: process.env.RESEND_FROM_NAME || 'NeonPro',
          },
          isEnabled: Boolean(process.env.RESEND_API_KEY),
        };

      case NotificationChannel.SMS:
        return {
          provider: 'twilio',
          settings: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FROM_NUMBER,
          },
          isEnabled: Boolean(process.env.TWILIO_ACCOUNT_SID),
        };

      case NotificationChannel.PUSH:
        return {
          provider: 'firebase',
          settings: {
            serverKey: process.env.FIREBASE_SERVER_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID,
          },
          isEnabled: Boolean(process.env.FIREBASE_SERVER_KEY),
        };

      case NotificationChannel.IN_APP:
        return {
          provider: 'supabase',
          settings: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
          isEnabled: true, // Sempre habilitado
        };

      default:
        return;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NotificationChannelManager;
export * from './email-provider';
export * from './in-app-provider';
export * from './push-provider';
export * from './sms-provider';

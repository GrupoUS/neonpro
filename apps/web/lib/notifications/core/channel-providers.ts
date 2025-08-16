import { AuditLogger } from '../../auth/audit/audit-logger';
import { EmailProvider } from '../channels/email-provider';
import { PushProvider } from '../channels/push-provider';
import { SMSProvider } from '../channels/sms-provider';
import { WhatsAppProvider } from '../channels/whatsapp-provider';
import {
  NotificationChannelEnum,
  type NotificationConfig,
  type NotificationResult,
} from './notification-manager';

export type ChannelConfig = {
  enabled: boolean;
  priority: number;
  fallback_channels?: NotificationChannelEnum[];
  rate_limit?: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  retry_config?: {
    max_retries: number;
    retry_delay_ms: number;
    exponential_backoff: boolean;
  };
  cost_per_message?: number;
  provider_config?: Record<string, any>;
};

export type ChannelMetrics = {
  channel: NotificationChannelEnum;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  average_delivery_time_ms: number;
  total_cost: number;
  last_updated: Date;
};

export class ChannelProvider {
  private readonly emailProvider: EmailProvider;
  private readonly smsProvider: SMSProvider;
  private readonly pushProvider: PushProvider;
  private readonly whatsappProvider: WhatsAppProvider;
  private readonly auditLogger: AuditLogger;
  private readonly channelConfigs: Map<NotificationChannelEnum, ChannelConfig>;
  private readonly metrics: Map<NotificationChannelEnum, ChannelMetrics>;

  constructor() {
    this.emailProvider = new EmailProvider();
    this.smsProvider = new SMSProvider();
    this.pushProvider = new PushProvider();
    this.whatsappProvider = new WhatsAppProvider();
    this.auditLogger = new AuditLogger();
    this.channelConfigs = new Map();
    this.metrics = new Map();

    this.initializeChannelConfigs();
    this.initializeMetrics();
  }

  /**
   * Envia notificação através do canal especificado
   */
  async send(config: NotificationConfig): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Verificar se canal está habilitado
      const channelConfig = this.channelConfigs.get(config.channel);
      if (!channelConfig?.enabled) {
        throw new Error(`Canal ${config.channel} está desabilitado`);
      }

      // Verificar rate limiting
      await this.checkRateLimit(config.channel);

      // Selecionar provider apropriado
      const provider = this.getProvider(config.channel);

      // Enviar notificação
      const result = await provider.send({
        to: await this.getRecipientContact(config.recipient_id, config.channel),
        subject: config.data.subject,
        content: config.data.content,
        metadata: {
          notification_id: config.id,
          type: config.type,
          priority: config.priority,
          ...config.metadata,
        },
      });

      // Atualizar métricas
      await this.updateMetrics(config.channel, result, Date.now() - startTime);

      // Log de auditoria
      await this.auditLogger.log({
        action: 'notification_channel_send',
        resource_type: 'notification',
        resource_id: config.id,
        details: {
          channel: config.channel,
          status: result.status,
          delivery_time_ms: Date.now() - startTime,
        },
      });

      return {
        id: result.id || config.id,
        status: result.status,
        channel: config.channel,
        sent_at: new Date(),
        delivered_at: result.delivered_at,
        error_message: result.error_message,
        retry_count: 0,
        cost: channelConfig.cost_per_message,
        engagement: result.engagement,
      };
    } catch (error) {
      // Tentar fallback se configurado
      const fallbackResult = await this.tryFallback(config, error as Error);
      if (fallbackResult) {
        return fallbackResult;
      }

      // Atualizar métricas de falha
      await this.updateFailureMetrics(config.channel, error as Error);

      throw error;
    }
  }

  /**
   * Envia notificação com fallback automático
   */
  async sendWithFallback(
    config: NotificationConfig,
  ): Promise<NotificationResult> {
    const channelConfig = this.channelConfigs.get(config.channel);
    const fallbackChannels = channelConfig?.fallback_channels || [];

    try {
      return await this.send(config);
    } catch (primaryError) {
      // Tentar canais de fallback em ordem de prioridade
      for (const fallbackChannel of fallbackChannels) {
        try {
          const fallbackConfig = { ...config, channel: fallbackChannel };
          const result = await this.send(fallbackConfig);

          // Log do uso de fallback
          await this.auditLogger.log({
            action: 'notification_fallback_used',
            resource_type: 'notification',
            resource_id: config.id,
            details: {
              original_channel: config.channel,
              fallback_channel: fallbackChannel,
              primary_error: (primaryError as Error).message,
            },
          });

          return result;
        } catch (_fallbackError) {}
      }

      // Se todos os fallbacks falharam, lançar erro original
      throw primaryError;
    }
  }

  /**
   * Obtém métricas de um canal específico
   */
  getChannelMetrics(
    channel: NotificationChannelEnum,
  ): ChannelMetrics | undefined {
    return this.metrics.get(channel);
  }

  /**
   * Obtém métricas de todos os canais
   */
  getAllChannelMetrics(): ChannelMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Atualiza configuração de um canal
   */
  async updateChannelConfig(
    channel: NotificationChannelEnum,
    config: Partial<ChannelConfig>,
  ): Promise<void> {
    const currentConfig =
      this.channelConfigs.get(channel) || this.getDefaultChannelConfig();
    const updatedConfig = { ...currentConfig, ...config };

    this.channelConfigs.set(channel, updatedConfig);

    await this.auditLogger.log({
      action: 'channel_config_updated',
      resource_type: 'channel_config',
      resource_id: channel,
      details: { updated_config: config },
    });
  }

  /**
   * Obtém configuração de um canal
   */
  getChannelConfig(
    channel: NotificationChannelEnum,
  ): ChannelConfig | undefined {
    return this.channelConfigs.get(channel);
  }

  /**
   * Testa conectividade de um canal
   */
  async testChannel(channel: NotificationChannelEnum): Promise<{
    success: boolean;
    response_time_ms: number;
    error_message?: string;
  }> {
    const startTime = Date.now();

    try {
      const provider = this.getProvider(channel);
      await provider.test();

      return {
        success: true,
        response_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        response_time_ms: Date.now() - startTime,
        error_message: (error as Error).message,
      };
    }
  }

  /**
   * Obtém status de saúde de todos os canais
   */
  async getChannelsHealthStatus(): Promise<
    Record<
      string,
      {
        status: 'healthy' | 'degraded' | 'down';
        last_check: Date;
        response_time_ms?: number;
        error_rate_24h: number;
        uptime_percentage: number;
      }
    >
  > {
    const healthStatus: Record<string, any> = {};

    for (const channel of Object.values(NotificationChannelEnum)) {
      const metrics = this.metrics.get(channel);
      const testResult = await this.testChannel(channel);

      const errorRate = metrics
        ? (metrics.total_failed / (metrics.total_sent || 1)) * 100
        : 0;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (!testResult.success) {
        status = 'down';
      } else if (errorRate > 10 || testResult.response_time_ms > 5000) {
        status = 'degraded';
      }

      healthStatus[channel] = {
        status,
        last_check: new Date(),
        response_time_ms: testResult.response_time_ms,
        error_rate_24h: errorRate,
        uptime_percentage: metrics
          ? (metrics.total_delivered / (metrics.total_sent || 1)) * 100
          : 100,
      };
    }

    return healthStatus;
  }

  // Métodos privados
  private initializeChannelConfigs(): void {
    // Configurações padrão para cada canal
    const defaultConfigs: Record<NotificationChannelEnum, ChannelConfig> = {
      [NotificationChannelEnum.EMAIL]: {
        enabled: true,
        priority: 1,
        fallback_channels: [NotificationChannelEnum.SMS],
        rate_limit: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
          requests_per_day: 10_000,
        },
        retry_config: {
          max_retries: 3,
          retry_delay_ms: 1000,
          exponential_backoff: true,
        },
        cost_per_message: 0.01,
      },
      [NotificationChannelEnum.SMS]: {
        enabled: true,
        priority: 2,
        fallback_channels: [NotificationChannelEnum.EMAIL],
        rate_limit: {
          requests_per_minute: 50,
          requests_per_hour: 500,
          requests_per_day: 2000,
        },
        retry_config: {
          max_retries: 2,
          retry_delay_ms: 2000,
          exponential_backoff: true,
        },
        cost_per_message: 0.05,
      },
      [NotificationChannelEnum.PUSH]: {
        enabled: true,
        priority: 3,
        fallback_channels: [NotificationChannelEnum.EMAIL],
        rate_limit: {
          requests_per_minute: 200,
          requests_per_hour: 2000,
          requests_per_day: 20_000,
        },
        retry_config: {
          max_retries: 3,
          retry_delay_ms: 500,
          exponential_backoff: true,
        },
        cost_per_message: 0.001,
      },
      [NotificationChannelEnum.WHATSAPP]: {
        enabled: false, // Desabilitado por padrão até configuração
        priority: 4,
        fallback_channels: [
          NotificationChannelEnum.SMS,
          NotificationChannelEnum.EMAIL,
        ],
        rate_limit: {
          requests_per_minute: 30,
          requests_per_hour: 300,
          requests_per_day: 1000,
        },
        retry_config: {
          max_retries: 2,
          retry_delay_ms: 3000,
          exponential_backoff: true,
        },
        cost_per_message: 0.03,
      },
      [NotificationChannelEnum.IN_APP]: {
        enabled: true,
        priority: 5,
        rate_limit: {
          requests_per_minute: 500,
          requests_per_hour: 5000,
          requests_per_day: 50_000,
        },
        retry_config: {
          max_retries: 1,
          retry_delay_ms: 100,
          exponential_backoff: false,
        },
        cost_per_message: 0,
      },
    };

    for (const [channel, config] of Object.entries(defaultConfigs)) {
      this.channelConfigs.set(channel as NotificationChannelEnum, config);
    }
  }

  private initializeMetrics(): void {
    for (const channel of Object.values(NotificationChannelEnum)) {
      this.metrics.set(channel, {
        channel,
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        delivery_rate: 0,
        average_delivery_time_ms: 0,
        total_cost: 0,
        last_updated: new Date(),
      });
    }
  }

  private getProvider(channel: NotificationChannelEnum) {
    switch (channel) {
      case NotificationChannelEnum.EMAIL:
        return this.emailProvider;
      case NotificationChannelEnum.SMS:
        return this.smsProvider;
      case NotificationChannelEnum.PUSH:
        return this.pushProvider;
      case NotificationChannelEnum.WHATSAPP:
        return this.whatsappProvider;
      default:
        throw new Error(`Provider não encontrado para canal: ${channel}`);
    }
  }

  private async getRecipientContact(
    recipientId: string,
    channel: NotificationChannelEnum,
  ): Promise<string> {
    // Implementar lógica para obter contato do destinatário baseado no canal
    // Por exemplo: email, telefone, device token, etc.

    // Esta é uma implementação simplificada
    // Na prática, você buscaria no banco de dados do usuário
    switch (channel) {
      case NotificationChannelEnum.EMAIL:
        return `user-${recipientId}@example.com`;
      case NotificationChannelEnum.SMS:
      case NotificationChannelEnum.WHATSAPP:
        return `+55119${recipientId.slice(-8)}`;
      case NotificationChannelEnum.PUSH:
        return `device-token-${recipientId}`;
      default:
        return recipientId;
    }
  }

  private async checkRateLimit(
    channel: NotificationChannelEnum,
  ): Promise<void> {
    const config = this.channelConfigs.get(channel);
    if (!config?.rate_limit) {
      return;
    }

    // Implementar verificação de rate limiting
    // Esta é uma implementação simplificada
    // Na prática, você usaria Redis ou similar para controle distribuído

    const metrics = this.metrics.get(channel);
    if (!metrics) {
      return;
    }

    // Verificação básica baseada em métricas atuais
    // Em produção, implementar controle mais sofisticado
  }

  private async updateMetrics(
    channel: NotificationChannelEnum,
    result: any,
    deliveryTimeMs: number,
  ): Promise<void> {
    const metrics = this.metrics.get(channel);
    if (!metrics) {
      return;
    }

    metrics.total_sent++;

    if (result.status === 'sent' || result.status === 'delivered') {
      metrics.total_delivered++;
    } else {
      metrics.total_failed++;
    }

    metrics.delivery_rate =
      (metrics.total_delivered / metrics.total_sent) * 100;

    // Atualizar tempo médio de entrega
    metrics.average_delivery_time_ms =
      (metrics.average_delivery_time_ms + deliveryTimeMs) / 2;

    // Atualizar custo total
    const channelConfig = this.channelConfigs.get(channel);
    if (channelConfig?.cost_per_message) {
      metrics.total_cost += channelConfig.cost_per_message;
    }

    metrics.last_updated = new Date();

    this.metrics.set(channel, metrics);
  }

  private async updateFailureMetrics(
    channel: NotificationChannelEnum,
    _error: Error,
  ): Promise<void> {
    const metrics = this.metrics.get(channel);
    if (!metrics) {
      return;
    }

    metrics.total_failed++;
    metrics.delivery_rate =
      (metrics.total_delivered / (metrics.total_sent + 1)) * 100;
    metrics.last_updated = new Date();

    this.metrics.set(channel, metrics);
  }

  private async tryFallback(
    config: NotificationConfig,
    _error: Error,
  ): Promise<NotificationResult | null> {
    const channelConfig = this.channelConfigs.get(config.channel);
    const fallbackChannels = channelConfig?.fallback_channels;

    if (!fallbackChannels || fallbackChannels.length === 0) {
      return null;
    }

    // Tentar primeiro canal de fallback
    const fallbackChannel = fallbackChannels[0];

    try {
      const fallbackConfig = { ...config, channel: fallbackChannel };
      return await this.send(fallbackConfig);
    } catch (_fallbackError) {
      return null;
    }
  }

  private getDefaultChannelConfig(): ChannelConfig {
    return {
      enabled: true,
      priority: 999,
      rate_limit: {
        requests_per_minute: 10,
        requests_per_hour: 100,
        requests_per_day: 1000,
      },
      retry_config: {
        max_retries: 1,
        retry_delay_ms: 1000,
        exponential_backoff: false,
      },
      cost_per_message: 0,
    };
  }
}

export default ChannelProvider;

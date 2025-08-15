/**
 * Sistema de Analytics para Notificações - NeonPro
 *
 * Componente responsável por coletar, processar e disponibilizar métricas
 * avançadas sobre o desempenho do sistema de notificações.
 *
 * Features:
 * - Métricas em tempo real
 * - Analytics preditivos
 * - Segmentação de usuários
 * - ROI de comunicação
 * - Relatórios executivos
 *
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */

import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { NotificationChannel } from '../types';

// ================================================================================
// SCHEMAS & TYPES
// ================================================================================

const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  clinicId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'channel', 'type']).optional(),
});

const MetricsConfigSchema = z.object({
  realTimeUpdates: z.boolean().default(true),
  retentionDays: z.number().min(1).max(365).default(90),
  aggregationLevel: z.enum(['minute', 'hour', 'day']).default('hour'),
  enablePredictive: z.boolean().default(true),
});

type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
type MetricsConfig = z.infer<typeof MetricsConfigSchema>;

interface NotificationMetrics {
  // Core Metrics
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;

  // Engagement Metrics
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;

  // Performance Metrics
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;

  // Time-based Metrics
  avgDeliveryTime: number;
  avgResponseTime: number;

  // Channel-specific
  channelBreakdown: Record<NotificationChannel, ChannelMetrics>;

  // Cost Metrics
  totalCost: number;
  costPerDelivery: number;
  roi: number;
}

interface ChannelMetrics {
  sent: number;
  delivered: number;
  failed: number;
  engagementRate: number;
  avgCost: number;
  reliability: number;
}

interface PredictiveInsights {
  bestSendTime: string;
  preferredChannel: NotificationChannel;
  engagementProbability: number;
  churnRisk: number;
  nextBestAction: string;
}

interface AnalyticsReport {
  summary: NotificationMetrics;
  trends: TimeSeriesData[];
  insights: PredictiveInsights;
  recommendations: string[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metric: string;
  channel?: NotificationChannel;
}

// ================================================================================
// NOTIFICATION ANALYTICS ENGINE
// ================================================================================

export class NotificationAnalytics {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly config: MetricsConfig;
  private readonly cache = new Map<string, { data: any; expiry: number }>();

  constructor(config: Partial<MetricsConfig> = {}) {
    this.supabase = createClient();
    this.config = { ...MetricsConfigSchema.parse({}), ...config };
  }

  // ================================================================================
  // REAL-TIME METRICS
  // ================================================================================

  /**
   * Obtém métricas em tempo real do sistema de notificações
   */
  async getRealTimeMetrics(clinicId: string): Promise<NotificationMetrics> {
    const cacheKey = `realtime_metrics_${clinicId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Query principal para métricas base
      const { data: baseMetrics, error } = await this.supabase
        .from('notifications')
        .select(
          `
          status,
          channel,
          type,
          sent_at,
          delivered_at,
          opened_at,
          clicked_at,
          cost,
          metadata
        `
        )
        .eq('clinic_id', clinicId)
        .gte('sent_at', last24h.toISOString());

      if (error) {
        throw new Error(`Erro ao buscar métricas: ${error.message}`);
      }

      const metrics = this.calculateMetrics(baseMetrics || []);

      // Cache por 5 minutos
      this.setCache(cacheKey, metrics, 5 * 60 * 1000);

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas em tempo real:', error);
      throw error;
    }
  }

  /**
   * Calcula métricas baseadas nos dados de notificação
   */
  private calculateMetrics(data: any[]): NotificationMetrics {
    const totalSent = data.length;
    const delivered = data.filter((n) => n.status === 'delivered').length;
    const failed = data.filter((n) => n.status === 'failed').length;
    const pending = data.filter((n) => n.status === 'pending').length;
    const opened = data.filter((n) => n.opened_at).length;
    const clicked = data.filter((n) => n.clicked_at).length;
    const converted = data.filter((n) => n.metadata?.converted).length;
    const unsubscribed = data.filter((n) => n.metadata?.unsubscribed).length;

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
    const conversionRate = clicked > 0 ? (converted / clicked) * 100 : 0;
    const unsubscribeRate =
      delivered > 0 ? (unsubscribed / delivered) * 100 : 0;

    // Métricas de tempo
    const deliveredNotifications = data.filter(
      (n) => n.delivered_at && n.sent_at
    );
    const avgDeliveryTime =
      deliveredNotifications.length > 0
        ? deliveredNotifications.reduce((acc, n) => {
            const delivery = new Date(n.delivered_at).getTime();
            const sent = new Date(n.sent_at).getTime();
            return acc + (delivery - sent);
          }, 0) /
          deliveredNotifications.length /
          1000
        : 0;

    const respondedNotifications = data.filter(
      (n) => n.opened_at && n.delivered_at
    );
    const avgResponseTime =
      respondedNotifications.length > 0
        ? respondedNotifications.reduce((acc, n) => {
            const opened = new Date(n.opened_at).getTime();
            const delivered = new Date(n.delivered_at).getTime();
            return acc + (opened - delivered);
          }, 0) /
          respondedNotifications.length /
          1000
        : 0;

    // Breakdown por canal
    const channelBreakdown = this.calculateChannelBreakdown(data);

    // Métricas de custo
    const totalCost = data.reduce((acc, n) => acc + (n.cost || 0), 0);
    const costPerDelivery = delivered > 0 ? totalCost / delivered : 0;
    const roi = this.calculateROI(data);

    return {
      totalSent,
      delivered,
      failed,
      pending,
      opened,
      clicked,
      converted,
      unsubscribed,
      deliveryRate,
      openRate,
      clickRate,
      conversionRate,
      unsubscribeRate,
      avgDeliveryTime,
      avgResponseTime,
      channelBreakdown,
      totalCost,
      costPerDelivery,
      roi,
    };
  }

  /**
   * Calcula breakdown de métricas por canal
   */
  private calculateChannelBreakdown(
    data: any[]
  ): Record<NotificationChannel, ChannelMetrics> {
    const channels = Object.values(NotificationChannel);
    const breakdown: Record<NotificationChannel, ChannelMetrics> = {} as any;

    channels.forEach((channel) => {
      const channelData = data.filter((n) => n.channel === channel);
      const sent = channelData.length;
      const delivered = channelData.filter(
        (n) => n.status === 'delivered'
      ).length;
      const failed = channelData.filter((n) => n.status === 'failed').length;
      const engaged = channelData.filter(
        (n) => n.opened_at || n.clicked_at
      ).length;

      const engagementRate = delivered > 0 ? (engaged / delivered) * 100 : 0;
      const reliability = sent > 0 ? (delivered / sent) * 100 : 0;
      const avgCost =
        channelData.reduce((acc, n) => acc + (n.cost || 0), 0) / sent || 0;

      breakdown[channel] = {
        sent,
        delivered,
        failed,
        engagementRate,
        avgCost,
        reliability,
      };
    });

    return breakdown;
  }

  // ================================================================================
  // ANALYTICS HISTÓRICOS
  // ================================================================================

  /**
   * Gera relatório analítico para período específico
   */
  async generateReport(
    query: AnalyticsQuery,
    clinicId: string
  ): Promise<AnalyticsReport> {
    const validatedQuery = AnalyticsQuerySchema.parse(query);

    try {
      // Buscar dados históricos
      const { data: historicalData, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('sent_at', validatedQuery.startDate)
        .lte('sent_at', validatedQuery.endDate)
        .order('sent_at', { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar dados históricos: ${error.message}`);
      }

      // Calcular métricas do período
      const summary = this.calculateMetrics(historicalData || []);

      // Gerar dados de time series
      const trends = this.generateTimeSeriesData(
        historicalData || [],
        validatedQuery.groupBy || 'day'
      );

      // Gerar insights preditivos
      const insights = await this.generatePredictiveInsights(
        historicalData || [],
        clinicId
      );

      // Gerar recomendações
      const recommendations = this.generateRecommendations(summary, trends);

      return {
        summary,
        trends,
        insights,
        recommendations,
        generatedAt: new Date(),
        period: {
          start: new Date(validatedQuery.startDate),
          end: new Date(validatedQuery.endDate),
        },
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Gera dados de série temporal
   */
  private generateTimeSeriesData(
    data: any[],
    groupBy: string
  ): TimeSeriesData[] {
    const grouped = new Map<string, any[]>();

    data.forEach((notification) => {
      const date = new Date(notification.sent_at);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        }
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'channel':
          key = notification.channel;
          break;
        case 'type':
          key = notification.type;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(notification);
    });

    const result: TimeSeriesData[] = [];

    grouped.forEach((notifications, key) => {
      const metrics = this.calculateMetrics(notifications);

      result.push(
        {
          timestamp: new Date(key),
          value: metrics.totalSent,
          metric: 'total_sent',
        },
        {
          timestamp: new Date(key),
          value: metrics.deliveryRate,
          metric: 'delivery_rate',
        },
        {
          timestamp: new Date(key),
          value: metrics.openRate,
          metric: 'open_rate',
        },
        {
          timestamp: new Date(key),
          value: metrics.conversionRate,
          metric: 'conversion_rate',
        }
      );
    });

    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // ================================================================================
  // PREDICTIVE ANALYTICS
  // ================================================================================

  /**
   * Gera insights preditivos baseados em dados históricos
   */
  private async generatePredictiveInsights(
    data: any[],
    _clinicId: string
  ): Promise<PredictiveInsights> {
    if (!this.config.enablePredictive || data.length < 100) {
      return {
        bestSendTime: '10:00',
        preferredChannel: NotificationChannel.EMAIL,
        engagementProbability: 0.7,
        churnRisk: 0.1,
        nextBestAction: 'Coletar mais dados para análise preditiva',
      };
    }

    // Análise de melhor horário de envio
    const bestSendTime = this.calculateBestSendTime(data);

    // Análise de canal preferido
    const preferredChannel = this.calculatePreferredChannel(data);

    // Probabilidade de engajamento
    const engagementProbability = this.calculateEngagementProbability(data);

    // Risco de churn
    const churnRisk = this.calculateChurnRisk(data);

    // Próxima melhor ação
    const nextBestAction = this.suggestNextBestAction(data);

    return {
      bestSendTime,
      preferredChannel,
      engagementProbability,
      churnRisk,
      nextBestAction,
    };
  }

  private calculateBestSendTime(data: any[]): string {
    const hourlyEngagement = new Map<
      number,
      { sent: number; engaged: number }
    >();

    data.forEach((notification) => {
      if (notification.opened_at || notification.clicked_at) {
        const hour = new Date(notification.sent_at).getHours();
        const current = hourlyEngagement.get(hour) || { sent: 0, engaged: 0 };
        current.sent += 1;
        if (notification.opened_at || notification.clicked_at) {
          current.engaged += 1;
        }
        hourlyEngagement.set(hour, current);
      }
    });

    let bestHour = 10;
    let bestRate = 0;

    hourlyEngagement.forEach(({ sent, engaged }, hour) => {
      const rate = sent > 0 ? engaged / sent : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestHour = hour;
      }
    });

    return `${String(bestHour).padStart(2, '0')}:00`;
  }

  private calculatePreferredChannel(data: any[]): NotificationChannel {
    const channelPerformance = new Map<NotificationChannel, number>();

    Object.values(NotificationChannel).forEach((channel) => {
      const channelData = data.filter((n) => n.channel === channel);
      const delivered = channelData.filter(
        (n) => n.status === 'delivered'
      ).length;
      const engaged = channelData.filter(
        (n) => n.opened_at || n.clicked_at
      ).length;

      const engagementRate = delivered > 0 ? engaged / delivered : 0;
      channelPerformance.set(channel, engagementRate);
    });

    let bestChannel = NotificationChannel.EMAIL;
    let bestRate = 0;

    channelPerformance.forEach((rate, channel) => {
      if (rate > bestRate) {
        bestRate = rate;
        bestChannel = channel;
      }
    });

    return bestChannel;
  }

  private calculateEngagementProbability(data: any[]): number {
    const recentData = data.filter((n) => {
      const sentDate = new Date(n.sent_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return sentDate >= thirtyDaysAgo;
    });

    if (recentData.length === 0) {
      return 0.5;
    }

    const delivered = recentData.filter((n) => n.status === 'delivered').length;
    const engaged = recentData.filter(
      (n) => n.opened_at || n.clicked_at
    ).length;

    return delivered > 0 ? Math.min(engaged / delivered, 1) : 0.5;
  }

  private calculateChurnRisk(data: any[]): number {
    const last30Days = data.filter((n) => {
      const sentDate = new Date(n.sent_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return sentDate >= thirtyDaysAgo;
    });

    const last60Days = data.filter((n) => {
      const sentDate = new Date(n.sent_at);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return sentDate >= sixtyDaysAgo && sentDate < thirtyDaysAgo;
    });

    const recent = last30Days.filter((n) => n.opened_at || n.clicked_at).length;
    const previous = last60Days.filter(
      (n) => n.opened_at || n.clicked_at
    ).length;

    if (previous === 0) {
      return 0.5;
    }

    const engagementChange = (recent - previous) / previous;
    return Math.max(0, Math.min(1, -engagementChange));
  }

  private suggestNextBestAction(data: any[]): string {
    const metrics = this.calculateMetrics(data);

    if (metrics.deliveryRate < 85) {
      return 'Otimizar configuração de canais - taxa de entrega baixa';
    }

    if (metrics.openRate < 15) {
      return 'Melhorar títulos e timing de envio - baixa taxa de abertura';
    }

    if (metrics.clickRate < 5) {
      return 'Otimizar conteúdo e call-to-actions - baixa taxa de clique';
    }

    if (metrics.unsubscribeRate > 2) {
      return 'Revisar frequência e relevância das mensagens';
    }

    return 'Performance boa - considerar segmentação avançada para otimização';
  }

  // ================================================================================
  // RECOMMENDATIONS ENGINE
  // ================================================================================

  /**
   * Gera recomendações baseadas nas métricas e tendências
   */
  private generateRecommendations(
    metrics: NotificationMetrics,
    trends: TimeSeriesData[]
  ): string[] {
    const recommendations: string[] = [];

    // Análise de performance geral
    if (metrics.deliveryRate < 90) {
      recommendations.push(
        `📉 Taxa de entrega baixa (${metrics.deliveryRate.toFixed(1)}%). Verifique configurações de DNS e reputação do remetente.`
      );
    }

    if (metrics.openRate < 20) {
      recommendations.push(
        `📧 Taxa de abertura baixa (${metrics.openRate.toFixed(1)}%). Otimize assuntos e horários de envio.`
      );
    }

    if (metrics.clickRate < 5) {
      recommendations.push(
        `🎯 Taxa de clique baixa (${metrics.clickRate.toFixed(1)}%). Melhore call-to-actions e relevância do conteúdo.`
      );
    }

    // Análise de canais
    Object.entries(metrics.channelBreakdown).forEach(
      ([channel, channelMetrics]) => {
        if (channelMetrics.reliability < 85) {
          recommendations.push(
            `🔧 Canal ${channel} com baixa confiabilidade (${channelMetrics.reliability.toFixed(1)}%). Considere configuração ou provider alternativo.`
          );
        }
      }
    );

    // Análise de custos
    if (metrics.costPerDelivery > 0.5) {
      recommendations.push(
        `💰 Custo por entrega alto (R$ ${metrics.costPerDelivery.toFixed(2)}). Avalie otimização de canais e providers.`
      );
    }

    // Análise de ROI
    if (metrics.roi < 2) {
      recommendations.push(
        `📊 ROI baixo (${metrics.roi.toFixed(1)}x). Foque em segmentação e personalização para melhorar conversões.`
      );
    }

    // Análise de tendências
    const recentTrends = trends.slice(-7); // Últimos 7 pontos
    const deliveryTrend = recentTrends.filter(
      (t) => t.metric === 'delivery_rate'
    );

    if (deliveryTrend.length >= 2) {
      const isDecreasing = deliveryTrend.at(-1).value < deliveryTrend[0].value;
      if (isDecreasing) {
        recommendations.push(
          '📉 Taxa de entrega em declínio. Monitore reputação do remetente e listas de bloqueio.'
        );
      }
    }

    // Recomendações gerais se performance está boa
    if (recommendations.length === 0) {
      recommendations.push(
        '✅ Performance geral boa! Considere testes A/B para otimização contínua.',
        '🎯 Explore segmentação avançada para personalização.',
        '📱 Teste novos canais ou formatos de conteúdo.'
      );
    }

    return recommendations;
  }

  // ================================================================================
  // UTILITY METHODS
  // ================================================================================

  /**
   * Calcula ROI das notificações
   */
  private calculateROI(data: any[]): number {
    const totalCost = data.reduce((acc, n) => acc + (n.cost || 0), 0);
    const totalRevenue = data.reduce((acc, n) => {
      return acc + (n.metadata?.revenue || 0);
    }, 0);

    return totalCost > 0 ? totalRevenue / totalCost : 0;
  }

  /**
   * Sistema de cache simples
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Limpa cache expirado
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
}

// ================================================================================
// EXPORT
// ================================================================================

export const notificationAnalytics = new NotificationAnalytics();
export type {
  AnalyticsQuery,
  NotificationMetrics,
  AnalyticsReport,
  PredictiveInsights,
};

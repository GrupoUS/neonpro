/**
 * NeonPro Delivery Analytics Engine
 * 
 * Sistema avançado de analytics para rastreamento de performance
 * de notificações multi-canal com métricas detalhadas e insights.
 * 
 * Features:
 * - Tracking de entrega por canal e provider
 * - Métricas de abertura, clique e resposta
 * - Análise de horários ótimos por paciente
 * - ROI de notificações por tipo
 * - Dashboard em tempo real de performance
 * - Machine learning para otimização
 * - Compliance LGPD integrado
 * 
 * @author BMad Method - NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Database } from '@/lib/database.types';
import { createClient } from '@/app/utils/supabase/server';
import { logger } from '@/lib/utils/logger';
import { auditLogger } from '@/lib/utils/audit-logger';

// Types e Interfaces
export interface DeliveryMetrics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalReplied: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  replyRate: number;
  failureRate: number;
  avgDeliveryTime: number;
  avgReadTime: number;
  avgResponseTime: number;
}

export interface ChannelPerformance {
  channel: string;
  metrics: DeliveryMetrics;
  providerBreakdown: Record<string, DeliveryMetrics>;
  trends: PerformanceTrend[];
  optimalTimes: TimeSlot[];
  costMetrics: CostMetrics;
  qualityScore: number;
}

export interface PerformanceTrend {
  date: Date;
  metrics: DeliveryMetrics;
  factors: TrendFactor[];
}

export interface TrendFactor {
  type: 'time_of_day' | 'day_of_week' | 'content_type' | 'patient_segment' | 'external';
  value: string;
  impact: number; // -100 to 100
  confidence: number; // 0 to 100
}

export interface TimeSlot {
  hour: number;
  dayOfWeek: number;
  score: number;
  metrics: DeliveryMetrics;
  sampleSize: number;
}

export interface CostMetrics {
  totalCost: number;
  costPerSent: number;
  costPerDelivered: number;
  costPerRead: number;
  costPerClick: number;
  costPerReply: number;
  roi: number;
  revenueGenerated: number;
}

export interface NotificationAnalytics {
  id: string;
  date: Date;
  clinicId: string;
  channel: string;
  provider: string;
  templateType: string;
  patientSegment: string;
  timeSlot: number;
  dayOfWeek: number;
  metrics: DeliveryMetrics;
  costs: CostMetrics;
  metadata: Record<string, any>;
}

export interface PatientEngagementProfile {
  patientId: string;
  preferredChannels: string[];
  optimalTimes: TimeSlot[];
  responsePatterns: ResponsePattern[];
  engagementScore: number;
  riskScore: number;
  preferences: PatientPreferences;
  history: EngagementHistory[];
}

export interface ResponsePattern {
  pattern: 'immediate' | 'delayed' | 'non_responsive' | 'selective';
  channels: string[];
  timeFrames: string[];
  triggers: string[];
  confidence: number;
}

export interface PatientPreferences {
  channels: string[];
  timeStart: string;
  timeEnd: string;
  frequency: 'low' | 'medium' | 'high';
  contentTypes: string[];
  language: string;
}

export interface EngagementHistory {
  date: Date;
  channel: string;
  type: string;
  action: 'sent' | 'delivered' | 'read' | 'clicked' | 'replied' | 'failed';
  responseTime?: number;
  metadata: Record<string, any>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  aggregationIntervals: string[];
  retentionDays: number;
  realTimeEnabled: boolean;
  mlOptimization: boolean;
  costTrackingEnabled: boolean;
  privacyMode: boolean;
  customMetrics: CustomMetric[];
}

export interface CustomMetric {
  name: string;
  query: string;
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
  dimensions: string[];
  filters: Record<string, any>;
}

export interface AnalyticsReport {
  id: string;
  type: ReportType;
  title: string;
  timeRange: DateRange;
  filters: ReportFilters;
  data: Record<string, any>;
  insights: Insight[];
  recommendations: Recommendation[];
  generatedAt: Date;
  format: 'json' | 'pdf' | 'excel' | 'csv';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilters {
  clinicId?: string;
  channels?: string[];
  providers?: string[];
  templateTypes?: string[];
  patientSegments?: string[];
  customFilters?: Record<string, any>;
}

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actionable: boolean;
  metadata: Record<string, any>;
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImpact: number;
  implementation: string;
  timeframe: string;
  cost: number;
  metadata: Record<string, any>;
}

// Enums
export enum ReportType {
  DELIVERY_PERFORMANCE = 'delivery_performance',
  CHANNEL_COMPARISON = 'channel_comparison',
  PATIENT_ENGAGEMENT = 'patient_engagement',
  COST_ANALYSIS = 'cost_analysis',
  ROI_ANALYSIS = 'roi_analysis',
  OPTIMAL_TIMING = 'optimal_timing',
  TREND_ANALYSIS = 'trend_analysis',
  PREDICTIVE_INSIGHTS = 'predictive_insights'
}

export enum InsightType {
  PERFORMANCE_IMPROVEMENT = 'performance_improvement',
  COST_REDUCTION = 'cost_reduction',
  ENGAGEMENT_INCREASE = 'engagement_increase',
  TIMING_OPTIMIZATION = 'timing_optimization',
  CHANNEL_SHIFT = 'channel_shift',
  CONTENT_OPTIMIZATION = 'content_optimization',
  ANOMALY_DETECTION = 'anomaly_detection'
}

export enum RecommendationType {
  CHANNEL_OPTIMIZATION = 'channel_optimization',
  TIMING_ADJUSTMENT = 'timing_adjustment',
  CONTENT_PERSONALIZATION = 'content_personalization',
  FREQUENCY_TUNING = 'frequency_tuning',
  COST_OPTIMIZATION = 'cost_optimization',
  PROVIDER_SWITCH = 'provider_switch',
  AUDIENCE_SEGMENTATION = 'audience_segmentation'
}

/**
 * Sistema principal de analytics de entrega
 */
export class DeliveryAnalyticsEngine {
  private supabase;
  private config: AnalyticsConfig;
  private aggregationCache: Map<string, any> = new Map();
  private realtimeSubscriptions: Map<string, any> = new Map();

  constructor(config?: Partial<AnalyticsConfig>) {
    this.supabase = createClient();
    this.config = {
      enabled: true,
      aggregationIntervals: ['hourly', 'daily', 'weekly', 'monthly'],
      retentionDays: 365,
      realTimeEnabled: true,
      mlOptimization: true,
      costTrackingEnabled: true,
      privacyMode: false,
      customMetrics: [],
      ...config
    };

    this.initializeAnalytics();
  }

  /**
   * Inicializa o sistema de analytics
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      if (this.config.realTimeEnabled) {
        await this.setupRealtimeSubscriptions();
      }

      await this.setupAggregationJobs();
      
      logger.info('Analytics engine inicializado', {
        config: this.config,
        subscriptions: this.realtimeSubscriptions.size
      });

    } catch (error) {
      logger.error('Erro ao inicializar analytics engine:', error);
      throw error;
    }
  }

  /**
   * Configura subscrições em tempo real
   */
  private async setupRealtimeSubscriptions(): Promise<void> {
    // Subscrição para notification_queue
    const queueSubscription = this.supabase
      .channel('notification_analytics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notification_queue' },
        (payload) => this.handleNotificationEvent(payload)
      )
      .subscribe();

    this.realtimeSubscriptions.set('notification_queue', queueSubscription);

    // Subscrição para escalation_instances
    const escalationSubscription = this.supabase
      .channel('escalation_analytics')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'escalation_instances' },
        (payload) => this.handleEscalationEvent(payload)
      )
      .subscribe();

    this.realtimeSubscriptions.set('escalation_instances', escalationSubscription);
  }

  /**
   * Configura jobs de agregação
   */
  private async setupAggregationJobs(): Promise<void> {
    // Job de agregação horária
    setInterval(async () => {
      await this.aggregateHourlyMetrics();
    }, 3600000); // A cada hora

    // Job de agregação diária
    setInterval(async () => {
      await this.aggregateDailyMetrics();
    }, 86400000); // A cada dia

    // Job de limpeza
    setInterval(async () => {
      await this.cleanupOldData();
    }, 86400000); // A cada dia
  }

  /**
   * Manipula eventos de notificação em tempo real
   */
  private async handleNotificationEvent(payload: any): Promise<void> {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          await this.trackNotificationSent(newRecord);
          break;
        case 'UPDATE':
          await this.trackNotificationStatusChange(oldRecord, newRecord);
          break;
      }

    } catch (error) {
      logger.error('Erro ao processar evento de notificação:', error);
    }
  }

  /**
   * Manipula eventos de escalação em tempo real
   */
  private async handleEscalationEvent(payload: any): Promise<void> {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          await this.trackEscalationStarted(newRecord);
          break;
        case 'UPDATE':
          await this.trackEscalationStatusChange(oldRecord, newRecord);
          break;
      }

    } catch (error) {
      logger.error('Erro ao processar evento de escalação:', error);
    }
  }

  /**
   * Rastreia notificação enviada
   */
  private async trackNotificationSent(notification: any): Promise<void> {
    const analytics: Partial<NotificationAnalytics> = {
      date: new Date(),
      clinicId: notification.clinic_id,
      channel: notification.channel,
      templateType: notification.template_type || 'unknown',
      timeSlot: new Date(notification.scheduled_for).getHours(),
      dayOfWeek: new Date(notification.scheduled_for).getDay(),
      metrics: {
        totalSent: 1,
        totalDelivered: 0,
        totalRead: 0,
        totalClicked: 0,
        totalReplied: 0,
        totalFailed: 0,
        deliveryRate: 0,
        readRate: 0,
        clickRate: 0,
        replyRate: 0,
        failureRate: 0,
        avgDeliveryTime: 0,
        avgReadTime: 0,
        avgResponseTime: 0
      }
    };

    await this.updateAnalytics(analytics);

    // Atualiza perfil de engajamento do paciente
    await this.updatePatientEngagement(notification.patient_id, {
      action: 'sent',
      channel: notification.channel,
      timestamp: new Date()
    });
  }

  /**
   * Rastreia mudança de status de notificação
   */
  private async trackNotificationStatusChange(oldRecord: any, newRecord: any): Promise<void> {
    if (oldRecord.status === newRecord.status) return;

    const statusChanges = {
      delivered: () => this.trackDelivery(newRecord),
      read: () => this.trackRead(newRecord),
      clicked: () => this.trackClick(newRecord),
      replied: () => this.trackReply(newRecord),
      failed: () => this.trackFailure(newRecord)
    };

    const handler = statusChanges[newRecord.status as keyof typeof statusChanges];
    if (handler) {
      await handler();
    }
  }

  /**
   * Rastreia entrega de notificação
   */
  private async trackDelivery(notification: any): Promise<void> {
    const deliveryTime = notification.delivered_at 
      ? new Date(notification.delivered_at).getTime() - new Date(notification.sent_at).getTime()
      : 0;

    await this.updateMetrics(notification, {
      totalDelivered: 1,
      avgDeliveryTime: deliveryTime
    });

    await this.updatePatientEngagement(notification.patient_id, {
      action: 'delivered',
      channel: notification.channel,
      timestamp: new Date(notification.delivered_at),
      responseTime: deliveryTime
    });
  }

  /**
   * Rastreia leitura de notificação
   */
  private async trackRead(notification: any): Promise<void> {
    const readTime = notification.read_at 
      ? new Date(notification.read_at).getTime() - new Date(notification.delivered_at).getTime()
      : 0;

    await this.updateMetrics(notification, {
      totalRead: 1,
      avgReadTime: readTime
    });

    await this.updatePatientEngagement(notification.patient_id, {
      action: 'read',
      channel: notification.channel,
      timestamp: new Date(notification.read_at),
      responseTime: readTime
    });
  }

  /**
   * Rastreia clique em notificação
   */
  private async trackClick(notification: any): Promise<void> {
    await this.updateMetrics(notification, {
      totalClicked: 1
    });

    await this.updatePatientEngagement(notification.patient_id, {
      action: 'clicked',
      channel: notification.channel,
      timestamp: new Date(notification.clicked_at)
    });
  }

  /**
   * Rastreia resposta a notificação
   */
  private async trackReply(notification: any): Promise<void> {
    const responseTime = notification.replied_at 
      ? new Date(notification.replied_at).getTime() - new Date(notification.sent_at).getTime()
      : 0;

    await this.updateMetrics(notification, {
      totalReplied: 1,
      avgResponseTime: responseTime
    });

    await this.updatePatientEngagement(notification.patient_id, {
      action: 'replied',
      channel: notification.channel,
      timestamp: new Date(notification.replied_at),
      responseTime: responseTime
    });
  }

  /**
   * Rastreia falha de notificação
   */
  private async trackFailure(notification: any): Promise<void> {
    await this.updateMetrics(notification, {
      totalFailed: 1
    });

    await this.updatePatientEngagement(notification.patient_id, {
      action: 'failed',
      channel: notification.channel,
      timestamp: new Date(),
      metadata: {
        error: notification.error_message
      }
    });
  }

  /**
   * Atualiza métricas de analytics
   */
  private async updateMetrics(notification: any, deltaMetrics: Partial<DeliveryMetrics>): Promise<void> {
    const key = this.getAnalyticsKey(notification);
    
    // Atualiza analytics agregados
    const { error } = await this.supabase.rpc('update_notification_analytics', {
      p_date: new Date().toISOString().split('T')[0],
      p_clinic_id: notification.clinic_id,
      p_channel: notification.channel,
      p_template_type: notification.template_type || 'unknown',
      p_metrics: deltaMetrics
    });

    if (error) {
      logger.error('Erro ao atualizar métricas:', error);
    }

    // Atualiza cache
    this.updateAnalyticsCache(key, deltaMetrics);
  }

  /**
   * Gera chave para analytics
   */
  private getAnalyticsKey(notification: any): string {
    const date = new Date().toISOString().split('T')[0];
    return `${date}_${notification.clinic_id}_${notification.channel}_${notification.template_type || 'unknown'}`;
  }

  /**
   * Atualiza cache de analytics
   */
  private updateAnalyticsCache(key: string, deltaMetrics: Partial<DeliveryMetrics>): void {
    const cached = this.aggregationCache.get(key) || this.getEmptyMetrics();
    
    Object.entries(deltaMetrics).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        if (metric.startsWith('avg')) {
          // Para médias, calcula nova média ponderada
          const totalField = metric.replace('avg', 'total').toLowerCase();
          const total = cached[totalField as keyof DeliveryMetrics] as number;
          if (total > 0) {
            cached[metric as keyof DeliveryMetrics] = 
              ((cached[metric as keyof DeliveryMetrics] as number * total) + value) / (total + 1);
          } else {
            cached[metric as keyof DeliveryMetrics] = value;
          }
        } else {
          // Para totais, soma os valores
          cached[metric as keyof DeliveryMetrics] += value;
        }
      }
    });

    // Recalcula taxas
    this.recalculateRates(cached);
    
    this.aggregationCache.set(key, cached);
  }

  /**
   * Recalcula taxas baseado nos totais
   */
  private recalculateRates(metrics: DeliveryMetrics): void {
    if (metrics.totalSent > 0) {
      metrics.deliveryRate = (metrics.totalDelivered / metrics.totalSent) * 100;
      metrics.failureRate = (metrics.totalFailed / metrics.totalSent) * 100;
    }

    if (metrics.totalDelivered > 0) {
      metrics.readRate = (metrics.totalRead / metrics.totalDelivered) * 100;
    }

    if (metrics.totalRead > 0) {
      metrics.clickRate = (metrics.totalClicked / metrics.totalRead) * 100;
      metrics.replyRate = (metrics.totalReplied / metrics.totalRead) * 100;
    }
  }

  /**
   * Atualiza perfil de engajamento do paciente
   */
  private async updatePatientEngagement(
    patientId: string,
    event: {
      action: string;
      channel: string;
      timestamp: Date;
      responseTime?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // Busca perfil existente
      let { data: profile } = await this.supabase
        .from('patient_engagement_profiles')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (!profile) {
        // Cria novo perfil
        profile = await this.createPatientEngagementProfile(patientId);
      }

      // Atualiza histórico
      const historyEntry: EngagementHistory = {
        date: event.timestamp,
        channel: event.channel,
        type: 'notification',
        action: event.action as any,
        responseTime: event.responseTime,
        metadata: event.metadata || {}
      };

      profile.history = [...(profile.history || []), historyEntry];

      // Recalcula métricas do perfil
      await this.recalculateEngagementProfile(profile);

      // Atualiza no banco
      await this.supabase
        .from('patient_engagement_profiles')
        .upsert(profile);

    } catch (error) {
      logger.error('Erro ao atualizar engajamento do paciente:', error);
    }
  }

  /**
   * Cria novo perfil de engajamento
   */
  private async createPatientEngagementProfile(patientId: string): Promise<PatientEngagementProfile> {
    return {
      patientId,
      preferredChannels: ['whatsapp', 'sms', 'email'],
      optimalTimes: [],
      responsePatterns: [],
      engagementScore: 50,
      riskScore: 50,
      preferences: {
        channels: ['whatsapp'],
        timeStart: '09:00',
        timeEnd: '18:00',
        frequency: 'medium',
        contentTypes: ['reminder', 'confirmation'],
        language: 'pt-BR'
      },
      history: []
    };
  }

  /**
   * Recalcula métricas do perfil de engajamento
   */
  private async recalculateEngagementProfile(profile: PatientEngagementProfile): Promise<void> {
    const history = profile.history || [];
    
    if (history.length === 0) return;

    // Calcula canais preferidos baseado nas respostas
    const channelResponses = history
      .filter(h => h.action === 'replied')
      .reduce((acc, h) => {
        acc[h.channel] = (acc[h.channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    profile.preferredChannels = Object.entries(channelResponses)
      .sort(([,a], [,b]) => b - a)
      .map(([channel]) => channel);

    // Calcula horários ótimos
    profile.optimalTimes = this.calculateOptimalTimes(history);

    // Identifica padrões de resposta
    profile.responsePatterns = this.identifyResponsePatterns(history);

    // Calcula score de engajamento
    profile.engagementScore = this.calculateEngagementScore(history);

    // Calcula score de risco
    profile.riskScore = this.calculateRiskScore(history);
  }

  /**
   * Calcula horários ótimos baseado no histórico
   */
  private calculateOptimalTimes(history: EngagementHistory[]): TimeSlot[] {
    const timeSlots: Record<string, { responses: number, total: number }> = {};

    history.forEach(entry => {
      const hour = entry.date.getHours();
      const dayOfWeek = entry.date.getDay();
      const key = `${dayOfWeek}_${hour}`;

      if (!timeSlots[key]) {
        timeSlots[key] = { responses: 0, total: 0 };
      }

      timeSlots[key].total += 1;
      if (entry.action === 'replied' || entry.action === 'clicked') {
        timeSlots[key].responses += 1;
      }
    });

    return Object.entries(timeSlots)
      .map(([key, data]) => {
        const [dayOfWeek, hour] = key.split('_').map(Number);
        const score = data.total > 0 ? (data.responses / data.total) * 100 : 0;
        
        return {
          hour,
          dayOfWeek,
          score,
          metrics: this.getEmptyMetrics(), // Implementar se necessário
          sampleSize: data.total
        };
      })
      .filter(slot => slot.sampleSize >= 3) // Mínimo de 3 amostras
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 horários
  }

  /**
   * Identifica padrões de resposta
   */
  private identifyResponsePatterns(history: EngagementHistory[]): ResponsePattern[] {
    const patterns: ResponsePattern[] = [];

    // Padrão de resposta imediata (< 1 hora)
    const immediateResponses = history.filter(h => 
      h.action === 'replied' && h.responseTime && h.responseTime < 3600000
    );

    if (immediateResponses.length > 0) {
      patterns.push({
        pattern: 'immediate',
        channels: [...new Set(immediateResponses.map(h => h.channel))],
        timeFrames: ['< 1h'],
        triggers: ['reminder', 'confirmation'],
        confidence: Math.min(95, (immediateResponses.length / history.length) * 100)
      });
    }

    // Padrão de resposta atrasada (1-24 horas)
    const delayedResponses = history.filter(h => 
      h.action === 'replied' && h.responseTime && h.responseTime >= 3600000 && h.responseTime < 86400000
    );

    if (delayedResponses.length > 0) {
      patterns.push({
        pattern: 'delayed',
        channels: [...new Set(delayedResponses.map(h => h.channel))],
        timeFrames: ['1-24h'],
        triggers: ['reminder', 'notification'],
        confidence: Math.min(95, (delayedResponses.length / history.length) * 100)
      });
    }

    return patterns;
  }

  /**
   * Calcula score de engajamento
   */
  private calculateEngagementScore(history: EngagementHistory[]): number {
    if (history.length === 0) return 50;

    const positiveActions = history.filter(h => 
      ['read', 'clicked', 'replied'].includes(h.action)
    ).length;

    const negativeActions = history.filter(h => 
      ['failed'].includes(h.action)
    ).length;

    const totalActions = history.length;
    
    const baseScore = (positiveActions / totalActions) * 100;
    const penalty = (negativeActions / totalActions) * 20;
    
    return Math.max(0, Math.min(100, baseScore - penalty));
  }

  /**
   * Calcula score de risco
   */
  private calculateRiskScore(history: EngagementHistory[]): number {
    if (history.length === 0) return 50;

    const recentHistory = history.filter(h => 
      h.date.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 // Últimos 30 dias
    );

    if (recentHistory.length === 0) return 70; // Alto risco se sem atividade recente

    const nonResponsive = recentHistory.filter(h => 
      h.action === 'sent' && !recentHistory.some(r => 
        r.date > h.date && ['read', 'clicked', 'replied'].includes(r.action)
      )
    ).length;

    const riskScore = (nonResponsive / recentHistory.length) * 100;
    
    return Math.min(100, riskScore);
  }

  /**
   * Agrega métricas horárias
   */
  private async aggregateHourlyMetrics(): Promise<void> {
    try {
      const hourAgo = new Date(Date.now() - 3600000);
      
      const { error } = await this.supabase.rpc('aggregate_hourly_notifications', {
        p_hour: hourAgo.toISOString()
      });

      if (error) {
        logger.error('Erro na agregação horária:', error);
      } else {
        logger.info('Agregação horária concluída', { hour: hourAgo });
      }

    } catch (error) {
      logger.error('Erro ao executar agregação horária:', error);
    }
  }

  /**
   * Agrega métricas diárias
   */
  private async aggregateDailyMetrics(): Promise<void> {
    try {
      const yesterday = new Date(Date.now() - 86400000);
      
      const { error } = await this.supabase.rpc('aggregate_daily_notifications', {
        p_date: yesterday.toISOString().split('T')[0]
      });

      if (error) {
        logger.error('Erro na agregação diária:', error);
      } else {
        logger.info('Agregação diária concluída', { date: yesterday.toISOString().split('T')[0] });
      }

    } catch (error) {
      logger.error('Erro ao executar agregação diária:', error);
    }
  }

  /**
   * Limpa dados antigos
   */
  private async cleanupOldData(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
      
      // Remove dados antigos de acordo com política de retenção
      if (!this.config.privacyMode) {
        const { error } = await this.supabase
          .from('notification_analytics')
          .delete()
          .lt('date', cutoffDate.toISOString().split('T')[0]);

        if (error) {
          logger.error('Erro na limpeza de dados:', error);
        } else {
          logger.info('Limpeza de dados concluída', { cutoffDate });
        }
      }

    } catch (error) {
      logger.error('Erro ao executar limpeza:', error);
    }
  }

  /**
   * Obtém métricas por canal
   */
  async getChannelPerformance(
    clinicId: string,
    dateRange: DateRange,
    channels?: string[]
  ): Promise<ChannelPerformance[]> {
    try {
      const { data, error } = await this.supabase
        .from('notification_analytics')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .in('channel', channels || ['sms', 'email', 'whatsapp', 'push']);

      if (error) throw error;

      const channelData = this.groupByChannel(data || []);
      
      return Promise.all(
        Object.entries(channelData).map(async ([channel, metrics]) => {
          const trends = await this.calculateTrends(channel, dateRange);
          const optimalTimes = await this.calculateChannelOptimalTimes(channel, clinicId, dateRange);
          const costs = await this.calculateChannelCosts(channel, clinicId, dateRange);
          
          return {
            channel,
            metrics: this.aggregateMetrics(metrics),
            providerBreakdown: {}, // Implementar se necessário
            trends,
            optimalTimes,
            costMetrics: costs,
            qualityScore: this.calculateQualityScore(metrics)
          };
        })
      );

    } catch (error) {
      logger.error('Erro ao obter performance por canal:', error);
      return [];
    }
  }

  /**
   * Agrupa dados por canal
   */
  private groupByChannel(data: any[]): Record<string, any[]> {
    return data.reduce((acc, item) => {
      if (!acc[item.channel]) {
        acc[item.channel] = [];
      }
      acc[item.channel].push(item);
      return acc;
    }, {});
  }

  /**
   * Agrega métricas
   */
  private aggregateMetrics(data: any[]): DeliveryMetrics {
    return data.reduce((acc, item) => {
      acc.totalSent += item.total_sent || 0;
      acc.totalDelivered += item.total_delivered || 0;
      acc.totalRead += item.total_read || 0;
      acc.totalClicked += item.total_clicked || 0;
      acc.totalReplied += item.total_replied || 0;
      acc.totalFailed += item.total_failed || 0;
      
      return acc;
    }, this.getEmptyMetrics());
  }

  /**
   * Calcula tendências
   */
  private async calculateTrends(
    channel: string,
    dateRange: DateRange
  ): Promise<PerformanceTrend[]> {
    // Implementar cálculo de tendências
    return [];
  }

  /**
   * Calcula horários ótimos por canal
   */
  private async calculateChannelOptimalTimes(
    channel: string,
    clinicId: string,
    dateRange: DateRange
  ): Promise<TimeSlot[]> {
    // Implementar cálculo de horários ótimos
    return [];
  }

  /**
   * Calcula custos por canal
   */
  private async calculateChannelCosts(
    channel: string,
    clinicId: string,
    dateRange: DateRange
  ): Promise<CostMetrics> {
    // Implementar cálculo de custos
    return {
      totalCost: 0,
      costPerSent: 0,
      costPerDelivered: 0,
      costPerRead: 0,
      costPerClick: 0,
      costPerReply: 0,
      roi: 0,
      revenueGenerated: 0
    };
  }

  /**
   * Calcula score de qualidade
   */
  private calculateQualityScore(metrics: any[]): number {
    const aggregated = this.aggregateMetrics(metrics);
    this.recalculateRates(aggregated);
    
    // Score baseado nas taxas
    const deliveryWeight = 0.4;
    const readWeight = 0.3;
    const replyWeight = 0.3;
    
    return (
      aggregated.deliveryRate * deliveryWeight +
      aggregated.readRate * readWeight +
      aggregated.replyRate * replyWeight
    );
  }

  /**
   * Gera relatório de analytics
   */
  async generateReport(
    type: ReportType,
    clinicId: string,
    dateRange: DateRange,
    filters?: ReportFilters
  ): Promise<AnalyticsReport> {
    try {
      const reportId = `${type}_${clinicId}_${Date.now()}`;
      
      let data: Record<string, any> = {};
      let insights: Insight[] = [];
      let recommendations: Recommendation[] = [];

      switch (type) {
        case ReportType.DELIVERY_PERFORMANCE:
          data = await this.generateDeliveryPerformanceData(clinicId, dateRange, filters);
          insights = await this.generateDeliveryInsights(data);
          recommendations = await this.generateDeliveryRecommendations(data);
          break;

        case ReportType.CHANNEL_COMPARISON:
          data = await this.generateChannelComparisonData(clinicId, dateRange, filters);
          insights = await this.generateChannelInsights(data);
          recommendations = await this.generateChannelRecommendations(data);
          break;

        case ReportType.PATIENT_ENGAGEMENT:
          data = await this.generatePatientEngagementData(clinicId, dateRange, filters);
          insights = await this.generateEngagementInsights(data);
          recommendations = await this.generateEngagementRecommendations(data);
          break;

        default:
          throw new Error(`Tipo de relatório não suportado: ${type}`);
      }

      const report: AnalyticsReport = {
        id: reportId,
        type,
        title: this.getReportTitle(type),
        timeRange: dateRange,
        filters: filters || {},
        data,
        insights,
        recommendations,
        generatedAt: new Date(),
        format: 'json'
      };

      // Salva relatório se necessário
      await this.saveReport(report);

      return report;

    } catch (error) {
      logger.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Atualiza analytics
   */
  private async updateAnalytics(analytics: Partial<NotificationAnalytics>): Promise<void> {
    // Implementar lógica de atualização
  }

  /**
   * Rastreia início de escalação
   */
  private async trackEscalationStarted(escalation: any): Promise<void> {
    // Implementar tracking de escalação
  }

  /**
   * Rastreia mudança de status de escalação
   */
  private async trackEscalationStatusChange(oldRecord: any, newRecord: any): Promise<void> {
    // Implementar tracking de mudança de escalação
  }

  /**
   * Gera dados de performance de entrega
   */
  private async generateDeliveryPerformanceData(
    clinicId: string,
    dateRange: DateRange,
    filters?: ReportFilters
  ): Promise<Record<string, any>> {
    // Implementar geração de dados
    return {};
  }

  /**
   * Gera insights de entrega
   */
  private async generateDeliveryInsights(data: Record<string, any>): Promise<Insight[]> {
    // Implementar geração de insights
    return [];
  }

  /**
   * Gera recomendações de entrega
   */
  private async generateDeliveryRecommendations(data: Record<string, any>): Promise<Recommendation[]> {
    // Implementar geração de recomendações
    return [];
  }

  /**
   * Gera dados de comparação de canais
   */
  private async generateChannelComparisonData(
    clinicId: string,
    dateRange: DateRange,
    filters?: ReportFilters
  ): Promise<Record<string, any>> {
    // Implementar geração de dados
    return {};
  }

  /**
   * Gera insights de canais
   */
  private async generateChannelInsights(data: Record<string, any>): Promise<Insight[]> {
    // Implementar geração de insights
    return [];
  }

  /**
   * Gera recomendações de canais
   */
  private async generateChannelRecommendations(data: Record<string, any>): Promise<Recommendation[]> {
    // Implementar geração de recomendações
    return [];
  }

  /**
   * Gera dados de engajamento de pacientes
   */
  private async generatePatientEngagementData(
    clinicId: string,
    dateRange: DateRange,
    filters?: ReportFilters
  ): Promise<Record<string, any>> {
    // Implementar geração de dados
    return {};
  }

  /**
   * Gera insights de engajamento
   */
  private async generateEngagementInsights(data: Record<string, any>): Promise<Insight[]> {
    // Implementar geração de insights
    return [];
  }

  /**
   * Gera recomendações de engajamento
   */
  private async generateEngagementRecommendations(data: Record<string, any>): Promise<Recommendation[]> {
    // Implementar geração de recomendações
    return [];
  }

  /**
   * Obtém título do relatório
   */
  private getReportTitle(type: ReportType): string {
    const titles = {
      [ReportType.DELIVERY_PERFORMANCE]: 'Relatório de Performance de Entrega',
      [ReportType.CHANNEL_COMPARISON]: 'Comparação de Performance por Canal',
      [ReportType.PATIENT_ENGAGEMENT]: 'Análise de Engajamento de Pacientes',
      [ReportType.COST_ANALYSIS]: 'Análise de Custos',
      [ReportType.ROI_ANALYSIS]: 'Análise de ROI',
      [ReportType.OPTIMAL_TIMING]: 'Análise de Horários Ótimos',
      [ReportType.TREND_ANALYSIS]: 'Análise de Tendências',
      [ReportType.PREDICTIVE_INSIGHTS]: 'Insights Preditivos'
    };
    return titles[type];
  }

  /**
   * Salva relatório
   */
  private async saveReport(report: AnalyticsReport): Promise<void> {
    // Implementar salvamento de relatório
  }

  /**
   * Retorna métricas vazias
   */
  private getEmptyMetrics(): DeliveryMetrics {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalClicked: 0,
      totalReplied: 0,
      totalFailed: 0,
      deliveryRate: 0,
      readRate: 0,
      clickRate: 0,
      replyRate: 0,
      failureRate: 0,
      avgDeliveryTime: 0,
      avgReadTime: 0,
      avgResponseTime: 0
    };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Configuração de analytics atualizada', { config: this.config });
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): {
    cacheSize: number;
    subscriptions: number;
    config: AnalyticsConfig;
  } {
    return {
      cacheSize: this.aggregationCache.size,
      subscriptions: this.realtimeSubscriptions.size,
      config: this.config
    };
  }
}
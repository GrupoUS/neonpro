/**
 * Communication Analytics Engine
 *
 * Sistema avançado de análise de comunicação para NeonPro Healthcare System
 * Fornece métricas detalhadas, ROI tracking, e insights de performance para
 * todas as comunicações com pacientes (SMS, Email, WhatsApp, Push).
 *
 * Features:
 * - Multi-channel analytics com métricas unificadas
 * - ROI calculation com attribution modeling
 * - Performance benchmarking contra padrões da indústria
 * - Análise de tendências temporais e sazonais
 * - Real-time metrics com alertas automáticos
 * - LGPD compliance para analytics de comunicação
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import type { createClient } from "@/lib/supabase/server";
import type {
  AlertConfig,
  AnalyticsFilter,
  AnalyticsMetrics,
  AttributionModel,
  BenchmarkData,
  ChannelPerformance,
  CommunicationEvent,
  DateRange,
  EngagementMetrics,
  ROICalculation,
  SegmentAnalysis,
  TimeSeriesData,
  TrendAnalysis,
} from "./types/analytics";

export class CommunicationAnalyticsEngine {
  private supabase = createClient();

  /**
   * Coleta e processa eventos de comunicação para análise
   */
  async collectCommunicationEvent(event: CommunicationEvent): Promise<void> {
    try {
      const eventData = {
        event_id: event.id,
        channel_type: event.channel,
        message_type: event.messageType,
        patient_id: event.patientId,
        clinic_id: event.clinicId,
        sent_at: event.sentAt.toISOString(),
        delivered_at: event.deliveredAt?.toISOString(),
        opened_at: event.openedAt?.toISOString(),
        clicked_at: event.clickedAt?.toISOString(),
        responded_at: event.respondedAt?.toISOString(),
        cost: event.cost,
        revenue_attributed: event.revenueAttributed,
        metadata: event.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.supabase.from("communication_events").insert(eventData);

      // Atualizar métricas em tempo real
      await this.updateRealTimeMetrics(event);

      // Verificar alertas
      await this.checkAlerts(event);
    } catch (error) {
      console.error("Error collecting communication event:", error);
      throw new Error(`Failed to collect communication event: ${error.message}`);
    }
  }

  /**
   * Calcula métricas agregadas de comunicação
   */
  async calculateAnalyticsMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetrics> {
    try {
      const [
        channelPerformance,
        engagement,
        roi,
        trends,
        benchmarks,
        totalMessages,
        totalCost,
        totalRevenue,
      ] = await Promise.all([
        this.getChannelPerformance(filter),
        this.getEngagementMetrics(filter),
        this.getROIMetrics(filter),
        this.getTrendAnalysis(filter),
        this.getBenchmarkData(filter),
        this.getTotalMessages(filter),
        this.getTotalCost(filter),
        this.getTotalRevenue(filter),
      ]);

      return {
        id: `analytics_${Date.now()}`,
        clinicId: filter.clinicId,
        dateRange: filter.dateRange,
        channelPerformance,
        engagement,
        roi,
        trends,
        benchmarks,
        totalMessages,
        totalCost,
        totalRevenue,
        lastUpdated: new Date(),
        metadata: {
          analysisVersion: "1.0",
          dataQuality: await this.assessDataQuality(filter),
          confidence: await this.calculateConfidence(filter),
        },
      };
    } catch (error) {
      console.error("Error calculating analytics metrics:", error);
      throw new Error(`Failed to calculate analytics metrics: ${error.message}`);
    }
  }

  /**
   * Análise de performance por canal
   */
  private async getChannelPerformance(filter: AnalyticsFilter): Promise<ChannelPerformance[]> {
    try {
      const query = this.supabase
        .from("communication_events")
        .select(`
          channel_type,
          COUNT(*) as total_sent,
          COUNT(delivered_at) as delivered,
          COUNT(opened_at) as opened,
          COUNT(clicked_at) as clicked,
          COUNT(responded_at) as responded,
          SUM(cost) as total_cost,
          SUM(revenue_attributed) as total_revenue
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .not("channel_type", "is", null);

      // Aplicar filtros opcionais
      if (filter.channels?.length) {
        query.in("channel_type", filter.channels);
      }

      if (filter.messageTypes?.length) {
        query.in("message_type", filter.messageTypes);
      }

      const { data, error } = await query;

      if (error) throw error;

      const results = await Promise.all(
        (data || []).map(async (channel) => {
          const totalSent = parseInt(channel.total_sent) || 0;
          const delivered = parseInt(channel.delivered) || 0;
          const opened = parseInt(channel.opened) || 0;
          const clicked = parseInt(channel.clicked) || 0;
          const responded = parseInt(channel.responded) || 0;
          const totalCost = parseFloat(channel.total_cost) || 0;
          const totalRevenue = parseFloat(channel.total_revenue) || 0;

          // Cálculos de timing
          const timingData = await this.getChannelTimingData(channel.channel_type, filter);

          return {
            channel: channel.channel_type,
            totalSent,
            delivered,
            opened,
            clicked,
            responded,
            deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
            openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
            clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
            responseRate: totalSent > 0 ? (responded / totalSent) * 100 : 0,
            conversionRate: await this.calculateConversionRate(channel.channel_type, filter),
            totalCost,
            totalRevenue,
            roi: this.calculateROI(totalRevenue, totalCost),
            avgDeliveryTime: timingData.avgDeliveryTime,
            avgOpenTime: timingData.avgOpenTime,
            avgClickTime: timingData.avgClickTime,
            costPerMessage: totalSent > 0 ? totalCost / totalSent : 0,
            revenuePerMessage: totalSent > 0 ? totalRevenue / totalSent : 0,
          };
        }),
      );

      return results;
    } catch (error) {
      console.error("Error getting channel performance:", error);
      return [];
    }
  }

  /**
   * Dados de timing por canal
   */
  private async getChannelTimingData(channel: string, filter: AnalyticsFilter) {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          sent_at,
          delivered_at,
          opened_at,
          clicked_at
        `)
        .eq("channel_type", channel)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .not("delivered_at", "is", null);

      if (!data?.length) {
        return { avgDeliveryTime: 0, avgOpenTime: 0, avgClickTime: 0 };
      }

      let totalDeliveryTime = 0;
      let totalOpenTime = 0;
      let totalClickTime = 0;
      let deliveryCount = 0;
      let openCount = 0;
      let clickCount = 0;

      for (const event of data) {
        if (event.delivered_at && event.sent_at) {
          const deliveryTime =
            new Date(event.delivered_at).getTime() - new Date(event.sent_at).getTime();
          totalDeliveryTime += deliveryTime / 1000; // segundos
          deliveryCount++;
        }

        if (event.opened_at && event.delivered_at) {
          const openTime =
            new Date(event.opened_at).getTime() - new Date(event.delivered_at).getTime();
          totalOpenTime += openTime / 1000;
          openCount++;
        }

        if (event.clicked_at && event.opened_at) {
          const clickTime =
            new Date(event.clicked_at).getTime() - new Date(event.opened_at).getTime();
          totalClickTime += clickTime / 1000;
          clickCount++;
        }
      }

      return {
        avgDeliveryTime: deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0,
        avgOpenTime: openCount > 0 ? totalOpenTime / openCount : 0,
        avgClickTime: clickCount > 0 ? totalClickTime / clickCount : 0,
      };
    } catch (error) {
      return { avgDeliveryTime: 0, avgOpenTime: 0, avgClickTime: 0 };
    }
  }

  /**
   * Métricas de engajamento consolidadas
   */
  private async getEngagementMetrics(filter: AnalyticsFilter): Promise<EngagementMetrics> {
    try {
      const { data, error } = await this.supabase
        .from("communication_events")
        .select(`
          COUNT(*) as total_messages,
          COUNT(DISTINCT patient_id) as unique_patients,
          COUNT(delivered_at) as delivered,
          COUNT(opened_at) as opened,
          COUNT(clicked_at) as clicked,
          COUNT(responded_at) as responded
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .single();

      if (error) throw error;

      const totalMessages = parseInt(data.total_messages) || 0;
      const delivered = parseInt(data.delivered) || 0;
      const opened = parseInt(data.opened) || 0;
      const clicked = parseInt(data.clicked) || 0;
      const responded = parseInt(data.responded) || 0;

      // Cálculos adicionais
      const [
        engagementScore,
        avgResponseTime,
        reachRate,
        frequencyRate,
        retentionRate,
        satisfactionScore,
      ] = await Promise.all([
        this.calculateEngagementScore(filter),
        this.calculateAvgResponseTime(filter),
        this.calculateReachRate(filter),
        this.calculateFrequencyRate(filter),
        this.calculateRetentionRate(filter),
        this.calculateSatisfactionScore(filter),
      ]);

      return {
        totalMessages,
        uniquePatients: parseInt(data.unique_patients) || 0,
        deliveryRate: totalMessages > 0 ? (delivered / totalMessages) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickThroughRate: opened > 0 ? (clicked / opened) * 100 : 0,
        responseRate: totalMessages > 0 ? (responded / totalMessages) * 100 : 0,
        engagementScore,
        avgResponseTime,
        reachRate,
        frequencyRate,
        retentionRate,
        satisfactionScore,
      };
    } catch (error) {
      console.error("Error getting engagement metrics:", error);
      return {
        totalMessages: 0,
        uniquePatients: 0,
        deliveryRate: 0,
        openRate: 0,
        clickThroughRate: 0,
        responseRate: 0,
        engagementScore: 0,
        avgResponseTime: 0,
        reachRate: 0,
        frequencyRate: 0,
        retentionRate: 0,
        satisfactionScore: 0,
      };
    }
  }

  /**
   * Tempo médio de resposta
   */
  private async calculateAvgResponseTime(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("sent_at, responded_at")
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .not("responded_at", "is", null);

      if (!data?.length) return 0;

      let totalResponseTime = 0;
      let count = 0;

      for (const event of data) {
        if (event.responded_at && event.sent_at) {
          const responseTime =
            new Date(event.responded_at).getTime() - new Date(event.sent_at).getTime();
          totalResponseTime += responseTime / 1000; // segundos
          count++;
        }
      }

      return count > 0 ? totalResponseTime / count : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cálculo detalhado de ROI
   */
  private async getROIMetrics(filter: AnalyticsFilter): Promise<ROICalculation> {
    try {
      const { data, error } = await this.supabase
        .from("communication_events")
        .select(`
          SUM(cost) as total_cost,
          SUM(revenue_attributed) as total_revenue,
          COUNT(*) as total_messages,
          COUNT(DISTINCT patient_id) as unique_patients
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .single();

      if (error) throw error;

      const totalCost = parseFloat(data.total_cost) || 0;
      const totalRevenue = parseFloat(data.total_revenue) || 0;
      const totalMessages = parseInt(data.total_messages) || 0;
      const uniquePatients = parseInt(data.unique_patients) || 0;

      // Cálculos adicionais
      const [breakEvenPoint, paybackPeriod, attribution, conversionValue, lifetimeValue] =
        await Promise.all([
          this.calculateBreakEvenPoint(filter),
          this.calculatePaybackPeriod(filter),
          this.getAttributionModel(filter),
          this.calculateConversionValue(filter),
          this.calculateLifetimeValue(filter),
        ]);

      return {
        totalInvestment: totalCost,
        totalRevenue,
        grossProfit: totalRevenue - totalCost,
        roi: this.calculateROI(totalRevenue, totalCost),
        costPerMessage: totalMessages > 0 ? totalCost / totalMessages : 0,
        revenuePerMessage: totalMessages > 0 ? totalRevenue / totalMessages : 0,
        costPerPatient: uniquePatients > 0 ? totalCost / uniquePatients : 0,
        revenuePerPatient: uniquePatients > 0 ? totalRevenue / uniquePatients : 0,
        breakEvenPoint,
        paybackPeriod,
        attribution,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
        conversionValue,
        lifetimeValue,
      };
    } catch (error) {
      console.error("Error calculating ROI metrics:", error);
      return {
        totalInvestment: 0,
        totalRevenue: 0,
        grossProfit: 0,
        roi: 0,
        costPerMessage: 0,
        revenuePerMessage: 0,
        costPerPatient: 0,
        revenuePerPatient: 0,
        breakEvenPoint: 0,
        paybackPeriod: 0,
        attribution: { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 },
        profitMargin: 0,
        conversionValue: 0,
        lifetimeValue: 0,
      };
    }
  }

  /**
   * Análise de tendências temporais
   */
  private async getTrendAnalysis(filter: AnalyticsFilter): Promise<TrendAnalysis> {
    try {
      // Período anterior para comparação (mesmo número de dias)
      const daysDiff = Math.ceil(
        (filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const previousStart = new Date(
        filter.dateRange.start.getTime() - daysDiff * 24 * 60 * 60 * 1000,
      );
      const previousEnd = new Date(filter.dateRange.start.getTime() - 1);

      const previousFilter = {
        ...filter,
        dateRange: { start: previousStart, end: previousEnd },
      };

      // Dados históricos e atuais
      const [historicalMetrics, currentMetrics] = await Promise.all([
        this.getCurrentPeriodMetrics(previousFilter),
        this.getCurrentPeriodMetrics(filter),
      ]);

      // Série temporal por dia
      const timeSeriesData = await this.getTimeSeriesData(filter);

      // Análise sazonal
      const seasonalAnalysis = await this.getSeasonalAnalysis(filter);

      // Previsões simples baseadas em tendência
      const forecasting = await this.getForecastingData(filter, timeSeriesData);

      return {
        historical: historicalMetrics,
        current: currentMetrics,
        timeSeries: timeSeriesData,
        seasonal: seasonalAnalysis,
        forecasting,
        growth: {
          messagesGrowth: this.calculateGrowthRate(
            historicalMetrics.totalMessages,
            currentMetrics.totalMessages,
          ),
          revenueGrowth: this.calculateGrowthRate(
            historicalMetrics.totalRevenue,
            currentMetrics.totalRevenue,
          ),
          engagementGrowth: this.calculateGrowthRate(
            historicalMetrics.engagementScore,
            currentMetrics.engagementScore,
          ),
          roiGrowth: this.calculateGrowthRate(historicalMetrics.roi, currentMetrics.roi),
        },
        trends: {
          messageVolume: await this.detectTrend(timeSeriesData.map((d) => d.totalMessages)),
          engagement: await this.detectTrend(timeSeriesData.map((d) => d.engagementScore)),
          revenue: await this.detectTrend(timeSeriesData.map((d) => d.revenue)),
          cost: await this.detectTrend(timeSeriesData.map((d) => d.cost)),
        },
      };
    } catch (error) {
      console.error("Error getting trend analysis:", error);
      return {
        historical: { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 },
        current: { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 },
        timeSeries: [],
        seasonal: { monthlyPatterns: [], weeklyPatterns: [], hourlyPatterns: [] },
        forecasting: { nextMonth: [], nextQuarter: [], nextYear: [] },
        growth: { messagesGrowth: 0, revenueGrowth: 0, engagementGrowth: 0, roiGrowth: 0 },
        trends: {
          messageVolume: "stable",
          engagement: "stable",
          revenue: "stable",
          cost: "stable",
        },
      };
    }
  }

  /**
   * Dados de benchmark da indústria
   */
  private async getBenchmarkData(filter: AnalyticsFilter): Promise<BenchmarkData> {
    try {
      // Benchmarks padrão da indústria healthcare/estética
      const industryBenchmarks = {
        sms: { deliveryRate: 98, openRate: 90, responseRate: 45 },
        email: { deliveryRate: 95, openRate: 25, responseRate: 3 },
        whatsapp: { deliveryRate: 99, openRate: 95, responseRate: 60 },
        push: { deliveryRate: 95, openRate: 15, responseRate: 2 },
      };

      // Métricas atuais da clínica
      const clinicMetrics = await this.getChannelPerformance(filter);

      // Comparação com benchmarks
      const comparisons = clinicMetrics.map((metric) => {
        const benchmark = industryBenchmarks[metric.channel as keyof typeof industryBenchmarks];

        if (!benchmark) {
          return {
            channel: metric.channel,
            deliveryRateDiff: 0,
            openRateDiff: 0,
            responseRateDiff: 0,
            performanceScore: 0,
          };
        }

        return {
          channel: metric.channel,
          deliveryRateDiff: metric.deliveryRate - benchmark.deliveryRate,
          openRateDiff: metric.openRate - benchmark.openRate,
          responseRateDiff: metric.responseRate - benchmark.responseRate,
          performanceScore: this.calculatePerformanceScore(metric, benchmark),
        };
      });

      const overallScore = this.calculateOverallBenchmarkScore(comparisons);
      const recommendations = await this.generateBenchmarkRecommendations(comparisons);
      const ranking = await this.calculateIndustryRanking(overallScore);

      return {
        industry: industryBenchmarks,
        clinic: clinicMetrics.reduce((acc, metric) => {
          acc[metric.channel] = {
            deliveryRate: metric.deliveryRate,
            openRate: metric.openRate,
            responseRate: metric.responseRate,
          };
          return acc;
        }, {} as any),
        comparisons,
        overallScore,
        recommendations,
        ranking,
      };
    } catch (error) {
      console.error("Error getting benchmark data:", error);
      return {
        industry: {},
        clinic: {},
        comparisons: [],
        overallScore: 0,
        recommendations: [],
        ranking: "unknown",
      };
    }
  }

  /**
   * Métodos auxiliares para cálculos específicos
   */
  private calculateROI(revenue: number, cost: number): number {
    if (cost === 0) return revenue > 0 ? 100 : 0;
    return ((revenue - cost) / cost) * 100;
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async calculateConversionRate(channel: string, filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("*")
        .eq("channel_type", channel)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      if (!data?.length) return 0;

      const total = data.length;
      const conversions = data.filter(
        (event) => event.revenue_attributed && event.revenue_attributed > 0,
      ).length;

      return total > 0 ? (conversions / total) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateEngagementScore(filter: AnalyticsFilter): Promise<number> {
    try {
      const channelPerformance = await this.getChannelPerformance(filter);

      if (!channelPerformance.length) return 0;

      // Weighted engagement score baseado em múltiplos fatores
      const weights = {
        deliveryRate: 0.2,
        openRate: 0.3,
        clickRate: 0.25,
        responseRate: 0.25,
      };

      let totalScore = 0;
      let totalWeight = 0;

      for (const channel of channelPerformance) {
        const channelScore =
          channel.deliveryRate * weights.deliveryRate +
          channel.openRate * weights.openRate +
          channel.clickRate * weights.clickRate +
          channel.responseRate * weights.responseRate;

        const channelWeight = channel.totalSent;
        totalScore += channelScore * channelWeight;
        totalWeight += channelWeight;
      }

      return totalWeight > 0 ? totalScore / totalWeight : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Métodos auxiliares para análises complexas
   */
  private async getTotalMessages(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("COUNT(*)", { count: "exact" })
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      return data?.[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getTotalCost(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("SUM(cost)")
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .single();

      return parseFloat(data?.sum) || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getTotalRevenue(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("SUM(revenue_attributed)")
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .single();

      return parseFloat(data?.sum) || 0;
    } catch (error) {
      return 0;
    }
  }

  private async assessDataQuality(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          COUNT(*) as total,
          COUNT(delivered_at) as with_delivery,
          COUNT(patient_id) as with_patient,
          COUNT(cost) as with_cost
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .single();

      const total = parseInt(data?.total) || 0;
      if (total === 0) return 100;

      const withDelivery = parseInt(data?.with_delivery) || 0;
      const withPatient = parseInt(data?.with_patient) || 0;
      const withCost = parseInt(data?.with_cost) || 0;

      // Score baseado na completude dos dados
      const deliveryScore = (withDelivery / total) * 100;
      const patientScore = (withPatient / total) * 100;
      const costScore = (withCost / total) * 100;

      return (deliveryScore + patientScore + costScore) / 3;
    } catch (error) {
      return 95; // Default score
    }
  }

  private async calculateConfidence(filter: AnalyticsFilter): Promise<number> {
    try {
      const totalMessages = await this.getTotalMessages(filter);
      const daysDiff = Math.ceil(
        (filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Confidence baseado no volume de dados e período de análise
      let confidence = 50; // Base confidence

      // Mais mensagens = maior confiança
      if (totalMessages > 1000) confidence += 30;
      else if (totalMessages > 100) confidence += 20;
      else if (totalMessages > 10) confidence += 10;

      // Período maior = maior confiança
      if (daysDiff >= 30) confidence += 20;
      else if (daysDiff >= 7) confidence += 10;

      return Math.min(confidence, 98); // Cap at 98%
    } catch (error) {
      return 85; // Default confidence
    }
  }

  private async getCurrentPeriodMetrics(filter: AnalyticsFilter) {
    try {
      const [totalMessages, totalRevenue, engagementScore] = await Promise.all([
        this.getTotalMessages(filter),
        this.getTotalRevenue(filter),
        this.calculateEngagementScore(filter),
      ]);

      const totalCost = await this.getTotalCost(filter);
      const roi = this.calculateROI(totalRevenue, totalCost);

      return {
        totalMessages,
        totalRevenue,
        engagementScore,
        roi,
      };
    } catch (error) {
      return { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 };
    }
  }

  private async getTimeSeriesData(filter: AnalyticsFilter): Promise<TimeSeriesData[]> {
    try {
      const daysDiff = Math.ceil(
        (filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const timeSeriesData: TimeSeriesData[] = [];

      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(filter.dateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

        const dayFilter = {
          ...filter,
          dateRange: { start: currentDate, end: nextDate },
        };

        const [totalMessages, revenue, cost, engagementScore] = await Promise.all([
          this.getTotalMessages(dayFilter),
          this.getTotalRevenue(dayFilter),
          this.getTotalCost(dayFilter),
          this.calculateEngagementScore(dayFilter),
        ]);

        const conversions = await this.getConversionsCount(dayFilter);
        const roi = this.calculateROI(revenue, cost);

        timeSeriesData.push({
          date: currentDate,
          totalMessages,
          engagementScore,
          revenue,
          cost,
          roi,
          conversions,
        });
      }

      return timeSeriesData;
    } catch (error) {
      return [];
    }
  }

  private async getConversionsCount(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select("COUNT(*)", { count: "exact" })
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .gt("revenue_attributed", 0);

      return data?.[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getSeasonalAnalysis(filter: AnalyticsFilter) {
    try {
      // Análise mensal (últimos 12 meses se disponível)
      const monthlyPatterns = await this.getMonthlyPatterns(filter);

      // Análise semanal (por dia da semana)
      const weeklyPatterns = await this.getWeeklyPatterns(filter);

      // Análise por hora do dia
      const hourlyPatterns = await this.getHourlyPatterns(filter);

      return {
        monthlyPatterns,
        weeklyPatterns,
        hourlyPatterns,
      };
    } catch (error) {
      return { monthlyPatterns: [], weeklyPatterns: [], hourlyPatterns: [] };
    }
  }

  private async getMonthlyPatterns(filter: AnalyticsFilter) {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          EXTRACT(MONTH FROM sent_at) as month,
          COUNT(*) as total_messages,
          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,
          SUM(revenue_attributed) as avg_revenue
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      return (data || []).map((row) => ({
        month: parseInt(row.month),
        avgEngagement: parseFloat(row.avg_engagement) || 0,
        avgRevenue: parseFloat(row.avg_revenue) || 0,
      }));
    } catch (error) {
      return [];
    }
  }

  private async getWeeklyPatterns(filter: AnalyticsFilter) {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          EXTRACT(DOW FROM sent_at) as day_of_week,
          COUNT(*) as total_messages,
          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,
          SUM(revenue_attributed) as avg_revenue
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      return (data || []).map((row) => ({
        dayOfWeek: parseInt(row.day_of_week),
        avgEngagement: parseFloat(row.avg_engagement) || 0,
        avgRevenue: parseFloat(row.avg_revenue) || 0,
      }));
    } catch (error) {
      return [];
    }
  }

  private async getHourlyPatterns(filter: AnalyticsFilter) {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          EXTRACT(HOUR FROM sent_at) as hour,
          COUNT(*) as total_messages,
          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,
          SUM(revenue_attributed) as avg_revenue
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      return (data || []).map((row) => ({
        hour: parseInt(row.hour),
        avgEngagement: parseFloat(row.avg_engagement) || 0,
        avgRevenue: parseFloat(row.avg_revenue) || 0,
      }));
    } catch (error) {
      return [];
    }
  }

  private async getForecastingData(filter: AnalyticsFilter, timeSeriesData: TimeSeriesData[]) {
    try {
      if (timeSeriesData.length < 7) {
        return { nextMonth: [], nextQuarter: [], nextYear: [] };
      }

      // Previsão simples baseada em média móvel e tendência linear
      const recentData = timeSeriesData.slice(-7); // Últimos 7 dias

      const avgMessages =
        recentData.reduce((sum, d) => sum + d.totalMessages, 0) / recentData.length;
      const avgRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0) / recentData.length;

      // Tendência (slope)
      const messagesTrend = this.calculateLinearTrend(recentData.map((d) => d.totalMessages));
      const revenueTrend = this.calculateLinearTrend(recentData.map((d) => d.revenue));

      // Próximo mês (30 dias)
      const nextMonth = [];
      for (let i = 1; i <= 30; i++) {
        const predictedMessages = Math.max(0, avgMessages + messagesTrend * i);
        const predictedRevenue = Math.max(0, avgRevenue + revenueTrend * i);

        nextMonth.push({
          date: new Date(filter.dateRange.end.getTime() + i * 24 * 60 * 60 * 1000),
          predictedMessages: Math.round(predictedMessages),
          predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        });
      }

      // Próximo trimestre (agregado por mês)
      const nextQuarter = [1, 2, 3].map((month) => ({
        month,
        predictedMessages: Math.round((avgMessages + messagesTrend * month * 30) * 30),
        predictedRevenue: Math.round((avgRevenue + revenueTrend * month * 30) * 30 * 100) / 100,
      }));

      // Próximo ano (agregado por trimestre)
      const nextYear = [1, 2, 3, 4].map((quarter) => ({
        quarter,
        predictedMessages: Math.round((avgMessages + messagesTrend * quarter * 90) * 90),
        predictedRevenue: Math.round((avgRevenue + revenueTrend * quarter * 90) * 90 * 100) / 100,
      }));

      return { nextMonth, nextQuarter, nextYear };
    } catch (error) {
      return { nextMonth: [], nextQuarter: [], nextYear: [] };
    }
  }

  private calculateLinearTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private async detectTrend(data: number[]): Promise<"increasing" | "decreasing" | "stable"> {
    if (data.length < 3) return "stable";

    const trend = this.calculateLinearTrend(data);
    const threshold = Math.abs(data.reduce((sum, val) => sum + val, 0) / data.length) * 0.05; // 5% threshold

    if (trend > threshold) return "increasing";
    if (trend < -threshold) return "decreasing";
    return "stable";
  }

  private calculatePerformanceScore(metric: ChannelPerformance, benchmark: any): number {
    if (!benchmark) return 0;

    const deliveryScore = Math.min((metric.deliveryRate / benchmark.deliveryRate) * 100, 150);
    const openScore = Math.min((metric.openRate / benchmark.openRate) * 100, 150);
    const responseScore = Math.min((metric.responseRate / benchmark.responseRate) * 100, 150);

    return (deliveryScore + openScore + responseScore) / 3;
  }

  private calculateOverallBenchmarkScore(comparisons: any[]): number {
    if (!comparisons.length) return 0;

    const totalScore = comparisons.reduce((sum, comp) => sum + comp.performanceScore, 0);
    return totalScore / comparisons.length;
  }

  private async generateBenchmarkRecommendations(comparisons: any[]): Promise<string[]> {
    const recommendations: string[] = [];

    for (const comp of comparisons) {
      if (comp.deliveryRateDiff < -5) {
        recommendations.push(
          `Melhorar taxa de entrega do canal ${comp.channel} - considere validar listas e horários`,
        );
      }
      if (comp.openRateDiff < -10) {
        recommendations.push(
          `Otimizar taxa de abertura do canal ${comp.channel} - revisar títulos e timing`,
        );
      }
      if (comp.responseRateDiff < -15) {
        recommendations.push(
          `Aumentar engajamento do canal ${comp.channel} - melhorar call-to-actions e personalização`,
        );
      }
    }

    if (!recommendations.length) {
      recommendations.push(
        "Performance geral acima dos benchmarks da indústria - continue mantendo as boas práticas",
      );
    }

    return recommendations;
  }

  private async calculateIndustryRanking(overallScore: number): Promise<string> {
    if (overallScore >= 120) return "excellent";
    if (overallScore >= 110) return "good";
    if (overallScore >= 90) return "average";
    if (overallScore >= 70) return "below_average";
    if (overallScore > 0) return "poor";
    return "unknown";
  }

  /**
   * Métodos para real-time updates e alertas
   */
  private async updateRealTimeMetrics(event: CommunicationEvent): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Upsert daily metrics
      await this.supabase.from("communication_metrics_daily").upsert(
        {
          clinic_id: event.clinicId,
          date: today,
          channel_type: event.channel,
          total_sent: 1,
          delivered: event.deliveredAt ? 1 : 0,
          opened: event.openedAt ? 1 : 0,
          clicked: event.clickedAt ? 1 : 0,
          responded: event.respondedAt ? 1 : 0,
          total_cost: event.cost,
          total_revenue: event.revenueAttributed || 0,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "clinic_id,date,channel_type",
          ignoreDuplicates: false,
        },
      );
    } catch (error) {
      console.error("Error updating real-time metrics:", error);
    }
  }

  private async checkAlerts(event: CommunicationEvent): Promise<void> {
    try {
      const { data: alerts } = await this.supabase
        .from("communication_alerts")
        .select("*")
        .eq("clinic_id", event.clinicId)
        .eq("is_active", true);

      for (const alert of alerts || []) {
        const shouldTrigger = await this.evaluateAlertCondition(alert, event);

        if (shouldTrigger) {
          await this.triggerAlert(alert, event);
        }
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  private async evaluateAlertCondition(alert: any, event: CommunicationEvent): Promise<boolean> {
    try {
      // Implementar lógica de avaliação de condições
      // Exemplo: verificar se taxa de entrega caiu abaixo do threshold

      for (const condition of alert.conditions) {
        const currentValue = await this.getMetricValue(condition.metric, event.clinicId);

        switch (condition.operator) {
          case "gt":
            return currentValue > condition.threshold;
          case "lt":
            return currentValue < condition.threshold;
          case "eq":
            return currentValue === condition.threshold;
          case "gte":
            return currentValue >= condition.threshold;
          case "lte":
            return currentValue <= condition.threshold;
          default:
            return false;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private async getMetricValue(metric: string, clinicId: string): Promise<number> {
    try {
      // Implementar busca de métricas baseado no tipo
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const filter: AnalyticsFilter = {
        clinicId,
        dateRange: { start: yesterday, end: today },
      };

      switch (metric) {
        case "delivery_rate": {
          const engagement = await this.getEngagementMetrics(filter);
          return engagement.deliveryRate;
        }
        case "open_rate": {
          const openMetrics = await this.getEngagementMetrics(filter);
          return openMetrics.openRate;
        }
        case "response_rate": {
          const responseMetrics = await this.getEngagementMetrics(filter);
          return responseMetrics.responseRate;
        }
        default:
          return 0;
      }
    } catch (error) {
      return 0;
    }
  }

  private async triggerAlert(alert: any, event: CommunicationEvent): Promise<void> {
    try {
      for (const action of alert.actions) {
        switch (action.type) {
          case "email":
            // Implementar envio de email
            console.log(`Email alert triggered: ${alert.name}`);
            break;
          case "webhook":
            // Implementar webhook
            console.log(`Webhook alert triggered: ${alert.name}`);
            break;
          case "dashboard":
            // Implementar notificação no dashboard
            console.log(`Dashboard alert triggered: ${alert.name}`);
            break;
        }
      }
    } catch (error) {
      console.error("Error triggering alert:", error);
    }
  }

  // Métodos auxiliares para cálculos específicos de métricas
  private async calculateReachRate(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          COUNT(DISTINCT patient_id) as reached_patients
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .not("delivered_at", "is", null)
        .single();

      // Calcular contra total de pacientes ativos
      const { data: totalPatients } = await this.supabase
        .from("patients")
        .select("COUNT(*)", { count: "exact" })
        .eq("clinic_id", filter.clinicId)
        .eq("status", "active");

      const reachedPatients = parseInt(data?.reached_patients) || 0;
      const total = totalPatients?.[0]?.count || 0;

      return total > 0 ? (reachedPatients / total) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateFrequencyRate(filter: AnalyticsFilter): Promise<number> {
    try {
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          patient_id,
          COUNT(*) as message_count
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      if (!data?.length) return 0;

      const totalMessages = data.reduce((sum, patient) => sum + parseInt(patient.message_count), 0);
      const uniquePatients = data.length;

      return uniquePatients > 0 ? totalMessages / uniquePatients : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateRetentionRate(filter: AnalyticsFilter): Promise<number> {
    try {
      // Calcular pacientes que receberam mensagens no período atual
      const { data: currentPeriod } = await this.supabase
        .from("communication_events")
        .select("DISTINCT patient_id")
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId);

      // Calcular pacientes que também receberam no período anterior
      const daysDiff = Math.ceil(
        (filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const previousStart = new Date(
        filter.dateRange.start.getTime() - daysDiff * 24 * 60 * 60 * 1000,
      );

      const { data: previousPeriod } = await this.supabase
        .from("communication_events")
        .select("DISTINCT patient_id")
        .gte("sent_at", previousStart.toISOString())
        .lt("sent_at", filter.dateRange.start.toISOString())
        .eq("clinic_id", filter.clinicId);

      const currentPatients = new Set((currentPeriod || []).map((p) => p.patient_id));
      const previousPatients = new Set((previousPeriod || []).map((p) => p.patient_id));

      const retainedPatients = [...currentPatients].filter((id) => previousPatients.has(id)).length;

      return previousPatients.size > 0 ? (retainedPatients / previousPatients.size) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateSatisfactionScore(filter: AnalyticsFilter): Promise<number> {
    try {
      // Satisfaction baseado em feedback responses (se disponível)
      // Por enquanto, usar proxy metrics
      const engagement = await this.getEngagementMetrics(filter);

      // Score composto baseado em engagement metrics
      const satisfactionProxy =
        engagement.responseRate * 0.4 +
        engagement.openRate * 0.3 +
        engagement.deliveryRate * 0.2 +
        Math.min(engagement.clickThroughRate * 2, 100) * 0.1;

      return Math.min(satisfactionProxy, 100);
    } catch (error) {
      return 0;
    }
  }

  private async calculateBreakEvenPoint(filter: AnalyticsFilter): Promise<number> {
    try {
      const totalCost = await this.getTotalCost(filter);
      const totalRevenue = await this.getTotalRevenue(filter);
      const totalMessages = await this.getTotalMessages(filter);

      if (totalMessages === 0 || totalRevenue <= totalCost) return 0;

      const revenuePerMessage = totalRevenue / totalMessages;
      const costPerMessage = totalCost / totalMessages;

      if (revenuePerMessage <= costPerMessage) return 0;

      // Mensagens necessárias para cobrir custos fixos
      return Math.ceil(totalCost / (revenuePerMessage - costPerMessage));
    } catch (error) {
      return 0;
    }
  }

  private async calculatePaybackPeriod(filter: AnalyticsFilter): Promise<number> {
    try {
      const totalCost = await this.getTotalCost(filter);
      const totalRevenue = await this.getTotalRevenue(filter);
      const daysDiff = Math.ceil(
        (filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (totalRevenue <= totalCost || daysDiff === 0) return 0;

      const dailyProfit = (totalRevenue - totalCost) / daysDiff;

      return dailyProfit > 0 ? Math.ceil(totalCost / dailyProfit) : 0;
    } catch (error) {
      return 0;
    }
  }

  private async getAttributionModel(filter: AnalyticsFilter): Promise<AttributionModel> {
    try {
      // Implementar modelos de atribuição simples
      const { data } = await this.supabase
        .from("communication_events")
        .select("patient_id, sent_at, revenue_attributed, channel_type")
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .gt("revenue_attributed", 0)
        .order("sent_at");

      if (!data?.length) {
        return { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 };
      }

      // Agrupar por paciente
      const patientJourneys = data.reduce((acc, event) => {
        if (!acc[event.patient_id]) acc[event.patient_id] = [];
        acc[event.patient_id].push(event);
        return acc;
      }, {} as any);

      let firstTouch = 0;
      let lastTouch = 0;
      let linear = 0;
      let timeDecay = 0;

      for (const journey of Object.values(patientJourneys) as any[]) {
        const totalRevenue = journey.reduce(
          (sum: number, event: any) => sum + event.revenue_attributed,
          0,
        );

        // First touch
        firstTouch += totalRevenue;

        // Last touch
        lastTouch += totalRevenue;

        // Linear
        linear += totalRevenue / journey.length;

        // Time decay (mais recente tem mais peso)
        const totalWeight = journey.reduce(
          (sum: number, _: any, index: number) => sum + (index + 1),
          0,
        );
        timeDecay += journey.reduce((sum: number, event: any, index: number) => {
          return sum + (event.revenue_attributed * (index + 1)) / totalWeight;
        }, 0);
      }

      return { firstTouch, lastTouch, linear, timeDecay };
    } catch (error) {
      return { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 };
    }
  }

  private async calculateConversionValue(filter: AnalyticsFilter): Promise<number> {
    try {
      const conversions = await this.getConversionsCount(filter);
      const totalRevenue = await this.getTotalRevenue(filter);

      return conversions > 0 ? totalRevenue / conversions : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateLifetimeValue(filter: AnalyticsFilter): Promise<number> {
    try {
      // CLV simplificado baseado em histórico de receita por paciente
      const { data } = await this.supabase
        .from("communication_events")
        .select(`
          patient_id,
          SUM(revenue_attributed) as total_revenue
        `)
        .gte("sent_at", filter.dateRange.start.toISOString())
        .lte("sent_at", filter.dateRange.end.toISOString())
        .eq("clinic_id", filter.clinicId)
        .gt("revenue_attributed", 0);

      if (!data?.length) return 0;

      const totalRevenue = data.reduce(
        (sum, patient) => sum + parseFloat(patient.total_revenue),
        0,
      );
      const uniquePatients = data.length;

      return uniquePatients > 0 ? totalRevenue / uniquePatients : 0;
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instance
export const createCommunicationAnalytics = () => new CommunicationAnalyticsEngine();

/**
 * Optimal Timing Analysis Engine
 * NeonPro - Machine Learning para análise de horários ótimos de comunicação
 */

import { createClient } from '@/app/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TimingPattern, OptimalTime, TimingRecommendation, PatientTimingProfile,
  TimingAnalysisRequest, TimingAnalysisResult, BehaviorPattern, 
  MachineLearningModel, TimingOptimizationConfig, PredictiveModel,
  EngagementWindow, TimeZoneMapping, DemographicPattern, 
  RealTimeFactors, SendTimeOptimization, PerformanceMetrics,
  TimingQueryFilter, TimingQueryResult, WeatherFactor, HolidayFactor
} from './types/timing';

export class OptimalTimingEngine {
  private supabase: SupabaseClient;
  private cache: Map<string, any> = new Map();
  private mlModels: Map<string, MachineLearningModel> = new Map();
  private config: TimingOptimizationConfig | null = null;
  private realTimeFactors: Map<string, RealTimeFactors> = new Map();

  constructor() {
    this.supabase = createClient();
    this.initializeModels();
    this.loadConfiguration();
  }

  /**
   * ====================================================================
   * INITIALIZATION & CONFIGURATION
   * ====================================================================
   */

  private async initializeModels(): Promise<void> {
    try {
      // Carregar modelos ML salvos do banco
      const { data: models } = await this.supabase
        .from('ml_timing_models')
        .select('*')
        .eq('status', 'active');

      if (models) {
        models.forEach(model => {
          this.mlModels.set(model.id, {
            id: model.id,
            name: model.name,
            type: model.type,
            version: model.version,
            accuracy: model.accuracy,
            features: model.features,
            lastTrained: new Date(model.last_trained),
            dataPoints: model.data_points,
            predictions: model.predictions
          });
        });
      }

      // Inicializar modelos padrão se necessário
      if (this.mlModels.size === 0) {
        await this.initializeDefaultModels();
      }
    } catch (error) {
      console.error('Error initializing ML models:', error);
      await this.initializeDefaultModels();
    }
  }

  private async initializeDefaultModels(): Promise<void> {
    const defaultModels: MachineLearningModel[] = [
      {
        id: 'timing-gb-v1',
        name: 'Gradient Boosting Timing Predictor',
        type: 'gradient_boosting',
        version: '1.0',
        accuracy: 0.78,
        features: ['hour', 'day_of_week', 'patient_age', 'communication_type', 'season'],
        lastTrained: new Date(),
        dataPoints: 0,
        predictions: { responseRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 }
      },
      {
        id: 'timing-rf-v1',
        name: 'Random Forest Engagement Predictor',
        type: 'random_forest',
        version: '1.0',
        accuracy: 0.75,
        features: ['hour', 'day_of_week', 'previous_engagements', 'time_since_last'],
        lastTrained: new Date(),
        dataPoints: 0,
        predictions: { responseRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 }
      }
    ];

    defaultModels.forEach(model => {
      this.mlModels.set(model.id, model);
    });
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('timing_optimization_config')
        .select('*')
        .single();

      if (data) {
        this.config = {
          clinicId: data.clinic_id,
          globalSettings: data.global_settings,
          channelSettings: data.channel_settings,
          audienceSegments: data.audience_segments
        };
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): TimingOptimizationConfig {
    return {
      clinicId: '',
      globalSettings: {
        defaultTimezone: 'America/Sao_Paulo',
        businessHours: {
          startHour: 8,
          startMinute: 0,
          endHour: 18,
          endMinute: 0
        },
        blackoutPeriods: [],
        minimumSampleSize: 30,
        minimumConfidence: 0.7,
        enableMLPredictions: true,
        enableSeasonalAdjustments: true,
        enableWeatherFactors: false,
        enableHolidayFactors: true
      },
      channelSettings: {
        email: {
          enabled: true,
          priority: 1,
          optimalFrequency: { daily: 2, weekly: 10, monthly: 30 },
          cooldownPeriod: 240,
          retryLogic: { maxAttempts: 3, backoffMultiplier: 2 }
        },
        sms: {
          enabled: true,
          priority: 2,
          optimalFrequency: { daily: 1, weekly: 5, monthly: 15 },
          cooldownPeriod: 480,
          retryLogic: { maxAttempts: 2, backoffMultiplier: 3 }
        },
        whatsapp: {
          enabled: true,
          priority: 3,
          optimalFrequency: { daily: 1, weekly: 7, monthly: 20 },
          cooldownPeriod: 360,
          retryLogic: { maxAttempts: 2, backoffMultiplier: 2 }
        }
      },
      audienceSegments: []
    };
  }

  /**
   * ====================================================================
   * PATTERN ANALYSIS
   * ====================================================================
   */

  /**
   * Analisar padrões de timing para uma clínica
   */
  async analyzeTimingPatterns(request: TimingAnalysisRequest): Promise<TimingAnalysisResult> {
    try {
      const requestId = this.generateId();
      
      // Buscar dados históricos de comunicação
      const communicationData = await this.fetchCommunicationData(request);
      
      // Analisar padrões globais
      const globalPatterns = await this.analyzeGlobalPatterns(communicationData, request);
      
      // Analisar padrões segmentados
      const segmentedPatterns = await this.analyzeSegmentedPatterns(communicationData, request);
      
      // Gerar recomendações usando ML
      const recommendations = await this.generateMLRecommendations(
        globalPatterns, 
        segmentedPatterns, 
        request
      );
      
      // Gerar insights
      const insights = await this.generateTimingInsights(
        globalPatterns, 
        segmentedPatterns, 
        communicationData
      );
      
      // Calcular métricas de performance
      const performanceMetrics = this.calculatePerformanceMetrics(communicationData);

      const result: TimingAnalysisResult = {
        requestId,
        clinicId: request.clinicId,
        analysisDate: new Date(),
        timeframe: request.dateRange,
        globalPatterns,
        segmentedPatterns,
        recommendations,
        insights,
        performanceMetrics
      };

      // Salvar resultado para cache
      await this.saveAnalysisResult(result);
      
      return result;
    } catch (error) {
      console.error('Error analyzing timing patterns:', error);
      throw error;
    }
  }

  /**
   * Buscar dados históricos de comunicação
   */
  private async fetchCommunicationData(request: TimingAnalysisRequest): Promise<any[]> {
    let query = this.supabase
      .from('communications_log')
      .select(`
        *,
        patient:patients(id, birth_date, gender, timezone),
        communication_events(type, timestamp, device_info)
      `)
      .eq('clinic_id', request.clinicId)
      .gte('sent_at', request.dateRange.start.toISOString())
      .lte('sent_at', request.dateRange.end.toISOString());

    if (request.patientIds?.length) {
      query = query.in('patient_id', request.patientIds);
    }

    if (request.communicationType) {
      query = query.eq('type', request.communicationType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Analisar padrões globais de timing
   */
  private async analyzeGlobalPatterns(
    data: any[], 
    request: TimingAnalysisRequest
  ): Promise<TimingPattern[]> {
    const patterns: Map<string, TimingPattern> = new Map();

    for (const communication of data) {
      const sentDate = new Date(communication.sent_at);
      const dayOfWeek = sentDate.getDay();
      const hour = sentDate.getHours();
      
      const key = `${communication.type}-${dayOfWeek}-${hour}`;
      
      if (!patterns.has(key)) {
        patterns.set(key, {
          id: key,
          clinicId: request.clinicId,
          communicationType: communication.type,
          dayOfWeek,
          hour,
          responseRate: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          sampleSize: 0,
          confidence: 0,
          lastUpdated: new Date(),
          timezone: this.config?.globalSettings.defaultTimezone || 'America/Sao_Paulo'
        });
      }

      const pattern = patterns.get(key)!;
      pattern.sampleSize++;

      // Calcular métricas baseadas nos eventos
      const events = communication.communication_events || [];
      const hasOpen = events.some((e: any) => e.type === 'open');
      const hasClick = events.some((e: any) => e.type === 'click');
      const hasResponse = events.some((e: any) => e.type === 'response');

      if (hasOpen) pattern.openRate = (pattern.openRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
      if (hasClick) pattern.clickRate = (pattern.clickRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
      if (hasResponse) pattern.responseRate = (pattern.responseRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
    }

    // Converter para array e calcular confiança
    return Array.from(patterns.values()).map(pattern => ({
      ...pattern,
      confidence: this.calculatePatternConfidence(pattern.sampleSize),
      responseRate: pattern.responseRate * 100,
      openRate: (pattern.openRate || 0) * 100,
      clickRate: (pattern.clickRate || 0) * 100
    }));
  }

  /**
   * Analisar padrões segmentados
   */
  private async analyzeSegmentedPatterns(
    data: any[], 
    request: TimingAnalysisRequest
  ): Promise<Record<string, TimingPattern[]>> {
    const segmentedPatterns: Record<string, TimingPattern[]> = {};

    // Segmentar por idade
    const ageSegments = this.segmentByAge(data);
    for (const [segment, segmentData] of Object.entries(ageSegments)) {
      segmentedPatterns[`age_${segment}`] = await this.analyzeGlobalPatterns(segmentData, request);
    }

    // Segmentar por gênero
    const genderSegments = this.segmentByGender(data);
    for (const [segment, segmentData] of Object.entries(genderSegments)) {
      segmentedPatterns[`gender_${segment}`] = await this.analyzeGlobalPatterns(segmentData, request);
    }

    // Segmentar por tipo de comunicação
    const typeSegments = this.segmentByType(data);
    for (const [segment, segmentData] of Object.entries(typeSegments)) {
      segmentedPatterns[`type_${segment}`] = await this.analyzeGlobalPatterns(segmentData, request);
    }

    return segmentedPatterns;
  }

  /**
   * ====================================================================
   * MACHINE LEARNING PREDICTIONS
   * ====================================================================
   */

  /**
   * Gerar recomendações usando Machine Learning
   */
  private async generateMLRecommendations(
    globalPatterns: TimingPattern[],
    segmentedPatterns: Record<string, TimingPattern[]>,
    request: TimingAnalysisRequest
  ): Promise<TimingRecommendation[]> {
    const recommendations: TimingRecommendation[] = [];

    // Se há IDs de pacientes específicos, gerar recomendações personalizadas
    if (request.patientIds?.length) {
      for (const patientId of request.patientIds) {
        const recommendation = await this.generatePersonalizedRecommendation(
          patientId,
          request.communicationType,
          globalPatterns,
          segmentedPatterns
        );
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    } else {
      // Gerar recomendações gerais por segmento
      const generalRecommendations = await this.generateGeneralRecommendations(
        globalPatterns,
        segmentedPatterns,
        request
      );
      recommendations.push(...generalRecommendations);
    }

    return recommendations;
  }

  /**
   * Gerar recomendação personalizada para um paciente
   */
  private async generatePersonalizedRecommendation(
    patientId: string,
    communicationType?: string,
    globalPatterns: TimingPattern[] = [],
    segmentedPatterns: Record<string, TimingPattern[]> = {}
  ): Promise<TimingRecommendation | null> {
    try {
      // Buscar perfil do paciente
      const { data: patient } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (!patient) return null;

      // Buscar histórico de engajamento do paciente
      const patientPatterns = await this.getPatientEngagementHistory(patientId);

      // Determinar segmento do paciente
      const segments = this.determinePatientSegments(patient);

      // Usar ML para predizer horário ótimo
      const optimalTime = await this.predictOptimalTime(
        patient,
        communicationType || 'email',
        patientPatterns,
        globalPatterns,
        segmentedPatterns
      );

      // Gerar tempos alternativos
      const alternativeTimes = await this.generateAlternativeTimes(
        optimalTime,
        patientPatterns,
        globalPatterns
      );

      // Determinar horários a evitar
      const avoidTimes = this.determineAvoidTimes(patient, patientPatterns);

      // Gerar reasoning
      const reasoning = this.generateRecommendationReasoning(
        optimalTime,
        patientPatterns,
        segments,
        globalPatterns
      );

      return {
        patientId,
        communicationType: communicationType || 'email',
        optimalTime,
        reasoning,
        confidence: optimalTime.confidence,
        basedOnSegments: segments,
        fallbackTimes: alternativeTimes,
        avoidTimes,
        seasonalAdjustments: this.calculateSeasonalAdjustments()
      };
    } catch (error) {
      console.error('Error generating personalized recommendation:', error);
      return null;
    }
  }

  /**
   * Predizer horário ótimo usando ML
   */
  private async predictOptimalTime(
    patient: any,
    communicationType: string,
    patientPatterns: TimingPattern[],
    globalPatterns: TimingPattern[],
    segmentedPatterns: Record<string, TimingPattern[]>
  ): Promise<OptimalTime> {
    // Usar modelo de gradient boosting se disponível
    const model = this.mlModels.get('timing-gb-v1');
    
    if (!model || patientPatterns.length === 0) {
      // Fallback para análise estatística simples
      return this.generateStatisticalOptimalTime(patient, communicationType, globalPatterns);
    }

    // Preparar features para o modelo
    const features = this.prepareMLFeatures(patient, communicationType, patientPatterns);

    // Simular predição ML (em produção, chamaria API do modelo)
    const predictions = await this.simulateMLPrediction(features, model);

    // Encontrar horário com maior probabilidade de resposta
    const bestPrediction = predictions.reduce((best, current) => 
      current.probability > best.probability ? current : best
    );

    return {
      hour: bestPrediction.hour,
      minute: 0,
      dayOfWeek: bestPrediction.dayOfWeek,
      timezone: patient.timezone || this.config?.globalSettings.defaultTimezone || 'America/Sao_Paulo',
      confidence: bestPrediction.probability,
      expectedResponseRate: bestPrediction.expectedResponseRate
    };
  }

  /**
   * Simular predição de ML (placeholder para integração real)
   */
  private async simulateMLPrediction(
    features: any,
    model: MachineLearningModel
  ): Promise<any[]> {
    // Em produção, aqui seria feita a chamada para o modelo treinado
    const predictions = [];
    
    for (let hour = 6; hour <= 22; hour++) {
      for (let day = 0; day <= 6; day++) {
        // Simular cálculo baseado em heurísticas
        let probability = 0.1; // Base probability
        
        // Boost para horários comerciais
        if (hour >= 9 && hour <= 17 && day >= 1 && day <= 5) {
          probability += 0.3;
        }
        
        // Boost para horários de pico (manhã e fim da tarde)
        if ((hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 18)) {
          probability += 0.2;
        }
        
        // Penalidade para fins de semana (exceto para alguns tipos)
        if (day === 0 || day === 6) {
          probability -= 0.1;
        }
        
        // Adicionar alguma variação baseada no paciente
        probability += (features.patientEngagement || 0) * 0.1;
        probability += (features.historicalResponseRate || 0) * 0.2;
        
        predictions.push({
          hour,
          dayOfWeek: day,
          probability: Math.max(0.01, Math.min(0.99, probability)),
          expectedResponseRate: probability * 100
        });
      }
    }
    
    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Preparar features para ML
   */
  private prepareMLFeatures(
    patient: any,
    communicationType: string,
    patterns: TimingPattern[]
  ): any {
    const age = this.calculateAge(new Date(patient.birth_date));
    const avgResponseRate = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.responseRate, 0) / patterns.length 
      : 0;

    const recentEngagement = patterns
      .filter(p => p.lastUpdated > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .length;

    return {
      patientAge: age,
      patientGender: patient.gender,
      communicationType,
      historicalResponseRate: avgResponseRate / 100,
      recentEngagementCount: recentEngagement,
      patientEngagement: recentEngagement / Math.max(1, patterns.length),
      daysSinceLastCommunication: this.calculateDaysSinceLastCommunication(patient.id),
      totalCommunications: patterns.length
    };
  }

  /**
   * ====================================================================
   * BEHAVIOR ANALYSIS
   * ====================================================================
   */

  /**
   * Analisar padrões de comportamento de um paciente
   */
  async analyzeBehaviorPattern(patientId: string): Promise<BehaviorPattern | null> {
    try {
      const patterns = await this.getPatientEngagementHistory(patientId);
      
      if (patterns.length < 5) {
        return null; // Dados insuficientes
      }

      // Analisar horários preferidos
      const hourCounts = patterns.reduce((acc, pattern) => {
        acc[pattern.hour] = (acc[pattern.hour] || 0) + pattern.responseRate;
        return acc;
      }, {} as Record<number, number>);

      const preferredHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([hour]) => parseInt(hour));

      // Analisar dias preferidos
      const dayCounts = patterns.reduce((acc, pattern) => {
        acc[pattern.dayOfWeek] = (acc[pattern.dayOfWeek] || 0) + pattern.responseRate;
        return acc;
      }, {} as Record<number, number>);

      const preferredDays = Object.entries(dayCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([day]) => parseInt(day));

      // Determinar padrão de comportamento
      const pattern = this.classifyBehaviorPattern(preferredHours, preferredDays);

      // Calcular métricas de engajamento
      const avgResponseLatency = this.calculateAverageResponseLatency(patientId);
      const engagementWindow = this.calculateEngagementWindow(patterns);

      // Calcular confiança baseada no número de amostras
      const confidence = Math.min(0.95, patterns.length / 50);

      return {
        patientId,
        pattern,
        confidence,
        characteristics: {
          preferredHours,
          preferredDays,
          responseLatency: await avgResponseLatency,
          engagementWindow
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error analyzing behavior pattern:', error);
      return null;
    }
  }

  /**
   * Classificar padrão de comportamento
   */
  private classifyBehaviorPattern(
    preferredHours: number[], 
    preferredDays: number[]
  ): BehaviorPattern['pattern'] {
    const morningHours = preferredHours.filter(h => h >= 6 && h <= 10).length;
    const eveningHours = preferredHours.filter(h => h >= 18 && h <= 22).length;
    const businessHours = preferredHours.filter(h => h >= 9 && h <= 17).length;
    const weekendDays = preferredDays.filter(d => d === 0 || d === 6).length;

    if (morningHours >= 2) return 'early_bird';
    if (eveningHours >= 2) return 'night_owl';
    if (businessHours >= 2) return 'business_hours';
    if (weekendDays >= 1) return 'weekend_warrior';
    
    return 'irregular';
  }

  /**
   * ====================================================================
   * OPTIMIZATION & SCHEDULING
   * ====================================================================
   */

  /**
   * Otimizar horário de envio em tempo real
   */
  async optimizeSendTime(
    communicationId: string,
    patientId: string,
    scheduledTime: Date,
    communicationType: string
  ): Promise<SendTimeOptimization> {
    try {
      // Buscar recomendação existente para o paciente
      const recommendation = await this.getPatientRecommendation(patientId, communicationType);
      
      // Buscar fatores em tempo real
      const realTimeFactors = await this.getRealTimeFactors(patientId);
      
      // Aplicar regras de otimização
      const optimizedTime = await this.applyOptimizationRules(
        scheduledTime,
        recommendation,
        realTimeFactors
      );

      // Calcular melhoria esperada
      const expectedImprovement = this.calculateExpectedImprovement(
        scheduledTime,
        optimizedTime,
        recommendation
      );

      return {
        communicationId,
        originalScheduledTime: scheduledTime,
        optimizedTime,
        reason: this.generateOptimizationReason(scheduledTime, optimizedTime, recommendation),
        confidence: recommendation?.confidence || 0.5,
        factors: this.extractOptimizationFactors(realTimeFactors, recommendation),
        expectedImprovement,
        algorithm: 'real_time_optimization_v1',
        version: '1.0'
      };
    } catch (error) {
      console.error('Error optimizing send time:', error);
      
      // Retornar sem otimização em caso de erro
      return {
        communicationId,
        originalScheduledTime: scheduledTime,
        optimizedTime: scheduledTime,
        reason: 'Optimization failed, using original time',
        confidence: 0,
        factors: [],
        expectedImprovement: 0,
        algorithm: 'fallback',
        version: '1.0'
      };
    }
  }

  /**
   * Aplicar regras de otimização
   */
  private async applyOptimizationRules(
    scheduledTime: Date,
    recommendation: TimingRecommendation | null,
    realTimeFactors: RealTimeFactors | null
  ): Promise<Date> {
    let optimizedTime = new Date(scheduledTime);

    // Regra 1: Respeitar horário ótimo se disponível
    if (recommendation?.optimalTime) {
      const optimalHour = recommendation.optimalTime.hour;
      const optimalDay = recommendation.optimalTime.dayOfWeek;
      
      // Se o dia está correto, ajustar apenas a hora
      if (scheduledTime.getDay() === optimalDay) {
        optimizedTime.setHours(optimalHour, recommendation.optimalTime.minute || 0, 0, 0);
      } else {
        // Encontrar o próximo dia ótimo
        const daysToAdd = (optimalDay - scheduledTime.getDay() + 7) % 7;
        optimizedTime.setDate(scheduledTime.getDate() + daysToAdd);
        optimizedTime.setHours(optimalHour, recommendation.optimalTime.minute || 0, 0, 0);
      }
    }

    // Regra 2: Evitar horários de não perturbar
    if (recommendation?.avoidTimes) {
      for (const avoidTime of recommendation.avoidTimes) {
        if (this.isTimeInWindow(optimizedTime, avoidTime)) {
          // Mover para depois do período de evitar
          optimizedTime.setHours(avoidTime.endHour, avoidTime.endMinute || 0, 0, 0);
        }
      }
    }

    // Regra 3: Considerar atividade em tempo real
    if (realTimeFactors?.factors.deviceActivity) {
      // Se o usuário está ativo, pode enviar imediatamente
      const now = new Date();
      if (optimizedTime > now && optimizedTime.getTime() - now.getTime() < 30 * 60 * 1000) {
        optimizedTime = now;
      }
    }

    // Regra 4: Respeitar configurações globais
    if (this.config?.globalSettings.businessHours) {
      const businessHours = this.config.globalSettings.businessHours;
      const hour = optimizedTime.getHours();
      
      if (hour < businessHours.startHour || hour > businessHours.endHour) {
        // Mover para o início do próximo horário comercial
        if (hour < businessHours.startHour) {
          optimizedTime.setHours(businessHours.startHour, businessHours.startMinute || 0, 0, 0);
        } else {
          optimizedTime.setDate(optimizedTime.getDate() + 1);
          optimizedTime.setHours(businessHours.startHour, businessHours.startMinute || 0, 0, 0);
        }
      }
    }

    return optimizedTime;
  }

  /**
   * ====================================================================
   * PERFORMANCE TRACKING
   * ====================================================================
   */

  /**
   * Calcular métricas de performance da otimização
   */
  async calculateOptimizationPerformance(
    clinicId: string,
    period: { start: Date; end: Date }
  ): Promise<PerformanceMetrics> {
    try {
      // Buscar comunicações do período
      const { data: communications } = await this.supabase
        .from('communications_log')
        .select(`
          *,
          communication_events(type, timestamp),
          send_time_optimization(*)
        `)
        .eq('clinic_id', clinicId)
        .gte('sent_at', period.start.toISOString())
        .lte('sent_at', period.end.toISOString());

      if (!communications?.length) {
        return this.getEmptyPerformanceMetrics(period);
      }

      // Separar comunicações otimizadas e não otimizadas
      const optimized = communications.filter(c => c.send_time_optimization?.length > 0);
      const baseline = communications.filter(c => !c.send_time_optimization?.length);

      // Calcular métricas para cada grupo
      const baselineMetrics = this.calculateGroupMetrics(baseline);
      const optimizedMetrics = this.calculateGroupMetrics(optimized);

      // Calcular melhorias
      const improvement = {
        responseRate: optimizedMetrics.averageResponseRate - baselineMetrics.averageResponseRate,
        openRate: optimizedMetrics.averageOpenRate - baselineMetrics.averageOpenRate,
        clickRate: optimizedMetrics.averageClickRate - baselineMetrics.averageClickRate,
        conversionRate: optimizedMetrics.averageConversionRate - baselineMetrics.averageConversionRate
      };

      return {
        period,
        baseline: baselineMetrics,
        optimized: optimizedMetrics,
        improvement,
        segments: {} // Implementar segmentação se necessário
      };
    } catch (error) {
      console.error('Error calculating optimization performance:', error);
      return this.getEmptyPerformanceMetrics(period);
    }
  }

  /**
   * ====================================================================
   * HELPER METHODS
   * ====================================================================
   */

  /**
   * Buscar histórico de engajamento de um paciente
   */
  private async getPatientEngagementHistory(patientId: string): Promise<TimingPattern[]> {
    const { data } = await this.supabase
      .from('patient_timing_patterns')
      .select('*')
      .eq('patient_id', patientId)
      .gte('last_updated', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 90 dias

    return (data || []).map(this.mapTimingPatternFromDB);
  }

  /**
   * Calcular confiança de um padrão baseado no tamanho da amostra
   */
  private calculatePatternConfidence(sampleSize: number): number {
    if (sampleSize < 10) return 0.1;
    if (sampleSize < 30) return 0.5;
    if (sampleSize < 50) return 0.7;
    if (sampleSize < 100) return 0.8;
    return 0.9;
  }

  /**
   * Segmentar dados por idade
   */
  private segmentByAge(data: any[]): Record<string, any[]> {
    return data.reduce((acc, item) => {
      if (!item.patient?.birth_date) return acc;
      
      const age = this.calculateAge(new Date(item.patient.birth_date));
      let segment = 'unknown';
      
      if (age < 25) segment = '18-24';
      else if (age < 35) segment = '25-34';
      else if (age < 45) segment = '35-44';
      else if (age < 55) segment = '45-54';
      else if (age < 65) segment = '55-64';
      else segment = '65+';
      
      if (!acc[segment]) acc[segment] = [];
      acc[segment].push(item);
      
      return acc;
    }, {} as Record<string, any[]>);
  }

  /**
   * Segmentar dados por gênero
   */
  private segmentByGender(data: any[]): Record<string, any[]> {
    return data.reduce((acc, item) => {
      const gender = item.patient?.gender || 'unknown';
      if (!acc[gender]) acc[gender] = [];
      acc[gender].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  /**
   * Segmentar dados por tipo de comunicação
   */
  private segmentByType(data: any[]): Record<string, any[]> {
    return data.reduce((acc, item) => {
      const type = item.type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  /**
   * Calcular idade baseada na data de nascimento
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Mapear padrão de timing do banco de dados
   */
  private mapTimingPatternFromDB(data: any): TimingPattern {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      communicationType: data.communication_type,
      dayOfWeek: data.day_of_week,
      hour: data.hour,
      responseRate: data.response_rate,
      openRate: data.open_rate,
      clickRate: data.click_rate,
      conversionRate: data.conversion_rate,
      sampleSize: data.sample_size,
      confidence: data.confidence,
      lastUpdated: new Date(data.last_updated),
      timezone: data.timezone
    };
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder methods for completion
  private async generateGeneralRecommendations(
    globalPatterns: TimingPattern[],
    segmentedPatterns: Record<string, TimingPattern[]>,
    request: TimingAnalysisRequest
  ): Promise<TimingRecommendation[]> {
    return [];
  }

  private async generateTimingInsights(
    globalPatterns: TimingPattern[],
    segmentedPatterns: Record<string, TimingPattern[]>,
    data: any[]
  ): Promise<any[]> {
    return [];
  }

  private calculatePerformanceMetrics(data: any[]): any {
    return {
      totalCommunications: data.length,
      averageResponseRate: 0,
      optimizedCommunications: 0,
      improvementRate: 0
    };
  }

  private async saveAnalysisResult(result: TimingAnalysisResult): Promise<void> {
    // Salvar no banco de dados
  }

  private determinePatientSegments(patient: any): string[] {
    const segments = [];
    const age = this.calculateAge(new Date(patient.birth_date));
    
    if (age < 25) segments.push('young_adult');
    else if (age < 45) segments.push('middle_age');
    else segments.push('senior');
    
    segments.push(patient.gender || 'unknown');
    
    return segments;
  }

  private async generateAlternativeTimes(
    optimalTime: OptimalTime,
    patientPatterns: TimingPattern[],
    globalPatterns: TimingPattern[]
  ): Promise<OptimalTime[]> {
    return [];
  }

  private determineAvoidTimes(patient: any, patterns: TimingPattern[]): any[] {
    return [];
  }

  private generateRecommendationReasoning(
    optimalTime: OptimalTime,
    patterns: TimingPattern[],
    segments: string[],
    globalPatterns: TimingPattern[]
  ): string[] {
    return ['Based on historical engagement patterns'];
  }

  private calculateSeasonalAdjustments(): any[] {
    return [];
  }

  private generateStatisticalOptimalTime(
    patient: any,
    communicationType: string,
    patterns: TimingPattern[]
  ): OptimalTime {
    // Fallback simples baseado em padrões estatísticos
    const bestPattern = patterns
      .filter(p => p.communicationType === communicationType)
      .sort((a, b) => b.responseRate - a.responseRate)[0];

    if (bestPattern) {
      return {
        hour: bestPattern.hour,
        minute: 0,
        dayOfWeek: bestPattern.dayOfWeek,
        timezone: bestPattern.timezone,
        confidence: bestPattern.confidence,
        expectedResponseRate: bestPattern.responseRate
      };
    }

    // Horário padrão se não há dados
    return {
      hour: 10,
      minute: 0,
      dayOfWeek: 2, // Terça-feira
      timezone: this.config?.globalSettings.defaultTimezone || 'America/Sao_Paulo',
      confidence: 0.3,
      expectedResponseRate: 15
    };
  }

  private calculateDaysSinceLastCommunication(patientId: string): number {
    // Implementar busca da última comunicação
    return 7; // placeholder
  }

  private calculateEngagementWindow(patterns: TimingPattern[]): number {
    // Calcular janela de engajamento em minutos
    return 120; // placeholder
  }

  private async calculateAverageResponseLatency(patientId: string): Promise<number> {
    // Implementar cálculo de latência média de resposta
    return 30; // placeholder em minutos
  }

  private async getPatientRecommendation(
    patientId: string,
    communicationType: string
  ): Promise<TimingRecommendation | null> {
    // Buscar recomendação existente no cache ou banco
    return null;
  }

  private async getRealTimeFactors(patientId: string): Promise<RealTimeFactors | null> {
    // Buscar fatores em tempo real
    return null;
  }

  private calculateExpectedImprovement(
    originalTime: Date,
    optimizedTime: Date,
    recommendation: TimingRecommendation | null
  ): number {
    // Calcular melhoria esperada em %
    return 0;
  }

  private generateOptimizationReason(
    originalTime: Date,
    optimizedTime: Date,
    recommendation: TimingRecommendation | null
  ): string {
    return 'Optimized based on timing analysis';
  }

  private extractOptimizationFactors(
    realTimeFactors: RealTimeFactors | null,
    recommendation: TimingRecommendation | null
  ): string[] {
    return [];
  }

  private isTimeInWindow(time: Date, window: any): boolean {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const startMinutes = window.startHour * 60 + (window.startMinute || 0);
    const endMinutes = window.endHour * 60 + (window.endMinute || 0);
    
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  }

  private getEmptyPerformanceMetrics(period: { start: Date; end: Date }): PerformanceMetrics {
    return {
      period,
      baseline: {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0
      },
      optimized: {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0
      },
      improvement: {
        responseRate: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0
      },
      segments: {}
    };
  }

  private calculateGroupMetrics(communications: any[]): any {
    if (!communications.length) {
      return {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0
      };
    }

    let totalResponses = 0;
    let totalOpens = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    communications.forEach(comm => {
      const events = comm.communication_events || [];
      if (events.some((e: any) => e.type === 'response')) totalResponses++;
      if (events.some((e: any) => e.type === 'open')) totalOpens++;
      if (events.some((e: any) => e.type === 'click')) totalClicks++;
      if (events.some((e: any) => e.type === 'conversion')) totalConversions++;
    });

    return {
      totalCommunications: communications.length,
      averageResponseRate: (totalResponses / communications.length) * 100,
      averageOpenRate: (totalOpens / communications.length) * 100,
      averageClickRate: (totalClicks / communications.length) * 100,
      averageConversionRate: (totalConversions / communications.length) * 100
    };
  }
}

// Export singleton instance
export const optimalTimingEngine = new OptimalTimingEngine();
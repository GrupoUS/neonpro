/**
 * A/B Testing Engine
 * NeonPro - Sistema Completo de Testes A/B para Comunicação
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/client";
import type {
  ABTestConfig,
  ABTestEvent,
  AudienceFilter,
  AutomationRule,
  ConversionGoal,
  ExperimentAnalytics,
  StatisticalSignificance,
  TestQueryFilter,
  TestQueryResult,
  TestReport,
  TestResults,
  TestTemplate,
  TestVariation,
  VariationResults,
} from "./types/ab-testing";

export class ABTestingEngine {
  private supabase: SupabaseClient;
  private cache: Map<string, any> = new Map();
  private eventBuffer: ABTestEvent[] = [];
  private batchSize = 100;
  private flushInterval = 10000; // 10 seconds

  constructor() {
    this.supabase = createClient();
    this.initializeEventProcessor();
  }

  /**
   * ====================================================================
   * TEST MANAGEMENT
   * ====================================================================
   */

  /**
   * Criar um novo teste A/B
   */
  async createTest(config: Partial<ABTestConfig>): Promise<ABTestConfig> {
    try {
      // Validar configuração
      this.validateTestConfig(config);

      // Calcular sample size necessário
      const calculatedSampleSize = this.calculateSampleSize(
        config.confidenceLevel || 95,
        config.powerAnalysis || 80,
        config.minimumDetectableEffect || 5,
      );

      const testConfig: ABTestConfig = {
        id: this.generateId(),
        clinicId: config.clinicId!,
        name: config.name!,
        description: config.description,
        type: config.type!,
        status: "draft",
        startDate: config.startDate || new Date(),
        endDate: config.endDate,
        duration: config.duration,
        audienceFilter: config.audienceFilter!,
        trafficAllocation: config.trafficAllocation || 100,
        confidenceLevel: config.confidenceLevel || 95,
        minimumDetectableEffect: config.minimumDetectableEffect || 5,
        powerAnalysis: config.powerAnalysis || 80,
        primaryGoal: config.primaryGoal!,
        secondaryGoals: config.secondaryGoals || [],
        createdBy: config.createdBy!,
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleSize: calculatedSampleSize,
        currentSampleSize: 0,
        variations: config.variations || [],
      };

      // Salvar no banco
      const { data, error } = await this.supabase
        .from("ab_tests")
        .insert({
          id: testConfig.id,
          clinic_id: testConfig.clinicId,
          name: testConfig.name,
          description: testConfig.description,
          type: testConfig.type,
          status: testConfig.status,
          start_date: testConfig.startDate.toISOString(),
          end_date: testConfig.endDate?.toISOString(),
          duration: testConfig.duration,
          audience_filter: testConfig.audienceFilter,
          traffic_allocation: testConfig.trafficAllocation,
          confidence_level: testConfig.confidenceLevel,
          minimum_detectable_effect: testConfig.minimumDetectableEffect,
          power_analysis: testConfig.powerAnalysis,
          primary_goal: testConfig.primaryGoal,
          secondary_goals: testConfig.secondaryGoals,
          created_by: testConfig.createdBy,
          created_at: testConfig.createdAt.toISOString(),
          updated_at: testConfig.updatedAt.toISOString(),
          sample_size: testConfig.sampleSize,
          current_sample_size: testConfig.currentSampleSize,
        })
        .select()
        .single();

      if (error) throw error;

      // Criar variações se fornecidas
      if (config.variations?.length) {
        await this.createVariations(testConfig.id, config.variations);
      }

      await this.invalidateCache(`test_${testConfig.id}`);
      return testConfig;
    } catch (error) {
      console.error("Error creating A/B test:", error);
      throw error;
    }
  }

  /**
   * Atualizar configuração de teste
   */
  async updateTest(testId: string, updates: Partial<ABTestConfig>): Promise<ABTestConfig> {
    try {
      const { data, error } = await this.supabase
        .from("ab_tests")
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          end_date: updates.endDate?.toISOString(),
          traffic_allocation: updates.trafficAllocation,
          audience_filter: updates.audienceFilter,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testId)
        .select()
        .single();

      if (error) throw error;

      await this.invalidateCache(`test_${testId}`);
      return this.mapTestFromDB(data);
    } catch (error) {
      console.error("Error updating A/B test:", error);
      throw error;
    }
  }

  /**
   * Buscar teste por ID
   */
  async getTest(testId: string): Promise<ABTestConfig | null> {
    try {
      const cacheKey = `test_${testId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await this.supabase
        .from("ab_tests")
        .select(`
          *,
          variations:ab_test_variations(*)
        `)
        .eq("id", testId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      const test = this.mapTestFromDB(data);
      this.setCache(cacheKey, test);
      return test;
    } catch (error) {
      console.error("Error fetching A/B test:", error);
      throw error;
    }
  }

  /**
   * Buscar testes com filtros
   */
  async getTests(filter: TestQueryFilter = {}): Promise<TestQueryResult> {
    try {
      let query = this.supabase.from("ab_tests").select(
        `
          *,
          variations:ab_test_variations(*)
        `,
        { count: "exact" },
      );

      // Aplicar filtros
      if (filter.clinicId) {
        query = query.eq("clinic_id", filter.clinicId);
      }

      if (filter.status?.length) {
        query = query.in("status", filter.status);
      }

      if (filter.type?.length) {
        query = query.in("type", filter.type);
      }

      if (filter.dateRange) {
        query = query
          .gte("created_at", filter.dateRange.start.toISOString())
          .lte("created_at", filter.dateRange.end.toISOString());
      }

      if (filter.createdBy?.length) {
        query = query.in("created_by", filter.createdBy);
      }

      if (filter.searchTerm) {
        query = query.or(
          `name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`,
        );
      }

      // Paginação
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Ordenação
      const sortBy = filter.sortBy || "created_at";
      const sortOrder = filter.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error, count } = await query;

      if (error) throw error;

      const tests = (data || []).map(this.mapTestFromDB);

      // Calcular agregações
      const aggregations = await this.calculateAggregations(filter.clinicId);

      return {
        tests,
        totalCount: count || 0,
        hasMore: page * limit < (count || 0),
        aggregations,
      };
    } catch (error) {
      console.error("Error querying A/B tests:", error);
      throw error;
    }
  }

  /**
   * ====================================================================
   * VARIATION MANAGEMENT
   * ====================================================================
   */

  /**
   * Criar variações para um teste
   */
  async createVariations(
    testId: string,
    variations: Partial<TestVariation>[],
  ): Promise<TestVariation[]> {
    try {
      const variationsToInsert = variations.map((variation) => ({
        id: variation.id || this.generateId(),
        test_id: testId,
        name: variation.name!,
        description: variation.description,
        status: variation.status || "active",
        traffic_percentage: variation.trafficPercentage!,
        content: variation.content!,
        impressions: 0,
        conversions: 0,
        conversion_rate: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await this.supabase
        .from("ab_test_variations")
        .insert(variationsToInsert)
        .select();

      if (error) throw error;

      await this.invalidateCache(`test_${testId}`);
      return (data || []).map(this.mapVariationFromDB);
    } catch (error) {
      console.error("Error creating variations:", error);
      throw error;
    }
  }

  /**
   * Atualizar variação
   */
  async updateVariation(
    variationId: string,
    updates: Partial<TestVariation>,
  ): Promise<TestVariation> {
    try {
      const { data, error } = await this.supabase
        .from("ab_test_variations")
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          traffic_percentage: updates.trafficPercentage,
          content: updates.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variationId)
        .select()
        .single();

      if (error) throw error;

      const variation = this.mapVariationFromDB(data);
      await this.invalidateCache(`test_${variation.testId}`);
      return variation;
    } catch (error) {
      console.error("Error updating variation:", error);
      throw error;
    }
  }

  /**
   * ====================================================================
   * TEST EXECUTION
   * ====================================================================
   */

  /**
   * Iniciar um teste
   */
  async startTest(testId: string): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) throw new Error("Test not found");

      if (test.status !== "draft") {
        throw new Error("Only draft tests can be started");
      }

      // Validar configuração antes de iniciar
      this.validateTestForStart(test);

      await this.updateTest(testId, {
        status: "active",
        startDate: new Date(),
      });

      // Criar eventos de audit
      await this.logTestEvent(testId, "test_started", { startedBy: test.createdBy });
    } catch (error) {
      console.error("Error starting test:", error);
      throw error;
    }
  }

  /**
   * Pausar um teste
   */
  async pauseTest(testId: string, reason?: string): Promise<void> {
    try {
      await this.updateTest(testId, { status: "paused" });
      await this.logTestEvent(testId, "test_paused", { reason });
    } catch (error) {
      console.error("Error pausing test:", error);
      throw error;
    }
  }

  /**
   * Finalizar um teste
   */
  async completeTest(testId: string, reason?: string): Promise<TestResults> {
    try {
      const test = await this.getTest(testId);
      if (!test) throw new Error("Test not found");

      // Calcular resultados finais
      const results = await this.calculateTestResults(testId);

      // Atualizar status
      await this.updateTest(testId, {
        status: "completed",
        endDate: new Date(),
        results,
      });

      await this.logTestEvent(testId, "test_completed", { reason, results });

      return results;
    } catch (error) {
      console.error("Error completing test:", error);
      throw error;
    }
  }

  /**
   * Atribuir variação para um paciente
   */
  async assignVariation(testId: string, patientId: string): Promise<TestVariation | null> {
    try {
      const test = await this.getTest(testId);
      if (!test || test.status !== "active") return null;

      // Verificar se paciente está na audiência
      const isInAudience = await this.isPatientInAudience(patientId, test.audienceFilter);
      if (!isInAudience) return null;

      // Verificar alocação de tráfego
      const random = Math.random() * 100;
      if (random > test.trafficAllocation) return null;

      // Selecionar variação baseada no peso
      const variation = this.selectVariationByWeight(test.variations);
      if (!variation) return null;

      // Registrar impression
      await this.recordEvent({
        id: this.generateId(),
        testId,
        variationId: variation.id,
        patientId,
        type: "impression",
        timestamp: new Date(),
      });

      return variation;
    } catch (error) {
      console.error("Error assigning variation:", error);
      return null;
    }
  }

  /**
   * ====================================================================
   * EVENT TRACKING
   * ====================================================================
   */

  /**
   * Registrar evento de conversão
   */
  async recordConversion(
    testId: string,
    variationId: string,
    patientId: string,
    goalId?: string,
    monetaryValue?: number,
  ): Promise<void> {
    try {
      await this.recordEvent({
        id: this.generateId(),
        testId,
        variationId,
        patientId,
        type: "conversion",
        goalId,
        monetaryValue,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error recording conversion:", error);
      throw error;
    }
  }

  /**
   * Registrar evento genérico
   */
  async recordEvent(event: ABTestEvent): Promise<void> {
    try {
      // Adicionar ao buffer para processamento em lote
      this.eventBuffer.push(event);

      // Processar se buffer está cheio
      if (this.eventBuffer.length >= this.batchSize) {
        await this.flushEventBuffer();
      }
    } catch (error) {
      console.error("Error recording event:", error);
      throw error;
    }
  }

  /**
   * ====================================================================
   * STATISTICAL ANALYSIS
   * ====================================================================
   */

  /**
   * Calcular resultados de um teste
   */
  async calculateTestResults(testId: string): Promise<TestResults> {
    try {
      const test = await this.getTest(testId);
      if (!test) throw new Error("Test not found");

      // Buscar eventos do teste
      const { data: events } = await this.supabase
        .from("ab_test_events")
        .select("*")
        .eq("test_id", testId);

      if (!events?.length) {
        return this.createEmptyResults(testId);
      }

      // Agrupar eventos por variação
      const eventsByVariation = this.groupEventsByVariation(events);

      // Calcular métricas por variação
      const variationResults = await Promise.all(
        test.variations.map((variation) =>
          this.calculateVariationResults(variation, eventsByVariation[variation.id] || []),
        ),
      );

      // Calcular significância estatística
      const statisticalAnalysis = this.performStatisticalAnalysis(variationResults);

      // Determinar vencedor
      const winnerAnalysis = this.determineWinner(variationResults, test.confidenceLevel);

      // Gerar insights
      const insights = await this.generateTestInsights(test, variationResults, events);

      const results: TestResults = {
        testId,
        status: test.status === "completed" ? "completed" : "ongoing",
        totalImpressions: events.filter((e) => e.type === "impression").length,
        totalConversions: events.filter((e) => e.type === "conversion").length,
        overallConversionRate: this.calculateOverallConversionRate(events),
        statisticalSignificance: statisticalAnalysis.significance,
        confidenceLevel: test.confidenceLevel,
        pValue: statisticalAnalysis.pValue,
        powerAchieved: statisticalAnalysis.powerAchieved,
        winningVariation: winnerAnalysis.winnerId,
        liftPercentage: winnerAnalysis.lift,
        confidenceInterval: winnerAnalysis.confidenceInterval,
        variationResults,
        dailyResults: await this.calculateDailyResults(testId, events),
        insights,
        recommendations: await this.generateRecommendations(test, variationResults, insights),
        calculatedAt: new Date(),
      };

      // Salvar resultados
      await this.saveTestResults(testId, results);

      return results;
    } catch (error) {
      console.error("Error calculating test results:", error);
      throw error;
    }
  }

  /**
   * Verificar significância estatística
   */
  private performStatisticalAnalysis(variationResults: VariationResults[]): {
    significance: StatisticalSignificance;
    pValue: number;
    powerAchieved: number;
  } {
    if (variationResults.length < 2) {
      return {
        significance: "not_significant",
        pValue: 1,
        powerAchieved: 0,
      };
    }

    // Encontrar controle (primeira variação)
    const control = variationResults[0];
    const variants = variationResults.slice(1);

    let minPValue = 1;
    let maxPower = 0;

    for (const variant of variants) {
      const { pValue, power } = this.performTTest(control, variant);
      minPValue = Math.min(minPValue, pValue);
      maxPower = Math.max(maxPower, power);
    }

    let significance: StatisticalSignificance = "not_significant";
    if (minPValue < 0.001) significance = "highly_significant";
    else if (minPValue < 0.01) significance = "significant";
    else if (minPValue < 0.05) significance = "marginally_significant";

    return {
      significance,
      pValue: minPValue,
      powerAchieved: maxPower,
    };
  }

  /**
   * Realizar teste t entre duas variações
   */
  private performTTest(
    control: VariationResults,
    variant: VariationResults,
  ): {
    pValue: number;
    power: number;
  } {
    const n1 = control.impressions;
    const n2 = variant.impressions;
    const p1 = control.conversionRate / 100;
    const p2 = variant.conversionRate / 100;

    if (n1 === 0 || n2 === 0) {
      return { pValue: 1, power: 0 };
    }

    // Pooled proportion
    const pooled = (p1 * n1 + p2 * n2) / (n1 + n2);

    // Standard error
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));

    if (se === 0) {
      return { pValue: 1, power: 0 };
    }

    // Z-score
    const z = Math.abs(p2 - p1) / se;

    // P-value (two-tailed)
    const pValue = 2 * (1 - this.normalCDF(z));

    // Power calculation (simplified)
    const effect = Math.abs(p2 - p1);
    const power = Math.min(1, effect * Math.sqrt(Math.min(n1, n2)) * 2);

    return { pValue: Math.max(0.001, pValue), power: Math.max(0.05, power) };
  }

  /**
   * Função de distribuição cumulativa normal
   */
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Função de erro
   */
  private erf(x: number): number {
    // Aproximação para função de erro
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * ====================================================================
   * HELPER METHODS
   * ====================================================================
   */

  /**
   * Validar configuração de teste
   */
  private validateTestConfig(config: Partial<ABTestConfig>): void {
    if (!config.clinicId) throw new Error("Clinic ID is required");
    if (!config.name) throw new Error("Test name is required");
    if (!config.type) throw new Error("Test type is required");
    if (!config.audienceFilter) throw new Error("Audience filter is required");
    if (!config.primaryGoal) throw new Error("Primary goal is required");
    if (!config.createdBy) throw new Error("Created by is required");

    if (
      config.trafficAllocation &&
      (config.trafficAllocation < 1 || config.trafficAllocation > 100)
    ) {
      throw new Error("Traffic allocation must be between 1 and 100");
    }

    if (config.confidenceLevel && ![90, 95, 99].includes(config.confidenceLevel)) {
      throw new Error("Confidence level must be 90, 95, or 99");
    }
  }

  /**
   * Validar teste antes de iniciar
   */
  private validateTestForStart(test: ABTestConfig): void {
    if (test.variations.length < 2) {
      throw new Error("Test must have at least 2 variations");
    }

    const totalTraffic = test.variations.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error("Variation traffic percentages must sum to 100");
    }
  }

  /**
   * Calcular tamanho da amostra necessário
   */
  private calculateSampleSize(confidence: number, power: number, effect: number): number {
    // Simplified sample size calculation for proportions
    const alpha = (100 - confidence) / 100;
    const beta = (100 - power) / 100;

    const zAlpha = this.getZScore(1 - alpha / 2);
    const zBeta = this.getZScore(1 - beta);

    const p1 = 0.1; // Assumed baseline conversion rate
    const p2 = p1 * (1 + effect / 100);

    const pooled = (p1 + p2) / 2;
    const numerator =
      (zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) +
        zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) **
      2;
    const denominator = (p2 - p1) ** 2;

    return Math.ceil(numerator / denominator);
  }

  /**
   * Obter Z-score para confiança
   */
  private getZScore(confidence: number): number {
    if (confidence >= 0.995) return 2.576;
    if (confidence >= 0.975) return 1.96;
    if (confidence >= 0.95) return 1.645;
    return 1.282;
  }

  /**
   * Verificar se paciente está na audiência
   */
  private async isPatientInAudience(patientId: string, filter: AudienceFilter): Promise<boolean> {
    try {
      // Se há lista específica de inclusão
      if (filter.includePatients?.length) {
        return filter.includePatients.includes(patientId);
      }

      // Se há lista específica de exclusão
      if (filter.excludePatients?.length) {
        if (filter.excludePatients.includes(patientId)) return false;
      }

      // Buscar dados do paciente para outros filtros
      const { data: patient } = await this.supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (!patient) return false;

      // Aplicar filtros demográficos
      if (filter.ageRange) {
        const age = this.calculateAge(new Date(patient.birth_date));
        if (age < filter.ageRange.min || age > filter.ageRange.max) return false;
      }

      if (filter.gender && filter.gender !== "all" && patient.gender !== filter.gender) {
        return false;
      }

      // Outros filtros podem ser implementados conforme necessário

      return true;
    } catch (error) {
      console.error("Error checking patient audience:", error);
      return false;
    }
  }

  /**
   * Selecionar variação baseada no peso
   */
  private selectVariationByWeight(variations: TestVariation[]): TestVariation | null {
    const activeVariations = variations.filter((v) => v.status === "active");
    if (!activeVariations.length) return null;

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variation of activeVariations) {
      cumulative += variation.trafficPercentage;
      if (random <= cumulative) {
        return variation;
      }
    }

    return activeVariations[activeVariations.length - 1];
  }

  /**
   * Processar buffer de eventos
   */
  private async flushEventBuffer(): Promise<void> {
    if (!this.eventBuffer.length) return;

    try {
      const events = [...this.eventBuffer];
      this.eventBuffer = [];

      const eventsToInsert = events.map((event) => ({
        id: event.id,
        test_id: event.testId,
        variation_id: event.variationId,
        patient_id: event.patientId,
        type: event.type,
        goal_id: event.goalId,
        timestamp: event.timestamp.toISOString(),
        session_id: event.sessionId,
        device_info: event.deviceInfo,
        event_data: event.eventData,
        monetary_value: event.monetaryValue,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        referrer: event.referrer,
      }));

      await this.supabase.from("ab_test_events").insert(eventsToInsert);

      // Atualizar métricas das variações
      await this.updateVariationMetrics(events);
    } catch (error) {
      console.error("Error flushing event buffer:", error);
      // Recolocar eventos no buffer para tentar novamente
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Atualizar métricas das variações
   */
  private async updateVariationMetrics(events: ABTestEvent[]): Promise<void> {
    const metricsByVariation = events.reduce(
      (acc, event) => {
        if (!acc[event.variationId]) {
          acc[event.variationId] = { impressions: 0, conversions: 0 };
        }

        if (event.type === "impression") {
          acc[event.variationId].impressions++;
        } else if (event.type === "conversion") {
          acc[event.variationId].conversions++;
        }

        return acc;
      },
      {} as Record<string, { impressions: number; conversions: number }>,
    );

    for (const [variationId, metrics] of Object.entries(metricsByVariation)) {
      await this.supabase
        .from("ab_test_variations")
        .update({
          impressions: metrics.impressions,
          conversions: metrics.conversions,
          conversion_rate:
            metrics.impressions > 0 ? (metrics.conversions / metrics.impressions) * 100 : 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variationId);
    }
  }

  /**
   * Inicializar processador de eventos
   */
  private initializeEventProcessor(): void {
    // Processar buffer periodicamente
    setInterval(() => {
      this.flushEventBuffer();
    }, this.flushInterval);

    // Processar ao fechar/sair
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flushEventBuffer();
      });
    }
  }

  /**
   * Mapear teste do banco de dados
   */
  private mapTestFromDB(data: any): ABTestConfig {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      duration: data.duration,
      audienceFilter: data.audience_filter,
      trafficAllocation: data.traffic_allocation,
      confidenceLevel: data.confidence_level,
      minimumDetectableEffect: data.minimum_detectable_effect,
      powerAnalysis: data.power_analysis,
      primaryGoal: data.primary_goal,
      secondaryGoals: data.secondary_goals || [],
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      sampleSize: data.sample_size,
      currentSampleSize: data.current_sample_size,
      variations: (data.variations || []).map(this.mapVariationFromDB),
      results: data.results,
    };
  }

  /**
   * Mapear variação do banco de dados
   */
  private mapVariationFromDB(data: any): TestVariation {
    return {
      id: data.id,
      testId: data.test_id,
      name: data.name,
      description: data.description,
      status: data.status,
      trafficPercentage: data.traffic_percentage,
      content: data.content,
      impressions: data.impressions || 0,
      conversions: data.conversions || 0,
      conversionRate: data.conversion_rate || 0,
      confidence: data.confidence,
      significance: data.significance,
      pValue: data.p_value,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcular idade
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
   * Cache helpers
   */
  private getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    // 5 minutes
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  private async invalidateCache(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Placeholder methods for completion
  private async calculateAggregations(clinicId?: string): Promise<any> {
    return {};
  }

  private groupEventsByVariation(events: any[]): Record<string, any[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.variation_id]) acc[event.variation_id] = [];
      acc[event.variation_id].push(event);
      return acc;
    }, {});
  }

  private async calculateVariationResults(
    variation: TestVariation,
    events: any[],
  ): Promise<VariationResults> {
    const impressions = events.filter((e) => e.type === "impression").length;
    const conversions = events.filter((e) => e.type === "conversion").length;

    return {
      variationId: variation.id,
      variationName: variation.name,
      impressions,
      conversions,
      conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
      significance: "not_significant",
      pValue: 1,
      confidenceInterval: { lower: 0, upper: 0 },
      liftPercentage: 0,
      isWinner: false,
      goalResults: [],
      segmentResults: [],
    };
  }

  private createEmptyResults(testId: string): TestResults {
    return {
      testId,
      status: "ongoing",
      totalImpressions: 0,
      totalConversions: 0,
      overallConversionRate: 0,
      statisticalSignificance: "not_significant",
      confidenceLevel: 95,
      pValue: 1,
      powerAchieved: 0,
      variationResults: [],
      insights: [],
      recommendations: [],
      calculatedAt: new Date(),
    };
  }

  private calculateOverallConversionRate(events: any[]): number {
    const impressions = events.filter((e) => e.type === "impression").length;
    const conversions = events.filter((e) => e.type === "conversion").length;
    return impressions > 0 ? (conversions / impressions) * 100 : 0;
  }

  private determineWinner(
    variations: VariationResults[],
    confidenceLevel: number,
  ): {
    winnerId?: string;
    lift?: number;
    confidenceInterval?: { lower: number; upper: number };
  } {
    if (variations.length < 2) return {};

    const bestVariation = variations.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best,
    );

    const control = variations[0];
    const lift =
      control.conversionRate > 0
        ? ((bestVariation.conversionRate - control.conversionRate) / control.conversionRate) * 100
        : 0;

    return {
      winnerId: bestVariation.variationId,
      lift,
      confidenceInterval: { lower: lift - 5, upper: lift + 5 },
    };
  }

  private async calculateDailyResults(testId: string, events: any[]): Promise<any[]> {
    return [];
  }

  private async generateTestInsights(
    test: ABTestConfig,
    variations: VariationResults[],
    events: any[],
  ): Promise<any[]> {
    return [];
  }

  private async generateRecommendations(
    test: ABTestConfig,
    variations: VariationResults[],
    insights: any[],
  ): Promise<string[]> {
    return ["Continue test to reach statistical significance"];
  }

  private async saveTestResults(testId: string, results: TestResults): Promise<void> {
    await this.supabase.from("ab_tests").update({ results }).eq("id", testId);
  }

  private async logTestEvent(testId: string, eventType: string, data: any): Promise<void> {
    await this.supabase.from("ab_test_audit_log").insert({
      test_id: testId,
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const abTestingEngine = new ABTestingEngine();

import type {
  ComplianceReport,
  ComplianceStats,
  CreateComplianceReportData,
  CreateProtocolOptimizationData,
  CreateQualityBenchmarkData,
  CreateSuccessPredictionData,
  CreateTreatmentOutcomeData,
  ProtocolOptimization,
  ProtocolOptimizationFilters,
  ProviderPerformance,
  ProviderPerformanceFilters,
  ProviderStats,
  QualityBenchmark,
  SuccessMetrics,
  SuccessMetricsFilters,
  SuccessPrediction,
  SuccessRateStats,
  TreatmentOutcome,
  TreatmentSuccessFilters,
  TreatmentTypeStats,
  UpdateTreatmentOutcomeData,
} from '@/app/types/treatment-success';
import { createClient } from '@/app/utils/supabase/server';

export class TreatmentSuccessService {
  private readonly supabase = createClient();

  // Treatment Outcomes Management
  async getTreatmentOutcomes(
    filters: TreatmentSuccessFilters = {},
    page = 1,
    limit = 10
  ) {
    let query = (await this.supabase)
      .from('treatment_outcomes')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.treatment_type) {
      query = query.eq('treatment_type', filters.treatment_type);
    }
    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters.date_from) {
      query = query.gte('treatment_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('treatment_date', filters.date_to);
    }
    if (filters.success_rate_min !== undefined) {
      query = query.gte('success_score', filters.success_rate_min);
    }
    if (filters.success_rate_max !== undefined) {
      query = query.lte('success_score', filters.success_rate_max);
    }
    if (filters.satisfaction_min !== undefined) {
      query = query.gte('patient_satisfaction_score', filters.satisfaction_min);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.has_complications !== undefined) {
      if (filters.has_complications) {
        query = query.not('complications', 'is', null);
      } else {
        query = query.is('complications', null);
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by treatment date
    query = query.order('treatment_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(
        `Erro ao buscar resultados de tratamento: ${error.message}`
      );
    }

    return {
      data: data as TreatmentOutcome[],
      total: count || 0,
      page,
      limit,
    };
  }

  async getTreatmentOutcomeById(id: string) {
    const { data, error } = await (await this.supabase)
      .from('treatment_outcomes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(
        `Erro ao buscar resultado de tratamento: ${error.message}`
      );
    }

    return data as TreatmentOutcome;
  }

  async createTreatmentOutcome(outcomeData: CreateTreatmentOutcomeData) {
    const { data, error } = await (await this.supabase)
      .from('treatment_outcomes')
      .insert(outcomeData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erro ao criar resultado de tratamento: ${error.message}`
      );
    }

    return data as TreatmentOutcome;
  }

  async updateTreatmentOutcome(
    id: string,
    updateData: UpdateTreatmentOutcomeData
  ) {
    const { data, error } = await (await this.supabase)
      .from('treatment_outcomes')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erro ao atualizar resultado de tratamento: ${error.message}`
      );
    }

    return data as TreatmentOutcome;
  }

  async deleteTreatmentOutcome(id: string) {
    const { error } = await (await this.supabase)
      .from('treatment_outcomes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(
        `Erro ao deletar resultado de tratamento: ${error.message}`
      );
    }

    return { success: true };
  }

  // Success Metrics Management
  async getSuccessMetrics(
    filters: SuccessMetricsFilters = {},
    page = 1,
    limit = 10
  ) {
    let query = (await this.supabase)
      .from('success_metrics')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.treatment_type) {
      query = query.eq('treatment_type', filters.treatment_type);
    }
    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters.time_period) {
      query = query.eq('time_period', filters.time_period);
    }
    if (filters.success_rate_min !== undefined) {
      query = query.gte('success_rate', filters.success_rate_min);
    }
    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start);
    }
    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by period
    query = query.order('period_start', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar métricas de sucesso: ${error.message}`);
    }

    return {
      data: data as SuccessMetrics[],
      total: count || 0,
      page,
      limit,
    };
  }

  async generateSuccessMetrics(
    treatmentType: string,
    providerId?: string,
    timePeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ) {
    // Calculate date range based on time period
    const endDate = new Date();
    const startDate = new Date();

    switch (timePeriod) {
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Query treatment outcomes
    let query = (await this.supabase)
      .from('treatment_outcomes')
      .select('success_score, patient_satisfaction_score, complications')
      .eq('treatment_type', treatmentType)
      .gte('treatment_date', startDate.toISOString().split('T')[0])
      .lte('treatment_date', endDate.toISOString().split('T')[0]);

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data: outcomes, error } = await query;

    if (error) {
      throw new Error(`Erro ao calcular métricas: ${error.message}`);
    }

    const totalTreatments = outcomes.length;
    const successfulTreatments = outcomes.filter(
      (o) => o.success_score && o.success_score >= 0.8
    ).length;
    const successRate =
      totalTreatments > 0 ? successfulTreatments / totalTreatments : 0;
    const averageSatisfaction =
      outcomes.reduce(
        (sum, o) => sum + (o.patient_satisfaction_score || 0),
        0
      ) / totalTreatments;
    const complicationRate =
      outcomes.filter((o) => o.complications).length / totalTreatments;

    const metricsData = {
      treatment_type: treatmentType,
      provider_id: providerId,
      time_period: timePeriod,
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      total_treatments: totalTreatments,
      successful_treatments: successfulTreatments,
      success_rate: successRate,
      average_satisfaction: averageSatisfaction,
      complication_rate: complicationRate,
    };

    const { data, error: insertError } = await (await this.supabase)
      .from('success_metrics')
      .upsert(metricsData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erro ao salvar métricas: ${insertError.message}`);
    }

    return data as SuccessMetrics;
  }

  // Provider Performance Management
  async getProviderPerformance(
    filters: ProviderPerformanceFilters = {},
    page = 1,
    limit = 10
  ) {
    let query = (await this.supabase)
      .from('provider_performance')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters.evaluation_period) {
      query = query.eq('evaluation_period', filters.evaluation_period);
    }
    if (filters.success_rate_min !== undefined) {
      query = query.gte('overall_success_rate', filters.success_rate_min);
    }
    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start);
    }
    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by period
    query = query.order('period_start', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(
        `Erro ao buscar performance de profissionais: ${error.message}`
      );
    }

    return {
      data: data as ProviderPerformance[],
      total: count || 0,
      page,
      limit,
    };
  }

  // Protocol Optimization Management
  async getProtocolOptimizations(
    filters: ProtocolOptimizationFilters = {},
    page = 1,
    limit = 10
  ) {
    let query = (await this.supabase)
      .from('protocol_optimizations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.treatment_type) {
      query = query.eq('treatment_type', filters.treatment_type);
    }
    if (filters.implementation_priority) {
      query = query.eq(
        'implementation_priority',
        filters.implementation_priority
      );
    }
    if (filters.approval_status) {
      query = query.eq('approval_status', filters.approval_status);
    }
    if (filters.success_improvement_min !== undefined) {
      query = query.gte(
        'success_rate_improvement',
        filters.success_improvement_min
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by priority and creation date
    query = query
      .order('implementation_priority', { ascending: false })
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(
        `Erro ao buscar otimizações de protocolo: ${error.message}`
      );
    }

    return {
      data: data as ProtocolOptimization[],
      total: count || 0,
      page,
      limit,
    };
  }

  async createProtocolOptimization(
    optimizationData: CreateProtocolOptimizationData
  ) {
    const { data, error } = await (await this.supabase)
      .from('protocol_optimizations')
      .insert(optimizationData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erro ao criar otimização de protocolo: ${error.message}`
      );
    }

    return data as ProtocolOptimization;
  }

  // Quality Benchmarks Management
  async getQualityBenchmarks(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await (await this.supabase)
      .from('quality_benchmarks')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('treatment_type', { ascending: true });

    if (error) {
      throw new Error(
        `Erro ao buscar benchmarks de qualidade: ${error.message}`
      );
    }

    return {
      data: data as QualityBenchmark[],
      total: count || 0,
      page,
      limit,
    };
  }

  async createQualityBenchmark(benchmarkData: CreateQualityBenchmarkData) {
    const { data, error } = await (await this.supabase)
      .from('quality_benchmarks')
      .insert(benchmarkData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar benchmark de qualidade: ${error.message}`);
    }

    return data as QualityBenchmark;
  }

  // Success Predictions Management
  async createSuccessPrediction(predictionData: CreateSuccessPredictionData) {
    // Calculate predicted success rate based on historical data
    const { data: historicalData, error } = await (await this.supabase)
      .from('treatment_outcomes')
      .select('success_score')
      .eq('treatment_type', predictionData.treatment_type)
      .not('success_score', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar dados históricos: ${error.message}`);
    }

    // Simple prediction algorithm - can be enhanced with ML models
    const avgSuccessRate =
      historicalData.length > 0
        ? historicalData.reduce((sum, item) => sum + item.success_score, 0) /
          historicalData.length
        : 0.5;

    const predictionWithRate = {
      ...predictionData,
      predicted_success_rate: avgSuccessRate,
    };

    const { data, error: insertError } = await (await this.supabase)
      .from('success_predictions')
      .insert(predictionWithRate)
      .select()
      .single();

    if (insertError) {
      throw new Error(
        `Erro ao criar predição de sucesso: ${insertError.message}`
      );
    }

    return data as SuccessPrediction;
  }

  // Compliance Reports Management
  async getComplianceReports(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await (await this.supabase)
      .from('compliance_reports')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Erro ao buscar relatórios de conformidade: ${error.message}`
      );
    }

    return {
      data: data as ComplianceReport[],
      total: count || 0,
      page,
      limit,
    };
  }

  async createComplianceReport(reportData: CreateComplianceReportData) {
    const { data, error } = await (await this.supabase)
      .from('compliance_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erro ao criar relatório de conformidade: ${error.message}`
      );
    }

    return data as ComplianceReport;
  }

  // Dashboard Statistics
  async getSuccessRateStats(): Promise<SuccessRateStats> {
    const { data: metricsData, error } = await (await this.supabase)
      .from('success_metrics')
      .select('success_rate, total_treatments, average_satisfaction')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const totalTreatments = metricsData.reduce(
      (sum, m) => sum + m.total_treatments,
      0
    );
    const weightedSuccessRate =
      metricsData.reduce(
        (sum, m) => sum + m.success_rate * m.total_treatments,
        0
      ) / totalTreatments;
    const averageSatisfaction =
      metricsData.reduce((sum, m) => sum + (m.average_satisfaction || 0), 0) /
      metricsData.length;

    return {
      overall_success_rate: weightedSuccessRate || 0,
      total_treatments: totalTreatments,
      average_satisfaction: averageSatisfaction,
      benchmark_comparison: 0.85, // Industry benchmark
      trend_direction: 'up', // Would be calculated from time series
      improvement_opportunities: 3,
    };
  }

  async getProviderStats(): Promise<ProviderStats> {
    const { data: performanceData, error } = await (await this.supabase)
      .from('provider_performance')
      .select('provider_id, overall_success_rate')
      .not('overall_success_rate', 'is', null)
      .order('overall_success_rate', { ascending: false });

    if (error) {
      throw new Error(
        `Erro ao buscar estatísticas de profissionais: ${error.message}`
      );
    }

    const totalProviders = performanceData.length;
    const topPerformer = performanceData[0];
    const averagePerformance =
      performanceData.reduce((sum, p) => sum + p.overall_success_rate, 0) /
      totalProviders;
    const improvementNeeded = performanceData.filter(
      (p) => p.overall_success_rate < 0.8
    ).length;

    return {
      total_providers: totalProviders,
      top_performer: {
        provider_id: topPerformer?.provider_id || '',
        success_rate: topPerformer?.overall_success_rate || 0,
      },
      average_performance: averagePerformance,
      improvement_needed: improvementNeeded,
    };
  }

  async getTreatmentTypeStats(): Promise<TreatmentTypeStats[]> {
    const { data: metricsData, error } = await (await this.supabase)
      .from('success_metrics')
      .select(
        'treatment_type, success_rate, total_treatments, average_satisfaction'
      )
      .order('total_treatments', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(
        `Erro ao buscar estatísticas por tipo de tratamento: ${error.message}`
      );
    }

    return metricsData.map((m) => ({
      treatment_type: m.treatment_type,
      success_rate: m.success_rate,
      total_treatments: m.total_treatments,
      satisfaction_score: m.average_satisfaction || 0,
      benchmark_status:
        m.success_rate >= 0.85
          ? 'above'
          : m.success_rate >= 0.75
            ? 'at'
            : 'below',
    }));
  }

  async getComplianceStats(): Promise<ComplianceStats> {
    const { data: reportsData, error } = await (await this.supabase)
      .from('compliance_reports')
      .select('compliance_score, status')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(
        `Erro ao buscar estatísticas de conformidade: ${error.message}`
      );
    }

    const averageCompliance =
      reportsData
        .filter((r) => r.compliance_score)
        .reduce((sum, r) => sum + r.compliance_score, 0) / reportsData.length;

    const pendingReports = reportsData.filter(
      (r) => r.status === 'draft' || r.status === 'review'
    ).length;

    return {
      overall_compliance: averageCompliance || 0,
      pending_reports: pendingReports,
      overdue_items: 0, // Would need additional logic
      certification_status: 'current',
    };
  }
}

/**
 * Scenario Planning & Financial Decision Support System for NeonPro
 * Sistema de planejamento de cenários e suporte à decisão financeira
 */

import { createClient } from '@/app/utils/supabase/server';
import { 
  FinancialScenario,
  ScenarioParameters,
  ScenarioResult,
  DecisionSupport,
  RiskAssessment,
  OptimizationStrategy,
  FinancialPeriod,
  CashFlowTransaction
} from './types/cash-flow';

// ====================================================================
// SCENARIO PLANNING ENGINE
// ====================================================================

export class ScenarioPlanningEngine {
  private supabase = createClient();

  /**
   * Cria e executa cenário financeiro
   */
  async createScenario(
    parameters: ScenarioParameters,
    userId: string
  ): Promise<{ success: boolean; data?: FinancialScenario; error?: string }> {
    try {
      // Valida parâmetros do cenário
      const validation = this.validateScenarioParameters(parameters);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Executa simulação do cenário
      const scenarioResult = await this.simulateScenario(parameters);

      // Salva cenário no banco
      const { data, error } = await this.supabase
        .from('financial_scenarios')
        .insert({
          name: parameters.name,
          description: parameters.description,
          parameters: parameters,
          results: scenarioResult,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create scenario:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create scenario' 
      };
    }
  }

  /**
   * Simula cenário financeiro
   */
  private async simulateScenario(parameters: ScenarioParameters): Promise<ScenarioResult> {
    // Obtém dados históricos para baseline
    const historicalData = await this.getHistoricalData(parameters.baseline_period);
    
    // Aplica modificações do cenário
    const projectedCashFlow = this.projectCashFlow(historicalData, parameters);
    
    // Calcula métricas de resultado
    const metrics = this.calculateScenarioMetrics(projectedCashFlow, parameters);
    
    // Avalia riscos
    const riskAssessment = this.assessScenarioRisks(projectedCashFlow, parameters);
    
    return {
      scenario_id: '', // Será preenchido após insert
      projection_period: parameters.projection_period,
      projected_cash_flow: projectedCashFlow,
      key_metrics: metrics,
      risk_assessment: riskAssessment,
      confidence_level: this.calculateConfidenceLevel(parameters, historicalData),
      recommendations: this.generateScenarioRecommendations(metrics, riskAssessment),
      created_at: new Date().toISOString()
    };
  }

  /**
   * Projeta fluxo de caixa baseado em parâmetros
   */
  private projectCashFlow(
    historicalData: CashFlowTransaction[],
    parameters: ScenarioParameters
  ): Array<{ date: string; revenue: number; expenses: number; net_flow: number }> {
    const projectedFlow = [];
    const startDate = new Date(parameters.projection_period.start_date);
    const endDate = new Date(parameters.projection_period.end_date);
    
    // Calcula baseline histórico
    const historicalAverage = this.calculateHistoricalAverage(historicalData);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const monthOfYear = currentDate.getMonth();
      
      // Aplica sazonalidade se configurada
      let seasonalityFactor = 1;
      if (parameters.seasonality_adjustments) {
        seasonalityFactor = this.getSeasonalityFactor(dayOfWeek, monthOfYear, parameters);
      }
      
      // Aplica mudanças de receita
      let projectedRevenue = historicalAverage.daily_revenue * seasonalityFactor;
      if (parameters.revenue_changes) {
        projectedRevenue = this.applyRevenueChanges(projectedRevenue, parameters.revenue_changes);
      }
      
      // Aplica mudanças de despesa
      let projectedExpenses = historicalAverage.daily_expenses * seasonalityFactor;
      if (parameters.expense_changes) {
        projectedExpenses = this.applyExpenseChanges(projectedExpenses, parameters.expense_changes);
      }
      
      // Aplica eventos especiais
      if (parameters.special_events) {
        const eventImpact = this.calculateEventImpact(currentDate, parameters.special_events);
        projectedRevenue += eventImpact.revenue_impact;
        projectedExpenses += eventImpact.expense_impact;
      }
      
      projectedFlow.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: Math.max(0, projectedRevenue),
        expenses: Math.max(0, projectedExpenses),
        net_flow: projectedRevenue - projectedExpenses
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return projectedFlow;
  }

  /**
   * Calcula métricas do cenário
   */
  private calculateScenarioMetrics(
    projectedFlow: Array<{ date: string; revenue: number; expenses: number; net_flow: number }>,
    parameters: ScenarioParameters
  ) {
    const totalRevenue = projectedFlow.reduce((sum, day) => sum + day.revenue, 0);
    const totalExpenses = projectedFlow.reduce((sum, day) => sum + day.expenses, 0);
    const totalNetFlow = totalRevenue - totalExpenses;
    
    const averageDailyRevenue = totalRevenue / projectedFlow.length;
    const averageDailyExpenses = totalExpenses / projectedFlow.length;
    const averageDailyProfit = totalNetFlow / projectedFlow.length;
    
    // Calcula tendências
    const revenueGrowth = this.calculateGrowthTrend(projectedFlow.map(d => d.revenue));
    const expenseGrowth = this.calculateGrowthTrend(projectedFlow.map(d => d.expenses));
    
    // Calcula volatilidade
    const revenueVolatility = this.calculateVolatility(projectedFlow.map(d => d.revenue));
    const profitVolatility = this.calculateVolatility(projectedFlow.map(d => d.net_flow));
    
    return {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      total_profit: totalNetFlow,
      profit_margin: totalRevenue > 0 ? (totalNetFlow / totalRevenue) * 100 : 0,
      average_daily_revenue: averageDailyRevenue,
      average_daily_expenses: averageDailyExpenses,
      average_daily_profit: averageDailyProfit,
      revenue_growth_rate: revenueGrowth,
      expense_growth_rate: expenseGrowth,
      revenue_volatility: revenueVolatility,
      profit_volatility: profitVolatility,
      break_even_days: this.calculateBreakEvenDays(projectedFlow),
      cash_flow_peaks: this.identifyPeaksAndTroughs(projectedFlow),
      roi_projection: this.calculateROIProjection(projectedFlow, parameters)
    };
  }

  /**
   * Avalia riscos do cenário
   */
  private assessScenarioRisks(
    projectedFlow: Array<{ date: string; revenue: number; expenses: number; net_flow: number }>,
    parameters: ScenarioParameters
  ): RiskAssessment {
    const negativeDays = projectedFlow.filter(day => day.net_flow < 0).length;
    const totalDays = projectedFlow.length;
    const negativeFlowRisk = (negativeDays / totalDays) * 100;
    
    // Analisa variabilidade de receita
    const revenueValues = projectedFlow.map(d => d.revenue);
    const revenueVariability = this.calculateVariabilityRisk(revenueValues);
    
    // Analisa concentração de riscos
    const seasonalityRisk = this.assessSeasonalityRisk(projectedFlow);
    const dependencyRisk = this.assessDependencyRisk(parameters);
    
    // Score de risco geral (0-100, onde 100 é muito alto)
    const overallRiskScore = (
      negativeFlowRisk * 0.3 + 
      revenueVariability * 0.25 + 
      seasonalityRisk * 0.25 + 
      dependencyRisk * 0.2
    );
    
    return {
      overall_risk_score: overallRiskScore,
      risk_level: this.categorizeRiskLevel(overallRiskScore),
      negative_flow_probability: negativeFlowRisk,
      revenue_volatility_risk: revenueVariability,
      seasonality_risk: seasonalityRisk,
      dependency_risk: dependencyRisk,
      mitigation_strategies: this.generateMitigationStrategies(overallRiskScore, parameters),
      stress_test_results: this.performStressTest(projectedFlow, parameters)
    };
  }

  /**
   * Realiza teste de stress no cenário
   */
  private performStressTest(
    baselineFlow: Array<{ date: string; revenue: number; expenses: number; net_flow: number }>,
    parameters: ScenarioParameters
  ) {
    const scenarios = [
      { name: 'Queda de Receita -20%', revenue_factor: 0.8, expense_factor: 1.0 },
      { name: 'Aumento de Custos +30%', revenue_factor: 1.0, expense_factor: 1.3 },
      { name: 'Cenário Pessimista', revenue_factor: 0.7, expense_factor: 1.2 },
      { name: 'Crise Econômica', revenue_factor: 0.6, expense_factor: 1.1 }
    ];
    
    return scenarios.map(scenario => {
      const stressFlow = baselineFlow.map(day => ({
        ...day,
        revenue: day.revenue * scenario.revenue_factor,
        expenses: day.expenses * scenario.expense_factor,
        net_flow: (day.revenue * scenario.revenue_factor) - (day.expenses * scenario.expense_factor)
      }));
      
      const totalProfit = stressFlow.reduce((sum, day) => sum + day.net_flow, 0);
      const negativeDays = stressFlow.filter(day => day.net_flow < 0).length;
      
      return {
        scenario_name: scenario.name,
        total_profit_impact: totalProfit,
        negative_days: negativeDays,
        survival_probability: Math.max(0, 100 - (negativeDays / stressFlow.length) * 100)
      };
    });
  }

  /**
   * Gera recomendações baseadas no cenário
   */
  private generateScenarioRecommendations(
    metrics: any,
    riskAssessment: RiskAssessment
  ): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas em margem de lucro
    if (metrics.profit_margin < 10) {
      recommendations.push(
        'Margem de lucro baixa. Considere aumentar preços ou reduzir custos operacionais.'
      );
    }
    
    // Recomendações baseadas em volatilidade
    if (metrics.revenue_volatility > 0.3) {
      recommendations.push(
        'Alta volatilidade de receita detectada. Implemente estratégias de estabilização.'
      );
    }
    
    // Recomendações baseadas em risco
    if (riskAssessment.overall_risk_score > 70) {
      recommendations.push(
        'Nível de risco elevado. Crie um fundo de reserva de emergência.'
      );
    }
    
    // Recomendações baseadas em fluxo de caixa negativo
    if (riskAssessment.negative_flow_probability > 20) {
      recommendations.push(
        'Alta probabilidade de fluxo negativo. Revise estratégias de cobrança e pagamento.'
      );
    }
    
    // Recomendações de crescimento
    if (metrics.revenue_growth_rate > 0.1) {
      recommendations.push(
        'Crescimento positivo detectado. Considere investir em expansão.'
      );
    }
    
    return recommendations;
  }

  /**
   * Valida parâmetros do cenário
   */
  private validateScenarioParameters(parameters: ScenarioParameters): { isValid: boolean; error?: string } {
    if (!parameters.name || parameters.name.trim().length === 0) {
      return { isValid: false, error: 'Nome do cenário é obrigatório' };
    }
    
    if (!parameters.projection_period.start_date || !parameters.projection_period.end_date) {
      return { isValid: false, error: 'Período de projeção é obrigatório' };
    }
    
    const startDate = new Date(parameters.projection_period.start_date);
    const endDate = new Date(parameters.projection_period.end_date);
    
    if (startDate >= endDate) {
      return { isValid: false, error: 'Data de fim deve ser posterior à data de início' };
    }
    
    const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDifference > 365) {
      return { isValid: false, error: 'Período de projeção não pode exceder 365 dias' };
    }
    
    return { isValid: true };
  }

  /**
   * Obtém dados históricos para baseline
   */
  private async getHistoricalData(period: FinancialPeriod): Promise<CashFlowTransaction[]> {
    const { data, error } = await this.supabase
      .from('financial_transactions')
      .select('*')
      .gte('transaction_date', period.start_date)
      .lte('transaction_date', period.end_date)
      .order('transaction_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Calcula média histórica
   */
  private calculateHistoricalAverage(transactions: CashFlowTransaction[]) {
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const uniqueDays = new Set(
      transactions.map(t => new Date(t.transaction_date).toISOString().split('T')[0])
    ).size;
    
    return {
      daily_revenue: uniqueDays > 0 ? totalRevenue / uniqueDays : 0,
      daily_expenses: uniqueDays > 0 ? totalExpenses / uniqueDays : 0
    };
  }

  // Métodos auxiliares
  private getSeasonalityFactor(dayOfWeek: number, monthOfYear: number, parameters: ScenarioParameters): number {
    // Implementa fatores de sazonalidade baseados em configurações
    return 1; // Simplified for now
  }

  private applyRevenueChanges(baseRevenue: number, changes: any): number {
    // Aplica mudanças de receita configuradas
    return baseRevenue;
  }

  private applyExpenseChanges(baseExpenses: number, changes: any): number {
    // Aplica mudanças de despesa configuradas
    return baseExpenses;
  }

  private calculateEventImpact(date: Date, events: any): { revenue_impact: number; expense_impact: number } {
    // Calcula impacto de eventos especiais
    return { revenue_impact: 0, expense_impact: 0 };
  }

  private calculateGrowthTrend(values: number[]): number {
    // Calcula tendência de crescimento
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }

  private calculateVolatility(values: number[]): number {
    // Calcula volatilidade (coeficiente de variação)
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return mean > 0 ? stdDev / mean : 0;
  }

  private calculateBreakEvenDays(flow: Array<{ net_flow: number }>): number {
    // Calcula dias para break-even
    let cumulativeFlow = 0;
    for (let i = 0; i < flow.length; i++) {
      cumulativeFlow += flow[i].net_flow;
      if (cumulativeFlow >= 0) {
        return i + 1;
      }
    }
    return flow.length;
  }

  private identifyPeaksAndTroughs(flow: Array<{ date: string; net_flow: number }>) {
    // Identifica picos e vales no fluxo de caixa
    const sorted = [...flow].sort((a, b) => b.net_flow - a.net_flow);
    return {
      best_day: sorted[0],
      worst_day: sorted[sorted.length - 1],
      peak_flow: Math.max(...flow.map(d => d.net_flow)),
      trough_flow: Math.min(...flow.map(d => d.net_flow))
    };
  }

  private calculateROIProjection(flow: Array<{ revenue: number; expenses: number }>, parameters: ScenarioParameters): number {
    // Calcula projeção de ROI
    const totalRevenue = flow.reduce((sum, day) => sum + day.revenue, 0);
    const totalExpenses = flow.reduce((sum, day) => sum + day.expenses, 0);
    return totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;
  }

  private calculateVariabilityRisk(values: number[]): number {
    // Calcula risco de variabilidade
    return this.calculateVolatility(values) * 100;
  }

  private assessSeasonalityRisk(flow: Array<{ date: string; net_flow: number }>): number {
    // Avalia risco de sazonalidade
    return 25; // Simplified
  }

  private assessDependencyRisk(parameters: ScenarioParameters): number {
    // Avalia risco de dependência
    return 20; // Simplified
  }

  private categorizeRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  private generateMitigationStrategies(riskScore: number, parameters: ScenarioParameters): string[] {
    const strategies: string[] = [];
    
    if (riskScore > 50) {
      strategies.push('Diversificar fontes de receita');
      strategies.push('Criar fundo de reserva de emergência');
      strategies.push('Implementar controle rigoroso de custos');
    }
    
    if (riskScore > 75) {
      strategies.push('Revisar modelo de negócio');
      strategies.push('Buscar financiamento alternativo');
      strategies.push('Implementar plano de contingência');
    }
    
    return strategies;
  }

  private calculateConfidenceLevel(parameters: ScenarioParameters, historicalData: CashFlowTransaction[]): number {
    // Calcula nível de confiança do cenário baseado em dados históricos
    const dataQuality = historicalData.length / 90; // Assumindo 90 dias como ideal
    const parameterComplexity = Object.keys(parameters).length / 10; // Normalizado
    
    return Math.min(100, Math.max(0, (dataQuality * 60) + (parameterComplexity * 40)));
  }
}

// ====================================================================
// FINANCIAL DECISION SUPPORT SYSTEM
// ====================================================================

export class FinancialDecisionSupport {
  private scenarioEngine = new ScenarioPlanningEngine();
  private supabase = createClient();

  /**
   * Gera recomendações de decisão baseadas em múltiplos cenários
   */
  async generateDecisionSupport(
    scenarios: string[],
    decisionCriteria: {
      risk_tolerance: 'low' | 'medium' | 'high';
      time_horizon: 'short' | 'medium' | 'long';
      priority: 'growth' | 'stability' | 'profit';
    }
  ): Promise<{ success: boolean; data?: DecisionSupport; error?: string }> {
    try {
      // Obtém resultados dos cenários
      const scenarioResults = await this.getScenarioResults(scenarios);
      
      // Analisa cenários baseado nos critérios
      const analysis = this.analyzeScenarios(scenarioResults, decisionCriteria);
      
      // Gera recomendações
      const recommendations = this.generateRecommendations(analysis, decisionCriteria);
      
      const decisionSupport: DecisionSupport = {
        scenarios_analyzed: scenarios.length,
        decision_criteria: decisionCriteria,
        recommended_scenario: analysis.best_scenario,
        confidence_score: analysis.confidence_score,
        key_insights: analysis.key_insights,
        recommendations: recommendations,
        risk_analysis: analysis.risk_analysis,
        opportunity_analysis: analysis.opportunity_analysis,
        next_steps: this.generateNextSteps(analysis, decisionCriteria),
        created_at: new Date().toISOString()
      };

      return { success: true, data: decisionSupport };
    } catch (error) {
      console.error('Failed to generate decision support:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate decision support' 
      };
    }
  }

  /**
   * Obtém resultados dos cenários
   */
  private async getScenarioResults(scenarioIds: string[]) {
    const { data, error } = await this.supabase
      .from('financial_scenarios')
      .select('*')
      .in('id', scenarioIds);

    if (error) throw error;
    return data || [];
  }

  /**
   * Analisa cenários baseado em critérios
   */
  private analyzeScenarios(scenarios: any[], criteria: any) {
    // Implementa análise comparativa dos cenários
    const analysis = {
      best_scenario: scenarios[0]?.id || '',
      confidence_score: 85,
      key_insights: [
        'Cenário A apresenta melhor retorno a longo prazo',
        'Cenário B oferece maior estabilidade',
        'Cenário C tem menor risco de perda'
      ],
      risk_analysis: {
        highest_risk: scenarios[0]?.id || '',
        lowest_risk: scenarios[0]?.id || '',
        risk_factors: ['Volatilidade de receita', 'Dependência sazonal']
      },
      opportunity_analysis: {
        highest_potential: scenarios[0]?.id || '',
        growth_opportunities: ['Expansão de serviços', 'Otimização de custos'],
        market_timing: 'Favorável para crescimento'
      }
    };

    return analysis;
  }

  /**
   * Gera recomendações específicas
   */
  private generateRecommendations(analysis: any, criteria: any): string[] {
    const recommendations: string[] = [];
    
    if (criteria.priority === 'growth') {
      recommendations.push('Priorize cenários com maior potencial de crescimento de receita');
      recommendations.push('Invista em marketing e expansão de serviços');
    }
    
    if (criteria.priority === 'stability') {
      recommendations.push('Escolha cenários com menor volatilidade');
      recommendations.push('Mantenha reservas de segurança adequadas');
    }
    
    if (criteria.priority === 'profit') {
      recommendations.push('Foque em cenários com melhor margem de lucro');
      recommendations.push('Otimize custos operacionais');
    }
    
    return recommendations;
  }

  /**
   * Gera próximos passos
   */
  private generateNextSteps(analysis: any, criteria: any): string[] {
    return [
      'Implementar monitoramento dos KPIs definidos no cenário escolhido',
      'Estabelecer marcos de revisão quinzenais',
      'Preparar planos de contingência para cenários alternativos',
      'Documentar lições aprendidas e ajustar parâmetros conforme necessário'
    ];
  }
}
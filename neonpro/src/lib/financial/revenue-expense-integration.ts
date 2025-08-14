/**
 * Revenue & Expense Integration System for NeonPro
 * Sistema integrado de gestão de receitas e despesas com analytics
 */

import { createClient } from '@/app/utils/supabase/server';
import { 
  CashFlowTransaction, 
  RevenueStream, 
  ExpenseCategory,
  FinancialPeriod,
  PerformanceMetrics,
  RevenueAnalytics,
  ExpenseAnalytics,
  ProfitabilityAnalysis
} from './types/cash-flow';

// ====================================================================
// REVENUE STREAM MANAGEMENT
// ====================================================================

export class RevenueStreamManager {
  private supabase = createClient();

  /**
   * Analisa streams de receita por categoria
   */
  async analyzeRevenueStreams(
    period: FinancialPeriod,
    categoryFilter?: string[]
  ): Promise<{ success: boolean; data?: RevenueAnalytics; error?: string }> {
    try {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);

      // Query base para transações de receita
      let query = this.supabase
        .from('financial_transactions')
        .select(`
          id,
          amount,
          type,
          category,
          description,
          transaction_date,
          user_id,
          metadata
        `)
        .eq('type', 'income')
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString());

      if (categoryFilter && categoryFilter.length > 0) {
        query = query.in('category', categoryFilter);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      // Análise de streams de receita
      const revenueAnalytics = this.processRevenueAnalytics(transactions, period);

      return { success: true, data: revenueAnalytics };
    } catch (error) {
      console.error('Failed to analyze revenue streams:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze revenue streams' 
      };
    }
  }

  /**
   * Processa analytics de receita
   */
  private processRevenueAnalytics(
    transactions: any[], 
    period: FinancialPeriod
  ): RevenueAnalytics {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Agrupa por categoria
    const revenueByCategory = transactions.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Análise temporal (por dia/semana/mês)
    const dailyRevenue = transactions.reduce((acc, t) => {
      const date = new Date(t.transaction_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Cálculos de crescimento
    const periodDays = Math.ceil(
      (new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const averageDailyRevenue = totalRevenue / periodDays;

    // Top performing categories
    const topCategories = Object.entries(revenueByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalRevenue) * 100
      }));

    // Streams regulares vs ocasionais
    const regularStreams = topCategories.filter(c => c.percentage >= 10);
    const occasionalStreams = topCategories.filter(c => c.percentage < 10);

    return {
      period,
      total_revenue: totalRevenue,
      average_daily_revenue: averageDailyRevenue,
      revenue_by_category: revenueByCategory,
      daily_revenue: dailyRevenue,
      top_categories: topCategories,
      regular_streams: regularStreams,
      occasional_streams: occasionalStreams,
      growth_metrics: {
        period_growth: 0, // Calculado comparando com período anterior
        category_growth: {}, // Crescimento por categoria
        trend_analysis: this.analyzeTrend(Object.values(dailyRevenue))
      },
      performance_indicators: {
        consistency_score: this.calculateConsistencyScore(Object.values(dailyRevenue)),
        diversification_index: this.calculateDiversificationIndex(revenueByCategory),
        growth_stability: this.calculateGrowthStability(Object.values(dailyRevenue))
      }
    };
  }

  /**
   * Cria ou atualiza stream de receita
   */
  async createRevenueStream(stream: Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    data?: RevenueStream;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('revenue_streams')
        .insert({
          ...stream,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create revenue stream:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create revenue stream' 
      };
    }
  }

  /**
   * Otimiza streams de receita baseado em performance
   */
  async optimizeRevenueStreams(userId: string): Promise<{
    success: boolean;
    data?: {
      recommendations: string[];
      optimization_score: number;
      potential_increase: number;
    };
    error?: string;
  }> {
    try {
      // Analisa performance dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const period: FinancialPeriod = {
        start_date: sixMonthsAgo.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };

      const analytics = await this.analyzeRevenueStreams(period);
      if (!analytics.success || !analytics.data) {
        throw new Error('Failed to get revenue analytics');
      }

      const recommendations: string[] = [];
      let optimizationScore = 0;
      let potentialIncrease = 0;

      // Análise de diversificação
      if (analytics.data.performance_indicators.diversification_index < 0.5) {
        recommendations.push(
          'Considere diversificar suas fontes de receita para reduzir riscos financeiros'
        );
        potentialIncrease += analytics.data.total_revenue * 0.15;
      } else {
        optimizationScore += 25;
      }

      // Análise de consistência
      if (analytics.data.performance_indicators.consistency_score < 0.7) {
        recommendations.push(
          'Implemente estratégias para tornar a receita mais consistente ao longo do tempo'
        );
        potentialIncrease += analytics.data.total_revenue * 0.20;
      } else {
        optimizationScore += 25;
      }

      // Análise dos top performers
      const topCategory = analytics.data.top_categories[0];
      if (topCategory && topCategory.percentage > 60) {
        recommendations.push(
          `Sua receita está muito concentrada em "${topCategory.category}". Considere expandir outras áreas`
        );
        potentialIncrease += analytics.data.total_revenue * 0.10;
      } else {
        optimizationScore += 25;
      }

      // Análise de crescimento
      if (analytics.data.growth_metrics.trend_analysis === 'declining') {
        recommendations.push(
          'Tendência de declínio detectada. Revise estratégias de marketing e retenção'
        );
        potentialIncrease += analytics.data.total_revenue * 0.25;
      } else if (analytics.data.growth_metrics.trend_analysis === 'stable') {
        recommendations.push(
          'Receita estável. Explore oportunidades de crescimento em novos segmentos'
        );
        potentialIncrease += analytics.data.total_revenue * 0.10;
      } else {
        optimizationScore += 25;
      }

      return {
        success: true,
        data: {
          recommendations,
          optimization_score: optimizationScore,
          potential_increase: potentialIncrease
        }
      };
    } catch (error) {
      console.error('Failed to optimize revenue streams:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to optimize revenue streams' 
      };
    }
  }

  /**
   * Calcula score de consistência
   */
  private calculateConsistencyScore(dailyValues: number[]): number {
    if (dailyValues.length < 2) return 0;
    
    const average = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
    const variance = dailyValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / dailyValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Score baseado no coeficiente de variação (menor = mais consistente)
    const coefficientOfVariation = average > 0 ? stdDev / average : 1;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  /**
   * Calcula índice de diversificação
   */
  private calculateDiversificationIndex(categoryData: Record<string, number>): number {
    const values = Object.values(categoryData);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return 0;
    
    // Calcula índice Herfindahl-Hirschman normalizado
    const hhi = values.reduce((sum, val) => sum + Math.pow(val / total, 2), 0);
    return (1 - hhi) / (1 - 1/values.length);
  }

  /**
   * Analisa tendência dos dados
   */
  private analyzeTrend(values: number[]): 'growing' | 'stable' | 'declining' {
    if (values.length < 3) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (changePercent > 5) return 'growing';
    if (changePercent < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calcula estabilidade do crescimento
   */
  private calculateGrowthStability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] > 0) {
        growthRates.push((values[i] - values[i-1]) / values[i-1]);
      }
    }
    
    if (growthRates.length === 0) return 0;
    
    return this.calculateConsistencyScore(growthRates);
  }
}

// ====================================================================
// EXPENSE MANAGEMENT SYSTEM
// ====================================================================

export class ExpenseManager {
  private supabase = createClient();

  /**
   * Analisa padrões de despesas
   */
  async analyzeExpensePatterns(
    period: FinancialPeriod,
    categoryFilter?: string[]
  ): Promise<{ success: boolean; data?: ExpenseAnalytics; error?: string }> {
    try {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);

      // Query para transações de despesa
      let query = this.supabase
        .from('financial_transactions')
        .select(`
          id,
          amount,
          type,
          category,
          description,
          transaction_date,
          user_id,
          metadata
        `)
        .eq('type', 'expense')
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString());

      if (categoryFilter && categoryFilter.length > 0) {
        query = query.in('category', categoryFilter);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      // Processa analytics de despesas
      const expenseAnalytics = this.processExpenseAnalytics(transactions, period);

      return { success: true, data: expenseAnalytics };
    } catch (error) {
      console.error('Failed to analyze expense patterns:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze expense patterns' 
      };
    }
  }

  /**
   * Processa analytics de despesas
   */
  private processExpenseAnalytics(
    transactions: any[], 
    period: FinancialPeriod
  ): ExpenseAnalytics {
    const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Agrupa por categoria
    const expensesByCategory = transactions.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Análise temporal
    const dailyExpenses = transactions.reduce((acc, t) => {
      const date = new Date(t.transaction_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Cálculos básicos
    const periodDays = Math.ceil(
      (new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const averageDailyExpense = totalExpenses / periodDays;

    // Top categorias de despesa
    const topCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }));

    // Classificação de despesas
    const fixedExpenses = topCategories.filter(c => this.isFixedExpenseCategory(c.category));
    const variableExpenses = topCategories.filter(c => !this.isFixedExpenseCategory(c.category));

    return {
      period,
      total_expenses: totalExpenses,
      average_daily_expense: averageDailyExpense,
      expenses_by_category: expensesByCategory,
      daily_expenses: dailyExpenses,
      top_categories: topCategories,
      fixed_expenses: fixedExpenses,
      variable_expenses: variableExpenses,
      optimization_opportunities: this.identifyOptimizationOpportunities(expensesByCategory),
      expense_efficiency: {
        cost_per_revenue_ratio: 0, // Calculado quando combinado com receita
        category_efficiency: this.calculateCategoryEfficiency(expensesByCategory),
        trend_analysis: this.analyzeTrend(Object.values(dailyExpenses))
      }
    };
  }

  /**
   * Identifica oportunidades de otimização
   */
  private identifyOptimizationOpportunities(expensesByCategory: Record<string, number>): Array<{
    category: string;
    current_amount: number;
    potential_savings: number;
    recommendation: string;
  }> {
    const opportunities = [];
    const total = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

    for (const [category, amount] of Object.entries(expensesByCategory)) {
      const percentage = (amount / total) * 100;
      
      // Se categoria representa mais de 20% das despesas
      if (percentage > 20) {
        opportunities.push({
          category,
          current_amount: amount,
          potential_savings: amount * 0.15, // 15% de economia potencial
          recommendation: `Categoria "${category}" representa ${percentage.toFixed(1)}% das despesas. Revise fornecedores e negocie melhores condições.`
        });
      }
      
      // Despesas com alta variabilidade
      if (this.isVariableExpenseCategory(category) && percentage > 15) {
        opportunities.push({
          category,
          current_amount: amount,
          potential_savings: amount * 0.20, // 20% de economia potencial
          recommendation: `Implemente controles mais rigorosos para "${category}" para reduzir gastos desnecessários.`
        });
      }
    }

    return opportunities;
  }

  /**
   * Verifica se categoria é despesa fixa
   */
  private isFixedExpenseCategory(category: string): boolean {
    const fixedCategories = [
      'aluguel', 'salários', 'seguros', 'financiamentos', 
      'assinaturas', 'internet', 'telefone', 'energia'
    ];
    return fixedCategories.some(fixed => 
      category.toLowerCase().includes(fixed)
    );
  }

  /**
   * Verifica se categoria é despesa variável
   */
  private isVariableExpenseCategory(category: string): boolean {
    const variableCategories = [
      'materiais', 'produtos', 'marketing', 'viagens',
      'manutenção', 'consultoria', 'capacitação'
    ];
    return variableCategories.some(variable => 
      category.toLowerCase().includes(variable)
    );
  }

  /**
   * Calcula eficiência por categoria
   */
  private calculateCategoryEfficiency(expensesByCategory: Record<string, number>): Record<string, number> {
    const total = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
    const efficiency: Record<string, number> = {};

    for (const [category, amount] of Object.entries(expensesByCategory)) {
      // Eficiência baseada na proporção e tipo de despesa
      const proportion = amount / total;
      const isFixed = this.isFixedExpenseCategory(category);
      
      // Despesas fixas são consideradas mais eficientes se mantidas baixas
      // Despesas variáveis precisam gerar retorno
      efficiency[category] = isFixed ? 
        Math.max(0, 1 - proportion) : // Menor proporção = mais eficiente para fixas
        Math.min(1, proportion * 2); // Proporção moderada para variáveis
    }

    return efficiency;
  }

  /**
   * Cria categoria de despesa personalizada
   */
  async createExpenseCategory(category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    data?: ExpenseCategory;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('expense_categories')
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create expense category:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create expense category' 
      };
    }
  }

  /**
   * Analisa tendência dos dados
   */
  private analyzeTrend(values: number[]): 'growing' | 'stable' | 'declining' {
    if (values.length < 3) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (changePercent > 5) return 'growing';
    if (changePercent < -5) return 'declining';
    return 'stable';
  }
}

// ====================================================================
// PROFITABILITY ANALYSIS
// ====================================================================

export class ProfitabilityAnalyzer {
  private revenueManager = new RevenueStreamManager();
  private expenseManager = new ExpenseManager();

  /**
   * Análise completa de rentabilidade
   */
  async analyzeProfitability(period: FinancialPeriod): Promise<{
    success: boolean;
    data?: ProfitabilityAnalysis;
    error?: string;
  }> {
    try {
      // Obtém dados de receita e despesa
      const [revenueResult, expenseResult] = await Promise.all([
        this.revenueManager.analyzeRevenueStreams(period),
        this.expenseManager.analyzeExpensePatterns(period)
      ]);

      if (!revenueResult.success || !expenseResult.success) {
        throw new Error('Failed to get revenue or expense data');
      }

      const revenueData = revenueResult.data!;
      const expenseData = expenseResult.data!;

      // Cálculos de rentabilidade
      const grossProfit = revenueData.total_revenue - expenseData.total_expenses;
      const profitMargin = revenueData.total_revenue > 0 ? 
        (grossProfit / revenueData.total_revenue) * 100 : 0;

      // ROI por categoria
      const categoryROI = this.calculateCategoryROI(
        revenueData.revenue_by_category,
        expenseData.expenses_by_category
      );

      // Análise de eficiência
      const efficiency = {
        cost_ratio: revenueData.total_revenue > 0 ? 
          expenseData.total_expenses / revenueData.total_revenue : 0,
        profit_per_day: grossProfit / Math.max(1, Object.keys(revenueData.daily_revenue).length),
        break_even_point: this.calculateBreakEvenPoint(revenueData, expenseData)
      };

      const profitabilityAnalysis: ProfitabilityAnalysis = {
        period,
        gross_profit: grossProfit,
        profit_margin: profitMargin,
        revenue_data: revenueData,
        expense_data: expenseData,
        category_roi: categoryROI,
        efficiency_metrics: efficiency,
        recommendations: this.generateProfitabilityRecommendations(
          revenueData, expenseData, grossProfit, profitMargin
        )
      };

      return { success: true, data: profitabilityAnalysis };
    } catch (error) {
      console.error('Failed to analyze profitability:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze profitability' 
      };
    }
  }

  /**
   * Calcula ROI por categoria
   */
  private calculateCategoryROI(
    revenue: Record<string, number>,
    expenses: Record<string, number>
  ): Record<string, number> {
    const categoryROI: Record<string, number> = {};
    
    // Combina categorias de receita e despesa
    const allCategories = new Set([
      ...Object.keys(revenue),
      ...Object.keys(expenses)
    ]);

    for (const category of allCategories) {
      const categoryRevenue = revenue[category] || 0;
      const categoryExpense = expenses[category] || 0;
      
      if (categoryExpense > 0) {
        categoryROI[category] = ((categoryRevenue - categoryExpense) / categoryExpense) * 100;
      } else if (categoryRevenue > 0) {
        categoryROI[category] = 100; // ROI infinito (só receita, sem despesa)
      } else {
        categoryROI[category] = 0;
      }
    }

    return categoryROI;
  }

  /**
   * Calcula ponto de equilíbrio
   */
  private calculateBreakEvenPoint(
    revenueData: RevenueAnalytics,
    expenseData: ExpenseAnalytics
  ): number {
    // Simplified break-even: quando receita = despesa
    if (revenueData.average_daily_revenue <= expenseData.average_daily_expense) {
      return Infinity; // Nunca atinge break-even
    }

    const dailyProfit = revenueData.average_daily_revenue - expenseData.average_daily_expense;
    return Math.ceil(expenseData.total_expenses / dailyProfit);
  }

  /**
   * Gera recomendações de rentabilidade
   */
  private generateProfitabilityRecommendations(
    revenueData: RevenueAnalytics,
    expenseData: ExpenseAnalytics,
    grossProfit: number,
    profitMargin: number
  ): string[] {
    const recommendations: string[] = [];

    // Análise de margem
    if (profitMargin < 10) {
      recommendations.push(
        'Margem de lucro baixa (<10%). Considere revisar preços ou reduzir custos.'
      );
    } else if (profitMargin > 30) {
      recommendations.push(
        'Excelente margem de lucro! Considere investir em crescimento.'
      );
    }

    // Análise de eficiência de custos
    const costRatio = expenseData.total_expenses / revenueData.total_revenue;
    if (costRatio > 0.8) {
      recommendations.push(
        'Custos muito altos em relação à receita. Priorize otimização de despesas.'
      );
    }

    // Análise de diversificação
    if (revenueData.performance_indicators.diversification_index < 0.5) {
      recommendations.push(
        'Diversifique suas fontes de receita para reduzir riscos financeiros.'
      );
    }

    // Análise de crescimento
    if (revenueData.growth_metrics.trend_analysis === 'declining') {
      recommendations.push(
        'Tendência de receita em declínio. Desenvolva estratégias de recuperação.'
      );
    }

    return recommendations;
  }
}
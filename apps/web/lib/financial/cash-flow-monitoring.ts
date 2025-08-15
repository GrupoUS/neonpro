/**
 * Cash Flow Monitoring Engine
 * Real-time financial analytics and monitoring system for NeonPro
 * 
 * @author BMad Method Implementation
 * @version 1.0.0
 * @created August 14, 2025
 */

import { supabase } from '@/lib/supabase/client';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface CashFlowData {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  source: 'treatment' | 'product' | 'subscription' | 'installment' | 'expense';
  clinic_id: string;
  payment_method?: 'pix' | 'credit_card' | 'cash' | 'bank_transfer';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface CashFlowSummary {
  period: string;
  total_income: number;
  total_expense: number;
  net_flow: number;
  transaction_count: number;
  average_transaction: number;
  growth_rate: number;
}

export interface CashFlowPrediction {
  date: Date;
  predicted_income: number;
  predicted_expense: number;
  predicted_net_flow: number;
  confidence_level: number;
  factors: string[];
}

export class CashFlowMonitoringEngine {
  private clinicId: string;

  constructor(clinicId: string) {
    this.clinicId = clinicId;
  }

  /**
   * Get real-time cash flow data for the current day
   */
  async getRealTimeCashFlow(): Promise<CashFlowData[]> {
    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch real-time cash flow: ${error.message}`);
    }

    return data.map(this.mapTransactionToCashFlow);
  }

  /**
   * Calculate cash flow summary for specified period
   */
  async getCashFlowSummary(period: 'daily' | 'weekly' | 'monthly', date?: Date): Promise<CashFlowSummary> {
    const targetDate = date || new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    switch (period) {
      case 'daily':
        startDate = startOfDay(targetDate);
        endDate = endOfDay(targetDate);
        periodLabel = format(targetDate, 'yyyy-MM-dd');
        break;
      case 'weekly':
        startDate = startOfWeek(targetDate);
        endDate = endOfWeek(targetDate);
        periodLabel = `Week of ${format(startDate, 'MMM dd, yyyy')}`;
        break;
      case 'monthly':
        startDate = startOfMonth(targetDate);
        endDate = endOfMonth(targetDate);
        periodLabel = format(targetDate, 'MMMM yyyy');
        break;
      default:
        throw new Error('Invalid period specified');
    }

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch cash flow summary: ${error.message}`);
    }

    const transactions = data || [];
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpense;

    // Calculate growth rate by comparing with previous period
    const previousPeriodSummary = await this.getPreviousPeriodSummary(period, targetDate);
    const growthRate = previousPeriodSummary.net_flow === 0 
      ? 0 
      : ((netFlow - previousPeriodSummary.net_flow) / Math.abs(previousPeriodSummary.net_flow)) * 100;

    return {
      period: periodLabel,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_flow: netFlow,
      transaction_count: transactions.length,
      average_transaction: transactions.length > 0 ? (totalIncome + totalExpense) / transactions.length : 0,
      growth_rate: growthRate
    };
  }

  /**
   * Get cash flow trend data for visualization
   */
  async getCashFlowTrend(days: number = 30): Promise<CashFlowSummary[]> {
    const trends: CashFlowSummary[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const summary = await this.getCashFlowSummary('daily', date);
      trends.push(summary);
    }

    return trends;
  }

  /**
   * Predict cash flow for future periods using historical data
   */
  async predictCashFlow(days: number = 30): Promise<CashFlowPrediction[]> {
    // Get historical data for pattern analysis
    const historicalData = await this.getCashFlowTrend(90);
    
    const predictions: CashFlowPrediction[] = [];
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);

      // Simple trend-based prediction (can be enhanced with ML models)
      const recentAvgIncome = this.calculateRecentAverage(historicalData, 'total_income', 14);
      const recentAvgExpense = this.calculateRecentAverage(historicalData, 'total_expense', 14);
      
      // Apply seasonal and weekly patterns
      const seasonalFactor = this.getSeasonalFactor(futureDate);
      const weeklyFactor = this.getWeeklyFactor(futureDate);
      
      const predictedIncome = recentAvgIncome * seasonalFactor * weeklyFactor;
      const predictedExpense = recentAvgExpense * seasonalFactor;
      
      // Calculate confidence level based on historical variance
      const confidenceLevel = this.calculateConfidenceLevel(historicalData, i);

      predictions.push({
        date: futureDate,
        predicted_income: Math.round(predictedIncome),
        predicted_expense: Math.round(predictedExpense),
        predicted_net_flow: Math.round(predictedIncome - predictedExpense),
        confidence_level: confidenceLevel,
        factors: this.getPredictionFactors(seasonalFactor, weeklyFactor)
      });
    }

    return predictions;
  }

  /**
   * Set up real-time alerts for cash flow thresholds
   */
  async setupCashFlowAlerts(thresholds: {
    low_balance?: number;
    high_expense_daily?: number;
    negative_flow_days?: number;
  }): Promise<void> {
    // Store alert configuration in database
    const { error } = await supabase
      .from('financial_alert_settings')
      .upsert({
        clinic_id: this.clinicId,
        low_balance_threshold: thresholds.low_balance,
        high_expense_daily_threshold: thresholds.high_expense_daily,
        negative_flow_days_threshold: thresholds.negative_flow_days,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to setup cash flow alerts: ${error.message}`);
    }
  }

  /**
   * Check for alert conditions and trigger notifications
   */
  async checkAlertConditions(): Promise<void> {
    const alertSettings = await this.getAlertSettings();
    if (!alertSettings) return;

    const today = await this.getCashFlowSummary('daily');
    const weekTrend = await this.getCashFlowTrend(7);

    // Check for low balance
    if (alertSettings.low_balance_threshold && today.net_flow < alertSettings.low_balance_threshold) {
      await this.triggerAlert('LOW_BALANCE', `Daily net flow (${today.net_flow}) is below threshold`);
    }

    // Check for high daily expenses
    if (alertSettings.high_expense_daily_threshold && today.total_expense > alertSettings.high_expense_daily_threshold) {
      await this.triggerAlert('HIGH_EXPENSES', `Daily expenses (${today.total_expense}) exceed threshold`);
    }

    // Check for consecutive negative flow days
    if (alertSettings.negative_flow_days_threshold) {
      const consecutiveNegativeDays = this.countConsecutiveNegativeDays(weekTrend);
      if (consecutiveNegativeDays >= alertSettings.negative_flow_days_threshold) {
        await this.triggerAlert('NEGATIVE_FLOW_STREAK', `${consecutiveNegativeDays} consecutive days of negative cash flow`);
      }
    }
  }

  /**
   * Private helper methods
   */
  private mapTransactionToCashFlow(transaction: any): CashFlowData {
    return {
      id: transaction.id,
      date: new Date(transaction.created_at),
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || 'uncategorized',
      description: transaction.description || '',
      source: transaction.source,
      clinic_id: transaction.clinic_id,
      payment_method: transaction.payment_method,
      status: transaction.status,
      created_at: new Date(transaction.created_at),
      updated_at: new Date(transaction.updated_at)
    };
  }

  private async getPreviousPeriodSummary(period: 'daily' | 'weekly' | 'monthly', currentDate: Date): Promise<CashFlowSummary> {
    let previousDate: Date;

    switch (period) {
      case 'daily':
        previousDate = subDays(currentDate, 1);
        break;
      case 'weekly':
        previousDate = subWeeks(currentDate, 1);
        break;
      case 'monthly':
        previousDate = subMonths(currentDate, 1);
        break;
      default:
        throw new Error('Invalid period');
    }

    return await this.getCashFlowSummary(period, previousDate);
  }

  private calculateRecentAverage(data: CashFlowSummary[], field: keyof CashFlowSummary, days: number): number {
    const recentData = data.slice(-days);
    const sum = recentData.reduce((total, item) => total + (Number(item[field]) || 0), 0);
    return sum / recentData.length;
  }

  private getSeasonalFactor(date: Date): number {
    // Simplified seasonal adjustment - can be enhanced with historical analysis
    const month = date.getMonth();
    const seasonalFactors = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 1.2]; // December boost
    return seasonalFactors[month];
  }

  private getWeeklyFactor(date: Date): number {
    // Weekend vs weekday patterns for aesthetic clinics
    const dayOfWeek = date.getDay();
    const weeklyFactors = [0.6, 1.1, 1.2, 1.15, 1.1, 1.3, 0.8]; // Sunday to Saturday
    return weeklyFactors[dayOfWeek];
  }

  private calculateConfidenceLevel(data: CashFlowSummary[], daysAhead: number): number {
    // Confidence decreases with time and increases with data consistency
    const baseConfidence = 0.95;
    const timeDecay = Math.max(0.5, 1 - (daysAhead * 0.02));
    const dataVariance = this.calculateVariance(data.map(d => d.net_flow));
    const varianceFactor = Math.max(0.6, 1 - (dataVariance / 100000)); // Adjust based on variance
    
    return Math.round((baseConfidence * timeDecay * varianceFactor) * 100) / 100;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private getPredictionFactors(seasonalFactor: number, weeklyFactor: number): string[] {
    const factors: string[] = [];
    
    if (seasonalFactor > 1.05) factors.push('High seasonal demand');
    if (seasonalFactor < 0.95) factors.push('Low seasonal period');
    if (weeklyFactor > 1.2) factors.push('Peak weekday');
    if (weeklyFactor < 0.8) factors.push('Weekend period');
    
    return factors;
  }

  private async getAlertSettings() {
    const { data, error } = await supabase
      .from('financial_alert_settings')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch alert settings: ${error.message}`);
    }

    return data;
  }

  private async triggerAlert(type: string, message: string): Promise<void> {
    // Insert alert into database
    await supabase
      .from('financial_alerts')
      .insert({
        clinic_id: this.clinicId,
        alert_type: type,
        message: message,
        severity: this.getAlertSeverity(type),
        status: 'active',
        created_at: new Date().toISOString()
      });

    // TODO: Implement notification sending (email, SMS, push)
    console.log(`FINANCIAL ALERT [${type}]: ${message}`);
  }

  private getAlertSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'LOW_BALANCE': 'high',
      'HIGH_EXPENSES': 'medium',
      'NEGATIVE_FLOW_STREAK': 'critical'
    };
    
    return severityMap[type] || 'medium';
  }

  private countConsecutiveNegativeDays(trends: CashFlowSummary[]): number {
    let count = 0;
    
    // Count from the end backwards
    for (let i = trends.length - 1; i >= 0; i--) {
      if (trends[i].net_flow < 0) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }
}

export default CashFlowMonitoringEngine;
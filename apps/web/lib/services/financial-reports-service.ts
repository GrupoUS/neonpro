import { createClient } from '@/app/utils/supabase/client';

// Tipos para relatórios financeiros
export interface AgingReportItem {
  vendor_id: string;
  vendor_name: string;
  vendor_document: string;
  total_amount: number;
  current: number; // 0-30 dias
  days_31_60: number;
  days_61_90: number;
  days_over_90: number;
  overdue_count: number;
  oldest_invoice_date: string;
}

export interface VendorPerformanceMetrics {
  vendor_id: string;
  vendor_name: string;
  total_invoices: number;
  total_amount: number;
  avg_payment_time: number; // em dias
  on_time_payments: number;
  late_payments: number;
  on_time_percentage: number;
  total_discounts_taken: number;
  payment_methods_used: string[];
  last_payment_date: string;
  risk_score: number; // 1-10, onde 10 é maior risco
}

export interface CategoryExpenseReport {
  category_id: string;
  category_name: string;
  parent_category_name?: string;
  current_month: number;
  previous_month: number;
  year_to_date: number;
  budget_allocated: number;
  budget_used_percentage: number;
  variance_amount: number; // diferença do orçado
  variance_percentage: number;
  invoice_count: number;
  avg_invoice_amount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BudgetTrackingReport {
  period: string; // YYYY-MM
  total_budget: number;
  total_spent: number;
  total_committed: number; // approved but not paid
  remaining_budget: number;
  budget_utilization_percentage: number;
  categories: {
    category_name: string;
    budgeted: number;
    spent: number;
    committed: number;
    remaining: number;
    variance: number;
    utilization_percentage: number;
  }[];
  alerts: {
    type: 'over_budget' | 'near_limit' | 'under_utilized';
    category: string;
    message: string;
    amount: number;
  }[];
}

export interface CashFlowProjection {
  date: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  opening_balance: number;
  projected_inflows: number;
  projected_outflows: number;
  net_cash_flow: number;
  closing_balance: number;
  accounts_payable_due: number;
  confidence_level: 'high' | 'medium' | 'low';
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface FinancialSummaryMetrics {
  total_payables: number;
  total_overdue: number;
  total_current: number;
  avg_payment_period: number;
  vendor_count: number;
  active_vendors: number;
  payment_velocity: number; // pagamentos por dia
  discount_opportunities: number;
  cost_savings_ytd: number;
  top_vendor_concentration: number; // % do top vendor no total
}

export class FinancialReportsService {
  private supabase: any;

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  // Relatório de Aging de Contas a Pagar
  async getAgingReport(
    _clinicId: string,
    asOfDate?: string
  ): Promise<AgingReportItem[]> {
    try {
      const _supabase = await this.getSupabaseClient();
      const _reportDate = asOfDate ? new Date(asOfDate) : new Date();

      // Mock implementation - substituir por query real
      const mockAgingData: AgingReportItem[] = [
        {
          vendor_id: '1',
          vendor_name: 'Fornecedor Alpha',
          vendor_document: '12.345.678/0001-90',
          total_amount: 45_000,
          current: 15_000,
          days_31_60: 12_000,
          days_61_90: 8000,
          days_over_90: 10_000,
          overdue_count: 3,
          oldest_invoice_date: '2025-04-15',
        },
        {
          vendor_id: '2',
          vendor_name: 'Fornecedor Beta',
          vendor_document: '98.765.432/0001-10',
          total_amount: 28_500,
          current: 28_500,
          days_31_60: 0,
          days_61_90: 0,
          days_over_90: 0,
          overdue_count: 0,
          oldest_invoice_date: '2025-07-01',
        },
        {
          vendor_id: '3',
          vendor_name: 'Fornecedor Gamma',
          vendor_document: '11.222.333/0001-44',
          total_amount: 18_200,
          current: 3200,
          days_31_60: 5000,
          days_61_90: 10_000,
          days_over_90: 0,
          overdue_count: 2,
          oldest_invoice_date: '2025-05-20',
        },
      ];

      return mockAgingData.sort((a, b) => b.total_amount - a.total_amount);
    } catch (error) {
      console.error('Error generating aging report:', error);
      return [];
    }
  }

  // Análise de Performance de Fornecedores
  async getVendorPerformanceReport(
    _clinicId: string,
    _startDate: string,
    _endDate: string
  ): Promise<VendorPerformanceMetrics[]> {
    try {
      const _supabase = await this.getSupabaseClient();

      // Mock implementation
      const mockPerformanceData: VendorPerformanceMetrics[] = [
        {
          vendor_id: '1',
          vendor_name: 'Fornecedor Alpha',
          total_invoices: 24,
          total_amount: 150_000,
          avg_payment_time: 32.5,
          on_time_payments: 18,
          late_payments: 6,
          on_time_percentage: 75,
          total_discounts_taken: 2500,
          payment_methods_used: ['bank_transfer', 'pix'],
          last_payment_date: '2025-07-18',
          risk_score: 6,
        },
        {
          vendor_id: '2',
          vendor_name: 'Fornecedor Beta',
          total_invoices: 12,
          total_amount: 68_500,
          avg_payment_time: 25.8,
          on_time_payments: 11,
          late_payments: 1,
          on_time_percentage: 91.7,
          total_discounts_taken: 850,
          payment_methods_used: ['pix', 'cash'],
          last_payment_date: '2025-07-20',
          risk_score: 3,
        },
        {
          vendor_id: '3',
          vendor_name: 'Fornecedor Gamma',
          total_invoices: 8,
          total_amount: 25_600,
          avg_payment_time: 45.2,
          on_time_payments: 5,
          late_payments: 3,
          on_time_percentage: 62.5,
          total_discounts_taken: 0,
          payment_methods_used: ['bank_transfer'],
          last_payment_date: '2025-06-30',
          risk_score: 7,
        },
      ];

      return mockPerformanceData.sort((a, b) => a.risk_score - b.risk_score);
    } catch (error) {
      console.error('Error generating vendor performance report:', error);
      return [];
    }
  }

  // Relatório de Despesas por Categoria
  async getCategoryExpenseReport(
    _clinicId: string,
    _year: number,
    _month?: number
  ): Promise<CategoryExpenseReport[]> {
    try {
      const _supabase = await this.getSupabaseClient();

      // Mock implementation
      const mockCategoryData: CategoryExpenseReport[] = [
        {
          category_id: '1',
          category_name: 'Equipamentos Médicos',
          current_month: 45_000,
          previous_month: 38_000,
          year_to_date: 280_000,
          budget_allocated: 300_000,
          budget_used_percentage: 93.3,
          variance_amount: -20_000,
          variance_percentage: -6.7,
          invoice_count: 12,
          avg_invoice_amount: 3750,
          trend: 'up',
        },
        {
          category_id: '2',
          category_name: 'Material de Consumo',
          current_month: 18_500,
          previous_month: 22_000,
          year_to_date: 145_000,
          budget_allocated: 180_000,
          budget_used_percentage: 80.6,
          variance_amount: 35_000,
          variance_percentage: 19.4,
          invoice_count: 28,
          avg_invoice_amount: 661,
          trend: 'down',
        },
        {
          category_id: '3',
          category_name: 'Serviços Terceirizados',
          current_month: 12_000,
          previous_month: 12_000,
          year_to_date: 84_000,
          budget_allocated: 120_000,
          budget_used_percentage: 70.0,
          variance_amount: 36_000,
          variance_percentage: 30.0,
          invoice_count: 7,
          avg_invoice_amount: 1714,
          trend: 'stable',
        },
        {
          category_id: '4',
          category_name: 'Software e Licenças',
          current_month: 8500,
          previous_month: 8500,
          year_to_date: 59_500,
          budget_allocated: 72_000,
          budget_used_percentage: 82.6,
          variance_amount: 12_500,
          variance_percentage: 17.4,
          invoice_count: 5,
          avg_invoice_amount: 1700,
          trend: 'stable',
        },
      ];

      return mockCategoryData.sort((a, b) => b.current_month - a.current_month);
    } catch (error) {
      console.error('Error generating category expense report:', error);
      return [];
    }
  }

  // Acompanhamento de Orçamento
  async getBudgetTrackingReport(
    _clinicId: string,
    period: string
  ): Promise<BudgetTrackingReport> {
    try {
      const _supabase = await this.getSupabaseClient();

      // Mock implementation
      const mockBudgetReport: BudgetTrackingReport = {
        period,
        total_budget: 600_000,
        total_spent: 465_000,
        total_committed: 85_000,
        remaining_budget: 50_000,
        budget_utilization_percentage: 91.7,
        categories: [
          {
            category_name: 'Equipamentos Médicos',
            budgeted: 300_000,
            spent: 280_000,
            committed: 15_000,
            remaining: 5000,
            variance: -295_000,
            utilization_percentage: 98.3,
          },
          {
            category_name: 'Material de Consumo',
            budgeted: 180_000,
            spent: 145_000,
            committed: 25_000,
            remaining: 10_000,
            variance: -170_000,
            utilization_percentage: 94.4,
          },
          {
            category_name: 'Serviços Terceirizados',
            budgeted: 120_000,
            spent: 84_000,
            committed: 15_000,
            remaining: 21_000,
            variance: -99_000,
            utilization_percentage: 82.5,
          },
        ],
        alerts: [
          {
            type: 'near_limit',
            category: 'Equipamentos Médicos',
            message:
              'Categoria próxima do limite orçamentário (98.3% utilizado)',
            amount: 295_000,
          },
          {
            type: 'over_budget',
            category: 'Material de Consumo',
            message: 'Gastos aprovados excedem orçamento em R$ 5.000',
            amount: 5000,
          },
        ],
      };

      return mockBudgetReport;
    } catch (error) {
      console.error('Error generating budget tracking report:', error);
      throw error;
    }
  }

  // Projeção de Fluxo de Caixa
  async getCashFlowProjection(
    _clinicId: string,
    periods = 12,
    periodType: 'weekly' | 'monthly' = 'monthly'
  ): Promise<CashFlowProjection[]> {
    try {
      const _supabase = await this.getSupabaseClient();

      // Mock implementation
      const projections: CashFlowProjection[] = [];
      const currentDate = new Date();
      let runningBalance = 250_000; // saldo inicial simulado

      for (let i = 0; i < periods; i++) {
        const projectedOutflows = 45_000 + (Math.random() * 20_000 - 10_000); // variação aleatória
        const projectedInflows = 65_000 + (Math.random() * 15_000 - 7500);
        const netFlow = projectedInflows - projectedOutflows;
        const apDue = 35_000 + Math.random() * 15_000;

        projections.push({
          date: currentDate.toISOString().split('T')[0],
          period_type: periodType,
          opening_balance: runningBalance,
          projected_inflows: projectedInflows,
          projected_outflows: projectedOutflows,
          net_cash_flow: netFlow,
          closing_balance: runningBalance + netFlow,
          accounts_payable_due: apDue,
          confidence_level: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
          scenarios: {
            optimistic: runningBalance + netFlow + 15_000,
            realistic: runningBalance + netFlow,
            pessimistic: runningBalance + netFlow - 12_000,
          },
        });

        runningBalance += netFlow;

        // Avançar período
        if (periodType === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 7);
        }
      }

      return projections;
    } catch (error) {
      console.error('Error generating cash flow projection:', error);
      return [];
    }
  }

  // Métricas Resumidas do Sistema Financeiro
  async getFinancialSummary(
    _clinicId: string
  ): Promise<FinancialSummaryMetrics> {
    try {
      const _supabase = await this.getSupabaseClient();

      // Mock implementation
      const summary: FinancialSummaryMetrics = {
        total_payables: 485_000,
        total_overdue: 45_000,
        total_current: 440_000,
        avg_payment_period: 28.5,
        vendor_count: 45,
        active_vendors: 32,
        payment_velocity: 12.3,
        discount_opportunities: 8500,
        cost_savings_ytd: 24_500,
        top_vendor_concentration: 31.2,
      };

      return summary;
    } catch (error) {
      console.error('Error generating financial summary:', error);
      throw error;
    }
  }

  // Utilitários para formatação
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  }

  getRiskColor(riskScore: number): 'secondary' | 'default' | 'destructive' {
    if (riskScore <= 3) return 'secondary';
    if (riskScore <= 6) return 'default';
    return 'destructive';
  }

  getBudgetHealthColor(
    utilizationPercentage: number
  ): 'secondary' | 'default' | 'destructive' {
    if (utilizationPercentage <= 80) return 'secondary';
    if (utilizationPercentage <= 95) return 'default';
    return 'destructive';
  }
}

export const financialReportsService = new FinancialReportsService();

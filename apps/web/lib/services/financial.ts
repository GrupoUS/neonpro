// Migrated from src/services/financial.ts
import { supabase } from '@/lib/supabase';

export interface FinancialTransaction {
  id?: string;
  tenant_id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: string;
  description: string;
  reference_id?: string;
  reference_type?: 'appointment' | 'patient' | 'product' | 'service';
  payment_method?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  transaction_date: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  pending_receivables: number;
  pending_payables: number;
  currency: string;
  period_start: string;
  period_end: string;
}

export interface RevenueAnalytics {
  daily_revenue: Array<{ date: string; amount: number }>;
  monthly_revenue: Array<{ month: string; amount: number }>;
  revenue_by_service: Array<{
    service: string;
    amount: number;
    percentage: number;
  }>;
  payment_methods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

export class FinancialService {
  async createTransaction(
    transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ transaction?: FinancialTransaction; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          ...transaction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update financial summary cache
      await this.invalidateFinancialCache(transaction.tenant_id);

      return { transaction: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create transaction',
      };
    }
  }

  async getTransactions(
    tenantId: string,
    filters?: {
      type?: FinancialTransaction['type'];
      category?: string;
      status?: FinancialTransaction['status'];
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    transactions?: FinancialTransaction[];
    total?: number;
    error?: string;
  }> {
    try {
      let query = supabase
        .from('financial_transactions')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('transaction_date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          (filters.offset || 0) + (filters.limit || 50) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return { transactions: data, total: count || 0 };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to get transactions',
      };
    }
  }

  async updateTransaction(
    id: string,
    tenantId: string,
    updates: Partial<FinancialTransaction>
  ): Promise<{ transaction?: FinancialTransaction; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update financial summary cache
      await this.invalidateFinancialCache(tenantId);

      return { transaction: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update transaction',
      };
    }
  }

  async deleteTransaction(
    id: string,
    tenantId: string
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) {
        return { error: error.message };
      }

      // Update financial summary cache
      await this.invalidateFinancialCache(tenantId);

      return { success: true };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete transaction',
      };
    }
  }

  async getFinancialSummary(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{ summary?: FinancialSummary; error?: string }> {
    try {
      // Get income transactions
      const { data: incomeData, error: incomeError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'income')
        .eq('status', 'completed')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (incomeError) {
        return { error: incomeError.message };
      }

      // Get expense transactions
      const { data: expenseData, error: expenseError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'expense')
        .eq('status', 'completed')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (expenseError) {
        return { error: expenseError.message };
      }

      // Get pending receivables
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'income')
        .eq('status', 'pending')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (receivablesError) {
        return { error: receivablesError.message };
      }

      // Get pending payables
      const { data: payablesData, error: payablesError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'expense')
        .eq('status', 'pending')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (payablesError) {
        return { error: payablesError.message };
      }

      const totalIncome =
        incomeData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpenses =
        expenseData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingReceivables =
        receivablesData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingPayables =
        payablesData?.reduce((sum, t) => sum + t.amount, 0) || 0;

      const summary: FinancialSummary = {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: totalIncome - totalExpenses,
        pending_receivables: pendingReceivables,
        pending_payables: pendingPayables,
        currency: 'BRL',
        period_start: startDate,
        period_end: endDate,
      };

      return { summary };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get financial summary',
      };
    }
  }

  async getRevenueAnalytics(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{ analytics?: RevenueAnalytics; error?: string }> {
    try {
      // Get daily revenue
      const { data: dailyData, error: dailyError } = await supabase.rpc(
        'get_daily_revenue',
        {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (dailyError) {
        return { error: dailyError.message };
      }

      // Get monthly revenue
      const { data: monthlyData, error: monthlyError } = await supabase.rpc(
        'get_monthly_revenue',
        {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (monthlyError) {
        return { error: monthlyError.message };
      }

      // Get revenue by service
      const { data: serviceData, error: serviceError } = await supabase.rpc(
        'get_revenue_by_service',
        {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (serviceError) {
        return { error: serviceError.message };
      }

      // Get payment methods breakdown
      const { data: paymentData, error: paymentError } = await supabase.rpc(
        'get_payment_methods_breakdown',
        {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (paymentError) {
        return { error: paymentError.message };
      }

      const analytics: RevenueAnalytics = {
        daily_revenue: dailyData || [],
        monthly_revenue: monthlyData || [],
        revenue_by_service: serviceData || [],
        payment_methods: paymentData || [],
      };

      return { analytics };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get revenue analytics',
      };
    }
  }

  async recordAppointmentPayment(
    tenantId: string,
    appointmentId: string,
    amount: number,
    paymentMethod: string,
    description?: string
  ): Promise<{ transaction?: FinancialTransaction; error?: string }> {
    try {
      const transaction: Omit<
        FinancialTransaction,
        'id' | 'created_at' | 'updated_at'
      > = {
        tenant_id: tenantId,
        type: 'income',
        category: 'appointment',
        amount,
        currency: 'BRL',
        description: description || `Payment for appointment ${appointmentId}`,
        reference_id: appointmentId,
        reference_type: 'appointment',
        payment_method: paymentMethod,
        status: 'completed',
        transaction_date: new Date().toISOString(),
      };

      return this.createTransaction(transaction);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record appointment payment',
      };
    }
  }

  private async invalidateFinancialCache(tenantId: string): Promise<void> {
    // Invalidate any cached financial data
    // This would integrate with your caching layer if you have one
    console.log(`Invalidating financial cache for tenant: ${tenantId}`);
  }
}

export const financialService = new FinancialService();

// Cash Flow Service - Supabase operations for cash flow management
// Following financial dashboard patterns from Context7 research

import { createClient } from '@/app/utils/supabase/client';
import type { 
  CashFlowEntry, 
  CashRegister, 
  PaymentReconciliation, 
  ReconciliationDiscrepancy,
  CashFlowFilters,
  CashFlowAnalytics 
} from '../types';

export class CashFlowService {
  private supabase = createClient();

  // Cash Flow Entries Operations
  async getCashFlowEntries(
    clinicId: string, 
    filters?: CashFlowFilters,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      let query = this.supabase
        .from('cash_flow_entries')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.registerId) {
        query = query.eq('register_id', filters.registerId);
      }      if (filters?.transactionType) {
        query = query.eq('transaction_type', filters.transactionType);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }
      if (filters?.isReconciled !== undefined) {
        query = query.eq('is_reconciled', filters.isReconciled);
      }
      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as CashFlowEntry[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching cash flow entries:', error);
      throw error;
    }
  }

  async createCashFlowEntry(entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('cash_flow_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;

      // Update register balance if register_id is provided
      if (entry.register_id) {
        await this.updateRegisterBalance(entry.register_id, entry.amount, entry.transaction_type);
      }

      return data as CashFlowEntry;
    } catch (error) {
      console.error('Error creating cash flow entry:', error);
      throw error;
    }
  }  async updateCashFlowEntry(id: string, updates: Partial<CashFlowEntry>) {
    try {
      const { data, error } = await this.supabase
        .from('cash_flow_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CashFlowEntry;
    } catch (error) {
      console.error('Error updating cash flow entry:', error);
      throw error;
    }
  }

  async deleteCashFlowEntry(id: string) {
    try {
      const { error } = await this.supabase
        .from('cash_flow_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting cash flow entry:', error);
      throw error;
    }
  }

  // Cash Register Operations
  async getCashRegisters(clinicId: string) {
    try {
      const { data, error } = await this.supabase
        .from('cash_registers')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('register_name');

      if (error) throw error;
      return data as CashRegister[];
    } catch (error) {
      console.error('Error fetching cash registers:', error);
      throw error;
    }
  }  async createCashRegister(register: Omit<CashRegister, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('cash_registers')
        .insert(register)
        .select()
        .single();

      if (error) throw error;
      return data as CashRegister;
    } catch (error) {
      console.error('Error creating cash register:', error);
      throw error;
    }
  }

  async updateRegisterBalance(registerId: string, amount: number, transactionType: string) {
    try {
      const { data: register, error: fetchError } = await this.supabase
        .from('cash_registers')
        .select('current_balance')
        .eq('id', registerId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = register.current_balance || 0;
      let newBalance = currentBalance;

      // Calculate new balance based on transaction type
      if (['receipt', 'opening_balance'].includes(transactionType)) {
        newBalance = currentBalance + amount;
      } else if (['payment', 'closing_balance'].includes(transactionType)) {
        newBalance = currentBalance - amount;
      }
      // Transfer and adjustment types require special handling

      const { data, error } = await this.supabase
        .from('cash_registers')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', registerId)
        .select()
        .single();

      if (error) throw error;
      return data as CashRegister;
    } catch (error) {
      console.error('Error updating register balance:', error);
      throw error;
    }
  }  // Analytics and Calculations
  async getCashFlowAnalytics(
    clinicId: string, 
    periodStart: string, 
    periodEnd: string,
    registerId?: string
  ): Promise<CashFlowAnalytics> {
    try {
      let query = this.supabase
        .from('cash_flow_entries')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      if (registerId) {
        query = query.eq('register_id', registerId);
      }

      const { data: entries, error } = await query;
      if (error) throw error;

      const analytics = this.calculateAnalytics(entries as CashFlowEntry[], periodStart, periodEnd);
      return analytics;
    } catch (error) {
      console.error('Error fetching cash flow analytics:', error);
      throw error;
    }
  }

  private calculateAnalytics(entries: CashFlowEntry[], periodStart: string, periodEnd: string): CashFlowAnalytics {
    const incomeTypes = ['receipt', 'opening_balance'];
    const expenseTypes = ['payment', 'closing_balance'];

    const totalIncome = entries
      .filter(e => incomeTypes.includes(e.transaction_type))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = entries
      .filter(e => expenseTypes.includes(e.transaction_type))
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      periodStart,
      periodEnd,
      byCategory: this.groupByCategory(entries),
      byPaymentMethod: this.groupByPaymentMethod(entries),
      byDay: this.groupByDay(entries, periodStart, periodEnd),
      registers: [] // Will be populated by separate query
    };
  }

  private groupByCategory(entries: CashFlowEntry[]) {
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    const grouped = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));
  }  private groupByPaymentMethod(entries: CashFlowEntry[]) {
    const grouped = entries.reduce((acc, entry) => {
      const key = entry.payment_method;
      if (!acc[key]) {
        acc[key] = { amount: 0, count: 0 };
      }
      acc[key].amount += entry.amount;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return Object.entries(grouped).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count
    }));
  }

  private groupByDay(entries: CashFlowEntry[], periodStart: string, periodEnd: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const days: Array<{ date: string; income: number; expenses: number; net: number }> = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.created_at.startsWith(dateStr));
      
      const income = dayEntries
        .filter(e => ['receipt', 'opening_balance'].includes(e.transaction_type))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const expenses = dayEntries
        .filter(e => ['payment', 'closing_balance'].includes(e.transaction_type))
        .reduce((sum, e) => sum + e.amount, 0);

      days.push({
        date: dateStr,
        income,
        expenses,
        net: income - expenses
      });
    }

    return days;
  }

  // Reconciliation Operations
  async getReconciliations(clinicId: string) {
    try {
      const { data, error } = await this.supabase
        .from('payment_reconciliations')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('reconciliation_date', { ascending: false });

      if (error) throw error;
      return data as PaymentReconciliation[];
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      throw error;
    }
  }
}

export const cashFlowService = new CashFlowService();
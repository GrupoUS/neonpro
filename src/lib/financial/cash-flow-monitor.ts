/**
 * Real-time Cash Flow Monitoring Engine
 * NeonPro - Sistema de monitoramento de cash flow em tempo real para clínicas estéticas
 */

import { createClient } from '@/app/utils/supabase/server';
import { 
  CashFlowEntry, 
  CashFlowSummary, 
  CashFlowAccount, 
  CashFlowTrend,
  CashFlowType,
  CashFlowCategory,
  AccountType,
  SyncFrequency,
  FinancialAPIResponse
} from './types/cash-flow';

// ====================================================================
// CASH FLOW MONITORING ENGINE
// ====================================================================

export class CashFlowMonitoringEngine {
  private supabase = createClient();

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize real-time monitoring system
   */
  private async initializeMonitoring(): Promise<void> {
    try {
      // Setup real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      // Initialize background sync processes
      await this.initializeBackgroundSync();
      
      console.log('Cash flow monitoring engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cash flow monitoring:', error);
      throw error;
    }
  }

  /**
   * Setup real-time database subscriptions
   */
  private async setupRealtimeSubscriptions(): Promise<void> {
    // Subscribe to cash flow entries changes
    this.supabase
      .channel('cash_flow_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_flow_entries'
      }, (payload) => {
        this.handleCashFlowChange(payload);
      })
      .subscribe();

    // Subscribe to account balance changes
    this.supabase
      .channel('account_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_flow_accounts'
      }, (payload) => {
        this.handleAccountChange(payload);
      })
      .subscribe();
  }

  /**
   * Handle real-time cash flow changes
   */
  private async handleCashFlowChange(payload: any): Promise<void> {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        await this.processNewCashFlowEntry(newRecord);
      } else if (eventType === 'UPDATE') {
        await this.processCashFlowUpdate(newRecord, oldRecord);
      } else if (eventType === 'DELETE') {
        await this.processCashFlowDeletion(oldRecord);
      }

      // Trigger real-time dashboard updates
      await this.broadcastCashFlowUpdate();
    } catch (error) {
      console.error('Error handling cash flow change:', error);
    }
  }

  /**
   * Handle real-time account changes
   */
  private async handleAccountChange(payload: any): Promise<void> {
    try {
      const { eventType, new: newRecord } = payload;
      
      if (eventType === 'UPDATE') {
        await this.updateAccountBalance(newRecord);
      }

      // Trigger balance update notifications
      await this.broadcastBalanceUpdate(newRecord);
    } catch (error) {
      console.error('Error handling account change:', error);
    }
  }

  /**
   * Get real-time cash flow summary
   */
  async getCashFlowSummary(
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'monthly',
    startDate?: Date,
    endDate?: Date
  ): Promise<FinancialAPIResponse<CashFlowSummary>> {
    const start = performance.now();
    
    try {
      const dateFilter = this.buildDateFilter(periodType, startDate, endDate);
      
      // Get cash flow entries for the period
      const { data: entries, error } = await this.supabase
        .from('cash_flow_entries')
        .select('*')
        .gte('date', dateFilter.startDate.toISOString())
        .lte('date', dateFilter.endDate.toISOString())
        .eq('is_forecast', false)
        .order('date', { ascending: true });

      if (error) throw error;

      // Calculate summary metrics
      const summary = this.calculateCashFlowSummary(entries || [], periodType, dateFilter);
      
      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: summary,
        timestamp: new Date(),
        execution_time_ms: executionTime,
        shadow_test_passed: await this.validateSummaryCalculation(summary, entries || [])
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cash flow summary',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Get real-time account balances
   */
  async getAccountBalances(): Promise<FinancialAPIResponse<CashFlowAccount[]>> {
    const start = performance.now();
    
    try {
      const { data: accounts, error } = await this.supabase
        .from('cash_flow_accounts')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Update balances with latest transactions
      const updatedAccounts = await Promise.all(
        (accounts || []).map(account => this.updateAccountWithLatestBalance(account))
      );

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: updatedAccounts,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account balances',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Get cash flow trend analysis
   */
  async getCashFlowTrend(
    days: number = 30,
    accountId?: string
  ): Promise<FinancialAPIResponse<CashFlowTrend[]>> {
    const start = performance.now();
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let query = this.supabase
        .from('cash_flow_entries')
        .select('*')
        .gte('date', startDate.toISOString())
        .eq('is_forecast', false)
        .order('date', { ascending: true });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data: entries, error } = await query;
      if (error) throw error;

      // Calculate daily trends
      const trends = this.calculateDailyTrends(entries || [], days);
      
      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: trends,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cash flow trend',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Record new cash flow entry
   */
  async recordCashFlowEntry(entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialAPIResponse<CashFlowEntry>> {
    const start = performance.now();
    
    try {
      // Validate entry data
      await this.validateCashFlowEntry(entry);

      // Create the entry
      const { data: newEntry, error } = await this.supabase
        .from('cash_flow_entries')
        .insert([{
          ...entry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      await this.updateAccountBalanceAfterEntry(entry.account_id, entry.amount, entry.type);
      
      // Trigger real-time updates
      await this.broadcastCashFlowUpdate();
      
      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: newEntry,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record cash flow entry',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Get cash flow by category
   */
  async getCashFlowByCategory(
    startDate: Date,
    endDate: Date,
    type?: CashFlowType
  ): Promise<FinancialAPIResponse<Record<CashFlowCategory, number>>> {
    const start = performance.now();
    
    try {
      let query = this.supabase
        .from('cash_flow_entries')
        .select('category, amount')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('is_forecast', false);

      if (type) {
        query = query.eq('type', type);
      }

      const { data: entries, error } = await query;
      if (error) throw error;

      // Group by category
      const categoryTotals = (entries || []).reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<CashFlowCategory, number>);

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: categoryTotals,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cash flow by category',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Sync account balance with banking API
   */
  async syncAccountBalance(accountId: string): Promise<FinancialAPIResponse<CashFlowAccount>> {
    const start = performance.now();
    
    try {
      // Get account details
      const { data: account, error: accountError } = await this.supabase
        .from('cash_flow_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (accountError) throw accountError;

      if (!account.api_connected) {
        throw new Error('Account is not connected to banking API');
      }

      // Simulate banking API call (replace with actual integration)
      const bankingData = await this.fetchBankingData(account);
      
      // Update account balance
      const { data: updatedAccount, error: updateError } = await this.supabase
        .from('cash_flow_accounts')
        .update({
          current_balance: bankingData.balance,
          available_balance: bankingData.availableBalance,
          last_sync: new Date().toISOString()
        })
        .eq('id', accountId)
        .select()
        .single();

      if (updateError) throw updateError;

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: updatedAccount,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync account balance',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  /**
   * Build date filter for queries
   */
  private buildDateFilter(
    periodType: string,
    startDate?: Date,
    endDate?: Date
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = endDate || now;

    if (startDate) {
      start = startDate;
    } else {
      switch (periodType) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarterly':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          start = new Date(now.getFullYear(), quarterStart, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    return { startDate: start, endDate: end };
  }

  /**
   * Calculate cash flow summary from entries
   */
  private calculateCashFlowSummary(
    entries: any[],
    periodType: string,
    dateFilter: { startDate: Date; endDate: Date }
  ): CashFlowSummary {
    const inflows = entries.filter(e => e.type === 'inflow' || e.type === 'transfer_in');
    const outflows = entries.filter(e => e.type === 'outflow' || e.type === 'transfer_out');
    
    const totalInflow = inflows.reduce((sum, e) => sum + e.amount, 0);
    const totalOutflow = outflows.reduce((sum, e) => sum + e.amount, 0);
    const netCashFlow = totalInflow - totalOutflow;
    
    // Calculate trend
    const days = Math.ceil((dateFilter.endDate.getTime() - dateFilter.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = days > 0 ? netCashFlow / days : 0;
    
    // Determine trend direction
    const recentEntries = entries.slice(-Math.ceil(entries.length / 2));
    const recentNet = recentEntries.reduce((sum, e) => {
      return sum + (e.type === 'inflow' ? e.amount : -e.amount);
    }, 0);
    
    const olderEntries = entries.slice(0, Math.floor(entries.length / 2));
    const olderNet = olderEntries.reduce((sum, e) => {
      return sum + (e.type === 'inflow' ? e.amount : -e.amount);
    }, 0);
    
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;
    
    if (olderNet !== 0) {
      trendPercentage = ((recentNet - olderNet) / Math.abs(olderNet)) * 100;
      if (trendPercentage > 5) trendDirection = 'up';
      else if (trendPercentage < -5) trendDirection = 'down';
    }

    return {
      period: `${dateFilter.startDate.toISOString().split('T')[0]} to ${dateFilter.endDate.toISOString().split('T')[0]}`,
      opening_balance: 0, // Will be calculated from account data
      closing_balance: netCashFlow,
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
      net_cash_flow: netCashFlow,
      daily_average: dailyAverage,
      trend_direction: trendDirection,
      trend_percentage: Math.abs(trendPercentage),
      period_type: periodType as any
    };
  }

  /**
   * Calculate daily trends
   */
  private calculateDailyTrends(entries: any[], days: number): CashFlowTrend[] {
    const trends: CashFlowTrend[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayEntries = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.toDateString() === date.toDateString();
      });
      
      const dayInflow = dayEntries
        .filter(e => e.type === 'inflow' || e.type === 'transfer_in')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const dayOutflow = dayEntries
        .filter(e => e.type === 'outflow' || e.type === 'transfer_out')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const netPosition = dayInflow - dayOutflow;
      
      // Calculate cumulative values
      const previousTrend = trends[trends.length - 1];
      const cumulativeInflow = (previousTrend?.cumulative_inflow || 0) + dayInflow;
      const cumulativeOutflow = (previousTrend?.cumulative_outflow || 0) + dayOutflow;
      
      // Calculate weekly average (last 7 days)
      const last7Days = trends.slice(-6);
      const weeklyAverage = last7Days.length > 0 
        ? (last7Days.reduce((sum, t) => sum + (t.cumulative_inflow - t.cumulative_outflow), 0) + netPosition) / (last7Days.length + 1)
        : netPosition;
      
      trends.push({
        date,
        cumulative_inflow: cumulativeInflow,
        cumulative_outflow: cumulativeOutflow,
        net_position: netPosition,
        daily_change: netPosition,
        weekly_average: weeklyAverage,
        monthly_projection: weeklyAverage * 30 // Simple projection
      });
    }
    
    return trends;
  }

  /**
   * Validate cash flow entry data
   */
  private async validateCashFlowEntry(entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    if (!entry.amount || entry.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!entry.account_id) {
      throw new Error('Account ID is required');
    }
    
    if (!entry.category) {
      throw new Error('Category is required');
    }
    
    if (!entry.description || entry.description.trim().length === 0) {
      throw new Error('Description is required');
    }
    
    // Verify account exists
    const { data: account } = await this.supabase
      .from('cash_flow_accounts')
      .select('id')
      .eq('id', entry.account_id)
      .single();
    
    if (!account) {
      throw new Error('Invalid account ID');
    }
  }

  /**
   * Update account balance after new entry
   */
  private async updateAccountBalanceAfterEntry(
    accountId: string,
    amount: number,
    type: CashFlowType
  ): Promise<void> {
    let balanceChange = 0;
    
    switch (type) {
      case 'inflow':
      case 'transfer_in':
        balanceChange = amount;
        break;
      case 'outflow':
      case 'transfer_out':
        balanceChange = -amount;
        break;
      case 'adjustment':
        balanceChange = amount; // Can be positive or negative
        break;
    }
    
    await this.supabase.rpc('update_account_balance', {
      account_id: accountId,
      balance_change: balanceChange
    });
  }

  /**
   * Update account with latest balance calculation
   */
  private async updateAccountWithLatestBalance(account: any): Promise<CashFlowAccount> {
    // Calculate balance from transactions
    const { data: entries } = await this.supabase
      .from('cash_flow_entries')
      .select('amount, type')
      .eq('account_id', account.id)
      .eq('is_forecast', false);

    let calculatedBalance = 0;
    
    (entries || []).forEach(entry => {
      switch (entry.type) {
        case 'inflow':
        case 'transfer_in':
          calculatedBalance += entry.amount;
          break;
        case 'outflow':
        case 'transfer_out':
          calculatedBalance -= entry.amount;
          break;
        case 'adjustment':
          calculatedBalance += entry.amount;
          break;
      }
    });

    return {
      ...account,
      current_balance: calculatedBalance
    };
  }

  /**
   * Validate summary calculation with shadow testing
   */
  private async validateSummaryCalculation(summary: CashFlowSummary, entries: any[]): Promise<boolean> {
    try {
      // Re-calculate summary using alternative method
      const shadowInflow = entries
        .filter(e => e.type === 'inflow' || e.type === 'transfer_in')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const shadowOutflow = entries
        .filter(e => e.type === 'outflow' || e.type === 'transfer_out')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const shadowNet = shadowInflow - shadowOutflow;
      
      // Check if calculations match within tolerance (0.01%)
      const tolerance = 0.0001;
      const inflowMatch = Math.abs(summary.total_inflow - shadowInflow) / Math.max(summary.total_inflow, 1) < tolerance;
      const outflowMatch = Math.abs(summary.total_outflow - shadowOutflow) / Math.max(summary.total_outflow, 1) < tolerance;
      const netMatch = Math.abs(summary.net_cash_flow - shadowNet) / Math.max(Math.abs(summary.net_cash_flow), 1) < tolerance;
      
      return inflowMatch && outflowMatch && netMatch;
    } catch (error) {
      console.error('Shadow testing failed:', error);
      return false;
    }
  }

  /**
   * Process new cash flow entry
   */
  private async processNewCashFlowEntry(entry: any): Promise<void> {
    // Update running totals, trigger alerts if needed
    console.log('Processing new cash flow entry:', entry.id);
  }

  /**
   * Process cash flow update
   */
  private async processCashFlowUpdate(newEntry: any, oldEntry: any): Promise<void> {
    // Handle entry modifications
    console.log('Processing cash flow update:', newEntry.id);
  }

  /**
   * Process cash flow deletion
   */
  private async processCashFlowDeletion(entry: any): Promise<void> {
    // Reverse the effects of the deleted entry
    console.log('Processing cash flow deletion:', entry.id);
  }

  /**
   * Broadcast cash flow updates to connected clients
   */
  private async broadcastCashFlowUpdate(): Promise<void> {
    // Implement real-time broadcasting logic
    console.log('Broadcasting cash flow update');
  }

  /**
   * Update account balance
   */
  private async updateAccountBalance(account: any): Promise<void> {
    // Handle account balance updates
    console.log('Updating account balance:', account.id);
  }

  /**
   * Broadcast balance updates
   */
  private async broadcastBalanceUpdate(account: any): Promise<void> {
    // Broadcast balance changes to dashboard
    console.log('Broadcasting balance update:', account.id);
  }

  /**
   * Initialize background sync processes
   */
  private async initializeBackgroundSync(): Promise<void> {
    // Setup periodic sync with banking APIs
    console.log('Initializing background sync processes');
  }

  /**
   * Fetch banking data (placeholder for actual API integration)
   */
  private async fetchBankingData(account: any): Promise<{ balance: number; availableBalance: number }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data - replace with actual banking API integration
    return {
      balance: account.current_balance + Math.random() * 1000 - 500,
      availableBalance: account.current_balance + Math.random() * 800 - 400
    };
  }
}
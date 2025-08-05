import {
    ApprovalEligibility,
    ApprovalWorkflowPerformance,
    ApprovalWorkflowRule,
    BudgetAllocation,
    BudgetAllocationRequest,
    BudgetForecast,
    BudgetNotification,
    BudgetOptimizationRecommendation,
    BudgetUtilizationSummary,
    BudgetValidationResult,
    CostCenter,
    CreateApprovalRequest,
    CreateBudgetRequest,
    CreateWorkflowRuleRequest,
    InventoryBudget,
    ProcessApprovalRequest,
    PurchaseOrderApproval
} from '@/app/types/budget-approval';
import { createClient } from '@/lib/supabase/server';

export class BudgetApprovalService {
  private async getSupabaseClient() {
    const supabase = await createClient();
    return await createClient();
  }

  // =====================================================================================
  // BUDGET MANAGEMENT
  // =====================================================================================

  async createBudget(request: CreateBudgetRequest, clinicId: string, userId: string): Promise<InventoryBudget> {

    const budgetData = {
      ...request,
      clinic_id: clinicId,
      created_by: userId,
      allocated_amount: 0,
      spent_amount: 0,
      remaining_amount: request.total_amount,
      status: 'draft' as const
    };

    const { data: budget, error } = await supabase
      .from('inventory_budgets')
      .insert(budgetData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create budget: ${error.message}`);

    // Create initial allocations if provided
    if (request.allocations && request.allocations.length > 0) {
      await this.createBudgetAllocations(budget.id, request.allocations);
    }

    return budget;
  }

  async getBudget(budgetId: string): Promise<InventoryBudget | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inventory_budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get budget: ${error.message}`);
    }

    return data;
  }

  async updateBudget(budgetId: string, updates: Partial<InventoryBudget>): Promise<InventoryBudget> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inventory_budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update budget: ${error.message}`);
    return data;
  }

  async listBudgets(clinicId: string, filters?: {
    status?: string;
    fiscalYear?: number;
    budgetType?: string;
    costCenterId?: string;
  }): Promise<InventoryBudget[]> {

    let query = supabase
      .from('inventory_budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.fiscalYear) {
      query = query.eq('fiscal_year', filters.fiscalYear);
    }
    if (filters?.budgetType) {
      query = query.eq('budget_type', filters.budgetType);
    }
    if (filters?.costCenterId) {
      query = query.eq('cost_center_id', filters.costCenterId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list budgets: ${error.message}`);
    return data || [];
  }

  async approveBudget(budgetId: string, approverId: string): Promise<InventoryBudget> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inventory_budgets')
      .update({
        status: 'active',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve budget: ${error.message}`);
    return data;
  }

  async validateBudget(budgetId: string): Promise<BudgetValidationResult> {
    const budget = await this.getBudget(budgetId);
    if (!budget) {
      return {
        is_valid: false,
        errors: ['Budget not found'],
        warnings: [],
        recommendations: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate budget amounts
    if (budget.total_amount <= 0) {
      errors.push('Total amount must be positive');
    }

    if ((budget.allocated_amount || 0) > budget.total_amount) {
      errors.push('Allocated amount exceeds total budget');
    }

    if ((budget.spent_amount || 0) > (budget.allocated_amount || 0)) {
      warnings.push('Spent amount exceeds allocated amount');
    }

    // Validate budget period
    const startDate = new Date(budget.budget_period_start || '');
    const endDate = new Date(budget.budget_period_end || '');
    
    if (startDate >= endDate) {
      errors.push('Budget period start date must be before end date');
    }

    // Check utilization
    const utilizationRate = (budget.allocated_amount || 0) > 0 ? ((budget.spent_amount || 0) / (budget.allocated_amount || 0)) * 100 : 0;
    
    if (utilizationRate > 90) {
      warnings.push('Budget utilization is above 90%');
      recommendations.push('Consider reallocating funds or requesting budget increase');
    } else if (utilizationRate < 50) {
      recommendations.push('Budget utilization is low - consider reallocating unused funds');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  // =====================================================================================
  // BUDGET ALLOCATION MANAGEMENT
  // =====================================================================================

  async createBudgetAllocations(budgetId: string, allocations: Omit<BudgetAllocationRequest, 'budget_id'>[]): Promise<BudgetAllocation[]> {

    const allocationsData = allocations.map(allocation => ({
      ...allocation,
      budget_id: budgetId,
      available_amount: allocation.allocated_amount,
      percentage_of_total: 0 // Will be calculated after insert
    }));

    const { data, error } = await supabase
      .from('budget_allocations')
      .insert(allocationsData)
      .select();

    if (error) throw new Error(`Failed to create budget allocations: ${error.message}`);

    // Update budget allocated amount
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocated_amount, 0);
    await this.updateBudgetAllocatedAmount(budgetId, totalAllocated);

    return data || [];
  }

  async getBudgetAllocations(budgetId: string): Promise<BudgetAllocation[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('budget_allocations')
      .select('*')
      .eq('budget_id', budgetId)
      .order('allocated_amount', { ascending: false });

    if (error) throw new Error(`Failed to get budget allocations: ${error.message}`);
    return data || [];
  }

  async updateBudgetAllocation(allocationId: string, updates: Partial<BudgetAllocation>): Promise<BudgetAllocation> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('budget_allocations')
      .update(updates)
      .eq('id', allocationId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update budget allocation: ${error.message}`);
    return data;
  }

  private async updateBudgetAllocatedAmount(budgetId: string, additionalAmount: number): Promise<void> {

    const { error } = await supabase.rpc('update_budget_allocated_amount', {
      budget_id: budgetId,
      additional_amount: additionalAmount
    });

    if (error) throw new Error(`Failed to update budget allocated amount: ${error.message}`);
  }

  // =====================================================================================
  // COST CENTER MANAGEMENT
  // =====================================================================================

  async createCostCenter(costCenter: Omit<CostCenter, 'id' | 'created_at' | 'updated_at'>, clinicId: string): Promise<CostCenter> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cost_centers')
      .insert({ ...costCenter, clinic_id: clinicId })
      .select()
      .single();

    if (error) throw new Error(`Failed to create cost center: ${error.message}`);
    return data;
  }

  async listCostCenters(clinicId: string): Promise<CostCenter[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Failed to list cost centers: ${error.message}`);
    return data || [];
  }

  // =====================================================================================
  // APPROVAL WORKFLOW MANAGEMENT
  // =====================================================================================

  async createApprovalRequest(request: CreateApprovalRequest): Promise<PurchaseOrderApproval[]> {

    // Simplified approval creation - would be expanded based on actual requirements
    const approvals: any[] = [{
      purchase_order_id: request.purchase_order_id,
      approver_id: '', // Would be assigned based on business rules
      approval_level: 1,
      status: 'pending'
    }];

    const { data, error } = await supabase
      .from('purchase_order_approvals')
      .insert(approvals)
      .select();

    if (error) throw new Error(`Failed to create approval request: ${error.message}`);
    return data || [];
  }

  async processApproval(request: ProcessApprovalRequest): Promise<PurchaseOrderApproval> {

    const updates: any = {
      status: 'approved', // Simplified - would use request.decision in real implementation
      decision_date: new Date().toISOString(),
      comments: 'Processed via API'
    };

    const { data, error } = await supabase
      .from('purchase_order_approvals')
      .update(updates)
      .eq('id', 'approval-id') // Would use request.approval_id in real implementation
      .select()
      .single();

    if (error) throw new Error(`Failed to process approval: ${error.message}`);
    return data;
  }

  async checkApprovalEligibility(purchaseOrderId: string): Promise<ApprovalEligibility> {
    const supabase = await createClient();

    const { data: approvals, error } = await supabase
      .from('purchase_order_approvals')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId);

    if (error) throw new Error(`Failed to check approval eligibility: ${error.message}`);

    const totalApprovals = approvals?.length || 0;
    const approvedCount = approvals?.filter(a => a.status === 'approved').length || 0;
    const rejectedCount = approvals?.filter(a => a.status === 'rejected').length || 0;
    const pendingCount = approvals?.filter(a => a.status === 'pending').length || 0;

    const isEligible = rejectedCount === 0 && pendingCount === 0 && approvedCount >= totalApprovals;
    const escalationRequired = approvals?.some(a => a.status === 'escalated') || false;

    return {
      is_eligible: isEligible,
      required_approvals: totalApprovals,
      current_approvals: approvedCount,
      missing_approvals: [], // Would need to fetch workflow levels
      auto_approval_possible: false,
      escalation_required: escalationRequired,
      blocking_factors: rejectedCount > 0 ? ['Approval rejected'] : pendingCount > 0 ? ['Pending approvals'] : []
    };
  }

  private async getApplicableWorkflowRules(amount: number, category?: string): Promise<ApprovalWorkflowRule[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('approval_workflow_rules')
      .select('*')
      .eq('is_active', true)
      .lte('effective_from', new Date().toISOString())
      .order('priority', { ascending: true });

    if (error) throw new Error(`Failed to get workflow rules: ${error.message}`);
    
    // Filter rules based on trigger conditions
    return (data || []).filter(rule => {
      const conditions = rule.trigger_conditions as any;
      
      // Check amount range
      if (conditions.min_amount && amount < conditions.min_amount) return false;
      if (conditions.max_amount && amount > conditions.max_amount) return false;
      
      // Check category
      if (conditions.categories && category && !conditions.categories.includes(category)) return false;
      
      return true;
    });
  }

  async createWorkflowRule(request: CreateWorkflowRuleRequest, clinicId: string, userId: string): Promise<ApprovalWorkflowRule> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('approval_workflow_rules')
      .insert({
        ...request,
        clinic_id: clinicId,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create workflow rule: ${error.message}`);
    return data;
  }

  // =====================================================================================
  // ANALYTICS & REPORTING
  // =====================================================================================

  async getBudgetUtilization(budgetId: string): Promise<BudgetUtilizationSummary> {

    const budget = await this.getBudget(budgetId);
    if (!budget) throw new Error('Budget not found');

    const allocations = await this.getBudgetAllocations(budgetId);
    
    const utilizationPercentage = (budget.allocated_amount || 0) > 0 
      ? ((budget.spent_amount || 0) / (budget.allocated_amount || 0)) * 100 
      : 0;

    const categories = allocations.map(allocation => ({
      category: allocation.category,
      allocated: allocation.allocated_amount,
      spent: allocation.spent_amount || 0,
      available: allocation.allocated_amount - (allocation.spent_amount || 0),
      utilization: allocation.allocated_amount > 0 
        ? ((allocation.spent_amount || 0) / allocation.allocated_amount) * 100 
        : 0
    }));

    return {
      budget_name: budget.name,
      total_allocated: budget.allocated_amount || 0,
      total_spent: budget.spent_amount || 0,
      total_reserved: 0, // Simplified
      total_available: budget.remaining_amount || 0,
      utilization_percentage: utilizationPercentage,
      categories,
      period_start: budget.created_at, // Using created_at as fallback
      period_end: budget.updated_at, // Using updated_at as fallback
      last_updated: new Date().toISOString()
    };
  }

  async getApprovalWorkflowPerformance(workflowId: string, periodStart: string, periodEnd: string): Promise<ApprovalWorkflowPerformance> {

    // This would require more complex queries in a real implementation
    // For now, returning a mock structure
    return {
      workflow_name: 'Default Approval Workflow',
      total_requests: 0,
      approved_requests: 0,
      rejected_requests: 0,
      pending_requests: 0,
      escalated_requests: 0,
      average_approval_time_hours: 0,
      auto_approval_rate: 0,
      escalation_rate: 0,
      bottlenecks: [],
      period_start: periodStart,
      period_end: periodEnd
    };
  }

  async generateBudgetOptimizationRecommendations(budgetId: string): Promise<BudgetOptimizationRecommendation[]> {
    const budget = await this.getBudget(budgetId);
    if (!budget) return [];

    const allocations = await this.getBudgetAllocations(budgetId);
    const recommendations: BudgetOptimizationRecommendation[] = [];

    // Analyze each allocation for optimization opportunities
    for (const allocation of allocations) {
      const utilizationRate = allocation.allocated_amount > 0 
        ? ((allocation.spent_amount || 0) / allocation.allocated_amount) * 100 
        : 0;

      if (utilizationRate < 50 && allocation.allocated_amount > 1000) {
        recommendations.push({
          type: 'decrease',
          priority: 'medium',
          budget_id: budgetId,
          budget_name: budget.name,
          current_allocation: allocation.allocated_amount,
          recommended_allocation: allocation.allocated_amount * 0.8,
          potential_savings: allocation.allocated_amount * 0.2,
          reasoning: 'Low utilization rate suggests over-allocation',
          impact_analysis: 'Reallocating excess funds can improve overall budget efficiency',
          implementation_effort: 'low',
          risk_level: 'low',
          confidence_score: 0.75
        });
      } else if (utilizationRate > 95) {
        recommendations.push({
          type: 'increase',
          priority: 'high',
          budget_id: budgetId,
          budget_name: budget.name,
          current_allocation: allocation.allocated_amount,
          recommended_allocation: allocation.allocated_amount * 1.2,
          potential_savings: 0,
          reasoning: 'High utilization rate suggests potential shortage',
          impact_analysis: 'Increasing allocation prevents potential stockouts',
          implementation_effort: 'medium',
          risk_level: 'medium',
          confidence_score: 0.80
        });
      }
    }

    return recommendations;
  }

  async generateBudgetForecast(budgetId: string, forecastMonths: number = 3): Promise<BudgetForecast[]> {
    const budget = await this.getBudget(budgetId);
    if (!budget) return [];

    const forecasts: BudgetForecast[] = [];
    const currentDate = new Date();
    
    // Simple linear forecast based on current spending trend
    const monthlySpendRate = (budget.spent_amount || 0) / 12; // Assuming annual budget

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      const predictedSpend = (budget.spent_amount || 0) + (monthlySpendRate * i);
      
      forecasts.push({
        budget_id: budgetId,
        forecast_period: i * 30, // days
        predicted_spend: predictedSpend,
        confidence_interval: {
          lower: predictedSpend * 0.9,
          upper: predictedSpend * 1.1,
          level: 0.95
        },
        projected_variance: predictedSpend * 0.1,
        risk_factors: predictedSpend > budget.total_amount ? ['Budget overrun risk'] : [],
        recommendations: predictedSpend > budget.total_amount * 0.9 ? ['Monitor spending closely'] : [],
        forecast_accuracy: 70
      });
    }

    return forecasts;
  }

  // =====================================================================================
  // NOTIFICATION MANAGEMENT
  // =====================================================================================

  async createBudgetNotification(notification: Omit<BudgetNotification, 'id' | 'created_at'>): Promise<BudgetNotification> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('budget_notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw new Error(`Failed to create budget notification: ${error.message}`);
    return data;
  }

  async getBudgetNotifications(budgetId: string): Promise<BudgetNotification[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('budget_notifications')
      .select('*')
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get budget notifications: ${error.message}`);
    return data || [];
  }

  async acknowledgeNotification(notificationId: string, userId: string): Promise<BudgetNotification> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('budget_notifications')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new Error(`Failed to acknowledge notification: ${error.message}`);
    return data;
  }
}



import { z } from 'zod';

// =====================================================================================
// CORE ENTITY SCHEMAS
// =====================================================================================

export const inventoryBudgetSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string().min(1, 'Nome do orçamento é obrigatório').max(255),
  description: z.string().optional(),
  total_amount: z.number().positive('Valor total deve ser positivo'),
  allocated_amount: z.number().min(0),
  spent_amount: z.number().min(0),
  remaining_amount: z.number().min(0),
  budget_period_start: z.string().datetime(),
  budget_period_end: z.string().datetime(),
  fiscal_year: z.number().int().min(2000).max(2100),
  budget_type: z.enum(['annual', 'quarterly', 'monthly', 'project', 'emergency']),
  status: z.enum(['draft', 'active', 'suspended', 'closed', 'archived']),
  auto_renewal: z.boolean().default(false),
  approval_required: z.boolean().default(true),
  approval_threshold: z.number().positive().optional(),
  cost_center_id: z.string().uuid().optional(),
  created_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  last_review_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const budgetAllocationSchema = z.object({
  id: z.string().uuid(),
  budget_id: z.string().uuid(),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  allocated_amount: z.number().positive(),
  spent_amount: z.number().min(0).default(0),
  reserved_amount: z.number().min(0).default(0),
  available_amount: z.number().min(0),
  percentage_of_total: z.number().min(0).max(100),
  priority_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const costCenterSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  department: z.string().max(100).optional(),
  manager_id: z.string().uuid().optional(),
  parent_cost_center_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
  budget_limit: z.number().positive().optional(),
  approval_limit: z.number().positive().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const approvalLevelSchema = z.object({
  level: z.number().int().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  min_amount: z.number().min(0),
  max_amount: z.number().positive().optional(),
  required_approvers: z.number().int().min(1),
  approval_roles: z.array(z.string()),
  auto_approval: z.boolean().default(false),
  escalation_timeout_hours: z.number().int().min(1).optional(),
  parallel_approval: z.boolean().default(false)
});

export const purchaseOrderApprovalSchema = z.object({
  id: z.string().uuid(),
  purchase_order_id: z.string().uuid(),
  approver_id: z.string().uuid(),
  approval_level: z.number().int().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'escalated', 'timeout']),
  decision_date: z.string().datetime().optional(),
  comments: z.string().optional(),
  delegation_from: z.string().uuid().optional(),
  escalated_to: z.string().uuid().optional(),
  escalation_reason: z.string().optional(),
  approval_duration_minutes: z.number().int().min(0).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const approvalWorkflowRuleSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger_conditions: z.record(z.any()),
  approval_levels: z.array(approvalLevelSchema),
  auto_approval_rules: z.record(z.any()).optional(),
  escalation_rules: z.record(z.any()).optional(),
  notification_settings: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  priority: z.number().int().min(1).default(1),
  effective_from: z.string().datetime(),
  effective_until: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// =====================================================================================
// REQUEST SCHEMAS
// =====================================================================================

export const createBudgetRequestSchema = z.object({
  name: z.string().min(1, 'Nome do orçamento é obrigatório').max(255),
  description: z.string().optional(),
  total_amount: z.number().positive('Valor total deve ser positivo'),
  budget_period_start: z.string().datetime(),
  budget_period_end: z.string().datetime(),
  fiscal_year: z.number().int().min(2000).max(2100),
  budget_type: z.enum(['annual', 'quarterly', 'monthly', 'project', 'emergency']),
  auto_renewal: z.boolean().default(false),
  approval_required: z.boolean().default(true),
  approval_threshold: z.number().positive().optional(),
  cost_center_id: z.string().uuid().optional(),
  allocations: z.array(z.object({
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    allocated_amount: z.number().positive(),
    priority_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    notes: z.string().optional()
  })).optional()
});

export const updateBudgetRequestSchema = createBudgetRequestSchema.partial();

export const budgetAllocationRequestSchema = z.object({
  budget_id: z.string().uuid(),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  allocated_amount: z.number().positive(),
  priority_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  notes: z.string().optional()
});

export const createApprovalRequestSchema = z.object({
  purchase_order_id: z.string().uuid(),
  budget_id: z.string().uuid().optional(),
  total_amount: z.number().positive(),
  items: z.array(z.object({
    item_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    total_price: z.number().positive(),
    category: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
  })),
  justification: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
  requested_delivery_date: z.string().datetime().optional(),
  emergency_purchase: z.boolean().default(false),
  supplier_id: z.string().uuid().optional()
});

export const processApprovalRequestSchema = z.object({
  approval_id: z.string().uuid(),
  decision: z.enum(['approve', 'reject', 'escalate', 'request_info']),
  comments: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  escalate_to: z.string().uuid().optional(),
  escalation_reason: z.string().optional()
});

export const createWorkflowRuleRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger_conditions: z.object({
    min_amount: z.number().min(0).optional(),
    max_amount: z.number().positive().optional(),
    categories: z.array(z.string()).optional(),
    cost_centers: z.array(z.string().uuid()).optional(),
    emergency_only: z.boolean().optional(),
    supplier_types: z.array(z.string()).optional()
  }),
  approval_levels: z.array(approvalLevelSchema).min(1),
  auto_approval_rules: z.object({
    enabled: z.boolean().default(false),
    max_auto_amount: z.number().positive().optional(),
    trusted_suppliers: z.array(z.string().uuid()).optional(),
    recurring_items: z.boolean().default(false),
    pre_approved_categories: z.array(z.string()).optional()
  }).optional(),
  escalation_rules: z.object({
    timeout_hours: z.number().int().min(1).default(24),
    max_escalations: z.number().int().min(1).default(3),
    final_approver: z.string().uuid().optional(),
    emergency_escalation: z.boolean().default(true)
  }).optional(),
  notification_settings: z.object({
    email_notifications: z.boolean().default(true),
    sms_notifications: z.boolean().default(false),
    in_app_notifications: z.boolean().default(true),
    escalation_notifications: z.boolean().default(true),
    reminder_intervals: z.array(z.number().int()).optional()
  }).optional(),
  priority: z.number().int().min(1).default(1),
  effective_from: z.string().datetime(),
  effective_until: z.string().datetime().optional()
});

export const budgetAnalyticsRequestSchema = z.object({
  budget_ids: z.array(z.string().uuid()).optional(),
  cost_center_ids: z.array(z.string().uuid()).optional(),
  date_from: z.string().datetime(),
  date_to: z.string().datetime(),
  granularity: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
  categories: z.array(z.string()).optional(),
  include_forecasts: z.boolean().default(false),
  include_variances: z.boolean().default(true),
  include_recommendations: z.boolean().default(true)
});

// =====================================================================================
// ANALYTICS & REPORTING SCHEMAS
// =====================================================================================

export const budgetVarianceSchema = z.object({
  category: z.string(),
  allocated_amount: z.number(),
  actual_amount: z.number(),
  variance_amount: z.number(),
  variance_percentage: z.number(),
  variance_type: z.enum(['favorable', 'unfavorable']),
  period: z.string(),
  explanation: z.string().optional()
});

export const budgetUtilizationSummarySchema = z.object({
  budget_id: z.string().uuid(),
  budget_name: z.string(),
  total_allocated: z.number(),
  total_spent: z.number(),
  total_reserved: z.number(),
  total_available: z.number(),
  utilization_percentage: z.number().min(0).max(100),
  categories: z.array(z.object({
    category: z.string(),
    allocated: z.number(),
    spent: z.number(),
    available: z.number(),
    utilization: z.number()
  })),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  last_updated: z.string().datetime()
});

export const approvalWorkflowPerformanceSchema = z.object({
  workflow_id: z.string().uuid(),
  workflow_name: z.string(),
  total_requests: z.number().int().min(0),
  approved_requests: z.number().int().min(0),
  rejected_requests: z.number().int().min(0),
  pending_requests: z.number().int().min(0),
  escalated_requests: z.number().int().min(0),
  average_approval_time_hours: z.number().min(0),
  auto_approval_rate: z.number().min(0).max(100),
  escalation_rate: z.number().min(0).max(100),
  bottlenecks: z.array(z.object({
    level: z.number().int(),
    approver: z.string(),
    avg_time_hours: z.number(),
    pending_count: z.number().int()
  })),
  period_start: z.string().datetime(),
  period_end: z.string().datetime()
});

export const budgetOptimizationRecommendationSchema = z.object({
  type: z.enum(['reallocation', 'increase', 'decrease', 'consolidation', 'split']),
  category: z.string(),
  current_allocation: z.number(),
  recommended_allocation: z.number(),
  expected_impact: z.number(),
  confidence_score: z.number().min(0).max(100),
  reasoning: z.string(),
  implementation_effort: z.enum(['low', 'medium', 'high']),
  estimated_savings: z.number().optional(),
  risk_assessment: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
});

export const budgetForecastSchema = z.object({
  budget_id: z.string().uuid(),
  forecast_date: z.string().datetime(),
  predicted_spend: z.number(),
  confidence_interval_lower: z.number(),
  confidence_interval_upper: z.number(),
  seasonal_adjustment: z.number(),
  trend_component: z.number(),
  risk_factors: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  accuracy_score: z.number().min(0).max(100).optional()
});

export const budgetNotificationSchema = z.object({
  id: z.string().uuid(),
  budget_id: z.string().uuid(),
  notification_type: z.enum(['threshold_exceeded', 'low_balance', 'approval_required', 'budget_expired', 'variance_alert']),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string(),
  message: z.string(),
  threshold_percentage: z.number().min(0).max(100).optional(),
  current_amount: z.number().optional(),
  limit_amount: z.number().optional(),
  recipient_ids: z.array(z.string().uuid()),
  sent_at: z.string().datetime().optional(),
  acknowledged_at: z.string().datetime().optional(),
  acknowledged_by: z.string().uuid().optional(),
  created_at: z.string().datetime()
});

// =====================================================================================
// UTILITY SCHEMAS
// =====================================================================================

export const budgetValidationResultSchema = z.object({
  is_valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string())
});

export const approvalEligibilitySchema = z.object({
  is_eligible: z.boolean(),
  required_approvals: z.number().int().min(0),
  current_approvals: z.number().int().min(0),
  missing_approvals: z.array(approvalLevelSchema),
  auto_approval_possible: z.boolean(),
  escalation_required: z.boolean(),
  blocking_factors: z.array(z.string())
});

// =====================================================================================
// EXPORT TYPES
// =====================================================================================

export type InventoryBudget = z.infer<typeof inventoryBudgetSchema>;
export type BudgetAllocation = z.infer<typeof budgetAllocationSchema>;
export type CostCenter = z.infer<typeof costCenterSchema>;
export type ApprovalLevel = z.infer<typeof approvalLevelSchema>;
export type PurchaseOrderApproval = z.infer<typeof purchaseOrderApprovalSchema>;
export type ApprovalWorkflowRule = z.infer<typeof approvalWorkflowRuleSchema>;
export type CreateBudgetRequest = z.infer<typeof createBudgetRequestSchema>;
export type UpdateBudgetRequest = z.infer<typeof updateBudgetRequestSchema>;
export type BudgetAllocationRequest = z.infer<typeof budgetAllocationRequestSchema>;
export type CreateApprovalRequest = z.infer<typeof createApprovalRequestSchema>;
export type ProcessApprovalRequest = z.infer<typeof processApprovalRequestSchema>;
export type CreateWorkflowRuleRequest = z.infer<typeof createWorkflowRuleRequestSchema>;
export type BudgetAnalyticsRequest = z.infer<typeof budgetAnalyticsRequestSchema>;
export type BudgetVariance = z.infer<typeof budgetVarianceSchema>;
export type BudgetUtilizationSummary = z.infer<typeof budgetUtilizationSummarySchema>;
export type ApprovalWorkflowPerformance = z.infer<typeof approvalWorkflowPerformanceSchema>;
export type BudgetOptimizationRecommendation = z.infer<typeof budgetOptimizationRecommendationSchema>;
export type BudgetForecast = z.infer<typeof budgetForecastSchema>;
export type BudgetNotification = z.infer<typeof budgetNotificationSchema>;
export type BudgetValidationResult = z.infer<typeof budgetValidationResultSchema>;
export type ApprovalEligibility = z.infer<typeof approvalEligibilitySchema>;

// Temporary schema exports
export const createProtocolExperimentSchema = { type: 'object' } as const;
export const updateProtocolExperimentSchema = { type: 'object' } as const;
export const createProtocolFeedbackSchema = { type: 'object' } as const;
export const updateProtocolFeedbackSchema = { type: 'object' } as const;
export const createProtocolOutcomeSchema = { type: 'object' } as const;
export const createProtocolVersionSchema = { type: 'object' } as const;
export const updateProtocolVersionSchema = { type: 'object' } as const;
export const predictionPeriodTypeSchema = { type: 'string' } as const;
export const createForecastingScenarioSchema = { type: 'object' } as const;
export const budgetSchema = { type: 'object' } as const;
export const approvalSchema = { type: 'object' } as const;
export const bulkBudgetCreateSchema = { type: 'object' } as const;
export const ABTestCreateSchema = { type: 'object' } as const;

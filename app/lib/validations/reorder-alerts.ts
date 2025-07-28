// Zod validation schemas for Automated Reorder Alerts
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { z } from 'zod';

// Base schemas
export const reorderThresholdSchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Threshold levels
  reorder_point: z.number().int().min(0),
  safety_stock: z.number().int().min(0),
  maximum_stock: z.number().int().min(1).optional(),
  minimum_order_quantity: z.number().int().min(1).optional(),
  
  // Intelligent calculations
  calculated_reorder_point: z.number().int().min(0).optional(),
  calculated_safety_stock: z.number().int().min(0).optional(),
  demand_forecast_weekly: z.number().min(0).optional(),
  seasonal_adjustment_factor: z.number().min(0.1).max(10).optional(),
  lead_time_days: z.number().int().min(1).max(365).optional(),
  
  // Alert levels
  warning_threshold_percentage: z.number().int().min(101).max(500).optional(),
  critical_threshold_percentage: z.number().int().min(101).max(500).optional(),
  emergency_threshold_percentage: z.number().int().min(101).max(1000).optional(),
  
  // Automation settings
  auto_reorder_enabled: z.boolean().optional(),
  preferred_supplier_id: z.string().uuid().optional(),
  budget_approval_required: z.boolean().optional(),
  budget_threshold_amount: z.number().min(0).optional(),
  
  // Metadata
  is_active: z.boolean().optional(),
  last_calculation_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine((data) => {
  // Ensure reorder_point >= safety_stock
  return data.reorder_point >= data.safety_stock;
}, {
  message: "Reorder point must be greater than or equal to safety stock",
  path: ["reorder_point"]
}).refine((data) => {
  // Ensure maximum_stock > reorder_point
  if (data.maximum_stock) {
    return data.maximum_stock > data.reorder_point;
  }
  return true;
}, {
  message: "Maximum stock must be greater than reorder point",
  path: ["maximum_stock"]
}).refine((data) => {
  // Ensure threshold percentages are in correct order
  const warning = data.warning_threshold_percentage || 120;
  const critical = data.critical_threshold_percentage || 150;
  const emergency = data.emergency_threshold_percentage || 200;
  
  return warning < critical && critical < emergency;
}, {
  message: "Alert thresholds must be in ascending order (warning < critical < emergency)",
  path: ["critical_threshold_percentage"]
});

export const reorderAlertSchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid(),
  threshold_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Alert details
  alert_type: z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock']),
  alert_level: z.number().int().min(1).max(5),
  current_stock: z.number().int().min(0),
  recommended_order_quantity: z.number().int().min(0).optional(),
  estimated_stockout_date: z.string().datetime().optional(),
  
  // Message and context
  alert_title: z.string().min(1).max(200),
  alert_message: z.string().min(1).max(1000),
  context_data: z.record(z.any()).optional(),
  
  // Status and tracking
  status: z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed']),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  
  // Escalation
  escalation_level: z.number().int().min(0).max(10).optional(),
  escalated_to: z.string().uuid().optional(),
  escalated_at: z.string().datetime().optional(),
  
  // Resolution
  acknowledged_by: z.string().uuid().optional(),
  acknowledged_at: z.string().datetime().optional(),
  resolved_by: z.string().uuid().optional(),
  resolved_at: z.string().datetime().optional(),
  resolution_notes: z.string().max(1000).optional(),
  
  // Purchase order integration
  purchase_order_id: z.string().uuid().optional(),
  auto_generated: z.boolean().optional(),
  
  // Delivery tracking
  notification_sent: z.boolean().optional(),
  notification_channels: z.array(z.string()).optional(),
  delivery_time_ms: z.number().int().min(0).optional(),
  
  // Metadata
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const demandForecastSchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Forecast period
  forecast_date: z.string().date(),
  forecast_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  
  // Forecast data
  predicted_demand: z.number().min(0),
  confidence_interval: z.number().min(0).max(1).optional(),
  seasonal_factor: z.number().min(0.1).max(10).optional(),
  trend_factor: z.number().min(0.1).max(10).optional(),
  
  // Historical analysis
  historical_average: z.number().min(0).optional(),
  variance: z.number().min(0).optional(),
  standard_deviation: z.number().min(0).optional(),
  
  // Context
  special_events: z.array(z.any()).optional(),
  promotion_impact: z.number().min(0.1).max(10).optional(),
  appointment_based_demand: z.number().min(0).optional(),
  
  // Accuracy tracking
  actual_demand: z.number().min(0).optional(),
  forecast_accuracy: z.number().min(0).max(1).optional(),
  model_version: z.string().optional(),
  
  // Metadata
  calculated_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export const purchaseOrderSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Order details
  order_number: z.string().min(1).max(50),
  order_type: z.enum(['reorder', 'emergency', 'bulk', 'special']),
  
  // Financial
  subtotal: z.number().min(0),
  tax_amount: z.number().min(0).optional(),
  shipping_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  total_amount: z.number().min(0),
  currency: z.string().length(3).optional(),
  
  // Status tracking
  status: z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  // Dates
  order_date: z.string().date(),
  requested_delivery_date: z.string().date().optional(),
  confirmed_delivery_date: z.string().date().optional(),
  actual_delivery_date: z.string().date().optional(),
  
  // Automation
  auto_generated: z.boolean().optional(),
  generated_from_alert_id: z.string().uuid().optional(),
  
  // Approval workflow
  requires_approval: z.boolean().optional(),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  approval_notes: z.string().max(1000).optional(),
  
  // Supplier communication
  sent_to_supplier: z.boolean().optional(),
  sent_at: z.string().datetime().optional(),
  supplier_confirmation: z.string().max(500).optional(),
  supplier_order_number: z.string().max(100).optional(),
  
  // Notes and context
  notes: z.string().max(2000).optional(),
  internal_notes: z.string().max(2000).optional(),
  context_data: z.record(z.any()).optional(),
  
  // Metadata
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine((data) => {
  // Ensure total_amount is correctly calculated
  const calculatedTotal = (data.subtotal || 0) + 
                         (data.tax_amount || 0) + 
                         (data.shipping_amount || 0) - 
                         (data.discount_amount || 0);
  return Math.abs(data.total_amount - calculatedTotal) < 0.01;
}, {
  message: "Total amount must equal subtotal + tax + shipping - discount",
  path: ["total_amount"]
}).refine((data) => {
  // Ensure date logic is correct
  if (data.requested_delivery_date && data.order_date) {
    return new Date(data.requested_delivery_date) >= new Date(data.order_date);
  }
  return true;
}, {
  message: "Requested delivery date must be after order date",
  path: ["requested_delivery_date"]
});

export const purchaseOrderItemSchema = z.object({
  id: z.string().uuid(),
  purchase_order_id: z.string().uuid(),
  item_id: z.string().uuid(),
  
  // Order details
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
  
  // Received tracking
  quantity_received: z.number().int().min(0).optional(),
  quantity_remaining: z.number().int().min(0).optional(),
  
  // Item details at time of order
  item_name: z.string().min(1).max(200),
  item_sku: z.string().max(100).optional(),
  item_description: z.string().max(1000).optional(),
  supplier_item_code: z.string().max(100).optional(),
  
  // Quality control
  quality_check_required: z.boolean().optional(),
  quality_check_passed: z.boolean().optional(),
  quality_notes: z.string().max(1000).optional(),
  
  // Metadata
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine((data) => {
  // Ensure total_price = quantity * unit_price
  return Math.abs(data.total_price - (data.quantity * data.unit_price)) < 0.01;
}, {
  message: "Total price must equal quantity × unit price",
  path: ["total_price"]
}).refine((data) => {
  // Ensure quantity_received <= quantity
  if (data.quantity_received !== undefined) {
    return data.quantity_received <= data.quantity;
  }
  return true;
}, {
  message: "Quantity received cannot exceed ordered quantity",
  path: ["quantity_received"]
});

export const approvalWorkflowSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Workflow details
  workflow_name: z.string().min(1).max(100),
  workflow_type: z.enum(['purchase_order', 'budget_approval', 'emergency_order']),
  
  // Trigger conditions
  trigger_amount_threshold: z.number().min(0).optional(),
  trigger_item_categories: z.array(z.string()).optional(),
  trigger_suppliers: z.array(z.string().uuid()).optional(),
  
  // Approval chain
  approval_chain: z.array(z.string().uuid()).min(1),
  current_step: z.number().int().min(0).optional(),
  
  // Settings
  parallel_approval: z.boolean().optional(),
  auto_approve_conditions: z.record(z.any()).optional(),
  escalation_timeout_hours: z.number().int().min(1).max(168).optional(),
  
  // Status
  is_active: z.boolean().optional(),
  
  // Metadata
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const supplierLeadTimeSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  item_id: z.string().uuid(),
  average_lead_time_days: z.number().int().min(1).max(365),
  minimum_lead_time_days: z.number().int().min(1).max(365),
  maximum_lead_time_days: z.number().int().min(1).max(365),
  reliability_score: z.number().min(0).max(1).optional(),
  last_updated: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine((data) => {
  // Ensure lead time logic is correct
  return data.minimum_lead_time_days <= data.average_lead_time_days && 
         data.average_lead_time_days <= data.maximum_lead_time_days;
}, {
  message: "Lead times must be in logical order: minimum ≤ average ≤ maximum",
  path: ["average_lead_time_days"]
});

// Request schemas for API endpoints
export const createReorderThresholdSchema = z.object({
  item_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  reorder_point: z.number().int().min(0),
  safety_stock: z.number().int().min(0),
  maximum_stock: z.number().int().min(1).optional(),
  minimum_order_quantity: z.number().int().min(1).optional(),
  auto_reorder_enabled: z.boolean().optional(),
  preferred_supplier_id: z.string().uuid().optional(),
  budget_approval_required: z.boolean().optional(),
  budget_threshold_amount: z.number().min(0).optional(),
}).refine((data) => {
  return data.reorder_point >= data.safety_stock;
}, {
  message: "Reorder point must be greater than or equal to safety stock",
  path: ["reorder_point"]
});

export const updateReorderThresholdSchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  reorder_point: z.number().int().min(0).optional(),
  safety_stock: z.number().int().min(0).optional(),
  maximum_stock: z.number().int().min(1).optional(),
  minimum_order_quantity: z.number().int().min(1).optional(),
  auto_reorder_enabled: z.boolean().optional(),
  preferred_supplier_id: z.string().uuid().optional(),
  budget_approval_required: z.boolean().optional(),
  budget_threshold_amount: z.number().min(0).optional(),
});

export const createReorderAlertSchema = z.object({
  item_id: z.string().uuid(),
  threshold_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  alert_type: z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock']),
  alert_level: z.number().int().min(1).max(5),
  current_stock: z.number().int().min(0),
  alert_title: z.string().min(1).max(200),
  alert_message: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  recommended_order_quantity: z.number().int().min(0).optional(),
  estimated_stockout_date: z.string().datetime().optional(),
  context_data: z.record(z.any()).optional(),
});

export const updateReorderAlertSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed']).optional(),
  resolution_notes: z.string().max(1000).optional(),
  acknowledged_by: z.string().uuid().optional(),
  resolved_by: z.string().uuid().optional(),
  escalated_to: z.string().uuid().optional(),
});

export const createPurchaseOrderSchema = z.object({
  clinic_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  order_type: z.enum(['reorder', 'emergency', 'bulk', 'special']),
  items: z.array(z.object({
    item_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0),
  })).min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  requested_delivery_date: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
  auto_generated: z.boolean().optional(),
  generated_from_alert_id: z.string().uuid().optional(),
});

export const updatePurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']).optional(),
  supplier_confirmation: z.string().max(500).optional(),
  supplier_order_number: z.string().max(100).optional(),
  confirmed_delivery_date: z.string().date().optional(),
  actual_delivery_date: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
});

// Filter schemas
export const alertFilterSchema = z.object({
  status: z.array(z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'critical', 'emergency'])).optional(),
  alert_type: z.array(z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock'])).optional(),
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }).optional(),
  item_category: z.array(z.string()).optional(),
  clinic_id: z.string().uuid().optional(),
});

export const thresholdFilterSchema = z.object({
  item_category: z.array(z.string()).optional(),
  auto_reorder_enabled: z.boolean().optional(),
  needs_optimization: z.boolean().optional(),
  clinic_id: z.string().uuid().optional(),
});

export const purchaseOrderFilterSchema = z.object({
  status: z.array(z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  order_type: z.array(z.enum(['reorder', 'emergency', 'bulk', 'special'])).optional(),
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }).optional(),
  supplier_id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
});

// Bulk operation schemas
export const bulkAlertActionSchema = z.object({
  alert_ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['acknowledge', 'resolve', 'dismiss', 'escalate']),
  notes: z.string().max(1000).optional(),
  escalate_to: z.string().uuid().optional(),
});

export const bulkThresholdUpdateSchema = z.object({
  threshold_ids: z.array(z.string().uuid()).min(1),
  updates: z.object({
    reorder_point: z.number().int().min(0).optional(),
    safety_stock: z.number().int().min(0).optional(),
    auto_reorder_enabled: z.boolean().optional(),
    budget_approval_required: z.boolean().optional(),
  }),
});

// Analytics schemas
export const alertAnalyticsSchema = z.object({
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }),
  group_by: z.enum(['day', 'week', 'month']).optional(),
  filter: alertFilterSchema.optional(),
});

export const demandAnalyticsSchema = z.object({
  item_ids: z.array(z.string().uuid()).optional(),
  forecast_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }),
});

export const optimizationAnalysisSchema = z.object({
  clinic_id: z.string().uuid(),
  item_categories: z.array(z.string()).optional(),
  analysis_type: z.enum(['cost_reduction', 'service_level', 'storage_optimization', 'comprehensive']).optional(),
  confidence_threshold: z.number().min(0).max(1).optional(),
});

// Notification schemas
export const notificationSettingsSchema = z.object({
  clinic_id: z.string().uuid(),
  user_id: z.string().uuid(),
  channels: z.array(z.enum(['dashboard', 'email', 'sms', 'push', 'webhook'])),
  alert_types: z.array(z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock'])),
  priority_threshold: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  quiet_hours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),   // HH:mm format
  }).optional(),
  frequency_limit: z.object({
    max_per_hour: z.number().int().min(1).max(100),
    max_per_day: z.number().int().min(1).max(1000),
  }).optional(),
});

// Export type inference helpers
export type ReorderThreshold = z.infer<typeof reorderThresholdSchema>;
export type ReorderAlert = z.infer<typeof reorderAlertSchema>;
export type DemandForecast = z.infer<typeof demandForecastSchema>;
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
export type ApprovalWorkflow = z.infer<typeof approvalWorkflowSchema>;
export type SupplierLeadTime = z.infer<typeof supplierLeadTimeSchema>;

export type CreateReorderThresholdRequest = z.infer<typeof createReorderThresholdSchema>;
export type UpdateReorderThresholdRequest = z.infer<typeof updateReorderThresholdSchema>;
export type CreateReorderAlertRequest = z.infer<typeof createReorderAlertSchema>;
export type UpdateReorderAlertRequest = z.infer<typeof updateReorderAlertSchema>;
export type CreatePurchaseOrderRequest = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderRequest = z.infer<typeof updatePurchaseOrderSchema>;

export type AlertFilter = z.infer<typeof alertFilterSchema>;
export type ThresholdFilter = z.infer<typeof thresholdFilterSchema>;
export type PurchaseOrderFilter = z.infer<typeof purchaseOrderFilterSchema>;

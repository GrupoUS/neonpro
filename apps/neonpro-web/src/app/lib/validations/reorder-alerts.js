"use strict";
// Zod validation schemas for Automated Reorder Alerts
// Story 6.2: Automated Reorder Alerts + Threshold Management
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSettingsSchema = exports.optimizationAnalysisSchema = exports.demandAnalyticsSchema = exports.alertAnalyticsSchema = exports.bulkThresholdUpdateSchema = exports.bulkAlertActionSchema = exports.purchaseOrderFilterSchema = exports.thresholdFilterSchema = exports.alertFilterSchema = exports.updatePurchaseOrderSchema = exports.createPurchaseOrderSchema = exports.updateReorderAlertSchema = exports.createReorderAlertSchema = exports.updateReorderThresholdSchema = exports.createReorderThresholdSchema = exports.supplierLeadTimeSchema = exports.approvalWorkflowSchema = exports.purchaseOrderItemSchema = exports.purchaseOrderSchema = exports.demandForecastSchema = exports.reorderAlertSchema = exports.reorderThresholdSchema = void 0;
var zod_1 = require("zod");
// Base schemas
exports.reorderThresholdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Threshold levels
    reorder_point: zod_1.z.number().int().min(0),
    safety_stock: zod_1.z.number().int().min(0),
    maximum_stock: zod_1.z.number().int().min(1).optional(),
    minimum_order_quantity: zod_1.z.number().int().min(1).optional(),
    // Intelligent calculations
    calculated_reorder_point: zod_1.z.number().int().min(0).optional(),
    calculated_safety_stock: zod_1.z.number().int().min(0).optional(),
    demand_forecast_weekly: zod_1.z.number().min(0).optional(),
    seasonal_adjustment_factor: zod_1.z.number().min(0.1).max(10).optional(),
    lead_time_days: zod_1.z.number().int().min(1).max(365).optional(),
    // Alert levels
    warning_threshold_percentage: zod_1.z.number().int().min(101).max(500).optional(),
    critical_threshold_percentage: zod_1.z.number().int().min(101).max(500).optional(),
    emergency_threshold_percentage: zod_1.z.number().int().min(101).max(1000).optional(),
    // Automation settings
    auto_reorder_enabled: zod_1.z.boolean().optional(),
    preferred_supplier_id: zod_1.z.string().uuid().optional(),
    budget_approval_required: zod_1.z.boolean().optional(),
    budget_threshold_amount: zod_1.z.number().min(0).optional(),
    // Metadata
    is_active: zod_1.z.boolean().optional(),
    last_calculation_date: zod_1.z.string().datetime().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
}).refine(function (data) {
    // Ensure reorder_point >= safety_stock
    return data.reorder_point >= data.safety_stock;
}, {
    message: "Reorder point must be greater than or equal to safety stock",
    path: ["reorder_point"]
}).refine(function (data) {
    // Ensure maximum_stock > reorder_point
    if (data.maximum_stock) {
        return data.maximum_stock > data.reorder_point;
    }
    return true;
}, {
    message: "Maximum stock must be greater than reorder point",
    path: ["maximum_stock"]
}).refine(function (data) {
    // Ensure threshold percentages are in correct order
    var warning = data.warning_threshold_percentage || 120;
    var critical = data.critical_threshold_percentage || 150;
    var emergency = data.emergency_threshold_percentage || 200;
    return warning < critical && critical < emergency;
}, {
    message: "Alert thresholds must be in ascending order (warning < critical < emergency)",
    path: ["critical_threshold_percentage"]
});
exports.reorderAlertSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid(),
    threshold_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Alert details
    alert_type: zod_1.z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock']),
    alert_level: zod_1.z.number().int().min(1).max(5),
    current_stock: zod_1.z.number().int().min(0),
    recommended_order_quantity: zod_1.z.number().int().min(0).optional(),
    estimated_stockout_date: zod_1.z.string().datetime().optional(),
    // Message and context
    alert_title: zod_1.z.string().min(1).max(200),
    alert_message: zod_1.z.string().min(1).max(1000),
    context_data: zod_1.z.record(zod_1.z.any()).optional(),
    // Status and tracking
    status: zod_1.z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
    // Escalation
    escalation_level: zod_1.z.number().int().min(0).max(10).optional(),
    escalated_to: zod_1.z.string().uuid().optional(),
    escalated_at: zod_1.z.string().datetime().optional(),
    // Resolution
    acknowledged_by: zod_1.z.string().uuid().optional(),
    acknowledged_at: zod_1.z.string().datetime().optional(),
    resolved_by: zod_1.z.string().uuid().optional(),
    resolved_at: zod_1.z.string().datetime().optional(),
    resolution_notes: zod_1.z.string().max(1000).optional(),
    // Purchase order integration
    purchase_order_id: zod_1.z.string().uuid().optional(),
    auto_generated: zod_1.z.boolean().optional(),
    // Delivery tracking
    notification_sent: zod_1.z.boolean().optional(),
    notification_channels: zod_1.z.array(zod_1.z.string()).optional(),
    delivery_time_ms: zod_1.z.number().int().min(0).optional(),
    // Metadata
    expires_at: zod_1.z.string().datetime().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.demandForecastSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Forecast period
    forecast_date: zod_1.z.string().date(),
    forecast_period: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    // Forecast data
    predicted_demand: zod_1.z.number().min(0),
    confidence_interval: zod_1.z.number().min(0).max(1).optional(),
    seasonal_factor: zod_1.z.number().min(0.1).max(10).optional(),
    trend_factor: zod_1.z.number().min(0.1).max(10).optional(),
    // Historical analysis
    historical_average: zod_1.z.number().min(0).optional(),
    variance: zod_1.z.number().min(0).optional(),
    standard_deviation: zod_1.z.number().min(0).optional(),
    // Context
    special_events: zod_1.z.array(zod_1.z.any()).optional(),
    promotion_impact: zod_1.z.number().min(0.1).max(10).optional(),
    appointment_based_demand: zod_1.z.number().min(0).optional(),
    // Accuracy tracking
    actual_demand: zod_1.z.number().min(0).optional(),
    forecast_accuracy: zod_1.z.number().min(0).max(1).optional(),
    model_version: zod_1.z.string().optional(),
    // Metadata
    calculated_at: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
});
exports.purchaseOrderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    // Order details
    order_number: zod_1.z.string().min(1).max(50),
    order_type: zod_1.z.enum(['reorder', 'emergency', 'bulk', 'special']),
    // Financial
    subtotal: zod_1.z.number().min(0),
    tax_amount: zod_1.z.number().min(0).optional(),
    shipping_amount: zod_1.z.number().min(0).optional(),
    discount_amount: zod_1.z.number().min(0).optional(),
    total_amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3).optional(),
    // Status tracking
    status: zod_1.z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    // Dates
    order_date: zod_1.z.string().date(),
    requested_delivery_date: zod_1.z.string().date().optional(),
    confirmed_delivery_date: zod_1.z.string().date().optional(),
    actual_delivery_date: zod_1.z.string().date().optional(),
    // Automation
    auto_generated: zod_1.z.boolean().optional(),
    generated_from_alert_id: zod_1.z.string().uuid().optional(),
    // Approval workflow
    requires_approval: zod_1.z.boolean().optional(),
    approved_by: zod_1.z.string().uuid().optional(),
    approved_at: zod_1.z.string().datetime().optional(),
    approval_notes: zod_1.z.string().max(1000).optional(),
    // Supplier communication
    sent_to_supplier: zod_1.z.boolean().optional(),
    sent_at: zod_1.z.string().datetime().optional(),
    supplier_confirmation: zod_1.z.string().max(500).optional(),
    supplier_order_number: zod_1.z.string().max(100).optional(),
    // Notes and context
    notes: zod_1.z.string().max(2000).optional(),
    internal_notes: zod_1.z.string().max(2000).optional(),
    context_data: zod_1.z.record(zod_1.z.any()).optional(),
    // Metadata
    created_by: zod_1.z.string().uuid().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
}).refine(function (data) {
    // Ensure total_amount is correctly calculated
    var calculatedTotal = (data.subtotal || 0) +
        (data.tax_amount || 0) +
        (data.shipping_amount || 0) -
        (data.discount_amount || 0);
    return Math.abs(data.total_amount - calculatedTotal) < 0.01;
}, {
    message: "Total amount must equal subtotal + tax + shipping - discount",
    path: ["total_amount"]
}).refine(function (data) {
    // Ensure date logic is correct
    if (data.requested_delivery_date && data.order_date) {
        return new Date(data.requested_delivery_date) >= new Date(data.order_date);
    }
    return true;
}, {
    message: "Requested delivery date must be after order date",
    path: ["requested_delivery_date"]
});
exports.purchaseOrderItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    purchase_order_id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid(),
    // Order details
    quantity: zod_1.z.number().int().min(1),
    unit_price: zod_1.z.number().min(0),
    total_price: zod_1.z.number().min(0),
    // Received tracking
    quantity_received: zod_1.z.number().int().min(0).optional(),
    quantity_remaining: zod_1.z.number().int().min(0).optional(),
    // Item details at time of order
    item_name: zod_1.z.string().min(1).max(200),
    item_sku: zod_1.z.string().max(100).optional(),
    item_description: zod_1.z.string().max(1000).optional(),
    supplier_item_code: zod_1.z.string().max(100).optional(),
    // Quality control
    quality_check_required: zod_1.z.boolean().optional(),
    quality_check_passed: zod_1.z.boolean().optional(),
    quality_notes: zod_1.z.string().max(1000).optional(),
    // Metadata
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
}).refine(function (data) {
    // Ensure total_price = quantity * unit_price
    return Math.abs(data.total_price - (data.quantity * data.unit_price)) < 0.01;
}, {
    message: "Total price must equal quantity × unit price",
    path: ["total_price"]
}).refine(function (data) {
    // Ensure quantity_received <= quantity
    if (data.quantity_received !== undefined) {
        return data.quantity_received <= data.quantity;
    }
    return true;
}, {
    message: "Quantity received cannot exceed ordered quantity",
    path: ["quantity_received"]
});
exports.approvalWorkflowSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Workflow details
    workflow_name: zod_1.z.string().min(1).max(100),
    workflow_type: zod_1.z.enum(['purchase_order', 'budget_approval', 'emergency_order']),
    // Trigger conditions
    trigger_amount_threshold: zod_1.z.number().min(0).optional(),
    trigger_item_categories: zod_1.z.array(zod_1.z.string()).optional(),
    trigger_suppliers: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    // Approval chain
    approval_chain: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    current_step: zod_1.z.number().int().min(0).optional(),
    // Settings
    parallel_approval: zod_1.z.boolean().optional(),
    auto_approve_conditions: zod_1.z.record(zod_1.z.any()).optional(),
    escalation_timeout_hours: zod_1.z.number().int().min(1).max(168).optional(),
    // Status
    is_active: zod_1.z.boolean().optional(),
    // Metadata
    created_by: zod_1.z.string().uuid().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.supplierLeadTimeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid(),
    average_lead_time_days: zod_1.z.number().int().min(1).max(365),
    minimum_lead_time_days: zod_1.z.number().int().min(1).max(365),
    maximum_lead_time_days: zod_1.z.number().int().min(1).max(365),
    reliability_score: zod_1.z.number().min(0).max(1).optional(),
    last_updated: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
}).refine(function (data) {
    // Ensure lead time logic is correct
    return data.minimum_lead_time_days <= data.average_lead_time_days &&
        data.average_lead_time_days <= data.maximum_lead_time_days;
}, {
    message: "Lead times must be in logical order: minimum ≤ average ≤ maximum",
    path: ["average_lead_time_days"]
});
// Request schemas for API endpoints
exports.createReorderThresholdSchema = zod_1.z.object({
    item_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    reorder_point: zod_1.z.number().int().min(0),
    safety_stock: zod_1.z.number().int().min(0),
    maximum_stock: zod_1.z.number().int().min(1).optional(),
    minimum_order_quantity: zod_1.z.number().int().min(1).optional(),
    auto_reorder_enabled: zod_1.z.boolean().optional(),
    preferred_supplier_id: zod_1.z.string().uuid().optional(),
    budget_approval_required: zod_1.z.boolean().optional(),
    budget_threshold_amount: zod_1.z.number().min(0).optional(),
}).refine(function (data) {
    return data.reorder_point >= data.safety_stock;
}, {
    message: "Reorder point must be greater than or equal to safety stock",
    path: ["reorder_point"]
});
exports.updateReorderThresholdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    item_id: zod_1.z.string().uuid().optional(),
    clinic_id: zod_1.z.string().uuid().optional(),
    reorder_point: zod_1.z.number().int().min(0).optional(),
    safety_stock: zod_1.z.number().int().min(0).optional(),
    maximum_stock: zod_1.z.number().int().min(1).optional(),
    minimum_order_quantity: zod_1.z.number().int().min(1).optional(),
    auto_reorder_enabled: zod_1.z.boolean().optional(),
    preferred_supplier_id: zod_1.z.string().uuid().optional(),
    budget_approval_required: zod_1.z.boolean().optional(),
    budget_threshold_amount: zod_1.z.number().min(0).optional(),
});
exports.createReorderAlertSchema = zod_1.z.object({
    item_id: zod_1.z.string().uuid(),
    threshold_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    alert_type: zod_1.z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock']),
    alert_level: zod_1.z.number().int().min(1).max(5),
    current_stock: zod_1.z.number().int().min(0),
    alert_title: zod_1.z.string().min(1).max(200),
    alert_message: zod_1.z.string().min(1).max(1000),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
    recommended_order_quantity: zod_1.z.number().int().min(0).optional(),
    estimated_stockout_date: zod_1.z.string().datetime().optional(),
    context_data: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateReorderAlertSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed']).optional(),
    resolution_notes: zod_1.z.string().max(1000).optional(),
    acknowledged_by: zod_1.z.string().uuid().optional(),
    resolved_by: zod_1.z.string().uuid().optional(),
    escalated_to: zod_1.z.string().uuid().optional(),
});
exports.createPurchaseOrderSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    order_type: zod_1.z.enum(['reorder', 'emergency', 'bulk', 'special']),
    items: zod_1.z.array(zod_1.z.object({
        item_id: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().min(1),
        unit_price: zod_1.z.number().min(0),
    })).min(1),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    requested_delivery_date: zod_1.z.string().date().optional(),
    notes: zod_1.z.string().max(2000).optional(),
    auto_generated: zod_1.z.boolean().optional(),
    generated_from_alert_id: zod_1.z.string().uuid().optional(),
});
exports.updatePurchaseOrderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']).optional(),
    supplier_confirmation: zod_1.z.string().max(500).optional(),
    supplier_order_number: zod_1.z.string().max(100).optional(),
    confirmed_delivery_date: zod_1.z.string().date().optional(),
    actual_delivery_date: zod_1.z.string().date().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
// Filter schemas
exports.alertFilterSchema = zod_1.z.object({
    status: zod_1.z.array(zod_1.z.enum(['pending', 'acknowledged', 'resolved', 'escalated', 'dismissed'])).optional(),
    priority: zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'critical', 'emergency'])).optional(),
    alert_type: zod_1.z.array(zod_1.z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock'])).optional(),
    date_range: zod_1.z.object({
        start: zod_1.z.string().date(),
        end: zod_1.z.string().date(),
    }).optional(),
    item_category: zod_1.z.array(zod_1.z.string()).optional(),
    clinic_id: zod_1.z.string().uuid().optional(),
});
exports.thresholdFilterSchema = zod_1.z.object({
    item_category: zod_1.z.array(zod_1.z.string()).optional(),
    auto_reorder_enabled: zod_1.z.boolean().optional(),
    needs_optimization: zod_1.z.boolean().optional(),
    clinic_id: zod_1.z.string().uuid().optional(),
});
exports.purchaseOrderFilterSchema = zod_1.z.object({
    status: zod_1.z.array(zod_1.z.enum(['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled'])).optional(),
    priority: zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
    order_type: zod_1.z.array(zod_1.z.enum(['reorder', 'emergency', 'bulk', 'special'])).optional(),
    date_range: zod_1.z.object({
        start: zod_1.z.string().date(),
        end: zod_1.z.string().date(),
    }).optional(),
    supplier_id: zod_1.z.string().uuid().optional(),
    clinic_id: zod_1.z.string().uuid().optional(),
});
// Bulk operation schemas
exports.bulkAlertActionSchema = zod_1.z.object({
    alert_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    action: zod_1.z.enum(['acknowledge', 'resolve', 'dismiss', 'escalate']),
    notes: zod_1.z.string().max(1000).optional(),
    escalate_to: zod_1.z.string().uuid().optional(),
});
exports.bulkThresholdUpdateSchema = zod_1.z.object({
    threshold_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    updates: zod_1.z.object({
        reorder_point: zod_1.z.number().int().min(0).optional(),
        safety_stock: zod_1.z.number().int().min(0).optional(),
        auto_reorder_enabled: zod_1.z.boolean().optional(),
        budget_approval_required: zod_1.z.boolean().optional(),
    }),
});
// Analytics schemas
exports.alertAnalyticsSchema = zod_1.z.object({
    date_range: zod_1.z.object({
        start: zod_1.z.string().date(),
        end: zod_1.z.string().date(),
    }),
    group_by: zod_1.z.enum(['day', 'week', 'month']).optional(),
    filter: exports.alertFilterSchema.optional(),
});
exports.demandAnalyticsSchema = zod_1.z.object({
    item_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    forecast_period: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
    date_range: zod_1.z.object({
        start: zod_1.z.string().date(),
        end: zod_1.z.string().date(),
    }),
});
exports.optimizationAnalysisSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    item_categories: zod_1.z.array(zod_1.z.string()).optional(),
    analysis_type: zod_1.z.enum(['cost_reduction', 'service_level', 'storage_optimization', 'comprehensive']).optional(),
    confidence_threshold: zod_1.z.number().min(0).max(1).optional(),
});
// Notification schemas
exports.notificationSettingsSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    channels: zod_1.z.array(zod_1.z.enum(['dashboard', 'email', 'sms', 'push', 'webhook'])),
    alert_types: zod_1.z.array(zod_1.z.enum(['warning', 'critical', 'emergency', 'reorder', 'overstock'])),
    priority_threshold: zod_1.z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
    quiet_hours: zod_1.z.object({
        start: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
        end: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
    }).optional(),
    frequency_limit: zod_1.z.object({
        max_per_hour: zod_1.z.number().int().min(1).max(100),
        max_per_day: zod_1.z.number().int().min(1).max(1000),
    }).optional(),
});

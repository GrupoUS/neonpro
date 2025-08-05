"use strict";
// =====================================================================================
// NeonPro Inventory Management System - Zod Validation Schemas
// Epic 6: Real-time Stock Tracking with Barcode/QR Integration
// Generated: 2025-01-26
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchParams = exports.validateCreateItemForm = exports.validateBarcodeScan = exports.validateStockUpdate = exports.validateInventoryItem = exports.InventoryReportParamsSchema = exports.ExportInventorySchema = exports.ImportInventorySchema = exports.BulkUpdateStockSchema = exports.BulkCreateItemsSchema = exports.TransferStockFormSchema = exports.StockAdjustmentFormSchema = exports.CreateLocationFormSchema = exports.CreateInventoryItemFormSchema = exports.InventorySearchParamsSchema = exports.BatchTransactionRequestSchema = exports.BarcodeScanRequestSchema = exports.StockUpdateRequestSchema = exports.MobileSyncQueueSchema = exports.BarcodeScanSchema = exports.StockAlertSchema = exports.InventoryTransactionSchema = exports.StockLevelSchema = exports.InventoryLocationSchema = exports.InventoryItemSchema = exports.LocationCodeSchema = exports.CostSchema = exports.QuantitySchema = exports.BarcodeSchema = exports.SkuSchema = exports.UuidSchema = exports.ConflictResolutionSchema = exports.SyncOperationSchema = exports.SyncStatusSchema = exports.DeviceTypeSchema = exports.ScanStatusSchema = exports.ScanPurposeSchema = exports.ScanFormatSchema = exports.ScanTypeSchema = exports.VerificationStatusSchema = exports.StockStatusSchema = exports.AlertStatusSchema = exports.AlertLevelSchema = exports.AlertTypeSchema = exports.ReferenceTypeSchema = exports.TransactionTypeSchema = exports.StorageTypeSchema = exports.ItemTypeSchema = void 0;
var zod_1 = require("zod");
// =====================================================================================
// BASE VALIDATION SCHEMAS
// =====================================================================================
// Enum Schemas
exports.ItemTypeSchema = zod_1.z.enum(['supply', 'medication', 'equipment', 'consumable']);
exports.StorageTypeSchema = zod_1.z.enum(['room', 'cabinet', 'refrigerator', 'freezer', 'controlled']);
exports.TransactionTypeSchema = zod_1.z.enum(['receive', 'issue', 'transfer', 'adjustment', 'count', 'expire', 'return']);
exports.ReferenceTypeSchema = zod_1.z.enum(['purchase_order', 'treatment', 'appointment', 'adjustment', 'transfer']);
exports.AlertTypeSchema = zod_1.z.enum(['low_stock', 'expired', 'expiring', 'overstock', 'zero_stock']);
exports.AlertLevelSchema = zod_1.z.enum(['info', 'warning', 'critical', 'urgent']);
exports.AlertStatusSchema = zod_1.z.enum(['active', 'acknowledged', 'resolved', 'dismissed']);
exports.StockStatusSchema = zod_1.z.enum(['active', 'quarantine', 'expired', 'recalled']);
exports.VerificationStatusSchema = zod_1.z.enum(['pending', 'verified', 'rejected']);
exports.ScanTypeSchema = zod_1.z.enum(['barcode', 'qr_code']);
exports.ScanFormatSchema = zod_1.z.enum(['code128', 'code39', 'ean13', 'qr', 'datamatrix']);
exports.ScanPurposeSchema = zod_1.z.enum(['stock_in', 'stock_out', 'count', 'lookup', 'transfer']);
exports.ScanStatusSchema = zod_1.z.enum(['success', 'not_found', 'error', 'duplicate']);
exports.DeviceTypeSchema = zod_1.z.enum(['mobile', 'scanner', 'tablet', 'desktop']);
exports.SyncStatusSchema = zod_1.z.enum(['pending', 'synced', 'error', 'conflict']);
exports.SyncOperationSchema = zod_1.z.enum(['create', 'update', 'delete']);
exports.ConflictResolutionSchema = zod_1.z.enum(['server_wins', 'client_wins', 'merge', 'manual']);
// Common Field Schemas
exports.UuidSchema = zod_1.z.string().uuid();
exports.SkuSchema = zod_1.z.string().min(1).max(100).regex(/^[A-Z0-9\-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores');
exports.BarcodeSchema = zod_1.z.string().min(1).max(128).optional();
exports.QuantitySchema = zod_1.z.number().int().min(0);
exports.CostSchema = zod_1.z.number().min(0).max(999999.99);
exports.LocationCodeSchema = zod_1.z.string().min(1).max(50).regex(/^[A-Z0-9\-_]+$/, 'Location code must contain only uppercase letters, numbers, hyphens, and underscores');
// =====================================================================================
// CORE INVENTORY SCHEMAS
// =====================================================================================
exports.InventoryItemSchema = zod_1.z.object({
    id: exports.UuidSchema,
    clinic_id: exports.UuidSchema,
    // Basic Item Information
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(2000).optional(),
    sku: exports.SkuSchema,
    barcode: exports.BarcodeSchema,
    qr_code: zod_1.z.string().optional(),
    // Classification
    category: zod_1.z.string().min(1).max(100),
    subcategory: zod_1.z.string().max(100).optional(),
    item_type: exports.ItemTypeSchema,
    // Measurement & Ordering
    unit_of_measure: zod_1.z.string().min(1).max(50),
    unit_size: zod_1.z.number().positive().optional(),
    unit_cost: exports.CostSchema.optional(),
    // Stock Management
    reorder_level: exports.QuantitySchema,
    max_stock: exports.QuantitySchema,
    min_stock: exports.QuantitySchema,
    safety_stock: exports.QuantitySchema,
    // Medical/Regulatory Information
    requires_prescription: zod_1.z.boolean().default(false),
    controlled_substance: zod_1.z.boolean().default(false),
    anvisa_code: zod_1.z.string().max(50).optional(),
    therapeutic_class: zod_1.z.string().max(100).optional(),
    // Status & Metadata
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    created_by: exports.UuidSchema.optional(),
}).refine(function (data) { return data.min_stock <= data.reorder_level; }, {
    message: "Minimum stock must be less than or equal to reorder level",
    path: ["min_stock"]
}).refine(function (data) { return data.reorder_level <= data.max_stock; }, {
    message: "Reorder level must be less than or equal to maximum stock",
    path: ["reorder_level"]
});
exports.InventoryLocationSchema = zod_1.z.object({
    id: exports.UuidSchema,
    clinic_id: exports.UuidSchema,
    // Location Information
    location_name: zod_1.z.string().min(1).max(255),
    location_code: exports.LocationCodeSchema,
    address: zod_1.z.string().max(1000).optional(),
    room_number: zod_1.z.string().max(20).optional(),
    // Storage Details
    storage_type: exports.StorageTypeSchema,
    temperature_controlled: zod_1.z.boolean().default(false),
    min_temperature: zod_1.z.number().min(-50).max(50).optional(),
    max_temperature: zod_1.z.number().min(-50).max(50).optional(),
    humidity_controlled: zod_1.z.boolean().default(false),
    // Access Control
    access_permissions: zod_1.z.array(zod_1.z.string()).default([]),
    requires_authorization: zod_1.z.boolean().default(false),
    responsible_user_id: exports.UuidSchema.optional(),
    // Status & Metadata
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
}).refine(function (data) {
    if (data.min_temperature !== undefined && data.max_temperature !== undefined) {
        return data.min_temperature <= data.max_temperature;
    }
    return true;
}, {
    message: "Minimum temperature must be less than or equal to maximum temperature",
    path: ["min_temperature"]
});
exports.StockLevelSchema = zod_1.z.object({
    id: exports.UuidSchema,
    item_id: exports.UuidSchema,
    location_id: exports.UuidSchema,
    // Stock Quantities
    current_quantity: exports.QuantitySchema,
    reserved_quantity: exports.QuantitySchema,
    available_quantity: exports.QuantitySchema,
    allocated_quantity: exports.QuantitySchema,
    // Batch Information
    batch_number: zod_1.z.string().max(100).optional(),
    lot_number: zod_1.z.string().max(100).optional(),
    serial_number: zod_1.z.string().max(100).optional(),
    expiration_date: zod_1.z.string().date().optional(),
    manufacture_date: zod_1.z.string().date().optional(),
    // Tracking
    last_counted_at: zod_1.z.string().datetime().optional(),
    last_counted_by: exports.UuidSchema.optional(),
    variance_quantity: zod_1.z.number().int().default(0),
    // Status & Metadata
    status: exports.StockStatusSchema,
    last_updated: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
}).refine(function (data) { return data.reserved_quantity <= data.current_quantity; }, {
    message: "Reserved quantity cannot exceed current quantity",
    path: ["reserved_quantity"]
}).refine(function (data) {
    if (data.manufacture_date && data.expiration_date) {
        return new Date(data.manufacture_date) <= new Date(data.expiration_date);
    }
    return true;
}, {
    message: "Manufacture date must be before expiration date",
    path: ["expiration_date"]
});
exports.InventoryTransactionSchema = zod_1.z.object({
    id: exports.UuidSchema,
    item_id: exports.UuidSchema,
    location_id: exports.UuidSchema,
    // Transaction Details
    transaction_type: exports.TransactionTypeSchema,
    reference_type: exports.ReferenceTypeSchema.optional(),
    reference_id: exports.UuidSchema.optional(),
    // Quantities
    quantity_before: exports.QuantitySchema,
    quantity_change: zod_1.z.number().int(),
    quantity_after: exports.QuantitySchema,
    // Batch Information
    batch_number: zod_1.z.string().max(100).optional(),
    lot_number: zod_1.z.string().max(100).optional(),
    expiration_date: zod_1.z.string().date().optional(),
    // Cost Information
    unit_cost: exports.CostSchema.optional(),
    total_cost: zod_1.z.number().min(0).max(9999999999.99).optional(),
    // Transaction Context
    reason: zod_1.z.string().max(500).optional(),
    notes: zod_1.z.string().max(2000).optional(),
    source_location_id: exports.UuidSchema.optional(),
    destination_location_id: exports.UuidSchema.optional(),
    // Audit Information
    transaction_date: zod_1.z.string().datetime(),
    created_by: exports.UuidSchema,
    approved_by: exports.UuidSchema.optional(),
    // Verification
    verification_status: exports.VerificationStatusSchema,
    verified_by: exports.UuidSchema.optional(),
    verified_at: zod_1.z.string().datetime().optional(),
}).refine(function (data) { return data.quantity_before + data.quantity_change === data.quantity_after; }, {
    message: "Quantity calculation is incorrect: before + change must equal after",
    path: ["quantity_after"]
});
// =====================================================================================
// ALERTS AND NOTIFICATIONS SCHEMAS
// =====================================================================================
exports.StockAlertSchema = zod_1.z.object({
    id: exports.UuidSchema,
    clinic_id: exports.UuidSchema,
    item_id: exports.UuidSchema,
    location_id: exports.UuidSchema.optional(),
    // Alert Details
    alert_type: exports.AlertTypeSchema,
    alert_level: exports.AlertLevelSchema,
    // Alert Content
    title: zod_1.z.string().min(1).max(255),
    message: zod_1.z.string().min(1).max(2000),
    current_quantity: exports.QuantitySchema.optional(),
    threshold_quantity: exports.QuantitySchema.optional(),
    // Status & Timing
    status: exports.AlertStatusSchema,
    created_at: zod_1.z.string().datetime(),
    acknowledged_at: zod_1.z.string().datetime().optional(),
    acknowledged_by: exports.UuidSchema.optional(),
    resolved_at: zod_1.z.string().datetime().optional(),
    resolved_by: exports.UuidSchema.optional(),
    // Delivery Tracking
    notification_sent: zod_1.z.boolean().default(false),
    notification_channels: zod_1.z.array(zod_1.z.string()).default([]),
    escalation_level: zod_1.z.number().int().min(0).max(5).default(0),
});
// =====================================================================================
// BARCODE/QR CODE SCHEMAS
// =====================================================================================
exports.BarcodeScanSchema = zod_1.z.object({
    id: exports.UuidSchema,
    clinic_id: exports.UuidSchema,
    // Scan Details
    barcode_value: zod_1.z.string().min(1).max(128),
    scan_type: exports.ScanTypeSchema,
    scan_format: exports.ScanFormatSchema.optional(),
    // Context
    item_id: exports.UuidSchema.optional(),
    location_id: exports.UuidSchema.optional(),
    scan_purpose: exports.ScanPurposeSchema,
    // Scan Result
    scan_status: exports.ScanStatusSchema,
    error_message: zod_1.z.string().max(500).optional(),
    // Device & User
    device_id: zod_1.z.string().max(100).optional(),
    device_type: exports.DeviceTypeSchema.optional(),
    scanned_by: exports.UuidSchema,
    scanned_at: zod_1.z.string().datetime(),
    // Transaction Reference
    transaction_id: exports.UuidSchema.optional(),
});
// =====================================================================================
// MOBILE & OFFLINE SCHEMAS
// =====================================================================================
exports.MobileSyncQueueSchema = zod_1.z.object({
    id: exports.UuidSchema,
    clinic_id: exports.UuidSchema,
    // Sync Details
    entity_type: zod_1.z.string().min(1).max(50),
    entity_id: exports.UuidSchema,
    operation: exports.SyncOperationSchema,
    // Sync Data
    sync_data: zod_1.z.record(zod_1.z.any()),
    client_timestamp: zod_1.z.string().datetime(),
    server_timestamp: zod_1.z.string().datetime(),
    // Status
    sync_status: exports.SyncStatusSchema,
    error_message: zod_1.z.string().max(1000).optional(),
    conflict_resolution: exports.ConflictResolutionSchema.optional(),
    // Device Info
    device_id: zod_1.z.string().min(1).max(100),
    user_id: exports.UuidSchema,
    // Processing
    processed_at: zod_1.z.string().datetime().optional(),
    retry_count: zod_1.z.number().int().min(0).max(10).default(0),
});
// =====================================================================================
// API REQUEST SCHEMAS
// =====================================================================================
exports.StockUpdateRequestSchema = zod_1.z.object({
    item_id: exports.UuidSchema,
    location_id: exports.UuidSchema,
    quantity_change: zod_1.z.number().int().min(-999999).max(999999),
    transaction_type: exports.TransactionTypeSchema,
    reason: zod_1.z.string().min(1).max(500).optional(),
    batch_number: zod_1.z.string().max(100).optional(),
    expiration_date: zod_1.z.string().date().optional(),
    reference_type: exports.ReferenceTypeSchema.optional(),
    reference_id: exports.UuidSchema.optional(),
});
exports.BarcodeScanRequestSchema = zod_1.z.object({
    barcode_value: zod_1.z.string().min(1).max(128),
    scan_type: exports.ScanTypeSchema,
    scan_purpose: exports.ScanPurposeSchema,
    location_id: exports.UuidSchema.optional(),
    device_id: zod_1.z.string().max(100).optional(),
    device_type: exports.DeviceTypeSchema.optional(),
});
exports.BatchTransactionRequestSchema = zod_1.z.object({
    transactions: zod_1.z.array(exports.StockUpdateRequestSchema).min(1).max(100),
    validate_only: zod_1.z.boolean().default(false),
});
exports.InventorySearchParamsSchema = zod_1.z.object({
    query: zod_1.z.string().max(255).optional(),
    category: zod_1.z.string().max(100).optional(),
    location_id: exports.UuidSchema.optional(),
    stock_status: zod_1.z.enum(['all', 'in_stock', 'low_stock', 'out_of_stock']).default('all'),
    expiry_status: zod_1.z.enum(['all', 'expired', 'expiring_soon', 'expiring_this_month']).default('all'),
    item_type: exports.ItemTypeSchema.optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sort_by: zod_1.z.enum(['name', 'sku', 'quantity', 'expiry_date', 'last_updated']).default('name'),
    sort_order: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
// =====================================================================================
// FORM SCHEMAS
// =====================================================================================
exports.CreateInventoryItemFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
    description: zod_1.z.string().max(2000, "Description must be less than 2000 characters").optional(),
    sku: exports.SkuSchema,
    barcode: exports.BarcodeSchema,
    category: zod_1.z.string().min(1, "Category is required").max(100),
    subcategory: zod_1.z.string().max(100).optional(),
    item_type: exports.ItemTypeSchema,
    unit_of_measure: zod_1.z.string().min(1, "Unit of measure is required").max(50),
    unit_size: zod_1.z.number().positive("Unit size must be positive").optional(),
    unit_cost: exports.CostSchema.optional(),
    reorder_level: zod_1.z.number().int().min(0, "Reorder level must be non-negative"),
    max_stock: zod_1.z.number().int().min(1, "Maximum stock must be at least 1"),
    min_stock: zod_1.z.number().int().min(0, "Minimum stock must be non-negative"),
    safety_stock: zod_1.z.number().int().min(0, "Safety stock must be non-negative"),
    requires_prescription: zod_1.z.boolean().default(false),
    controlled_substance: zod_1.z.boolean().default(false),
    anvisa_code: zod_1.z.string().max(50).optional(),
    therapeutic_class: zod_1.z.string().max(100).optional(),
}).refine(function (data) { return data.min_stock <= data.reorder_level; }, {
    message: "Minimum stock must be less than or equal to reorder level",
    path: ["min_stock"]
}).refine(function (data) { return data.reorder_level <= data.max_stock; }, {
    message: "Reorder level must be less than or equal to maximum stock",
    path: ["reorder_level"]
});
exports.CreateLocationFormSchema = zod_1.z.object({
    location_name: zod_1.z.string().min(1, "Location name is required").max(255),
    location_code: exports.LocationCodeSchema,
    address: zod_1.z.string().max(1000).optional(),
    room_number: zod_1.z.string().max(20).optional(),
    storage_type: exports.StorageTypeSchema,
    temperature_controlled: zod_1.z.boolean().default(false),
    min_temperature: zod_1.z.number().min(-50).max(50).optional(),
    max_temperature: zod_1.z.number().min(-50).max(50).optional(),
    humidity_controlled: zod_1.z.boolean().default(false),
    requires_authorization: zod_1.z.boolean().default(false),
    responsible_user_id: exports.UuidSchema.optional(),
}).refine(function (data) {
    if (data.min_temperature !== undefined && data.max_temperature !== undefined) {
        return data.min_temperature <= data.max_temperature;
    }
    return true;
}, {
    message: "Minimum temperature must be less than or equal to maximum temperature",
    path: ["min_temperature"]
});
exports.StockAdjustmentFormSchema = zod_1.z.object({
    item_id: exports.UuidSchema,
    location_id: exports.UuidSchema,
    adjustment_type: zod_1.z.enum(['set', 'increase', 'decrease']),
    quantity: zod_1.z.number().int().min(0, "Quantity must be non-negative"),
    reason: zod_1.z.string().min(1, "Reason is required").max(500),
    batch_number: zod_1.z.string().max(100).optional(),
    expiration_date: zod_1.z.string().date().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
exports.TransferStockFormSchema = zod_1.z.object({
    item_id: exports.UuidSchema,
    source_location_id: exports.UuidSchema,
    destination_location_id: exports.UuidSchema,
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
    reason: zod_1.z.string().min(1, "Reason is required").max(500),
    batch_number: zod_1.z.string().max(100).optional(),
    notes: zod_1.z.string().max(2000).optional(),
}).refine(function (data) { return data.source_location_id !== data.destination_location_id; }, {
    message: "Source and destination locations must be different",
    path: ["destination_location_id"]
});
// =====================================================================================
// BULK OPERATION SCHEMAS
// =====================================================================================
exports.BulkCreateItemsSchema = zod_1.z.object({
    items: zod_1.z.array(exports.CreateInventoryItemFormSchema).min(1).max(50),
    validate_only: zod_1.z.boolean().default(false),
});
exports.BulkUpdateStockSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        item_id: exports.UuidSchema,
        location_id: exports.UuidSchema,
        new_quantity: exports.QuantitySchema,
        reason: zod_1.z.string().min(1).max(500),
        batch_number: zod_1.z.string().max(100).optional(),
    })).min(1).max(100),
    validate_only: zod_1.z.boolean().default(false),
});
exports.ImportInventorySchema = zod_1.z.object({
    file_format: zod_1.z.enum(['csv', 'xlsx']),
    data: zod_1.z.array(zod_1.z.record(zod_1.z.string())).min(1).max(1000),
    mapping: zod_1.z.record(zod_1.z.string()),
    validate_only: zod_1.z.boolean().default(false),
    overwrite_existing: zod_1.z.boolean().default(false),
});
// =====================================================================================
// EXPORT SCHEMAS
// =====================================================================================
exports.ExportInventorySchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'xlsx', 'pdf']),
    filters: exports.InventorySearchParamsSchema.optional(),
    include_stock_levels: zod_1.z.boolean().default(true),
    include_transactions: zod_1.z.boolean().default(false),
    date_range: zod_1.z.object({
        start_date: zod_1.z.string().date(),
        end_date: zod_1.z.string().date(),
    }).optional(),
});
// =====================================================================================
// REPORTING SCHEMAS
// =====================================================================================
exports.InventoryReportParamsSchema = zod_1.z.object({
    report_type: zod_1.z.enum(['stock_summary', 'low_stock', 'expiring_items', 'transaction_history', 'usage_analysis']),
    period: zod_1.z.enum(['today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'custom']),
    start_date: zod_1.z.string().date().optional(),
    end_date: zod_1.z.string().date().optional(),
    category_filter: zod_1.z.string().max(100).optional(),
    location_filter: exports.UuidSchema.optional(),
    include_inactive: zod_1.z.boolean().default(false),
    format: zod_1.z.enum(['json', 'csv', 'pdf']).default('json'),
});
// =====================================================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================================================
var validateInventoryItem = function (data) {
    return exports.InventoryItemSchema.safeParse(data);
};
exports.validateInventoryItem = validateInventoryItem;
var validateStockUpdate = function (data) {
    return exports.StockUpdateRequestSchema.safeParse(data);
};
exports.validateStockUpdate = validateStockUpdate;
var validateBarcodeScan = function (data) {
    return exports.BarcodeScanRequestSchema.safeParse(data);
};
exports.validateBarcodeScan = validateBarcodeScan;
var validateCreateItemForm = function (data) {
    return exports.CreateInventoryItemFormSchema.safeParse(data);
};
exports.validateCreateItemForm = validateCreateItemForm;
var validateSearchParams = function (data) {
    return exports.InventorySearchParamsSchema.safeParse(data);
};
exports.validateSearchParams = validateSearchParams;
// =====================================================================================
// DEFAULT EXPORTS
// =====================================================================================
exports.default = {
    // Core Schemas
    InventoryItemSchema: exports.InventoryItemSchema,
    InventoryLocationSchema: exports.InventoryLocationSchema,
    StockLevelSchema: exports.StockLevelSchema,
    InventoryTransactionSchema: exports.InventoryTransactionSchema,
    StockAlertSchema: exports.StockAlertSchema,
    BarcodeScanSchema: exports.BarcodeScanSchema,
    // Form Schemas
    CreateInventoryItemFormSchema: exports.CreateInventoryItemFormSchema,
    CreateLocationFormSchema: exports.CreateLocationFormSchema,
    StockAdjustmentFormSchema: exports.StockAdjustmentFormSchema,
    TransferStockFormSchema: exports.TransferStockFormSchema,
    // Request Schemas
    StockUpdateRequestSchema: exports.StockUpdateRequestSchema,
    BarcodeScanRequestSchema: exports.BarcodeScanRequestSchema,
    InventorySearchParamsSchema: exports.InventorySearchParamsSchema,
    // Validation Functions
    validateInventoryItem: exports.validateInventoryItem,
    validateStockUpdate: exports.validateStockUpdate,
    validateBarcodeScan: exports.validateBarcodeScan,
    validateCreateItemForm: exports.validateCreateItemForm,
    validateSearchParams: exports.validateSearchParams,
};

// =====================================================================================
// NeonPro Inventory Management System - Zod Validation Schemas
// Epic 6: Real-time Stock Tracking with Barcode/QR Integration
// Generated: 2025-01-26
// =====================================================================================

import { z } from 'zod';

// =====================================================================================
// BASE VALIDATION SCHEMAS
// =====================================================================================

// Enum Schemas
export const ItemTypeSchema = z.enum([
  'supply',
  'medication',
  'equipment',
  'consumable',
]);
export const StorageTypeSchema = z.enum([
  'room',
  'cabinet',
  'refrigerator',
  'freezer',
  'controlled',
]);
export const TransactionTypeSchema = z.enum([
  'receive',
  'issue',
  'transfer',
  'adjustment',
  'count',
  'expire',
  'return',
]);
export const ReferenceTypeSchema = z.enum([
  'purchase_order',
  'treatment',
  'appointment',
  'adjustment',
  'transfer',
]);
export const AlertTypeSchema = z.enum([
  'low_stock',
  'expired',
  'expiring',
  'overstock',
  'zero_stock',
]);
export const AlertLevelSchema = z.enum([
  'info',
  'warning',
  'critical',
  'urgent',
]);
export const AlertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'resolved',
  'dismissed',
]);
export const StockStatusSchema = z.enum([
  'active',
  'quarantine',
  'expired',
  'recalled',
]);
export const VerificationStatusSchema = z.enum([
  'pending',
  'verified',
  'rejected',
]);
export const ScanTypeSchema = z.enum(['barcode', 'qr_code']);
export const ScanFormatSchema = z.enum([
  'code128',
  'code39',
  'ean13',
  'qr',
  'datamatrix',
]);
export const ScanPurposeSchema = z.enum([
  'stock_in',
  'stock_out',
  'count',
  'lookup',
  'transfer',
]);
export const ScanStatusSchema = z.enum([
  'success',
  'not_found',
  'error',
  'duplicate',
]);
export const DeviceTypeSchema = z.enum([
  'mobile',
  'scanner',
  'tablet',
  'desktop',
]);
export const SyncStatusSchema = z.enum([
  'pending',
  'synced',
  'error',
  'conflict',
]);
export const SyncOperationSchema = z.enum(['create', 'update', 'delete']);
export const ConflictResolutionSchema = z.enum([
  'server_wins',
  'client_wins',
  'merge',
  'manual',
]);

// Common Field Schemas
export const UuidSchema = z.string().uuid();
export const SkuSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[A-Z0-9\-_]+$/,
    'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  );
export const BarcodeSchema = z.string().min(1).max(128).optional();
export const QuantitySchema = z.number().int().min(0);
export const CostSchema = z.number().min(0).max(999_999.99);
export const LocationCodeSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(
    /^[A-Z0-9\-_]+$/,
    'Location code must contain only uppercase letters, numbers, hyphens, and underscores',
  );

// =====================================================================================
// CORE INVENTORY SCHEMAS
// =====================================================================================

export const InventoryItemSchema = z
  .object({
    id: UuidSchema,
    clinic_id: UuidSchema,

    // Basic Item Information
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    sku: SkuSchema,
    barcode: BarcodeSchema,
    qr_code: z.string().optional(),

    // Classification
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    item_type: ItemTypeSchema,

    // Measurement & Ordering
    unit_of_measure: z.string().min(1).max(50),
    unit_size: z.number().positive().optional(),
    unit_cost: CostSchema.optional(),

    // Stock Management
    reorder_level: QuantitySchema,
    max_stock: QuantitySchema,
    min_stock: QuantitySchema,
    safety_stock: QuantitySchema,

    // Medical/Regulatory Information
    requires_prescription: z.boolean().default(false),
    controlled_substance: z.boolean().default(false),
    anvisa_code: z.string().max(50).optional(),
    therapeutic_class: z.string().max(100).optional(),

    // Status & Metadata
    is_active: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    created_by: UuidSchema.optional(),
  })
  .refine((data) => data.min_stock <= data.reorder_level, {
    message: 'Minimum stock must be less than or equal to reorder level',
    path: ['min_stock'],
  })
  .refine((data) => data.reorder_level <= data.max_stock, {
    message: 'Reorder level must be less than or equal to maximum stock',
    path: ['reorder_level'],
  });

export const InventoryLocationSchema = z
  .object({
    id: UuidSchema,
    clinic_id: UuidSchema,

    // Location Information
    location_name: z.string().min(1).max(255),
    location_code: LocationCodeSchema,
    address: z.string().max(1000).optional(),
    room_number: z.string().max(20).optional(),

    // Storage Details
    storage_type: StorageTypeSchema,
    temperature_controlled: z.boolean().default(false),
    min_temperature: z.number().min(-50).max(50).optional(),
    max_temperature: z.number().min(-50).max(50).optional(),
    humidity_controlled: z.boolean().default(false),

    // Access Control
    access_permissions: z.array(z.string()).default([]),
    requires_authorization: z.boolean().default(false),
    responsible_user_id: UuidSchema.optional(),

    // Status & Metadata
    is_active: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .refine(
    (data) => {
      if (
        data.min_temperature !== undefined &&
        data.max_temperature !== undefined
      ) {
        return data.min_temperature <= data.max_temperature;
      }
      return true;
    },
    {
      message:
        'Minimum temperature must be less than or equal to maximum temperature',
      path: ['min_temperature'],
    },
  );

export const StockLevelSchema = z
  .object({
    id: UuidSchema,
    item_id: UuidSchema,
    location_id: UuidSchema,

    // Stock Quantities
    current_quantity: QuantitySchema,
    reserved_quantity: QuantitySchema,
    available_quantity: QuantitySchema,
    allocated_quantity: QuantitySchema,

    // Batch Information
    batch_number: z.string().max(100).optional(),
    lot_number: z.string().max(100).optional(),
    serial_number: z.string().max(100).optional(),
    expiration_date: z.string().date().optional(),
    manufacture_date: z.string().date().optional(),

    // Tracking
    last_counted_at: z.string().datetime().optional(),
    last_counted_by: UuidSchema.optional(),
    variance_quantity: z.number().int().default(0),

    // Status & Metadata
    status: StockStatusSchema,
    last_updated: z.string().datetime(),
    created_at: z.string().datetime(),
  })
  .refine((data) => data.reserved_quantity <= data.current_quantity, {
    message: 'Reserved quantity cannot exceed current quantity',
    path: ['reserved_quantity'],
  })
  .refine(
    (data) => {
      if (data.manufacture_date && data.expiration_date) {
        return (
          new Date(data.manufacture_date) <= new Date(data.expiration_date)
        );
      }
      return true;
    },
    {
      message: 'Manufacture date must be before expiration date',
      path: ['expiration_date'],
    },
  );

export const InventoryTransactionSchema = z
  .object({
    id: UuidSchema,
    item_id: UuidSchema,
    location_id: UuidSchema,

    // Transaction Details
    transaction_type: TransactionTypeSchema,
    reference_type: ReferenceTypeSchema.optional(),
    reference_id: UuidSchema.optional(),

    // Quantities
    quantity_before: QuantitySchema,
    quantity_change: z.number().int(),
    quantity_after: QuantitySchema,

    // Batch Information
    batch_number: z.string().max(100).optional(),
    lot_number: z.string().max(100).optional(),
    expiration_date: z.string().date().optional(),

    // Cost Information
    unit_cost: CostSchema.optional(),
    total_cost: z.number().min(0).max(9_999_999_999.99).optional(),

    // Transaction Context
    reason: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    source_location_id: UuidSchema.optional(),
    destination_location_id: UuidSchema.optional(),

    // Audit Information
    transaction_date: z.string().datetime(),
    created_by: UuidSchema,
    approved_by: UuidSchema.optional(),

    // Verification
    verification_status: VerificationStatusSchema,
    verified_by: UuidSchema.optional(),
    verified_at: z.string().datetime().optional(),
  })
  .refine(
    (data) =>
      data.quantity_before + data.quantity_change === data.quantity_after,
    {
      message:
        'Quantity calculation is incorrect: before + change must equal after',
      path: ['quantity_after'],
    },
  );

// =====================================================================================
// ALERTS AND NOTIFICATIONS SCHEMAS
// =====================================================================================

export const StockAlertSchema = z.object({
  id: UuidSchema,
  clinic_id: UuidSchema,
  item_id: UuidSchema,
  location_id: UuidSchema.optional(),

  // Alert Details
  alert_type: AlertTypeSchema,
  alert_level: AlertLevelSchema,

  // Alert Content
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(2000),
  current_quantity: QuantitySchema.optional(),
  threshold_quantity: QuantitySchema.optional(),

  // Status & Timing
  status: AlertStatusSchema,
  created_at: z.string().datetime(),
  acknowledged_at: z.string().datetime().optional(),
  acknowledged_by: UuidSchema.optional(),
  resolved_at: z.string().datetime().optional(),
  resolved_by: UuidSchema.optional(),

  // Delivery Tracking
  notification_sent: z.boolean().default(false),
  notification_channels: z.array(z.string()).default([]),
  escalation_level: z.number().int().min(0).max(5).default(0),
});

// =====================================================================================
// BARCODE/QR CODE SCHEMAS
// =====================================================================================

export const BarcodeScanSchema = z.object({
  id: UuidSchema,
  clinic_id: UuidSchema,

  // Scan Details
  barcode_value: z.string().min(1).max(128),
  scan_type: ScanTypeSchema,
  scan_format: ScanFormatSchema.optional(),

  // Context
  item_id: UuidSchema.optional(),
  location_id: UuidSchema.optional(),
  scan_purpose: ScanPurposeSchema,

  // Scan Result
  scan_status: ScanStatusSchema,
  error_message: z.string().max(500).optional(),

  // Device & User
  device_id: z.string().max(100).optional(),
  device_type: DeviceTypeSchema.optional(),
  scanned_by: UuidSchema,
  scanned_at: z.string().datetime(),

  // Transaction Reference
  transaction_id: UuidSchema.optional(),
});

// =====================================================================================
// MOBILE & OFFLINE SCHEMAS
// =====================================================================================

export const MobileSyncQueueSchema = z.object({
  id: UuidSchema,
  clinic_id: UuidSchema,

  // Sync Details
  entity_type: z.string().min(1).max(50),
  entity_id: UuidSchema,
  operation: SyncOperationSchema,

  // Sync Data
  sync_data: z.record(z.any()),
  client_timestamp: z.string().datetime(),
  server_timestamp: z.string().datetime(),

  // Status
  sync_status: SyncStatusSchema,
  error_message: z.string().max(1000).optional(),
  conflict_resolution: ConflictResolutionSchema.optional(),

  // Device Info
  device_id: z.string().min(1).max(100),
  user_id: UuidSchema,

  // Processing
  processed_at: z.string().datetime().optional(),
  retry_count: z.number().int().min(0).max(10).default(0),
});

// =====================================================================================
// API REQUEST SCHEMAS
// =====================================================================================

export const StockUpdateRequestSchema = z.object({
  item_id: UuidSchema,
  location_id: UuidSchema,
  quantity_change: z.number().int().min(-999_999).max(999_999),
  transaction_type: TransactionTypeSchema,
  reason: z.string().min(1).max(500).optional(),
  batch_number: z.string().max(100).optional(),
  expiration_date: z.string().date().optional(),
  reference_type: ReferenceTypeSchema.optional(),
  reference_id: UuidSchema.optional(),
});

export const BarcodeScanRequestSchema = z.object({
  barcode_value: z.string().min(1).max(128),
  scan_type: ScanTypeSchema,
  scan_purpose: ScanPurposeSchema,
  location_id: UuidSchema.optional(),
  device_id: z.string().max(100).optional(),
  device_type: DeviceTypeSchema.optional(),
});

export const BatchTransactionRequestSchema = z.object({
  transactions: z.array(StockUpdateRequestSchema).min(1).max(100),
  validate_only: z.boolean().default(false),
});

export const InventorySearchParamsSchema = z.object({
  query: z.string().max(255).optional(),
  category: z.string().max(100).optional(),
  location_id: UuidSchema.optional(),
  stock_status: z
    .enum(['all', 'in_stock', 'low_stock', 'out_of_stock'])
    .default('all'),
  expiry_status: z
    .enum(['all', 'expired', 'expiring_soon', 'expiring_this_month'])
    .default('all'),
  item_type: ItemTypeSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(['name', 'sku', 'quantity', 'expiry_date', 'last_updated'])
    .default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// =====================================================================================
// FORM SCHEMAS
// =====================================================================================

export const CreateInventoryItemFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name must be less than 255 characters'),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    sku: SkuSchema,
    barcode: BarcodeSchema,
    category: z.string().min(1, 'Category is required').max(100),
    subcategory: z.string().max(100).optional(),
    item_type: ItemTypeSchema,
    unit_of_measure: z.string().min(1, 'Unit of measure is required').max(50),
    unit_size: z.number().positive('Unit size must be positive').optional(),
    unit_cost: CostSchema.optional(),
    reorder_level: z
      .number()
      .int()
      .min(0, 'Reorder level must be non-negative'),
    max_stock: z.number().int().min(1, 'Maximum stock must be at least 1'),
    min_stock: z.number().int().min(0, 'Minimum stock must be non-negative'),
    safety_stock: z.number().int().min(0, 'Safety stock must be non-negative'),
    requires_prescription: z.boolean().default(false),
    controlled_substance: z.boolean().default(false),
    anvisa_code: z.string().max(50).optional(),
    therapeutic_class: z.string().max(100).optional(),
  })
  .refine((data) => data.min_stock <= data.reorder_level, {
    message: 'Minimum stock must be less than or equal to reorder level',
    path: ['min_stock'],
  })
  .refine((data) => data.reorder_level <= data.max_stock, {
    message: 'Reorder level must be less than or equal to maximum stock',
    path: ['reorder_level'],
  });

export const CreateLocationFormSchema = z
  .object({
    location_name: z.string().min(1, 'Location name is required').max(255),
    location_code: LocationCodeSchema,
    address: z.string().max(1000).optional(),
    room_number: z.string().max(20).optional(),
    storage_type: StorageTypeSchema,
    temperature_controlled: z.boolean().default(false),
    min_temperature: z.number().min(-50).max(50).optional(),
    max_temperature: z.number().min(-50).max(50).optional(),
    humidity_controlled: z.boolean().default(false),
    requires_authorization: z.boolean().default(false),
    responsible_user_id: UuidSchema.optional(),
  })
  .refine(
    (data) => {
      if (
        data.min_temperature !== undefined &&
        data.max_temperature !== undefined
      ) {
        return data.min_temperature <= data.max_temperature;
      }
      return true;
    },
    {
      message:
        'Minimum temperature must be less than or equal to maximum temperature',
      path: ['min_temperature'],
    },
  );

export const StockAdjustmentFormSchema = z.object({
  item_id: UuidSchema,
  location_id: UuidSchema,
  adjustment_type: z.enum(['set', 'increase', 'decrease']),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  reason: z.string().min(1, 'Reason is required').max(500),
  batch_number: z.string().max(100).optional(),
  expiration_date: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
});

export const TransferStockFormSchema = z
  .object({
    item_id: UuidSchema,
    source_location_id: UuidSchema,
    destination_location_id: UuidSchema,
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    reason: z.string().min(1, 'Reason is required').max(500),
    batch_number: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((data) => data.source_location_id !== data.destination_location_id, {
    message: 'Source and destination locations must be different',
    path: ['destination_location_id'],
  });

// =====================================================================================
// BULK OPERATION SCHEMAS
// =====================================================================================

export const BulkCreateItemsSchema = z.object({
  items: z.array(CreateInventoryItemFormSchema).min(1).max(50),
  validate_only: z.boolean().default(false),
});

export const BulkUpdateStockSchema = z.object({
  updates: z
    .array(
      z.object({
        item_id: UuidSchema,
        location_id: UuidSchema,
        new_quantity: QuantitySchema,
        reason: z.string().min(1).max(500),
        batch_number: z.string().max(100).optional(),
      }),
    )
    .min(1)
    .max(100),
  validate_only: z.boolean().default(false),
});

export const ImportInventorySchema = z.object({
  file_format: z.enum(['csv', 'xlsx']),
  data: z.array(z.record(z.string())).min(1).max(1000),
  mapping: z.record(z.string()),
  validate_only: z.boolean().default(false),
  overwrite_existing: z.boolean().default(false),
});

// =====================================================================================
// EXPORT SCHEMAS
// =====================================================================================

export const ExportInventorySchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']),
  filters: InventorySearchParamsSchema.optional(),
  include_stock_levels: z.boolean().default(true),
  include_transactions: z.boolean().default(false),
  date_range: z
    .object({
      start_date: z.string().date(),
      end_date: z.string().date(),
    })
    .optional(),
});

// =====================================================================================
// REPORTING SCHEMAS
// =====================================================================================

export const InventoryReportParamsSchema = z.object({
  report_type: z.enum([
    'stock_summary',
    'low_stock',
    'expiring_items',
    'transaction_history',
    'usage_analysis',
  ]),
  period: z.enum([
    'today',
    'this_week',
    'this_month',
    'this_quarter',
    'this_year',
    'custom',
  ]),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  category_filter: z.string().max(100).optional(),
  location_filter: UuidSchema.optional(),
  include_inactive: z.boolean().default(false),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

// =====================================================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================================================

export const validateInventoryItem = (data: unknown) => {
  return InventoryItemSchema.safeParse(data);
};

export const validateStockUpdate = (data: unknown) => {
  return StockUpdateRequestSchema.safeParse(data);
};

export const validateBarcodeScan = (data: unknown) => {
  return BarcodeScanRequestSchema.safeParse(data);
};

export const validateCreateItemForm = (data: unknown) => {
  return CreateInventoryItemFormSchema.safeParse(data);
};

export const validateSearchParams = (data: unknown) => {
  return InventorySearchParamsSchema.safeParse(data);
};

// =====================================================================================
// TYPE INFERENCE HELPERS
// =====================================================================================

export type CreateInventoryItemForm = z.infer<
  typeof CreateInventoryItemFormSchema
>;
export type CreateLocationForm = z.infer<typeof CreateLocationFormSchema>;
export type StockAdjustmentForm = z.infer<typeof StockAdjustmentFormSchema>;
export type TransferStockForm = z.infer<typeof TransferStockFormSchema>;
export type StockUpdateRequest = z.infer<typeof StockUpdateRequestSchema>;
export type BarcodeScanRequest = z.infer<typeof BarcodeScanRequestSchema>;
export type InventorySearchParams = z.infer<typeof InventorySearchParamsSchema>;
export type InventoryReportParams = z.infer<typeof InventoryReportParamsSchema>;

// =====================================================================================
// DEFAULT EXPORTS
// =====================================================================================

export default {
  // Core Schemas
  InventoryItemSchema,
  InventoryLocationSchema,
  StockLevelSchema,
  InventoryTransactionSchema,
  StockAlertSchema,
  BarcodeScanSchema,

  // Form Schemas
  CreateInventoryItemFormSchema,
  CreateLocationFormSchema,
  StockAdjustmentFormSchema,
  TransferStockFormSchema,

  // Request Schemas
  StockUpdateRequestSchema,
  BarcodeScanRequestSchema,
  InventorySearchParamsSchema,

  // Validation Functions
  validateInventoryItem,
  validateStockUpdate,
  validateBarcodeScan,
  validateCreateItemForm,
  validateSearchParams,
};

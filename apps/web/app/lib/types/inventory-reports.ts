import { z } from 'zod';

// =============================================================================
// REPORT TYPES & ENUMS
// =============================================================================

export type ReportType =
  | 'stock_movement'
  | 'stock_valuation'
  | 'expiring_items'
  | 'low_stock'
  | 'transfers'
  | 'location_performance'
  | 'supplier_analysis'
  | 'category_analysis';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type ReportPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export type MovementType =
  | 'in'
  | 'out'
  | 'transfer'
  | 'adjustment'
  | 'return'
  | 'waste';

export type ReportStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'scheduled';

// =============================================================================
// REPORT FILTERS & PARAMETERS
// =============================================================================

export type ReportFilters = {
  start_date?: string;
  end_date?: string;
  clinic_id?: string;
  room_id?: string;
  category?: string;
  item_id?: string;
  supplier_id?: string;
  movement_type?: MovementType;
  min_value?: number;
  max_value?: number;
  include_zero_stock?: boolean;
  only_active_items?: boolean;
};

export type ReportParameters = {
  type: ReportType;
  filters: ReportFilters;
  format: ReportFormat;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeCharts?: boolean;
  includeSummary?: boolean;
  customFields?: string[];
};

// =============================================================================
// STOCK MOVEMENT REPORT
// =============================================================================

export type StockMovementReportData = {
  movement_id: string;
  item_id: string;
  item_name: string;
  item_sku: string;
  category: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  clinic_name: string;
  room_name: string;
  movement_date: string;
  user_name?: string;
  reference_document?: string;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
};

export type StockMovementSummary = {
  total_movements: number;
  total_in: number;
  total_out: number;
  total_value_in: number;
  total_value_out: number;
  net_movement: number;
  net_value: number;
  by_type: Record<
    MovementType,
    {
      count: number;
      quantity: number;
      value: number;
    }
  >;
  by_category: Record<
    string,
    {
      count: number;
      quantity: number;
      value: number;
    }
  >;
  by_location: Record<
    string,
    {
      count: number;
      quantity: number;
      value: number;
    }
  >;
};

// =============================================================================
// STOCK VALUATION REPORT
// =============================================================================

export type StockValuationReportData = {
  item_id: string;
  item_name: string;
  item_sku: string;
  category: string;
  clinic_name: string;
  room_name: string;
  current_quantity: number;
  unit_cost: number;
  total_value: number;
  last_movement_date?: string;
  days_since_movement?: number;
  turnover_rate?: number;
  safety_stock?: number;
  stock_status: 'adequate' | 'low' | 'critical' | 'overstock';
};

export type StockValuationSummary = {
  total_items: number;
  total_quantity: number;
  total_value: number;
  average_unit_cost: number;
  by_category: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
      percentage: number;
    }
  >;
  by_location: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
      percentage: number;
    }
  >;
  by_status: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
      percentage: number;
    }
  >;
};

// =============================================================================
// EXPIRING ITEMS REPORT
// =============================================================================

export type ExpiringItemsReportData = {
  item_id: string;
  item_name: string;
  item_sku: string;
  category: string;
  clinic_name: string;
  room_name: string;
  batch_number: string;
  expiry_date: string;
  days_to_expiry: number;
  current_quantity: number;
  unit_cost: number;
  total_value: number;
  urgency_level: 'immediate' | 'urgent' | 'warning' | 'watch';
  suggested_action: 'use_immediately' | 'transfer' | 'discount' | 'dispose';
};

export type ExpiringItemsSummary = {
  total_expiring_items: number;
  total_expiring_value: number;
  by_urgency: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
    }
  >;
  by_category: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
    }
  >;
  by_location: Record<
    string,
    {
      items: number;
      quantity: number;
      value: number;
    }
  >;
  upcoming_expirations_30_days: number;
  upcoming_expirations_60_days: number;
  upcoming_expirations_90_days: number;
};

// =============================================================================
// TRANSFER REPORT
// =============================================================================

export type TransferReportData = {
  transfer_id: string;
  item_id: string;
  item_name: string;
  item_sku: string;
  category: string;
  from_clinic_name: string;
  from_room_name: string;
  to_clinic_name: string;
  to_room_name: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  transfer_date: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  reason: string;
  initiated_by?: string;
  completed_by?: string;
  notes?: string;
};

export type TransferReportSummary = {
  total_transfers: number;
  completed_transfers: number;
  pending_transfers: number;
  total_value_transferred: number;
  average_transfer_value: number;
  by_status: Record<
    string,
    {
      count: number;
      value: number;
    }
  >;
  by_route: Record<
    string,
    {
      count: number;
      value: number;
      avg_time: number;
    }
  >;
  by_category: Record<
    string,
    {
      count: number;
      value: number;
    }
  >;
  most_transferred_items: Array<{
    item_name: string;
    count: number;
    total_quantity: number;
  }>;
};

// =============================================================================
// LOCATION PERFORMANCE REPORT
// =============================================================================

export type LocationPerformanceData = {
  clinic_id: string;
  clinic_name: string;
  room_id?: string;
  room_name?: string;
  total_items: number;
  total_value: number;
  total_movements: number;
  movements_in: number;
  movements_out: number;
  value_in: number;
  value_out: number;
  turnover_rate: number;
  stock_accuracy: number;
  low_stock_items: number;
  expiring_items: number;
  transfer_requests: number;
  utilization_rate: number;
  performance_score: number;
};

export type LocationPerformanceSummary = {
  total_locations: number;
  average_performance_score: number;
  best_performing_location: string;
  worst_performing_location: string;
  total_system_value: number;
  total_system_movements: number;
  average_turnover_rate: number;
  locations_needing_attention: number;
};

// =============================================================================
// REPORT GENERATION & SCHEDULING
// =============================================================================

export type ReportDefinition = {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  parameters: ReportParameters;
  is_scheduled: boolean;
  schedule_cron?: string;
  schedule_timezone?: string;
  next_run?: string;
  last_run?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type ReportExecution = {
  id: string;
  report_definition_id: string;
  status: ReportStatus;
  format: ReportFormat;
  file_url?: string;
  file_size?: number;
  generation_time?: number;
  error_message?: string;
  executed_by?: string;
  executed_at: string;
  completed_at?: string;
  expires_at?: string;
  download_count: number;
  parameters_used: ReportParameters;
};

export type ReportTemplate = {
  id: string;
  name: string;
  type: ReportType;
  template_config: {
    logo?: string;
    header_text?: string;
    footer_text?: string;
    include_summary: boolean;
    include_charts: boolean;
    color_scheme: 'default' | 'blue' | 'green' | 'purple';
    page_orientation: 'portrait' | 'landscape';
    font_size: 'small' | 'medium' | 'large';
  };
  is_default: boolean;
  created_by: string;
  created_at: string;
};

// =============================================================================
// API CONTRACTS
// =============================================================================

export type GenerateReportRequest = {
  parameters: ReportParameters;
  template_id?: string;
  save_as_definition?: boolean;
  definition_name?: string;
};

export type GenerateReportResponse = {
  execution_id: string;
  status: ReportStatus;
  estimated_completion?: string;
  file_url?: string;
};

export type ScheduleReportRequest = {
  name: string;
  description?: string;
  parameters: ReportParameters;
  schedule_cron: string;
  timezone?: string;
  template_id?: string;
};

export type ReportListFilters = {
  type?: ReportType;
  status?: ReportStatus;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
};

// =============================================================================
// DASHBOARD INTERFACES
// =============================================================================

export type ReportDashboardStats = {
  total_reports_generated: number;
  scheduled_reports: number;
  active_executions: number;
  failed_executions_today: number;
  storage_used: number;
  most_generated_type: ReportType;
  average_generation_time: number;
};

export type ReportChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
};

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

export const ReportFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  clinic_id: z.string().optional(),
  room_id: z.string().optional(),
  category: z.string().optional(),
  item_id: z.string().optional(),
  supplier_id: z.string().optional(),
  movement_type: z
    .enum(['in', 'out', 'transfer', 'adjustment', 'return', 'waste'])
    .optional(),
  min_value: z.number().min(0).optional(),
  max_value: z.number().min(0).optional(),
  include_zero_stock: z.boolean().optional(),
  only_active_items: z.boolean().optional(),
});

export const ReportParametersSchema = z.object({
  type: z.enum([
    'stock_movement',
    'stock_valuation',
    'expiring_items',
    'low_stock',
    'transfers',
    'location_performance',
    'supplier_analysis',
    'category_analysis',
  ]),
  filters: ReportFiltersSchema,
  format: z.enum(['pdf', 'excel', 'csv', 'json']),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  includeCharts: z.boolean().optional(),
  includeSummary: z.boolean().optional(),
  customFields: z.array(z.string()).optional(),
});

export const GenerateReportRequestSchema = z.object({
  parameters: ReportParametersSchema,
  template_id: z.string().optional(),
  save_as_definition: z.boolean().optional(),
  definition_name: z.string().optional(),
});

export const ScheduleReportRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  parameters: ReportParametersSchema,
  schedule_cron: z.string(),
  timezone: z.string().optional(),
  template_id: z.string().optional(),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ReportDataMap = {
  stock_movement: StockMovementReportData;
  stock_valuation: StockValuationReportData;
  expiring_items: ExpiringItemsReportData;
  transfers: TransferReportData;
  location_performance: LocationPerformanceData;
  low_stock: StockValuationReportData;
  supplier_analysis: StockMovementReportData;
  category_analysis: StockValuationReportData;
};

export type ReportSummaryMap = {
  stock_movement: StockMovementSummary;
  stock_valuation: StockValuationSummary;
  expiring_items: ExpiringItemsSummary;
  transfers: TransferReportSummary;
  location_performance: LocationPerformanceSummary;
  low_stock: StockValuationSummary;
  supplier_analysis: StockMovementSummary;
  category_analysis: StockValuationSummary;
};

export type ReportResult<T extends ReportType> = {
  data: ReportDataMap[T][];
  summary: ReportSummaryMap[T];
  metadata: {
    generated_at: string;
    parameters: ReportParameters;
    total_records: number;
    execution_time: number;
  };
};

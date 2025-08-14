/**
 * Story 11.3: Centralized Inventory Types and Configuration
 * Type definitions and configuration for the Stock Output and Consumption Control System
 */

// Re-export types from other modules
export type {
  StockOutput,
  StockOutputItem,
  StockRequest,
  StockRequestStatus,
  AutoApprovalRule,
  StockTransfer,
  TransferItem,
  StockAlert,
  BatchStock,
  FIFOResult,
  LowStockAlert,
  ExpiryMonitoring,
  ConsumptionPattern as BaseConsumptionPattern,
  StockMovement,
  QualityCheck,
  RegulatoryCompliance
} from './stock-output-management';

export type {
  FIFOAnalysis,
  FIFORecommendation,
  ExpiryAlert,
  ExpiryAction,
  BatchMovement,
  FIFOOptimizationConfig
} from './fifo-management';

export type {
  ConsumptionAnalytics,
  ProductConsumption,
  ConsumptionTrend,
  CostEfficiency,
  EfficiencyOpportunity,
  ConsumptionAlert,
  ConsumptionForecast,
  PurchaseRecommendation,
  ConsumptionPattern,
  ProductCorrelation
} from './consumption-analytics';

// Main inventory management configuration
export interface InventoryConfig {
  stock_output: {
    auto_approval_enabled: boolean;
    auto_approval_limit: number;
    require_supervisor_approval: boolean;
    supervisor_approval_limit: number;
    enable_fifo_enforcement: boolean;
    enable_expiry_blocking: boolean;
    default_consumption_center: string;
  };
  
  fifo_management: {
    days_before_expiry_alert: number;
    days_before_expiry_block: number;
    auto_prioritize_expiring: boolean;
    allow_fifo_override: boolean;
    require_justification_override: boolean;
    enable_transfer_suggestions: boolean;
  };
  
  consumption_analytics: {
    default_analysis_period_days: number;
    enable_anomaly_detection: boolean;
    anomaly_threshold_percentage: number;
    enable_cost_optimization: boolean;
    enable_demand_forecasting: boolean;
    forecast_confidence_threshold: number;
  };
  
  notifications: {
    enable_low_stock_alerts: boolean;
    enable_expiry_alerts: boolean;
    enable_consumption_alerts: boolean;
    alert_channels: ('email' | 'system' | 'sms')[];
    escalation_hours: number;
  };
  
  compliance: {
    enable_anvisa_tracking: boolean;
    enable_lgpd_compliance: boolean;
    require_batch_traceability: boolean;
    enable_regulatory_reporting: boolean;
    audit_retention_days: number;
  };
}

// Dashboard summary types
export interface InventoryDashboardSummary {
  stock_levels: {
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    expiring_soon_products: number;
    total_value: number;
  };
  
  recent_activity: {
    outputs_today: number;
    value_consumed_today: number;
    pending_requests: number;
    alerts_active: number;
  };
  
  fifo_status: {
    batches_expiring_7_days: number;
    batches_expiring_30_days: number;
    fifo_compliance_score: number;
    waste_prevented_value: number;
  };
  
  cost_efficiency: {
    monthly_consumption_value: number;
    cost_per_procedure: number;
    efficiency_score: number;
    potential_savings: number;
  };
}

// Integrated workflow types
export interface InventoryWorkflow {
  id: string;
  type: 'stock_request' | 'transfer' | 'fifo_optimization' | 'cost_analysis';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  centro_custo_id: string;
  created_by: string;
  created_at: Date;
  completed_at?: Date;
  data: any; // Workflow-specific data
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assigned_to?: string;
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
  required_approvals?: string[];
}

// Integration with other systems
export interface SystemIntegration {
  erp: {
    enabled: boolean;
    sync_interval_minutes: number;
    last_sync: Date | null;
    auto_create_purchase_orders: boolean;
  };
  
  financial: {
    enabled: boolean;
    cost_center_mapping: Record<string, string>;
    auto_post_transactions: boolean;
    chart_of_accounts_mapping: Record<string, string>;
  };
  
  clinical: {
    enabled: boolean;
    procedure_cost_tracking: boolean;
    patient_charge_integration: boolean;
    insurance_claim_tracking: boolean;
  };
  
  quality: {
    enabled: boolean;
    batch_testing_integration: boolean;
    supplier_quality_scores: boolean;
    deviation_tracking: boolean;
  };
}

// Performance metrics
export interface InventoryMetrics {
  turnover_ratio: number;
  days_sales_outstanding: number;
  fill_rate_percentage: number;
  stockout_frequency: number;
  carrying_cost_percentage: number;
  waste_percentage: number;
  fifo_compliance_percentage: number;
  cost_variance_percentage: number;
}

// Audit and compliance
export interface InventoryAuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id: string;
  user_name: string;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
  session_id: string;
  compliance_flags: string[];
}

// Default configuration
export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  stock_output: {
    auto_approval_enabled: true,
    auto_approval_limit: 100,
    require_supervisor_approval: true,
    supervisor_approval_limit: 1000,
    enable_fifo_enforcement: true,
    enable_expiry_blocking: true,
    default_consumption_center: ''
  },
  
  fifo_management: {
    days_before_expiry_alert: 30,
    days_before_expiry_block: 7,
    auto_prioritize_expiring: true,
    allow_fifo_override: false,
    require_justification_override: true,
    enable_transfer_suggestions: true
  },
  
  consumption_analytics: {
    default_analysis_period_days: 90,
    enable_anomaly_detection: true,
    anomaly_threshold_percentage: 20,
    enable_cost_optimization: true,
    enable_demand_forecasting: true,
    forecast_confidence_threshold: 75
  },
  
  notifications: {
    enable_low_stock_alerts: true,
    enable_expiry_alerts: true,
    enable_consumption_alerts: true,
    alert_channels: ['system', 'email'],
    escalation_hours: 24
  },
  
  compliance: {
    enable_anvisa_tracking: true,
    enable_lgpd_compliance: true,
    require_batch_traceability: true,
    enable_regulatory_reporting: true,
    audit_retention_days: 2555 // 7 years
  }
};

// Status enums
export enum StockOutputStatus {
  DRAFT = 'rascunho',
  PENDING = 'pendente',
  APPROVED = 'aprovada',
  IN_PROGRESS = 'em_processamento',
  COMPLETED = 'concluida',
  CANCELLED = 'cancelada'
}

export enum BatchStatus {
  AVAILABLE = 'disponivel',
  RESERVED = 'reservado',
  BLOCKED = 'bloqueado',
  EXPIRED = 'vencido',
  CONSUMED = 'consumido'
}

export enum AlertType {
  LOW_STOCK = 'estoque_baixo',
  EXPIRY_WARNING = 'alerta_vencimento',
  EXPIRED = 'vencido',
  CONSUMPTION_ANOMALY = 'anomalia_consumo',
  COST_ALERT = 'alerta_custo',
  FIFO_VIOLATION = 'violacao_fifo'
}

export enum TransferStatus {
  PENDING = 'pendente',
  APPROVED = 'aprovada',
  IN_TRANSIT = 'em_transito',
  RECEIVED = 'recebida',
  CANCELLED = 'cancelada'
}

// Utility types
export type DateRange = {
  start: Date;
  end: Date;
};

export type ValueWithChange = {
  current: number;
  previous: number;
  change: number;
  percentage_change: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
};
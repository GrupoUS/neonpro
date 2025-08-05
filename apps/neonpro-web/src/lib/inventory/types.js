"use strict";
/**
 * Story 11.3: Centralized Inventory Types and Configuration
 * Type definitions and configuration for the Stock Output and Consumption Control System
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferStatus = exports.AlertType = exports.BatchStatus = exports.StockOutputStatus = exports.DEFAULT_INVENTORY_CONFIG = void 0;
// Default configuration
exports.DEFAULT_INVENTORY_CONFIG = {
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
var StockOutputStatus;
(function (StockOutputStatus) {
    StockOutputStatus["DRAFT"] = "rascunho";
    StockOutputStatus["PENDING"] = "pendente";
    StockOutputStatus["APPROVED"] = "aprovada";
    StockOutputStatus["IN_PROGRESS"] = "em_processamento";
    StockOutputStatus["COMPLETED"] = "concluida";
    StockOutputStatus["CANCELLED"] = "cancelada";
})(StockOutputStatus || (exports.StockOutputStatus = StockOutputStatus = {}));
var BatchStatus;
(function (BatchStatus) {
    BatchStatus["AVAILABLE"] = "disponivel";
    BatchStatus["RESERVED"] = "reservado";
    BatchStatus["BLOCKED"] = "bloqueado";
    BatchStatus["EXPIRED"] = "vencido";
    BatchStatus["CONSUMED"] = "consumido";
})(BatchStatus || (exports.BatchStatus = BatchStatus = {}));
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "estoque_baixo";
    AlertType["EXPIRY_WARNING"] = "alerta_vencimento";
    AlertType["EXPIRED"] = "vencido";
    AlertType["CONSUMPTION_ANOMALY"] = "anomalia_consumo";
    AlertType["COST_ALERT"] = "alerta_custo";
    AlertType["FIFO_VIOLATION"] = "violacao_fifo";
})(AlertType || (exports.AlertType = AlertType = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pendente";
    TransferStatus["APPROVED"] = "aprovada";
    TransferStatus["IN_TRANSIT"] = "em_transito";
    TransferStatus["RECEIVED"] = "recebida";
    TransferStatus["CANCELLED"] = "cancelada";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));

"use strict";
// Stock Management Types - Enhanced with QA Best Practices
// Implementation of Story 11.4: Alertas e Relatórios de Estoque
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.THRESHOLD_UNIT_LABELS = exports.ALERT_TYPE_LABELS = exports.SEVERITY_LABELS = exports.NOTIFICATION_CHANNEL_LABELS = exports.STOCK_REPORT_TYPES = exports.DEFAULT_NOTIFICATION_CHANNELS = exports.ALERT_SEVERITY_PRIORITY = exports.StockReportError = exports.StockAlertError = exports.CustomStockReportSchema = exports.StockAlertSchema = exports.StockAlertConfigSchema = void 0;
var zod_1 = require("zod");
// ============================================================================
// VALIDATION SCHEMAS (QA Recommendation: Input validation using Zod)
// ============================================================================
exports.StockAlertConfigSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    clinicId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    alertType: zod_1.z.enum(['low_stock', 'expiring', 'expired', 'overstock']),
    thresholdValue: zod_1.z.number().positive(),
    thresholdUnit: zod_1.z.enum(['quantity', 'days', 'percentage']),
    severityLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    isActive: zod_1.z.boolean().default(true),
    notificationChannels: zod_1.z.array(zod_1.z.enum(['in_app', 'email', 'whatsapp', 'sms'])),
});
exports.StockAlertSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid(),
    alertConfigId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    alertType: zod_1.z.string(),
    severityLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    currentValue: zod_1.z.number(),
    thresholdValue: zod_1.z.number().positive(),
    message: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'acknowledged', 'resolved']),
    acknowledgedBy: zod_1.z.string().uuid().optional(),
    acknowledgedAt: zod_1.z.date().optional(),
    resolvedAt: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
});
exports.CustomStockReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    clinicId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    reportName: zod_1.z.string().min(1).max(200),
    reportType: zod_1.z.enum(['consumption', 'valuation', 'movement', 'custom']),
    filters: zod_1.z.object({
        dateRange: zod_1.z.object({
            start: zod_1.z.date(),
            end: zod_1.z.date(),
        }).optional(),
        productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        supplierId: zod_1.z.string().uuid().optional(),
        costCenterId: zod_1.z.string().uuid().optional(),
        customFilters: zod_1.z.record(zod_1.z.unknown()).optional(),
    }),
    scheduleConfig: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly']),
        dayOfWeek: zod_1.z.number().min(0).max(6).optional(),
        dayOfMonth: zod_1.z.number().min(1).max(31).optional(),
        time: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        recipients: zod_1.z.array(zod_1.z.string().email()),
    }).optional(),
    isActive: zod_1.z.boolean().default(true),
});
// ============================================================================
// ERROR TYPES (QA Recommendation: Proper error handling)
// ============================================================================
var StockAlertError = /** @class */ (function (_super) {
    __extends(StockAlertError, _super);
    function StockAlertError(message, code, context) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.context = context;
        _this.name = 'StockAlertError';
        return _this;
    }
    return StockAlertError;
}(Error));
exports.StockAlertError = StockAlertError;
var StockReportError = /** @class */ (function (_super) {
    __extends(StockReportError, _super);
    function StockReportError(message, code, context) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.context = context;
        _this.name = 'StockReportError';
        return _this;
    }
    return StockReportError;
}(Error));
exports.StockReportError = StockReportError;
// ============================================================================
// CONSTANTS
// ============================================================================
exports.ALERT_SEVERITY_PRIORITY = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
};
exports.DEFAULT_NOTIFICATION_CHANNELS = ['in_app', 'email'];
exports.STOCK_REPORT_TYPES = {
    consumption: 'Relatório de Consumo',
    valuation: 'Relatório de Valorização',
    movement: 'Relatório de Movimentação',
    expiration: 'Relatório de Vencimentos',
    performance: 'Métricas de Performance',
    custom: 'Relatório Personalizado',
};
exports.NOTIFICATION_CHANNEL_LABELS = {
    in_app: 'Notificação no App',
    email: 'E-mail',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
};
exports.SEVERITY_LABELS = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
};
exports.ALERT_TYPE_LABELS = {
    low_stock: 'Estoque Baixo',
    expiring: 'Vencendo',
    expired: 'Vencido',
    overstock: 'Excesso de Estoque',
};
exports.THRESHOLD_UNIT_LABELS = {
    quantity: 'Quantidade',
    days: 'Dias',
    percentage: 'Porcentagem',
};

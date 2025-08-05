"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_IDS = exports.client = void 0;
var sdk_1 = require("@trigger.dev/sdk");
// Cliente Trigger.dev configurado para NeonPro
exports.client = new sdk_1.TriggerClient({
    id: "neonpro-clinic-automation",
    apiKey: process.env.TRIGGER_SECRET_KEY,
    apiUrl: process.env.TRIGGER_API_URL || "https://api.trigger.dev",
    verbose: process.env.NODE_ENV === "development",
});
// Job categories para organização
exports.JOB_IDS = {
    // Email automation (impacto imediato)
    APPOINTMENT_CONFIRMATION: "appointment-confirmation-email",
    APPOINTMENT_REMINDER: "appointment-reminder-email",
    INVOICE_EMAIL: "invoice-email-delivery",
    PAYMENT_REMINDER: "payment-reminder-email",
    // Notification jobs (engage pacientes)
    WHATSAPP_REMINDER: "whatsapp-appointment-reminder",
    PUSH_NOTIFICATION: "push-notification-send",
    // Financial automation (relatórios automáticos)
    DAILY_FINANCIAL_REPORT: "daily-financial-report",
    WEEKLY_CASH_FLOW: "weekly-cash-flow-report",
    MONTHLY_BILLING_SUMMARY: "monthly-billing-summary",
    // Stock & inventory (já tem base no projeto)
    STOCK_ALERT_CHECK: "stock-alert-check",
    INVENTORY_REPORT: "inventory-status-report",
    // Data processing (otimizações)
    PATIENT_DATA_SYNC: "patient-data-synchronization",
    APPOINTMENT_ANALYTICS: "appointment-analytics-processing",
};

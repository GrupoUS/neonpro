"use strict";
// Types for NeonPro Billing and Payment System
// Task 7: Sistema de Faturamento e Pagamentos
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCOUNT_TYPES = exports.PAYMENT_STATUSES = exports.PAYMENT_METHODS = exports.INVOICE_STATUSES = exports.SERVICE_TYPES = void 0;
// =====================================================
// CONSTANTS
// =====================================================
exports.SERVICE_TYPES = [
    { value: "consultation", label: "Consulta" },
    { value: "treatment", label: "Tratamento" },
    { value: "procedure", label: "Procedimento" },
    { value: "package", label: "Pacote" },
    { value: "maintenance", label: "Manutenção" },
];
exports.INVOICE_STATUSES = [
    { value: "draft", label: "Rascunho", color: "gray" },
    { value: "pending", label: "Pendente", color: "yellow" },
    { value: "paid", label: "Paga", color: "green" },
    { value: "overdue", label: "Vencida", color: "red" },
    { value: "cancelled", label: "Cancelada", color: "gray" },
    { value: "refunded", label: "Reembolsada", color: "blue" },
];
exports.PAYMENT_METHODS = [
    { value: "cash", label: "Dinheiro", icon: "💵" },
    { value: "debit_card", label: "Cartão de Débito", icon: "💳" },
    { value: "credit_card", label: "Cartão de Crédito", icon: "💳" },
    { value: "pix", label: "PIX", icon: "🔄" },
    { value: "bank_transfer", label: "Transferência", icon: "🏦" },
    { value: "installments", label: "Parcelado", icon: "📊" },
    { value: "insurance", label: "Convênio", icon: "🛡️" },
];
exports.PAYMENT_STATUSES = [
    { value: "pending", label: "Pendente", color: "yellow" },
    { value: "processing", label: "Processando", color: "blue" },
    { value: "completed", label: "Concluído", color: "green" },
    { value: "failed", label: "Falhou", color: "red" },
    { value: "refunded", label: "Reembolsado", color: "purple" },
    { value: "cancelled", label: "Cancelado", color: "gray" },
];
exports.DISCOUNT_TYPES = [
    { value: "percentage", label: "Percentual (%)" },
    { value: "fixed_amount", label: "Valor Fixo (R$)" },
    { value: "promotional", label: "Promocional" },
    { value: "loyalty", label: "Fidelidade" },
    { value: "insurance_covered", label: "Coberto pelo Convênio" },
];

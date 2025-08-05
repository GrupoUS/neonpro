"use strict";
// Cash Flow Validation Schemas
// Using Zod for type-safe validation following Context7 patterns
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationSchema = exports.CashFlowFiltersSchema = exports.CashRegisterSchema = exports.CashFlowEntrySchema = exports.PaymentMethodSchema = exports.CategorySchema = exports.TransactionTypeSchema = void 0;
exports.validateCashFlowEntry = validateCashFlowEntry;
exports.validateCashRegister = validateCashRegister;
exports.validateCashFlowFilters = validateCashFlowFilters;
exports.validateReconciliation = validateReconciliation;
var zod_1 = require("zod");
// Transaction types enum
exports.TransactionTypeSchema = zod_1.z.enum([
    'receipt',
    'payment',
    'transfer',
    'adjustment',
    'opening_balance',
    'closing_balance'
]);
// Categories enum
exports.CategorySchema = zod_1.z.enum([
    'service_payment',
    'product_sale',
    'expense',
    'tax',
    'fee',
    'refund',
    'other'
]);
// Payment methods enum
exports.PaymentMethodSchema = zod_1.z.enum([
    'cash',
    'credit_card',
    'debit_card',
    'pix',
    'bank_transfer',
    'check',
    'other'
]);
// Cash flow entry validation schema
exports.CashFlowEntrySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid('Invalid clinic ID'),
    register_id: zod_1.z.string().uuid('Invalid register ID').optional(),
    transaction_type: exports.TransactionTypeSchema,
    category: exports.CategorySchema,
    amount: zod_1.z.number()
        .positive('Amount must be positive')
        .max(999999999, 'Amount too large')
        .refine(function (val) { return Number.isFinite(val); }, 'Amount must be a valid number'),
    currency: zod_1.z.string().default('BRL'),
    description: zod_1.z.string()
        .min(1, 'Description is required')
        .max(500, 'Description too long'),
    reference_number: zod_1.z.string().optional(),
    payment_method: exports.PaymentMethodSchema,
    related_appointment_id: zod_1.z.string().uuid().optional(),
    related_patient_id: zod_1.z.string().uuid().optional(),
    created_by: zod_1.z.string().uuid('Invalid user ID'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.CashRegisterSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid('Invalid clinic ID'),
    register_name: zod_1.z.string()
        .min(1, 'Register name is required')
        .max(100, 'Register name too long'),
    register_code: zod_1.z.string()
        .min(1, 'Register code is required')
        .max(20, 'Register code too long'),
    location: zod_1.z.string()
        .min(1, 'Location is required')
        .max(200, 'Location too long'),
    responsible_user_id: zod_1.z.string().uuid('Invalid user ID'),
    opening_balance: zod_1.z.number()
        .min(0, 'Opening balance cannot be negative')
        .max(999999999, 'Opening balance too large'),
    is_active: zod_1.z.boolean().default(true)
});
// Cash flow filters validation schema
exports.CashFlowFiltersSchema = zod_1.z.object({
    // Using z.string().date() to accept YYYY-MM-DD date strings following Zod best practices
    dateFrom: zod_1.z.string().date().optional(),
    dateTo: zod_1.z.string().date().optional(),
    registerId: zod_1.z.string().uuid().optional(),
    transactionType: exports.TransactionTypeSchema.optional(),
    category: exports.CategorySchema.optional(),
    paymentMethod: exports.PaymentMethodSchema.optional(),
    isReconciled: zod_1.z.boolean().optional(),
    search: zod_1.z.string().max(200).optional()
}).refine(function (data) {
    // For YYYY-MM-DD format strings, we can use string comparison
    // This avoids Jest Date parsing issues and is more efficient
    return !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo;
}, {
    message: "Start date must be before end date",
    path: ["dateTo"]
});
// Reconciliation validation schema
exports.ReconciliationSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid('Invalid clinic ID'),
    register_id: zod_1.z.string().uuid().optional(),
    reconciliation_date: zod_1.z.string().datetime(),
    period_start: zod_1.z.string().datetime(),
    period_end: zod_1.z.string().datetime(),
    payment_gateway: zod_1.z.string().optional(),
    expected_amount: zod_1.z.number().min(0),
    actual_amount: zod_1.z.number().min(0),
    notes: zod_1.z.string().max(1000).optional(),
    created_by: zod_1.z.string().uuid('Invalid user ID')
}).refine(function (data) { return new Date(data.period_start) <= new Date(data.period_end); }, {
    message: "Period start must be before period end",
    path: ["period_end"]
});
// Validation helper functions
function validateCashFlowEntry(data) {
    return exports.CashFlowEntrySchema.safeParse(data);
}
function validateCashRegister(data) {
    return exports.CashRegisterSchema.safeParse(data);
}
function validateCashFlowFilters(data) {
    return exports.CashFlowFiltersSchema.safeParse(data);
}
function validateReconciliation(data) {
    return exports.ReconciliationSchema.safeParse(data);
}

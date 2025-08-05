"use strict";
/**
 * Financial Management Validation Schemas
 * Created: January 27, 2025
 * Purpose: Zod validation schemas for invoice and payment data
 * Standards: Brazilian NFSe compliance + Shadow validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialValidationSchemas = exports.parseCurrencyToCentavos = exports.formatCurrency = exports.centavosToReais = exports.reaisToCentavos = exports.validateCpf = exports.validateCnpj = exports.validateUuid = exports.validatePositiveAmount = exports.validateAmount = exports.paymentQuerySchema = exports.invoiceQuerySchema = exports.paginationSchema = exports.paymentReminderSchema = exports.shadowValidationSchema = exports.paymentReportFiltersSchema = exports.invoiceReportFiltersSchema = exports.paymentProcessingRequestSchema = exports.nfseRequestSchema = exports.updatePaymentSchema = exports.createPaymentSchema = exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
var zod_1 = require("zod");
// Constants for validation
var MAX_AMOUNT = 999999999; // 9.999.999,99 BRL in centavos
var MIN_AMOUNT = 0;
var MAX_DESCRIPTION_LENGTH = 500;
var MAX_INVOICE_ITEMS = 100;
var MAX_INSTALLMENTS = 60;
// Utility schemas
var amountSchema = zod_1.z.number()
    .int('Amount must be an integer (in centavos)')
    .min(MIN_AMOUNT, 'Amount cannot be negative')
    .max(MAX_AMOUNT, 'Amount exceeds maximum allowed value');
var positiveAmountSchema = zod_1.z.number()
    .int('Amount must be an integer (in centavos)')
    .min(1, 'Amount must be greater than zero')
    .max(MAX_AMOUNT, 'Amount exceeds maximum allowed value');
var uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
var cnpjSchema = zod_1.z.string()
    .regex(/^\d{14}$/, 'CNPJ must have exactly 14 digits')
    .refine(function (cnpj) {
    // Basic CNPJ validation (simplified)
    if (cnpj.length !== 14)
        return false;
    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{13}$/.test(cnpj))
        return false;
    return true;
}, 'Invalid CNPJ format');
var cpfSchema = zod_1.z.string()
    .regex(/^\d{11}$/, 'CPF must have exactly 11 digits')
    .refine(function (cpf) {
    // Basic CPF validation (simplified)
    if (cpf.length !== 11)
        return false;
    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cpf))
        return false;
    return true;
}, 'Invalid CPF format');
var serviceCodeSchema = zod_1.z.string()
    .regex(/^\d{2,10}$/, 'Service code must be 2-10 digits')
    .optional();
var pixKeySchema = zod_1.z.string()
    .min(1, 'PIX key cannot be empty')
    .max(77, 'PIX key exceeds maximum length')
    .optional();
// Enum validations
var invoiceStatusSchema = zod_1.z.enum(['draft', 'issued', 'sent', 'paid', 'cancelled', 'overdue']);
var paymentStatusSchema = zod_1.z.enum(['pending', 'partial', 'paid', 'overdue', 'cancelled']);
var nfseStatusSchema = zod_1.z.enum(['pending', 'issued', 'cancelled', 'rejected']);
var paymentMethodSchema = zod_1.z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'financing', 'installment']);
var paymentProcessingStatusSchema = zod_1.z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']);
var installmentStatusSchema = zod_1.z.enum(['pending', 'paid', 'overdue', 'cancelled']);
var shadowValidationStatusSchema = zod_1.z.enum(['pending', 'validated', 'failed']);
var shadowOperationTypeSchema = zod_1.z.enum(['invoice_calculation', 'payment_processing', 'tax_calculation', 'installment_calculation']);
var reminderTypeSchema = zod_1.z.enum(['pre_due', 'due', 'overdue', 'final_notice']);
var deliveryMethodSchema = zod_1.z.enum(['email', 'sms', 'whatsapp', 'phone']);
var reminderStatusSchema = zod_1.z.enum(['pending', 'sent', 'delivered', 'failed', 'cancelled']);
// Address validation
var addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Street is required').max(100, 'Street too long'),
    number: zod_1.z.string().min(1, 'Number is required').max(20, 'Number too long'),
    complement: zod_1.z.string().max(50, 'Complement too long').optional(),
    neighborhood: zod_1.z.string().min(1, 'Neighborhood is required').max(50, 'Neighborhood too long'),
    city: zod_1.z.string().min(1, 'City is required').max(50, 'City too long'),
    state: zod_1.z.string().regex(/^[A-Z]{2}$/, 'State must be 2 uppercase letters'),
    zip_code: zod_1.z.string().regex(/^\d{8}$/, 'ZIP code must have exactly 8 digits'),
});
// Invoice Item validation
var createInvoiceItemSchema = zod_1.z.object({
    description: zod_1.z.string()
        .min(1, 'Description is required')
        .max(MAX_DESCRIPTION_LENGTH, "Description cannot exceed ".concat(MAX_DESCRIPTION_LENGTH, " characters")),
    quantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .max(999999, 'Quantity exceeds maximum allowed'),
    unit_price: zod_1.z.number()
        .min(0, 'Unit price cannot be negative')
        .max(MAX_AMOUNT / 100, 'Unit price exceeds maximum allowed'), // Convert from reais to centavos limit
    discount_amount: zod_1.z.number()
        .min(0, 'Discount cannot be negative')
        .max(MAX_AMOUNT / 100, 'Discount exceeds maximum allowed')
        .default(0),
    treatment_plan_id: uuidSchema.optional(),
    procedure_id: uuidSchema.optional(),
    service_code: serviceCodeSchema,
    tax_rate: zod_1.z.number()
        .min(0, 'Tax rate cannot be negative')
        .max(1, 'Tax rate cannot exceed 100%')
        .default(0),
}).refine(function (data) {
    // Discount cannot be greater than unit price * quantity
    var itemTotal = data.unit_price * data.quantity;
    return data.discount_amount <= itemTotal;
}, {
    message: 'Discount cannot be greater than item total',
    path: ['discount_amount'],
});
// Invoice validation
exports.createInvoiceSchema = zod_1.z.object({
    patient_id: uuidSchema,
    clinic_id: uuidSchema,
    professional_id: uuidSchema.optional(),
    description: zod_1.z.string()
        .min(1, 'Description is required')
        .max(MAX_DESCRIPTION_LENGTH, "Description cannot exceed ".concat(MAX_DESCRIPTION_LENGTH, " characters")),
    service_list_code: serviceCodeSchema,
    due_date: zod_1.z.string()
        .datetime('Invalid due date format')
        .optional()
        .refine(function (date) {
        if (!date)
            return true;
        return new Date(date) > new Date();
    }, 'Due date must be in the future'),
    items: zod_1.z.array(createInvoiceItemSchema)
        .min(1, 'At least one item is required')
        .max(MAX_INVOICE_ITEMS, "Cannot have more than ".concat(MAX_INVOICE_ITEMS, " items")),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
}).refine(function (data) {
    // Calculate total and validate it's reasonable
    var total = data.items.reduce(function (sum, item) {
        return sum + (item.unit_price * item.quantity) - item.discount_amount;
    }, 0);
    return total > 0;
}, {
    message: 'Invoice total must be greater than zero',
    path: ['items'],
});
exports.updateInvoiceSchema = zod_1.z.object({
    description: zod_1.z.string()
        .min(1, 'Description is required')
        .max(MAX_DESCRIPTION_LENGTH, "Description cannot exceed ".concat(MAX_DESCRIPTION_LENGTH, " characters"))
        .optional(),
    service_list_code: serviceCodeSchema,
    due_date: zod_1.z.string()
        .datetime('Invalid due date format')
        .optional()
        .refine(function (date) {
        if (!date)
            return true;
        return new Date(date) > new Date();
    }, 'Due date must be in the future'),
    status: invoiceStatusSchema.optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Installment validation
var createInstallmentSchema = zod_1.z.object({
    installment_number: zod_1.z.number()
        .int('Installment number must be an integer')
        .min(1, 'Installment number must be at least 1'),
    total_installments: zod_1.z.number()
        .int('Total installments must be an integer')
        .min(1, 'Total installments must be at least 1')
        .max(MAX_INSTALLMENTS, "Cannot have more than ".concat(MAX_INSTALLMENTS, " installments")),
    amount: zod_1.z.number()
        .positive('Installment amount must be positive')
        .max(MAX_AMOUNT / 100, 'Installment amount exceeds maximum allowed'),
    due_date: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
        .refine(function (date) {
        return new Date(date) > new Date();
    }, 'Due date must be in the future'),
}).refine(function (data) {
    return data.installment_number <= data.total_installments;
}, {
    message: 'Installment number cannot exceed total installments',
    path: ['installment_number'],
});
// Payment validation
exports.createPaymentSchema = zod_1.z.object({
    invoice_id: uuidSchema,
    payment_method: paymentMethodSchema,
    amount: zod_1.z.number()
        .positive('Payment amount must be positive')
        .max(MAX_AMOUNT / 100, 'Payment amount exceeds maximum allowed'),
    external_transaction_id: zod_1.z.string().max(100, 'Transaction ID too long').optional(),
    payment_processor: zod_1.z.string().max(50, 'Payment processor name too long').optional(),
    authorization_code: zod_1.z.string().max(100, 'Authorization code too long').optional(),
    pix_key: pixKeySchema,
    installments: zod_1.z.array(createInstallmentSchema)
        .max(MAX_INSTALLMENTS, "Cannot have more than ".concat(MAX_INSTALLMENTS, " installments"))
        .optional(),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
}).refine(function (data) {
    // If payment method is installment, installments array is required
    if (data.payment_method === 'installment') {
        return data.installments && data.installments.length > 0;
    }
    return true;
}, {
    message: 'Installments required for installment payment method',
    path: ['installments'],
}).refine(function (data) {
    // If installments are provided, validate total amount matches
    if (data.installments && data.installments.length > 0) {
        var installmentTotal = data.installments.reduce(function (sum, inst) { return sum + inst.amount; }, 0);
        return Math.abs(installmentTotal - data.amount) < 0.01; // Allow small rounding differences
    }
    return true;
}, {
    message: 'Total installment amount must equal payment amount',
    path: ['installments'],
}).refine(function (data) {
    // PIX key required for PIX payment method
    if (data.payment_method === 'pix') {
        return data.pix_key && data.pix_key.length > 0;
    }
    return true;
}, {
    message: 'PIX key required for PIX payment method',
    path: ['pix_key'],
});
exports.updatePaymentSchema = zod_1.z.object({
    status: paymentProcessingStatusSchema.optional(),
    external_transaction_id: zod_1.z.string().max(100, 'Transaction ID too long').optional(),
    authorization_code: zod_1.z.string().max(100, 'Authorization code too long').optional(),
    processing_fee: zod_1.z.number()
        .min(0, 'Processing fee cannot be negative')
        .max(MAX_AMOUNT / 100, 'Processing fee exceeds maximum allowed')
        .optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// NFSe validation
exports.nfseRequestSchema = zod_1.z.object({
    invoice_id: uuidSchema,
    service_code: zod_1.z.string()
        .regex(/^\d{2,10}$/, 'Service code must be 2-10 digits'),
    service_description: zod_1.z.string()
        .min(1, 'Service description is required')
        .max(MAX_DESCRIPTION_LENGTH, 'Service description too long'),
    service_amount: positiveAmountSchema,
    tax_amount: amountSchema,
    issuer_cnpj: cnpjSchema,
    taker_cpf_cnpj: zod_1.z.string()
        .refine(function (value) {
        // Can be either CPF (11 digits) or CNPJ (14 digits)
        return /^\d{11}$/.test(value) || /^\d{14}$/.test(value);
    }, 'Must be a valid CPF (11 digits) or CNPJ (14 digits)'),
    taker_name: zod_1.z.string()
        .min(1, 'Taker name is required')
        .max(100, 'Taker name too long'),
    taker_address: addressSchema,
});
// Payment processing validation
exports.paymentProcessingRequestSchema = zod_1.z.object({
    payment_method: paymentMethodSchema,
    amount: positiveAmountSchema,
    currency: zod_1.z.literal('BRL'),
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
        email: zod_1.z.string().email('Invalid email format').optional(),
        phone: zod_1.z.string()
            .regex(/^\+?55\d{10,11}$/, 'Invalid Brazilian phone number format')
            .optional(),
        cpf: cpfSchema.optional(),
        address: addressSchema.optional(),
    }),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
});
// Report filter validation
exports.invoiceReportFiltersSchema = zod_1.z.object({
    clinic_id: uuidSchema.optional(),
    patient_id: uuidSchema.optional(),
    professional_id: uuidSchema.optional(),
    status: zod_1.z.array(invoiceStatusSchema).optional(),
    payment_status: zod_1.z.array(paymentStatusSchema).optional(),
    date_from: zod_1.z.string().datetime('Invalid date format').optional(),
    date_to: zod_1.z.string().datetime('Invalid date format').optional(),
    amount_min: zod_1.z.number().min(0, 'Minimum amount cannot be negative').optional(),
    amount_max: zod_1.z.number().min(0, 'Maximum amount cannot be negative').optional(),
    nfse_status: zod_1.z.array(nfseStatusSchema).optional(),
}).refine(function (data) {
    // date_to must be after date_from
    if (data.date_from && data.date_to) {
        return new Date(data.date_to) >= new Date(data.date_from);
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['date_to'],
}).refine(function (data) {
    // amount_max must be greater than amount_min
    if (data.amount_min !== undefined && data.amount_max !== undefined) {
        return data.amount_max >= data.amount_min;
    }
    return true;
}, {
    message: 'Maximum amount must be greater than minimum amount',
    path: ['amount_max'],
});
exports.paymentReportFiltersSchema = zod_1.z.object({
    clinic_id: uuidSchema.optional(),
    invoice_id: uuidSchema.optional(),
    payment_method: zod_1.z.array(paymentMethodSchema).optional(),
    status: zod_1.z.array(paymentProcessingStatusSchema).optional(),
    date_from: zod_1.z.string().datetime('Invalid date format').optional(),
    date_to: zod_1.z.string().datetime('Invalid date format').optional(),
    amount_min: zod_1.z.number().min(0, 'Minimum amount cannot be negative').optional(),
    amount_max: zod_1.z.number().min(0, 'Maximum amount cannot be negative').optional(),
}).refine(function (data) {
    // date_to must be after date_from
    if (data.date_from && data.date_to) {
        return new Date(data.date_to) >= new Date(data.date_from);
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['date_to'],
}).refine(function (data) {
    // amount_max must be greater than amount_min
    if (data.amount_min !== undefined && data.amount_max !== undefined) {
        return data.amount_max >= data.amount_min;
    }
    return true;
}, {
    message: 'Maximum amount must be greater than minimum amount',
    path: ['amount_max'],
});
// Shadow validation
exports.shadowValidationSchema = zod_1.z.object({
    operation_type: shadowOperationTypeSchema,
    reference_id: uuidSchema,
    reference_table: zod_1.z.string().min(1, 'Reference table is required'),
    original_calculation: zod_1.z.record(zod_1.z.any()),
    shadow_calculation: zod_1.z.record(zod_1.z.any()),
    tolerance_absolute: zod_1.z.number().min(0, 'Tolerance cannot be negative').default(0.01),
    tolerance_percentage: zod_1.z.number().min(0, 'Tolerance cannot be negative').default(0.001),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
});
// Payment reminder validation
exports.paymentReminderSchema = zod_1.z.object({
    invoice_id: uuidSchema,
    installment_id: uuidSchema.optional(),
    reminder_type: reminderTypeSchema,
    days_before_due: zod_1.z.number().int().min(0, 'Days before due cannot be negative').default(0),
    days_after_due: zod_1.z.number().int().min(0, 'Days after due cannot be negative').default(0),
    delivery_method: deliveryMethodSchema,
    recipient_contact: zod_1.z.string()
        .min(1, 'Recipient contact is required')
        .max(100, 'Recipient contact too long'),
    subject: zod_1.z.string().max(200, 'Subject too long').optional(),
    message: zod_1.z.string().max(1000, 'Message too long').optional(),
});
// Pagination validation
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});
// Query parameter validation for API endpoints
exports.invoiceQuerySchema = zod_1.z.object({
    clinic_id: uuidSchema.optional(),
    patient_id: uuidSchema.optional(),
    status: zod_1.z.string().optional(),
    payment_status: zod_1.z.string().optional(),
    search: zod_1.z.string().max(100, 'Search term too long').optional(),
    sort: zod_1.z.enum(['created_at', 'issue_date', 'due_date', 'total_amount', 'invoice_number']).default('created_at'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
}).merge(exports.paginationSchema);
exports.paymentQuerySchema = zod_1.z.object({
    invoice_id: uuidSchema.optional(),
    payment_method: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    search: zod_1.z.string().max(100, 'Search term too long').optional(),
    sort: zod_1.z.enum(['created_at', 'processed_at', 'amount']).default('created_at'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
}).merge(exports.paginationSchema);
// Utility validation functions
var validateAmount = function (amount, fieldName) {
    if (fieldName === void 0) { fieldName = 'amount'; }
    return amountSchema.parse(amount);
};
exports.validateAmount = validateAmount;
var validatePositiveAmount = function (amount, fieldName) {
    if (fieldName === void 0) { fieldName = 'amount'; }
    return positiveAmountSchema.parse(amount);
};
exports.validatePositiveAmount = validatePositiveAmount;
var validateUuid = function (id, fieldName) {
    if (fieldName === void 0) { fieldName = 'id'; }
    return uuidSchema.parse(id);
};
exports.validateUuid = validateUuid;
var validateCnpj = function (cnpj) {
    return cnpjSchema.parse(cnpj);
};
exports.validateCnpj = validateCnpj;
var validateCpf = function (cpf) {
    return cpfSchema.parse(cpf);
};
exports.validateCpf = validateCpf;
// Convert reais to centavos for storage
var reaisToCentavos = function (reais) {
    return Math.round(reais * 100);
};
exports.reaisToCentavos = reaisToCentavos;
// Convert centavos to reais for display
var centavosToReais = function (centavos) {
    return centavos / 100;
};
exports.centavosToReais = centavosToReais;
// Format currency for display
var formatCurrency = function (centavos, currency) {
    if (currency === void 0) { currency = 'BRL'; }
    var reais = (0, exports.centavosToReais)(centavos);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(reais);
};
exports.formatCurrency = formatCurrency;
// Parse currency string to centavos
var parseCurrencyToCentavos = function (currencyString) {
    // Remove currency symbols and convert to number
    var cleaned = currencyString.replace(/[R$\s.]/g, '').replace(',', '.');
    var reais = parseFloat(cleaned);
    if (isNaN(reais)) {
        throw new Error('Invalid currency format');
    }
    return (0, exports.reaisToCentavos)(reais);
};
exports.parseCurrencyToCentavos = parseCurrencyToCentavos;
// Export all schemas
exports.financialValidationSchemas = {
    createInvoice: exports.createInvoiceSchema,
    updateInvoice: exports.updateInvoiceSchema,
    createPayment: exports.createPaymentSchema,
    updatePayment: exports.updatePaymentSchema,
    nfseRequest: exports.nfseRequestSchema,
    paymentProcessingRequest: exports.paymentProcessingRequestSchema,
    invoiceReportFilters: exports.invoiceReportFiltersSchema,
    paymentReportFilters: exports.paymentReportFiltersSchema,
    shadowValidation: exports.shadowValidationSchema,
    paymentReminder: exports.paymentReminderSchema,
    pagination: exports.paginationSchema,
    invoiceQuery: exports.invoiceQuerySchema,
    paymentQuery: exports.paymentQuerySchema,
};
exports.default = exports.financialValidationSchemas;

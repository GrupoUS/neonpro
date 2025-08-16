/**
 * Financial Management Validation Schemas
 * Created: January 27, 2025
 * Purpose: Zod validation schemas for invoice and payment data
 * Standards: Brazilian NFSe compliance + Shadow validation
 */

import { z } from 'zod';

// Constants for validation
const MAX_AMOUNT = 999_999_999; // 9.999.999,99 BRL in centavos
const MIN_AMOUNT = 0;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INVOICE_ITEMS = 100;
const MAX_INSTALLMENTS = 60;

// Utility schemas
const amountSchema = z
  .number()
  .int('Amount must be an integer (in centavos)')
  .min(MIN_AMOUNT, 'Amount cannot be negative')
  .max(MAX_AMOUNT, 'Amount exceeds maximum allowed value');

const positiveAmountSchema = z
  .number()
  .int('Amount must be an integer (in centavos)')
  .min(1, 'Amount must be greater than zero')
  .max(MAX_AMOUNT, 'Amount exceeds maximum allowed value');

const uuidSchema = z.string().uuid('Invalid UUID format');

const cnpjSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ must have exactly 14 digits')
  .refine((cnpj) => {
    // Basic CNPJ validation (simplified)
    if (cnpj.length !== 14) {
      return false;
    }

    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    return true;
  }, 'Invalid CNPJ format');

const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, 'CPF must have exactly 11 digits')
  .refine((cpf) => {
    // Basic CPF validation (simplified)
    if (cpf.length !== 11) {
      return false;
    }

    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    return true;
  }, 'Invalid CPF format');

const serviceCodeSchema = z
  .string()
  .regex(/^\d{2,10}$/, 'Service code must be 2-10 digits')
  .optional();

const pixKeySchema = z
  .string()
  .min(1, 'PIX key cannot be empty')
  .max(77, 'PIX key exceeds maximum length')
  .optional();

// Enum validations
const invoiceStatusSchema = z.enum([
  'draft',
  'issued',
  'sent',
  'paid',
  'cancelled',
  'overdue',
]);
const paymentStatusSchema = z.enum([
  'pending',
  'partial',
  'paid',
  'overdue',
  'cancelled',
]);
const nfseStatusSchema = z.enum(['pending', 'issued', 'cancelled', 'rejected']);
const paymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'pix',
  'bank_transfer',
  'financing',
  'installment',
]);
const paymentProcessingStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);
const _installmentStatusSchema = z.enum([
  'pending',
  'paid',
  'overdue',
  'cancelled',
]);
const _shadowValidationStatusSchema = z.enum([
  'pending',
  'validated',
  'failed',
]);
const shadowOperationTypeSchema = z.enum([
  'invoice_calculation',
  'payment_processing',
  'tax_calculation',
  'installment_calculation',
]);
const reminderTypeSchema = z.enum([
  'pre_due',
  'due',
  'overdue',
  'final_notice',
]);
const deliveryMethodSchema = z.enum(['email', 'sms', 'whatsapp', 'phone']);
const _reminderStatusSchema = z.enum([
  'pending',
  'sent',
  'delivered',
  'failed',
  'cancelled',
]);

// Address validation
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(100, 'Street too long'),
  number: z.string().min(1, 'Number is required').max(20, 'Number too long'),
  complement: z.string().max(50, 'Complement too long').optional(),
  neighborhood: z
    .string()
    .min(1, 'Neighborhood is required')
    .max(50, 'Neighborhood too long'),
  city: z.string().min(1, 'City is required').max(50, 'City too long'),
  state: z.string().regex(/^[A-Z]{2}$/, 'State must be 2 uppercase letters'),
  zip_code: z.string().regex(/^\d{8}$/, 'ZIP code must have exactly 8 digits'),
});

// Invoice Item validation
const createInvoiceItemSchema = z
  .object({
    description: z
      .string()
      .min(1, 'Description is required')
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      ),
    quantity: z
      .number()
      .positive('Quantity must be positive')
      .max(999_999, 'Quantity exceeds maximum allowed'),
    unit_price: z
      .number()
      .min(0, 'Unit price cannot be negative')
      .max(MAX_AMOUNT / 100, 'Unit price exceeds maximum allowed'), // Convert from reais to centavos limit
    discount_amount: z
      .number()
      .min(0, 'Discount cannot be negative')
      .max(MAX_AMOUNT / 100, 'Discount exceeds maximum allowed')
      .default(0),
    treatment_plan_id: uuidSchema.optional(),
    procedure_id: uuidSchema.optional(),
    service_code: serviceCodeSchema,
    tax_rate: z
      .number()
      .min(0, 'Tax rate cannot be negative')
      .max(1, 'Tax rate cannot exceed 100%')
      .default(0),
  })
  .refine(
    (data) => {
      // Discount cannot be greater than unit price * quantity
      const itemTotal = data.unit_price * data.quantity;
      return data.discount_amount <= itemTotal;
    },
    {
      message: 'Discount cannot be greater than item total',
      path: ['discount_amount'],
    },
  );

// Invoice validation
export const createInvoiceSchema = z
  .object({
    patient_id: uuidSchema,
    clinic_id: uuidSchema,
    professional_id: uuidSchema.optional(),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      ),
    service_list_code: serviceCodeSchema,
    due_date: z
      .string()
      .datetime('Invalid due date format')
      .optional()
      .refine((date) => {
        if (!date) {
          return true;
        }
        return new Date(date) > new Date();
      }, 'Due date must be in the future'),
    items: z
      .array(createInvoiceItemSchema)
      .min(1, 'At least one item is required')
      .max(
        MAX_INVOICE_ITEMS,
        `Cannot have more than ${MAX_INVOICE_ITEMS} items`,
      ),
    metadata: z.record(z.any()).default({}),
  })
  .refine(
    (data) => {
      // Calculate total and validate it's reasonable
      const total = data.items.reduce((sum, item) => {
        return sum + item.unit_price * item.quantity - item.discount_amount;
      }, 0);
      return total > 0;
    },
    {
      message: 'Invoice total must be greater than zero',
      path: ['items'],
    },
  );

export const updateInvoiceSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
    )
    .optional(),
  service_list_code: serviceCodeSchema,
  due_date: z
    .string()
    .datetime('Invalid due date format')
    .optional()
    .refine((date) => {
      if (!date) {
        return true;
      }
      return new Date(date) > new Date();
    }, 'Due date must be in the future'),
  status: invoiceStatusSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

// Installment validation
const createInstallmentSchema = z
  .object({
    installment_number: z
      .number()
      .int('Installment number must be an integer')
      .min(1, 'Installment number must be at least 1'),
    total_installments: z
      .number()
      .int('Total installments must be an integer')
      .min(1, 'Total installments must be at least 1')
      .max(
        MAX_INSTALLMENTS,
        `Cannot have more than ${MAX_INSTALLMENTS} installments`,
      ),
    amount: z
      .number()
      .positive('Installment amount must be positive')
      .max(MAX_AMOUNT / 100, 'Installment amount exceeds maximum allowed'),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
      .refine((date) => {
        return new Date(date) > new Date();
      }, 'Due date must be in the future'),
  })
  .refine(
    (data) => {
      return data.installment_number <= data.total_installments;
    },
    {
      message: 'Installment number cannot exceed total installments',
      path: ['installment_number'],
    },
  );

// Payment validation
export const createPaymentSchema = z
  .object({
    invoice_id: uuidSchema,
    payment_method: paymentMethodSchema,
    amount: z
      .number()
      .positive('Payment amount must be positive')
      .max(MAX_AMOUNT / 100, 'Payment amount exceeds maximum allowed'),
    external_transaction_id: z
      .string()
      .max(100, 'Transaction ID too long')
      .optional(),
    payment_processor: z
      .string()
      .max(50, 'Payment processor name too long')
      .optional(),
    authorization_code: z
      .string()
      .max(100, 'Authorization code too long')
      .optional(),
    pix_key: pixKeySchema,
    installments: z
      .array(createInstallmentSchema)
      .max(
        MAX_INSTALLMENTS,
        `Cannot have more than ${MAX_INSTALLMENTS} installments`,
      )
      .optional(),
    metadata: z.record(z.any()).default({}),
  })
  .refine(
    (data) => {
      // If payment method is installment, installments array is required
      if (data.payment_method === 'installment') {
        return data.installments && data.installments.length > 0;
      }
      return true;
    },
    {
      message: 'Installments required for installment payment method',
      path: ['installments'],
    },
  )
  .refine(
    (data) => {
      // If installments are provided, validate total amount matches
      if (data.installments && data.installments.length > 0) {
        const installmentTotal = data.installments.reduce(
          (sum, inst) => sum + inst.amount,
          0,
        );
        return Math.abs(installmentTotal - data.amount) < 0.01; // Allow small rounding differences
      }
      return true;
    },
    {
      message: 'Total installment amount must equal payment amount',
      path: ['installments'],
    },
  )
  .refine(
    (data) => {
      // PIX key required for PIX payment method
      if (data.payment_method === 'pix') {
        return data.pix_key && data.pix_key.length > 0;
      }
      return true;
    },
    {
      message: 'PIX key required for PIX payment method',
      path: ['pix_key'],
    },
  );

export const updatePaymentSchema = z.object({
  status: paymentProcessingStatusSchema.optional(),
  external_transaction_id: z
    .string()
    .max(100, 'Transaction ID too long')
    .optional(),
  authorization_code: z
    .string()
    .max(100, 'Authorization code too long')
    .optional(),
  processing_fee: z
    .number()
    .min(0, 'Processing fee cannot be negative')
    .max(MAX_AMOUNT / 100, 'Processing fee exceeds maximum allowed')
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// NFSe validation
export const nfseRequestSchema = z.object({
  invoice_id: uuidSchema,
  service_code: z
    .string()
    .regex(/^\d{2,10}$/, 'Service code must be 2-10 digits'),
  service_description: z
    .string()
    .min(1, 'Service description is required')
    .max(MAX_DESCRIPTION_LENGTH, 'Service description too long'),
  service_amount: positiveAmountSchema,
  tax_amount: amountSchema,
  issuer_cnpj: cnpjSchema,
  taker_cpf_cnpj: z.string().refine((value) => {
    // Can be either CPF (11 digits) or CNPJ (14 digits)
    return /^\d{11}$/.test(value) || /^\d{14}$/.test(value);
  }, 'Must be a valid CPF (11 digits) or CNPJ (14 digits)'),
  taker_name: z
    .string()
    .min(1, 'Taker name is required')
    .max(100, 'Taker name too long'),
  taker_address: addressSchema,
});

// Payment processing validation
export const paymentProcessingRequestSchema = z.object({
  payment_method: paymentMethodSchema,
  amount: positiveAmountSchema,
  currency: z.literal('BRL'),
  customer: z.object({
    name: z
      .string()
      .min(1, 'Customer name is required')
      .max(100, 'Customer name too long'),
    email: z.string().email('Invalid email format').optional(),
    phone: z
      .string()
      .regex(/^\+?55\d{10,11}$/, 'Invalid Brazilian phone number format')
      .optional(),
    cpf: cpfSchema.optional(),
    address: addressSchema.optional(),
  }),
  metadata: z.record(z.any()).default({}),
});

// Report filter validation
export const invoiceReportFiltersSchema = z
  .object({
    clinic_id: uuidSchema.optional(),
    patient_id: uuidSchema.optional(),
    professional_id: uuidSchema.optional(),
    status: z.array(invoiceStatusSchema).optional(),
    payment_status: z.array(paymentStatusSchema).optional(),
    date_from: z.string().datetime('Invalid date format').optional(),
    date_to: z.string().datetime('Invalid date format').optional(),
    amount_min: z
      .number()
      .min(0, 'Minimum amount cannot be negative')
      .optional(),
    amount_max: z
      .number()
      .min(0, 'Maximum amount cannot be negative')
      .optional(),
    nfse_status: z.array(nfseStatusSchema).optional(),
  })
  .refine(
    (data) => {
      // date_to must be after date_from
      if (data.date_from && data.date_to) {
        return new Date(data.date_to) >= new Date(data.date_from);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['date_to'],
    },
  )
  .refine(
    (data) => {
      // amount_max must be greater than amount_min
      if (data.amount_min !== undefined && data.amount_max !== undefined) {
        return data.amount_max >= data.amount_min;
      }
      return true;
    },
    {
      message: 'Maximum amount must be greater than minimum amount',
      path: ['amount_max'],
    },
  );

export const paymentReportFiltersSchema = z
  .object({
    clinic_id: uuidSchema.optional(),
    invoice_id: uuidSchema.optional(),
    payment_method: z.array(paymentMethodSchema).optional(),
    status: z.array(paymentProcessingStatusSchema).optional(),
    date_from: z.string().datetime('Invalid date format').optional(),
    date_to: z.string().datetime('Invalid date format').optional(),
    amount_min: z
      .number()
      .min(0, 'Minimum amount cannot be negative')
      .optional(),
    amount_max: z
      .number()
      .min(0, 'Maximum amount cannot be negative')
      .optional(),
  })
  .refine(
    (data) => {
      // date_to must be after date_from
      if (data.date_from && data.date_to) {
        return new Date(data.date_to) >= new Date(data.date_from);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['date_to'],
    },
  )
  .refine(
    (data) => {
      // amount_max must be greater than amount_min
      if (data.amount_min !== undefined && data.amount_max !== undefined) {
        return data.amount_max >= data.amount_min;
      }
      return true;
    },
    {
      message: 'Maximum amount must be greater than minimum amount',
      path: ['amount_max'],
    },
  );

// Shadow validation
export const shadowValidationSchema = z.object({
  operation_type: shadowOperationTypeSchema,
  reference_id: uuidSchema,
  reference_table: z.string().min(1, 'Reference table is required'),
  original_calculation: z.record(z.any()),
  shadow_calculation: z.record(z.any()),
  tolerance_absolute: z
    .number()
    .min(0, 'Tolerance cannot be negative')
    .default(0.01),
  tolerance_percentage: z
    .number()
    .min(0, 'Tolerance cannot be negative')
    .default(0.001),
  metadata: z.record(z.any()).default({}),
});

// Payment reminder validation
export const paymentReminderSchema = z.object({
  invoice_id: uuidSchema,
  installment_id: uuidSchema.optional(),
  reminder_type: reminderTypeSchema,
  days_before_due: z
    .number()
    .int()
    .min(0, 'Days before due cannot be negative')
    .default(0),
  days_after_due: z
    .number()
    .int()
    .min(0, 'Days after due cannot be negative')
    .default(0),
  delivery_method: deliveryMethodSchema,
  recipient_contact: z
    .string()
    .min(1, 'Recipient contact is required')
    .max(100, 'Recipient contact too long'),
  subject: z.string().max(200, 'Subject too long').optional(),
  message: z.string().max(1000, 'Message too long').optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

// Query parameter validation for API endpoints
export const invoiceQuerySchema = z
  .object({
    clinic_id: uuidSchema.optional(),
    patient_id: uuidSchema.optional(),
    status: z.string().optional(),
    payment_status: z.string().optional(),
    search: z.string().max(100, 'Search term too long').optional(),
    sort: z
      .enum([
        'created_at',
        'issue_date',
        'due_date',
        'total_amount',
        'invoice_number',
      ])
      .default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .merge(paginationSchema);

export const paymentQuerySchema = z
  .object({
    invoice_id: uuidSchema.optional(),
    payment_method: z.string().optional(),
    status: z.string().optional(),
    search: z.string().max(100, 'Search term too long').optional(),
    sort: z
      .enum(['created_at', 'processed_at', 'amount'])
      .default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .merge(paginationSchema);

// Utility validation functions
export const validateAmount = (amount: number, _fieldName = 'amount') => {
  return amountSchema.parse(amount);
};

export const validatePositiveAmount = (
  amount: number,
  _fieldName = 'amount',
) => {
  return positiveAmountSchema.parse(amount);
};

export const validateUuid = (id: string, _fieldName = 'id') => {
  return uuidSchema.parse(id);
};

export const validateCnpj = (cnpj: string) => {
  return cnpjSchema.parse(cnpj);
};

export const validateCpf = (cpf: string) => {
  return cpfSchema.parse(cpf);
};

// Convert reais to centavos for storage
export const reaisToCentavos = (reais: number): number => {
  return Math.round(reais * 100);
};

// Convert centavos to reais for display
export const centavosToReais = (centavos: number): number => {
  return centavos / 100;
};

// Format currency for display
export const formatCurrency = (centavos: number, currency = 'BRL'): string => {
  const reais = centavosToReais(centavos);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
};

// Parse currency string to centavos
export const parseCurrencyToCentavos = (currencyString: string): number => {
  // Remove currency symbols and convert to number
  const cleaned = currencyString.replace(/[R$\s.]/g, '').replace(',', '.');
  const reais = Number.parseFloat(cleaned);
  if (Number.isNaN(reais)) {
    throw new Error('Invalid currency format');
  }
  return reaisToCentavos(reais);
};

// Export all schemas
export const financialValidationSchemas = {
  createInvoice: createInvoiceSchema,
  updateInvoice: updateInvoiceSchema,
  createPayment: createPaymentSchema,
  updatePayment: updatePaymentSchema,
  nfseRequest: nfseRequestSchema,
  paymentProcessingRequest: paymentProcessingRequestSchema,
  invoiceReportFilters: invoiceReportFiltersSchema,
  paymentReportFilters: paymentReportFiltersSchema,
  shadowValidation: shadowValidationSchema,
  paymentReminder: paymentReminderSchema,
  pagination: paginationSchema,
  invoiceQuery: invoiceQuerySchema,
  paymentQuery: paymentQuerySchema,
};

export default financialValidationSchemas;

// Cash Flow Validation Schemas
// Using Zod for type-safe validation following Context7 patterns

import { z } from 'zod';

// Transaction types enum
export const TransactionTypeSchema = z.enum([
  'receipt',
  'payment', 
  'transfer',
  'adjustment',
  'opening_balance',
  'closing_balance'
]);

// Categories enum
export const CategorySchema = z.enum([
  'service_payment',
  'product_sale',
  'expense',
  'tax',
  'fee',
  'refund',
  'other'
]);

// Payment methods enum
export const PaymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'pix',
  'bank_transfer',
  'check',
  'other'
]);

// Cash flow entry validation schema
export const CashFlowEntrySchema = z.object({
  clinic_id: z.string().uuid('Invalid clinic ID'),
  register_id: z.string().uuid('Invalid register ID').optional(),
  transaction_type: TransactionTypeSchema,
  category: CategorySchema,
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999, 'Amount too large')
    .refine(val => Number.isFinite(val), 'Amount must be a valid number'),
  currency: z.string().default('BRL'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  reference_number: z.string().optional(),
  payment_method: PaymentMethodSchema,
  related_appointment_id: z.string().uuid().optional(),
  related_patient_id: z.string().uuid().optional(),
  created_by: z.string().uuid('Invalid user ID'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export type CashFlowEntryInput = z.infer<typeof CashFlowEntrySchema>;// Cash register validation schema
export const CashRegisterSchema = z.object({
  clinic_id: z.string().uuid('Invalid clinic ID'),
  register_name: z.string()
    .min(1, 'Register name is required')
    .max(100, 'Register name too long'),
  register_code: z.string()
    .min(1, 'Register code is required')
    .max(20, 'Register code too long'),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location too long'),
  responsible_user_id: z.string().uuid('Invalid user ID'),
  opening_balance: z.number()
    .min(0, 'Opening balance cannot be negative')
    .max(999999999, 'Opening balance too large'),
  is_active: z.boolean().default(true)
});

export type CashRegisterInput = z.infer<typeof CashRegisterSchema>;

// Cash flow filters validation schema
export const CashFlowFiltersSchema = z.object({
  // Using z.string().date() to accept YYYY-MM-DD date strings following Zod best practices
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  registerId: z.string().uuid().optional(),
  transactionType: TransactionTypeSchema.optional(),
  category: CategorySchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  isReconciled: z.boolean().optional(),
  search: z.string().max(200).optional()
}).refine(
  data => !data.dateFrom || !data.dateTo || new Date(data.dateFrom) < new Date(data.dateTo),
  {
    message: "Start date must be before end date",
    path: ["dateTo"]
  }
);

export type CashFlowFiltersInput = z.infer<typeof CashFlowFiltersSchema>;

// Reconciliation validation schema
export const ReconciliationSchema = z.object({
  clinic_id: z.string().uuid('Invalid clinic ID'),
  register_id: z.string().uuid().optional(),
  reconciliation_date: z.string().datetime(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  payment_gateway: z.string().optional(),
  expected_amount: z.number().min(0),
  actual_amount: z.number().min(0),
  notes: z.string().max(1000).optional(),
  created_by: z.string().uuid('Invalid user ID')
}).refine(
  data => new Date(data.period_start) <= new Date(data.period_end),
  {
    message: "Period start must be before period end",
    path: ["period_end"]
  }
);

export type ReconciliationInput = z.infer<typeof ReconciliationSchema>;

// Validation helper functions
export function validateCashFlowEntry(data: unknown) {
  return CashFlowEntrySchema.safeParse(data);
}

export function validateCashRegister(data: unknown) {
  return CashRegisterSchema.safeParse(data);
}

export function validateCashFlowFilters(data: unknown) {
  return CashFlowFiltersSchema.safeParse(data);
}

export function validateReconciliation(data: unknown) {
  return ReconciliationSchema.safeParse(data);
}
/**
 * Financial Management Types
 * Created: January 27, 2025
 * Purpose: TypeScript interfaces for invoice generation and payment tracking
 * Standards: Brazilian NFSe compliance + Shadow validation
 */

// Base financial types
export type Currency = 'BRL';
export type AmountInCentavos = number; // Always store amounts in centavos for precision

// Invoice Types
export type Invoice = {
  id: string;
  invoice_number: string;
  patient_id: string;
  clinic_id: string;
  professional_id?: string;

  // Invoice Details
  description: string;
  service_list_code?: string; // Brazilian service code
  issue_date: string;
  due_date?: string;

  // Financial Amounts (in centavos)
  subtotal_amount: AmountInCentavos;
  discount_amount: AmountInCentavos;
  tax_amount: AmountInCentavos;
  total_amount: AmountInCentavos;

  // Brazilian NFSe Compliance
  nfse_number?: string;
  nfse_verification_code?: string;
  nfse_status: NFSeStatus;
  nfse_issued_at?: string;
  nfse_xml_url?: string;
  cnpj_issuer: string;

  // Status
  status: InvoiceStatus;
  payment_status: PaymentStatus;

  // Shadow Validation
  shadow_validation_status: ShadowValidationStatus;
  shadow_validation_at?: string;
  shadow_variance: number;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Metadata
  metadata: Record<string, any>;

  // Relations (populated by joins)
  invoice_items?: InvoiceItem[];
  payments?: Payment[];
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
  };
  clinic?: {
    id: string;
    name: string;
    cnpj: string;
    address: string;
  };
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;

  // Item Details
  description: string;
  quantity: number;
  unit_price: AmountInCentavos;
  discount_amount: AmountInCentavos;
  total_amount: AmountInCentavos;

  // Service References
  treatment_plan_id?: string;
  procedure_id?: string;

  // Brazilian Tax Information
  service_code?: string;
  tax_rate: number;
  tax_amount: AmountInCentavos;

  created_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;

  // Payment Details
  payment_method: PaymentMethod;
  amount: AmountInCentavos;

  // Payment Processing
  external_transaction_id?: string;
  payment_processor?: string;
  authorization_code?: string;

  // Status
  status: PaymentProcessingStatus;
  processed_at?: string;
  confirmed_at?: string;

  // Fees
  processing_fee: AmountInCentavos;
  net_amount?: AmountInCentavos;

  // PIX specific
  pix_key?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;

  metadata: Record<string, any>;

  // Relations
  installments?: PaymentInstallment[];
};

export type PaymentInstallment = {
  id: string;
  payment_id: string;
  invoice_id: string;

  // Installment Details
  installment_number: number;
  total_installments: number;
  amount: AmountInCentavos;

  // Scheduling
  due_date: string;
  paid_date?: string;

  // Status
  status: InstallmentStatus;

  // Late fees
  late_fee: AmountInCentavos;
  interest_amount: AmountInCentavos;
  final_amount?: AmountInCentavos;

  // Payment processing
  payment_transaction_id?: string;
  paid_amount?: AmountInCentavos;

  created_at: string;
  updated_at: string;
};

export type ShadowValidation = {
  id: string;
  operation_type: ShadowOperationType;
  reference_id: string;
  reference_table: string;

  // Validation Results
  original_calculation: Record<string, any>;
  shadow_calculation: Record<string, any>;
  variance: number;
  variance_percentage: number;

  // Status
  validation_status: ShadowValidationStatus;
  validation_message?: string;

  // Tolerances
  tolerance_absolute: number;
  tolerance_percentage: number;

  validated_at: string;
  validated_by?: string;
  metadata: Record<string, any>;
};

export type PaymentReminder = {
  id: string;
  invoice_id: string;
  installment_id?: string;

  // Reminder Details
  reminder_type: ReminderType;
  days_before_due: number;
  days_after_due: number;

  // Delivery
  delivery_method: DeliveryMethod;
  recipient_contact: string;

  // Status
  status: ReminderStatus;
  sent_at?: string;
  delivered_at?: string;

  // Content
  subject?: string;
  message?: string;

  // Response tracking
  viewed_at?: string;
  responded_at?: string;

  created_at: string;
  updated_at: string;
};

// Enums
export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'paid'
  | 'cancelled'
  | 'overdue';
export type PaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';
export type NFSeStatus = 'pending' | 'issued' | 'cancelled' | 'rejected';
export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'bank_transfer'
  | 'financing'
  | 'installment';
export type PaymentProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type ShadowValidationStatus = 'pending' | 'validated' | 'failed';
export type ShadowOperationType =
  | 'invoice_calculation'
  | 'payment_processing'
  | 'tax_calculation'
  | 'installment_calculation';
export type ReminderType = 'pre_due' | 'due' | 'overdue' | 'final_notice';
export type DeliveryMethod = 'email' | 'sms' | 'whatsapp' | 'phone';
export type ReminderStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

// Input Types for API
export type CreateInvoiceInput = {
  patient_id: string;
  clinic_id: string;
  professional_id?: string;
  description: string;
  service_list_code?: string;
  due_date?: string;
  items: CreateInvoiceItemInput[];
  metadata?: Record<string, any>;
};

export type CreateInvoiceItemInput = {
  description: string;
  quantity: number;
  unit_price: number; // In reais, will be converted to centavos
  discount_amount?: number; // In reais
  treatment_plan_id?: string;
  procedure_id?: string;
  service_code?: string;
  tax_rate?: number;
};

export type CreatePaymentInput = {
  invoice_id: string;
  payment_method: PaymentMethod;
  amount: number; // In reais, will be converted to centavos
  external_transaction_id?: string;
  payment_processor?: string;
  authorization_code?: string;
  pix_key?: string;
  installments?: CreateInstallmentInput[];
  metadata?: Record<string, any>;
};

export type CreateInstallmentInput = {
  installment_number: number;
  total_installments: number;
  amount: number; // In reais
  due_date: string;
};

export type UpdateInvoiceInput = {
  description?: string;
  service_list_code?: string;
  due_date?: string;
  status?: InvoiceStatus;
  metadata?: Record<string, any>;
};

export type UpdatePaymentInput = {
  status?: PaymentProcessingStatus;
  external_transaction_id?: string;
  authorization_code?: string;
  processing_fee?: number;
  metadata?: Record<string, any>;
};

// Calculation Types
export type InvoiceCalculation = {
  subtotal: AmountInCentavos;
  discount: AmountInCentavos;
  tax: AmountInCentavos;
  total: AmountInCentavos;
};

export type ShadowCalculationResult = {
  original: InvoiceCalculation;
  shadow: InvoiceCalculation;
  variance: number;
  variance_percentage: number;
  is_valid: boolean;
  tolerance_exceeded: boolean;
};

// NFSe Integration Types
export type NFSeRequest = {
  invoice_id: string;
  service_code: string;
  service_description: string;
  service_amount: AmountInCentavos;
  tax_amount: AmountInCentavos;
  issuer_cnpj: string;
  taker_cpf_cnpj: string;
  taker_name: string;
  taker_address: NFSeAddress;
};

export type NFSeAddress = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

export type NFSeResponse = {
  success: boolean;
  nfse_number?: string;
  verification_code?: string;
  xml_url?: string;
  issue_date?: string;
  error_message?: string;
  error_code?: string;
};

// Payment Processing Types
export type PaymentProcessingRequest = {
  payment_method: PaymentMethod;
  amount: AmountInCentavos;
  currency: Currency;
  customer: PaymentCustomer;
  metadata?: Record<string, any>;
};

export type PaymentCustomer = {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  address?: NFSeAddress;
};

export type PaymentProcessingResponse = {
  success: boolean;
  transaction_id?: string;
  authorization_code?: string;
  payment_url?: string; // For redirect methods
  pix_qr_code?: string;
  pix_copy_paste?: string;
  processing_fee?: AmountInCentavos;
  status: PaymentProcessingStatus;
  error_message?: string;
  error_code?: string;
};

// Report Types
export type InvoiceReportFilters = {
  clinic_id?: string;
  patient_id?: string;
  professional_id?: string;
  status?: InvoiceStatus[];
  payment_status?: PaymentStatus[];
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  nfse_status?: NFSeStatus[];
};

export type PaymentReportFilters = {
  clinic_id?: string;
  invoice_id?: string;
  payment_method?: PaymentMethod[];
  status?: PaymentProcessingStatus[];
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
};

export type FinancialSummary = {
  total_invoices: number;
  total_amount: AmountInCentavos;
  total_paid: AmountInCentavos;
  total_pending: AmountInCentavos;
  total_overdue: AmountInCentavos;
  payment_methods: Record<
    PaymentMethod,
    {
      count: number;
      amount: AmountInCentavos;
    }
  >;
  by_status: Record<
    InvoiceStatus,
    {
      count: number;
      amount: AmountInCentavos;
    }
  >;
};

// Utility Functions Types
export type AmountFormatter = {
  formatCentavos(amount: AmountInCentavos): string;
  parseToCentavos(amount: string | number): AmountInCentavos;
  formatCurrency(amount: AmountInCentavos, currency?: Currency): string;
};

export type InvoiceNumberGenerator = {
  generateNumber(clinic_id: string): Promise<string>;
  validateNumber(number: string): boolean;
};

export type TaxCalculator = {
  calculateServiceTax(
    amount: AmountInCentavos,
    service_code: string,
  ): AmountInCentavos;
  calculateTotalTax(items: InvoiceItem[]): AmountInCentavos;
  getServiceTaxRate(service_code: string): number;
};

// Error Types
export class FinancialError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'FinancialError';
  }
}

export class ShadowValidationError extends FinancialError {
  constructor(
    message: string,
    public variance: number,
    public tolerance: number,
    details?: Record<string, any>,
  ) {
    super(message, 'SHADOW_VALIDATION_FAILED', details);
    this.name = 'ShadowValidationError';
  }
}

export class PaymentProcessingError extends FinancialError {
  constructor(
    message: string,
    public payment_id: string,
    public processor_error?: string,
    details?: Record<string, any>,
  ) {
    super(message, 'PAYMENT_PROCESSING_FAILED', details);
    this.name = 'PaymentProcessingError';
  }
}

export class NFSeError extends FinancialError {
  constructor(
    message: string,
    public invoice_id: string,
    public nfse_error_code?: string,
    details?: Record<string, any>,
  ) {
    super(message, 'NFSE_GENERATION_FAILED', details);
    this.name = 'NFSeError';
  }
}

// API Response Types
export type InvoiceListResponse = {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: FinancialSummary;
};

export type PaymentListResponse = {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type InvoiceDetailsResponse = {
  invoice: Invoice;
  calculations: ShadowCalculationResult;
  payment_history: Payment[];
  reminders: PaymentReminder[];
};

// Hook Types for React components
export type UseInvoicesHook = {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  total: number;
  summary: FinancialSummary | null;
  createInvoice: (data: CreateInvoiceInput) => Promise<Invoice>;
  updateInvoice: (id: string, data: UpdateInvoiceInput) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  issueInvoice: (id: string) => Promise<Invoice>;
  cancelInvoice: (id: string) => Promise<Invoice>;
  refresh: () => Promise<void>;
};

export type UsePaymentsHook = {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  total: number;
  processPayment: (data: CreatePaymentInput) => Promise<Payment>;
  updatePayment: (id: string, data: UpdatePaymentInput) => Promise<Payment>;
  refundPayment: (id: string, amount?: number) => Promise<Payment>;
  refresh: () => Promise<void>;
};

export type UseFinancialReportsHook = {
  generateInvoiceReport: (filters: InvoiceReportFilters) => Promise<Blob>;
  generatePaymentReport: (filters: PaymentReportFilters) => Promise<Blob>;
  getSummary: (filters: InvoiceReportFilters) => Promise<FinancialSummary>;
  exportToExcel: (data: any[], filename: string) => Promise<void>;
};

// All types are already exported individually above

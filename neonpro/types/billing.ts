// Types for NeonPro Billing and Payment System
// Task 7: Sistema de Faturamento e Pagamentos

export type ServiceType =
  | "consultation"
  | "treatment"
  | "procedure"
  | "package"
  | "maintenance";

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "pix"
  | "bank_transfer"
  | "installments"
  | "insurance";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type DiscountType =
  | "percentage"
  | "fixed_amount"
  | "promotional"
  | "loyalty"
  | "insurance_covered";

// =====================================================
// SERVICE INTERFACES
// =====================================================

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: ServiceType;
  base_price: number;
  duration_minutes?: number;
  category?: string;
  is_active: boolean;
  requires_appointment: boolean;
  max_sessions?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  type: ServiceType;
  base_price: number;
  duration_minutes?: number;
  category?: string;
  requires_appointment?: boolean;
  max_sessions?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  is_active?: boolean;
}

// =====================================================
// PRICING PLAN INTERFACES
// =====================================================

export interface PricingPlan {
  id: string;
  service_id: string;
  name: string;
  description?: string;
  price: number;
  sessions_included: number;
  validity_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  service?: Service;
}

export interface CreatePricingPlanData {
  service_id: string;
  name: string;
  description?: string;
  price: number;
  sessions_included: number;
  validity_days?: number;
}

export interface UpdatePricingPlanData extends Partial<CreatePricingPlanData> {
  is_active?: boolean;
}

// =====================================================
// INVOICE INTERFACES
// =====================================================

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  appointment_id?: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  appointment?: {
    id: string;
    scheduled_for: string;
    service_name?: string;
  };
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type?: DiscountType;
  discount_value: number;
  subtotal: number;
  total: number;
  created_at: string;
  // Relations
  service?: Service;
}

export interface CreateInvoiceData {
  patient_id: string;
  appointment_id?: string;
  due_date?: string;
  notes?: string;
  payment_terms?: string;
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type?: DiscountType;
  discount_value?: number;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  due_date?: string;
  notes?: string;
  payment_terms?: string;
}

// =====================================================
// PAYMENT INTERFACES
// =====================================================

export interface Payment {
  id: string;
  invoice_id: string;
  payment_number: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string;
  due_date?: string;
  external_id?: string;
  gateway?: string;
  installments: number;
  installment_number: number;
  fees: number;
  net_amount?: number;
  notes?: string;
  processed_at?: string;
  created_at: string;
  created_by?: string;
  // Relations
  invoice?: Invoice;
  installment_payments?: Installment[];
}

export interface Installment {
  id: string;
  payment_id: string;
  invoice_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  external_id?: string;
  created_at: string;
  // Relations
  payment?: Payment;
  invoice?: Invoice;
}

export interface CreatePaymentData {
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  payment_date?: string;
  installments?: number;
  notes?: string;
}

export interface ProcessPaymentData extends CreatePaymentData {
  external_id?: string;
  gateway?: string;
  fees?: number;
}

// =====================================================
// FINANCIAL SETTINGS INTERFACES
// =====================================================

export interface FinancialSettings {
  id: string;
  clinic_name?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_rate: number;
  default_payment_terms?: string;
  invoice_prefix: string;
  next_invoice_number: number;
  payment_prefix: string;
  next_payment_number: number;
  default_due_days: number;
  late_fee_percentage: number;
  discount_limit_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateFinancialSettingsData
  extends Partial<
    Omit<FinancialSettings, "id" | "created_at" | "updated_at">
  > {
  // Minimal interface for financial settings updates
  clinic_id?: string;
}

// =====================================================
// DASHBOARD & ANALYTICS INTERFACES
// =====================================================

export interface FinancialSummary {
  total_revenue: number;
  pending_invoices: number;
  overdue_invoices: number;
  paid_invoices: number;
  total_outstanding: number;
  monthly_revenue: number;
  daily_revenue: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface RevenueByPeriod {
  period: string; // YYYY-MM-DD or YYYY-MM
  revenue: number;
  invoices_count: number;
  payments_count: number;
}

export interface RevenueByService {
  service_id: string;
  service_name: string;
  service_type: ServiceType;
  total_revenue: number;
  invoices_count: number;
  average_price: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface InvoiceStatusStats {
  status: InvoiceStatus;
  count: number;
  total_amount: number;
  percentage: number;
}

// =====================================================
// FORM & UI INTERFACES
// =====================================================

export interface InvoiceFormData {
  patient_id: string;
  appointment_id?: string;
  due_date?: string;
  notes?: string;
  payment_terms?: string;
  items: {
    service_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount_type?: DiscountType;
    discount_value?: number;
  }[];
}

export interface PaymentFormData {
  amount: number;
  method: PaymentMethod;
  payment_date?: string;
  installments?: number;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  type: ServiceType;
  base_price: number;
  duration_minutes?: number;
  category?: string;
  requires_appointment?: boolean;
  max_sessions?: number;
}

// =====================================================
// API RESPONSE INTERFACES
// =====================================================

export interface InvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}

export interface InvoicesResponse {
  success: boolean;
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment?: Payment;
  error?: string;
}

export interface ServicesResponse {
  success: boolean;
  services: Service[];
  total: number;
  error?: string;
}

export interface FinancialSummaryResponse {
  success: boolean;
  summary?: FinancialSummary;
  error?: string;
}

// =====================================================
// FILTER & SEARCH INTERFACES
// =====================================================

export interface InvoiceFilters {
  status?: InvoiceStatus[];
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?:
    | "invoice_number"
    | "issue_date"
    | "due_date"
    | "total_amount"
    | "status";
  sort_order?: "asc" | "desc";
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: "payment_number" | "payment_date" | "amount" | "status";
  sort_order?: "asc" | "desc";
}

export interface ServiceFilters {
  type?: ServiceType[];
  category?: string[];
  is_active?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  sort_by?: "name" | "type" | "base_price" | "created_at";
  sort_order?: "asc" | "desc";
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface InvoiceCalculations {
  subtotal: number;
  total_discount: number;
  tax_amount: number;
  total_amount: number;
}

export interface PaymentCalculations {
  total_paid: number;
  remaining_balance: number;
  is_fully_paid: boolean;
  next_installment?: Installment;
}

// =====================================================
// CONSTANTS
// =====================================================

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "consultation", label: "Consulta" },
  { value: "treatment", label: "Tratamento" },
  { value: "procedure", label: "Procedimento" },
  { value: "package", label: "Pacote" },
  { value: "maintenance", label: "Manutenção" },
];

export const INVOICE_STATUSES: {
  value: InvoiceStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Rascunho", color: "gray" },
  { value: "pending", label: "Pendente", color: "yellow" },
  { value: "paid", label: "Paga", color: "green" },
  { value: "overdue", label: "Vencida", color: "red" },
  { value: "cancelled", label: "Cancelada", color: "gray" },
  { value: "refunded", label: "Reembolsada", color: "blue" },
];

export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon?: string;
}[] = [
  { value: "cash", label: "Dinheiro", icon: "💵" },
  { value: "debit_card", label: "Cartão de Débito", icon: "💳" },
  { value: "credit_card", label: "Cartão de Crédito", icon: "💳" },
  { value: "pix", label: "PIX", icon: "🔄" },
  { value: "bank_transfer", label: "Transferência", icon: "🏦" },
  { value: "installments", label: "Parcelado", icon: "📊" },
  { value: "insurance", label: "Convênio", icon: "🛡️" },
];

export const PAYMENT_STATUSES: {
  value: PaymentStatus;
  label: string;
  color: string;
}[] = [
  { value: "pending", label: "Pendente", color: "yellow" },
  { value: "processing", label: "Processando", color: "blue" },
  { value: "completed", label: "Concluído", color: "green" },
  { value: "failed", label: "Falhou", color: "red" },
  { value: "refunded", label: "Reembolsado", color: "purple" },
  { value: "cancelled", label: "Cancelado", color: "gray" },
];

export const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: "percentage", label: "Percentual (%)" },
  { value: "fixed_amount", label: "Valor Fixo (R$)" },
  { value: "promotional", label: "Promocional" },
  { value: "loyalty", label: "Fidelidade" },
  { value: "insurance_covered", label: "Coberto pelo Convênio" },
];

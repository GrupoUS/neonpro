// lib/types/accounts-payable.ts
// TypeScript interfaces for Accounts Payable system

export interface Vendor {
  id: string;
  vendor_code: string;
  company_name: string;
  legal_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  mobile?: string;

  // Address information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;

  // Tax information
  tax_id?: string; // CPF/CNPJ
  state_registration?: string;
  municipal_registration?: string;

  // Banking information
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;
  pix_key?: string;

  // Vendor details
  vendor_type:
    | 'supplier'
    | 'service_provider'
    | 'contractor'
    | 'consultant'
    | 'other';
  payment_terms_days: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';
  credit_limit?: number;

  // Status and flags
  is_active: boolean;
  requires_approval: boolean;
  tax_exempt: boolean;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Soft delete
  deleted_at?: string;
  deleted_by?: string;
  deleted_reason?: string;
}

export interface ExpenseCategory {
  id: string;
  category_code: string;
  category_name: string;
  parent_category_id?: string;
  description?: string;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AccountsPayable {
  id: string;
  ap_number: string;

  // Relations
  vendor_id: string;
  vendor?: Vendor;
  expense_category_id: string;
  expense_category?: ExpenseCategory;

  // Invoice information
  invoice_number?: string;
  invoice_date?: string;
  due_date: string;

  // Financial details
  gross_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  paid_amount: number;
  balance_amount: number;

  // Payment information
  payment_terms_days: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';

  // Status and workflow
  status:
    | 'draft'
    | 'pending'
    | 'approved'
    | 'scheduled'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'disputed'
    | 'cancelled'
    | 'refunded';
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Additional information
  description?: string;
  notes?: string;

  // Approval workflow
  approved_at?: string;
  approved_by?: string;
  approval_notes?: string;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Soft delete
  deleted_at?: string;
  deleted_by?: string;
  deleted_reason?: string;
}

export interface PaymentSchedule {
  id: string;
  vendor_id?: string;
  vendor?: Vendor;
  expense_category_id: string;
  expense_category?: ExpenseCategory;

  // Schedule details
  schedule_name: string;
  description?: string;
  amount: number;

  // Recurrence configuration
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequency_interval: number;
  start_date: string;
  end_date?: string;
  next_due_date: string;
  payment_day?: number;

  // Status
  is_active: boolean;
  auto_generate: boolean;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APPayment {
  id: string;
  payment_number: string;

  // Relations
  accounts_payable_id: string;
  accounts_payable?: AccountsPayable;
  vendor_id: string;
  vendor?: Vendor;

  // Payment details
  payment_date: string;
  payment_amount: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';

  // Payment method specific info
  check_number?: string;
  bank_account?: string;
  transaction_reference?: string;

  // Status
  status: 'pending' | 'completed' | 'cancelled' | 'reversed';

  // Additional information
  notes?: string;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APDocument {
  id: string;

  // Links to related records
  accounts_payable_id?: string;
  vendor_id?: string;
  payment_id?: string;

  // Document details
  document_type:
    | 'invoice'
    | 'receipt'
    | 'contract'
    | 'purchase_order'
    | 'payment_voucher'
    | 'other';
  document_name: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;

  // Status
  is_active: boolean;

  // Audit fields
  created_at: string;
  uploaded_by: string;
}

// Form interfaces
export interface VendorFormData {
  vendor_code: string;
  company_name: string;
  legal_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  state_registration?: string;
  municipal_registration?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;
  pix_key?: string;
  vendor_type: string;
  payment_terms_days: number;
  payment_method: string;
  credit_limit?: number;
  is_active: boolean;
  requires_approval: boolean;
  tax_exempt: boolean;
}

export interface AccountsPayableFormData {
  vendor_id: string;
  expense_category_id: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date: string;
  gross_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  payment_terms_days: number;
  payment_method: string;
  status: string;
  priority: string;
  description?: string;
  notes?: string;
}

// API Response types
export interface VendorsResponse {
  vendors: Vendor[];
  total: number;
}

export interface AccountsPayableResponse {
  accounts_payable: AccountsPayable[];
  total: number;
}

// Filter types
export interface VendorFilters {
  search?: string;
  vendor_type?: string;
  is_active?: boolean;
  payment_method?: string;
  requires_approval?: boolean;
}

export interface AccountsPayableFilters {
  search?: string;
  vendor_id?: string;
  status?: string;
  priority?: string;
  expense_category_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
}

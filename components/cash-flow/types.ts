// Cash Flow Management Types
// Following financial dashboard patterns from Context7 research

export interface CashFlowEntry {
  id: string;
  clinic_id: string;
  register_id: string;
  transaction_type: 'receipt' | 'payment' | 'transfer' | 'adjustment' | 'opening_balance' | 'closing_balance';
  category: 'service_payment' | 'product_sale' | 'expense' | 'tax' | 'fee' | 'refund' | 'other';
  amount: number;
  currency: string;
  description: string;
  reference_number?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check' | 'other';
  related_appointment_id?: string;
  related_patient_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
  is_reconciled: boolean;
  reconciliation_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CashRegister {
  id: string;
  clinic_id: string;
  register_name: string;
  register_code: string;
  location: string;
  responsible_user_id: string;
  current_balance: number;
  opening_balance: number;
  expected_balance: number;
  is_active: boolean;
  last_reconciliation_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentReconciliation {
  id: string;
  clinic_id: string;
  register_id?: string;
  reconciliation_date: string;
  period_start: string;
  period_end: string;
  payment_gateway?: string;
  expected_amount: number;
  actual_amount: number;
  difference_amount: number;
  transaction_count: number;
  reconciled_count: number;
  discrepancy_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review';
  notes?: string;
  created_by: string;
  completed_by?: string;
  created_at: string;
  completed_at?: string;
  summary_data?: Record<string, any>;
}

export interface ReconciliationDiscrepancy {
  id: string;
  reconciliation_id: string;
  clinic_id: string;
  discrepancy_type: 'missing_transaction' | 'amount_mismatch' | 'fee_mismatch' | 'duplicate_transaction' | 'incorrect_status' | 'settlement_mismatch' | 'currency_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  our_transaction_id?: string;
  gateway_transaction_id?: string;
  our_amount?: number;
  gateway_amount?: number;
  amount_difference?: number;
  description: string;
  detailed_comparison?: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'disputed' | 'escalated' | 'ignored';
  resolution_method?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  financial_impact: number;
  requires_adjustment: boolean;
  adjustment_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  periodStart: string;
  periodEnd: string;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  byDay: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  registers: Array<{
    id: string;
    name: string;
    balance: number;
    transactions: number;
  }>;
}

export interface CashFlowFilters {
  dateFrom?: string;
  dateTo?: string;
  registerId?: string;
  transactionType?: CashFlowEntry['transaction_type'];
  category?: CashFlowEntry['category'];
  paymentMethod?: CashFlowEntry['payment_method'];
  isReconciled?: boolean;
  search?: string;
}

export interface ReconciliationReport {
  id: string;
  summary: {
    totalTransactions: number;
    totalAmount: number;
    reconciledAmount: number;
    discrepancyAmount: number;
    reconciliationRate: number;
  };
  byPaymentMethod: Array<{
    method: string;
    expected: number;
    actual: number;
    difference: number;
    status: 'ok' | 'warning' | 'error';
  }>;
  discrepancies: ReconciliationDiscrepancy[];
  recommendations: string[];
  generatedAt: string;
}
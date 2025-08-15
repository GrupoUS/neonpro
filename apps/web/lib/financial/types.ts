/**
 * Financial System Types and Interfaces
 * Story 4.1: Automated Invoice Generation + Payment Tracking
 *
 * This module provides comprehensive type definitions for the financial management system:
 * - Brazilian compliance types (NFSe, PIX, Boleto)
 * - Payment gateway integrations
 * - Tax calculation and reporting
 * - LGPD-compliant data structures
 * - Financial analytics and reporting
 */

// Base Financial Types
export interface Money {
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  formatted?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TaxDocument {
  type: 'CPF' | 'CNPJ' | 'RG' | 'IE';
  number: string;
  issuingBody?: string;
  issuedAt?: Date;
}

// Brazilian Tax and Compliance Types
export interface BrazilianTaxInfo {
  municipalTax: {
    rate: number;
    amount: number;
    exemption?: boolean;
    exemptionReason?: string;
  };
  federalTax: {
    pis: { rate: number; amount: number };
    cofins: { rate: number; amount: number };
    csll: { rate: number; amount: number };
    irpj: { rate: number; amount: number };
  };
  stateTax: {
    icms: { rate: number; amount: number };
  };
  totalTaxes: number;
  taxRegime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
}

export interface NFSeData {
  number: string;
  verificationCode: string;
  accessKey: string;
  issueDate: Date;
  serviceCode: string;
  serviceDescription: string;
  municipalityCode: string;
  provider: {
    cnpj: string;
    municipalRegistration: string;
    name: string;
    address: Address;
  };
  taker: {
    document: TaxDocument;
    name: string;
    address: Address;
    email?: string;
    phone?: string;
  };
  services: {
    description: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    itemCode?: string;
  }[];
  taxes: BrazilianTaxInfo;
  totalAmount: number;
  status: 'pending' | 'issued' | 'cancelled' | 'error';
  xmlContent?: string;
  pdfUrl?: string;
  errors?: string[];
}

// Payment Method Types
export interface PIXPayment {
  type: 'pix';
  pixKey: string;
  pixCode: string;
  qrCode: string;
  expiresAt: Date;
  amount: number;
  description: string;
  txId?: string;
  endToEndId?: string;
}

export interface BoletoPayment {
  type: 'boleto';
  boletoCode: string;
  barCode: string;
  digitableLine: string;
  dueDate: Date;
  amount: number;
  instructions: string[];
  pdfUrl: string;
  bankCode: string;
  agencyCode: string;
  accountCode: string;
}

export interface CreditCardPayment {
  type: 'credit_card';
  cardToken: string;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestRate?: number;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard';
  lastFourDigits: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface DebitCardPayment {
  type: 'debit_card';
  cardToken: string;
  amount: number;
  brand: 'visa' | 'mastercard' | 'elo';
  lastFourDigits: string;
  holderName: string;
}

export interface CashPayment {
  type: 'cash';
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  receivedBy: string;
  receivedAt: Date;
}

export interface InsurancePayment {
  type: 'insurance';
  insuranceCompany: string;
  policyNumber: string;
  authorizationCode: string;
  coveragePercentage: number;
  coveredAmount: number;
  patientResponsibility: number;
  preAuthRequired: boolean;
}

export type PaymentMethod =
  | PIXPayment
  | BoletoPayment
  | CreditCardPayment
  | DebitCardPayment
  | CashPayment
  | InsurancePayment;

// Payment Gateway Types
export interface PaymentGatewayConfig {
  name: string;
  type: 'mercado_pago' | 'pagseguro' | 'stripe' | 'cielo' | 'rede' | 'getnet';
  credentials: {
    publicKey?: string;
    privateKey?: string;
    accessToken?: string;
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
  };
  environment: 'sandbox' | 'production';
  supportedMethods: PaymentMethod['type'][];
  fees: {
    pix: number;
    boleto: number;
    creditCard: number;
    debitCard: number;
  };
  webhookUrl?: string;
  isActive: boolean;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  amount: number;
  fees: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  gatewayData: any;
  errorCode?: string;
  errorMessage?: string;
  processedAt: Date;
}

// Invoice Types
export interface InvoiceItem {
  id: string;
  type: 'service' | 'product' | 'procedure' | 'consultation' | 'exam';
  code?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxable: boolean;
  category?: string;
  metadata?: {
    procedureCode?: string;
    professionalId?: string;
    duration?: number;
    location?: string;
  };
}

export interface InvoiceDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  reason: string;
  appliedBy: string;
  appliedAt: Date;
  maxAmount?: number;
}

export interface InvoicePaymentTerms {
  dueDate: Date;
  paymentMethods: PaymentMethod['type'][];
  installments?: {
    count: number;
    amount: number;
    dueDate: Date;
    interestRate?: number;
  }[];
  lateFee?: {
    type: 'percentage' | 'fixed';
    value: number;
    gracePeriodDays: number;
  };
  earlyPaymentDiscount?: {
    percentage: number;
    validUntil: Date;
  };
}

export interface InvoiceStatus {
  current:
    | 'draft'
    | 'pending'
    | 'sent'
    | 'viewed'
    | 'partial'
    | 'paid'
    | 'overdue'
    | 'cancelled';
  history: {
    status: InvoiceStatus['current'];
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }[];
  paymentStatus: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    lastPaymentDate?: Date;
  };
}

// Financial Analytics Types
export interface RevenueMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  netRevenue: number;
  grossMargin: number;
  averageTransactionValue: number;
  transactionCount: number;
  revenueByMethod: Record<PaymentMethod['type'], number>;
  revenueByCategory: Record<string, number>;
  revenueByProfessional: Record<string, number>;
  monthlyGrowth: number;
  yearOverYearGrowth: number;
}

export interface PaymentMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  averagePaymentTime: number;
  paymentsByMethod: Record<
    PaymentMethod['type'],
    {
      count: number;
      amount: number;
      successRate: number;
      averageTime: number;
    }
  >;
  paymentsByGateway: Record<
    string,
    {
      count: number;
      amount: number;
      fees: number;
      successRate: number;
    }
  >;
  refunds: {
    count: number;
    amount: number;
    rate: number;
  };
}

export interface CollectionMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalInvoiced: number;
  totalCollected: number;
  collectionRate: number;
  averageCollectionTime: number;
  overdueAmount: number;
  overdueRate: number;
  agingAnalysis: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90days: number;
  };
  collectionEfficiency: number;
}

// Compliance and Audit Types
export interface ComplianceCheck {
  id: string;
  type:
    | 'tax_calculation'
    | 'nfse_generation'
    | 'payment_processing'
    | 'data_privacy'
    | 'financial_reporting';
  status: 'compliant' | 'warning' | 'non_compliant';
  checkedAt: Date;
  checkedBy: string;
  details: {
    requirement: string;
    result: 'pass' | 'fail' | 'warning';
    evidence?: string;
    recommendation?: string;
  }[];
  overallScore: number;
  nextCheckDue: Date;
}

export interface AuditTrail {
  id: string;
  entityType: 'invoice' | 'payment' | 'refund' | 'adjustment';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'cancel';
  performedBy: string;
  performedAt: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// Reporting Types
export interface FinancialReportConfig {
  id: string;
  name: string;
  description: string;
  type:
    | 'revenue'
    | 'payments'
    | 'taxes'
    | 'reconciliation'
    | 'compliance'
    | 'custom';
  schedule: {
    frequency:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly'
      | 'on_demand';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
  };
  filters: {
    dateRange?: {
      type: 'fixed' | 'relative';
      startDate?: Date;
      endDate?: Date;
      relativePeriod?: string;
    };
    clinics?: string[];
    professionals?: string[];
    paymentMethods?: PaymentMethod['type'][];
    categories?: string[];
  };
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: {
    email: string;
    role: string;
    permissions: string[];
  }[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
}

export interface FinancialReportData {
  id: string;
  configId: string;
  generatedAt: Date;
  generatedBy: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalRevenue: number;
    totalPayments: number;
    totalTaxes: number;
    netIncome: number;
    transactionCount: number;
  };
  sections: {
    name: string;
    data: any;
    charts?: {
      type: 'line' | 'bar' | 'pie' | 'area';
      data: any;
      config: any;
    }[];
  }[];
  downloadUrl?: string;
  expiresAt?: Date;
}

// Integration Types
export interface BankIntegration {
  bankCode: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  accountNumber: string;
  agencyNumber: string;
  accountHolder: string;
  balance?: number;
  lastSync?: Date;
  isActive: boolean;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    certificate?: string;
    privateKey?: string;
  };
  supportedOperations: (
    | 'balance'
    | 'transactions'
    | 'payments'
    | 'transfers'
  )[];
}

export interface BankTransaction {
  id: string;
  bankTransactionId: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  balance: number;
  category?: string;
  paymentId?: string;
  invoiceId?: string;
  reconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: string;
}

// Error and Validation Types
export interface FinancialError {
  code: string;
  message: string;
  field?: string;
  value?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'business' | 'technical' | 'integration';
  timestamp: Date;
  context?: {
    invoiceId?: string;
    paymentId?: string;
    userId?: string;
    operation?: string;
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  validator?: (value: any) => boolean;
  parameters?: any;
}

// Configuration Types
export interface FinancialSystemSettings {
  general: {
    defaultCurrency: 'BRL' | 'USD' | 'EUR';
    timezone: string;
    dateFormat: string;
    numberFormat: string;
    fiscalYearStart: number; // Month (1-12)
  };
  invoicing: {
    autoNumbering: boolean;
    numberPrefix: string;
    numberPadding: number;
    defaultDueDays: number;
    allowPartialPayments: boolean;
    requireNFSe: boolean;
    defaultPaymentMethods: PaymentMethod['type'][];
  };
  payments: {
    autoReconciliation: boolean;
    reconciliationTolerance: number;
    defaultGateway: string;
    webhookRetries: number;
    paymentTimeout: number; // minutes
  };
  taxes: {
    defaultTaxRegime: BrazilianTaxInfo['taxRegime'];
    municipalTaxRate: number;
    automaticTaxCalculation: boolean;
    taxRounding: 'up' | 'down' | 'nearest';
  };
  compliance: {
    dataRetentionDays: number;
    auditLogRetentionDays: number;
    encryptSensitiveData: boolean;
    requireApprovalForRefunds: boolean;
    maxRefundAmount: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
    overdueReminders: {
      enabled: boolean;
      daysBefore: number[];
      daysAfter: number[];
    };
  };
}

// Export all types for easy importing
export type {
  Money,
  Address,
  TaxDocument,
  BrazilianTaxInfo,
  NFSeData,
  PaymentMethod,
  PaymentGatewayConfig,
  PaymentGatewayResponse,
  InvoiceItem,
  InvoiceDiscount,
  InvoicePaymentTerms,
  InvoiceStatus,
  RevenueMetrics,
  PaymentMetrics,
  CollectionMetrics,
  ComplianceCheck,
  AuditTrail,
  FinancialReportConfig,
  FinancialReportData,
  BankIntegration,
  BankTransaction,
  FinancialError,
  ValidationRule,
  FinancialSystemSettings,
};

// Utility type helpers
export type PaymentMethodType = PaymentMethod['type'];
export type InvoiceStatusType = InvoiceStatus['current'];
export type ComplianceStatus = ComplianceCheck['status'];
export type ReportType = FinancialReportConfig['type'];
export type AuditAction = AuditTrail['action'];

// Constants
export const PAYMENT_METHOD_TYPES = [
  'pix',
  'boleto',
  'credit_card',
  'debit_card',
  'cash',
  'insurance',
] as const;

export const INVOICE_STATUSES = [
  'draft',
  'pending',
  'sent',
  'viewed',
  'partial',
  'paid',
  'overdue',
  'cancelled',
] as const;

export const PAYMENT_GATEWAYS = [
  'mercado_pago',
  'pagseguro',
  'stripe',
  'cielo',
  'rede',
  'getnet',
] as const;

export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export const TAX_REGIMES = [
  'simples_nacional',
  'lucro_presumido',
  'lucro_real',
] as const;

import { z } from "zod";
import {
  DateSchema,
  NonNegativeNumberSchema,
  PositiveNumberSchema,
  UUIDSchema,
} from "../types";
import type { BaseEntity, BillingStatus } from "../types";

// Invoice and billing interfaces for aesthetic clinic
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  patientId: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: BillingStatus;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentTerms: string;
  notes?: string;
  isRecurring: boolean;
  parentInvoiceId?: string;
  cancelledDate?: Date;
  cancellationReason?: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  treatmentType?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  taxable: boolean;
}

export interface Payment extends BaseEntity {
  paymentNumber: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  reference?: string;
  notes?: string;
  processedBy: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
}
export interface TreatmentPackage extends BaseEntity {
  name: string;
  description: string;
  treatmentTypes: string[];
  totalSessions: number;
  validityMonths: number;
  originalPrice: number;
  packagePrice: number;
  savings: number;
  isActive: boolean;
  termsAndConditions: string;
  transferable: boolean;
  refundable: boolean;
  cancellationPolicy: string;
}

export interface PaymentPlan extends BaseEntity {
  invoiceId: string;
  patientId: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: InstallmentFrequency;
  startDate: Date;
  endDate: Date;
  status: PaymentPlanStatus;
  interestRate: number;
  lateFeeAmount: number;
  autoDebit: boolean;
  paymentMethodId?: string;
  installments: Installment[];
}

export interface Installment extends BaseEntity {
  paymentPlanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  paidAmount?: number;
  status: InstallmentStatus;
  lateFee?: number;
  paymentId?: string;
}

export interface Discount extends BaseEntity {
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number; // percentage or fixed amount
  minimumAmount?: number;
  maximumDiscount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  usedCount: number;
  applicableTreatments: string[];
  isActive: boolean;
  isFirstTimePatient: boolean;
  isBirthday: boolean;
  isReferral: boolean;
}
export interface Refund extends BaseEntity {
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  reason: string;
  refundDate: Date;
  refundMethod: PaymentMethod;
  status: RefundStatus;
  processedBy: string;
  transactionId?: string;
  notes?: string;
}

// Enums
export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PIX = "pix",
  BANK_TRANSFER = "bank_transfer",
  CHECK = "check",
  FINANCING = "financing",
  INSURANCE = "insurance",
  GIFT_CARD = "gift_card",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum InstallmentFrequency {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
}

export enum PaymentPlanStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DEFAULTED = "defaulted",
  CANCELLED = "cancelled",
  PAUSED = "paused",
}

export enum InstallmentStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  LATE = "late",
  WAIVED = "waived",
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  BUY_ONE_GET_ONE = "buy_one_get_one",
  PACKAGE_DEAL = "package_deal",
}

export enum RefundStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PROCESSED = "processed",
  REJECTED = "rejected",
  FAILED = "failed",
} // Validation schemas
export const InvoiceItemSchema = z.object({
  productId: UUIDSchema.optional(),
  treatmentType: z.string().optional(),
  description: z.string().min(1),
  quantity: PositiveNumberSchema,
  unitPrice: PositiveNumberSchema,
  discountAmount: NonNegativeNumberSchema.default(0),
  taxable: z.boolean().default(true),
});

export const CreateInvoiceSchema = z.object({
  patientId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  issueDate: DateSchema,
  dueDate: DateSchema,
  items: z.array(InvoiceItemSchema).min(1),
  discountAmount: NonNegativeNumberSchema.default(0),
  discountPercentage: z.number().min(0).max(100).default(0),
  paymentTerms: z.string().default("Net 30"),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
});

export const CreatePaymentSchema = z.object({
  invoiceId: UUIDSchema,
  amount: PositiveNumberSchema,
  paymentDate: DateSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  processedBy: UUIDSchema,
});

export const CreatePaymentPlanSchema = z.object({
  invoiceId: UUIDSchema,
  patientId: UUIDSchema,
  downPayment: NonNegativeNumberSchema,
  numberOfInstallments: z.number().min(2).max(24),
  frequency: z.nativeEnum(InstallmentFrequency),
  startDate: DateSchema,
  interestRate: z.number().min(0).max(50).default(0),
  lateFeeAmount: NonNegativeNumberSchema.default(0),
  autoDebit: z.boolean().default(false),
  paymentMethodId: UUIDSchema.optional(),
});

export const CreateTreatmentPackageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  treatmentTypes: z.array(z.string()).min(1),
  totalSessions: z.number().min(1).max(50),
  validityMonths: z.number().min(1).max(24),
  originalPrice: PositiveNumberSchema,
  packagePrice: PositiveNumberSchema,
  isActive: z.boolean().default(true),
  termsAndConditions: z.string().min(1),
  transferable: z.boolean().default(false),
  refundable: z.boolean().default(true),
  cancellationPolicy: z.string().min(1),
});

export const CreateDiscountSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  type: z.nativeEnum(DiscountType),
  value: PositiveNumberSchema,
  minimumAmount: PositiveNumberSchema.optional(),
  maximumDiscount: PositiveNumberSchema.optional(),
  validFrom: DateSchema,
  validTo: DateSchema,
  usageLimit: z.number().positive().optional(),
  applicableTreatments: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFirstTimePatient: z.boolean().default(false),
  isBirthday: z.boolean().default(false),
  isReferral: z.boolean().default(false),
});

export type CreateInvoiceData = z.infer<typeof CreateInvoiceSchema>;
export type CreatePaymentData = z.infer<typeof CreatePaymentSchema>;
export type CreatePaymentPlanData = z.infer<typeof CreatePaymentPlanSchema>;
export type CreateTreatmentPackageData = z.infer<
  typeof CreateTreatmentPackageSchema
>;
export type CreateDiscountData = z.infer<typeof CreateDiscountSchema>;

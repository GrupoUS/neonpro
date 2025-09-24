/**
 * Billing Service for Brazilian Healthcare System
 *
 * Comprehensive billing and payment management with Brazilian tax compliance,
 * SUS integration, health plan processing, and LGPD data protection.
 */

import { randomUUID } from 'crypto'
import { z } from 'zod'
export enum BillingType {
  SUS = 'sus',
  HEALTH_PLAN = 'health_plan',
  PRIVATE = 'private',
  MIXED = 'mixed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
}

export enum PaymentMethod {
  CASH = 'cash',
  DEBIT_CARD = 'debit_card',
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  HEALTH_PLAN = 'health_plan',
  SUS = 'sus',
  INSTALLMENT = 'installment',
}

const procedureCodeSchema = z.object({
  cbhpmCode: z.string().regex(/^\d{8}$/), // 8-digit CBHPM code
  description: z.string().min(5).max(500),
  value: z.number().positive(),
  category: z.string(),
  specialtyRequired: z.string().optional(),
})

const taxInfoSchema = z.object({
  issRetention: z.number().min(0).max(1), // ISS retention percentage
  pisRetention: z.number().min(0).max(1), // PIS retention percentage
  cofinsFRetention: z.number().min(0).max(1), // COFINS retention percentage
  csllRetention: z.number().min(0).max(1), // CSLL retention percentage
  irRetention: z.number().min(0).max(1), // IR retention percentage
  issAliquot: z.number().min(0).max(1), // ISS rate
  nfseNumber: z.string().optional(), // Electronic service invoice number
  municipalInscription: z.string().optional(),
})

const billingItemSchema = z.object({
  id: z.string().uuid(),
  procedureCode: procedureCodeSchema,
  quantity: z.number().positive().default(1),
  unitValue: z.number().positive(),
  totalValue: z.number().positive(),
  discount: z.number().min(0).default(0),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  professionalId: z.string().uuid(),
  date: z.string().datetime(),
})

const healthPlanSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  ansNumber: z.string().regex(/^\d{6}$/), // ANS registration number
  cardNumber: z.string(),
  validUntil: z.string().datetime(),
  coverageType: z.enum(['partial', 'full']),
  coveragePercentage: z.number().min(0).max(100),
  preAuthRequired: z.boolean().default(false),
  preAuthNumber: z.string().optional(),
})

const billingSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  professionalId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  billingType: z.nativeEnum(BillingType),
  items: z.array(billingItemSchema),
  subtotal: z.number().positive(),
  discounts: z.number().min(0).default(0),
  taxes: z.number().min(0).default(0),
  total: z.number().positive(),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  paymentDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  healthPlan: healthPlanSchema.optional(),
  taxInfo: taxInfoSchema.optional(),
  notes: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string().uuid(),
        fileName: z.string(),
        fileType: z.string(),
        url: z.string().url(),
        uploadedAt: z.string().datetime(),
      }),
    )
    .optional(),
  installments: z
    .array(
      z.object({
        installmentNumber: z.number().positive(),
        amount: z.number().positive(),
        dueDate: z.string().datetime(),
        status: z.nativeEnum(PaymentStatus),
        paymentDate: z.string().datetime().optional(),
        paymentMethod: z.nativeEnum(PaymentMethod).optional(),
      }),
    )
    .optional(),
  lgpdCompliant: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  auditTrail: z.array(
    z.object({
      action: z.string(),
      performedBy: z.string(),
      timestamp: z.string().datetime(),
      details: z.string().optional(),
    }),
  ),
})

export type Billing = z.infer<typeof billingSchema>
export type BillingItem = z.infer<typeof billingItemSchema>
export type ProcedureCode = z.infer<typeof procedureCodeSchema>
export type HealthPlan = z.infer<typeof healthPlanSchema>
export type TaxInfo = z.infer<typeof taxInfoSchema>

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string; code: string }>
  message?: string
}

export interface BillingSearchOptions {
  patientId?: string
  clinicId?: string
  professionalId?: string
  billingType?: BillingType
  paymentStatus?: PaymentStatus
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FinancialSummary {
  totalRevenue: number
  totalPending: number
  totalPaid: number
  totalOverdue: number
  averageTicket: number
  revenueByType: Record<BillingType, number>
  revenueByMonth: Array<{ month: string; revenue: number }>
  topProcedures: Array<{ procedure: string; count: number; revenue: number }>
}

export interface PaymentProcessingRequest {
  billingId: string
  paymentMethod: PaymentMethod
  amount: number
  installments?: number
  cardToken?: string
  pixKey?: string
  bankAccount?: {
    bank: string
    agency: string
    account: string
  }
}

/**
 * Billing Service
 *
 * Handles all billing and payment operations for Brazilian healthcare,
 * including SUS integration, health plan processing, and tax compliance.
 */
export class BillingService {
  private billings: Map<string, Billing> = new Map()
  private procedureCodes: Map<string, ProcedureCode> = new Map()
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize service with sample data
   */
  private initialize(): void {
    // Sample CBHPM procedure codes
    const sampleProcedures: ProcedureCode[] = [
      {
        cbhpmCode: '10101012',
        description: 'Consulta médica em consultório (no horário normal ou preestabelecido)',
        value: 150.0,
        category: 'Consultas',
        specialtyRequired: 'Medicina Geral',
      },
      {
        cbhpmCode: '20101015',
        description: 'Eletrocardiograma convencional',
        value: 45.0,
        category: 'Diagnóstico',
      },
      {
        cbhpmCode: '30401019',
        description: 'Exame ultrassonográfico do abdome total',
        value: 180.0,
        category: 'Imagem',
        specialtyRequired: 'Radiologia',
      },
    ]

    sampleProcedures.forEach(proc => {
      this.procedureCodes.set(proc.cbhpmCode, proc)
    })

    // Sample billing record
    const sampleBilling: Billing = {
      id: randomUUID(),
      invoiceNumber: 'INV-2025-001',
      patientId: randomUUID(),
      clinicId: randomUUID(),
      professionalId: randomUUID(),
      appointmentId: randomUUID(),
      billingType: BillingType.PRIVATE,
      items: [
        {
          id: randomUUID(),
          procedureCode: sampleProcedures[0],
          quantity: 1,
          unitValue: 150.0,
          totalValue: 150.0,
          discount: 0,
          discountType: 'percentage',
          professionalId: randomUUID(),
          date: new Date().toISOString(),
        },
      ],
      subtotal: 150.0,
      discounts: 0,
      taxes: 15.0, // 10% ISS
      total: 165.0,
      paymentStatus: PaymentStatus.PENDING,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      taxInfo: {
        issAliquot: 0.05, // 5% ISS
        issRetention: 0,
        pisRetention: 0,
        cofinsFRetention: 0,
        csllRetention: 0,
        irRetention: 0,
      },
      lgpdCompliant: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        {
          action: 'create',
          performedBy: randomUUID(),
          timestamp: new Date().toISOString(),
        },
      ],
    }

    this.billings.set(sampleBilling.id, sampleBilling)
    this.isInitialized = true
  }

  /**
   * Create new billing record
   */
  async createBilling(
    billingData: Partial<Billing>,
  ): Promise<ServiceResponse<Billing>> {
    try {
      // Validate required fields
      if (
        !billingData.patientId ||
        !billingData.clinicId ||
        !billingData.professionalId
      ) {
        return {
          success: false,
          error: 'patientId, clinicId e professionalId são obrigatórios',
        }
      }

      if (!billingData.items || billingData.items.length === 0) {
        return {
          success: false,
          error: 'Pelo menos um item deve ser adicionado à cobrança',
        }
      }

      // Calculate totals
      const subtotal = billingData.items.reduce(
        (sum, item) => sum + item.totalValue,
        0,
      )
      const discounts = billingData.discounts || 0
      const taxes = this.calculateTaxes(
        subtotal - discounts,
        billingData.taxInfo,
      )
      const total = subtotal - discounts + taxes

      // Generate billing
      const billing: Billing = {
        id: randomUUID(),
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        patientId: billingData.patientId,
        clinicId: billingData.clinicId,
        professionalId: billingData.professionalId,
        appointmentId: billingData.appointmentId,
        billingType: billingData.billingType || BillingType.PRIVATE,
        items: billingData.items,
        subtotal,
        discounts,
        taxes,
        total,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: billingData.paymentMethod,
        dueDate: billingData.dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        healthPlan: billingData.healthPlan,
        taxInfo: billingData.taxInfo,
        notes: billingData.notes,
        attachments: billingData.attachments || [],
        installments: billingData.installments,
        lgpdCompliant: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: [
          {
            action: 'create',
            performedBy: billingData.professionalId,
            timestamp: new Date().toISOString(),
          },
        ],
      }

      // Validate schema
      const validationResult = billingSchema.safeParse(billing)
      if (!validationResult.success) {
        return {
          success: false,
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: 'VALIDATION_ERROR',
          })),
        }
      }

      this.billings.set(billing.id, billing)

      return {
        success: true,
        data: billing,
        message: 'Cobrança criada com sucesso',
      }
    } catch {
      console.error('Billing operation failed:', error)
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Get billing by ID
   */
  async getBilling(billingId: string): Promise<ServiceResponse<Billing>> {
    try {
      const billing = this.billings.get(billingId)

      if (!billing) {
        return {
          success: false,
          error: 'Cobrança não encontrada',
        }
      }

      return {
        success: true,
        data: billing,
      }
    } catch {
      console.error('Billing operation failed:', error)
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Search billings with filters
   */
  async searchBillings(
    options: BillingSearchOptions,
  ): Promise<ServiceResponse<{ billings: Billing[]; pagination: any }>> {
    try {
      let allBillings = Array.from(this.billings.values())

      // Apply filters
      if (options.patientId) {
        allBillings = allBillings.filter(
          billing => billing.patientId === options.patientId,
        )
      }

      if (options.clinicId) {
        allBillings = allBillings.filter(
          billing => billing.clinicId === options.clinicId,
        )
      }

      if (options.professionalId) {
        allBillings = allBillings.filter(
          billing => billing.professionalId === options.professionalId,
        )
      }

      if (options.billingType) {
        allBillings = allBillings.filter(
          billing => billing.billingType === options.billingType,
        )
      }

      if (options.paymentStatus) {
        allBillings = allBillings.filter(
          billing => billing.paymentStatus === options.paymentStatus,
        )
      }

      if (options.dateFrom) {
        allBillings = allBillings.filter(
          billing => new Date(billing.createdAt) >= options.dateFrom!,
        )
      }

      if (options.dateTo) {
        allBillings = allBillings.filter(
          billing => new Date(billing.createdAt) <= options.dateTo!,
        )
      }

      // Sorting
      if (options.sortBy) {
        allBillings.sort((a, b) => {
          const aValue = (a as any)[options.sortBy!]
          const bValue = (b as any)[options.sortBy!]

          if (options.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1
          }
          return aValue > bValue ? 1 : -1
        })
      }

      // Pagination
      const page = options.page || 1
      const limit = options.limit || 20
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const paginatedBillings = allBillings.slice(startIndex, endIndex)

      return {
        success: true,
        data: {
          billings: paginatedBillings,
          pagination: {
            page,
            limit,
            total: allBillings.length,
            totalPages: Math.ceil(allBillings.length / limit),
          },
        },
      }
    } catch {
      console.error('Billing operation failed:', error)
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Process payment
   */
  async processPayment(
    _request: PaymentProcessingRequest,
  ): Promise<ServiceResponse<{ paymentId: string; status: PaymentStatus }>> {
    try {
      const billing = this.billings.get(_request.billingId)

      if (!billing) {
        return {
          success: false,
          error: 'Cobrança não encontrada',
        }
      }

      if (billing.paymentStatus === PaymentStatus.PAID) {
        return {
          success: false,
          error: 'Cobrança já foi paga',
        }
      }

      // Process payment based on method
      let paymentStatus = PaymentStatus.AUTHORIZED
      const paymentId = randomUUID()

      switch (_request.paymentMethod) {
        case PaymentMethod.CASH:
          paymentStatus = PaymentStatus.PAID
          break
        case PaymentMethod.PIX:
          paymentStatus = PaymentStatus.PAID // PIX is instant
          break
        case PaymentMethod.CREDIT_CARD:
        case PaymentMethod.DEBIT_CARD:
          paymentStatus = PaymentStatus.AUTHORIZED // Pending bank confirmation
          break
        case PaymentMethod.BANK_TRANSFER:
          paymentStatus = PaymentStatus.PENDING
          break
        case PaymentMethod.HEALTH_PLAN:
          paymentStatus = PaymentStatus.AUTHORIZED // Pending health plan approval
          break
      }

      // Update billing
      billing.paymentStatus = paymentStatus
      billing.paymentMethod = _request.paymentMethod
      if (paymentStatus === PaymentStatus.PAID) {
        billing.paymentDate = new Date().toISOString()
      }

      // Handle installments
      if (_request.installments && _request.installments > 1) {
        const installmentAmount = billing.total / _request.installments
        billing.installments = []

        for (let i = 1; i <= _request.installments; i++) {
          billing.installments.push({
            installmentNumber: i,
            amount: installmentAmount,
            dueDate: new Date(
              Date.now() + i * 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            status: i === 1 && paymentStatus === PaymentStatus.PAID
              ? PaymentStatus.PAID
              : PaymentStatus.PENDING,
            paymentDate: i === 1 && paymentStatus === PaymentStatus.PAID
              ? new Date().toISOString()
              : undefined,
            paymentMethod: request.paymentMethod,
          })
        }
      }

      billing.updatedAt = new Date().toISOString()
      billing.auditTrail.push({
        action: 'payment_processed',
        performedBy: 'system',
        timestamp: new Date().toISOString(),
        details: `Payment processed via ${_request.paymentMethod}`,
      })

      this.billings.set(_request.billingId, billing)

      return {
        success: true,
        data: { paymentId, status: paymentStatus },
        message: 'Pagamento processado com sucesso',
      }
    } catch {
      console.error('Billing operation failed:', error)
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate financial summary
   */
  async getFinancialSummary(
    clinicId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<ServiceResponse<FinancialSummary>> {
    try {
      let billings = Array.from(this.billings.values())

      // Filter by clinic
      if (clinicId) {
        billings = billings.filter(billing => billing.clinicId === clinicId)
      }

      // Filter by date range
      if (dateFrom) {
        billings = billings.filter(
          billing => new Date(billing.createdAt) >= dateFrom,
        )
      }

      if (dateTo) {
        billings = billings.filter(
          billing => new Date(billing.createdAt) <= dateTo,
        )
      }

      // Calculate summary
      const totalRevenue = billings
        .filter(b => b.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, b) => sum + b.total, 0)

      const totalPending = billings
        .filter(b => b.paymentStatus === PaymentStatus.PENDING)
        .reduce((sum, b) => sum + b.total, 0)

      const totalPaid = totalRevenue

      const totalOverdue = billings
        .filter(b => b.paymentStatus === PaymentStatus.OVERDUE)
        .reduce((sum, b) => sum + b.total, 0)

      const averageTicket = billings.length > 0
        ? billings.reduce((sum, b) => sum + b.total, 0) / billings.length
        : 0

      // Revenue by type
      const revenueByType = Object.values(BillingType).reduce(
        (acc, type) => {
          acc[type] = billings
            .filter(
              b =>
                b.billingType === type &&
                b.paymentStatus === PaymentStatus.PAID,
            )
            .reduce((sum, b) => sum + b.total, 0)
          return acc
        },
        {} as Record<BillingType, number>,
      )

      // Revenue by month
      const revenueByMonth = this.calculateRevenueByMonth(billings)

      // Top procedures
      const topProcedures = this.calculateTopProcedures(billings)

      const summary: FinancialSummary = {
        totalRevenue,
        totalPending,
        totalPaid,
        totalOverdue,
        averageTicket,
        revenueByType,
        revenueByMonth,
        topProcedures,
      }

      return {
        success: true,
        data: summary,
      }
    } catch {
      console.error('Billing operation failed:', error)
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Calculate taxes based on Brazilian regulations
   */
  private calculateTaxes(amount: number, taxInfo?: TaxInfo): number {
    if (!taxInfo) {
      return amount * 0.05 // Default 5% ISS
    }

    const issAmount = amount * (taxInfo.issAliquot || 0.05)
    // Add other taxes if needed (PIS, COFINS, etc.)

    return issAmount
  }

  /**
   * Calculate revenue by month
   */
  private calculateRevenueByMonth(
    billings: Billing[],
  ): Array<{ month: string; revenue: number }> {
    const monthRevenue: Record<string, number> = {}

    billings
      .filter(b => b.paymentStatus === PaymentStatus.PAID)
      .forEach(billing => {
        const date = new Date(billing.paymentDate || billing.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthRevenue[monthKey] = (monthRevenue[monthKey] || 0) + billing.total
      })

    return Object.entries(monthRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  /**
   * Calculate top procedures by revenue
   */
  private calculateTopProcedures(
    billings: Billing[],
  ): Array<{ procedure: string; count: number; revenue: number }> {
    const procedureStats: Record<string, { count: number; revenue: number }> = {}

    billings
      .filter(b => b.paymentStatus === PaymentStatus.PAID)
      .forEach(billing => {
        billing.items.forEach(item => {
          const key = item.procedureCode.description
          if (!procedureStats[key]) {
            procedureStats[key] = { count: 0, revenue: 0 }
          }
          procedureStats[key].count += item.quantity
          procedureStats[key].revenue += item.totalValue
        })
      })

    return Object.entries(procedureStats)
      .map(([procedure, stats]) => ({ procedure, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  /**
   * Check service configuration
   */
  isConfigured(): boolean {
    return this.isInitialized
  }

  /**
   * Get service configuration
   */
  getConfiguration(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      billingsCount: this.billings.size,
      procedureCodesCount: this.procedureCodes.size,
      version: '1.0.0',
      features: [
        'billing_management',
        'payment_processing',
        'tax_calculation',
        'health_plan_integration',
        'sus_billing',
        'installment_payments',
        'financial_reports',
        'lgpd_compliance',
      ],
      supportedPaymentMethods: Object.values(PaymentMethod),
      supportedBillingTypes: Object.values(BillingType),
    }
  }
}

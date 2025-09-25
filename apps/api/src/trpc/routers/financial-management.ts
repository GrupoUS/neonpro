/**
 * Financial Management tRPC Router
 * Complete financial operations for aesthetic clinics
 * Brazilian tax compliance and payment processing
 */

import { FinancialManagementService } from '@neonpro/business-services'
import {
  FinancialAccountInputSchema,
  FinancialGoalInputSchema,
  InvoiceInputSchema,
  PaymentTransactionInputSchema,
  ProfessionalCommissionInputSchema,
  ServicePriceInputSchema,
  TreatmentPackageInputSchema,
} from '@neonpro/business-services'
import { z } from 'zod'
import { createTRPCRouter } from '../../trpc'

// Response schemas
const SuccessResponseSchema = <T extends z.ZodSchemaAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  })

const FinancialAccountSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string(),
  account_type: z.enum(['checking', 'savings', 'investment', 'credit', 'loan']),
  account_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_branch: z.string().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  opening_balance: z.number(),
  current_balance: z.number(),
  is_active: z.boolean(),
  is_default: z.boolean(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
})

const ServicePriceSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  service_id: z.string().uuid(),
  professional_council_type: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']),
  base_price: z.number(),
  duration_minutes: z.number(),
  cost_of_materials: z.number(),
  professional_commission_rate: z.number(),
  clinic_revenue_rate: z.number(),
  is_active: z.boolean(),
  effective_date: z.string(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const TreatmentPackageSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  package_type: z.enum(['session_bundle', 'treatment_combo', 'membership', 'loyalty_reward']),
  total_sessions: z.number(),
  validity_days: z.number(),
  original_price: z.number(),
  package_price: z.number(),
  discount_percentage: z.number(),
  is_active: z.boolean(),
  max_packages_per_patient: z.number(),
  requirements: z.array(z.any()),
  benefits: z.array(z.any()),
  terms_conditions: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  item_type: z.enum(['service', 'product', 'package', 'adjustment', 'tax', 'discount']),
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  tax_rate: z.number(),
  tax_amount: z.number(),
  discount_amount: z.number(),
  discount_percentage: z.number(),
  net_amount: z.number(),
  reference_id: z.string().uuid().optional(),
  metadata: z.record(z.any()),
  created_at: z.string(),
})

const InvoiceSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_type: z.enum(['service', 'package', 'product', 'adjustment', 'refund']),
  status: z.enum(['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled', 'refunded']),
  issue_date: z.string(),
  due_date: z.string(),
  payment_date: z.string().optional(),
  subtotal: z.number(),
  discount_amount: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  paid_amount: z.number(),
  balance_due: z.number(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(InvoiceItemSchema),
})

const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  invoice_id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  transaction_id: z.string(),
  payment_method: z.enum([
    'credit_card',
    'debit_card',
    'bank_transfer',
    'pix',
    'boleto',
    'cash',
    'check',
    'installment',
  ]),
  payment_provider: z.enum(['stripe', 'mercadopago', 'pagseguro', 'manual']),
  status: z.enum([
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded',
    'chargeback',
  ]),
  amount: z.number(),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  installments: z.number(),
  installment_number: z.number(),
  total_installments: z.number(),
  fee_amount: z.number(),
  net_amount: z.number(),
  transaction_date: z.string(),
  settlement_date: z.string().optional(),
  failure_reason: z.string().optional(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
})

const ProfessionalCommissionSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  invoice_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  commission_type: z.enum(['service', 'product', 'package', 'bonus', 'adjustment']),
  base_amount: z.number(),
  commission_rate: z.number(),
  commission_amount: z.number(),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']),
  payment_date: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
})

const FinancialGoalSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string(),
  goal_type: z.enum(['revenue', 'profit', 'new_patients', 'retention_rate', 'average_ticket']),
  target_value: z.number(),
  current_value: z.number(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['active', 'completed', 'missed', 'cancelled']),
  progress_percentage: z.number(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const FinancialDashboardSchema = z.object({
  totalRevenue: z.number(),
  totalExpenses: z.number(),
  netProfit: z.number(),
  pendingInvoices: z.number(),
  overdueInvoices: z.number(),
  upcomingAppointments: z.number(),
  monthlyGrowth: z.number(),
  averageTicket: z.number(),
  topServices: z.array(z.object({
    service_name: z.string(),
    revenue: z.number(),
    count: z.number(),
  })),
})

const FinancialReportSchema = z.object({
  period: z.object({
    start_date: z.string(),
    end_date: z.string(),
    month: z.number(),
    year: z.number(),
  }),
  revenue: z.number(),
  expenses: z.number(),
  appointments: z.number(),
  new_patients: z.number(),
  average_ticket: z.number(),
  payment_methods: z.record(z.number()),
})

const TaxConfigurationSchema = z.object({
  id: z.string().uuid(),
  tax_type: z.enum(['iss', 'pis', 'cofins', 'csll', 'irpj', 'icms', 'ipi']),
  tax_rate: z.number(),
  is_active: z.boolean(),
  effective_date: z.string(),
  end_date: z.string().optional(),
  description: z.string().optional(),
})

const NFSeResponseSchema = z.object({
  nfse_number: z.string(),
  verification_code: z.string(),
  issuance_date: z.string(),
  pdf_url: z.string().optional(),
})

const BoletoResponseSchema = z.object({
  barcode: z.string(),
  digitable_line: z.string(),
  due_date: z.string(),
  amount: z.number(),
  pdf_url: z.string().optional(),
})

// Input schemas with Brazilian Portuguese validation messages
const CreateFinancialAccountInputSchema = FinancialAccountInputSchema.refine(
  data => {
    if (data.isDefault && data.accountType === 'credit') {
      return false
    }
    return true
  },
  {
    message: 'Contas de crédito não podem ser definidas como padrão',
    path: ['isDefault'],
  },
)

const CreateInvoiceInputSchema = InvoiceInputSchema.refine(
  data => {
    if (new Date(data.dueDate) < new Date(data.issueDate)) {
      return false
    }
    return true
  },
  {
    message: 'A data de vencimento não pode ser anterior à data de emissão',
    path: ['dueDate'],
  },
)

const CreatePaymentInputSchema = PaymentTransactionInputSchema.refine(
  data => {
    if (data.installmentNumber > data.totalInstallments) {
      return false
    }
    return true
  },
  {
    message: 'O número da parcela não pode ser maior que o total de parcelas',
    path: ['installmentNumber'],
  },
)

export const financialManagementRouter = createTRPCRouter({
  // Financial Account Management
  createFinancialAccount: {
    input: CreateFinancialAccountInputSchema,
    output: SuccessResponseSchema(FinancialAccountSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const account = await financialManagementService.createFinancialAccount(input)

        return {
          success: true,
          message: 'Conta financeira criada com sucesso',
          data: account,
        }
      } catch {
        console.error('Error creating financial account:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar conta financeira',
          data: null,
        }
      }
    },
  },

  updateFinancialAccount: {
    input: z.object({
      id: z.string().uuid(),
      updates: FinancialAccountInputSchema.partial(),
    }),
    output: SuccessResponseSchema(FinancialAccountSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const account = await financialManagementService.updateFinancialAccount(
          input.id,
          input.updates,
        )

        return {
          success: true,
          message: 'Conta financeira atualizada com sucesso',
          data: account,
        }
      } catch {
        console.error('Error updating financial account:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar conta financeira',
          data: null,
        }
      }
    },
  },

  getFinancialAccounts: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(FinancialAccountSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const accounts = await financialManagementService.getFinancialAccounts(input.clinicId)

        return {
          success: true,
          message: 'Contas financeiras recuperadas com sucesso',
          data: accounts,
        }
      } catch {
        console.error('Error fetching financial accounts:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar contas financeiras',
          data: null,
        }
      }
    },
  },

  // Service Pricing Management
  createServicePrice: {
    input: ServicePriceInputSchema.refine(
      data => {
        if (data.professionalCommissionRate + data.clinicRevenueRate > 100) {
          return false
        }
        return true
      },
      {
        message: 'A soma das taxas de comissão e receita não pode exceder 100%',
        path: ['professionalCommissionRate'],
      },
    ),
    output: SuccessResponseSchema(ServicePriceSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const price = await financialManagementService.createServicePrice(input)

        return {
          success: true,
          message: 'Preço de serviço criado com sucesso',
          data: price,
        }
      } catch {
        console.error('Error creating service price:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar preço de serviço',
          data: null,
        }
      }
    },
  },

  getServicePrices: {
    input: z.object({
      clinicId: z.string().uuid(),
      serviceId: z.string().uuid().optional(),
    }),
    output: SuccessResponseSchema(z.array(ServicePriceSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const prices = await financialManagementService.getServicePrices(
          input.clinicId,
          input.serviceId,
        )

        return {
          success: true,
          message: 'Preços de serviços recuperados com sucesso',
          data: prices,
        }
      } catch {
        console.error('Error fetching service prices:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar preços de serviços',
          data: null,
        }
      }
    },
  },

  // Treatment Package Management
  createTreatmentPackage: {
    input: TreatmentPackageInputSchema.refine(
      data => {
        if (data.packagePrice > data.originalPrice) {
          return false
        }
        return true
      },
      {
        message: 'O preço do pacote não pode ser maior que o preço original',
        path: ['packagePrice'],
      },
    ),
    output: SuccessResponseSchema(TreatmentPackageSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const pkg = await financialManagementService.createTreatmentPackage(input)

        return {
          success: true,
          message: 'Pacote de tratamento criado com sucesso',
          data: pkg,
        }
      } catch {
        console.error('Error creating treatment package:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar pacote de tratamento',
          data: null,
        }
      }
    },
  },

  getTreatmentPackages: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(TreatmentPackageSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const packages = await financialManagementService.getTreatmentPackages(input.clinicId)

        return {
          success: true,
          message: 'Pacotes de tratamento recuperados com sucesso',
          data: packages,
        }
      } catch {
        console.error('Error fetching treatment packages:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar pacotes de tratamento',
          data: null,
        }
      }
    },
  },

  // Invoice Management
  createInvoice: {
    input: CreateInvoiceInputSchema,
    output: SuccessResponseSchema(InvoiceSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const invoice = await financialManagementService.createInvoice(input)

        return {
          success: true,
          message: 'Fatura criada com sucesso',
          data: invoice,
        }
      } catch {
        console.error('Error creating invoice:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar fatura',
          data: null,
        }
      }
    },
  },

  getInvoice: {
    input: z.object({
      id: z.string().uuid(),
    }),
    output: SuccessResponseSchema(InvoiceSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const invoice = await financialManagementService.getInvoice(input.id)

        return {
          success: true,
          message: 'Fatura recuperada com sucesso',
          data: invoice,
        }
      } catch {
        console.error('Error fetching invoice:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar fatura',
          data: null,
        }
      }
    },
  },

  getInvoices: {
    input: z.object({
      clinicId: z.string().uuid(),
      status: z.enum(['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled', 'refunded'])
        .optional(),
      patientId: z.string().uuid().optional(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
    output: SuccessResponseSchema(z.array(InvoiceSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const invoices = await financialManagementService.getInvoices(input.clinicId, {
          status: input.status,
          patientId: input.patientId,
          startDate: input.startDate,
          endDate: input.endDate,
        })

        return {
          success: true,
          message: 'Faturas recuperadas com sucesso',
          data: invoices,
        }
      } catch {
        console.error('Error fetching invoices:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar faturas',
          data: null,
        }
      }
    },
  },

  // Payment Management
  createPaymentTransaction: {
    input: CreatePaymentInputSchema,
    output: SuccessResponseSchema(PaymentTransactionSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const payment = await financialManagementService.createPaymentTransaction(input)

        return {
          success: true,
          message: 'Transação de pagamento criada com sucesso',
          data: payment,
        }
      } catch {
        console.error('Error creating payment transaction:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar transação de pagamento',
          data: null,
        }
      }
    },
  },

  getPaymentTransactions: {
    input: z.object({
      clinicId: z.string().uuid(),
      status: z.enum([
        'pending',
        'processing',
        'succeeded',
        'failed',
        'cancelled',
        'refunded',
        'chargeback',
      ]).optional(),
      patientId: z.string().uuid().optional(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
    output: SuccessResponseSchema(z.array(PaymentTransactionSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const transactions = await financialManagementService.getPaymentTransactions(
          input.clinicId,
          {
            status: input.status,
            patientId: input.patientId,
            startDate: input.startDate,
            endDate: input.endDate,
          },
        )

        return {
          success: true,
          message: 'Transações de pagamento recuperadas com sucesso',
          data: transactions,
        }
      } catch {
        console.error('Error fetching payment transactions:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao buscar transações de pagamento',
          data: null,
        }
      }
    },
  },

  // Professional Commission Management
  createProfessionalCommission: {
    input: ProfessionalCommissionInputSchema,
    output: SuccessResponseSchema(ProfessionalCommissionSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const commission = await financialManagementService.createProfessionalCommission(input)

        return {
          success: true,
          message: 'Comissão profissional criada com sucesso',
          data: commission,
        }
      } catch {
        console.error('Error creating professional commission:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar comissão profissional',
          data: null,
        }
      }
    },
  },

  getProfessionalCommissions: {
    input: z.object({
      clinicId: z.string().uuid(),
      professionalId: z.string().uuid().optional(),
    }),
    output: SuccessResponseSchema(z.array(ProfessionalCommissionSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const commissions = await financialManagementService.getProfessionalCommissions(
          input.clinicId,
          input.professionalId,
        )

        return {
          success: true,
          message: 'Comissões profissionais recuperadas com sucesso',
          data: commissions,
        }
      } catch {
        console.error('Error fetching professional commissions:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao buscar comissões profissionais',
          data: null,
        }
      }
    },
  },

  // Financial Goals Management
  createFinancialGoal: {
    input: FinancialGoalInputSchema.refine(
      data => {
        if (new Date(data.endDate) < new Date(data.startDate)) {
          return false
        }
        return true
      },
      {
        message: 'A data final não pode ser anterior à data inicial',
        path: ['endDate'],
      },
    ),
    output: SuccessResponseSchema(FinancialGoalSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const goal = await financialManagementService.createFinancialGoal(input)

        return {
          success: true,
          message: 'Meta financeira criada com sucesso',
          data: goal,
        }
      } catch {
        console.error('Error creating financial goal:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar meta financeira',
          data: null,
        }
      }
    },
  },

  updateFinancialGoalProgress: {
    input: z.object({
      goalId: z.string().uuid(),
      currentValue: z.number().min(0),
    }),
    output: SuccessResponseSchema(FinancialGoalSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const goal = await financialManagementService.updateFinancialGoalProgress(
          input.goalId,
          input.currentValue,
        )

        return {
          success: true,
          message: 'Progresso da meta financeira atualizado com sucesso',
          data: goal,
        }
      } catch {
        console.error('Error updating financial goal progress:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao atualizar progresso da meta financeira',
          data: null,
        }
      }
    },
  },

  getFinancialGoals: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(FinancialGoalSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const goals = await financialManagementService.getFinancialGoals(input.clinicId)

        return {
          success: true,
          message: 'Metas financeiras recuperadas com sucesso',
          data: goals,
        }
      } catch {
        console.error('Error fetching financial goals:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar metas financeiras',
          data: null,
        }
      }
    },
  },

  // Financial Analytics and Reports
  generateFinancialReport: {
    input: z.object({
      clinicId: z.string().uuid(),
      reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    output: SuccessResponseSchema(FinancialReportSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const report = await financialManagementService.generateFinancialReport(
          input.clinicId,
          input.reportDate,
        )

        return {
          success: true,
          message: 'Relatório financeiro gerado com sucesso',
          data: report,
        }
      } catch {
        console.error('Error generating financial report:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar relatório financeiro',
          data: null,
        }
      }
    },
  },

  getFinancialDashboard: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(FinancialDashboardSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const dashboard = await financialManagementService.getFinancialDashboard(input.clinicId)

        return {
          success: true,
          message: 'Dashboard financeiro recuperado com sucesso',
          data: dashboard,
        }
      } catch {
        console.error('Error fetching financial dashboard:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar dashboard financeiro',
          data: null,
        }
      }
    },
  },

  // Tax Configuration Management
  getTaxConfigurations: {
    input: z.object({
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(z.array(TaxConfigurationSchema)),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const configurations = await financialManagementService.getTaxConfigurations(
          input.clinicId,
        )

        return {
          success: true,
          message: 'Configurações fiscais recuperadas com sucesso',
          data: configurations,
        }
      } catch {
        console.error('Error fetching tax configurations:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar configurações fiscais',
          data: null,
        }
      }
    },
  },

  // Brazilian Financial Operations
  generateNFSe: {
    input: z.object({
      invoiceId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(NFSeResponseSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const nfse = await financialManagementService.generateNFSe(input.invoiceId)

        return {
          success: true,
          message: 'NFSe gerada com sucesso',
          data: nfse,
        }
      } catch {
        console.error('Error generating NFSe:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar NFSe',
          data: null,
        }
      }
    },
  },

  processPixPayment: {
    input: z.object({
      amount: z.number().min(0.01),
      patientId: z.string().uuid(),
      invoiceId: z.string().uuid().optional(),
      clinicId: z.string().uuid(),
    }),
    output: SuccessResponseSchema(PaymentTransactionSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const payment = await financialManagementService.processPixPayment(input)

        return {
          success: true,
          message: 'Pagamento PIX processado com sucesso',
          data: payment,
        }
      } catch {
        console.error('Error processing PIX payment:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao processar pagamento PIX',
          data: null,
        }
      }
    },
  },

  calculateBoleto: {
    input: z.object({
      invoiceId: z.string().uuid(),
      dueDays: z.number().min(1).max(365).default(5),
    }),
    output: SuccessResponseSchema(BoletoResponseSchema),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const financialManagementService = new FinancialManagementService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const boleto = await financialManagementService.calculateBoleto(
          input.invoiceId,
          input.dueDays,
        )

        return {
          success: true,
          message: 'Boleto calculado com sucesso',
          data: boleto,
        }
      } catch {
        console.error('Error calculating boleto:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao calcular boleto',
          data: null,
        }
      }
    },
  },
})

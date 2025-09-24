/**
 * Billing API Routes
 *
 * RESTful API endpoints for billing and financial management with Brazilian
 * tax compliance, SUS integration, and health plan support.
 */

import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { auditLog } from '../../middleware/audit-log'
import { requireAuth } from '../../middleware/authn'
import { dataProtection } from '../../middleware/lgpd-middleware'
import { BillingService, PaymentMethod, PaymentStatus } from '../../services/billing-service'
import { badRequest, created, forbidden, notFound, ok, serverError } from '../../utils/responses'

// Initialize service
const billingService = new BillingService()

// Create router
const billing = new Hono()

// Apply middleware
billing.use('*', requireAuth)
billing.use('*', dataProtection.billing)
billing.use('*', auditLog('billing'))

// Validation schemas
const createInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  items: z
    .array(
      z.object({
        description: z.string().min(3).max(500),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        taxRate: z.number().min(0).max(1),
        susCode: z.string().optional(),
        cbhpmCode: z.string().optional(),
        tussCode: z.string().optional(),
      }),
    )
    .min(1),
  patientResponsibility: z.number().min(0),
  insuranceCoverage: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

const updateInvoiceSchema = createInvoiceSchema.partial().omit({
  patientId: true,
  clinicId: true,
})

const processPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  installments: z.number().int().positive().optional(),
})

const searchInvoicesSchema = z.object({
  patientId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  _query: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const financialReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  clinicId: z.string().uuid(),
  reportType: z.enum(['revenue', 'receivables', 'taxes', 'insurance']),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
})

/**
 * POST /billing/invoices
 * Create a new invoice
 */
billing.post(
  '/invoices',
  zValidator('json', createInvoiceSchema),
  async (c) => {
    try {
      const invoiceData = c.req.valid('json')
      const _userId = c.get('userId')

      const result = await billingService.createInvoice(invoiceData, _userId)

      if (!result.success) {
        return badRequest(
          c,
          result.error || 'Erro ao criar fatura',
          result.errors,
        )
      }

      return created(c, result.data, result.message)
    } catch {
      console.error('Error creating invoice:', error)
      return serverError(c, 'Erro interno do servidor')
    }
  },
)

/**
 * GET /billing/invoices/:id
 * Get a specific invoice by ID
 */
billing.get('/invoices/:id', async (c) => {
  try {
    const invoiceId = c.req.param('id')
    const _userId = c.get('userId')

    if (!invoiceId) {
      return badRequest(c, 'ID da fatura é obrigatório')
    }

    const result = await billingService.getInvoice(invoiceId, _userId)

    if (!result.success) {
      if (result.error?.includes('não encontrada')) {
        return notFound(c, result.error)
      }
      if (result.error?.includes('Acesso negado')) {
        return forbidden(c, result.error)
      }
      return badRequest(c, result.error || 'Erro ao buscar fatura')
    }

    return ok(c, result.data)
  } catch {
    console.error('Error fetching invoice:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * GET /billing/invoices
 * Search invoices with filters
 */
billing.get(
  '/invoices',
  zValidator('query', searchInvoicesSchema),
  async (c) => {
    try {
      const searchParams = c.req.valid('query')
      const _userId = c.get('userId')

      // Convert string dates to Date objects
      const options = {
        ...searchParams,
        dateFrom: searchParams.dateFrom
          ? new Date(searchParams.dateFrom)
          : undefined,
        dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
      }

      const result = await billingService.searchInvoices(options, _userId)

      if (!result.success) {
        return badRequest(c, result.error || 'Erro ao buscar faturas')
      }

      return ok(c, result.data)
    } catch {
      console.error('Error searching invoices:', error)
      return serverError(c, 'Erro interno do servidor')
    }
  },
)

/**
 * PUT /billing/invoices/:id
 * Update an invoice
 */
billing.put(
  '/invoices/:id',
  zValidator('json', updateInvoiceSchema),
  async (c) => {
    try {
      const invoiceId = c.req.param('id')
      const updateData = c.req.valid('json')
      const _userId = c.get('userId')

      if (!invoiceId) {
        return badRequest(c, 'ID da fatura é obrigatório')
      }

      const result = await billingService.updateInvoice(
        invoiceId,
        updateData,
        userId,
      )

      if (!result.success) {
        if (result.error?.includes('não encontrada')) {
          return notFound(c, result.error)
        }
        if (result.error?.includes('Acesso negado')) {
          return forbidden(c, result.error)
        }
        return badRequest(
          c,
          result.error || 'Erro ao atualizar fatura',
          result.errors,
        )
      }

      return ok(c, result.data, result.message)
    } catch {
      console.error('Error updating invoice:', error)
      return serverError(c, 'Erro interno do servidor')
    }
  },
)

/**
 * DELETE /billing/invoices/:id
 * Cancel an invoice (soft delete with audit trail)
 */
billing.delete('/invoices/:id', async (c) => {
  try {
    const invoiceId = c.req.param('id')
    const _userId = c.get('userId')

    if (!invoiceId) {
      return badRequest(c, 'ID da fatura é obrigatório')
    }

    const result = await billingService.cancelInvoice(invoiceId, _userId)

    if (!result.success) {
      if (result.error?.includes('não encontrada')) {
        return notFound(c, result.error)
      }
      if (result.error?.includes('Acesso negado')) {
        return forbidden(c, result.error)
      }
      return badRequest(c, result.error || 'Erro ao cancelar fatura')
    }

    return ok(c, { cancelled: true }, result.message)
  } catch {
    console.error('Error cancelling invoice:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * POST /billing/invoices/:id/payments
 * Process a payment for an invoice
 */
billing.post(
  '/invoices/:id/payments',
  zValidator('json', processPaymentSchema),
  async (c) => {
    try {
      const invoiceId = c.req.param('id')
      const paymentData = c.req.valid('json')
      const _userId = c.get('userId')

      if (!invoiceId) {
        return badRequest(c, 'ID da fatura é obrigatório')
      }

      const result = await billingService.processPayment(
        invoiceId,
        paymentData,
        userId,
      )

      if (!result.success) {
        if (result.error?.includes('não encontrada')) {
          return notFound(c, result.error)
        }
        return badRequest(
          c,
          result.error || 'Erro ao processar pagamento',
          result.errors,
        )
      }

      return created(c, result.data, result.message)
    } catch {
      console.error('Error processing payment:', error)
      return serverError(c, 'Erro interno do servidor')
    }
  },
)

/**
 * GET /billing/invoices/:id/payments
 * Get payment history for an invoice
 */
billing.get('/invoices/:id/payments', async (c) => {
  try {
    const invoiceId = c.req.param('id')
    const _userId = c.get('userId')

    if (!invoiceId) {
      return badRequest(c, 'ID da fatura é obrigatório')
    }

    const result = await billingService.getPaymentHistory(invoiceId, _userId)

    if (!result.success) {
      if (result.error?.includes('não encontrada')) {
        return notFound(c, result.error)
      }
      return badRequest(
        c,
        result.error || 'Erro ao buscar histórico de pagamentos',
      )
    }

    return ok(c, result.data)
  } catch {
    console.error('Error fetching payment history:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * GET /billing/reports/financial
 * Generate financial reports
 */
billing.get(
  '/reports/financial',
  zValidator('query', financialReportSchema),
  async (c) => {
    try {
      const reportParams = c.req.valid('query')
      const _userId = c.get('userId')

      // Convert string dates to Date objects
      const params = {
        ...reportParams,
        startDate: new Date(reportParams.startDate),
        endDate: new Date(reportParams.endDate),
      }

      const result = await billingService.generateFinancialReport(
        params,
        userId,
      )

      if (!result.success) {
        return badRequest(
          c,
          result.error || 'Erro ao gerar relatório financeiro',
        )
      }

      return ok(c, result.data)
    } catch {
      console.error('Error generating financial report:', error)
      return serverError(c, 'Erro interno do servidor')
    }
  },
)

/**
 * GET /billing/dashboard/stats
 * Get billing dashboard statistics
 */
billing.get('/dashboard/stats', async (c) => {
  try {
    const clinicId = c.get('clinicId')
    const _userId = c.get('userId')
    const period = (c.req.query('period') as 'day' | 'week' | 'month' | 'year') || 'month'

    const result = await billingService.getBillingStats(
      clinicId,
      userId,
      period,
    )

    if (!result.success) {
      return badRequest(c, result.error || 'Erro ao buscar estatísticas')
    }

    return ok(c, result.data)
  } catch {
    console.error('Error fetching billing stats:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * GET /billing/sus/procedures
 * Get SUS procedure codes
 */
billing.get('/sus/procedures', async (c) => {
  try {
    const query = c.req.query('q') || ''
    const limit = Number(c.req.query('limit')) || 50

    const result = await billingService.getSUSProcedures(query, limit)

    if (!result.success) {
      return badRequest(c, result.error || 'Erro ao buscar procedimentos SUS')
    }

    return ok(c, result.data)
  } catch {
    console.error('Error fetching SUS procedures:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * POST /billing/insurance/verify
 * Verify insurance coverage
 */
billing.post('/insurance/verify', async (c) => {
  try {
    const { patientId, procedureCode, insuranceCard } = await c.req.json()

    if (!patientId || !procedureCode || !insuranceCard) {
      return badRequest(
        c,
        'Dados de verificação obrigatórios: patientId, procedureCode, insuranceCard',
      )
    }

    const result = await billingService.verifyInsuranceCoverage(
      patientId,
      procedureCode,
      insuranceCard,
    )

    if (!result.success) {
      return badRequest(c, result.error || 'Erro ao verificar cobertura')
    }

    return ok(c, result.data)
  } catch {
    console.error('Error verifying insurance coverage:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

/**
 * GET /billing/tax/calculation
 * Calculate taxes for billing amount
 */
billing.get('/tax/calculation', async (c) => {
  try {
    const amount = Number(c.req.query('amount'))
    const serviceType = c.req.query('serviceType') || 'medical_consultation'

    if (!amount || amount <= 0) {
      return badRequest(c, 'Valor deve ser maior que zero')
    }

    const result = await billingService.calculateTaxes(amount, serviceType)

    if (!result.success) {
      return badRequest(c, result.error || 'Erro ao calcular impostos')
    }

    return ok(c, result.data)
  } catch {
    console.error('Error calculating taxes:', error)
    return serverError(c, 'Erro interno do servidor')
  }
})

export { billing }

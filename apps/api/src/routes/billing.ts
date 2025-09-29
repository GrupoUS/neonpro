/**
 * Billing Router - Comprehensive healthcare billing management
 *
 * Features:
 * - Brazilian healthcare billing with CBHPM procedure codes
 * - Multiple payment methods (PIX, cards, health plans, SUS)
 * - Tax calculation (ISS, PIS, COFINS, CSLL, IR)
 * - LGPD compliance with encrypted financial data
 * - Integration with existing BillingService
 * - OpenAPI documented endpoints
 *
 * @route /api/v1/billing
 */

import { BillingService } from '@/services/billing-service'
import { auditLogger } from '@/utils/audit-logger'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/auth.js'

const billing = new Hono()

// Input validation schemas
const CreateBillingSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),
  procedureCodes: z.array(z.string()),
  description: z.string().max(500),
  amount: z.number().positive(),
  paymentMethod: z.enum(
    'CASH',
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'HEALTH_PLAN',
    'SUS',
  ]),
  dueDate: z.string().datetime(),
  healthPlanCode: z.string().optional(),
  installments: z.number().min(1).max(12).optional(),
  notes: z.string().max(1000).optional(),
})

const PaymentProcessingSchema = z.object({
  billingId: z.string().uuid(),
  paymentMethod: z.enum(
    'CASH',
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'HEALTH_PLAN',
  ]),
  amount: z.number().positive(),
  transactionId: z.string().optional(),
  cardData: z.object({
    number: z.string().min(13).max(19),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
    cvv: z.string().min(3).max(4),
    holderName: z.string().min(2).max(100),
  }).optional(),
  bankData: z.object({
    bankCode: z.string().min(3).max(4),
    agency: z.string().min(1).max(10),
    account: z.string().min(1).max(20),
    accountType: z.enum('CHECKING', 'SAVINGS']),
  }).optional(),
})

// Response schemas
const BillingResponseSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),
  procedureCodes: z.array(z.string()),
  description: z.string(),
  amount: z.number(),
  status: z.enum('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']),
  paymentMethod: z.string(),
  dueDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  taxDetails: z.object({
    iss: z.number(),
    pis: z.number(),
    cofins: z.number(),
    csll: z.number(),
    ir: z.number(),
  }),
})

/**
 * GET /api/v1/billing - List billings with filtering
 */
billing.get('/', requireAuth, requirePermission('billing_read'), async c => {
  try {
    const userId = c.get('userId')
    const clinicId = c.get('clinicId')

    const query = c.req.query()
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const status = query.status as string
    const patientId = query.patientId as string

    const billingService = new BillingService()
    const result = await billingService.getBillings({
      clinicId,
      userId,
      page,
      limit,
      filters: { status, patientId },
    })

    // Log billing access for audit
    await auditLogger.logEvent('billing_list_access', {
      clinicId,
      userId,
      filters: { status, patientId, page, limit },
      resultCount: result.data?.length || 0,
    })

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Billings retrieved successfully',
    })
  } catch (error) {
    console.error('Error listing billings:', error)
    throw new HTTPException(500, {
      message: 'Failed to retrieve billings',
    })
  }
})

/**
 * POST /api/v1/billing - Create new billing
 */
billing.post('/', requireAuth, requirePermission('billing_create'), async c => {
  try {
    const userId = c.get('userId')
    const clinicId = c.get('clinicId')
    const ipAddress = c.req.header('X-Real-IP') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'

    const body = await c.req.json()
    const validatedData = CreateBillingSchema.parse(body)

    const billingService = new BillingService()
    const result = await billingService.createBilling({
      ...validatedData,
      userId,
      clinicId,
    })

    if (!result.success) {
      throw new HTTPException(400, {
        message: result.error || 'Failed to create billing',
      })
    }

    // Log billing creation for audit
    await auditLogger.logEvent('billing_created', {
      billingId: result.data?.id,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      clinicId,
      userId,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      ipAddress,
      userAgent,
    })

    return c.json({
      success: true,
      data: result.data,
      message: 'Billing created successfully',
    }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, {
        message: 'Validation error',
        details: error.errors,
      })
    }

    console.error('Error creating billing:', error)
    throw new HTTPException(500, {
      message: 'Failed to create billing',
    })
  }
})

/**
 * GET /api/v1/billing/:id - Get billing details
 */
billing.get('/:id', requireAuth, requirePermission('billing_read'), async c => {
  try {
    const billingId = c.req.param('id')
    const userId = c.get('userId')
    const clinicId = c.get('clinicId')

    const billingService = new BillingService()
    const result = await billingService.getBillingById(billingId, { userId, clinicId })

    if (!result.success) {
      throw new HTTPException(404, {
        message: 'Billing not found',
      })
    }

    // Log billing access for audit
    await auditLogger.logEvent('billing_detail_access', {
      billingId,
      userId,
      clinicId,
    })

    return c.json({
      success: true,
      data: result.data,
      message: 'Billing retrieved successfully',
    })
  } catch (error) {
    console.error('Error retrieving billing:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, {
      message: 'Failed to retrieve billing',
    })
  }
})

/**
 * POST /api/v1/billing/:id/payment - Process payment
 */
billing.post('/:id/payment', requireAuth, requirePermission('billing_payment'), async c => {
  try {
    const billingId = c.req.param('id')
    const userId = c.get('userId')
    const clinicId = c.get('clinicId')
    const ipAddress = c.req.header('X-Real-IP') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'

    const body = await c.req.json()
    const validatedData = PaymentProcessingSchema.parse({
      ...body,
      billingId,
    })

    const billingService = new BillingService()
    const result = await billingService.processPayment({
      ...validatedData,
      userId,
      clinicId,
    })

    if (!result.success) {
      throw new HTTPException(400, {
        message: result.error || 'Payment processing failed',
      })
    }

    // Log payment processing for audit
    await auditLogger.logEvent('payment_processed', {
      billingId,
      userId,
      clinicId,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      transactionId: validatedData.transactionId,
      ipAddress,
      userAgent,
    })

    return c.json({
      success: true,
      data: result.data,
      message: 'Payment processed successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, {
        message: 'Validation error',
        details: error.errors,
      })
    }

    console.error('Error processing payment:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, {
      message: 'Failed to process payment',
    })
  }
})

/**
 * GET /api/v1/billing/summary - Get financial summary
 */
billing.get('/summary', requireAuth, requirePermission('billing_read'), async c => {
  try {
    const userId = c.get('userId')
    const clinicId = c.get('clinicId')
    const query = c.req.query()
    const period = query.period as string || 'month' // day, week, month, year

    const billingService = new BillingService()
    const result = await billingService.getFinancialSummary(clinicId, { period })

    // Log summary access for audit
    await auditLogger.logEvent('billing_summary_access', {
      userId,
      clinicId,
      period,
    })

    return c.json({
      success: true,
      data: result.data,
      message: 'Financial summary retrieved successfully',
    })
  } catch (error) {
    console.error('Error retrieving financial summary:', error)
    throw new HTTPException(500, {
      message: 'Failed to retrieve financial summary',
    })
  }
})

/**
 * GET /api/v1/billing/procedures - List CBHPM procedure codes
 */
billing.get('/procedures', requireAuth, requirePermission('billing_read'), async c => {
  try {
    const query = c.req.query()
    const search = query.search as string
    const category = query.category as string

    const billingService = new BillingService()
    const result = await billingService.getProcedureCodes({ search, category })

    return c.json({
      success: true,
      data: result.data,
      message: 'Procedure codes retrieved successfully',
    })
  } catch (error) {
    console.error('Error retrieving procedure codes:', error)
    throw new HTTPException(500, {
      message: 'Failed to retrieve procedure codes',
    })
  }
})

export { billing }

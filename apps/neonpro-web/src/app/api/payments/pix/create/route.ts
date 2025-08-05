import { NextRequest, NextResponse } from 'next/server'
import { pixIntegration, PixPaymentData } from '@/lib/payments/gateways/pix-integration'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for PIX payment creation
const pixPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('BRL'),
  description: z.string().min(1, 'Description is required'),
  payerName: z.string().min(1, 'Payer name is required'),
  payerDocument: z.string().min(11, 'Valid CPF/CNPJ is required'),
  payerEmail: z.string().email('Valid email is required'),
  expirationMinutes: z.number().min(5).max(1440).default(30),
  additionalInfo: z.string().optional(),
  payableId: z.string().uuid().optional(), // Link to existing payable
  patientId: z.string().uuid().optional() // Link to patient
})

/**
 * POST /api/payments/pix/create
 * Create a new PIX payment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate user permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager', 'financial'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = pixPaymentSchema.parse(body)

    // Validate document format
    if (!isValidDocument(validatedData.payerDocument)) {
      return NextResponse.json(
        { error: 'Invalid CPF/CNPJ format' },
        { status: 400 }
      )
    }

    // Create PIX payment
    const pixPayment = await pixIntegration.createPayment(validatedData)

    // If linked to a payable, create the main payment record
    if (validatedData.payableId) {
      const { error: paymentError } = await supabase
        .from('ap_payments')
        .insert({
          payable_id: validatedData.payableId,
          amount: validatedData.amount,
          payment_method: 'pix',
          status: 'pending',
          pix_payment_id: pixPayment.id,
          notes: validatedData.additionalInfo,
          created_by: user.id
        })

      if (paymentError) {
        console.error('Failed to create main payment record:', paymentError)
        // Continue anyway - PIX payment was created successfully
      }
    }

    // Log the payment creation
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'pix_payments',
        record_id: pixPayment.id,
        action: 'CREATE',
        old_values: null,
        new_values: {
          amount: validatedData.amount,
          payer_name: validatedData.payerName,
          payer_email: validatedData.payerEmail
        },
        user_id: user.id
      })

    return NextResponse.json(pixPayment, { status: 201 })

  } catch (error) {
    console.error('PIX payment creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Validate Brazilian CPF or CNPJ document
 */
function isValidDocument(document: string): boolean {
  const cleanDoc = document.replace(/\D/g, '')
  
  if (cleanDoc.length === 11) {
    return isValidCPF(cleanDoc)
  } else if (cleanDoc.length === 14) {
    return isValidCNPJ(cleanDoc)
  }
  
  return false
}

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i)
  }
  
  let digit1 = 11 - (sum % 11)
  if (digit1 > 9) digit1 = 0
  
  if (parseInt(cpf[9]) !== digit1) {
    return false
  }
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i)
  }
  
  let digit2 = 11 - (sum % 11)
  if (digit2 > 9) digit2 = 0
  
  return parseInt(cpf[10]) === digit2
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i]
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  if (parseInt(cnpj[12]) !== digit1) {
    return false
  }
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i]
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  return parseInt(cnpj[13]) === digit2
}


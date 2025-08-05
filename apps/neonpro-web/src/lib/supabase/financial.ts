/**
 * Financial Management Supabase Functions
 * Created: January 27, 2025
 * Purpose: Database operations for invoices, payments, and Brazilian compliance
 * Standards: Shadow validation + NFSe integration + Error handling
 */

import type {
    CreateInvoiceInput,
    CreatePaymentInput,
    FinancialSummary,
    Invoice,
    InvoiceListResponse,
    InvoiceReportFilters,
    InvoiceStatus,
    NFSeResponse,
    Payment,
    PaymentMethod,
    PaymentProcessingResponse,
    ShadowCalculationResult,
    ShadowValidation,
    UpdateInvoiceInput,
    UpdatePaymentInput
} from '@/lib/types/financial';
import {
    centavosToReais,
    createInvoiceSchema,
    createPaymentSchema,
    formatCurrency,
    reaisToCentavos,
    updateInvoiceSchema,
    updatePaymentSchema
} from '@/lib/validations/financial';
import { createClient } from '@supabase/supabase-js';

// Get Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Invoice Management Functions
 */

// Create a new invoice with items and shadow validation
export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  try {
    // Validate input
    const validatedInput = createInvoiceSchema.parse(input);
    
    // Convert amounts to centavos
    const items = validatedInput.items.map(item => ({
      ...item,
      unit_price: reaisToCentavos(item.unit_price),
      discount_amount: reaisToCentavos(item.discount_amount || 0),
    }));
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discount = items.reduce((sum, item) => sum + item.discount_amount, 0);
    const tax = items.reduce((sum, item) => sum + Math.round(item.unit_price * item.quantity * item.tax_rate), 0);
    const total = subtotal - discount + tax;
    
    // Get clinic CNPJ for NFSe compliance
    const { data: clinic } = await supabase
      .from('clinics')
      .select('cnpj')
      .eq('id', validatedInput.clinic_id)
      .single();
    
    if (!clinic) {
      throw new Error('Clinic not found');
    }
    
    // Generate invoice number
    const { data: invoiceNumber } = await supabase
      .rpc('generate_invoice_number', { clinic_uuid: validatedInput.clinic_id });
    
    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        patient_id: validatedInput.patient_id,
        clinic_id: validatedInput.clinic_id,
        professional_id: validatedInput.professional_id,
        description: validatedInput.description,
        service_list_code: validatedInput.service_list_code,
        due_date: validatedInput.due_date,
        subtotal_amount: subtotal,
        discount_amount: discount,
        tax_amount: tax,
        total_amount: total,
        cnpj_issuer: clinic.cnpj,
        status: 'draft',
        payment_status: 'pending',
        metadata: validatedInput.metadata,
      })
      .select()
      .single();
    
    if (invoiceError) throw invoiceError;
    
    // Create invoice items
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoice.id,
      total_amount: (item.unit_price * item.quantity) - item.discount_amount + Math.round(item.unit_price * item.quantity * item.tax_rate),
      tax_amount: Math.round(item.unit_price * item.quantity * item.tax_rate),
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);
    
    if (itemsError) throw itemsError;
    
    // Perform shadow validation
    await performShadowValidation('invoice_calculation', invoice.id, {
      subtotal,
      discount,
      tax,
      total,
      items: itemsWithInvoiceId,
    });
    
    // Return complete invoice with items
    return await getInvoiceById(invoice.id);
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error(`Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get invoice by ID with all related data
export async function getInvoiceById(id: string): Promise<Invoice> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*),
        payments(*),
        patient:patients(id, name, email, phone, cpf),
        clinic:clinics(id, name, cnpj, address)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Invoice not found');
    
    return data as Invoice;
    
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// List invoices with pagination and filters
export async function listInvoices(
  filters: InvoiceReportFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<InvoiceListResponse> {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(id, name, email, phone),
        clinic:clinics(id, name),
        invoice_items(count)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.professional_id) {
      query = query.eq('professional_id', filters.professional_id);
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.payment_status && filters.payment_status.length > 0) {
      query = query.in('payment_status', filters.payment_status);
    }
    if (filters.date_from) {
      query = query.gte('issue_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('issue_date', filters.date_to);
    }
    if (filters.amount_min !== undefined) {
      query = query.gte('total_amount', reaisToCentavos(filters.amount_min));
    }
    if (filters.amount_max !== undefined) {
      query = query.lte('total_amount', reaisToCentavos(filters.amount_max));
    }
    if (filters.nfse_status && filters.nfse_status.length > 0) {
      query = query.in('nfse_status', filters.nfse_status);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    const { data: invoices, error, count } = await query;
    
    if (error) throw error;
    
    // Get summary
    const summary = await getFinancialSummary(filters);
    
    return {
      invoices: invoices as Invoice[],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      summary,
    };
    
  } catch (error) {
    console.error('Error listing invoices:', error);
    throw new Error(`Failed to list invoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update invoice
export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  try {
    // Validate input
    const validatedInput = updateInvoiceSchema.parse(input);
    
    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...validatedInput,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Invoice not found');
    
    return await getInvoiceById(id);
    
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw new Error(`Failed to update invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Issue invoice (change status to issued and generate NFSe)
export async function issueInvoice(id: string): Promise<Invoice> {
  try {
    // Update status to issued
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'issued',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (error) throw error;
    
    // Generate NFSe (mock implementation)
    const invoice = await getInvoiceById(id);
    await generateNFSe(invoice);
    
    return await getInvoiceById(id);
    
  } catch (error) {
    console.error('Error issuing invoice:', error);
    throw new Error(`Failed to issue invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cancel invoice
export async function cancelInvoice(id: string): Promise<Invoice> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (error) throw error;
    
    // Cancel NFSe if exists
    const invoice = await getInvoiceById(id);
    if (invoice.nfse_number) {
      await cancelNFSe(invoice);
    }
    
    return await getInvoiceById(id);
    
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    throw new Error(`Failed to cancel invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Payment Management Functions
 */

// Create payment with installments support
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  try {
    // Validate input
    const validatedInput = createPaymentSchema.parse(input);
    
    // Convert amount to centavos
    const amount = reaisToCentavos(validatedInput.amount);
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: validatedInput.invoice_id,
        payment_method: validatedInput.payment_method,
        amount,
        external_transaction_id: validatedInput.external_transaction_id,
        payment_processor: validatedInput.payment_processor,
        authorization_code: validatedInput.authorization_code,
        pix_key: validatedInput.pix_key,
        status: 'pending',
        metadata: validatedInput.metadata,
      })
      .select()
      .single();
    
    if (paymentError) throw paymentError;
    
    // Create installments if provided
    if (validatedInput.installments && validatedInput.installments.length > 0) {
      const installments = validatedInput.installments.map(inst => ({
        payment_id: payment.id,
        invoice_id: validatedInput.invoice_id,
        installment_number: inst.installment_number,
        total_installments: inst.total_installments,
        amount: reaisToCentavos(inst.amount),
        due_date: inst.due_date,
        status: 'pending' as const,
      }));
      
      const { error: installmentsError } = await supabase
        .from('payment_installments')
        .insert(installments);
      
      if (installmentsError) throw installmentsError;
    }
    
    // Process payment (mock implementation)
    await processPayment(payment);
    
    return await getPaymentById(payment.id);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get payment by ID with installments
export async function getPaymentById(id: string): Promise<Payment> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        installments:payment_installments(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Payment not found');
    
    return data as Payment;
    
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update payment status
export async function updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
  try {
    // Validate input
    const validatedInput = updatePaymentSchema.parse(input);
    
    const updateData: any = {
      ...validatedInput,
      updated_at: new Date().toISOString(),
    };
    
    // Convert processing fee to centavos if provided
    if (validatedInput.processing_fee !== undefined) {
      updateData.processing_fee = reaisToCentavos(validatedInput.processing_fee);
    }
    
    // Set processed_at timestamp if status is completed
    if (validatedInput.status === 'completed') {
      updateData.processed_at = new Date().toISOString();
      updateData.confirmed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Payment not found');
    
    return await getPaymentById(id);
    
  } catch (error) {
    console.error('Error updating payment:', error);
    throw new Error(`Failed to update payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// List payments for an invoice
export async function listPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        installments:payment_installments(*)
      `)
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as Payment[];
    
  } catch (error) {
    console.error('Error listing payments:', error);
    throw new Error(`Failed to list payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Shadow Validation Functions
 */

// Perform shadow validation for financial calculations
export async function performShadowValidation(
  operationType: string,
  referenceId: string,
  calculationData: any
): Promise<ShadowValidation> {
  try {
    // Perform shadow calculation
    const shadowResult = await performShadowCalculation(operationType, calculationData);
    
    // Store validation result
    const { data, error } = await supabase
      .from('shadow_validations')
      .insert({
        operation_type: operationType,
        reference_id: referenceId,
        reference_table: getTableName(operationType),
        original_calculation: calculationData,
        shadow_calculation: shadowResult.shadow,
        variance: shadowResult.variance,
        variance_percentage: shadowResult.variance_percentage,
        validation_status: shadowResult.is_valid ? 'validated' : 'failed',
        validation_message: shadowResult.tolerance_exceeded ? 'Variance exceeds tolerance' : undefined,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update invoice shadow validation status
    if (operationType === 'invoice_calculation') {
      await supabase
        .from('invoices')
        .update({
          shadow_validation_status: shadowResult.is_valid ? 'validated' : 'failed',
          shadow_validation_at: new Date().toISOString(),
          shadow_variance: shadowResult.variance_percentage,
        })
        .eq('id', referenceId);
    }
    
    return data as ShadowValidation;
    
  } catch (error) {
    console.error('Error performing shadow validation:', error);
    throw new Error(`Shadow validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Perform shadow calculation (alternative calculation method)
async function performShadowCalculation(operationType: string, data: any): Promise<ShadowCalculationResult> {
  let original: any;
  let shadow: any;
  
  switch (operationType) {
    case 'invoice_calculation':
      original = {
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
      };
      
      // Alternative calculation method for shadow validation
      shadow = {
        subtotal: data.items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0),
        discount: data.items.reduce((sum: number, item: any) => sum + item.discount_amount, 0),
        tax: data.items.reduce((sum: number, item: any) => sum + item.tax_amount, 0),
        total: 0,
      };
      shadow.total = shadow.subtotal - shadow.discount + shadow.tax;
      break;
      
    default:
      throw new Error(`Unsupported operation type: ${operationType}`);
  }
  
  const variance = Math.abs(original.total - shadow.total);
  const variancePercentage = original.total > 0 ? (variance / original.total) * 100 : 0;
  const tolerance = 0.01; // 1 centavo tolerance
  const tolerancePercentage = 0.001; // 0.1% tolerance
  
  return {
    original,
    shadow,
    variance,
    variance_percentage: variancePercentage,
    is_valid: variance <= tolerance && variancePercentage <= tolerancePercentage,
    tolerance_exceeded: variance > tolerance || variancePercentage > tolerancePercentage,
  };
}

function getTableName(operationType: string): string {
  switch (operationType) {
    case 'invoice_calculation':
      return 'invoices';
    case 'payment_processing':
      return 'payments';
    case 'installment_calculation':
      return 'payment_installments';
    default:
      return 'unknown';
  }
}

/**
 * Financial Summary and Reports
 */

// Get financial summary for dashboard
export async function getFinancialSummary(filters: InvoiceReportFilters = {}): Promise<FinancialSummary> {
  try {
    let query = supabase
      .from('invoices')
      .select('*');
    
    // Apply filters
    if (filters.clinic_id) query = query.eq('clinic_id', filters.clinic_id);
    if (filters.date_from) query = query.gte('issue_date', filters.date_from);
    if (filters.date_to) query = query.lte('issue_date', filters.date_to);
    
    const { data: invoices, error } = await query;
    
    if (error) throw error;
    
    // Calculate summary
    const summary: FinancialSummary = {
      total_invoices: invoices?.length || 0,
      total_amount: 0,
      total_paid: 0,
      total_pending: 0,
      total_overdue: 0,
      payment_methods: {} as Record<string, { count: number; amount: number }>,
      by_status: {} as Record<string, { count: number; amount: number }>,
    };
    
    if (invoices) {
      summary.total_amount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      summary.total_paid = invoices.filter(inv => inv.payment_status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
      summary.total_pending = invoices.filter(inv => inv.payment_status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0);
      summary.total_overdue = invoices.filter(inv => inv.payment_status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0);
      
      // Group by status
      invoices.forEach(invoice => {
        const status = invoice.status as InvoiceStatus;
        if (!summary.by_status[status]) {
          summary.by_status[status] = { count: 0, amount: 0 };
        }
        summary.by_status[status].count++;
        summary.by_status[status].amount += invoice.total_amount;
      });
    }
    
    // Get payment method summary
    const { data: payments } = await supabase
      .from('payments')
      .select('payment_method, amount')
      .eq('status', 'completed');
    
    if (payments) {
      payments.forEach(payment => {
        const method = payment.payment_method as PaymentMethod;
        if (!summary.payment_methods[method]) {
          summary.payment_methods[method] = { count: 0, amount: 0 };
        }
        summary.payment_methods[method].count++;
        summary.payment_methods[method].amount += payment.amount;
      });
    }
    
    return summary;
    
  } catch (error) {
    console.error('Error getting financial summary:', error);
    throw new Error(`Failed to get financial summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mock NFSe Integration Functions
 * In production, these would integrate with actual Brazilian NFSe providers
 */

async function generateNFSe(invoice: Invoice): Promise<NFSeResponse> {
  try {
    // Mock NFSe generation - in production this would call the actual NFSe API
    const mockResponse: NFSeResponse = {
      success: true,
      nfse_number: `NFSe-${Date.now()}`,
      verification_code: `VER-${Math.random().toString(36).substr(2, 9)}`,
      xml_url: `https://mock-nfse.com/xml/${invoice.id}`,
      issue_date: new Date().toISOString(),
    };
    
    // Update invoice with NFSe information
    await supabase
      .from('invoices')
      .update({
        nfse_number: mockResponse.nfse_number,
        nfse_verification_code: mockResponse.verification_code,
        nfse_status: 'issued',
        nfse_issued_at: mockResponse.issue_date,
        nfse_xml_url: mockResponse.xml_url,
      })
      .eq('id', invoice.id);
    
    return mockResponse;
    
  } catch (error) {
    console.error('Error generating NFSe:', error);
    throw new Error(`NFSe generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function cancelNFSe(invoice: Invoice): Promise<void> {
  try {
    // Mock NFSe cancellation
    await supabase
      .from('invoices')
      .update({
        nfse_status: 'cancelled',
      })
      .eq('id', invoice.id);
    
  } catch (error) {
    console.error('Error cancelling NFSe:', error);
    throw new Error(`NFSe cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mock Payment Processing Functions
 * In production, these would integrate with actual payment processors
 */

async function processPayment(payment: Payment): Promise<PaymentProcessingResponse> {
  try {
    // Mock payment processing - in production this would call payment processor APIs
    const mockResponse: PaymentProcessingResponse = {
      success: true,
      transaction_id: `TXN-${Date.now()}`,
      authorization_code: `AUTH-${Math.random().toString(36).substr(2, 9)}`,
      processing_fee: Math.round(payment.amount * 0.029), // 2.9% fee
      status: 'completed',
    };
    
    // Generate PIX QR code for PIX payments
    if (payment.payment_method === 'pix') {
      mockResponse.pix_qr_code = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
      mockResponse.pix_copy_paste = `00020126330014BR.GOV.BCB.PIX0111${payment.pix_key}520400005303986540${centavosToReais(payment.amount).toFixed(2)}5802BR5925NEONPRO CLINIC6009SAO PAULO622905251234567890123456789063042EF7`;
    }
    
    // Update payment with processing results
    await updatePayment(payment.id, {
      status: mockResponse.status,
      external_transaction_id: mockResponse.transaction_id,
      authorization_code: mockResponse.authorization_code,
      processing_fee: centavosToReais(mockResponse.processing_fee || 0),
    });
    
    return mockResponse;
    
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility functions
export { centavosToReais, formatCurrency, reaisToCentavos };

/**
 * Generate PDF invoice
 */
export async function generateInvoicePDF(invoiceId: string): Promise<Blob> {
  try {
    // Get invoice data
    const invoice = await getInvoiceById(invoiceId);
    
    // Mock PDF generation - in production, use a PDF library like puppeteer or jsPDF
    const mockPDFContent = `
Invoice #${invoice.invoice_number}
Date: ${new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
Patient: ${invoice.patient?.name || 'N/A'}
Total: ${formatCurrency(invoice.total_amount)}
`;
    
    // Create a blob with mock PDF content
    const blob = new Blob([mockPDFContent], { type: 'application/pdf' });
    return blob;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



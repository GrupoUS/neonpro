import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  type ReceiptData,
  ReceiptInvoiceManager,
  type TemplateOptions,
} from '@/lib/payments/receipts/receipt-invoice-manager';

// Validation schemas
const CreateDocumentSchema = z.object({
  type: z.enum(['receipt', 'invoice']),
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive(),
      taxRate: z.number().min(0).max(100).default(0),
      taxAmount: z.number().min(0).default(0),
    })
  ),
  dueDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  template: z
    .object({
      template: z
        .enum(['modern', 'classic', 'minimal', 'corporate'])
        .default('modern'),
      colors: z
        .object({
          primary: z.string(),
          secondary: z.string(),
          accent: z.string(),
        })
        .optional(),
      fonts: z
        .object({
          header: z.string(),
          body: z.string(),
        })
        .optional(),
    })
    .optional(),
});

const UpdateDocumentSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

const _SendEmailSchema = z.object({
  recipientEmail: z.string().email().optional(),
  customMessage: z.string().optional(),
});

const ListFiltersSchema = z.object({
  type: z.enum(['receipt', 'invoice']).optional(),
  status: z.string().optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Initialize services
function getReceiptInvoiceManager() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const companyInfo = {
    name: process.env.COMPANY_NAME || 'NeonPro',
    cnpj: process.env.COMPANY_CNPJ || '00.000.000/0001-00',
    address: process.env.COMPANY_ADDRESS || 'Rua Example, 123',
    city: process.env.COMPANY_CITY || 'São Paulo',
    state: process.env.COMPANY_STATE || 'SP',
    zipCode: process.env.COMPANY_ZIP_CODE || '01000-000',
    phone: process.env.COMPANY_PHONE,
    email: process.env.COMPANY_EMAIL,
    website: process.env.COMPANY_WEBSITE,
    logo: process.env.COMPANY_LOGO,
  };

  const nfseConfig = {
    enabled: process.env.NFSE_ENABLED === 'true',
    provider: (process.env.NFSE_PROVIDER as any) || 'ginfes',
    certificatePath: process.env.NFSE_CERTIFICATE_PATH,
    certificatePassword: process.env.NFSE_CERTIFICATE_PASSWORD,
    serviceCode: process.env.NFSE_SERVICE_CODE,
    cityCode: process.env.NFSE_CITY_CODE,
    environment: (process.env.NFSE_ENVIRONMENT as any) || 'sandbox',
  };

  const emailConfig = {
    enabled: process.env.EMAIL_ENABLED !== 'false',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.SMTP_FROM || 'noreply@neonpro.com',
    templates: {
      receipt: {
        subject: 'Recibo {{documentNumber}} - {{companyName}}',
        html: `
          <h2>Recibo de Pagamento</h2>
          <p>Olá {{customerName}},</p>
          <p>Segue em anexo o recibo {{documentNumber}} no valor de {{total}}.</p>
          <p>{{customMessage}}</p>
          <p>Atenciosamente,<br>{{companyName}}</p>
        `,
      },
      invoice: {
        subject: 'Fatura {{documentNumber}} - {{companyName}}',
        html: `
          <h2>Nova Fatura</h2>
          <p>Olá {{customerName}},</p>
          <p>Segue em anexo a fatura {{documentNumber}} no valor de {{total}}.</p>
          <p>Data de vencimento: {{dueDate}}</p>
          <p>{{customMessage}}</p>
          <p>Atenciosamente,<br>{{companyName}}</p>
        `,
      },
    },
  };

  return new ReceiptInvoiceManager(
    supabaseUrl,
    supabaseKey,
    companyInfo,
    nfseConfig,
    emailConfig
  );
}

// GET - List receipts/invoices with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Convert string parameters to appropriate types
    const filters = {
      ...queryParams,
      limit: queryParams.limit ? Number.parseInt(queryParams.limit, 10) : 20,
      offset: queryParams.offset ? Number.parseInt(queryParams.offset, 10) : 0,
      dateFrom: queryParams.dateFrom
        ? new Date(queryParams.dateFrom)
        : undefined,
      dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined,
    };

    const validatedFilters = ListFiltersSchema.parse(filters);

    const manager = getReceiptInvoiceManager();
    const result = await manager.listDocuments(validatedFilters);

    return NextResponse.json({
      success: true,
      data: result.documents,
      pagination: {
        total: result.total,
        limit: validatedFilters.limit,
        offset: validatedFilters.offset,
        hasMore:
          result.total > validatedFilters.offset + validatedFilters.limit,
      },
    });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new receipt/invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateDocumentSchema.parse(body);

    // Get customer information
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', validatedData.customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const taxTotal = validatedData.items.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    );
    const total = subtotal + taxTotal;

    // Generate document number
    const { data: numberResult } = await supabase.rpc(
      'generate_document_number',
      {
        doc_type: validatedData.type,
        prefix: validatedData.type === 'receipt' ? 'REC' : 'FAT',
      }
    );

    const documentId = crypto.randomUUID();

    // Prepare receipt data
    const receiptData: ReceiptData = {
      id: documentId,
      number:
        numberResult || `${validatedData.type.toUpperCase()}-${Date.now()}`,
      type: validatedData.type,
      date: new Date(),
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : undefined,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        document: customer.document,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zip_code,
        phone: customer.phone,
      },
      items: validatedData.items,
      subtotal,
      taxTotal,
      total,
      paymentMethod: validatedData.paymentMethod,
      paymentDate: validatedData.paymentDate
        ? new Date(validatedData.paymentDate)
        : undefined,
      status: 'draft',
      notes: validatedData.notes,
      terms: validatedData.terms,
    };

    // Template options
    const templateOptions: TemplateOptions = {
      template: validatedData.template?.template || 'modern',
      colors: validatedData.template?.colors || {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#10b981',
      },
      fonts: validatedData.template?.fonts || {
        header: 'Helvetica-Bold',
        body: 'Helvetica',
      },
    };

    const manager = getReceiptInvoiceManager();

    // Generate PDF
    const pdfResult = await manager.generatePDF(receiptData, templateOptions);

    if (!pdfResult.success) {
      return NextResponse.json({ error: pdfResult.error }, { status: 500 });
    }

    // Generate NFSe if enabled and type is invoice
    let nfseResult;
    if (validatedData.type === 'invoice') {
      nfseResult = await manager.generateNFSe(receiptData);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: documentId,
        number: receiptData.number,
        type: receiptData.type,
        status: receiptData.status,
        total,
        pdfGenerated: pdfResult.success,
        nfseGenerated: nfseResult?.success,
        nfseNumber: nfseResult?.nfseNumber,
      },
    });
  } catch (error) {
    console.error('Create document error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update document
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateDocumentSchema.parse(body);

    const manager = getReceiptInvoiceManager();

    // Update document
    if (validatedData.status) {
      const result = await manager.updateStatus(
        documentId,
        validatedData.status
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Update other fields
    const { data, error } = await supabase
      .from('receipts_invoices')
      .update({
        data: supabase.raw(`data || '${JSON.stringify(validatedData)}'::jsonb`),
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Update document error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document to check if it can be deleted
    const { data: document, error: fetchError } = await supabase
      .from('receipts_invoices')
      .select('status, pdf_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of draft documents
    if (document.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft documents can be deleted' },
        { status: 400 }
      );
    }

    // Delete PDF from storage
    if (document.pdf_path) {
      await supabase.storage.from('documents').remove([document.pdf_path]);
    }

    // Delete document
    const { error: deleteError } = await supabase
      .from('receipts_invoices')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

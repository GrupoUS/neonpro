import { renderToBuffer } from '@react-pdf/renderer';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { generateInvoicePDF } from '@/lib/payments/pdf';

/**
 * API para download de PDF de faturas
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autenticação
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair ID da fatura da URL
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID da fatura obrigatório' },
        { status: 400 },
      );
    }

    // Buscar dados da fatura
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `,
      )
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Fatura não encontrada' },
        { status: 404 },
      );
    }

    if (!invoice.profiles) {
      return NextResponse.json(
        { error: 'Dados do cliente não encontrados' },
        { status: 404 },
      );
    }

    // Gerar PDF
    try {
      const pdfDocument = generateInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        amount: invoice.total,
        description: invoice.description || 'Serviços prestados',
        dueDate: invoice.due_date,
        status: invoice.status,
        clientName: invoice.profiles.full_name || invoice.profiles.email,
        clientEmail: invoice.profiles.email,
        issuedAt: invoice.created_at,
      });

      const pdfBuffer = await renderToBuffer(pdfDocument);

      // Retornar PDF como resposta
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="fatura-${invoice.invoice_number}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch (_pdfError) {
      return NextResponse.json(
        { error: 'Falha ao gerar PDF' },
        { status: 500 },
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

/**
 * Endpoint para visualização de PDF (opcional)
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair dados do corpo da requisição
    const body = await request.json();
    const { invoiceId, preview = false } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID da fatura obrigatório' },
        { status: 400 },
      );
    }

    // Buscar dados da fatura
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `,
      )
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Fatura não encontrada' },
        { status: 404 },
      );
    }

    if (!invoice.profiles) {
      return NextResponse.json(
        { error: 'Dados do cliente não encontrados' },
        { status: 404 },
      );
    }

    // Gerar PDF
    try {
      const pdfDocument = generateInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        amount: invoice.total,
        description: invoice.description || 'Serviços prestados',
        dueDate: invoice.due_date,
        status: invoice.status,
        clientName: invoice.profiles.full_name || invoice.profiles.email,
        clientEmail: invoice.profiles.email,
        issuedAt: invoice.created_at,
      });

      const pdfBuffer = await renderToBuffer(pdfDocument);
      const base64Pdf = pdfBuffer.toString('base64');

      // Retornar PDF como base64 para preview
      if (preview) {
        return NextResponse.json({
          success: true,
          pdfData: `data:application/pdf;base64,${base64Pdf}`,
          fileName: `fatura-${invoice.invoice_number}.pdf`,
        });
      }

      // Retornar PDF como download
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="fatura-${invoice.invoice_number}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch (_pdfError) {
      return NextResponse.json(
        { error: 'Falha ao gerar PDF' },
        { status: 500 },
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

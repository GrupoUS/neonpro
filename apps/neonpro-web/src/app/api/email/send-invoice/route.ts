import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendInvoiceEmail } from '@/lib/payments/email';
import { generateInvoicePDF } from '@/lib/payments/pdf';
import { renderToBuffer } from '@react-pdf/renderer';
import { z } from 'zod';

const sendInvoiceSchema = z.object({
  invoiceId: z.string().uuid('ID da fatura inválido'),
  includeAttachment: z.boolean().optional().default(true)
});

/**
 * API para envio de emails de fatura
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Validar corpo da requisição
    const body = await request.json();
    const validation = sendInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    const { invoiceId, includeAttachment } = validation.data;

    // Buscar dados da fatura
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Fatura não encontrada' }, 
        { status: 404 }
      );
    }

    if (!invoice.profiles) {
      return NextResponse.json(
        { error: 'Dados do cliente não encontrados' }, 
        { status: 404 }
      );
    }

    let pdfBuffer: Buffer | null = null;

    // Gerar PDF se solicitado
    if (includeAttachment) {
      try {
        const pdfDocument = generateInvoicePDF({
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total,
          description: invoice.description || 'Serviços prestados',
          dueDate: invoice.due_date,
          status: invoice.status,
          clientName: invoice.profiles.full_name || invoice.profiles.email,
          clientEmail: invoice.profiles.email,
          issuedAt: invoice.created_at
        });

        pdfBuffer = await renderToBuffer(pdfDocument);
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        // Continuar sem anexo em caso de erro
        pdfBuffer = null;
      }
    }

    // Enviar email
    const emailResult = await sendInvoiceEmail({
      to: invoice.profiles.email,
      userName: invoice.profiles.full_name || invoice.profiles.email,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
      status: invoice.status,
      dueDate: invoice.due_date,
      pdfBuffer
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Falha ao enviar email' }, 
        { status: 500 }
      );
    }

    // Atualizar fatura para marcar que email foi enviado
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Erro ao atualizar fatura:', updateError);
      // Não falhar a requisição por isso
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      emailId: emailResult.id
    });

  } catch (error) {
    console.error('Erro ao enviar email de fatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

/**
 * Buscar histórico de emails enviados para uma fatura
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID da fatura obrigatório' }, 
        { status: 400 }
      );
    }

    // Verificar se a fatura pertence ao usuário
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, email_sent_at')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Fatura não encontrada' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      invoiceId: invoice.id,
      emailSentAt: invoice.email_sent_at,
      hasBeenSent: !!invoice.email_sent_at
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}


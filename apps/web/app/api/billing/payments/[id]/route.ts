import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

const UpdatePaymentSchema = z.object({
  status: z
    .enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
    .optional(),
  notes: z.string().optional(),
  processed_at: z.string().optional(),
  external_id: z.string().optional(),
  gateway: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        invoice:invoices(
          id,
          invoice_number,
          total_amount,
          status,
          issue_date,
          due_date,
          patient:profiles!invoices_patient_id_fkey(
            id,
            full_name,
            email,
            phone
          ),
          appointment:appointments(
            id,
            scheduled_for,
            status
          )
        ),
        installment_payments(
          id,
          installment_number,
          amount,
          due_date,
          status,
          payment_date,
          notes
        )
      `,
      )
      .eq('id', resolvedParams.id)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdatePaymentSchema.parse(body);

    // Get current payment data
    const { data: currentPayment, error: currentError } = await supabase
      .from('payments')
      .select('*, invoice:invoices(id, total_amount, status)')
      .eq('id', resolvedParams.id)
      .single();

    if (currentError || !currentPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // If status is being changed to completed, set processed_at
    if (
      validatedData.status === 'completed' &&
      currentPayment.status !== 'completed'
    ) {
      updateData.processed_at = new Date().toISOString();
    }

    // Update payment
    const { data: payment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select(
        `
        *,
        invoice:invoices(
          id,
          invoice_number,
          total_amount,
          status,
          patient:profiles!invoices_patient_id_fkey(
            full_name,
            email
          )
        )
      `,
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 },
      );
    }

    // If payment status changed to completed, check if invoice should be marked as paid
    if (
      validatedData.status === 'completed' &&
      currentPayment.status !== 'completed'
    ) {
      // Get all completed payments for this invoice
      const { data: completedPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', currentPayment.invoice_id)
        .eq('status', 'completed');

      if (!paymentsError && completedPayments) {
        const totalPaid = completedPayments.reduce(
          (sum, p) => sum + p.amount,
          0,
        );

        if (totalPaid >= currentPayment.invoice.total_amount) {
          await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', currentPayment.invoice_id);
        }
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payment details before deletion
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, invoice:invoices(id, total_amount)')
      .eq('id', resolvedParams.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Don't allow deletion of completed payments
    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete completed payments' },
        { status: 400 },
      );
    }

    // Delete related installment payments first
    const { error: installmentsError } = await supabase
      .from('installment_payments')
      .delete()
      .eq('payment_id', resolvedParams.id);

    if (installmentsError) {
      return NextResponse.json(
        { error: 'Failed to delete payment installments' },
        { status: 500 },
      );
    }

    // Delete payment
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete payment' },
        { status: 500 },
      );
    }

    // Update invoice status if needed
    const { data: remainingPayments, error: remainingError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', payment.invoice_id)
      .eq('status', 'completed');

    if (!remainingError) {
      const totalPaid =
        remainingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      if (totalPaid < payment.invoice.total_amount) {
        await supabase
          .from('invoices')
          .update({ status: 'pending' })
          .eq('id', payment.invoice_id);
      }
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// Refund payment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === 'refund') {
      const refundAmount = Number.parseFloat(body.amount) || 0;
      const reason = body.reason || 'Refund requested';

      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (paymentError || !payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 },
        );
      }

      if (payment.status !== 'completed') {
        return NextResponse.json(
          { error: 'Can only refund completed payments' },
          { status: 400 },
        );
      }

      if (refundAmount > payment.amount) {
        return NextResponse.json(
          { error: 'Refund amount cannot exceed payment amount' },
          { status: 400 },
        );
      }

      // Create refund payment (negative amount)
      const { data: refund, error: refundError } = await supabase
        .from('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: -refundAmount,
          method: payment.method,
          payment_date: new Date().toISOString(),
          status: 'completed',
          installments: 1,
          installment_number: 1,
          fees: 0,
          net_amount: -refundAmount,
          notes: `Refund of payment ${payment.payment_number}: ${reason}`,
          external_id: payment.external_id,
          gateway: payment.gateway,
          processed_at: new Date().toISOString(),
          created_by: user.id,
          clinic_id: user.id,
        })
        .select()
        .single();

      if (refundError) {
        return NextResponse.json(
          { error: 'Failed to create refund' },
          { status: 500 },
        );
      }

      // Update invoice status if needed
      const { data: allPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', payment.invoice_id)
        .eq('status', 'completed');

      if (!paymentsError && allPayments) {
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

        // Get invoice total
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('id', payment.invoice_id)
          .single();

        if (!invoiceError && invoice) {
          const newStatus =
            totalPaid >= invoice.total_amount ? 'paid' : 'pending';
          await supabase
            .from('invoices')
            .update({ status: newStatus })
            .eq('id', payment.invoice_id);
        }
      }

      return NextResponse.json({
        refund,
        message: 'Refund processed successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

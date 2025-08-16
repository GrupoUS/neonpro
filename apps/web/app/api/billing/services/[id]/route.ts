import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

const UpdateServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  service_type: z.enum(['procedure', 'consultation', 'package']).optional(),
  base_price: z.number().min(0, 'Preço deve ser positivo').optional(),
  duration_minutes: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  requires_appointment: z.boolean().optional(),
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

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
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
    const validatedData = UpdateServiceSchema.parse(body);

    const { data: service, error } = await supabase
      .from('services')
      .update(validatedData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 },
      );
    }

    return NextResponse.json({ service });
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

    // Check if service has related invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('service_id', resolvedParams.id)
      .limit(1);

    if (invoiceError) {
      return NextResponse.json(
        { error: 'Failed to check service relations' },
        { status: 500 },
      );
    }

    if (invoices && invoices.length > 0) {
      // Don't delete, just deactivate
      const { data: service, error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', resolvedParams.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to deactivate service' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        service,
        message: 'Service deactivated due to existing invoices',
      });
    }

    // Safe to delete
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

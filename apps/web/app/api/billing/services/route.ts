import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Validation schemas
const CreateServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().optional(),
  service_type: z.enum(['procedure', 'consultation', 'package']),
  base_price: z.number().min(0, 'Preço deve ser positivo'),
  duration_minutes: z.number().int().min(0).optional(),
  is_active: z.boolean().optional().default(true),
  requires_appointment: z.boolean().optional().default(true),
});

const _UpdateServiceSchema = CreateServiceSchema.partial();

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const category = searchParams.get('category');

    let query = supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateServiceSchema.parse(body);

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        ...validatedData,
        clinic_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Story 11.2: No-Show Prediction Interventions API
// Record and track intervention effectiveness

import { type NextRequest, NextResponse } from 'next/server';
import { InterventionCreateSchema } from '@/app/lib/validations/no-show-prediction';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    let query = supabase.from('no_show_interventions').select(`
        *,
        patient:patients(id, name, email, phone)
      `);

    // Apply filters
    if (searchParams.get('prediction_id')) {
      query = query.eq('prediction_id', searchParams.get('prediction_id'));
    }

    if (searchParams.get('patient_id')) {
      query = query.eq('patient_id', searchParams.get('patient_id'));
    }

    if (searchParams.get('type')) {
      query = query.eq('intervention_type', searchParams.get('type'));
    }

    if (searchParams.get('status')) {
      query = query.eq('status', searchParams.get('status'));
    }

    // Apply sorting and pagination
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: interventions, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch interventions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interventions: interventions || [],
      pagination: {
        page,
        limit,
        total: interventions?.length || 0,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = InterventionCreateSchema.parse(body);

    const { data: intervention, error } = await supabase
      .from('no_show_interventions')
      .insert({
        ...validatedData,
        created_by: session.user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create intervention' },
        { status: 500 }
      );
    }

    return NextResponse.json(intervention, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

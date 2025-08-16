/**
 * ANVISA Procedures API Route
 * Handles aesthetic procedure tracking, compliance verification, and documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI } from '@/lib/api/anvisa';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const patientId = searchParams.get('patient_id');
    const procedureCode = searchParams.get('procedure_code');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const filters = {
      clinicId,
      patientId: patientId || undefined,
      procedureCode: procedureCode || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    const procedures = await anvisaAPI.getProcedures(filters);
    return NextResponse.json({
      success: true,
      data: procedures,
      meta: { total: procedures.length, filters },
    });
  } catch (error) {
    console.error('Error in ANVISA procedures GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedures data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const procedureData = await request.json();

    // Validate required fields
    const requiredFields = [
      'clinic_id',
      'patient_id',
      'professional_id',
      'procedure_code',
    ];
    const missingFields = requiredFields.filter(
      (field) => !procedureData[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newProcedure = await anvisaAPI.registerProcedure(procedureData);
    return NextResponse.json(
      {
        success: true,
        data: newProcedure,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ANVISA procedures POST:', error);
    return NextResponse.json(
      { error: 'Failed to register procedure' },
      { status: 500 }
    );
  }
}

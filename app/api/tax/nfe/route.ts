// NFe Management API Endpoint
// Story 5.5: Manage Brazilian NFe (Electronic Invoice) documents

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { nfeService } from '@/lib/services/tax/nfe-service';
import { nfeCreateRequestSchema } from '@/lib/validations/brazilian-tax';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found or access denied' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('nfe_documents')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: nfeDocuments, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching NFe documents:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch NFe documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documents: nfeDocuments,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('NFe fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = nfeCreateRequestSchema.parse(body);

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', validatedData.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found or access denied' },
        { status: 404 }
      );
    }

    // Create NFe document using the service
    const nfeResult = await nfeService.createNFe(validatedData);

    // Store NFe document in database
    const { data: nfeRecord, error: insertError } = await supabase
      .from('nfe_documents')
      .insert({
        clinic_id: validatedData.clinic_id,
        number: nfeResult.number,
        series: nfeResult.series,
        status: nfeResult.status,
        customer_data: validatedData.customer_data,
        items: validatedData.items,
        totals: nfeResult.totals,
        nfe_xml: nfeResult.xml,
        access_key: nfeResult.accessKey,
        created_by: session.user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing NFe document:', insertError);
      return NextResponse.json(
        { error: 'Failed to store NFe document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nfe_id: nfeRecord.id,
        ...nfeResult
      }
    });

  } catch (error) {
    console.error('NFe creation error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
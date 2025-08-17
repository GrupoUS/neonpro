/**
 * ANVISA Product Batches API Route
 * Handles product batch tracking, lot management, and traceability
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
    const productId = searchParams.get('product_id');
    const batchNumber = searchParams.get('batch_number');
    const status = searchParams.get('status');
    const expiryStatus = searchParams.get('expiry_status');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const filters = {
      clinicId,
      productId: productId || undefined,
      batchNumber: batchNumber || undefined,
      status: status || undefined,
      expiryStatus: expiryStatus || undefined,
    };

    const batches = await anvisaAPI.getProductBatches(filters);
    return NextResponse.json({
      success: true,
      data: batches,
      meta: { total: batches.length, filters },
    });
  } catch (error) {
    console.error('Error in ANVISA batches GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch data' },
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

    const batchData = await request.json();

    // Validate required fields
    const requiredFields = [
      'clinic_id',
      'product_id',
      'batch_number',
      'expiry_date',
    ];
    const missingFields = requiredFields.filter((field) => !batchData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newBatch = await anvisaAPI.registerProductBatch(batchData);
    return NextResponse.json(
      {
        success: true,
        data: newBatch,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ANVISA batches POST:', error);
    return NextResponse.json(
      { error: 'Failed to register batch' },
      { status: 500 }
    );
  }
}

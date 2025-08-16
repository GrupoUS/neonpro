/**
 * ANVISA Products API Route
 * Handles ANVISA product registration, tracking, and inventory management
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI, ANVISAProductSchema } from '@/lib/api/anvisa';
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
    const nearingExpiry = searchParams.get('nearing_expiry');
    const daysAhead = searchParams.get('days_ahead');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Handle different query types
    if (nearingExpiry === 'true') {
      const days = daysAhead ? parseInt(daysAhead) : 30;
      const products = await anvisaAPI.getProductsNearingExpiry(clinicId, days);
      return NextResponse.json({
        success: true,
        data: products,
        meta: { type: 'nearing_expiry', days_ahead: days },
      });
    }

    const products = await anvisaAPI.getProducts(clinicId);
    return NextResponse.json({
      success: true,
      data: products,
      meta: { total: products.length },
    });
  } catch (error) {
    console.error('Error in ANVISA products GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    const body = await request.json();
    const { clinic_id, ...productData } = body;

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Validate product data
    const validationResult = ANVISAProductSchema.safeParse(productData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const product = await anvisaAPI.createProduct(
      clinic_id,
      validationResult.data
    );

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: 'Product registered successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ANVISA products POST:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

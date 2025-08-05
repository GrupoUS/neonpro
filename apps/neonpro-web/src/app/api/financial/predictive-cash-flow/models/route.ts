/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW API - MODELS ENDPOINT
 * =====================================================================================
 * 
 * API for managing prediction models and model performance tracking.
 * 
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * =====================================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Database } from '@/lib/database.types';

const getModelsSchema = z.object({
  active: z.string().optional().transform(val => val === 'true'),
  productionReady: z.string().optional().transform(val => val === 'true'),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);

    const validation = getModelsSchema.safeParse({
      active: searchParams.get('active'),
      productionReady: searchParams.get('productionReady'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { active, productionReady } = validation.data;

    let query = supabase
      .from('prediction_models')
      .select('*')
      .order('accuracy_rate', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    if (productionReady !== undefined) {
      query = query.eq('is_production_ready', productionReady);
    }

    const { data: models, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch models' },
        { status: 500 }
      );
    }

    return NextResponse.json({ models: models || [] });

  } catch (error) {
    console.error('Error in GET /api/financial/predictive-cash-flow/models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

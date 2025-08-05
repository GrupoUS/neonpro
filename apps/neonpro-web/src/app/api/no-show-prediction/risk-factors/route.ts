// Story 11.2: No-Show Prediction Risk Factors API
// Analyze and manage patient risk factors

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const RiskFactorQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  factor_type: z.string().optional(),
  min_impact: z.coerce.number().min(0).max(1).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = RiskFactorQuerySchema.parse(queryParams);

    let query = supabase
      .from('no_show_risk_factors')
      .select(`
        *,
        patient:patients(id, name, email, phone),
        prediction:no_show_predictions(id, risk_score, prediction_date)
      `);

    // Apply filters
    if (parsedQuery.patient_id) {
      query = query.eq('patient_id', parsedQuery.patient_id);
    }
    
    if (parsedQuery.factor_type) {
      query = query.eq('factor_type', parsedQuery.factor_type);
    }
    
    if (parsedQuery.min_impact !== undefined) {
      query = query.gte('impact_weight', parsedQuery.min_impact);
    }
    
    if (parsedQuery.date_from) {
      query = query.gte('created_at', parsedQuery.date_from);
    }
    
    if (parsedQuery.date_to) {
      query = query.lte('created_at', parsedQuery.date_to);
    }

    // Apply pagination
    const offset = (parsedQuery.page - 1) * parsedQuery.limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parsedQuery.limit - 1);

    const { data: riskFactors, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch risk factors' }, { status: 500 });
    }

    // Calculate summary statistics by factor type
    const factorTypeSummary = riskFactors?.reduce((acc, factor) => {
      const type = factor.factor_type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          total_impact: 0,
          average_impact: 0
        };
      }
      acc[type].count += 1;
      acc[type].total_impact += factor.impact_weight;
      acc[type].average_impact = acc[type].total_impact / acc[type].count;
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({
      risk_factors: riskFactors || [],
      summary: factorTypeSummary,
      pagination: {
        page: parsedQuery.page,
        limit: parsedQuery.limit,
        total: riskFactors?.length || 0
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

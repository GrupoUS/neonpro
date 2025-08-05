// Story 11.2: No-Show Prediction Analytics API
// Performance metrics and trend analysis

import { NextRequest, NextResponse } from 'next/server';
import { noShowPredictionEngine } from '@/app/lib/services/no-show-prediction';
import { GetAnalyticsQuerySchema, DashboardPeriodSchema } from '@/app/lib/validations/no-show-prediction';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate query parameters
    const parsedQuery = GetAnalyticsQuerySchema.parse({
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      min_accuracy: queryParams.min_accuracy ? parseFloat(queryParams.min_accuracy) : undefined
    });

    // Build analytics query
    let query = supabase
      .from('no_show_analytics')
      .select('*');

    // Apply filters
    if (parsedQuery.clinic_id) {
      query = query.eq('clinic_id', parsedQuery.clinic_id);
    }
    
    if (parsedQuery.date_from) {
      query = query.gte('date', parsedQuery.date_from);
    }
    
    if (parsedQuery.date_to) {
      query = query.lte('date', parsedQuery.date_to);
    }
    
    if (parsedQuery.min_accuracy !== undefined) {
      query = query.gte('accuracy_rate', parsedQuery.min_accuracy);
    }

    // Apply sorting
    query = query.order(parsedQuery.sort_by, { ascending: parsedQuery.sort_order === 'asc' });

    // Apply pagination
    const offset = (parsedQuery.page - 1) * parsedQuery.limit;
    query = query.range(offset, offset + parsedQuery.limit - 1);

    const { data: analytics, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Calculate summary statistics
    const summary = {
      total_records: analytics?.length || 0,
      average_accuracy: analytics?.reduce((sum, a) => sum + a.accuracy_rate, 0) / (analytics?.length || 1) || 0,
      total_cost_impact: analytics?.reduce((sum, a) => sum + a.cost_impact, 0) || 0,
      total_revenue_recovered: analytics?.reduce((sum, a) => sum + a.revenue_recovered, 0) || 0
    };

    // Calculate trends
    const trends = analytics?.map(a => ({
      date: a.date,
      metric: 'accuracy_rate',
      value: a.accuracy_rate,
      change_percentage: 0 // Would calculate based on previous period
    })) || [];

    return NextResponse.json({
      analytics: analytics || [],
      summary,
      trends,
      pagination: {
        page: parsedQuery.page,
        limit: parsedQuery.limit,
        total: summary.total_records
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

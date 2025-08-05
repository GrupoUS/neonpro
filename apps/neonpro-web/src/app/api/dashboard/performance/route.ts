import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const metricType = url.searchParams.get('metric_type');

    let query = supabase
      .from('dashboard_performance_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching performance logs:', error);
      return NextResponse.json({ error: 'Failed to fetch performance logs' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Dashboard performance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { metric_type, value, metadata } = body;

    if (!metric_type || value === undefined) {
      return NextResponse.json({ error: 'Metric type and value are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('dashboard_performance_logs')
      .insert([{
        metric_type,
        value: typeof value === 'number' ? value : parseFloat(value),
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating performance log:', error);
      return NextResponse.json({ error: 'Failed to create performance log' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Dashboard performance POST error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const olderThan = url.searchParams.get('older_than'); // ISO date string
    
    if (!olderThan) {
      return NextResponse.json({ error: 'older_than parameter is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('dashboard_performance_logs')
      .delete()
      .eq('user_id', user.id)
      .lt('timestamp', olderThan);

    if (error) {
      console.error('Error deleting performance logs:', error);
      return NextResponse.json({ error: 'Failed to delete performance logs' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Performance logs deleted successfully' });
  } catch (error) {
    console.error('Dashboard performance DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

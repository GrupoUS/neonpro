/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flags Management API
 *
 * Provides comprehensive feature flag management with gradual rollout
 * capability for safe enhancement implementation.
 */

import { type NextRequest, NextResponse } from 'next/server';
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

    const searchParams = request.nextUrl.searchParams;
    const environment = searchParams.get('environment');
    const epic_id = searchParams.get('epic_id');

    let query = supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (environment) {
      query = query.eq('environment', environment);
    }

    if (epic_id) {
      query = query.eq('epic_id', epic_id);
    }

    const { data: flags, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { flags: flags || [] },
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
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
    const {
      name,
      description,
      environment = 'development',
      epic_id,
      enabled = false,
      rollout_percentage = 0,
    } = body;

    // Validate required fields
    if (!(name && description)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Check if flag with same name exists in environment
    const { data: existingFlag } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('name', name)
      .eq('environment', environment)
      .single();

    if (existingFlag) {
      return NextResponse.json(
        {
          error:
            'Feature flag with this name already exists in this environment',
        },
        { status: 409 }
      );
    }

    // Create new feature flag
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .insert({
        name,
        description,
        environment,
        epic_id,
        enabled,
        rollout_percentage,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { flag },
      message: 'Feature flag created successfully',
    });
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    );
  }
}

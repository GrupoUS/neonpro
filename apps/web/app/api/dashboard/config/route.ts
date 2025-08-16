import { type NextRequest, NextResponse } from 'next/server';
import {
  createDashboardConfigSchema,
  updateDashboardConfigSchema,
} from '@/app/lib/validations/dashboard';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const configId = url.searchParams.get('id');

    if (configId) {
      // Get specific dashboard config
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('id', configId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch dashboard config' },
          { status: 500 },
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Dashboard config not found' },
          { status: 404 },
        );
      }

      return NextResponse.json(data);
    }
    // Get all dashboard configs for user
    const { data, error } = await supabase
      .from('dashboard_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboard configs' },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDashboardConfigSchema.parse(body);

    const { data, error } = await supabase
      .from('dashboard_configs')
      .insert([
        {
          ...validatedData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create dashboard config' },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateDashboardConfigSchema.parse(body);
    const { id, ...updateFields } = validatedData;

    const { data, error } = await supabase
      .from('dashboard_configs')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update dashboard config' },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Dashboard config not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const configId = url.searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('dashboard_configs')
      .delete()
      .eq('id', configId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete dashboard config' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Dashboard config deleted successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

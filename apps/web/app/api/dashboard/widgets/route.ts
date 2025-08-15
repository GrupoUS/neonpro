import { type NextRequest, NextResponse } from 'next/server';
import {
  createWidgetSchema,
  updateWidgetSchema,
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
    const configId = url.searchParams.get('config_id');
    const widgetId = url.searchParams.get('widget_id');

    if (widgetId) {
      // Get specific widget
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('id', widgetId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching widget:', error);
        return NextResponse.json(
          { error: 'Failed to fetch widget' },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Widget not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }
    if (configId) {
      // Get widgets for specific config
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('config_id', configId)
        .eq('user_id', user.id)
        .order('position');

      if (error) {
        console.error('Error fetching widgets:', error);
        return NextResponse.json(
          { error: 'Failed to fetch widgets' },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    }
    // Get all widgets for user
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching widgets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Dashboard widgets GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
    const validatedData = createWidgetSchema.parse(body);

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert([
        {
          ...validatedData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating widget:', error);
      return NextResponse.json(
        { error: 'Failed to create widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Dashboard widgets POST error:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
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
    const validatedData = updateWidgetSchema.parse(body);

    const url = new URL(request.url);
    const widgetId = url.searchParams.get('widget_id') || body.id;

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update(validatedData)
      .eq('id', widgetId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating widget:', error);
      return NextResponse.json(
        { error: 'Failed to update widget' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard widgets PUT error:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
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
    const widgetId = url.searchParams.get('widget_id');

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting widget:', error);
      return NextResponse.json(
        { error: 'Failed to delete widget' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('Dashboard widgets DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

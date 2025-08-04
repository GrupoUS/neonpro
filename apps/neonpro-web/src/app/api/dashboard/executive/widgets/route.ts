import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { WidgetService } from '@/lib/dashboard/executive/widget-service';

// Schema for widget creation/update
const CreateWidgetSchema = z.object({
  layoutId: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.enum([
    'kpi_card', 'line_chart', 'bar_chart', 'pie_chart',
    'area_chart', 'table', 'metric', 'gauge', 'heatmap'
  ]),
  category: z.enum(['financial', 'operational', 'patients', 'staff', 'general']),
  dataSource: z.object({
    type: z.enum(['kpi', 'query', 'api', 'static']),
    config: z.record(z.any())
  }),
  configuration: z.record(z.any()).default({}),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }),
  refreshInterval: z.number().min(30).default(300), // minimum 30 seconds
  cacheDuration: z.number().min(10).default(60) // minimum 10 seconds
});

const UpdateWidgetSchema = CreateWidgetSchema.partial();

// GET /api/dashboard/executive/widgets
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: 'Usuário não associado a uma clínica' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('layoutId');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const withData = searchParams.get('withData') === 'true';

    const widgetService = new WidgetService(supabase, clinicUser.clinic_id);
    
    // Build filter options
    const filters: any = {};
    if (layoutId) filters.layoutId = layoutId;
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (active !== null) filters.isActive = active === 'true';

    const widgets = await widgetService.getWidgets(filters);

    // Optionally fetch data for each widget
    if (withData) {
      const widgetsWithData = await Promise.all(
        widgets.map(async (widget) => {
          try {
            const data = await widgetService.getWidgetData(widget.id);
            return { ...widget, data };
          } catch (error) {
            console.error(`Error fetching data for widget ${widget.id}:`, error);
            return { ...widget, data: null, error: 'Erro ao carregar dados' };
          }
        })
      );
      return NextResponse.json({ widgets: widgetsWithData });
    }

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/executive/widgets
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: 'Usuário não associado a uma clínica' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateWidgetSchema.parse(body);

    const widgetService = new WidgetService(supabase, clinicUser.clinic_id);
    const widget = await widgetService.createWidget(validatedData);

    return NextResponse.json({ widget }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
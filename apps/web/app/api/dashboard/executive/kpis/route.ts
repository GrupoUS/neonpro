import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { KPICalculationService } from '@/lib/dashboard/executive/kpi-calculation-service';

// Schema for KPI calculation request
const CalculateKPIsSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  categories: z.array(z.enum(['financial', 'operational', 'patients', 'staff'])).optional(),
  kpiIds: z.array(z.string()).optional(),
  forceRecalculation: z.boolean().default(false)
});

// GET /api/dashboard/executive/kpis
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    // Get KPI definitions
    let query = supabase
      .from('kpi_definitions')
      .select('*')
      .eq('clinic_id', clinicUser.clinic_id)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: kpiDefinitions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ kpiDefinitions });
  } catch (error) {
    console.error('Error fetching KPI definitions:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/executive/kpis
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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
    const validatedData = CalculateKPIsSchema.parse(body);

    const kpiService = new KPICalculationService(supabase, clinicUser.clinic_id);
    
    // Calculate KPIs based on request
    const results = await kpiService.calculateKPIsForPeriod(
      new Date(validatedData.period.start),
      new Date(validatedData.period.end),
      {
        categories: validatedData.categories,
        kpiIds: validatedData.kpiIds,
        forceRecalculation: validatedData.forceRecalculation
      }
    );

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error calculating KPIs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
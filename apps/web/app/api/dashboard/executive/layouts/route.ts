import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DashboardLayoutEngine } from '@/lib/dashboard/executive/dashboard-layout-engine';

// Schema for layout creation/update
const CreateLayoutSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  layoutConfig: z.object({
    widgets: z
      .array(
        z.object({
          id: z.string(),
          position: z.object({
            x: z.number(),
            y: z.number(),
            w: z.number(),
            h: z.number(),
          }),
          config: z.record(z.any()),
        }),
      )
      .default([]),
  }),
});

const _UpdateLayoutSchema = CreateLayoutSchema.partial();

// GET /api/dashboard/executive/layouts
export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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
        { status: 403 },
      );
    }

    const layoutEngine = new DashboardLayoutEngine(
      supabase,
      clinicUser.clinic_id,
    );
    const layouts = await layoutEngine.getLayouts(user.id);

    return NextResponse.json({ layouts });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// POST /api/dashboard/executive/layouts
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateLayoutSchema.parse(body);

    const layoutEngine = new DashboardLayoutEngine(
      supabase,
      clinicUser.clinic_id,
    );
    const layout = await layoutEngine.createLayout({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json({ layout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

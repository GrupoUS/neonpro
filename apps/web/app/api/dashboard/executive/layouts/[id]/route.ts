import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DashboardLayoutEngine } from '@/lib/dashboard/executive/dashboard-layout-engine';

// Schema for layout update
const UpdateLayoutSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  layoutConfig: z
    .object({
      widgets: z.array(
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
      ),
    })
    .optional(),
});

type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/dashboard/executive/layouts/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
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
    const layout = await layoutEngine.getLayout(params.id);

    if (!layout) {
      return NextResponse.json(
        { error: 'Layout não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({ layout });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// PUT /api/dashboard/executive/layouts/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = UpdateLayoutSchema.parse(body);

    const layoutEngine = new DashboardLayoutEngine(
      supabase,
      clinicUser.clinic_id,
    );

    // Check if layout exists
    const existingLayout = await layoutEngine.getLayout(params.id);
    if (!existingLayout) {
      return NextResponse.json(
        { error: 'Layout não encontrado' },
        { status: 404 },
      );
    }

    const layout = await layoutEngine.updateLayout(params.id, validatedData);

    return NextResponse.json({ layout });
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

// DELETE /api/dashboard/executive/layouts/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    // Check if layout exists
    const existingLayout = await layoutEngine.getLayout(params.id);
    if (!existingLayout) {
      return NextResponse.json(
        { error: 'Layout não encontrado' },
        { status: 404 },
      );
    }

    // Prevent deletion of default layout
    if (existingLayout.isDefault) {
      return NextResponse.json(
        { error: 'Não é possível deletar o layout padrão' },
        { status: 400 },
      );
    }

    await layoutEngine.deleteLayout(params.id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

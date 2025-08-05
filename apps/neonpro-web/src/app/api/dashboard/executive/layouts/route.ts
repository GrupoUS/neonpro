import type { NextRequest } from "next/server";

// Schema for layout creation/update
const CreateLayoutSchema = z.object({
  name: z.string().min(1, "Nome Ã© obrigatÃ³rio"),
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
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from("clinic_users")
      .select("clinic_id")
      .eq("user_id", user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
        { status: 403 },
      );
    }

    const layoutEngine = new DashboardLayoutEngine(supabase, clinicUser.clinic_id);
    const layouts = await layoutEngine.getLayouts(user.id);

    return NextResponse.json({ layouts });
  } catch (error) {
    console.error("Error fetching layouts:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST /api/dashboard/executive/layouts
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from("clinic_users")
      .select("clinic_id")
      .eq("user_id", user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateLayoutSchema.parse(body);

    const layoutEngine = new DashboardLayoutEngine(supabase, clinicUser.clinic_id);
    const layout = await layoutEngine.createLayout({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json({ layout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invÃ¡lidos", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating layout:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

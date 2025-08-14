import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for financial settings
const UpdateFinancialSettingsSchema = z.object({
  company_name: z.string().min(1, "Nome da empresa é obrigatório").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  tax_rate: z.number().min(0).max(100, "Taxa não pode exceder 100%").optional(),
  default_payment_terms: z.string().optional(),
  invoice_prefix: z
    .string()
    .min(1, "Prefixo da fatura é obrigatório")
    .optional(),
  next_invoice_number: z
    .number()
    .int()
    .min(1, "Número da próxima fatura deve ser positivo")
    .optional(),
  payment_prefix: z
    .string()
    .min(1, "Prefixo do pagamento é obrigatório")
    .optional(),
  next_payment_number: z
    .number()
    .int()
    .min(1, "Número do próximo pagamento deve ser positivo")
    .optional(),
  default_due_days: z
    .number()
    .int()
    .min(1, "Dias de vencimento padrão deve ser positivo")
    .optional(),
  late_fee_percentage: z
    .number()
    .min(0)
    .max(100, "Taxa de atraso não pode exceder 100%")
    .optional(),
  discount_limit_percentage: z
    .number()
    .min(0)
    .max(100, "Limite de desconto não pode exceder 100%")
    .optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get financial settings for the clinic
    const { data: settings, error } = await supabase
      .from("financial_settings")
      .select("*")
      .eq("clinic_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No settings found, return default settings
      const defaultSettings = {
        clinic_id: user.id,
        company_name: "",
        address: "",
        phone: "",
        email: user.email || "",
        tax_rate: 0,
        default_payment_terms: "30 dias",
        invoice_prefix: "INV",
        next_invoice_number: 1,
        payment_prefix: "PAY",
        next_payment_number: 1,
        default_due_days: 30,
        late_fee_percentage: 0,
        discount_limit_percentage: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ settings: defaultSettings });
    }

    if (error) {
      console.error("Error fetching financial settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch financial settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateFinancialSettingsSchema.parse(body);

    // Check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from("financial_settings")
      .select("id")
      .eq("clinic_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking financial settings:", checkError);
      return NextResponse.json(
        { error: "Failed to check existing settings" },
        { status: 500 }
      );
    }

    let settings;
    let error;

    if (existingSettings) {
      // Update existing settings
      const { data, error: updateError } = await supabase
        .from("financial_settings")
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("clinic_id", user.id)
        .select()
        .single();

      settings = data;
      error = updateError;
    } else {
      // Create new settings
      const { data, error: insertError } = await supabase
        .from("financial_settings")
        .insert({
          clinic_id: user.id,
          company_name: "",
          address: "",
          phone: "",
          email: user.email || "",
          tax_rate: 0,
          default_payment_terms: "30 dias",
          invoice_prefix: "INV",
          next_invoice_number: 1,
          payment_prefix: "PAY",
          next_payment_number: 1,
          default_due_days: 30,
          late_fee_percentage: 0,
          discount_limit_percentage: 10,
          ...validatedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      settings = data;
      error = insertError;
    }

    if (error) {
      console.error("Error updating financial settings:", error);
      return NextResponse.json(
        { error: "Failed to update financial settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get next invoice/payment numbers
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action; // 'next_invoice_number' or 'next_payment_number'

    if (!["next_invoice_number", "next_payment_number"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get current settings
    const { data: settings, error: settingsError } = await supabase
      .from("financial_settings")
      .select("*")
      .eq("clinic_id", user.id)
      .single();

    if (settingsError) {
      console.error("Error fetching financial settings:", settingsError);
      return NextResponse.json(
        { error: "Failed to fetch financial settings" },
        { status: 500 }
      );
    }

    // Increment the appropriate counter
    const updateData: any = {};
    if (action === "next_invoice_number") {
      updateData.next_invoice_number = settings.next_invoice_number + 1;
    } else {
      updateData.next_payment_number = settings.next_payment_number + 1;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedSettings, error: updateError } = await supabase
      .from("financial_settings")
      .update(updateData)
      .eq("clinic_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating financial settings:", updateError);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings: updatedSettings,
      message: `${action} incremented successfully`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

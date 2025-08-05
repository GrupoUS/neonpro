// Tax Calculation API Endpoint
// Story 5.5: Calculate Brazilian taxes for services

import type { NextResponse } from "next/server";
import type { brazilianTaxEngine } from "@/lib/services/tax/tax-engine";
import type { createClient } from "@/lib/supabase/server";
import type { taxCalculationRequestSchema } from "@/lib/validations/brazilian-tax";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = taxCalculationRequestSchema.parse(body);

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", validatedData.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found or access denied" }, { status: 404 });
    }

    // Calculate taxes using the Brazilian tax engine
    const taxResult = await brazilianTaxEngine.calculateTaxes(validatedData);

    // Store calculation result in database
    const { data: calculationRecord, error: insertError } = await supabase
      .from("tax_calculations")
      .insert({
        clinic_id: validatedData.clinic_id,
        service_type: validatedData.service_type,
        base_amount: validatedData.amount,
        taxes: taxResult.taxes,
        total_amount: taxResult.totalAmount,
        calculation_metadata: taxResult,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing tax calculation:", insertError);
      return NextResponse.json({ error: "Failed to store calculation result" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        calculation_id: calculationRecord.id,
        ...taxResult,
      },
    });
  } catch (error) {
    console.error("Tax calculation error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

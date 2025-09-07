// NFe Cancellation API Endpoint
// Story 5.5: Cancel authorized NFe documents

import { createClient } from "@/app/utils/supabase/server";
import { nfeService } from "@/lib/services/tax/nfe-service";
import { NextResponse } from "next/server";
import { z } from "zod";

const cancelRequestSchema = z.object({
  reason: z
    .string()
    .min(15, "Reason must be at least 15 characters")
    .max(255, "Reason must be at most 255 characters"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; }>; },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = resolvedParams;
    const body = await request.json();

    // Validate request data
    const { reason } = cancelRequestSchema.parse(body);

    // Fetch NFe document
    const { data: nfeDocument, error: fetchError } = await supabase
      .from("nfe_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !nfeDocument) {
      return NextResponse.json(
        { error: "NFe document not found" },
        { status: 404 },
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", nfeDocument.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if NFe can be cancelled
    if (nfeDocument.status !== "authorized") {
      return NextResponse.json(
        { error: "Only authorized NFe documents can be cancelled" },
        {
          status: 400,
        },
      );
    }

    // Check cancellation window (usually 24 hours)
    const authDate = new Date(nfeDocument.authorization_date);
    const now = new Date();
    const hoursDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: "NFe can only be cancelled within 24 hours of authorization" },
        { status: 400 },
      );
    }

    // Cancel NFe with SEFAZ
    const cancelResult = await nfeService.cancelNFe(nfeDocument, reason);

    // Update NFe document with cancellation result
    const { data: updatedNfe, error: updateError } = await supabase
      .from("nfe_documents")
      .update({
        status: cancelResult.status === "cancelled" ? "cancelled" : "authorized",
        cancellation_code: cancelResult.id,
        cancellation_date: cancelResult.status === "cancelled"
          ? cancelResult.cancelled_at || new Date().toISOString()
          : undefined,
        cancellation_reason: cancelResult.cancellation_reason || reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update NFe document" },
        { status: 500 },
      );
    }

    // Log cancellation attempt
    await supabase.from("nfe_audit_log").insert({
      nfe_document_id: id,
      action: "cancel",
      user_id: session.user.id,
      result: cancelResult.status === "cancelled" ? "success" : "failure",
      details: { reason, ...cancelResult },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        nfe: updatedNfe,
        cancellation: cancelResult,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

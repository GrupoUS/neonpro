// NFe Authorization API Endpoint
// Story 5.5: Authorize NFe documents with SEFAZ

import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { nfeService } from "@/lib/services/tax/nfe-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = resolvedParams;

    // Fetch NFe document
    const { data: nfeDocument, error: fetchError } = await supabase
      .from("nfe_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !nfeDocument) {
      return NextResponse.json({ error: "NFe document not found" }, { status: 404 });
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

    // Check if NFe can be authorized
    if (nfeDocument.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft NFe documents can be authorized" },
        { status: 400 },
      );
    }

    // Authorize NFe with SEFAZ
    const authResult = await nfeService.authorizeNFe(nfeDocument);

    // Update NFe document with authorization result
    const { data: updatedNfe, error: updateError } = await supabase
      .from("nfe_documents")
      .update({
        status: authResult.success ? "authorized" : "rejected",
        authorization_code: authResult.authorizationCode,
        authorization_date: authResult.success ? new Date().toISOString() : null,
        rejection_reason: authResult.success ? null : authResult.error,
        sefaz_response: authResult.sefazResponse,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to update NFe document" }, { status: 500 });
    }

    // Log authorization attempt
    await supabase.from("nfe_audit_log").insert({
      nfe_document_id: id,
      action: "authorize",
      user_id: session.user.id,
      result: authResult.success ? "success" : "failure",
      details: authResult,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        nfe: updatedNfe,
        authorization: authResult,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

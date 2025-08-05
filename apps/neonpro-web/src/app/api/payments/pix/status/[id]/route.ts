import { type NextRequest, NextResponse } from "next/server";
import { pixIntegration } from "@/lib/payments/gateways/pix-integration";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/payments/pix/status/[id]
 * Get PIX payment status by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = params.id;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // Get payment status from PIX integration
    const paymentStatus = await pixIntegration.getPaymentStatus(paymentId);

    if (!paymentStatus) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify user has access to this payment
    const { data: pixPayment } = await supabase
      .from("pix_payments")
      .select("id, created_by, payer_email")
      .eq("id", paymentId)
      .single();

    if (!pixPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if user has permission to view this payment
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAuthorized =
      pixPayment.created_by === user.id ||
      ["admin", "manager", "financial"].includes(profile?.role || "");

    if (!isAuthorized) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return NextResponse.json(paymentStatus);
  } catch (error) {
    console.error("PIX payment status error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

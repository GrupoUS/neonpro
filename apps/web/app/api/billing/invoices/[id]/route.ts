import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateInvoiceSchema = z.object({
  status: z
    .enum(["draft", "pending", "paid", "overdue", "cancelled"])
    .optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        patient:profiles!invoices_patient_id_fkey(
          id,
          full_name,
          email,
          phone
        ),
        appointment:appointments(
          id,
          scheduled_for,
          status
        ),
        invoice_items(
          id,
          service_id,
          description,
          quantity,
          unit_price,
          discount_type,
          discount_value,
          total_amount,
          service:services(name, category)
        ),
        payments(
          id,
          payment_number,
          amount,
          method,
          status,
          payment_date,
          transaction_id,
          notes
        )
      `
      )
      .eq("id", resolvedParams.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateInvoiceSchema.parse(body);

    const resolvedParams = await params;
    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(validatedData)
      .eq("id", resolvedParams.id)
      .select(
        `
        *,
        patient:profiles!invoices_patient_id_fkey(
          id,
          full_name,
          email,
          phone
        ),
        invoice_items(
          id,
          service_id,
          description,
          quantity,
          unit_price,
          discount_type,
          discount_value,
          total_amount,
          service:services(name)
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json(
        { error: "Failed to update invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    // Check if invoice has payments
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("id")
      .eq("invoice_id", resolvedParams.id)
      .limit(1);

    if (paymentError) {
      console.error("Error checking invoice payments:", paymentError);
      return NextResponse.json(
        { error: "Failed to check invoice payments" },
        { status: 500 }
      );
    }

    if (payments && payments.length > 0) {
      // Don't delete, just mark as cancelled
      const { data: invoice, error } = await supabase
        .from("invoices")
        .update({ status: "cancelled" })
        .eq("id", resolvedParams.id)
        .select()
        .single();

      if (error) {
        console.error("Error cancelling invoice:", error);
        return NextResponse.json(
          { error: "Failed to cancel invoice" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        invoice,
        message: "Invoice cancelled due to existing payments",
      });
    }

    // First delete invoice items
    const { error: itemsError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", resolvedParams.id);

    if (itemsError) {
      console.error("Error deleting invoice items:", itemsError);
      return NextResponse.json(
        { error: "Failed to delete invoice items" },
        { status: 500 }
      );
    }

    // Then delete invoice
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", resolvedParams.id);

    if (error) {
      console.error("Error deleting invoice:", error);
      return NextResponse.json(
        { error: "Failed to delete invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

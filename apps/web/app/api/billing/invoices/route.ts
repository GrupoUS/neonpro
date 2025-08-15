import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const CreateInvoiceSchema = z.object({
  patient_id: z.string().uuid("ID do paciente inválido"),
  appointment_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z
    .array(
      z.object({
        service_id: z.string().uuid().optional(),
        description: z.string().min(1, "Descrição é obrigatória"),
        quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
        unit_price: z.number().min(0, "Preço unitário deve ser positivo"),
        discount_type: z.enum(["percentage", "fixed"]).optional(),
        discount_value: z.number().min(0).optional(),
      })
    )
    .min(1, "Pelo menos um item é obrigatório"),
});

const UpdateInvoiceSchema = z.object({
  status: z
    .enum(["draft", "pending", "paid", "overdue", "cancelled"])
    .optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const patientId = searchParams.get("patient_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
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
        ),
        payments(
          id,
          payment_number,
          amount,
          method,
          status,
          payment_date
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const validatedData = CreateInvoiceSchema.parse(body);

    // Start transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        patient_id: validatedData.patient_id,
        appointment_id: validatedData.appointment_id,
        status: "draft",
        issue_date: new Date().toISOString(),
        due_date:
          validatedData.due_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: validatedData.notes,
        payment_terms: validatedData.payment_terms,
        subtotal_amount: 0, // Will be calculated by trigger
        discount_amount: 0, // Will be calculated by trigger
        tax_amount: 0, // Will be calculated by trigger
        total_amount: 0, // Will be calculated by trigger
        clinic_id: user.id,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      );
    }

    // Add invoice items
    const items = validatedData.items.map((item) => ({
      invoice_id: invoice.id,
      service_id: item.service_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount_value: item.discount_value || 0,
      // total_amount will be calculated by trigger
      total_amount:
        item.unit_price * item.quantity - (item.discount_value || 0),
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(items);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // Rollback - delete the invoice
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json(
        { error: "Failed to create invoice items" },
        { status: 500 }
      );
    }

    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
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
      .eq("id", invoice.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete invoice:", fetchError);
      return NextResponse.json(
        { error: "Invoice created but failed to fetch complete data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice: completeInvoice }, { status: 201 });
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

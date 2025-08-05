import type { createClient } from "@/lib/supabase/server";
import type { NextResponse } from "next/server";
import type { z } from "zod";

// Validation schemas
const CreatePaymentSchema = z.object({
  invoice_id: z.string().uuid("ID da fatura inválido"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  method: z.enum(["cash", "card", "bank_transfer", "pix", "check"]),
  payment_date: z.string().optional(),
  installments: z.number().int().min(1).default(1),
  notes: z.string().optional(),
  external_id: z.string().optional(),
  gateway: z.string().optional(),
});

const UpdatePaymentSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
  notes: z.string().optional(),
  processed_at: z.string().optional(),
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
    const invoiceId = searchParams.get("invoice_id");
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("payments")
      .select(
        `
        *,
        invoice:invoices(
          id,
          invoice_number,
          total_amount,
          status,
          patient:profiles!invoices_patient_id_fkey(
            id,
            full_name,
            email
          )
        ),
        installment_payments(
          id,
          installment_number,
          amount,
          due_date,
          status,
          payment_date
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (method) {
      query = query.eq("method", method);
    }

    if (startDate && endDate) {
      query = query.gte("payment_date", startDate).lte("payment_date", endDate);
    } else if (startDate) {
      query = query.gte("payment_date", startDate);
    } else if (endDate) {
      query = query.lte("payment_date", endDate);
    }

    const { data: payments, error, count } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }

    // Calculate summary statistics
    const totalAmount =
      payments?.reduce(
        (sum, payment) => (payment.status === "completed" ? sum + payment.amount : sum),
        0,
      ) || 0;

    const pendingAmount =
      payments?.reduce(
        (sum, payment) =>
          ["pending", "processing"].includes(payment.status) ? sum + payment.amount : sum,
        0,
      ) || 0;

    return NextResponse.json({
      payments,
      summary: {
        total_amount: totalAmount,
        pending_amount: pendingAmount,
        completed_count: payments?.filter((p) => p.status === "completed").length || 0,
        total_count: count || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const validatedData = CreatePaymentSchema.parse(body);

    // Verify invoice exists and get details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, total_amount, status")
      .eq("id", validatedData.invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if payment amount exceeds remaining balance
    const { data: existingPayments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount")
      .eq("invoice_id", validatedData.invoice_id)
      .eq("status", "completed");

    if (paymentsError) {
      console.error("Error checking existing payments:", paymentsError);
      return NextResponse.json({ error: "Failed to check existing payments" }, { status: 500 });
    }

    const paidAmount = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remainingBalance = invoice.total_amount - paidAmount;

    if (validatedData.amount > remainingBalance) {
      return NextResponse.json(
        {
          error: "Payment amount exceeds remaining balance",
          remaining_balance: remainingBalance,
        },
        { status: 400 },
      );
    }

    // Calculate net amount (amount - fees)
    const netAmount =
      validatedData.amount -
      (validatedData.gateway === "stripe" ? validatedData.amount * 0.029 : 0);

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id: validatedData.invoice_id,
        amount: validatedData.amount,
        method: validatedData.method,
        payment_date: validatedData.payment_date || new Date().toISOString(),
        status: validatedData.method === "cash" ? "completed" : "pending",
        installments: validatedData.installments,
        installment_number: 1,
        fees: validatedData.gateway === "stripe" ? validatedData.amount * 0.029 : 0,
        net_amount: netAmount,
        notes: validatedData.notes,
        external_id: validatedData.external_id,
        gateway: validatedData.gateway,
        processed_at: validatedData.method === "cash" ? new Date().toISOString() : null,
        created_by: user.id,
        clinic_id: user.id,
      })
      .select(
        `
        *,
        invoice:invoices(
          id,
          invoice_number,
          total_amount,
          status,
          patient:profiles!invoices_patient_id_fkey(
            full_name,
            email
          )
        )
      `,
      )
      .single();

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    // If payment is completed and covers full invoice amount, update invoice status
    if (payment.status === "completed") {
      const newPaidAmount = paidAmount + validatedData.amount;
      if (newPaidAmount >= invoice.total_amount) {
        await supabase
          .from("invoices")
          .update({ status: "paid" })
          .eq("id", validatedData.invoice_id);
      }
    }

    // Create installment payments if needed
    if (validatedData.installments > 1) {
      const installmentAmount = validatedData.amount / validatedData.installments;
      const installments = [];

      for (let i = 2; i <= validatedData.installments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        installments.push({
          payment_id: payment.id,
          invoice_id: validatedData.invoice_id,
          installment_number: i,
          amount: installmentAmount,
          due_date: dueDate.toISOString(),
          status: "pending",
        });
      }

      if (installments.length > 0) {
        const { error: installmentsError } = await supabase
          .from("installment_payments")
          .insert(installments);

        if (installmentsError) {
          console.error("Error creating installments:", installmentsError);
          // Don't fail the payment creation, just log the error
        }
      }
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

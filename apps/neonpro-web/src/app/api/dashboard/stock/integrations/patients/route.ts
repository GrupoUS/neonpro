import type { createClient } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const includeHistory = searchParams.get("includeHistory") === "true";

    if (patientId) {
      // Buscar uso de materiais por paciente específico
      const { data: patientUsage, error } = await supabase
        .from("stock_movements")
        .select(`
          id,
          movement_type,
          quantity,
          unit_price,
          reason,
          created_at,
          stock_item:stock_items(
            id,
            name,
            category,
            unit_price
          ),
          appointment:appointments(
            id,
            appointment_date,
            status,
            patient:patients(
              id,
              full_name,
              email
            )
          )
        `)
        .eq("movement_type", "out")
        .contains("reason", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: patientUsage,
      });
    } else {
      // Buscar estatísticas gerais de uso por pacientes
      const { data: generalStats, error } = await supabase
        .from("stock_movements")
        .select(`
          id,
          movement_type,
          quantity,
          unit_price,
          reason,
          created_at,
          stock_item:stock_items(
            id,
            name,
            category
          )
        `)
        .eq("movement_type", "out")
        .like("reason", "%patient_%")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calcular estatísticas
      const stats = {
        totalConsumption: generalStats?.reduce((acc, movement) => acc + movement.quantity, 0) || 0,
        totalValue:
          generalStats?.reduce(
            (acc, movement) => acc + movement.quantity * movement.unit_price,
            0,
          ) || 0,
        categoryUsage:
          generalStats?.reduce(
            (acc, movement) => {
              const category = movement.stock_item?.category || "Outros";
              acc[category] = (acc[category] || 0) + movement.quantity;
              return acc;
            },
            {} as Record<string, number>,
          ) || {},
        monthlyTrend:
          generalStats?.reduce(
            (acc, movement) => {
              const month = new Date(movement.created_at).toISOString().slice(0, 7);
              acc[month] = (acc[month] || 0) + movement.quantity;
              return acc;
            },
            {} as Record<string, number>,
          ) || {},
      };

      return NextResponse.json({
        success: true,
        data: stats,
        movements: includeHistory ? generalStats : [],
      });
    }
  } catch (error) {
    console.error("Patient Integration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, stockItemId, quantity, appointmentId, notes } = body;

    // Registrar uso de material por paciente
    const { data: stockItem, error: stockError } = await supabase
      .from("stock_items")
      .select("current_quantity, min_threshold")
      .eq("id", stockItemId)
      .single();

    if (stockError || !stockItem) {
      return NextResponse.json({ error: "Item de estoque não encontrado" }, { status: 404 });
    }

    if (stockItem.current_quantity < quantity) {
      return NextResponse.json({ error: "Quantidade insuficiente em estoque" }, { status: 400 });
    }

    // Registrar movimento de saída
    const { data: movement, error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        stock_item_id: stockItemId,
        movement_type: "out",
        quantity: quantity,
        reason: `patient_${patientId}${appointmentId ? `_appointment_${appointmentId}` : ""}`,
        notes: notes,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (movementError) {
      return NextResponse.json({ error: movementError.message }, { status: 500 });
    }

    // Atualizar quantidade em estoque
    const { error: updateError } = await supabase
      .from("stock_items")
      .update({
        current_quantity: stockItem.current_quantity - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stockItemId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Verificar se necessita alerta de estoque baixo
    const newQuantity = stockItem.current_quantity - quantity;
    if (newQuantity <= stockItem.min_threshold) {
      // Criar alerta de estoque baixo
      await supabase.from("stock_alerts").insert({
        stock_item_id: stockItemId,
        alert_type: "low_stock",
        threshold_value: stockItem.min_threshold,
        current_value: newQuantity,
        message: `Estoque baixo após uso em paciente ${patientId}`,
        is_resolved: false,
        created_by: session.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      movement,
      newQuantity,
      alertGenerated: newQuantity <= stockItem.min_threshold,
    });
  } catch (error) {
    console.error("Patient Stock Usage Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

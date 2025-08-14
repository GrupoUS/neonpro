import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar dados de BI para estoque
    const { data: biMetrics, error } = await supabase
      .from("stock_items")
      .select(`
        id,
        name,
        current_quantity,
        min_threshold,
        max_threshold,
        unit_price,
        supplier_id,
        category,
        location,
        created_at,
        updated_at,
        movements:stock_movements(
          id,
          movement_type,
          quantity,
          unit_price,
          reason,
          created_at,
          user_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular métricas de BI
    const analytics = {
      totalItems: biMetrics?.length || 0,
      totalValue: biMetrics?.reduce((acc, item) => acc + (item.current_quantity * item.unit_price), 0) || 0,
      lowStockItems: biMetrics?.filter(item => item.current_quantity <= item.min_threshold).length || 0,
      overStockItems: biMetrics?.filter(item => item.current_quantity >= item.max_threshold).length || 0,
      categoryDistribution: biMetrics?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      movementsTrend: biMetrics?.flatMap(item => item.movements || [])
        .reduce((acc, movement) => {
          const date = new Date(movement.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + movement.quantity;
          return acc;
        }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      items: biMetrics
    });
  } catch (error) {
    console.error("BI Integration Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const { exportFormat, dateRange, filters } = body;

    // Aplicar filtros na consulta
    let query = supabase
      .from("stock_items")
      .select(`
        *,
        movements:stock_movements(*)
      `);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.location) {
      query = query.eq("location", filters.location);
    }

    if (dateRange?.start && dateRange?.end) {
      query = query
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);
    }

    const { data: exportData, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Processar dados para exportação
    const processedData = {
      exportFormat,
      timestamp: new Date().toISOString(),
      filters,
      data: exportData,
      summary: {
        totalItems: exportData?.length || 0,
        totalValue: exportData?.reduce((acc, item) => acc + (item.current_quantity * item.unit_price), 0) || 0,
      }
    };

    return NextResponse.json({
      success: true,
      export: processedData
    });
  } catch (error) {
    console.error("BI Export Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
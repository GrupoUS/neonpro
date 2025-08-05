import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { MultiLocationInventoryService } from "@/app/lib/services/multi-location-inventory-service";
import type { CreateStockTransfer, StockTransferFilters } from "@/app/lib/types/inventory";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters: StockTransferFilters = {
      clinic_id: searchParams.get("clinic_id") || undefined,
      status: searchParams.get("status") || undefined,
      transfer_type: searchParams.get("transfer_type") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    };

    const inventoryService = new MultiLocationInventoryService();
    const transfers = await inventoryService.getStockTransfers(filters);

    return NextResponse.json({ data: transfers });
  } catch (error) {
    console.error("Error fetching stock transfers:", error);
    return NextResponse.json({ error: "Failed to fetch stock transfers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const transferData: CreateStockTransfer = {
      ...body,
      requested_by: session.user.id,
    };

    const inventoryService = new MultiLocationInventoryService();
    const transfer = await inventoryService.createStockTransfer(transferData);

    return NextResponse.json({ data: transfer }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock transfer:", error);
    return NextResponse.json({ error: "Failed to create stock transfer" }, { status: 500 });
  }
}

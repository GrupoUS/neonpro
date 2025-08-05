import type { equipmentMaintenanceService } from "@/app/lib/services/equipment-maintenance-service";
import type { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract clinic_id from query params
    const clinicId = searchParams.get("clinic_id");
    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 });
    }

    const summary = await equipmentMaintenanceService.getMaintenanceSummary(clinicId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Maintenance Summary API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

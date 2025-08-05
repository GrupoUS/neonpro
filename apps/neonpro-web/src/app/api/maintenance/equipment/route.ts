import type { NextRequest, NextResponse } from "next/server";
import type { equipmentMaintenanceService } from "@/app/lib/services/equipment-maintenance-service";
import type { createEquipmentSchema } from "@/app/lib/validations/maintenance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract clinic_id from query params
    const clinicId = searchParams.get("clinic_id");
    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filters from query params
    const filters: any = {};

    const equipmentTypes = searchParams.getAll("equipment_type");
    if (equipmentTypes.length) filters.equipment_type = equipmentTypes;

    const statuses = searchParams.getAll("status");
    if (statuses.length) filters.status = statuses;

    const criticalityLevels = searchParams.getAll("criticality_level");
    if (criticalityLevels.length) filters.criticality_level = criticalityLevels;

    const departments = searchParams.getAll("department");
    if (departments.length) filters.department = departments;

    const locations = searchParams.getAll("location");
    if (locations.length) filters.location = locations;

    if (searchParams.get("warranty_expiring") === "true") {
      filters.warranty_expiring = true;
    }

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const result = await equipmentMaintenanceService.getClinicEquipment(
      clinicId,
      Object.keys(filters).length ? filters : undefined,
      { page, limit },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Equipment API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract clinic_id from query params
    const clinicId = searchParams.get("clinic_id");
    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = createEquipmentSchema.parse(body);

    const equipment = await equipmentMaintenanceService.createEquipment({
      ...validatedData,
      clinic_id: clinicId,
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error("Create Equipment Error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid equipment data", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 });
  }
}

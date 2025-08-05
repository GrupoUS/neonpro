// =====================================================================================
// SUPPLIER ANALYTICS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import type { NextRequest, NextResponse } from "next/server";
import type { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import type { supplierComparisonSchema } from "@/app/lib/validations/suppliers";

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/analytics - Get supplier analytics
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinic_id");
    const periodStart = searchParams.get("period_start");
    const periodEnd = searchParams.get("period_end");

    if (!clinicId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "clinic_id, period_start e period_end são obrigatórios" },
        { status: 400 },
      );
    }

    const analytics = await supplierService.getSupplierAnalytics(clinicId, periodStart, periodEnd);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// =====================================================================================
// POST /api/suppliers/analytics/compare - Compare suppliers
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = supplierComparisonSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const comparison = await supplierService.compareSuppliers(validationResult.data.supplier_ids);

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Erro ao comparar fornecedores:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

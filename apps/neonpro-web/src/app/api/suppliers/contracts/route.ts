// =====================================================================================
// SUPPLIER CONTRACTS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import type { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import type { createContractSchema } from "@/app/lib/validations/suppliers";
import type { NextRequest, NextResponse } from "next/server";

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/contracts - List contracts or get renewal alerts
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinic_id");
    const supplierId = searchParams.get("supplier_id");
    const action = searchParams.get("action");

    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 });
    }

    if (action === "renewal-alerts") {
      const daysAhead = parseInt(searchParams.get("days_ahead") || "90");
      const alerts = await supplierService.getContractRenewalAlerts(clinicId, daysAhead);
      return NextResponse.json({ alerts });
    }

    if (supplierId) {
      const contracts = await supplierService.getSupplierContracts(supplierId);
      return NextResponse.json({ contracts });
    }

    return NextResponse.json(
      { error: "supplier_id é obrigatório quando action não é renewal-alerts" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// =====================================================================================
// POST /api/suppliers/contracts - Create new contract
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createContractSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const contract = await supplierService.createContract(validationResult.data);

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar contrato:", error);

    if (error instanceof Error && error.message.includes("já existe")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

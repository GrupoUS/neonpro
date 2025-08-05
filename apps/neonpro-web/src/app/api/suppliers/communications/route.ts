// =====================================================================================
// SUPPLIER COMMUNICATIONS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import type { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import type { createCommunicationSchema } from "@/app/lib/validations/suppliers";
import type { NextRequest, NextResponse } from "next/server";

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/communications - List communications for a supplier
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplier_id");

    if (!supplierId) {
      return NextResponse.json({ error: "supplier_id é obrigatório" }, { status: 400 });
    }

    const communications = await supplierService.getSupplierCommunications(supplierId);
    return NextResponse.json({ communications });
  } catch (error) {
    console.error("Erro ao buscar comunicações:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// =====================================================================================
// POST /api/suppliers/communications - Create new communication
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createCommunicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const communication = await supplierService.createCommunication(validationResult.data);

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comunicação:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

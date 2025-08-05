// =====================================================================================
// SUPPLIER EVALUATIONS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import type { NextRequest, NextResponse } from "next/server";
import type { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import type { createEvaluationSchema } from "@/app/lib/validations/suppliers";

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/evaluations - List evaluations for a supplier
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplier_id");

    if (!supplierId) {
      return NextResponse.json({ error: "supplier_id é obrigatório" }, { status: 400 });
    }

    const evaluations = await supplierService.getSupplierEvaluations(supplierId);
    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// =====================================================================================
// POST /api/suppliers/evaluations - Create new evaluation
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createEvaluationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const evaluation = await supplierService.createEvaluation(validationResult.data);

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

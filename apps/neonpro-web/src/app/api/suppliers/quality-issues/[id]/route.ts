// =====================================================================================
// INDIVIDUAL QUALITY ISSUE API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supplierService = new SupplierManagementService();

interface RouteParams {
  params: {
    id: string;
  };
}

// =====================================================================================
// PUT /api/suppliers/quality-issues/[id] - Update quality issue
// =====================================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Basic validation for update
    const validationResult = z.any().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const issue = await supplierService.updateQualityIssue(params.id, validationResult.data);

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Erro ao atualizar issue:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

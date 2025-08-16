// =====================================================================================
// SUPPLIER QUALITY ISSUES API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';
import { createQualityIssueSchema } from '@/app/lib/validations/suppliers';

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/quality-issues - Get quality issues summary
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 },
      );
    }

    const summary = await supplierService.getQualityIssuesSummary(clinicId);
    return NextResponse.json({ summary });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// =====================================================================================
// POST /api/suppliers/quality-issues - Create new quality issue
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createQualityIssueSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const issue = await supplierService.createQualityIssue(
      validationResult.data,
    );

    return NextResponse.json(issue, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// =====================================================================================
// INDIVIDUAL SUPPLIER API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';
import { updateSupplierSchema } from '@/app/lib/validations/suppliers';

const supplierService = new SupplierManagementService();

interface RouteParams {
  params: {
    id: string;
  };
}

// =====================================================================================
// GET /api/suppliers/[id] - Get supplier by ID
// =====================================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    const supplier = await supplierService.getSupplier(clinicId, params.id);

    if (!supplier) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// PUT /api/suppliers/[id] - Update supplier
// =====================================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id') || body.clinic_id;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = updateSupplierSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const supplier = await supplierService.updateSupplier(
      clinicId,
      params.id,
      validationResult.data
    );

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// DELETE /api/suppliers/[id] - Delete supplier
// =====================================================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    await supplierService.deleteSupplier(clinicId, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);

    if (error instanceof Error && error.message.includes('contratos ativos')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

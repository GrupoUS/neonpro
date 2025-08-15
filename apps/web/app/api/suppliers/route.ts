// =====================================================================================
// SUPPLIERS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';
import {
  createSupplierSchema,
  supplierFiltersSchema,
} from '@/app/lib/validations/suppliers';

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers - List suppliers with filters and pagination
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract clinic_id from auth or headers
    const clinicId = searchParams.get('clinic_id');
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Parse pagination
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Parse filters
    const filters: any = {};

    if (searchParams.get('supplier_type')) {
      filters.supplier_type = searchParams.get('supplier_type')?.split(',');
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',');
    }

    if (searchParams.get('is_preferred')) {
      filters.is_preferred = searchParams.get('is_preferred') === 'true';
    }

    if (searchParams.get('is_critical')) {
      filters.is_critical = searchParams.get('is_critical') === 'true';
    }

    if (searchParams.get('performance_score_min')) {
      filters.performance_score_min = Number.parseFloat(
        searchParams.get('performance_score_min')!
      );
    }

    if (searchParams.get('performance_score_max')) {
      filters.performance_score_max = Number.parseFloat(
        searchParams.get('performance_score_max')!
      );
    }

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }

    // Validate filters
    const validationResult = supplierFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const result = await supplierService.listSuppliers(
      clinicId,
      validationResult.data,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// POST /api/suppliers - Create new supplier
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract clinic_id from auth or body
    const clinicId = body.clinic_id;
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = createSupplierSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const supplier = await supplierService.createSupplier(
      clinicId,
      validationResult.data
    );

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);

    if (error instanceof Error && error.message.includes('já existe')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

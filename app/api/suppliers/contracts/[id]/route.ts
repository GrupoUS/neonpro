// =====================================================================================
// INDIVIDUAL SUPPLIER CONTRACT API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supplierService = new SupplierManagementService();

interface RouteParams {
  params: {
    id: string;
  };
}

// =====================================================================================
// GET /api/suppliers/contracts/[id] - Get contract by ID
// =====================================================================================
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const contract = await supplierService.getContract(params.id);
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// PUT /api/suppliers/contracts/[id] - Update contract
// =====================================================================================
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();

    // Validate request body (partial update)
    const validationResult = z.any().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const contract = await supplierService.updateContract(
      params.id,
      validationResult.data
    );

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

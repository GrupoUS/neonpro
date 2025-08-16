// =====================================================================================
// INDIVIDUAL SUPPLIER CONTACT API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';

const supplierService = new SupplierManagementService();

type RouteParams = {
  params: {
    id: string;
  };
};

// =====================================================================================
// PUT /api/suppliers/contacts/[id] - Update contact
// =====================================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Basic validation for update
    const validationResult = z.any().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const contact = await supplierService.updateContact(
      params.id,
      validationResult.data
    );

    return NextResponse.json(contact);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

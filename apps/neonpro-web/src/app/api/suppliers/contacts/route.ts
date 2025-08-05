// =====================================================================================
// SUPPLIER CONTACTS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import type { SupplierManagementService } from "@/app/lib/services/supplier-management-service";
import type { createContactSchema } from "@/app/lib/validations/suppliers";
import type { NextRequest, NextResponse } from "next/server";

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/contacts - List contacts for a supplier
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplier_id");

    if (!supplierId) {
      return NextResponse.json({ error: "supplier_id é obrigatório" }, { status: 400 });
    }

    const contacts = await supplierService.getSupplierContacts(supplierId);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// =====================================================================================
// POST /api/suppliers/contacts - Create new contact
// =====================================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createContactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const contact = await supplierService.createContact(validationResult.data);

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar contato:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

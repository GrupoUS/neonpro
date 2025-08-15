// =====================================================================================
// SUPPLIER DASHBOARD API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { SupplierManagementService } from '@/app/lib/services/supplier-management-service';

const supplierService = new SupplierManagementService();

// =====================================================================================
// GET /api/suppliers/dashboard - Get supplier dashboard data
// =====================================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    const dashboardData = await supplierService.getDashboardData(clinicId);
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

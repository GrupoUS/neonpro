import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';
import { NextRequest, NextResponse } from 'next/server';

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Extract filter params
    const filters = {
      provider_id: searchParams.get('provider_id') || undefined,
      evaluation_period: searchParams.get('evaluation_period') as 'monthly' | 'quarterly' | 'yearly' | undefined,
      success_rate_min: searchParams.get('success_rate_min') ? parseFloat(searchParams.get('success_rate_min')!) : undefined,
      period_start: searchParams.get('period_start') || undefined,
      period_end: searchParams.get('period_end') || undefined,
    };

    const result = await treatmentSuccessService.getProviderPerformance(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching provider performance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

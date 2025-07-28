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
      treatment_type: searchParams.get('treatment_type') || undefined,
      provider_id: searchParams.get('provider_id') || undefined,
      time_period: searchParams.get('time_period') as 'monthly' | 'quarterly' | 'yearly' | undefined,
      success_rate_min: searchParams.get('success_rate_min') ? parseFloat(searchParams.get('success_rate_min')!) : undefined,
      period_start: searchParams.get('period_start') || undefined,
      period_end: searchParams.get('period_end') || undefined,
    };

    const result = await treatmentSuccessService.getSuccessMetrics(filters, page, limit);

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
    console.error('Error fetching success metrics:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { treatment_type, provider_id, time_period = 'monthly' } = body;

    if (!treatment_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo de tratamento é obrigatório'
        },
        { status: 400 }
      );
    }

    const metrics = await treatmentSuccessService.generateSuccessMetrics(
      treatment_type,
      provider_id,
      time_period
    );

    return NextResponse.json({
      success: true,
      data: metrics
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating success metrics:', error);
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

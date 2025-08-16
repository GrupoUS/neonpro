import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';
import { createProtocolOptimizationSchema } from '@/app/lib/validations/treatment-success';

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract pagination params
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    // Extract filter params
    const filters = {
      treatment_type: searchParams.get('treatment_type') || undefined,
      implementation_priority: searchParams.get('implementation_priority') as
        | 'high'
        | 'medium'
        | 'low'
        | undefined,
      approval_status: searchParams.get('approval_status') as
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'implemented'
        | undefined,
      success_improvement_min: searchParams.get('success_improvement_min')
        ? Number.parseFloat(searchParams.get('success_improvement_min')!)
        : undefined,
    };

    const result = await treatmentSuccessService.getProtocolOptimizations(
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createProtocolOptimizationSchema.parse(body);

    const optimization =
      await treatmentSuccessService.createProtocolOptimization(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: optimization,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

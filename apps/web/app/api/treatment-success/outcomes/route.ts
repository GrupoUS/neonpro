import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';
import { createTreatmentOutcomeSchema } from '@/app/lib/validations/treatment-success';

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
      provider_id: searchParams.get('provider_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      success_rate_min: searchParams.get('success_rate_min')
        ? Number.parseFloat(searchParams.get('success_rate_min')!)
        : undefined,
      success_rate_max: searchParams.get('success_rate_max')
        ? Number.parseFloat(searchParams.get('success_rate_max')!)
        : undefined,
      satisfaction_min: searchParams.get('satisfaction_min')
        ? Number.parseFloat(searchParams.get('satisfaction_min')!)
        : undefined,
      status: searchParams.get('status') as
        | 'completed'
        | 'in_progress'
        | 'follow_up_required'
        | undefined,
      has_complications: searchParams.get('has_complications')
        ? searchParams.get('has_complications') === 'true'
        : undefined,
    };

    const result = await treatmentSuccessService.getTreatmentOutcomes(
      filters,
      page,
      limit,
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
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createTreatmentOutcomeSchema.parse(body);

    const outcome =
      await treatmentSuccessService.createTreatmentOutcome(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: outcome,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
}

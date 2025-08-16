import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';
import { createSuccessPredictionSchema } from '@/app/lib/validations/treatment-success';

const treatmentSuccessService = new TreatmentSuccessService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createSuccessPredictionSchema.parse(body);

    const prediction =
      await treatmentSuccessService.createSuccessPrediction(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: prediction,
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

import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentSuccessService } from '@/app/lib/services/treatment-success';

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(_request: NextRequest) {
  try {
    const stats = await treatmentSuccessService.getTreatmentTypeStats();

    return NextResponse.json({
      success: true,
      data: stats,
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

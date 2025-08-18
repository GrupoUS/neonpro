import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const prediction = await service.getPrediction(resolvedParams.id);

    if (!prediction) {
      return NextResponse.json(
        { error: 'Predição não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(prediction);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await service.deletePrediction(resolvedParams.id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao deletar predição' },
      { status: 400 }
    );
  }
}

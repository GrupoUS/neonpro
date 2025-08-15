import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model_id = searchParams.get('model_id') || undefined;

    const stats = await service.getAccuracyStats(model_id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao calcular estatísticas de precisão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

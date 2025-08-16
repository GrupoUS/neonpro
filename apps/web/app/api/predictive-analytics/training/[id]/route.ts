import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const trainingData = await service.getTrainingData(params.id);

    return NextResponse.json(trainingData);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dados devem ser um array' },
        { status: 400 },
      );
    }

    await service.uploadTrainingData(params.id, data);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao fazer upload dos dados' },
      { status: 400 },
    );
  }
}

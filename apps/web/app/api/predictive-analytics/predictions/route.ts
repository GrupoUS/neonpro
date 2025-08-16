import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';
import { createPredictionSchema } from '@/app/lib/validations/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = Number.parseInt(searchParams.get('skip') || '0', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const model_id = searchParams.get('model_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const date_from = searchParams.get('date_from') || undefined;
    const date_to = searchParams.get('date_to') || undefined;

    const result = await service.getPredictions({
      skip,
      limit,
      model_id,
      status,
      date_from,
      date_to,
    });

    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPredictionSchema.parse(body);

    const prediction = await service.createPrediction(validatedData);

    return NextResponse.json(prediction, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao criar predição' },
      { status: 400 }
    );
  }
}

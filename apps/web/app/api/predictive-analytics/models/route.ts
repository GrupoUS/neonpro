import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';
import { createForecastingModelSchema } from '@/app/lib/validations/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = Number.parseInt(searchParams.get('skip') || '0', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const model_type = searchParams.get('model_type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await service.getForecastingModels({
      skip,
      limit,
      model_type,
      status,
      search,
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
    const validatedData = createForecastingModelSchema.parse(body);

    const model = await service.createForecastingModel(validatedData);

    return NextResponse.json(model, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao criar modelo' },
      { status: 400 }
    );
  }
}

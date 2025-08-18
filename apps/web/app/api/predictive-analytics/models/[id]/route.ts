import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';
import { updateForecastingModelSchema } from '@/app/lib/validations/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = await service.getForecastingModel(id);

    if (!model) {
      return NextResponse.json(
        { error: 'Modelo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(model);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateForecastingModelSchema.parse(body);

    const model = await service.updateForecastingModel(id, validatedData);

    return NextResponse.json(model);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar modelo' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await service.deleteForecastingModel(id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao deletar modelo' },
      { status: 400 }
    );
  }
}

import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const alert = await service.updateAlert(params.id, body);

    return NextResponse.json(alert);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar alerta' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await service.deleteAlert(params.id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao deletar alerta' },
      { status: 400 },
    );
  }
}

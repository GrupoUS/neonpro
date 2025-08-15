import { type NextRequest, NextResponse } from 'next/server';
import { PredictiveAnalyticsService } from '@/app/lib/services/predictive-analytics';
import { createAlertSchema } from '@/app/lib/validations/predictive-analytics';

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = Number.parseInt(searchParams.get('skip') || '0', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;

    const result = await service.getAlerts({
      skip,
      limit,
      status,
      severity,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

    const alert = await service.createAlert(validatedData);

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar alerta' },
      { status: 400 }
    );
  }
}

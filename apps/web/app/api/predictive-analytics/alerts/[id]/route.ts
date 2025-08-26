import { PredictiveAnalyticsService } from "@/app/lib/services/predictive-analytics";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const service = new PredictiveAnalyticsService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const alert = await service.updateAlert(id, body);

    return NextResponse.json(alert);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar alerta" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await service.deleteAlert(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar alerta" },
      { status: 400 },
    );
  }
}

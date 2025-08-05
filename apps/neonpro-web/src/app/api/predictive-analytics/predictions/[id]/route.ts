import { type NextRequest, NextResponse } from "next/server";
import { PredictiveAnalyticsService } from "@/app/lib/services/predictive-analytics";

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prediction = await service.getPrediction(params.id);

    if (!prediction) {
      return NextResponse.json({ error: "Predição não encontrada" }, { status: 404 });
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Erro ao buscar predição:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await service.deletePrediction(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar predição:", error);
    return NextResponse.json({ error: "Erro ao deletar predição" }, { status: 400 });
  }
}

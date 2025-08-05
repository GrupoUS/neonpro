import { PredictiveAnalyticsService } from "@/app/lib/services/predictive-analytics";
import { NextRequest, NextResponse } from "next/server";

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const trainingData = await service.getTrainingData(params.id);

    return NextResponse.json(trainingData);
  } catch (error) {
    console.error("Erro ao buscar dados de treinamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Dados devem ser um array" }, { status: 400 });
    }

    await service.uploadTrainingData(params.id, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao fazer upload dos dados:", error);
    return NextResponse.json({ error: "Erro ao fazer upload dos dados" }, { status: 400 });
  }
}

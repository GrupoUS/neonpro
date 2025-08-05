import type { PredictiveAnalyticsService } from "@/app/lib/services/predictive-analytics";
import type { createPredictionSchema } from "@/app/lib/validations/predictive-analytics";
import type { NextRequest, NextResponse } from "next/server";

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const model_id = searchParams.get("model_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const date_from = searchParams.get("date_from") || undefined;
    const date_to = searchParams.get("date_to") || undefined;

    const result = await service.getPredictions({
      skip,
      limit,
      model_id,
      status,
      date_from,
      date_to,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar predições:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPredictionSchema.parse(body);

    const prediction = await service.createPrediction(validatedData);

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar predição:", error);
    return NextResponse.json({ error: "Erro ao criar predição" }, { status: 400 });
  }
}

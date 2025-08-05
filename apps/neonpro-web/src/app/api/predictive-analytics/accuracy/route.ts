import type { NextRequest, NextResponse } from "next/server";
import type { PredictiveAnalyticsService } from "@/app/lib/services/predictive-analytics";

const service = new PredictiveAnalyticsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const model_id = searchParams.get("model_id") || undefined;
    const date_from = searchParams.get("date_from") || undefined;
    const date_to = searchParams.get("date_to") || undefined;

    const result = await service.getAccuracyReports({
      skip,
      limit,
      model_id,
      date_from,
      date_to,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar relatórios de precisão:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

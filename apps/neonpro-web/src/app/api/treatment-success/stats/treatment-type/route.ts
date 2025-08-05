import type { TreatmentSuccessService } from "@/app/lib/services/treatment-success";
import type { NextRequest, NextResponse } from "next/server";

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(request: NextRequest) {
  try {
    const stats = await treatmentSuccessService.getTreatmentTypeStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching treatment type stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

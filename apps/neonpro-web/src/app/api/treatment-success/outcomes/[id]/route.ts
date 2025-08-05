import { TreatmentSuccessService } from "@/app/lib/services/treatment-success";
import { updateTreatmentOutcomeSchema } from "@/app/lib/validations/treatment-success";
import { NextRequest, NextResponse } from "next/server";

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const outcome = await treatmentSuccessService.getTreatmentOutcomeById(params.id);

    return NextResponse.json({
      success: true,
      data: outcome,
    });
  } catch (error) {
    console.error("Error fetching treatment outcome:", error);
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = updateTreatmentOutcomeSchema.parse(body);

    const outcome = await treatmentSuccessService.updateTreatmentOutcome(params.id, validatedData);

    return NextResponse.json({
      success: true,
      data: outcome,
    });
  } catch (error) {
    console.error("Error updating treatment outcome:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.message,
        },
        { status: 400 },
      );
    }

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await treatmentSuccessService.deleteTreatmentOutcome(params.id);

    return NextResponse.json({
      success: true,
      message: "Resultado de tratamento deletado com sucesso",
    });
  } catch (error) {
    console.error("Error deleting treatment outcome:", error);
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

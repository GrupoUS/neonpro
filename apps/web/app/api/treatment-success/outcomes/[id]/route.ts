import { TreatmentSuccessService } from "@/app/lib/services/treatment-success";
import { updateTreatmentOutcomeSchema } from "@/app/lib/validations/treatment-success";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const treatmentSuccessService = new TreatmentSuccessService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const outcome = await treatmentSuccessService.getTreatmentOutcomeById(id);

    return NextResponse.json({
      success: true,
      data: outcome,
    });
  } catch (error) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateTreatmentOutcomeSchema.parse(body);

    const outcome = await treatmentSuccessService.updateTreatmentOutcome(
      id,
      validatedData,
    );

    return NextResponse.json({
      success: true,
      data: outcome,
    });
  } catch (error) {
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await treatmentSuccessService.deleteTreatmentOutcome(params.id);

    return NextResponse.json({
      success: true,
      message: "Resultado de tratamento deletado com sucesso",
    });
  } catch (error) {
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

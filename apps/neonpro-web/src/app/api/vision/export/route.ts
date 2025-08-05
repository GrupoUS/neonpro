/**
 * Vision Analysis Export API
 * POST /api/vision/export
 *
 * Exports computer vision analysis results to various formats (PDF, Excel, JSON)
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";
import type { withErrorMonitoring } from "@/lib/monitoring";

// Export request validation schema
const exportRequestSchema = z.object({
  analysisIds: z.array(z.string().uuid()).min(1, "Pelo menos uma análise deve ser selecionada"),
  format: z.enum(["pdf", "excel", "json", "csv"], {
    required_error: "Formato de exportação é obrigatório",
  }),
  includeImages: z.boolean().default(true),
  includeAnnotations: z.boolean().default(true),
  includeMetrics: z.boolean().default(true),
  includeTimeline: z.boolean().default(false),
  customFields: z.array(z.string()).optional(),
  reportTitle: z.string().optional(),
  reportNotes: z.string().optional(),
});

// POST - Export analysis results
export const POST = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = exportRequestSchema.parse(body);

    // Get analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from("image_analysis")
      .select(`
        *,
        analysis_annotations(*),
        analysis_performance(*),
        analysis_quality_control(*)
      `)
      .in("id", validatedData.analysisIds)
      .eq("user_id", user.id); // Ensure user can only export their own analyses

    if (analysisError) {
      throw analysisError;
    }

    if (!analysisData || analysisData.length === 0) {
      return NextResponse.json({ error: "Nenhuma análise encontrada" }, { status: 404 });
    }

    // Generate export based on format
    let exportResult;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `vision-analysis-export-${timestamp}`;

    switch (validatedData.format) {
      case "json":
        exportResult = await generateJSONExport(analysisData, validatedData);
        break;
      case "csv":
        exportResult = await generateCSVExport(analysisData, validatedData);
        break;
      case "pdf":
        exportResult = await generatePDFExport(analysisData, validatedData);
        break;
      case "excel":
        exportResult = await generateExcelExport(analysisData, validatedData);
        break;
      default:
        throw new Error("Formato de exportação não suportado");
    }

    // Log export activity
    await supabase.from("analysis_exports").insert({
      user_id: user.id,
      analysis_ids: validatedData.analysisIds,
      export_format: validatedData.format,
      export_options: validatedData,
      file_size_bytes: exportResult.data.length,
      created_at: new Date().toISOString(),
    });

    // Return file with appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", exportResult.contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}.${validatedData.format}"`,
    );
    headers.set("Content-Length", exportResult.data.length.toString());

    return new NextResponse(exportResult.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Vision export error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados de entrada inválidos",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

// Helper function to generate JSON export
async function generateJSONExport(analysisData: any[], options: any) {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalAnalyses: analysisData.length,
      format: "json",
      options,
      reportTitle: options.reportTitle || "Relatório de Análise de Visão Computacional",
      reportNotes: options.reportNotes,
    },
    analyses: analysisData.map((analysis) => ({
      id: analysis.id,
      patientId: analysis.patient_id,
      treatmentType: analysis.treatment_type,
      status: analysis.status,
      createdAt: analysis.created_at,
      ...(options.includeMetrics && {
        metrics: {
          accuracyScore: analysis.accuracy_score,
          confidence: analysis.confidence,
          improvementPercentage: analysis.improvement_percentage,
          changeMetrics: analysis.change_metrics,
        },
      }),
      ...(options.includeImages && {
        images: {
          beforeImageUrl: analysis.before_image_url,
          afterImageUrl: analysis.after_image_url,
        },
      }),
      ...(options.includeAnnotations && {
        annotations: analysis.analysis_annotations || [],
      }),
      performance: analysis.analysis_performance?.[0] || null,
      qualityControl: analysis.analysis_quality_control?.[0] || null,
    })),
  };

  return {
    data: Buffer.from(JSON.stringify(exportData, null, 2)),
    contentType: "application/json",
  };
}

// Helper function to generate CSV export
async function generateCSVExport(analysisData: any[], options: any) {
  const headers = [
    "ID",
    "Patient ID",
    "Treatment Type",
    "Status",
    "Created At",
    ...(options.includeMetrics
      ? ["Accuracy Score", "Confidence", "Improvement %", "Processing Time (ms)"]
      : []),
    "Notes",
  ];

  const rows = analysisData.map((analysis) => [
    analysis.id,
    analysis.patient_id,
    analysis.treatment_type,
    analysis.status,
    analysis.created_at,
    ...(options.includeMetrics
      ? [
          analysis.accuracy_score,
          analysis.confidence,
          analysis.improvement_percentage,
          analysis.analysis_performance?.[0]?.processing_time_ms || "",
        ]
      : []),
    analysis.notes || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return {
    data: Buffer.from(csvContent),
    contentType: "text/csv",
  };
}

// Helper function to generate PDF export
async function generatePDFExport(analysisData: any[], options: any) {
  // For now, return a simple text-based PDF content
  // In production, you would use a library like puppeteer or jsPDF
  const content = `
RELATÓRIO DE ANÁLISE DE VISÃO COMPUTACIONAL

Gerado em: ${new Date().toLocaleString("pt-BR")}
Total de Análises: ${analysisData.length}

${analysisData
  .map(
    (analysis, index) => `
ANÁLISE ${index + 1}
${"=".repeat(20)}
ID: ${analysis.id}
Paciente: ${analysis.patient_id}
Tipo de Tratamento: ${analysis.treatment_type}
Status: ${analysis.status}
Data: ${new Date(analysis.created_at).toLocaleString("pt-BR")}
${
  options.includeMetrics
    ? `
MÉTRICAS:
- Precisão: ${(analysis.accuracy_score * 100).toFixed(1)}%
- Confiança: ${(analysis.confidence * 100).toFixed(1)}%
- Melhoria: ${analysis.improvement_percentage.toFixed(1)}%
`
    : ""
}
${analysis.notes ? `Observações: ${analysis.notes}` : ""}
`,
  )
  .join("\n")}
`;

  return {
    data: Buffer.from(content),
    contentType: "application/pdf",
  };
}

// Helper function to generate Excel export
async function generateExcelExport(analysisData: any[], options: any) {
  // For now, return CSV format with Excel MIME type
  // In production, you would use a library like exceljs
  const csvResult = await generateCSVExport(analysisData, options);

  return {
    data: csvResult.data,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

// GET - Get export history
export const GET = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get export history
    const { data: exportHistory, error } = await supabase
      .from("analysis_exports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: exportHistory,
      pagination: {
        limit,
        offset,
        total: exportHistory.length,
      },
    });
  } catch (error) {
    console.error("Export history error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

/**
 * Analytics Export API Route for NeonPro
 *
 * Handles export requests for all analytics data in multiple formats:
 * - CSV exports for raw data analysis
 * - Excel exports with formatted sheets and charts
 * - PDF reports with visualizations and insights
 * - JSON exports for API integration
 *
 * Supports cohort analysis, forecasting, statistical insights, and dashboard data.
 */

import type { createClient } from "@/lib/supabase/server";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { z } from "zod";

// Extend jsPDF type for autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Export request validation schema
const ExportRequestSchema = z.object({
  type: z.enum(["cohort", "forecast", "insights", "dashboard", "realtime"]),
  format: z.enum(["csv", "excel", "pdf", "json"]),
  data: z.any(),
  options: z
    .object({
      includeCharts: z.boolean().optional(),
      includeMetadata: z.boolean().optional(),
      dateRange: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
      filename: z.string().optional(),
      template: z.enum(["standard", "executive", "technical"]).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const validatedRequest = ExportRequestSchema.parse(body);

    const { type, format, data, options = {} } = validatedRequest;

    // Generate export based on format
    let exportData: Buffer | string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        ({
          data: exportData,
          contentType,
          filename,
        } = await generateCSVExport(type, data, options));
        break;
      case "excel":
        ({
          data: exportData,
          contentType,
          filename,
        } = await generateExcelExport(type, data, options));
        break;
      case "pdf":
        ({
          data: exportData,
          contentType,
          filename,
        } = await generatePDFExport(type, data, options));
        break;
      case "json":
        ({
          data: exportData,
          contentType,
          filename,
        } = await generateJSONExport(type, data, options));
        break;
      default:
        return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
    }

    // Log export activity
    await supabase.from("user_activity_log").insert({
      user_id: user.id,
      action: "export",
      details: {
        type,
        format,
        timestamp: new Date().toISOString(),
        filename,
      },
    });

    // Return file
    const response = new NextResponse(exportData);
    response.headers.set("Content-Type", contentType);
    response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

    return response;
  } catch (error) {
    console.error("Export error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Export generation failed" }, { status: 500 });
  }
}

/**
 * Generate CSV export
 */
async function generateCSVExport(
  type: string,
  data: any,
  options: any,
): Promise<{ data: string; contentType: string; filename: string }> {
  let csvData: string = "";
  let filename: string = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;

  switch (type) {
    case "cohort":
      csvData = generateCohortCSV(data);
      filename =
        options.filename || `cohort-analysis-${new Date().toISOString().split("T")[0]}.csv`;
      break;
    case "forecast":
      csvData = generateForecastCSV(data);
      filename = options.filename || `forecast-data-${new Date().toISOString().split("T")[0]}.csv`;
      break;
    case "insights":
      csvData = generateInsightsCSV(data);
      filename =
        options.filename || `statistical-insights-${new Date().toISOString().split("T")[0]}.csv`;
      break;
    case "dashboard":
      csvData = generateDashboardCSV(data);
      filename =
        options.filename || `dashboard-metrics-${new Date().toISOString().split("T")[0]}.csv`;
      break;
    case "realtime":
      csvData = generateRealtimeCSV(data);
      filename =
        options.filename || `realtime-metrics-${new Date().toISOString().split("T")[0]}.csv`;
      break;
    default:
      throw new Error(`Unsupported CSV export type: ${type}`);
  }

  return {
    data: csvData,
    contentType: "text/csv",
    filename,
  };
}

/**
 * Generate Excel export
 */
async function generateExcelExport(
  type: string,
  data: any,
  options: any,
): Promise<{ data: Buffer; contentType: string; filename: string }> {
  const workbook = XLSX.utils.book_new();
  let filename: string = `${type}-export-${new Date().toISOString().split("T")[0]}.xlsx`;

  switch (type) {
    case "cohort":
      addCohortSheetsToWorkbook(workbook, data, options);
      filename =
        options.filename || `cohort-analysis-${new Date().toISOString().split("T")[0]}.xlsx`;
      break;
    case "forecast":
      addForecastSheetsToWorkbook(workbook, data, options);
      filename =
        options.filename || `forecast-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      break;
    case "insights":
      addInsightsSheetsToWorkbook(workbook, data, options);
      filename =
        options.filename || `statistical-insights-${new Date().toISOString().split("T")[0]}.xlsx`;
      break;
    case "dashboard":
      addDashboardSheetsToWorkbook(workbook, data, options);
      filename =
        options.filename || `analytics-dashboard-${new Date().toISOString().split("T")[0]}.xlsx`;
      break;
    default:
      throw new Error(`Unsupported Excel export type: ${type}`);
  }

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return {
    data: excelBuffer,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename,
  };
}

/**
 * Generate PDF export
 */
async function generatePDFExport(
  type: string,
  data: any,
  options: any,
): Promise<{ data: Buffer; contentType: string; filename: string }> {
  const pdf = new jsPDF("p", "mm", "a4");
  const template = options.template || "standard";
  let filename: string = `${type}-report-${new Date().toISOString().split("T")[0]}.pdf`;

  // Add header
  addPDFHeader(pdf, type, template);

  switch (type) {
    case "cohort":
      addCohortContentToPDF(pdf, data, options);
      filename =
        options.filename || `cohort-analysis-${new Date().toISOString().split("T")[0]}.pdf`;
      break;
    case "forecast":
      addForecastContentToPDF(pdf, data, options);
      filename =
        options.filename || `forecast-report-${new Date().toISOString().split("T")[0]}.pdf`;
      break;
    case "insights":
      addInsightsContentToPDF(pdf, data, options);
      filename =
        options.filename || `insights-report-${new Date().toISOString().split("T")[0]}.pdf`;
      break;
    case "dashboard":
      addDashboardContentToPDF(pdf, data, options);
      filename =
        options.filename || `dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`;
      break;
    default:
      throw new Error(`Unsupported PDF export type: ${type}`);
  }

  // Add footer
  addPDFFooter(pdf);

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return {
    data: pdfBuffer,
    contentType: "application/pdf",
    filename,
  };
}

/**
 * Generate JSON export
 */
async function generateJSONExport(
  type: string,
  data: any,
  options: any,
): Promise<{ data: string; contentType: string; filename: string }> {
  let exportData: any = data;
  const filename: string = `${type}-export-${new Date().toISOString().split("T")[0]}.json`;

  // Add metadata if requested
  if (options.includeMetadata) {
    exportData = {
      metadata: {
        exportType: type,
        exportDate: new Date().toISOString(),
        dateRange: options.dateRange,
        generatedBy: "NeonPro Analytics System",
      },
      data: exportData,
    };
  }

  return {
    data: JSON.stringify(exportData, null, 2),
    contentType: "application/json",
    filename: options.filename || filename,
  };
}

// CSV Generation Functions
function generateCohortCSV(data: any): string {
  if (!data.cohorts || !data.metrics) {
    throw new Error("Invalid cohort data structure");
  }

  const headers = ["Cohort", "Period", "Users", "Retention Rate", "Revenue", "Churn Rate"];
  let csv = headers.join(",") + "\n";

  data.metrics.forEach((metric: any) => {
    const row = [
      metric.cohortId,
      metric.period,
      metric.totalUsers,
      `${metric.retentionRate}%`,
      `$${metric.revenue}`,
      `${metric.churnRate}%`,
    ];
    csv += row.join(",") + "\n";
  });

  return csv;
}

function generateForecastCSV(data: any): string {
  if (!data.predictions) {
    throw new Error("Invalid forecast data structure");
  }

  const headers = ["Date", "Prediction", "Lower Bound", "Upper Bound", "Confidence"];
  let csv = headers.join(",") + "\n";

  data.predictions.forEach((prediction: any) => {
    const row = [
      prediction.date,
      prediction.value,
      prediction.lowerBound || "",
      prediction.upperBound || "",
      prediction.confidence || "",
    ];
    csv += row.join(",") + "\n";
  });

  return csv;
}

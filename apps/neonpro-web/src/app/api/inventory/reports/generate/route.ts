import type { NextRequest, NextResponse } from "next/server";
import type { createinventoryReportsService } from "@/app/lib/services/inventory-reports-service";
import type {
  ReportFilters,
  ReportFormat,
  ReportParameters,
  ReportType,
} from "@/app/lib/types/inventory-reports";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = validateGenerateReportRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const parameters: ReportParameters = {
      type: body.type,
      filters: body.filters || {},
      format: body.format || "json",
    };

    // Generate the report
    const reportResult = await createinventoryReportsService().generateReport(parameters);

    // Handle different output formats
    if (parameters.format === "csv") {
      const csvData = convertToCSV(reportResult.data, parameters.type);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${parameters.type}_report_${new Date().getTime()}.csv"`,
        },
      });
    } else if (parameters.format === "excel") {
      // Excel export would go here
      return NextResponse.json({ error: "Excel format not yet implemented" }, { status: 501 });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      report: reportResult,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") as ReportType;

    if (!reportType) {
      return NextResponse.json({ error: "Report type is required" }, { status: 400 });
    }

    // Build filters from query parameters
    const filters: ReportFilters = {};

    if (searchParams.get("start_date")) {
      filters.start_date = searchParams.get("start_date")!;
    }
    if (searchParams.get("end_date")) {
      filters.end_date = searchParams.get("end_date")!;
    }
    if (searchParams.get("clinic_id")) {
      filters.clinic_id = searchParams.get("clinic_id")!;
    }
    if (searchParams.get("room_id")) {
      filters.room_id = searchParams.get("room_id")!;
    }
    if (searchParams.get("category")) {
      filters.category = searchParams.get("category")!;
    }
    if (searchParams.get("item_id")) {
      filters.item_id = searchParams.get("item_id")!;
    }
    if (searchParams.get("movement_type")) {
      filters.movement_type = searchParams.get("movement_type") as any;
    }
    if (searchParams.get("include_zero_stock")) {
      filters.include_zero_stock = searchParams.get("include_zero_stock") === "true";
    }

    const parameters: ReportParameters = {
      type: reportType,
      filters,
      format: (searchParams.get("format") as ReportFormat) || "json",
    };

    // Generate the report
    const reportResult = await createinventoryReportsService().generateReport(parameters);

    return NextResponse.json({
      success: true,
      report: reportResult,
    });
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateGenerateReportRequest(body: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!body.type) {
    errors.push("Report type is required");
  }

  // Validate report type
  const validTypes: ReportType[] = [
    "stock_movement",
    "stock_valuation",
    "low_stock",
    "expiring_items",
    "transfers",
    "location_performance",
  ];

  if (body.type && !validTypes.includes(body.type)) {
    errors.push(`Invalid report type. Must be one of: ${validTypes.join(", ")}`);
  }

  // Validate format if provided
  if (body.format) {
    const validFormats: ReportFormat[] = ["json", "csv", "excel"];
    if (!validFormats.includes(body.format)) {
      errors.push(`Invalid format. Must be one of: ${validFormats.join(", ")}`);
    }
  }

  // Validate filters if provided
  if (body.filters && typeof body.filters !== "object") {
    errors.push("Filters must be an object");
  }

  // Validate date formats in filters
  if (body.filters?.start_date && !isValidDate(body.filters.start_date)) {
    errors.push(
      "Invalid start_date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)",
    );
  }

  if (body.filters?.end_date && !isValidDate(body.filters.end_date)) {
    errors.push("Invalid end_date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)");
  }

  // Validate UUID formats for IDs
  if (body.filters?.clinic_id && !isValidUUID(body.filters.clinic_id)) {
    errors.push("Invalid clinic_id format. Must be a valid UUID");
  }

  if (body.filters?.room_id && !isValidUUID(body.filters.room_id)) {
    errors.push("Invalid room_id format. Must be a valid UUID");
  }

  if (body.filters?.item_id && !isValidUUID(body.filters.item_id)) {
    errors.push("Invalid item_id format. Must be a valid UUID");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// =============================================================================
// CSV CONVERSION HELPERS
// =============================================================================

function convertToCSV(data: any[], reportType: ReportType): string {
  if (!data || data.length === 0) {
    return "No data available\n";
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value !== null && value !== undefined ? value.toString() : "";
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

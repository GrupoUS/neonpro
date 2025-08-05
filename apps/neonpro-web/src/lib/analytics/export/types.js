"use strict";
// Analytics Export Types - STORY-SUB-002 Task 7
// Created: 2025-01-22
// Comprehensive export system types for PDF, Excel, and CSV generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CSV_OPTIONS =
  exports.DEFAULT_EXCEL_OPTIONS =
  exports.DEFAULT_PDF_OPTIONS =
  exports.ExportRequestSchema =
  exports.ExportConfigSchema =
  exports.ExportStatusSchema =
  exports.ReportTypeSchema =
  exports.ExportFormatSchema =
    void 0;
var zod_1 = require("zod");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
exports.ExportFormatSchema = zod_1.z.enum(["pdf", "excel", "csv", "json"]);
exports.ReportTypeSchema = zod_1.z.enum([
  "revenue",
  "conversion",
  "trial",
  "cohort",
  "forecast",
  "comprehensive",
]);
exports.ExportStatusSchema = zod_1.z.enum(["pending", "processing", "completed", "failed"]);
exports.ExportConfigSchema = zod_1.z.object({
  format: exports.ExportFormatSchema,
  reportType: exports.ReportTypeSchema,
  includeCharts: zod_1.z.boolean(),
  includeRawData: zod_1.z.boolean(),
  includeSummary: zod_1.z.boolean(),
  dateRange: zod_1.z.object({
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
  }),
  filters: zod_1.z.record(zod_1.z.any()).optional(),
  customization: zod_1.z
    .object({
      title: zod_1.z.string().optional(),
      subtitle: zod_1.z.string().optional(),
      logo: zod_1.z.string().optional(),
      branding: zod_1.z.boolean().optional(),
      watermark: zod_1.z.string().optional(),
    })
    .optional(),
  compression: zod_1.z.boolean().optional(),
  password: zod_1.z.string().optional(),
});
exports.ExportRequestSchema = zod_1.z.object({
  id: zod_1.z.string(),
  userId: zod_1.z.string(),
  config: exports.ExportConfigSchema,
  scheduledFor: zod_1.z.date().optional(),
  priority: zod_1.z.enum(["low", "normal", "high"]),
  notifyOnComplete: zod_1.z.boolean(),
  email: zod_1.z.string().email().optional(),
});
// Default configurations
exports.DEFAULT_PDF_OPTIONS = {
  pageSize: "A4",
  orientation: "portrait",
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  styling: {
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    fontFamily: "Arial",
    fontSize: 12,
  },
  charts: {
    includeCharts: true,
    chartFormat: "png",
    chartQuality: "high",
  },
};
exports.DEFAULT_EXCEL_OPTIONS = {
  worksheets: {
    summary: true,
    revenue: true,
    conversion: true,
    cohorts: true,
    forecasts: true,
    rawData: false,
  },
  formatting: {
    autoWidth: true,
    freezePanes: true,
    conditionalFormatting: true,
    charts: true,
  },
  protection: {
    allowEditing: false,
    allowFormatting: false,
  },
};
exports.DEFAULT_CSV_OPTIONS = {
  delimiter: ",",
  encoding: "utf-8",
  includeHeaders: true,
  dateFormat: "iso",
  numberFormat: {
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  compression: "none",
};

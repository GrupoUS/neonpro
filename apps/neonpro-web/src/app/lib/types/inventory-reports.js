Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleReportRequestSchema =
  exports.GenerateReportRequestSchema =
  exports.ReportParametersSchema =
  exports.ReportFiltersSchema =
    void 0;
var zod_1 = require("zod");
// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================
exports.ReportFiltersSchema = zod_1.z.object({
  start_date: zod_1.z.string().optional(),
  end_date: zod_1.z.string().optional(),
  clinic_id: zod_1.z.string().optional(),
  room_id: zod_1.z.string().optional(),
  category: zod_1.z.string().optional(),
  item_id: zod_1.z.string().optional(),
  supplier_id: zod_1.z.string().optional(),
  movement_type: zod_1.z
    .enum(["in", "out", "transfer", "adjustment", "return", "waste"])
    .optional(),
  min_value: zod_1.z.number().min(0).optional(),
  max_value: zod_1.z.number().min(0).optional(),
  include_zero_stock: zod_1.z.boolean().optional(),
  only_active_items: zod_1.z.boolean().optional(),
});
exports.ReportParametersSchema = zod_1.z.object({
  type: zod_1.z.enum([
    "stock_movement",
    "stock_valuation",
    "expiring_items",
    "low_stock",
    "transfers",
    "location_performance",
    "supplier_analysis",
    "category_analysis",
  ]),
  filters: exports.ReportFiltersSchema,
  format: zod_1.z.enum(["pdf", "excel", "csv", "json"]),
  groupBy: zod_1.z.array(zod_1.z.string()).optional(),
  sortBy: zod_1.z.string().optional(),
  sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
  includeCharts: zod_1.z.boolean().optional(),
  includeSummary: zod_1.z.boolean().optional(),
  customFields: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.GenerateReportRequestSchema = zod_1.z.object({
  parameters: exports.ReportParametersSchema,
  template_id: zod_1.z.string().optional(),
  save_as_definition: zod_1.z.boolean().optional(),
  definition_name: zod_1.z.string().optional(),
});
exports.ScheduleReportRequestSchema = zod_1.z.object({
  name: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().max(1000).optional(),
  parameters: exports.ReportParametersSchema,
  schedule_cron: zod_1.z.string(),
  timezone: zod_1.z.string().optional(),
  template_id: zod_1.z.string().optional(),
});

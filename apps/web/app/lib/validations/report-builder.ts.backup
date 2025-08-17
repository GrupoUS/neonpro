// Custom Report Builder Validation Schemas
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { z } from 'zod';

// Enum schemas
export const VisualizationTypeSchema = z.enum([
  'table',
  'chart',
  'graph',
  'metric',
  'pivot',
  'dashboard',
]);

export const TemplateCategorySchema = z.enum([
  'financial',
  'patient',
  'operational',
  'clinical',
  'inventory',
  'custom',
]);

export const UsageActionTypeSchema = z.enum([
  'view',
  'generate',
  'export',
  'share',
  'edit',
  'clone',
]);

export const DeliveryMethodSchema = z.enum([
  'email',
  'dashboard',
  'webhook',
  'file_system',
]);

export const ReportFormatSchema = z.enum([
  'pdf',
  'excel',
  'csv',
  'powerpoint',
  'json',
]);

export const PermissionLevelSchema = z.enum(['view', 'edit', 'admin', 'owner']);

export const ConnectorTypeSchema = z.enum([
  'internal',
  'database',
  'api',
  'file',
  'webhook',
]);

export const TestStatusSchema = z.enum([
  'success',
  'failed',
  'unknown',
  'testing',
]);

export const ChartTypeSchema = z.enum([
  'line',
  'bar',
  'pie',
  'donut',
  'area',
  'scatter',
  'gauge',
  'funnel',
  'heatmap',
  'treemap',
  'waterfall',
  'combo',
]);

export const DataSourceTypeSchema = z.enum([
  'sql',
  'api',
  'file',
  'real_time',
  'cached',
]);

export const AggregationTypeSchema = z.enum([
  'sum',
  'avg',
  'count',
  'min',
  'max',
  'distinct',
  'percentile',
]);

export const ComponentTypeSchema = z.enum([
  'chart',
  'table',
  'metric',
  'filter',
  'text',
  'image',
  'container',
]);

export const RefreshRateSchema = z.enum([
  'real_time',
  'every_minute',
  'every_5_minutes',
  'every_15_minutes',
  'every_hour',
  'daily',
  'manual',
]);

export const FilterOperatorSchema = z.enum([
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'in',
  'not_in',
  'like',
  'not_like',
]);

export const FilterTypeSchema = z.enum([
  'date',
  'number',
  'text',
  'select',
  'multi_select',
  'boolean',
]);

export const FilterLogicSchema = z.enum(['AND', 'OR']);

export const ScheduleFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

export const RecipientTypeSchema = z.enum(['to', 'cc', 'bcc']);

export const ErrorSeveritySchema = z.enum(['error', 'warning', 'info']);

// Supporting schemas
export const PositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  z: z.number().optional(),
});

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  min_width: z.number().positive().optional(),
  min_height: z.number().positive().optional(),
  max_width: z.number().positive().optional(),
  max_height: z.number().positive().optional(),
});

export const SpacingSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
});

export const GridSizeSchema = z.object({
  columns: z.number().int().positive(),
  rows: z.number().int().positive(),
  cell_width: z.number().positive(),
  cell_height: z.number().positive(),
});

export const ComponentSpacingSchema = z.object({
  margin: SpacingSchema,
  padding: SpacingSchema,
  gap: z.number().min(0),
});

export const ResponsiveBreakpointsSchema = z.object({
  mobile: z.number().positive(),
  tablet: z.number().positive(),
  desktop: z.number().positive(),
  large_desktop: z.number().positive(),
});

export const FontSizesSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  xxl: z.string(),
});

export const ThemeConfigSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  border_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  font_family: z.string().min(1),
  font_sizes: FontSizesSchema,
});

export const HeaderActionSchema = z.object({
  type: z.string(),
  label: z.string().min(1),
  icon: z.string().optional(),
  handler: z.string().min(1),
});

export const HeaderConfigSchema = z.object({
  show_header: z.boolean(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  logo: z.string().optional(),
  actions: z.array(HeaderActionSchema),
});

export const FooterLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  target: z.string().optional(),
});

export const FooterConfigSchema = z.object({
  show_footer: z.boolean(),
  content: z.string(),
  links: z.array(FooterLinkSchema),
  generated_info: z.boolean(),
});

export const ChartStylingSchema = z.object({
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  opacity: z.number().min(0).max(1),
  border_width: z.number().min(0),
  border_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  font_size: z.number().positive(),
  font_weight: z.string(),
});

export const ChartFilterSchema = z.object({
  field: z.string().min(1),
  operator: FilterOperatorSchema,
  value: z.any(),
  is_required: z.boolean(),
});

export const ChartConfigSchema = z.object({
  id: z.string().uuid(),
  type: ChartTypeSchema,
  title: z.string().min(1),
  data_source: z.string().min(1),
  metrics: z.array(z.string().min(1)),
  dimensions: z.array(z.string().min(1)),
  aggregation: AggregationTypeSchema,
  position: PositionSchema,
  size: SizeSchema,
  styling: ChartStylingSchema,
  filters: z.array(ChartFilterSchema),
});

export const FilterOptionSchema = z.object({
  label: z.string().min(1),
  value: z.any(),
  group: z.string().optional(),
});

export const GlobalFilterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: FilterTypeSchema,
  options: z.array(FilterOptionSchema),
  default_value: z.any(),
  affects_charts: z.array(z.string().uuid()),
});

export const ChartFilterGroupSchema = z.object({
  chart_id: z.string().uuid(),
  filters: z.array(ChartFilterSchema),
  logic: FilterLogicSchema,
});

export const FilterConfigSchema = z.object({
  type: FilterTypeSchema,
  field: z.string().min(1),
  operator: FilterOperatorSchema,
  value: z.any(),
  label: z.string().min(1),
});

export const UserFilterSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  filter_config: FilterConfigSchema,
  is_saved: z.boolean(),
  name: z.string().optional(),
});

export const FilterTransformationSchema = z.object({
  type: z.enum(['map', 'filter', 'aggregate', 'join', 'pivot']),
  config: z.record(z.any()),
});

export const DynamicFilterSchema = z.object({
  id: z.string().uuid(),
  source_field: z.string().min(1),
  target_charts: z.array(z.string().uuid()),
  update_trigger: z.enum(['change', 'click', 'hover', 'time']),
  transformation: FilterTransformationSchema,
});

export const ReportFiltersSchema = z.object({
  global_filters: z.array(GlobalFilterSchema),
  chart_filters: z.array(ChartFilterGroupSchema),
  user_filters: z.array(UserFilterSchema),
  dynamic_filters: z.array(DynamicFilterSchema),
});

export const LayoutSettingsSchema = z.object({
  auto_layout: z.boolean(),
  grid_snap: z.boolean(),
  alignment_guides: z.boolean(),
  responsive_mode: z.boolean(),
});

export const TypographyConfigSchema = z.object({
  font_family: z.string().min(1),
  font_sizes: FontSizesSchema,
  line_heights: z.record(z.number().positive()),
  font_weights: z.record(z.string()),
});

export const StylingConfigSchema = z.object({
  theme: z.string().min(1),
  custom_css: z.string().optional(),
  brand_colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  typography: TypographyConfigSchema,
});

export const ClickActionSchema = z.object({
  type: z.enum(['drill_down', 'filter', 'navigate', 'modal', 'custom']),
  target: z.string().min(1),
  config: z.record(z.any()),
});

export const InteractivityConfigSchema = z.object({
  drill_down: z.boolean(),
  cross_filtering: z.boolean(),
  hover_effects: z.boolean(),
  click_actions: z.array(ClickActionSchema),
});

export const PerformanceConfigSchema = z.object({
  lazy_loading: z.boolean(),
  virtualization: z.boolean(),
  data_sampling: z.boolean(),
  cache_strategy: z.string().min(1),
});

export const LayoutConfigSchema = z.object({
  grid_size: GridSizeSchema,
  responsive_breakpoints: ResponsiveBreakpointsSchema,
  component_spacing: ComponentSpacingSchema,
  theme: ThemeConfigSchema,
  header_config: HeaderConfigSchema,
  footer_config: FooterConfigSchema,
});

export const ReportConfigSchema = z.object({
  charts: z.array(ChartConfigSchema),
  filters: z.array(FilterConfigSchema),
  layout: LayoutSettingsSchema,
  styling: StylingConfigSchema,
  interactivity: InteractivityConfigSchema,
  performance: PerformanceConfigSchema,
});

export const ConnectionInfoSchema = z.object({
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  api_key: z.string().optional(),
  endpoint: z.string().url().optional(),
  headers: z.record(z.string()).optional(),
});

export const SchemaFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'string',
    'number',
    'boolean',
    'date',
    'datetime',
    'json',
    'array',
  ]),
  nullable: z.boolean(),
  default_value: z.any().optional(),
  description: z.string().optional(),
});

export const RelationshipSchema = z.object({
  from_table: z.string().min(1),
  from_field: z.string().min(1),
  to_table: z.string().min(1),
  to_field: z.string().min(1),
  type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
});

export const CustomFieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  formula: z.string().min(1),
  description: z.string().optional(),
});

export const TableSchemaSchema = z.object({
  name: z.string().min(1),
  fields: z.array(SchemaFieldSchema),
  display_name: z.string().optional(),
  description: z.string().optional(),
});

export const DataSchemaSchema = z.object({
  tables: z.array(TableSchemaSchema),
  relationships: z.array(RelationshipSchema),
  custom_fields: z.array(CustomFieldSchema),
});

export const InvalidationRuleSchema = z.object({
  trigger: z.enum(['time', 'data_change', 'manual', 'api_call']),
  condition: z.string().min(1),
  action: z.enum(['refresh', 'clear', 'partial_refresh']),
});

export const CacheConfigSchema = z.object({
  enabled: z.boolean(),
  ttl: z.number().int().positive(),
  strategy: z.enum(['lru', 'fifo', 'ttl', 'manual']),
  invalidation_rules: z.array(InvalidationRuleSchema),
});

export const DataSourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: DataSourceTypeSchema,
  connection: ConnectionInfoSchema,
  schema: DataSchemaSchema,
  refresh_rate: RefreshRateSchema,
  cache_config: CacheConfigSchema,
});

// Main entity schemas
export const CustomReportSchema = z.object({
  id: z.string().uuid(),
  report_name: z.string().min(1).max(255),
  report_description: z.string().optional(),
  report_config: ReportConfigSchema,
  data_sources: z.array(DataSourceSchema),
  visualization_type: VisualizationTypeSchema,
  filters: ReportFiltersSchema,
  layout_config: LayoutConfigSchema,
  is_template: z.boolean(),
  is_public: z.boolean(),
  user_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_generated: z.string().datetime().optional(),
  generation_count: z.number().int().min(0),
});

export const ReportTemplateSchema = z.object({
  id: z.string().uuid(),
  template_name: z.string().min(1).max(255),
  template_description: z.string().optional(),
  category: TemplateCategorySchema,
  config_json: ReportConfigSchema,
  preview_image: z.string().optional(),
  usage_count: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  tags: z.array(z.string()),
  created_by: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ReportUsageAnalyticsSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  user_id: z.string().uuid(),
  access_count: z.number().int().positive(),
  last_accessed: z.string().datetime(),
  usage_duration: z.number().int().min(0),
  action_type: UsageActionTypeSchema,
  session_data: z.record(z.any()),
  created_at: z.string().datetime(),
});

export const RecipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  type: RecipientTypeSchema,
});

export const ScheduleConfigSchema = z.object({
  frequency: ScheduleFrequencySchema,
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timezone: z.string().min(1),
  days_of_week: z.array(z.number().int().min(0).max(6)).optional(),
  days_of_month: z.array(z.number().int().min(1).max(31)).optional(),
  custom_cron: z.string().optional(),
});

export const ReportScheduleSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  schedule_name: z.string().min(1).max(255),
  schedule_config: ScheduleConfigSchema,
  recipients: z.array(RecipientSchema),
  delivery_method: DeliveryMethodSchema,
  format: ReportFormatSchema,
  is_active: z.boolean(),
  next_run: z.string().datetime().optional(),
  last_run: z.string().datetime().optional(),
  run_count: z.number().int().min(0),
  failure_count: z.number().int().min(0),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ReportCollaboratorSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  user_id: z.string().uuid(),
  permission_level: PermissionLevelSchema,
  invited_by: z.string().uuid().optional(),
  invited_at: z.string().datetime(),
  accepted_at: z.string().datetime().optional(),
  last_activity: z.string().datetime().optional(),
});

export const ReportCommentSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  user_id: z.string().uuid(),
  comment_text: z.string().min(1),
  parent_comment_id: z.string().uuid().optional(),
  is_resolved: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const DataSourceConnectorSchema = z.object({
  id: z.string().uuid(),
  connector_name: z.string().min(1).max(255),
  connector_type: ConnectorTypeSchema,
  connection_config: z.record(z.any()),
  schema_definition: z.record(z.any()),
  is_active: z.boolean(),
  last_tested: z.string().datetime().optional(),
  test_status: TestStatusSchema,
  clinic_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Drag & Drop schemas
export const ComponentMetadataSchema = z.object({
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  modified_at: z.string().datetime(),
  version: z.number().int().positive(),
  description: z.string().optional(),
  tags: z.array(z.string()),
});

export const DragConstraintsSchema = z.object({
  can_resize: z.boolean(),
  can_move: z.boolean(),
  snap_to_grid: z.boolean(),
  collision_detection: z.boolean(),
  boundary_limits: z.object({
    min_x: z.number(),
    max_x: z.number(),
    min_y: z.number(),
    max_y: z.number(),
  }),
});

export const ComponentContentSchema = z.object({
  config: z.record(z.any()),
  data: z.any().optional(),
  styling: z.record(z.any()).optional(),
});

export const DragDropItemSchema = z.object({
  id: z.string().uuid(),
  type: ComponentTypeSchema,
  content: ComponentContentSchema,
  position: PositionSchema,
  size: SizeSchema,
  constraints: DragConstraintsSchema,
  metadata: ComponentMetadataSchema,
});

export const ValidationRuleSchema = z.object({
  type: z.enum(['required', 'min_size', 'max_size', 'data_type', 'custom']),
  constraint: z.any(),
  message: z.string().min(1),
});

export const DropZoneSchema = z.object({
  id: z.string().uuid(),
  accepts: z.array(ComponentTypeSchema),
  position: PositionSchema,
  size: SizeSchema,
  is_occupied: z.boolean(),
  validation_rules: z.array(ValidationRuleSchema),
});

// API request/response schemas
export const CreateReportRequestSchema = z.object({
  report_name: z.string().min(1).max(255),
  report_description: z.string().optional(),
  template_id: z.string().uuid().optional(),
  report_config: ReportConfigSchema.partial().optional(),
  data_sources: z.array(DataSourceSchema).optional(),
  visualization_type: VisualizationTypeSchema.optional(),
  is_public: z.boolean().optional(),
});

export const UpdateReportRequestSchema = z.object({
  report_name: z.string().min(1).max(255).optional(),
  report_description: z.string().optional(),
  report_config: ReportConfigSchema.partial().optional(),
  data_sources: z.array(DataSourceSchema).optional(),
  visualization_type: VisualizationTypeSchema.optional(),
  filters: ReportFiltersSchema.partial().optional(),
  layout_config: LayoutConfigSchema.partial().optional(),
  is_public: z.boolean().optional(),
});

export const GenerateReportRequestSchema = z.object({
  report_id: z.string().uuid(),
  format: ReportFormatSchema.optional(),
  filters: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
});

export const CreateReportScheduleRequestSchema = z.object({
  report_id: z.string().uuid(),
  schedule_name: z.string().min(1).max(255),
  schedule_config: ScheduleConfigSchema,
  recipients: z.array(RecipientSchema),
  delivery_method: DeliveryMethodSchema,
  format: ReportFormatSchema,
  is_active: z.boolean().optional().default(true),
});

export const CreateReportTemplateRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  template_config: z.record(z.any()),
  query_config: z.record(z.any()),
  visualization_type: VisualizationTypeSchema,
  is_public: z.boolean().optional().default(false),
});

export const CreateReportShareRequestSchema = z.object({
  share_type: z.enum(['public', 'private', 'organization']),
  permissions: z.array(z.enum(['view', 'generate', 'export'])),
  expires_at: z.string().datetime().optional(),
});

export const UpdateReportScheduleRequestSchema = z.object({
  schedule_name: z.string().min(1).max(255).optional(),
  schedule_config: ScheduleConfigSchema.optional(),
  recipients: z.array(RecipientSchema).optional(),
  delivery_method: DeliveryMethodSchema.optional(),
  format: ReportFormatSchema.optional(),
  is_active: z.boolean().optional(),
});

export const ValidationErrorSchema = z.object({
  component_id: z.string().uuid().optional(),
  field: z.string().min(1),
  message: z.string().min(1),
  severity: ErrorSeveritySchema,
});

export const ReportBuilderActionSchema = z.object({
  type: z.string().min(1),
  timestamp: z.string().datetime(),
  data: z.any(),
  user_id: z.string().uuid(),
});

export const ReportBuilderStateSchema = z.object({
  current_report: CustomReportSchema.optional(),
  selected_template: ReportTemplateSchema.optional(),
  drag_mode: z.boolean(),
  selected_component: z.string().uuid().optional(),
  clipboard: z.array(DragDropItemSchema),
  undo_stack: z.array(ReportBuilderActionSchema),
  redo_stack: z.array(ReportBuilderActionSchema),
  preview_mode: z.boolean(),
  is_saving: z.boolean(),
  validation_errors: z.array(ValidationErrorSchema),
});

// Component Library schemas
export const ComponentCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  components: z.array(z.string().uuid()),
});

export const LibraryComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  category: z.string().uuid(),
  config_template: z.record(z.any()),
  preview_image: z.string().optional(),
});

export const CustomComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  config: z.record(z.any()),
  created_by: z.string().uuid(),
  is_public: z.boolean(),
});

export const ComponentLibrarySchema = z.object({
  categories: z.array(ComponentCategorySchema),
  components: z.array(LibraryComponentSchema),
  custom_components: z.array(CustomComponentSchema),
  favorites: z.array(z.string().uuid()),
});

// Export all schemas for use in API routes and services
export {
  ComponentLibrarySchema as ComponentLibrary,
  CreateReportRequestSchema as CreateReportRequest,
  CreateReportScheduleRequestSchema as CreateReportScheduleRequest,
  CreateReportShareRequestSchema as CreateReportShareRequest,
  CreateReportTemplateRequestSchema as CreateReportTemplateRequest,
  CustomReportSchema as CustomReport,
  DataSourceConnectorSchema as DataSourceConnector,
  DragDropItemSchema as DragDropItem,
  DropZoneSchema as DropZone,
  GenerateReportRequestSchema as GenerateReportRequest,
  ReportBuilderStateSchema as ReportBuilderState,
  ReportCollaboratorSchema as ReportCollaborator,
  ReportCommentSchema as ReportComment,
  ReportScheduleSchema as ReportSchedule,
  ReportTemplateSchema as ReportTemplate,
  ReportUsageAnalyticsSchema as ReportUsageAnalytics,
  UpdateReportRequestSchema as UpdateReportRequest,
  UpdateReportScheduleRequestSchema as UpdateReportScheduleRequest,
};

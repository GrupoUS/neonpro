"use strict";
// Custom Report Builder Validation Schemas
// Story 8.2: Custom Report Builder (Drag-Drop Interface)
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportConfigSchema = exports.LayoutConfigSchema = exports.PerformanceConfigSchema = exports.InteractivityConfigSchema = exports.ClickActionSchema = exports.StylingConfigSchema = exports.TypographyConfigSchema = exports.LayoutSettingsSchema = exports.ReportFiltersSchema = exports.DynamicFilterSchema = exports.FilterTransformationSchema = exports.UserFilterSchema = exports.FilterConfigSchema = exports.ChartFilterGroupSchema = exports.GlobalFilterSchema = exports.FilterOptionSchema = exports.ChartConfigSchema = exports.ChartFilterSchema = exports.ChartStylingSchema = exports.FooterConfigSchema = exports.FooterLinkSchema = exports.HeaderConfigSchema = exports.HeaderActionSchema = exports.ThemeConfigSchema = exports.FontSizesSchema = exports.ResponsiveBreakpointsSchema = exports.ComponentSpacingSchema = exports.GridSizeSchema = exports.SpacingSchema = exports.SizeSchema = exports.PositionSchema = exports.ErrorSeveritySchema = exports.RecipientTypeSchema = exports.ScheduleFrequencySchema = exports.FilterLogicSchema = exports.FilterTypeSchema = exports.FilterOperatorSchema = exports.RefreshRateSchema = exports.ComponentTypeSchema = exports.AggregationTypeSchema = exports.DataSourceTypeSchema = exports.ChartTypeSchema = exports.TestStatusSchema = exports.ConnectorTypeSchema = exports.PermissionLevelSchema = exports.ReportFormatSchema = exports.DeliveryMethodSchema = exports.UsageActionTypeSchema = exports.TemplateCategorySchema = exports.VisualizationTypeSchema = void 0;
exports.ReportCollaborator = exports.ReportBuilderState = exports.GenerateReportRequest = exports.DropZone = exports.DragDropItem = exports.DataSourceConnector = exports.CustomReport = exports.CreateReportTemplateRequest = exports.CreateReportShareRequest = exports.CreateReportScheduleRequest = exports.CreateReportRequest = exports.ComponentLibrary = exports.ComponentLibrarySchema = exports.CustomComponentSchema = exports.LibraryComponentSchema = exports.ComponentCategorySchema = exports.ReportBuilderStateSchema = exports.ReportBuilderActionSchema = exports.ValidationErrorSchema = exports.UpdateReportScheduleRequestSchema = exports.CreateReportShareRequestSchema = exports.CreateReportTemplateRequestSchema = exports.CreateReportScheduleRequestSchema = exports.GenerateReportRequestSchema = exports.UpdateReportRequestSchema = exports.CreateReportRequestSchema = exports.DropZoneSchema = exports.ValidationRuleSchema = exports.DragDropItemSchema = exports.ComponentContentSchema = exports.DragConstraintsSchema = exports.ComponentMetadataSchema = exports.DataSourceConnectorSchema = exports.ReportCommentSchema = exports.ReportCollaboratorSchema = exports.ReportScheduleSchema = exports.ScheduleConfigSchema = exports.RecipientSchema = exports.ReportUsageAnalyticsSchema = exports.ReportTemplateSchema = exports.CustomReportSchema = exports.DataSourceSchema = exports.CacheConfigSchema = exports.InvalidationRuleSchema = exports.DataSchemaSchema = exports.TableSchemaSchema = exports.CustomFieldSchema = exports.RelationshipSchema = exports.SchemaFieldSchema = exports.ConnectionInfoSchema = void 0;
exports.UpdateReportScheduleRequest = exports.UpdateReportRequest = exports.ReportUsageAnalytics = exports.ReportTemplate = exports.ReportSchedule = exports.ReportComment = void 0;
var zod_1 = require("zod");
// Enum schemas
exports.VisualizationTypeSchema = zod_1.z.enum([
    'table', 'chart', 'graph', 'metric', 'pivot', 'dashboard'
]);
exports.TemplateCategorySchema = zod_1.z.enum([
    'financial', 'patient', 'operational', 'clinical', 'inventory', 'custom'
]);
exports.UsageActionTypeSchema = zod_1.z.enum([
    'view', 'generate', 'export', 'share', 'edit', 'clone'
]);
exports.DeliveryMethodSchema = zod_1.z.enum([
    'email', 'dashboard', 'webhook', 'file_system'
]);
exports.ReportFormatSchema = zod_1.z.enum([
    'pdf', 'excel', 'csv', 'powerpoint', 'json'
]);
exports.PermissionLevelSchema = zod_1.z.enum([
    'view', 'edit', 'admin', 'owner'
]);
exports.ConnectorTypeSchema = zod_1.z.enum([
    'internal', 'database', 'api', 'file', 'webhook'
]);
exports.TestStatusSchema = zod_1.z.enum([
    'success', 'failed', 'unknown', 'testing'
]);
exports.ChartTypeSchema = zod_1.z.enum([
    'line', 'bar', 'pie', 'donut', 'area', 'scatter', 'gauge',
    'funnel', 'heatmap', 'treemap', 'waterfall', 'combo'
]);
exports.DataSourceTypeSchema = zod_1.z.enum([
    'sql', 'api', 'file', 'real_time', 'cached'
]);
exports.AggregationTypeSchema = zod_1.z.enum([
    'sum', 'avg', 'count', 'min', 'max', 'distinct', 'percentile'
]);
exports.ComponentTypeSchema = zod_1.z.enum([
    'chart', 'table', 'metric', 'filter', 'text', 'image', 'container'
]);
exports.RefreshRateSchema = zod_1.z.enum([
    'real_time', 'every_minute', 'every_5_minutes', 'every_15_minutes',
    'every_hour', 'daily', 'manual'
]);
exports.FilterOperatorSchema = zod_1.z.enum([
    '=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'like', 'not_like'
]);
exports.FilterTypeSchema = zod_1.z.enum([
    'date', 'number', 'text', 'select', 'multi_select', 'boolean'
]);
exports.FilterLogicSchema = zod_1.z.enum(['AND', 'OR']);
exports.ScheduleFrequencySchema = zod_1.z.enum([
    'daily', 'weekly', 'monthly', 'yearly', 'custom'
]);
exports.RecipientTypeSchema = zod_1.z.enum(['to', 'cc', 'bcc']);
exports.ErrorSeveritySchema = zod_1.z.enum(['error', 'warning', 'info']);
// Supporting schemas
exports.PositionSchema = zod_1.z.object({
    x: zod_1.z.number().min(0),
    y: zod_1.z.number().min(0),
    z: zod_1.z.number().optional()
});
exports.SizeSchema = zod_1.z.object({
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    min_width: zod_1.z.number().positive().optional(),
    min_height: zod_1.z.number().positive().optional(),
    max_width: zod_1.z.number().positive().optional(),
    max_height: zod_1.z.number().positive().optional()
});
exports.SpacingSchema = zod_1.z.object({
    top: zod_1.z.number().min(0),
    right: zod_1.z.number().min(0),
    bottom: zod_1.z.number().min(0),
    left: zod_1.z.number().min(0)
});
exports.GridSizeSchema = zod_1.z.object({
    columns: zod_1.z.number().int().positive(),
    rows: zod_1.z.number().int().positive(),
    cell_width: zod_1.z.number().positive(),
    cell_height: zod_1.z.number().positive()
});
exports.ComponentSpacingSchema = zod_1.z.object({
    margin: exports.SpacingSchema,
    padding: exports.SpacingSchema,
    gap: zod_1.z.number().min(0)
});
exports.ResponsiveBreakpointsSchema = zod_1.z.object({
    mobile: zod_1.z.number().positive(),
    tablet: zod_1.z.number().positive(),
    desktop: zod_1.z.number().positive(),
    large_desktop: zod_1.z.number().positive()
});
exports.FontSizesSchema = zod_1.z.object({
    xs: zod_1.z.string(),
    sm: zod_1.z.string(),
    md: zod_1.z.string(),
    lg: zod_1.z.string(),
    xl: zod_1.z.string(),
    xxl: zod_1.z.string()
});
exports.ThemeConfigSchema = zod_1.z.object({
    primary_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    background_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    border_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    font_family: zod_1.z.string().min(1),
    font_sizes: exports.FontSizesSchema
});
exports.HeaderActionSchema = zod_1.z.object({
    type: zod_1.z.string(),
    label: zod_1.z.string().min(1),
    icon: zod_1.z.string().optional(),
    handler: zod_1.z.string().min(1)
});
exports.HeaderConfigSchema = zod_1.z.object({
    show_header: zod_1.z.boolean(),
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    actions: zod_1.z.array(exports.HeaderActionSchema)
});
exports.FooterLinkSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    target: zod_1.z.string().optional()
});
exports.FooterConfigSchema = zod_1.z.object({
    show_footer: zod_1.z.boolean(),
    content: zod_1.z.string(),
    links: zod_1.z.array(exports.FooterLinkSchema),
    generated_info: zod_1.z.boolean()
});
exports.ChartStylingSchema = zod_1.z.object({
    colors: zod_1.z.array(zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
    opacity: zod_1.z.number().min(0).max(1),
    border_width: zod_1.z.number().min(0),
    border_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    background_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    font_size: zod_1.z.number().positive(),
    font_weight: zod_1.z.string()
});
exports.ChartFilterSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    operator: exports.FilterOperatorSchema,
    value: zod_1.z.any(),
    is_required: zod_1.z.boolean()
});
exports.ChartConfigSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: exports.ChartTypeSchema,
    title: zod_1.z.string().min(1),
    data_source: zod_1.z.string().min(1),
    metrics: zod_1.z.array(zod_1.z.string().min(1)),
    dimensions: zod_1.z.array(zod_1.z.string().min(1)),
    aggregation: exports.AggregationTypeSchema,
    position: exports.PositionSchema,
    size: exports.SizeSchema,
    styling: exports.ChartStylingSchema,
    filters: zod_1.z.array(exports.ChartFilterSchema)
});
exports.FilterOptionSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    value: zod_1.z.any(),
    group: zod_1.z.string().optional()
});
exports.GlobalFilterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    type: exports.FilterTypeSchema,
    options: zod_1.z.array(exports.FilterOptionSchema),
    default_value: zod_1.z.any(),
    affects_charts: zod_1.z.array(zod_1.z.string().uuid())
});
exports.ChartFilterGroupSchema = zod_1.z.object({
    chart_id: zod_1.z.string().uuid(),
    filters: zod_1.z.array(exports.ChartFilterSchema),
    logic: exports.FilterLogicSchema
});
exports.FilterConfigSchema = zod_1.z.object({
    type: exports.FilterTypeSchema,
    field: zod_1.z.string().min(1),
    operator: exports.FilterOperatorSchema,
    value: zod_1.z.any(),
    label: zod_1.z.string().min(1)
});
exports.UserFilterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    filter_config: exports.FilterConfigSchema,
    is_saved: zod_1.z.boolean(),
    name: zod_1.z.string().optional()
});
exports.FilterTransformationSchema = zod_1.z.object({
    type: zod_1.z.enum(['map', 'filter', 'aggregate', 'join', 'pivot']),
    config: zod_1.z.record(zod_1.z.any())
});
exports.DynamicFilterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    source_field: zod_1.z.string().min(1),
    target_charts: zod_1.z.array(zod_1.z.string().uuid()),
    update_trigger: zod_1.z.enum(['change', 'click', 'hover', 'time']),
    transformation: exports.FilterTransformationSchema
});
exports.ReportFiltersSchema = zod_1.z.object({
    global_filters: zod_1.z.array(exports.GlobalFilterSchema),
    chart_filters: zod_1.z.array(exports.ChartFilterGroupSchema),
    user_filters: zod_1.z.array(exports.UserFilterSchema),
    dynamic_filters: zod_1.z.array(exports.DynamicFilterSchema)
});
exports.LayoutSettingsSchema = zod_1.z.object({
    auto_layout: zod_1.z.boolean(),
    grid_snap: zod_1.z.boolean(),
    alignment_guides: zod_1.z.boolean(),
    responsive_mode: zod_1.z.boolean()
});
exports.TypographyConfigSchema = zod_1.z.object({
    font_family: zod_1.z.string().min(1),
    font_sizes: exports.FontSizesSchema,
    line_heights: zod_1.z.record(zod_1.z.number().positive()),
    font_weights: zod_1.z.record(zod_1.z.string())
});
exports.StylingConfigSchema = zod_1.z.object({
    theme: zod_1.z.string().min(1),
    custom_css: zod_1.z.string().optional(),
    brand_colors: zod_1.z.array(zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
    typography: exports.TypographyConfigSchema
});
exports.ClickActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['drill_down', 'filter', 'navigate', 'modal', 'custom']),
    target: zod_1.z.string().min(1),
    config: zod_1.z.record(zod_1.z.any())
});
exports.InteractivityConfigSchema = zod_1.z.object({
    drill_down: zod_1.z.boolean(),
    cross_filtering: zod_1.z.boolean(),
    hover_effects: zod_1.z.boolean(),
    click_actions: zod_1.z.array(exports.ClickActionSchema)
});
exports.PerformanceConfigSchema = zod_1.z.object({
    lazy_loading: zod_1.z.boolean(),
    virtualization: zod_1.z.boolean(),
    data_sampling: zod_1.z.boolean(),
    cache_strategy: zod_1.z.string().min(1)
});
exports.LayoutConfigSchema = zod_1.z.object({
    grid_size: exports.GridSizeSchema,
    responsive_breakpoints: exports.ResponsiveBreakpointsSchema,
    component_spacing: exports.ComponentSpacingSchema,
    theme: exports.ThemeConfigSchema,
    header_config: exports.HeaderConfigSchema,
    footer_config: exports.FooterConfigSchema
});
exports.ReportConfigSchema = zod_1.z.object({
    charts: zod_1.z.array(exports.ChartConfigSchema),
    filters: zod_1.z.array(exports.FilterConfigSchema),
    layout: exports.LayoutSettingsSchema,
    styling: exports.StylingConfigSchema,
    interactivity: exports.InteractivityConfigSchema,
    performance: exports.PerformanceConfigSchema
});
exports.ConnectionInfoSchema = zod_1.z.object({
    host: zod_1.z.string().optional(),
    port: zod_1.z.number().int().positive().optional(),
    database: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    api_key: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().url().optional(),
    headers: zod_1.z.record(zod_1.z.string()).optional()
});
exports.SchemaFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'json', 'array']),
    nullable: zod_1.z.boolean(),
    default_value: zod_1.z.any().optional(),
    description: zod_1.z.string().optional()
});
exports.RelationshipSchema = zod_1.z.object({
    from_table: zod_1.z.string().min(1),
    from_field: zod_1.z.string().min(1),
    to_table: zod_1.z.string().min(1),
    to_field: zod_1.z.string().min(1),
    type: zod_1.z.enum(['one_to_one', 'one_to_many', 'many_to_many'])
});
exports.CustomFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    formula: zod_1.z.string().min(1),
    description: zod_1.z.string().optional()
});
exports.TableSchemaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    fields: zod_1.z.array(exports.SchemaFieldSchema),
    display_name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
exports.DataSchemaSchema = zod_1.z.object({
    tables: zod_1.z.array(exports.TableSchemaSchema),
    relationships: zod_1.z.array(exports.RelationshipSchema),
    custom_fields: zod_1.z.array(exports.CustomFieldSchema)
});
exports.InvalidationRuleSchema = zod_1.z.object({
    trigger: zod_1.z.enum(['time', 'data_change', 'manual', 'api_call']),
    condition: zod_1.z.string().min(1),
    action: zod_1.z.enum(['refresh', 'clear', 'partial_refresh'])
});
exports.CacheConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    ttl: zod_1.z.number().int().positive(),
    strategy: zod_1.z.enum(['lru', 'fifo', 'ttl', 'manual']),
    invalidation_rules: zod_1.z.array(exports.InvalidationRuleSchema)
});
exports.DataSourceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    type: exports.DataSourceTypeSchema,
    connection: exports.ConnectionInfoSchema,
    schema: exports.DataSchemaSchema,
    refresh_rate: exports.RefreshRateSchema,
    cache_config: exports.CacheConfigSchema
});
// Main entity schemas
exports.CustomReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    report_name: zod_1.z.string().min(1).max(255),
    report_description: zod_1.z.string().optional(),
    report_config: exports.ReportConfigSchema,
    data_sources: zod_1.z.array(exports.DataSourceSchema),
    visualization_type: exports.VisualizationTypeSchema,
    filters: exports.ReportFiltersSchema,
    layout_config: exports.LayoutConfigSchema,
    is_template: zod_1.z.boolean(),
    is_public: zod_1.z.boolean(),
    user_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    last_generated: zod_1.z.string().datetime().optional(),
    generation_count: zod_1.z.number().int().min(0)
});
exports.CustomReport = exports.CustomReportSchema;
exports.ReportTemplateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    template_name: zod_1.z.string().min(1).max(255),
    template_description: zod_1.z.string().optional(),
    category: exports.TemplateCategorySchema,
    config_json: exports.ReportConfigSchema,
    preview_image: zod_1.z.string().optional(),
    usage_count: zod_1.z.number().int().min(0),
    rating: zod_1.z.number().min(0).max(5),
    is_featured: zod_1.z.boolean(),
    is_active: zod_1.z.boolean(),
    tags: zod_1.z.array(zod_1.z.string()),
    created_by: zod_1.z.string().uuid().optional(),
    clinic_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.ReportTemplate = exports.ReportTemplateSchema;
exports.ReportUsageAnalyticsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    report_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    access_count: zod_1.z.number().int().positive(),
    last_accessed: zod_1.z.string().datetime(),
    usage_duration: zod_1.z.number().int().min(0),
    action_type: exports.UsageActionTypeSchema,
    session_data: zod_1.z.record(zod_1.z.any()),
    created_at: zod_1.z.string().datetime()
});
exports.ReportUsageAnalytics = exports.ReportUsageAnalyticsSchema;
exports.RecipientSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    type: exports.RecipientTypeSchema
});
exports.ScheduleConfigSchema = zod_1.z.object({
    frequency: exports.ScheduleFrequencySchema,
    time: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: zod_1.z.string().min(1),
    days_of_week: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(),
    days_of_month: zod_1.z.array(zod_1.z.number().int().min(1).max(31)).optional(),
    custom_cron: zod_1.z.string().optional()
});
exports.ReportScheduleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    report_id: zod_1.z.string().uuid(),
    schedule_name: zod_1.z.string().min(1).max(255),
    schedule_config: exports.ScheduleConfigSchema,
    recipients: zod_1.z.array(exports.RecipientSchema),
    delivery_method: exports.DeliveryMethodSchema,
    format: exports.ReportFormatSchema,
    is_active: zod_1.z.boolean(),
    next_run: zod_1.z.string().datetime().optional(),
    last_run: zod_1.z.string().datetime().optional(),
    run_count: zod_1.z.number().int().min(0),
    failure_count: zod_1.z.number().int().min(0),
    created_by: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.ReportSchedule = exports.ReportScheduleSchema;
exports.ReportCollaboratorSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    report_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    permission_level: exports.PermissionLevelSchema,
    invited_by: zod_1.z.string().uuid().optional(),
    invited_at: zod_1.z.string().datetime(),
    accepted_at: zod_1.z.string().datetime().optional(),
    last_activity: zod_1.z.string().datetime().optional()
});
exports.ReportCollaborator = exports.ReportCollaboratorSchema;
exports.ReportCommentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    report_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    comment_text: zod_1.z.string().min(1),
    parent_comment_id: zod_1.z.string().uuid().optional(),
    is_resolved: zod_1.z.boolean(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.ReportComment = exports.ReportCommentSchema;
exports.DataSourceConnectorSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    connector_name: zod_1.z.string().min(1).max(255),
    connector_type: exports.ConnectorTypeSchema,
    connection_config: zod_1.z.record(zod_1.z.any()),
    schema_definition: zod_1.z.record(zod_1.z.any()),
    is_active: zod_1.z.boolean(),
    last_tested: zod_1.z.string().datetime().optional(),
    test_status: exports.TestStatusSchema,
    clinic_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.DataSourceConnector = exports.DataSourceConnectorSchema;
// Drag & Drop schemas
exports.ComponentMetadataSchema = zod_1.z.object({
    created_by: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    modified_at: zod_1.z.string().datetime(),
    version: zod_1.z.number().int().positive(),
    description: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string())
});
exports.DragConstraintsSchema = zod_1.z.object({
    can_resize: zod_1.z.boolean(),
    can_move: zod_1.z.boolean(),
    snap_to_grid: zod_1.z.boolean(),
    collision_detection: zod_1.z.boolean(),
    boundary_limits: zod_1.z.object({
        min_x: zod_1.z.number(),
        max_x: zod_1.z.number(),
        min_y: zod_1.z.number(),
        max_y: zod_1.z.number()
    })
});
exports.ComponentContentSchema = zod_1.z.object({
    config: zod_1.z.record(zod_1.z.any()),
    data: zod_1.z.any().optional(),
    styling: zod_1.z.record(zod_1.z.any()).optional()
});
exports.DragDropItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: exports.ComponentTypeSchema,
    content: exports.ComponentContentSchema,
    position: exports.PositionSchema,
    size: exports.SizeSchema,
    constraints: exports.DragConstraintsSchema,
    metadata: exports.ComponentMetadataSchema
});
exports.DragDropItem = exports.DragDropItemSchema;
exports.ValidationRuleSchema = zod_1.z.object({
    type: zod_1.z.enum(['required', 'min_size', 'max_size', 'data_type', 'custom']),
    constraint: zod_1.z.any(),
    message: zod_1.z.string().min(1)
});
exports.DropZoneSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    accepts: zod_1.z.array(exports.ComponentTypeSchema),
    position: exports.PositionSchema,
    size: exports.SizeSchema,
    is_occupied: zod_1.z.boolean(),
    validation_rules: zod_1.z.array(exports.ValidationRuleSchema)
});
exports.DropZone = exports.DropZoneSchema;
// API request/response schemas
exports.CreateReportRequestSchema = zod_1.z.object({
    report_name: zod_1.z.string().min(1).max(255),
    report_description: zod_1.z.string().optional(),
    template_id: zod_1.z.string().uuid().optional(),
    report_config: exports.ReportConfigSchema.partial().optional(),
    data_sources: zod_1.z.array(exports.DataSourceSchema).optional(),
    visualization_type: exports.VisualizationTypeSchema.optional(),
    is_public: zod_1.z.boolean().optional()
});
exports.CreateReportRequest = exports.CreateReportRequestSchema;
exports.UpdateReportRequestSchema = zod_1.z.object({
    report_name: zod_1.z.string().min(1).max(255).optional(),
    report_description: zod_1.z.string().optional(),
    report_config: exports.ReportConfigSchema.partial().optional(),
    data_sources: zod_1.z.array(exports.DataSourceSchema).optional(),
    visualization_type: exports.VisualizationTypeSchema.optional(),
    filters: exports.ReportFiltersSchema.partial().optional(),
    layout_config: exports.LayoutConfigSchema.partial().optional(),
    is_public: zod_1.z.boolean().optional()
});
exports.UpdateReportRequest = exports.UpdateReportRequestSchema;
exports.GenerateReportRequestSchema = zod_1.z.object({
    report_id: zod_1.z.string().uuid(),
    format: exports.ReportFormatSchema.optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional()
});
exports.GenerateReportRequest = exports.GenerateReportRequestSchema;
exports.CreateReportScheduleRequestSchema = zod_1.z.object({
    report_id: zod_1.z.string().uuid(),
    schedule_name: zod_1.z.string().min(1).max(255),
    schedule_config: exports.ScheduleConfigSchema,
    recipients: zod_1.z.array(exports.RecipientSchema),
    delivery_method: exports.DeliveryMethodSchema,
    format: exports.ReportFormatSchema,
    is_active: zod_1.z.boolean().optional().default(true)
});
exports.CreateReportScheduleRequest = exports.CreateReportScheduleRequestSchema;
exports.CreateReportTemplateRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1).max(100),
    template_config: zod_1.z.record(zod_1.z.any()),
    query_config: zod_1.z.record(zod_1.z.any()),
    visualization_type: exports.VisualizationTypeSchema,
    is_public: zod_1.z.boolean().optional().default(false)
});
exports.CreateReportTemplateRequest = exports.CreateReportTemplateRequestSchema;
exports.CreateReportShareRequestSchema = zod_1.z.object({
    share_type: zod_1.z.enum(['public', 'private', 'organization']),
    permissions: zod_1.z.array(zod_1.z.enum(['view', 'generate', 'export'])),
    expires_at: zod_1.z.string().datetime().optional()
});
exports.CreateReportShareRequest = exports.CreateReportShareRequestSchema;
exports.UpdateReportScheduleRequestSchema = zod_1.z.object({
    schedule_name: zod_1.z.string().min(1).max(255).optional(),
    schedule_config: exports.ScheduleConfigSchema.optional(),
    recipients: zod_1.z.array(exports.RecipientSchema).optional(),
    delivery_method: exports.DeliveryMethodSchema.optional(),
    format: exports.ReportFormatSchema.optional(),
    is_active: zod_1.z.boolean().optional()
});
exports.UpdateReportScheduleRequest = exports.UpdateReportScheduleRequestSchema;
exports.ValidationErrorSchema = zod_1.z.object({
    component_id: zod_1.z.string().uuid().optional(),
    field: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    severity: exports.ErrorSeveritySchema
});
exports.ReportBuilderActionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1),
    timestamp: zod_1.z.string().datetime(),
    data: zod_1.z.any(),
    user_id: zod_1.z.string().uuid()
});
exports.ReportBuilderStateSchema = zod_1.z.object({
    current_report: exports.CustomReportSchema.optional(),
    selected_template: exports.ReportTemplateSchema.optional(),
    drag_mode: zod_1.z.boolean(),
    selected_component: zod_1.z.string().uuid().optional(),
    clipboard: zod_1.z.array(exports.DragDropItemSchema),
    undo_stack: zod_1.z.array(exports.ReportBuilderActionSchema),
    redo_stack: zod_1.z.array(exports.ReportBuilderActionSchema),
    preview_mode: zod_1.z.boolean(),
    is_saving: zod_1.z.boolean(),
    validation_errors: zod_1.z.array(exports.ValidationErrorSchema)
});
exports.ReportBuilderState = exports.ReportBuilderStateSchema;
// Component Library schemas
exports.ComponentCategorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    icon: zod_1.z.string().min(1),
    components: zod_1.z.array(zod_1.z.string().uuid())
});
exports.LibraryComponentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    icon: zod_1.z.string().min(1),
    category: zod_1.z.string().uuid(),
    config_template: zod_1.z.record(zod_1.z.any()),
    preview_image: zod_1.z.string().optional()
});
exports.CustomComponentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    config: zod_1.z.record(zod_1.z.any()),
    created_by: zod_1.z.string().uuid(),
    is_public: zod_1.z.boolean()
});
exports.ComponentLibrarySchema = zod_1.z.object({
    categories: zod_1.z.array(exports.ComponentCategorySchema),
    components: zod_1.z.array(exports.LibraryComponentSchema),
    custom_components: zod_1.z.array(exports.CustomComponentSchema),
    favorites: zod_1.z.array(zod_1.z.string().uuid())
});
exports.ComponentLibrary = exports.ComponentLibrarySchema;

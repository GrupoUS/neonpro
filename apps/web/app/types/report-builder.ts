// Custom Report Builder Types
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

// Core Report Types
export type CustomReport = {
  id: string;
  report_name: string;
  report_description?: string;
  report_config: ReportConfig;
  data_sources: DataSource[];
  visualization_type: VisualizationType;
  filters: ReportFilters;
  layout_config: LayoutConfig;
  is_template: boolean;
  is_public: boolean;
  user_id: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  last_generated?: string;
  generation_count: number;
};

export type ReportTemplate = {
  id: string;
  template_name: string;
  template_description?: string;
  category: TemplateCategory;
  config_json: ReportConfig;
  preview_image?: string;
  usage_count: number;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  tags: string[];
  created_by?: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
};

export type ReportUsageAnalytics = {
  id: string;
  report_id: string;
  user_id: string;
  access_count: number;
  last_accessed: string;
  usage_duration: number;
  action_type: UsageActionType;
  session_data: Record<string, unknown>;
  created_at: string;
};

export type ReportSchedule = {
  id: string;
  report_id: string;
  schedule_name: string;
  schedule_config: ScheduleConfig;
  recipients: Recipient[];
  delivery_method: DeliveryMethod;
  format: ReportFormat;
  is_active: boolean;
  next_run?: string;
  last_run?: string;
  run_count: number;
  failure_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ReportCollaborator = {
  id: string;
  report_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  last_activity?: string;
};

export type ReportComment = {
  id: string;
  report_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
};

export type DataSourceConnector = {
  id: string;
  connector_name: string;
  connector_type: ConnectorType;
  connection_config: ConnectionConfig;
  schema_definition: SchemaDefinition;
  is_active: boolean;
  last_tested?: string;
  test_status: TestStatus;
  clinic_id: string;
  created_at: string;
  updated_at: string;
};

// Configuration Types
export type ReportConfig = {
  charts: ChartConfig[];
  filters: FilterConfig[];
  layout: LayoutSettings;
  styling: StylingConfig;
  interactivity: InteractivityConfig;
  performance: PerformanceConfig;
};

export type ChartConfig = {
  id: string;
  type: ChartType;
  title: string;
  data_source: string;
  metrics: string[];
  dimensions: string[];
  aggregation: AggregationType;
  position: Position;
  size: Size;
  styling: ChartStyling;
  filters: ChartFilter[];
};

export type DataSource = {
  id: string;
  name: string;
  type: DataSourceType;
  connection: ConnectionInfo;
  schema: DataSchema;
  refresh_rate: RefreshRate;
  cache_config: CacheConfig;
};

export type ReportFilters = {
  global_filters: GlobalFilter[];
  chart_filters: ChartFilterGroup[];
  user_filters: UserFilter[];
  dynamic_filters: DynamicFilter[];
};

export type LayoutConfig = {
  grid_size: GridSize;
  responsive_breakpoints: ResponsiveBreakpoints;
  component_spacing: ComponentSpacing;
  theme: ThemeConfig;
  header_config: HeaderConfig;
  footer_config: FooterConfig;
};

// Drag & Drop Types
export type DragDropItem = {
  id: string;
  type: ComponentType;
  content: ComponentContent;
  position: Position;
  size: Size;
  constraints: DragConstraints;
  metadata: ComponentMetadata;
};

export type DropZone = {
  id: string;
  accepts: ComponentType[];
  position: Position;
  size: Size;
  is_occupied: boolean;
  validation_rules: ValidationRule[];
};

export type ComponentLibrary = {
  categories: ComponentCategory[];
  components: LibraryComponent[];
  custom_components: CustomComponent[];
  favorites: string[];
};

// Enum Types
export type VisualizationType = "table" | "chart" | "graph" | "metric" | "pivot" | "dashboard";

export type TemplateCategory =
  | "financial"
  | "patient"
  | "operational"
  | "clinical"
  | "inventory"
  | "custom";

export type UsageActionType = "view" | "generate" | "export" | "share" | "edit" | "clone";

export type DeliveryMethod = "email" | "dashboard" | "webhook" | "file_system";

export type ReportFormat = "pdf" | "excel" | "csv" | "powerpoint" | "json";

export type PermissionLevel = "view" | "edit" | "admin" | "owner";

export type ConnectorType = "internal" | "database" | "api" | "file" | "webhook";

export type TestStatus = "success" | "failed" | "unknown" | "testing";

export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "donut"
  | "area"
  | "scatter"
  | "gauge"
  | "funnel"
  | "heatmap"
  | "treemap"
  | "waterfall"
  | "combo";

export type DataSourceType = "sql" | "api" | "file" | "real_time" | "cached";

export type AggregationType = "sum" | "avg" | "count" | "min" | "max" | "distinct" | "percentile";

export type ComponentType =
  | "chart"
  | "table"
  | "metric"
  | "filter"
  | "text"
  | "image"
  | "container";

export type RefreshRate =
  | "real_time"
  | "every_minute"
  | "every_5_minutes"
  | "every_15_minutes"
  | "every_hour"
  | "daily"
  | "manual";

// Supporting Interface Types
export type Position = {
  x: number;
  y: number;
  z?: number;
};

export type Size = {
  width: number;
  height: number;
  min_width?: number;
  min_height?: number;
  max_width?: number;
  max_height?: number;
};

export type GridSize = {
  columns: number;
  rows: number;
  cell_width: number;
  cell_height: number;
};

export type ResponsiveBreakpoints = {
  mobile: number;
  tablet: number;
  desktop: number;
  large_desktop: number;
};

export type ComponentSpacing = {
  margin: Spacing;
  padding: Spacing;
  gap: number;
};

export type Spacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ThemeConfig = {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  border_color: string;
  accent_color: string;
  font_family: string;
  font_sizes: FontSizes;
};

export type FontSizes = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
};

export type HeaderConfig = {
  show_header: boolean;
  title: string;
  subtitle?: string;
  logo?: string;
  actions: HeaderAction[];
};

export type FooterConfig = {
  show_footer: boolean;
  content: string;
  links: FooterLink[];
  generated_info: boolean;
};

export type ChartStyling = {
  colors: string[];
  opacity: number;
  border_width: number;
  border_color: string;
  background_color: string;
  font_size: number;
  font_weight: string;
};

export type ChartFilter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
  is_required: boolean;
};

export type GlobalFilter = {
  id: string;
  name: string;
  type: FilterType;
  options: FilterOption[];
  default_value: unknown;
  affects_charts: string[];
};

export type ChartFilterGroup = {
  chart_id: string;
  filters: ChartFilter[];
  logic: FilterLogic;
};

export type UserFilter = {
  id: string;
  user_id: string;
  filter_config: FilterConfig;
  is_saved: boolean;
  name?: string;
};

export type DynamicFilter = {
  id: string;
  source_field: string;
  target_charts: string[];
  update_trigger: UpdateTrigger;
  transformation: FilterTransformation;
};

export type ConnectionInfo = {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  api_key?: string;
  endpoint?: string;
  headers?: Record<string, string>;
};

export type DataSchema = {
  tables: TableSchema[];
  relationships: Relationship[];
  custom_fields: CustomField[];
};

export type CacheConfig = {
  enabled: boolean;
  ttl: number;
  strategy: CacheStrategy;
  invalidation_rules: InvalidationRule[];
};

export type DragConstraints = {
  can_resize: boolean;
  can_move: boolean;
  snap_to_grid: boolean;
  collision_detection: boolean;
  boundary_limits: BoundaryLimits;
};

export type ComponentMetadata = {
  created_by: string;
  created_at: string;
  modified_at: string;
  version: number;
  description?: string;
  tags: string[];
};

export type ComponentCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  components: string[];
};

export type LibraryComponent = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  config_template: ComponentConfig;
  preview_image?: string;
};

export type CustomComponent = {
  id: string;
  name: string;
  description: string;
  config: ComponentConfig;
  created_by: string;
  is_public: boolean;
};

// Additional Supporting Types
export type ScheduleConfig = {
  frequency: ScheduleFrequency;
  time: string;
  timezone: string;
  days_of_week?: number[];
  days_of_month?: number[];
  custom_cron?: string;
};

export type Recipient = {
  email: string;
  name?: string;
  type: RecipientType;
};

export type ConnectionConfig = {
  [key: string]: unknown;
};

export type SchemaDefinition = {
  fields: SchemaField[];
  primary_keys: string[];
  foreign_keys: ForeignKey[];
  indexes: Index[];
};

export type LayoutSettings = {
  auto_layout: boolean;
  grid_snap: boolean;
  alignment_guides: boolean;
  responsive_mode: boolean;
};

export type StylingConfig = {
  theme: string;
  custom_css?: string;
  brand_colors: string[];
  typography: TypographyConfig;
};

export type InteractivityConfig = {
  drill_down: boolean;
  cross_filtering: boolean;
  hover_effects: boolean;
  click_actions: ClickAction[];
};

export type PerformanceConfig = {
  lazy_loading: boolean;
  virtualization: boolean;
  data_sampling: boolean;
  cache_strategy: string;
};

export type ComponentContent = {
  config: ComponentConfig;
  data?: unknown;
  styling?: ComponentStyling;
};

export type ValidationRule = {
  type: ValidationType;
  constraint: unknown;
  message: string;
};

// Enum String Literals
export type FilterOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "in"
  | "not_in"
  | "like"
  | "not_like";
export type FilterType = "date" | "number" | "text" | "select" | "multi_select" | "boolean";
export type FilterLogic = "AND" | "OR";
export type UpdateTrigger = "change" | "click" | "hover" | "time";
export type CacheStrategy = "lru" | "fifo" | "ttl" | "manual";
export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "yearly" | "custom";
export type RecipientType = "to" | "cc" | "bcc";
export type ValidationType = "required" | "min_size" | "max_size" | "data_type" | "custom";

// Additional Interface Types (continued)
export type FilterOption = {
  label: string;
  value: unknown;
  group?: string;
};

export type FilterConfig = {
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: unknown;
  label: string;
};

export type FilterTransformation = {
  type: TransformationType;
  config: Record<string, unknown>;
};

export type TableSchema = {
  name: string;
  fields: SchemaField[];
  display_name?: string;
  description?: string;
};

export type Relationship = {
  from_table: string;
  from_field: string;
  to_table: string;
  to_field: string;
  type: RelationshipType;
};

export type CustomField = {
  name: string;
  type: string;
  formula: string;
  description?: string;
};

export type InvalidationRule = {
  trigger: InvalidationTrigger;
  condition: string;
  action: InvalidationAction;
};

export type BoundaryLimits = {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
};

export type ComponentConfig = {
  [key: string]: unknown;
};

export type ComponentStyling = {
  [key: string]: unknown;
};

export type HeaderAction = {
  type: ActionType;
  label: string;
  icon?: string;
  handler: string;
};

export type FooterLink = {
  label: string;
  url: string;
  target?: string;
};

export type TypographyConfig = {
  font_family: string;
  font_sizes: FontSizes;
  line_heights: Record<string, number>;
  font_weights: Record<string, string>;
};

export type ClickAction = {
  type: ClickActionType;
  target: string;
  config: Record<string, unknown>;
};

export type SchemaField = {
  name: string;
  type: FieldType;
  nullable: boolean;
  default_value?: unknown;
  description?: string;
};

export type ForeignKey = {
  field: string;
  references_table: string;
  references_field: string;
};

export type Index = {
  name: string;
  fields: string[];
  unique: boolean;
};

// Final Enum Types
export type TransformationType = "map" | "filter" | "aggregate" | "join" | "pivot";
export type RelationshipType = "one_to_one" | "one_to_many" | "many_to_many";
export type InvalidationTrigger = "time" | "data_change" | "manual" | "api_call";
export type InvalidationAction = "refresh" | "clear" | "partial_refresh";
export type ActionType = "export" | "share" | "edit" | "clone" | "custom";
export type ClickActionType = "drill_down" | "filter" | "navigate" | "modal" | "custom";
export type FieldType = "string" | "number" | "boolean" | "date" | "datetime" | "json" | "array";

// API Request/Response Types
export type CreateReportRequest = {
  report_name: string;
  report_description?: string;
  template_id?: string;
  report_config?: Partial<ReportConfig>;
  data_sources?: DataSource[];
  visualization_type?: VisualizationType;
  is_public?: boolean;
};

export type UpdateReportRequest = {
  report_name?: string;
  report_description?: string;
  report_config?: Partial<ReportConfig>;
  data_sources?: DataSource[];
  visualization_type?: VisualizationType;
  filters?: Partial<ReportFilters>;
  layout_config?: Partial<LayoutConfig>;
  is_public?: boolean;
};

export type GenerateReportRequest = {
  report_id: string;
  format?: ReportFormat;
  filters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
};

export type ReportListResponse = {
  reports: CustomReport[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
};

export type TemplateListResponse = {
  templates: ReportTemplate[];
  categories: string[];
  featured: ReportTemplate[];
  total_count: number;
};

export type ReportAnalyticsResponse = {
  usage_stats: ReportUsageAnalytics[];
  performance_metrics: PerformanceMetrics;
  user_engagement: EngagementMetrics;
};

export type PerformanceMetrics = {
  average_generation_time: number;
  cache_hit_rate: number;
  error_rate: number;
  data_freshness: number;
};

export type EngagementMetrics = {
  total_views: number;
  unique_users: number;
  average_session_duration: number;
  bounce_rate: number;
};

// Report Builder UI State Types
export type ReportBuilderState = {
  current_report?: CustomReport;
  selected_template?: ReportTemplate;
  drag_mode: boolean;
  selected_component?: string;
  clipboard: DragDropItem[];
  undo_stack: ReportBuilderAction[];
  redo_stack: ReportBuilderAction[];
  preview_mode: boolean;
  is_saving: boolean;
  validation_errors: ValidationError[];
};

export type ReportBuilderAction = {
  type: ActionType;
  timestamp: string;
  data: unknown;
  user_id: string;
};

export type ValidationError = {
  component_id?: string;
  field: string;
  message: string;
  severity: ErrorSeverity;
};

export type ErrorSeverity = "error" | "warning" | "info";

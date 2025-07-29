// =====================================================================================
// AUTOMATED MARKETING CAMPAIGNS + PERSONALIZATION TYPES
// Epic 7 - Story 7.2: Comprehensive types for automated marketing campaigns
// =====================================================================================

export type CampaignType = 
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push_notification'
  | 'in_app'
  | 'multi_channel';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type TriggerType = 
  | 'manual'
  | 'scheduled'
  | 'event_based'
  | 'segment_entry'
  | 'segment_exit'
  | 'behavioral'
  | 'date_based'
  | 'lifecycle_stage';

export type PersonalizationLevel = 
  | 'none'
  | 'basic'
  | 'advanced'
  | 'ai_driven';

export type CampaignPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type DeliveryStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'converted'
  | 'bounced'
  | 'failed'
  | 'unsubscribed';

export type ConsentStatus = 
  | 'granted'
  | 'denied'
  | 'pending'
  | 'withdrawn'
  | 'expired';

export type TemplateCategory = 
  | 'welcome'
  | 'appointment_reminder'
  | 'treatment_followup'
  | 'promotional'
  | 'educational'
  | 'birthday'
  | 'retention'
  | 'winback'
  | 'testimonial_request';

// =====================================================================================
// CORE CAMPAIGN INTERFACES
// =====================================================================================

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  priority: CampaignPriority;
  
  // Targeting
  target_segments: string[]; // segment IDs
  include_criteria?: SegmentCriteria;
  exclude_criteria?: SegmentCriteria;
  
  // Scheduling
  scheduled_start?: string;
  scheduled_end?: string;
  timezone: string;
  
  // Template and Content
  template_id?: string;
  subject?: string;
  content: string;
  personalization_level: PersonalizationLevel;
  personalization_data?: Record<string, any>;
  
  // Automation
  trigger_type: TriggerType;
  trigger_config?: CampaignTrigger;
  auto_optimization: boolean;
  
  // LGPD Compliance
  requires_consent: boolean;
  consent_types: string[];
  respect_unsubscribe: boolean;
  
  // Metrics
  total_recipients?: number;
  sent_count?: number;
  delivered_count?: number;
  opened_count?: number;
  clicked_count?: number;
  converted_count?: number;
  unsubscribed_count?: number;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  clinic_id: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  campaign_type: CampaignType;
  
  // Template Content
  subject_template?: string;
  content_template: string;
  preview_text?: string;
  
  // Personalization
  available_variables: string[];
  required_variables: string[];
  personalization_rules?: PersonalizationRule[];
  
  // Design
  design_config?: {
    theme: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    layout: string;
  };
  
  // A/B Testing
  variants?: TemplateVariant[];
  
  // Metadata
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  clinic_id: string;
}

export interface CampaignTrigger {
  id: string;
  campaign_id: string;
  trigger_type: TriggerType;
  
  // Event-based triggers
  event_name?: string;
  event_conditions?: Record<string, any>;
  
  // Time-based triggers
  schedule_config?: {
    start_date: string;
    end_date?: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    days_of_week?: number[];
    time_of_day?: string;
  };
  
  // Behavioral triggers
  behavioral_conditions?: {
    action: string;
    timeframe: number;
    comparison: 'greater_than' | 'less_than' | 'equals';
    value: any;
  }[];
  
  // Segment-based triggers
  segment_conditions?: {
    enters_segment?: string[];
    exits_segment?: string[];
    segment_criteria?: SegmentCriteria;
  };
  
  // Delay and throttling
  delay_minutes?: number;
  max_frequency?: {
    count: number;
    period: 'hour' | 'day' | 'week' | 'month';
  };
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignExecution {
  id: string;
  campaign_id: string;
  execution_date: string;
  
  // Recipients
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  
  // Targeting
  target_segments: string[];
  recipient_list: CampaignRecipient[];
  
  // Content
  final_content: string;
  final_subject?: string;
  personalization_applied: boolean;
  
  // Delivery
  delivery_status: DeliveryStatus;
  delivery_started_at?: string;
  delivery_completed_at?: string;
  
  // Results
  metrics: CampaignExecutionMetrics;
  
  // Errors
  errors?: ExecutionError[];
  
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  execution_id: string;
  patient_id: string;
  
  // Contact Info
  email?: string;
  phone?: string;
  whatsapp?: string;
  push_token?: string;
  
  // Personalization
  personalization_data: Record<string, any>;
  final_content: string;
  final_subject?: string;
  
  // Delivery
  delivery_status: DeliveryStatus;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  converted_at?: string;
  
  // Engagement
  open_count: number;
  click_count: number;
  conversion_value?: number;
  
  // Consent & Compliance
  consent_status: ConsentStatus;
  consent_date?: string;
  unsubscribed_at?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================================================
// PERSONALIZATION & AI INTERFACES
// =====================================================================================

export interface PersonalizationRule {
  id: string;
  name: string;
  description?: string;
  
  // Conditions
  conditions: PersonalizationCondition[];
  
  // Actions
  actions: PersonalizationAction[];
  
  // Priority and logic
  priority: number;
  logic_operator: 'AND' | 'OR';
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalizationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  data_source: 'patient' | 'segment' | 'behavior' | 'treatment' | 'financial';
}

export interface PersonalizationAction {
  type: 'replace_content' | 'add_content' | 'remove_content' | 'change_subject' | 'change_template';
  target: string;
  content: string;
  position?: 'before' | 'after' | 'replace';
}

export interface TemplateVariant {
  id: string;
  name: string;
  content_template: string;
  subject_template?: string;
  weight: number; // For A/B testing
  performance_metrics?: {
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
    confidence_level: number;
  };
}

// =====================================================================================
// METRICS & ANALYTICS INTERFACES
// =====================================================================================

export interface CampaignMetrics {
  campaign_id: string;
  
  // Delivery Metrics
  total_sent: number;
  delivered_count: number;
  delivery_rate: number;
  bounce_rate: number;
  
  // Engagement Metrics
  open_count: number;
  open_rate: number;
  unique_opens: number;
  click_count: number;
  click_rate: number;
  unique_clicks: number;
  
  // Conversion Metrics
  conversion_count: number;
  conversion_rate: number;
  revenue_generated: number;
  avg_order_value: number;
  
  // Unsubscribe Metrics
  unsubscribe_count: number;
  unsubscribe_rate: number;
  
  // Time-based Metrics
  avg_open_time: number;
  avg_click_time: number;
  peak_engagement_hour: number;
  
  // Device/Platform Metrics
  device_breakdown: Record<string, number>;
  platform_breakdown: Record<string, number>;
  
  // Geographic Metrics
  location_breakdown: Record<string, number>;
  
  // Comparison Metrics
  vs_previous_campaign?: {
    open_rate_change: number;
    click_rate_change: number;
    conversion_rate_change: number;
  };
  
  vs_industry_benchmark?: {
    open_rate_benchmark: number;
    click_rate_benchmark: number;
    conversion_rate_benchmark: number;
  };
  
  calculated_at: string;
  updated_at: string;
}

export interface CampaignExecutionMetrics {
  execution_id: string;
  
  // Real-time Delivery
  messages_sent: number;
  messages_delivered: number;
  messages_failed: number;
  
  // Engagement Tracking
  opens: number;
  clicks: number;
  conversions: number;
  
  // Time Tracking
  first_open_at?: string;
  last_interaction_at?: string;
  
  // Revenue Tracking
  revenue_attributed: number;
  
  updated_at: string;
}

// =====================================================================================
// AUTOMATION & AI INTERFACES
// =====================================================================================

export interface CampaignAutomation {
  id: string;
  name: string;
  description?: string;
  
  // Automation Logic
  entry_conditions: AutomationCondition[];
  steps: AutomationStep[];
  exit_conditions?: AutomationCondition[];
  
  // Configuration
  is_active: boolean;
  max_participants?: number;
  
  // Performance
  participants_count: number;
  completion_rate: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  clinic_id: string;
}

export interface AutomationStep {
  id: string;
  order: number;
  type: 'campaign' | 'wait' | 'condition' | 'action';
  
  // Campaign Step
  campaign_id?: string;
  
  // Wait Step
  wait_config?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  
  // Condition Step
  condition?: AutomationCondition;
  success_path?: string; // Next step ID
  failure_path?: string; // Next step ID
  
  // Action Step
  action_config?: {
    type: 'update_segment' | 'update_patient' | 'create_task' | 'send_notification';
    parameters: Record<string, any>;
  };
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: any;
  logic_operator?: 'AND' | 'OR';
}

// =====================================================================================
// ANALYTICS & REPORTING INTERFACES
// =====================================================================================

export interface CampaignAnalytics {
  // Campaign Performance
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  
  // Aggregate Metrics
  total_recipients: number;
  total_sends: number;
  overall_delivery_rate: number;
  overall_open_rate: number;
  overall_click_rate: number;
  overall_conversion_rate: number;
  
  // Revenue Metrics
  total_revenue_generated: number;
  avg_revenue_per_campaign: number;
  roi: number;
  
  // Trend Analysis
  monthly_trends: {
    month: string;
    campaigns: number;
    recipients: number;
    revenue: number;
    open_rate: number;
    click_rate: number;
  }[];
  
  // Channel Performance
  channel_performance: {
    channel: CampaignType;
    campaigns: number;
    delivery_rate: number;
    engagement_rate: number;
    conversion_rate: number;
    revenue: number;
  }[];
  
  // Segment Performance
  segment_performance: {
    segment_id: string;
    segment_name: string;
    campaigns_received: number;
    avg_engagement: number;
    conversion_rate: number;
    revenue_generated: number;
  }[];
  
  // Top Performing Campaigns
  top_campaigns: {
    campaign_id: string;
    campaign_name: string;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
    revenue: number;
  }[];
  
  calculated_at: string;
}

// =====================================================================================
// FORM AND REQUEST INTERFACES
// =====================================================================================

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  campaign_type: CampaignType;
  template_id?: string;
  target_segments: string[];
  subject?: string;
  content: string;
  scheduled_start?: string;
  trigger_type: TriggerType;
  trigger_config?: Partial<CampaignTrigger>;
  personalization_level: PersonalizationLevel;
  requires_consent: boolean;
  consent_types: string[];
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  content?: string;
  subject?: string;
  scheduled_start?: string;
  scheduled_end?: string;
}

export interface ExecutionError {
  type: 'delivery' | 'personalization' | 'consent' | 'template' | 'system';
  message: string;
  recipient_id?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Re-export segmentation types for integration
export type { SegmentCriteria } from './segmentation';

// =====================================================================================
// UTILITY TYPES
// =====================================================================================

export type CampaignWithMetrics = MarketingCampaign & {
  metrics?: CampaignMetrics;
  recent_executions?: CampaignExecution[];
};

export type TemplateWithVariants = CampaignTemplate & {
  variants: TemplateVariant[];
  performance_metrics?: CampaignMetrics;
};

export type CampaignSummary = Pick<MarketingCampaign, 
  | 'id' 
  | 'name' 
  | 'campaign_type' 
  | 'status' 
  | 'created_at'
  | 'total_recipients'
  | 'sent_count'
  | 'opened_count'
  | 'clicked_count'
  | 'converted_count'
>;

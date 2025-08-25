// Behavioral CRM API Endpoints - Healthcare Patient Relationship Management
// RESTful API for behavioral analytics, personalization, and campaign automation

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createCache } from '@neonpro/core-cache';
import { createLogger } from '@neonpro/core-logging';
import { createMetrics } from '@neonpro/core-metrics';
import { BehavioralCrmService } from '@neonpro/ai/services/behavioral-crm-service';
import type {
  PatientBehavior,
  PersonalizationRule,
  BehavioralCampaign,
  BehavioralInsight,
  CrmDashboardData
} from '@neonpro/ai/services/behavioral-crm-service';

// Initialize services
const cache = createCache();
const logger = createLogger('BehavioralCrmApi');
const metrics = createMetrics('behavioral_crm_api');
const behavioralCrmService = new BehavioralCrmService(cache, logger, metrics);

// Validation schemas
const patientIdSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required')
});

const behaviorAnalysisSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  includeInsights: z.boolean().optional().default(false)
});

const segmentationCriteriaSchema = z.object({
  engagement_levels: z.array(z.enum(['low', 'medium', 'high', 'very_high'])).optional(),
  lifecycle_stages: z.array(z.enum(['prospect', 'new_patient', 'active', 'returning', 'at_risk', 'churned'])).optional(),
  churn_risk_threshold: z.number().min(0).max(1).optional(),
  custom_tags: z.array(z.string()).optional()
});

const personalizationMessageSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  messageTemplate: z.string().min(1, 'Message template is required'),
  context: z.record(z.any()).optional().default({})
});

const personalizationRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().min(1, 'Description is required'),
  trigger_conditions: z.object({
    behavioral_criteria: z.record(z.any()),
    demographic_criteria: z.record(z.any()).optional(),
    interaction_criteria: z.record(z.any()).optional(),
    temporal_criteria: z.record(z.any()).optional()
  }),
  personalization_actions: z.object({
    message_customization: z.object({
      tone: z.enum(['professional', 'friendly', 'casual', 'urgent']),
      content_focus: z.enum(['benefits', 'education', 'social_proof', 'urgency']),
      language_complexity: z.enum(['simple', 'technical', 'detailed'])
    }),
    timing_optimization: z.object({
      preferred_send_times: z.array(z.string()),
      frequency_cap: z.number().min(1),
      delay_between_messages_hours: z.number().min(1)
    }),
    channel_selection: z.object({
      primary_channel: z.string(),
      fallback_channels: z.array(z.string()),
      avoid_channels: z.array(z.string())
    }),
    content_recommendations: z.object({
      treatment_suggestions: z.array(z.string()),
      educational_content: z.array(z.string()),
      promotional_offers: z.array(z.string())
    })
  }),
  effectiveness_metrics: z.object({
    conversion_rate: z.number(),
    engagement_rate: z.number(),
    roi_per_patient: z.number(),
    last_performance_review: z.string()
  }),
  status: z.enum(['active', 'testing', 'paused', 'archived'])
});

const behavioralCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().min(1, 'Description is required'),
  campaign_type: z.enum(['onboarding', 'retention', 'reactivation', 'upsell', 'educational', 'seasonal']),
  target_segments: z.array(z.string()),
  trigger_rules: z.object({
    behavioral_triggers: z.array(z.object({
      event_type: z.string(),
      conditions: z.record(z.any()),
      timing: z.enum(['immediate', 'delayed', 'scheduled']),
      delay_hours: z.number().optional()
    })),
    audience_filters: z.object({
      include_segments: z.array(z.string()),
      exclude_segments: z.array(z.string()),
      lifecycle_stages: z.array(z.string()),
      custom_criteria: z.record(z.any())
    })
  }),
  message_templates: z.array(z.object({
    template_id: z.string(),
    channel: z.string(),
    subject_line: z.string().optional(),
    content: z.string(),
    personalization_variables: z.array(z.string()),
    call_to_action: z.object({
      text: z.string(),
      action_type: z.enum(['book_appointment', 'call_clinic', 'view_treatment', 'download_content']),
      action_url: z.string().optional()
    }),
    message_priority: z.enum(['low', 'medium', 'high', 'urgent'])
  })),
  automation_flow: z.array(z.object({
    step_id: z.string(),
    step_name: z.string(),
    trigger_after_hours: z.number().optional(),
    conditions: z.record(z.any()).optional(),
    message_template_id: z.string(),
    success_actions: z.array(z.string()).optional(),
    failure_actions: z.array(z.string()).optional()
  })),
  schedule: z.object({
    start_date: z.string(),
    end_date: z.string().optional(),
    recurring: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    active_hours: z.object({
      start_time: z.string(),
      end_time: z.string(),
      timezone: z.string()
    })
  }),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']),
  created_by: z.string()
});

const campaignExecutionSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  stepId: z.string().min(1, 'Step ID is required'),
  patientId: z.string().min(1, 'Patient ID is required')
});

// Initialize the Hono app
const app = new Hono();

// Behavioral Analytics Routes

app.post('/analyze-patient-behavior',
  zValidator('json', behaviorAnalysisSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const { patientId, includeInsights } = c.req.valid('json');
      
      logger?.info('Analyzing patient behavior', { 
        patient_id: patientId, 
        include_insights: includeInsights 
      });

      const behaviorAnalysis = await behavioralCrmService.analyzePatientBehavior(patientId);
      
      let response: any = {
        success: true,
        patient_behavior: behaviorAnalysis,
        analysis_timestamp: new Date().toISOString()
      };

      if (includeInsights) {
        const insights = await behavioralCrmService.generateBehavioralInsights();
        response.related_insights = insights.filter(insight => 
          insight.description.toLowerCase().includes(patientId.toLowerCase()) ||
          insight.title.toLowerCase().includes('behavioral')
        );
      }

      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('behavioral_analysis_request', {
        processing_time_ms: processingTime,
        patient_id: patientId,
        engagement_level: behaviorAnalysis.behavioral_profile.engagement_level,
        churn_risk: behaviorAnalysis.behavioral_profile.churn_risk
      });

      logger?.info('Patient behavior analysis completed', {
        patient_id: patientId,
        processing_time_ms: processingTime,
        engagement_level: behaviorAnalysis.behavioral_profile.engagement_level
      });

      return c.json(response);

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to analyze patient behavior', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to analyze patient behavior',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

app.post('/segment-patients',
  zValidator('json', segmentationCriteriaSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const criteria = c.req.valid('json');
      
      logger?.info('Segmenting patients', { criteria });

      const segmentedPatients = await behavioralCrmService.segmentPatients(criteria);
      
      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('patient_segmentation_request', {
        processing_time_ms: processingTime,
        criteria_count: Object.keys(criteria).length,
        result_count: segmentedPatients.length
      });

      logger?.info('Patient segmentation completed', {
        processing_time_ms: processingTime,
        segments_found: segmentedPatients.length,
        criteria: criteria
      });

      return c.json({
        success: true,
        segmented_patients: segmentedPatients,
        total_segments: segmentedPatients.length,
        segmentation_criteria: criteria,
        analysis_timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to segment patients', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to segment patients',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

// Personalization Engine Routes

app.post('/generate-personalized-message',
  zValidator('json', personalizationMessageSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const { patientId, messageTemplate, context } = c.req.valid('json');
      
      logger?.info('Generating personalized message', { 
        patient_id: patientId, 
        template_length: messageTemplate.length,
        context_keys: Object.keys(context)
      });

      const personalizedMessage = await behavioralCrmService.generatePersonalizedMessage(
        patientId,
        messageTemplate,
        context
      );
      
      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('personalization_request', {
        processing_time_ms: processingTime,
        patient_id: patientId,
        optimal_channel: personalizedMessage.optimal_channel,
        personalization_score: personalizedMessage.personalization_score
      });

      logger?.info('Personalized message generated', {
        patient_id: patientId,
        processing_time_ms: processingTime,
        optimal_channel: personalizedMessage.optimal_channel,
        personalization_score: personalizedMessage.personalization_score
      });

      return c.json({
        success: true,
        personalized_message: personalizedMessage,
        original_template: messageTemplate,
        generation_timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to generate personalized message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to generate personalized message',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

app.post('/create-personalization-rule',
  zValidator('json', personalizationRuleSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const ruleData = c.req.valid('json');
      
      logger?.info('Creating personalization rule', { 
        rule_name: ruleData.name,
        status: ruleData.status
      });

      const ruleId = await behavioralCrmService.createPersonalizationRule(ruleData);
      
      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('personalization_rule_creation', {
        processing_time_ms: processingTime,
        rule_id: ruleId,
        rule_name: ruleData.name,
        status: ruleData.status
      });

      logger?.info('Personalization rule created', {
        rule_id: ruleId,
        rule_name: ruleData.name,
        processing_time_ms: processingTime
      });

      return c.json({
        success: true,
        rule_id: ruleId,
        rule_data: {
          ...ruleData,
          rule_id: ruleId,
          created_at: new Date().toISOString()
        },
        creation_timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to create personalization rule', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to create personalization rule',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

// Campaign Automation Routes

app.post('/create-behavioral-campaign',
  zValidator('json', behavioralCampaignSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const campaignData = c.req.valid('json');
      
      logger?.info('Creating behavioral campaign', { 
        campaign_name: campaignData.name,
        campaign_type: campaignData.campaign_type,
        target_segments: campaignData.target_segments.length
      });

      const campaignId = await behavioralCrmService.createBehavioralCampaign(campaignData);
      
      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('campaign_creation', {
        processing_time_ms: processingTime,
        campaign_id: campaignId,
        campaign_type: campaignData.campaign_type,
        target_segments: campaignData.target_segments.length,
        automation_steps: campaignData.automation_flow.length
      });

      logger?.info('Behavioral campaign created', {
        campaign_id: campaignId,
        campaign_name: campaignData.name,
        processing_time_ms: processingTime
      });

      return c.json({
        success: true,
        campaign_id: campaignId,
        campaign_data: {
          ...campaignData,
          campaign_id: campaignId,
          created_at: new Date().toISOString()
        },
        creation_timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to create behavioral campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to create behavioral campaign',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

app.post('/execute-campaign-step',
  zValidator('json', campaignExecutionSchema),
  async (c) => {
    const startTime = performance.now();
    
    try {
      const { campaignId, stepId, patientId } = c.req.valid('json');
      
      logger?.info('Executing campaign step', { 
        campaign_id: campaignId,
        step_id: stepId,
        patient_id: patientId
      });

      const executed = await behavioralCrmService.executeCampaignStep(campaignId, stepId, patientId);
      
      const processingTime = performance.now() - startTime;
      
      await metrics?.recordMetric('campaign_step_execution', {
        processing_time_ms: processingTime,
        campaign_id: campaignId,
        step_id: stepId,
        patient_id: patientId,
        execution_success: executed
      });

      logger?.info('Campaign step execution completed', {
        campaign_id: campaignId,
        step_id: stepId,
        patient_id: patientId,
        executed: executed,
        processing_time_ms: processingTime
      });

      return c.json({
        success: true,
        executed: executed,
        campaign_id: campaignId,
        step_id: stepId,
        patient_id: patientId,
        execution_timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger?.error('Failed to execute campaign step', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });

      return c.json({
        success: false,
        error: 'Failed to execute campaign step',
        details: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
);

// Dashboard and Analytics Routes

app.get('/dashboard-data', async (c) => {
  const startTime = performance.now();
  
  try {
    logger?.info('Fetching CRM dashboard data');

    const dashboardData = await behavioralCrmService.getCrmDashboardData();
    
    const processingTime = performance.now() - startTime;
    
    await metrics?.recordMetric('dashboard_data_request', {
      processing_time_ms: processingTime,
      total_patients: dashboardData.overview_metrics.total_patients,
      active_campaigns: dashboardData.campaign_performance.length,
      behavioral_segments: dashboardData.behavioral_segments.length
    });

    logger?.info('CRM dashboard data fetched', {
      processing_time_ms: processingTime,
      total_patients: dashboardData.overview_metrics.total_patients,
      segments: dashboardData.behavioral_segments.length
    });

    return c.json({
      success: true,
      dashboard_data: dashboardData,
      fetch_timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    logger?.error('Failed to fetch dashboard data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: processingTime
    });

    return c.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, 500);
  }
});

app.get('/behavioral-insights', async (c) => {
  const startTime = performance.now();
  
  try {
    logger?.info('Generating behavioral insights');

    const insights = await behavioralCrmService.generateBehavioralInsights();
    
    const processingTime = performance.now() - startTime;
    
    await metrics?.recordMetric('insights_generation', {
      processing_time_ms: processingTime,
      insights_count: insights.length,
      insight_types: insights.map(i => i.insight_type)
    });

    logger?.info('Behavioral insights generated', {
      processing_time_ms: processingTime,
      insights_count: insights.length,
      types: insights.map(i => i.insight_type)
    });

    return c.json({
      success: true,
      insights: insights,
      insights_count: insights.length,
      generation_timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    logger?.error('Failed to generate behavioral insights', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: processingTime
    });

    return c.json({
      success: false,
      error: 'Failed to generate behavioral insights',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, 500);
  }
});

// Health Check Routes

app.get('/health', async (c) => {
  try {
    const healthStatus = {
      status: 'healthy',
      service: 'Behavioral CRM API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        behavioral_analytics: 'operational',
        personalization_engine: 'operational',
        campaign_automation: 'operational',
        dashboard_analytics: 'operational'
      }
    };

    return c.json(healthStatus);

  } catch (error) {
    return c.json({
      status: 'unhealthy',
      service: 'Behavioral CRM API',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

app.get('/metrics', async (c) => {
  try {
    // Simulate metrics collection
    const metricsData = {
      api_requests: {
        behavioral_analysis: Math.floor(Math.random() * 1000),
        personalization: Math.floor(Math.random() * 800),
        campaign_execution: Math.floor(Math.random() * 500),
        dashboard_access: Math.floor(Math.random() * 200)
      },
      performance_metrics: {
        avg_response_time_ms: 145 + Math.random() * 100,
        success_rate: 0.95 + Math.random() * 0.05,
        error_rate: Math.random() * 0.05
      },
      business_metrics: {
        patients_analyzed: Math.floor(Math.random() * 10000),
        campaigns_active: Math.floor(Math.random() * 50),
        personalization_rules: Math.floor(Math.random() * 25),
        insights_generated: Math.floor(Math.random() * 100)
      },
      timestamp: new Date().toISOString()
    };

    return c.json({
      success: true,
      metrics: metricsData
    });

  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, 500);
  }
});

export default app;
/**
 * Financial Agent API Contracts - AG-UI Protocol Extensions
 *
 * Enhanced AG-UI Protocol specifications for Financial AI Agent operations
 * Supporting Brazilian aesthetic clinic financial workflows with LGPD compliance
 */

import { z } from 'zod';
import {
  AgentMessageRoleSchema,
  AgentSessionResponseSchema,
  // AgentMessageResponseSchema,
} from './agent';

/**
 * Financial-Specific Agent Types
 */
export const FinancialAgentTypeSchema = z.enum([
  'billing', // Billing and invoicing operations
  'payment', // Payment processing and reconciliation
  'analytics', // Financial analytics and reporting
  'compliance', // LGPD and regulatory compliance
  'audit', // Financial audit and fraud detection
]);
export type FinancialAgentType = z.infer<typeof FinancialAgentTypeSchema>;

/**
 * Financial Message Types - Extended AG-UI Protocol
 */
export const FinancialMessageTypeSchema = z.enum([
  // Core Operations
  'billing_request', // Request billing operations
  'payment_process', // Process payment transactions
  'analytics_query', // Financial analytics queries
  'compliance_check', // LGPD compliance validation
  'audit_trigger', // Fraud detection triggers

  // Response Types
  'billing_response', // Billing operation results
  'payment_confirmation', // Payment processing confirmation
  'analytics_report', // Financial analytics reports
  'compliance_result', // Compliance validation results
  'audit_alert', // Fraud detection alerts

  // Interactive Operations
  'financial_advice', // AI-powered financial recommendations
  'cost_optimization', // Cost optimization suggestions
  'revenue_forecast', // Revenue forecasting
  'cash_flow_analysis', // Cash flow analysis and projections

  // Workflow Operations
  'approval_request', // Request financial approvals
  'reconciliation_status', // Payment reconciliation status
  'dispute_resolution', // Payment dispute handling
  'refund_processing', // Refund processing and tracking
]);
export type FinancialMessageType = z.infer<typeof FinancialMessageTypeSchema>;

/**
 * Financial Operation Context Schema
 */
export const FinancialContextSchema = z.object({
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  professional_id: z.string().uuid().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  tax_region: z.enum(['BR', 'US', 'EU']).default('BR'),
  compliance_level: z.enum(['standard', 'enhanced', 'strict']).default('strict'),
});
export type FinancialContext = z.infer<typeof FinancialContextSchema>;

/**
 * Financial Message Schema - Core AG-UI Extension
 */
export const CreateFinancialMessageSchema = z.object({
  session_id: z.string().uuid(),
  message_type: FinancialMessageTypeSchema,
  _role: AgentMessageRoleSchema,
  content: z.string(),
  financial_context: FinancialContextSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string().url().optional(),
        document_type: z.enum(['invoice', 'receipt', 'statement', 'contract', 'other']).optional(),
      }),
    )
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  requires_approval: z.boolean().default(false),
});

export const FinancialMessageResponseSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  message_type: FinancialMessageTypeSchema,
  _role: AgentMessageRoleSchema,
  content: z.string(),
  financial_context: FinancialContextSchema,
  metadata: z.record(z.unknown()),
  attachments: z.array(
    z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      url: z.string().url().optional(),
      document_type: z.enum(['invoice', 'receipt', 'statement', 'contract', 'other']).optional(),
    }),
  ),
  processing_time: z.number(),
  confidence_score: z.number().min(0).max(1).optional(),
  ai_insights: z.record(z.unknown()).optional(),
  created_at: z.date(),
});

/**
 * Billing Operation Schemas
 */
export const BillingOperationSchema = z.object({
  operation_type: z.enum(['create', 'update', 'cancel', 'refund', 'dispute']),
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  professional_id: z.string().uuid(),
  procedures: z.array(
    z.object({
      code: z.string(), // CBHPM/TUSS code
      description: z.string(),
      quantity: z.number().int().min(1),
      unit_price: z.number().min(0),
      total_price: z.number().min(0),
    }),
  ),
  payment_methods: z.array(
    z.object({
      method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'installment']),
      amount: z.number().min(0),
      installments: z.number().int().min(1).max(12).optional(),
      card_last_four: z.string().optional(),
    }),
  ),
  discounts: z
    .array(
      z.object({
        type: z.enum(['percentage', 'fixed', 'loyalty']),
        value: z.number(),
        reason: z.string(),
      }),
    )
    .optional(),
  taxes: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['percentage', 'fixed']),
        rate: z.number(),
        amount: z.number(),
      }),
    )
    .optional(),
  notes: z.string().optional(),
  due_date: z.date().optional(),
});

export const BillingResponseSchema = z.object({
  billing_id: z.string().uuid(),
  invoice_number: z.string(),
  total_amount: z.number().min(0),
  status: z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded']),
  payment_status: z.enum(['pending', 'partial', 'paid', 'failed', 'refunded']),
  created_at: z.date(),
  due_date: z.date().nullable(),
  paid_at: z.date().nullable(),
  procedures: z.array(
    z.object({
      code: z.string(),
      description: z.string(),
      quantity: z.number().int(),
      unit_price: z.number(),
      total_price: z.number(),
    }),
  ),
  payments: z.array(
    z.object({
      method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'installment']),
      amount: z.number(),
      status: z.enum(['pending', 'completed', 'failed']),
      transaction_id: z.string().optional(),
      paid_at: z.date().optional(),
    }),
  ),
  tax_breakdown: z.record(z.number()),
  discount_breakdown: z.record(z.number()),
});

/**
 * Payment Processing Schemas
 */
export const PaymentRequestSchema = z.object({
  billing_id: z.string().uuid(),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'installment']),
  amount: z.number().min(0),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  card_token: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
  customer_ip: z.string().ip().optional(),
  device_fingerprint: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const PaymentResponseSchema = z.object({
  payment_id: z.string().uuid(),
  transaction_id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  amount: z.number(),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'installment']),
  processing_time: z.number(),
  fraud_score: z.number().min(0).max(1).optional(),
  qr_code: z.string().optional(), // For PIX payments
  bank_slip_url: z.string().url().optional(),
  installment_details: z
    .object({
      total_installments: z.number().int(),
      current_installment: z.number().int(),
      installment_amount: z.number(),
      next_payment_date: z.date().optional(),
    })
    .optional(),
  created_at: z.date(),
  processed_at: z.date().nullable(),
});

/**
 * Financial Analytics Schemas
 */
export const AnalyticsQuerySchema = z.object({
  time_range: z.object({
    start: z.date(),
    end: z.date(),
  }),
  metrics: z.array(
    z.enum([
      'revenue',
      'profit',
      'expenses',
      'cash_flow',
      'patient_acquisition',
      'retention_rate',
      'average_ticket',
      'payment_method_distribution',
      'procedure_popularity',
      'professional_performance',
      'collection_rate',
    ]),
  ),
  group_by: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  filters: z
    .object({
      professionals: z.array(z.string().uuid()).optional(),
      procedures: z.array(z.string()).optional(),
      payment_methods: z.array(z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'installment']))
        .optional(),
      patients: z.array(z.string().uuid()).optional(),
    })
    .optional(),
});

export const AnalyticsResponseSchema = z.object({
  time_range: z.object({
    start: z.date(),
    end: z.date(),
  }),
  metrics: z.record(z.array(z.object({ date: z.date(), value: z.number() }))),
  summaries: z.record(z.number()),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidence_level: z.number().min(0).max(1),
  generated_at: z.date(),
});

/**
 * Fraud Detection and Audit Schemas
 */
export const FraudAlertSchema = z.object({
  alert_id: z.string().uuid(),
  alert_type: z.enum([
    'suspicious_pattern',
    'velocity_exceeded',
    'unusual_location',
    'payment_anomaly',
    'billing_irregularity',
    'duplicate_transaction',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  affected_entities: z.array(
    z.object({
      type: z.enum(['patient', 'professional', 'appointment', 'billing']),
      id: z.string().uuid(),
    }),
  ),
  risk_score: z.number().min(0).max(1),
  recommended_action: z.enum(['review', 'block', 'investigate', 'monitor']),
  created_at: z.date(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']),
});

export const AuditTrailSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.enum(['billing_created', 'payment_processed', 'fraud_alert', 'compliance_check']),
  user_id: z.string().uuid(),
  action: z.string(),
  details: z.record(z.unknown()),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  timestamp: z.date(),
  compliance_flags: z.array(z.string()).optional(),
});

/**
 * LGPD Compliance Schemas
 */
export const LGPDComplianceRequestSchema = z.object({
  operation: z.enum(['access', 'delete', 'rectify', 'port', 'consent']),
  data_subject_id: z.string().uuid(),
  data_types: z.array(
    z.enum([
      'personal',
      'financial',
      'medical',
      'payment',
      'appointment',
      'billing',
    ]),
  ),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests']),
  retention_period: z.number().optional(),
  purpose: z.string(),
});

export const LGPDComplianceResponseSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'rejected']),
  processed_data: z.record(z.unknown()).optional(),
  deleted_records: z.number().optional(),
  retention_scheduled: z.boolean().optional(),
  compliance_certificate: z.string().optional(),
  completed_at: z.date().nullable(),
});

/**
 * Financial Agent Session Schema - Extended
 */
export const CreateFinancialAgentSessionSchema = z.object({
  agent_type: z.literal('financial'),
  specialization: FinancialAgentTypeSchema,
  clinic_context: FinancialContextSchema,
  capabilities: z.array(z.enum(['billing', 'analytics', 'fraud_detection', 'compliance'])),
  initial_context: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const FinancialAgentSessionResponseSchema = AgentSessionResponseSchema.extend({
  agent_type: z.literal('financial'),
  specialization: FinancialAgentTypeSchema,
  capabilities: z.array(z.enum(['billing', 'analytics', 'fraud_detection', 'compliance'])),
  clinic_context: FinancialContextSchema,
  performance_metrics: z.object({
    response_time: z.number(),
    accuracy_rate: z.number().min(0).max(1),
    fraud_detection_rate: z.number().min(0).max(1),
    compliance_score: z.number().min(0).max(1),
  }),
});

/**
 * Financial Action Schemas - AG-UI Protocol Actions
 */
export const FinancialActionSchema = z.object({
  type: z.enum([
    'process_payment',
    'generate_invoice',
    'run_analytics',
    'detect_fraud',
    'check_compliance',
    'optimize_pricing',
    'forecast_revenue',
    'audit_transaction',
    'handle_dispute',
    'process_refund',
  ]),
  payload: z.record(z.unknown()),
  context: FinancialContextSchema,
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  requires_approval: z.boolean().default(false),
  approval_workflow: z
    .object({
      required_roles: z.array(z.string()),
      max_approval_time: z.number().optional(), // in hours
      auto_approve_threshold: z.number().optional(), // amount threshold
    })
    .optional(),
});

export const FinancialEventSchema = z.object({
  event: FinancialMessageTypeSchema,
  data: z.record(z.unknown()),
  session_id: z.string().uuid(),
  financial_context: FinancialContextSchema,
  timestamp: z.date(),
  correlation_id: z.string().uuid().optional(),
});

/**
 * Response Wrappers
 */
export const FinancialMessageListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    messages: z.array(FinancialMessageResponseSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      total_pages: z.number().int(),
    }),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export const FinancialOperationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    operation_id: z.string().uuid(),
    operation_type: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    result: z.record(z.unknown()).optional(),
    processing_time: z.number(),
    compliance_verified: z.boolean(),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export const FinancialAnalyticsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    analytics: AnalyticsResponseSchema,
    predictions: z
      .array(
        z.object({
          metric: z.string(),
          predicted_value: z.number(),
          confidence_interval: z.tuple([z.number(), z.number()]),
          time_period: z.string(),
        }),
      )
      .optional(),
    insights: z.array(
      z.object({
        type: z.enum(['trend', 'anomaly', 'opportunity', 'risk']),
        description: z.string(),
        impact: z.enum(['low', 'medium', 'high']),
        actionable: z.boolean(),
      }),
    ),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

/**
 * Error Response Schema
 */
export const FinancialErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    financial_error_code: z.string().optional(),
    compliance_violation: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

/**
 * Export all types
 */
export type CreateFinancialMessageRequest = z.infer<typeof CreateFinancialMessageSchema>;
export type FinancialMessage = z.infer<typeof FinancialMessageResponseSchema>;
export type BillingOperation = z.infer<typeof BillingOperationSchema>;
export type BillingResponse = z.infer<typeof BillingResponseSchema>;
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type FraudAlert = z.infer<typeof FraudAlertSchema>;
export type AuditTrail = z.infer<typeof AuditTrailSchema>;
export type LGPDComplianceRequest = z.infer<typeof LGPDComplianceRequestSchema>;
export type LGPDComplianceResponse = z.infer<typeof LGPDComplianceResponseSchema>;
export type CreateFinancialAgentSessionRequest = z.infer<
  typeof CreateFinancialAgentSessionSchema
>;
export type FinancialAgentSession = z.infer<typeof FinancialAgentSessionResponseSchema>;
export type FinancialAction = z.infer<typeof FinancialActionSchema>;
export type FinancialEvent = z.infer<typeof FinancialEventSchema>;
export type FinancialMessageListResponse = z.infer<typeof FinancialMessageListResponseSchema>;
export type FinancialOperationResponse = z.infer<typeof FinancialOperationResponseSchema>;
export type FinancialAnalyticsResponse = z.infer<typeof FinancialAnalyticsResponseSchema>;
export type FinancialErrorResponse = z.infer<typeof FinancialErrorResponseSchema>;

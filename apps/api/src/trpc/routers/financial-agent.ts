/**
 * Financial Agent Router - AG-UI Protocol Implementation
 *
 * tRPC router implementation for Financial AI Agent operations
 * Extended AG-UI Protocol with Brazilian financial workflow support
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  CreateFinancialAgentSessionSchema,
  CreateFinancialMessageSchema,
  FinancialAgentSessionResponseSchema,
  FinancialMessageResponseSchema,
  BillingOperationSchema,
  BillingResponseSchema,
  PaymentRequestSchema,
  PaymentResponseSchema,
  AnalyticsQuerySchema,
  FraudAlertSchema,
  AuditTrailSchema,
  LGPDComplianceRequestSchema,
  LGPDComplianceResponseSchema,
  FinancialActionSchema,
  FinancialEventSchema,
  FinancialOperationResponseSchema,
  FinancialAnalyticsResponseSchema,
  FinancialMessageListResponseSchema,
} from '../contracts/financial-agent';
import { FinancialAIAgent } from '../../services/financial-ai-agent/financial-ai-agent';
import { PredictiveAnalyticsService } from '../../services/financial-ai-agent/predictive-analytics';
import { AnomalyDetectionService } from '../../services/financial-ai-agent/anomaly-detection';

/**
 * Financial Agent Router
 */
export const financialAgentRouter = router({
  /**
   * Session Management
   */
  createFinancialAgentSession: protectedProcedure
    .input(CreateFinancialAgentSessionSchema)
    .output(FinancialAgentSessionResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        const session = await financialAgent.createFinancialAgentSession({
          agentType: 'financial',
          specialization: input.specialization,
          clinicContext: input.clinic_context,
          capabilities: input.capabilities,
          initialContext: input.initial_context,
        });

        return {
          id: session.id,
          user_id: ctx.user.id,
          agent_type: 'financial' as const,
          status: session.status as any,
          specialization: input.specialization,
          capabilities: input.capabilities,
          clinic_context: input.clinic_context,
          metadata: session.metadata,
          performance_metrics: {
            response_time: 0,
            accuracy_rate: 0.95,
            fraud_detection_rate: 0.89,
            compliance_score: 1.0,
          },
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        };
      } catch {
        console.error('Error creating financial agent session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create financial agent session',
        });
      }
    }),

  getFinancialAgentSession: protectedProcedure
    .input(z.object({ session_id: z.string().uuid() }))
    .output(FinancialAgentSessionResponseSchema)
    .query(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        const session = await financialAgent.getSession(input.session_id);

        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Financial agent session not found',
          });
        }

        return {
          id: session.id,
          user_id: ctx.user.id,
          agent_type: 'financial' as const,
          status: session.status as any,
          specialization: session.metadata?.specialization || 'analytics',
          capabilities: session.metadata?.capabilities || ['analytics'],
          clinic_context: session.metadata?.clinic_context || {},
          metadata: session.metadata,
          performance_metrics: session.metadata?.performance_metrics || {
            response_time: 0,
            accuracy_rate: 0.95,
            fraud_detection_rate: 0.89,
            compliance_score: 1.0,
          },
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        };
      } catch {
        console.error('Error getting financial agent session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get financial agent session',
        });
      }
    }),

  /**
   * Financial Message Operations
   */
  sendFinancialMessage: protectedProcedure
    .input(CreateFinancialMessageSchema)
    .output(FinancialMessageResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        // Process financial message based on type
        let responseContent = '';
        let metadata = {};
        let _attachments: any[] = [];

        switch (input.message_type) {
          case 'billing_request':
            const billingResponse = await financialAgent.processBillingRequest(
              JSON.parse(input.content),
              input.financial_context
            );
            responseContent = JSON.stringify(billingResponse);
            metadata = { operation: 'billing_request', processed: true };
            break;

          case 'analytics_query':
            const analyticsResponse = await financialAgent.generateFinancialPredictions(
              input.financial_context
            );
            responseContent = JSON.stringify(analyticsResponse);
            metadata = { operation: 'analytics_query', processed: true };
            break;

          case 'payment_process':
            const paymentResponse = await financialAgent.processPayment(
              JSON.parse(input.content),
              input.financial_context
            );
            responseContent = JSON.stringify(paymentResponse);
            metadata = { operation: 'payment_process', processed: true };
            break;

          case 'compliance_check':
            const complianceResponse = await financialAgent.checkCompliance(
              input.financial_context
            );
            responseContent = JSON.stringify(complianceResponse);
            metadata = { operation: 'compliance_check', compliant: true };
            break;

          default:
            responseContent = await financialAgent.processFinancialMessage(
              input.content,
              input.message_type
            );
            metadata = { operation: input.message_type, processed: true };
        }

        const message = await financialAgent.createMessage({
          sessionId: input.session_id,
          role: input._role,
          content: responseContent,
          messageType: input.message_type,
          financialContext: input.financial_context,
          metadata: { ...metadata, ...input.metadata },
        });

        return {
          id: message.id,
          session_id: input.session_id,
          message_type: input.message_type,
          _role: input._role,
          content: responseContent,
          financial_context: input.financial_context || {},
          metadata: message.metadata,
          attachments: input.attachments || [],
          processing_time: message.metadata?.processing_time || 0,
          confidence_score: message.metadata?.confidence_score,
          ai_insights: message.metadata?.ai_insights,
          created_at: message.createdAt,
        };
      } catch {
        console.error('Error processing financial message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process financial message',
        });
      }
    }),

  getFinancialMessages: protectedProcedure
    .input(
      z.object({
        session_id: z.string().uuid(),
        message_type: z.enum(['billing_request', 'payment_process', 'analytics_query', 'compliance_check', 'audit_trigger']).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .output(FinancialMessageListResponseSchema)
    .query(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        const { messages, total, totalPages } = await financialAgent.getMessages(
          input.session_id,
          input.message_type,
          input.page,
          input.limit
        );

        return {
          success: true,
          data: {
            messages: messages.map(msg => ({
              id: msg.id,
              session_id: msg.sessionId,
              message_type: msg.messageType || 'billing_request',
              _role: msg.role as any,
              content: msg.content,
              financial_context: msg.financialContext || {},
              metadata: msg.metadata,
              attachments: msg.attachments || [],
              processing_time: msg.metadata?.processing_time || 0,
              confidence_score: msg.metadata?.confidence_score,
              ai_insights: msg.metadata?.ai_insights,
              created_at: msg.createdAt,
            })),
            pagination: {
              page: input.page,
              limit: input.limit,
              total,
              total_pages: totalPages,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch {
        console.error('Error getting financial messages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get financial messages',
        });
      }
    }),

  /**
   * Billing Operations
   */
  processBilling: protectedProcedure
    .input(BillingOperationSchema)
    .output(BillingResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        const billing = await financialAgent.processBillingOperation({
          operationType: input.operation_type,
          patientId: input.patient_id,
          appointmentId: input.appointment_id,
          professionalId: input.professional_id,
          procedures: input.procedures,
          paymentMethods: input.payment_methods,
          discounts: input.discounts,
          taxes: input.taxes,
          notes: input.notes,
          dueDate: input.due_date,
        });

        return {
          billing_id: billing.id,
          invoice_number: billing.invoiceNumber,
          total_amount: billing.totalAmount,
          status: billing.status as any,
          payment_status: billing.paymentStatus as any,
          created_at: billing.createdAt,
          due_date: billing.dueDate,
          paid_at: billing.paidAt,
          procedures: billing.procedures,
          payments: billing.payments,
          tax_breakdown: billing.taxBreakdown,
          discount_breakdown: billing.discountBreakdown,
        };
      } catch {
        console.error('Error processing billing operation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process billing operation',
        });
      }
    }),

  /**
   * Payment Processing
   */
  processPayment: protectedProcedure
    .input(PaymentRequestSchema)
    .output(PaymentResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        const anomalyDetection = new AnomalyDetectionService(ctx.supabase, ctx.user.id);
        
        // Run fraud detection before processing
        const fraudCheck = await anomalyDetection.detectPaymentFraud({
          billingId: input.billing_id,
          paymentMethod: input.payment_method,
          amount: input.amount,
          customerIp: input.customer_ip,
          deviceFingerprint: input.device_fingerprint,
        });

        if (fraudCheck.isFraud) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment flagged as potentially fraudulent',
          });
        }

        const payment = await financialAgent.processPayment({
          billingId: input.billing_id,
          paymentMethod: input.payment_method,
          amount: input.amount,
          currency: input.currency,
          cardToken: input.card_token,
          installments: input.installments,
          customerIp: input.customer_ip,
          deviceFingerprint: input.device_fingerprint,
          metadata: input.metadata,
        });

        return {
          payment_id: payment.id,
          transaction_id: payment.transactionId,
          status: payment.status as any,
          amount: payment.amount,
          currency: payment.currency,
          payment_method: payment.paymentMethod as any,
          processing_time: payment.processingTime,
          fraud_score: fraudCheck.riskScore,
          qr_code: payment.qrCode,
          bank_slip_url: payment.bankSlipUrl,
          installment_details: payment.installmentDetails,
          created_at: payment.createdAt,
          processed_at: payment.processedAt,
        };
      } catch {
        console.error('Error processing payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process payment',
        });
      }
    }),

  /**
   * Financial Analytics
   */
  getFinancialAnalytics: protectedProcedure
    .input(AnalyticsQuerySchema)
    .output(FinancialAnalyticsResponseSchema)
    .query(async ({ ctx, input }) => {
      try {
        const analyticsService = new PredictiveAnalyticsService(ctx.supabase, ctx.user.id);
        
        const analytics = await analyticsService.generateComprehensiveAnalytics({
          timeRange: input.time_range,
          metrics: input.metrics,
          groupBy: input.group_by,
          filters: input.filters,
        });

        const predictions = await analyticsService.generateFinancialPredictions({
          timeRange: input.time_range,
          metrics: input.metrics,
        });

        return {
          success: true,
          data: {
            analytics: {
              time_range: analytics.timeRange,
              metrics: analytics.metrics,
              summaries: analytics.summaries,
              insights: analytics.insights,
              recommendations: analytics.recommendations,
              confidence_level: analytics.confidenceLevel,
              generated_at: analytics.generatedAt,
            },
            predictions: predictions.map(pred => ({
              metric: pred.metric,
              predicted_value: pred.predictedValue,
              confidence_interval: pred.confidenceInterval,
              time_period: pred.timePeriod,
            })),
            insights: analytics.insights.map(insight => ({
              type: insight.type,
              description: insight.description,
              impact: insight.impact,
              actionable: insight.actionable,
            })),
          },
          timestamp: new Date().toISOString(),
        };
      } catch {
        console.error('Error getting financial analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get financial analytics',
        });
      }
    }),

  /**
   * Fraud Detection
   */
  runFraudDetection: protectedProcedure
    .input(
      z.object({
        transaction_id: z.string().uuid().optional(),
        patient_id: z.string().uuid().optional(),
        time_range: z.object({
          start: z.date(),
          end: z.date(),
        }).optional(),
      })
    )
    .output(z.array(FraudAlertSchema))
    .query(async ({ ctx, input }) => {
      try {
        const anomalyDetection = new AnomalyDetectionService(ctx.supabase, ctx.user.id);
        
        const alerts = await anomalyDetection.detectAnomalies({
          transactionId: input.transaction_id,
          patientId: input.patient_id,
          timeRange: input.time_range,
        });

        return alerts.map(alert => ({
          alert_id: alert.id,
          alert_type: alert.alertType as any,
          severity: alert.severity as any,
          description: alert.description,
          affected_entities: alert.affectedEntities,
          risk_score: alert.riskScore,
          recommended_action: alert.recommendedAction as any,
          created_at: alert.createdAt,
          status: alert.status as any,
        }));
      } catch {
        console.error('Error running fraud detection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to run fraud detection',
        });
      }
    }),

  /**
   * LGPD Compliance
   */
  processLGPDRequest: protectedProcedure
    .input(LGPDComplianceRequestSchema)
    .output(LGPDComplianceResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        const compliance = await financialAgent.processLGPDRequest({
          operation: input.operation,
          dataSubjectId: input.data_subject_id,
          dataTypes: input.data_types,
          legalBasis: input.legal_basis,
          retentionPeriod: input.retention_period,
          purpose: input.purpose,
        });

        return {
          request_id: compliance.requestId,
          status: compliance.status as any,
          processed_data: compliance.processedData,
          deleted_records: compliance.deletedRecords,
          retention_scheduled: compliance.retentionScheduled,
          compliance_certificate: compliance.complianceCertificate,
          completed_at: compliance.completedAt,
        };
      } catch {
        console.error('Error processing LGPD request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process LGPD request',
        });
      }
    }),

  /**
   * Audit Trail
   */
  getAuditTrail: protectedProcedure
    .input(
      z.object({
        event_type: z.enum(['billing_created', 'payment_processed', 'fraud_alert', 'compliance_check']).optional(),
        user_id: z.string().uuid().optional(),
        time_range: z.object({
          start: z.date(),
          end: z.date(),
        }).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .output(z.object({
      audit_events: z.array(AuditTrailSchema),
      pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        total_pages: z.number().int(),
      }),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        const { auditEvents, total, totalPages } = await financialAgent.getAuditTrail({
          eventType: input.event_type,
          userId: input.user_id,
          timeRange: input.time_range,
          page: input.page,
          limit: input.limit,
        });

        return {
          audit_events: auditEvents.map(event => ({
            event_id: event.id,
            event_type: event.eventType as any,
            user_id: event.userId,
            action: event.action,
            details: event.details,
            ip_address: event.ipAddress,
            user_agent: event.userAgent,
            timestamp: event.timestamp,
            compliance_flags: event.complianceFlags,
          })),
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            total_pages: totalPages,
          },
        };
      } catch {
        console.error('Error getting audit trail:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get audit trail',
        });
      }
    }),

  /**
   * Financial Actions (AG-UI Protocol)
   */
  executeFinancialAction: protectedProcedure
    .input(FinancialActionSchema)
    .output(FinancialOperationResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        // Check if approval is required
        if (input.requires_approval && input.approval_workflow) {
          // Implement approval workflow logic
          const approvalRequired = await financialAgent.checkApprovalRequired({
            action: input.type,
            payload: input.payload,
            context: input.context,
            approvalWorkflow: input.approval_workflow,
          });

          if (approvalRequired) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Action requires approval',
            });
          }
        }

        const result = await financialAgent.executeFinancialAction({
          type: input.type,
          payload: input.payload,
          context: input.context,
          priority: input.priority,
        });

        return {
          success: true,
          data: {
            operation_id: result.operationId,
            operation_type: input.type,
            status: result.status as any,
            result: result.result,
            processing_time: result.processingTime,
            compliance_verified: result.complianceVerified,
          },
          timestamp: new Date().toISOString(),
        };
      } catch {
        console.error('Error executing financial action:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute financial action',
        });
      }
    }),

  /**
   * Financial Events (AG-UI Protocol)
   */
  emitFinancialEvent: protectedProcedure
    .input(FinancialEventSchema)
    .output(z.object({ success: z.boolean(), event_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const financialAgent = new FinancialAIAgent(ctx.supabase, ctx.user.id);
        
        const eventId = await financialAgent.emitFinancialEvent({
          event: input.event,
          data: input.data,
          sessionId: input.session_id,
          financialContext: input.financial_context,
          correlationId: input.correlation_id,
        });

        return {
          success: true,
          event_id: eventId,
        };
      } catch {
        console.error('Error emitting financial event:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to emit financial event',
        });
      }
    }),
});
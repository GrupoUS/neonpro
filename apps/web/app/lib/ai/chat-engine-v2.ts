// NeonProAIChatEngine - Core AI Chat Processing Engine
// Implementation of Story 4.1: Universal AI Chat Assistant

import type { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { createClient } from '@/app/utils/supabase/server';
import type {
  AIRequest,
  AIResponse,
  EnrichedContext,
  QueryClassification,
  SecurityValidation,
  UniversalChatContext,
} from './types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * NeonProAIChatEngine - Core AI Chat Processing Engine
 * Integrates OpenAI GPT-4 with NeonPro clinic data for intelligent assistance
 */
export class NeonProAIChatEngine {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Main chat processing method
   * Epic 4 - Story 4.1: Universal AI Chat Assistant
   */
  async processChat(request: AIRequest): Promise<AIResponse> {
    try {
      console.log('[NeonProAI] Processing chat request:', request.query);

      // Step 1: Security validation
      const securityCheck = await this.validateSecurity(request);
      if (!securityCheck.isValid) {
        throw new Error(`Security validation failed: ${securityCheck.reason}`);
      }

      // Step 2: Classify query
      const classification = await this.classifyQuery(
        request.query,
        request.context
      );

      // Step 3: Enrich context with relevant data
      const enrichedContext = await this.enrichContext(
        classification,
        request.context
      );

      // Step 4: Generate AI response
      const response = await this.generateResponse(
        request.query,
        enrichedContext,
        classification
      );

      console.log('[NeonProAI] Chat processed successfully');
      return response;
    } catch (error) {
      console.error('[NeonProAI] Error processing chat:', error);
      return this.createErrorResponse(error as Error);
    }
  }

  /**
   * Security validation for AI requests
   * Ensures LGPD compliance and proper authorization
   */
  private async validateSecurity(
    request: AIRequest
  ): Promise<SecurityValidation> {
    try {
      // Validate user session
      if (!request.sessionId) {
        return { isValid: false, reason: 'Missing session ID' };
      }

      // Check user permissions based on query type
      const hasPermission = await this.checkUserPermissions(
        request.sessionId,
        request.clinicId
      );

      if (!hasPermission) {
        return { isValid: false, reason: 'Insufficient permissions' };
      }

      // LGPD compliance check
      const lgpdCompliant = this.validateLGPDCompliance(request.query);
      if (!lgpdCompliant) {
        return { isValid: false, reason: 'LGPD compliance violation detected' };
      }

      return { isValid: true, reason: 'Security validation passed' };
    } catch (error) {
      return { isValid: false, reason: `Security validation error: ${error}` };
    }
  }

  /**
   * Classify user query to determine appropriate response strategy
   */
  private async classifyQuery(
    message: string,
    context: UniversalChatContext
  ): Promise<QueryClassification> {
    try {
      // Use OpenAI to classify the query
      const classificationPrompt = this.buildClassificationPrompt(
        message,
        context
      );

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: classificationPrompt },
          { role: 'user', content: message },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        epic: 'epic4' as const,
        category: result.category || 'general_query',
        confidence: result.confidence || 0.5,
        requiredPermissions: result.permissions || ['read_basic'],
        suggestedActions: result.actions || [],
        affectedSystems: result.systems || ['general'],
      };
    } catch (error) {
      console.error('[NeonProAI] Query classification error:', error);
      // Fallback classification
      return {
        epic: 'epic4' as const,
        category: 'general_query',
        confidence: 0.3,
        requiredPermissions: ['read_basic'],
        suggestedActions: ['show_help'],
        affectedSystems: ['general'],
      };
    }
  }

  /**
   * Enrich context with relevant data based on query classification
   */
  private async enrichContext(
    classification: QueryClassification,
    baseContext: UniversalChatContext
  ): Promise<EnrichedContext> {
    const enriched: EnrichedContext = {
      ...baseContext,
      enrichedData: {},
      queryClassification: classification,
      relevantData: {},
      searchResults: [],
      suggestedQueries: [],
      permissions: classification.requiredPermissions,
    };

    try {
      // Add relevant data based on classification
      switch (classification.category) {
        case 'appointment_query':
          if (enriched.relevantData) {
            enriched.relevantData.recentAppointments =
              await this.getRecentAppointments(baseContext.clinic.id, 10);
          }
          break;

        case 'financial_query':
          if (enriched.relevantData) {
            enriched.relevantData.financialSummary =
              await this.getFinancialSummary(baseContext.clinic.id);
          }
          break;

        case 'patient_query':
          // LGPD-compliant patient data (anonymized)
          if (enriched.relevantData) {
            enriched.relevantData.patientStats =
              await this.getPatientStatistics(baseContext.clinic.id);
          }
          break;

        case 'analytics_query':
          if (enriched.relevantData) {
            enriched.relevantData.analytics = await this.getAnalyticsSummary(
              baseContext.clinic.id
            );
          }
          break;
      }

      return enriched;
    } catch (error) {
      console.error('[NeonProAI] Context enrichment error:', error);
      return enriched;
    }
  }

  /**
   * Generate AI response using enriched context
   */
  private async generateResponse(
    message: string,
    context: EnrichedContext,
    classification: QueryClassification
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, classification);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseContent =
        completion.choices[0].message.content ||
        'Desculpe, não consegui gerar uma resposta adequada.';

      return {
        message: responseContent,
        sources: this.extractSources(context),
        visualizations: this.suggestVisualizations(classification),
        actions: classification.suggestedActions,
      };
    } catch (error) {
      console.error('[NeonProAI] Response generation error:', error);
      return this.createErrorResponse(error as Error);
    }
  }

  /**
   * Build classification prompt for OpenAI
   */
  private buildClassificationPrompt(
    _message: string,
    context: UniversalChatContext
  ): string {
    return `You are a clinical management AI assistant. Classify the following user query and respond with JSON.

Context:
- Clinic: ${context.clinic.name}
- User Role: ${context.user.role}
- Available Systems: appointments, financial, clinical, business intelligence

Classifications:
- appointment_query: scheduling, calendar, availability
- financial_query: billing, payments, revenue, expenses
- patient_query: patient data, medical records (LGPD compliant)
- clinical_query: medical procedures, treatments
- analytics_query: reports, KPIs, business intelligence
- compliance_query: regulations, audits, LGPD
- general_query: help, information, navigation

Required JSON format:
{
  "category": "classification_type",
  "confidence": 0.0-1.0,
  "permissions": ["required_permission_array"],
  "actions": ["suggested_action_array"],
  "systems": ["affected_system_array"]
}`;
  }

  /**
   * Build system prompt for response generation
   */
  private buildSystemPrompt(
    context: EnrichedContext,
    classification: QueryClassification
  ): string {
    const clinicInfo = `Clinic: ${context.clinic.name} (${context.clinic.id})`;
    const userInfo = `User: ${context.user.name} (${context.user.role})`;
    const systemsInfo = `Systems: ${classification.affectedSystems.join(', ')}`;

    return `You are NeonPro AI, an intelligent assistant for ${
      context.clinic.name
    }.

Context:
${clinicInfo}
${userInfo}
${systemsInfo}

Guidelines:
1. Respond in Portuguese (Brazil)
2. Be professional and helpful
3. Use available data to provide accurate information
4. Respect LGPD privacy regulations
5. Suggest relevant actions when appropriate
6. Keep responses concise but informative

Available Data: ${JSON.stringify(context.relevantData, null, 2)}`;
  }

  /**
   * Helper methods for data retrieval
   */
  private async getRecentAppointments(clinicId: string, limit: number) {
    const { data } = await this.supabase
      .from('appointments')
      .select('id, start_time, status, service_type')
      .eq('clinic_id', clinicId)
      .order('start_time', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private async getFinancialSummary(clinicId: string) {
    const { data } = await this.supabase
      .from('financial_transactions')
      .select('amount, type, created_at')
      .eq('clinic_id', clinicId)
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    return {
      totalRevenue:
        data
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0,
      totalExpenses:
        data
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0,
      transactionCount: data?.length || 0,
    };
  }

  private async getPatientStatistics(clinicId: string) {
    const { data } = await this.supabase
      .from('patients')
      .select('id, created_at')
      .eq('clinic_id', clinicId);

    return {
      totalPatients: data?.length || 0,
      newPatientsThisMonth:
        data?.filter(
          (p) =>
            new Date(p.created_at) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0,
    };
  }

  private async getAnalyticsSummary(_clinicId: string) {
    // This would integrate with Epic 3 business intelligence
    return {
      revenue: 0,
      appointments: 0,
      patientSatisfaction: 0,
    };
  }

  /**
   * Security and compliance helpers
   */
  private async checkUserPermissions(
    _sessionId: string,
    _clinicId: string
  ): Promise<boolean> {
    try {
      const { data: session } = await this.supabase.auth.getSession();
      return !!session.session?.user?.id;
    } catch {
      return false;
    }
  }

  private validateLGPDCompliance(message: string): boolean {
    // Check for potential LGPD violations
    const sensitivePatterns = [
      /cpf\s*:?\s*\d{3}\.?\d{3}\.?\d{3}-?\d{2}/i,
      /rg\s*:?\s*\d+/i,
      /telefone\s*:?\s*\(\d{2}\)\s*\d{4,5}-?\d{4}/i,
    ];

    return !sensitivePatterns.some((pattern) => pattern.test(message));
  }

  private extractSources(context: EnrichedContext): string[] {
    const sources = ['neonpro_database'];

    if (context.relevantData?.recentAppointments)
      sources.push('appointments_system');
    if (context.relevantData?.financialSummary)
      sources.push('financial_system');
    if (context.relevantData?.patientStats) sources.push('patient_management');
    if (context.relevantData?.analytics) sources.push('business_intelligence');

    return sources;
  }

  private suggestVisualizations(classification: QueryClassification): string[] {
    const visualizations: string[] = [];

    switch (classification.category) {
      case 'financial_query':
        visualizations.push('revenue_chart', 'expense_breakdown');
        break;
      case 'appointment_query':
        visualizations.push('calendar_view', 'schedule_timeline');
        break;
      case 'analytics_query':
        visualizations.push('dashboard_overview', 'kpi_metrics');
        break;
    }

    return visualizations;
  }

  private createErrorResponse(_error: Error): AIResponse {
    return {
      message:
        'Desculpe, encontrei um problema ao processar sua solicitação. Tente novamente em alguns instantes.',
      sources: ['error_handler'],
      visualizations: [],
      actions: ['retry', 'contact_support'],
    };
  }
}

/**
 * Factory function to create NeonProAIChatEngine instance
 */
export async function createNeonProAIChatEngine(): Promise<NeonProAIChatEngine> {
  const supabase = await createClient();
  return new NeonProAIChatEngine(supabase);
}

export default NeonProAIChatEngine;

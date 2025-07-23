// NeonProAIChatEngine - Core AI Chat Processing Engine
// Implementation of Story 4.1: Universal AI Chat Assistant

import OpenAI from 'openai'
import { createClient } from '@/app/utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { 
  AIResponse, 
  UniversalChatContext, 
  QueryClassification, 
  EnrichedContext,
  AIRequest 
} from './types'
import { sources } from 'next/dist/compiled/webpack/webpack'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

/**
 * NeonProAIChatEngine - Core AI Chat Processing Engine
 * Integrates OpenAI GPT-4 with NeonPro clinic data for intelligent assistance
 */
                  epic: 'cross_functional',
                  category: 'general_query',
                  confidence: 0.8,
                  requiredPermissions: ['read_basic'],
                  suggestedActions: ['show_dashboard'],
                  affectedSystems: ['general'],
                  message: 'Esta é uma resposta simulada do sistema de IA.',
                  sources: ['sistema_mock'],
                  visualizations: [],
                  actions: []
                })
              }
            }]
          }
        }
      }
    }
  }
}

export class NeonProAIChatEngine {
  private openai: OpenAIMock
  private supabase: SupabaseClient | null = null
  
  constructor() {
    this.openai = new OpenAIMock({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL
    })
    this.initializeSupabase()
  }
  
  private async initializeSupabase() {
    this.supabase = await createClient()
  }
  
  /**
   * Main entry point for processing universal AI queries
   * Integrates data from all epics (1, 2, 3) for comprehensive responses
   */
  async processUniversalQuery(
    query: string,
    context: UniversalChatContext,
    userId: string,
    clinicId: string
  ): Promise<AIResponse> {
    const startTime = performance.now()
    
    try {
      // 1. Query Classification with Epic 4 enhanced categories
      const queryType = await this.classifyQuery(query)
      
      // 2. Context Enrichment based on classification
      const enrichedContext = await this.enrichContext(
        context, 
        queryType, 
        clinicId
      )
      
      // 3. Security & RLS Validation
      await this.validateAccess(userId, clinicId, queryType.requiredPermissions)
      
      // 4. AI Processing with Full Context
      const response = await this.generateResponse(
        query,
        enrichedContext,
        queryType
      )
      
      // 5. Response Validation & Compliance
      const validatedResponse = await this.validateResponse(response, clinicId)
      
      // 6. Audit Trail
      await this.logAIInteraction(userId, query, validatedResponse)
      
      return {
        ...validatedResponse,
        metadata: {
          confidenceScore: this.calculateConfidence(validatedResponse),
          processingTime: performance.now() - startTime,
          dataSourcesUsed: this.getDataSources(enrichedContext),
          nextActions: this.suggestNextActions(enrichedContext, queryType)
        }
      }
      
    } catch (error) {
      console.error('Error in processUniversalQuery:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`AI processing failed: ${errorMessage}`)
    }
  }
  
  /**
   * Enhanced query classification for Epic 4 integration
   */
  private async classifyQuery(query: string): Promise<QueryClassification> {
    const classification = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Classifique a query do usuário nas seguintes categorias baseadas nos Épicos implementados:
          
          EPIC 1 - AUTHENTICATION & APPOINTMENTS:
          - SCHEDULING: agendamentos, calendário, disponibilidade
          - CONFLICTS: conflitos de agenda, otimização de horários
          - PATIENT_PORTAL: portal do paciente, acesso, comunicação
          - OAUTH_SECURITY: segurança, autenticação, controle de acesso
          
          EPIC 2 - FINANCIAL MANAGEMENT:
          - ACCOUNTS_PAYABLE: contas a pagar, fornecedores, despesas
          - ACCOUNTS_RECEIVABLE: recebíveis, cobrança, inadimplência
          - CASH_FLOW: fluxo de caixa, liquidez, projeções
          - BANK_RECONCILIATION: conciliação bancária, transações
          
          EPIC 3 - CLINICAL OPERATIONS:
          - MEDICAL_RECORDS: prontuários, histórico médico, documentação
          - TREATMENT_PROTOCOLS: protocolos, procedimentos, tratamentos
          - PROFESSIONAL_SERVICES: profissionais, performance, especialidades
          - CLINICAL_COMPLIANCE: conformidade clínica, regulamentações
          
          EPIC 4 - INTELLIGENT AI SYSTEM:
          - AI_CHAT: chat inteligente, assistente virtual, linguagem natural
          - AI_SUGGESTIONS: sugestões cross-funcionais, otimizações
          - PREDICTIVE_ANALYTICS: análise preditiva, business intelligence
          - PROCESS_AUTOMATION: automação inteligente, workflows
          
          CROSS_FUNCTIONAL: questões que envolvem múltiplos épicos ou análises integradas
          
          Retorne JSON com: { 
            epic: "epic1|epic2|epic3|epic4|cross_functional",
            category: "categoria_específica", 
            confidence: 0.0-1.0, 
            requiredPermissions: ["permissão1", "permissão2"],
            suggestedActions: ["ação1", "ação2"],
            affectedSystems: ["sistema1", "sistema2"]
          }`
        },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    })
    
    return JSON.parse(classification.choices[0].message.content)
  }
  
  /**
   * Enrich context based on query classification
   */
  private async enrichContext(
    baseContext: UniversalChatContext,
    queryType: QueryClassification,
    clinicId: string
  ): Promise<EnrichedContext> {
    // Dynamic context loading based on query type
    const relevantData = await Promise.all([
      this.loadFinancialContext(clinicId, queryType),
      this.loadClinicalContext(clinicId, queryType),
      this.loadOperationalContext(clinicId, queryType),
      this.loadComplianceContext(clinicId, queryType)
    ])
    
    return {
      ...baseContext,
      enrichedData: this.mergeContexts(relevantData),
      queryClassification: queryType
    }
  }
  
  /**
   * Generate AI response with context-aware processing
   */
  private async generateResponse(
    query: string,
    context: EnrichedContext,
    queryType: QueryClassification
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(queryType, context)
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: this.buildUserPrompt(query, context) }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    })
    
    const aiResponse = JSON.parse(response.choices[0].message.content)
    
    return {
      chatResponse: {
        message: aiResponse.message,
        confidence: aiResponse.confidence || 0.8,
        sources: aiResponse.sources || [],
        visualizations: aiResponse.visualizations || [],
        actions: aiResponse.actions || []
      },
      suggestions: aiResponse.suggestions || [],
      predictions: aiResponse.predictions || [],
      automations: aiResponse.automations || [],
      metadata: {
        confidenceScore: 0,
        processingTime: 0,
        dataSourcesUsed: [],
        nextActions: []
      }
    }
  }
  
  /**
   * Build system prompt based on query type and context
   */
  private buildSystemPrompt(queryType: QueryClassification, context: EnrichedContext): string {
    const basePrompt = `Você é o assistente de IA do NeonPro, um sistema completo de gestão de clínicas estéticas.`
    
    const epicSpecificPrompts = {
      epic1: `Especializado em agendamentos, gestão de profissionais e portal do paciente.`,
      epic2: `Especializado em gestão financeira, fluxo de caixa e análise de rentabilidade.`,
      epic3: `Especializado em operações clínicas, prontuários e conformidade regulatória.`,
      epic4: `Especializado em inteligência artificial, sugestões cross-funcionais e automação.`,
      cross_functional: `Especializado em análises integradas que cruzam múltiplas áreas operacionais.`
    }
    
    const complianceNote = `
    IMPORTANTE: Sempre mantenha conformidade com:
    - LGPD para dados pessoais
    - CFM/ANVISA para dados médicos
    - Regulamentações financeiras brasileiras
    
    Forneça respostas em português brasileiro, precisas e acionáveis.
    `
    
    return `${basePrompt} ${epicSpecificPrompts[queryType.epic]} ${complianceNote}`
  }
  
  /**
   * Build user prompt with relevant context data
   */
  private buildUserPrompt(query: string, context: EnrichedContext): string {
    return `
    Query do usuário: ${query}
    
    Contexto disponível:
    - Dados de agendamentos: ${JSON.stringify(context.appointments)}
    - Dados financeiros: ${JSON.stringify(context.financial)}
    - Dados clínicos: ${JSON.stringify(context.clinical)}
    - Business Intelligence: ${JSON.stringify(context.businessIntelligence)}
    
    Classificação da query: ${JSON.stringify(context.queryClassification)}
    
    Forneça uma resposta estruturada em JSON com:
    {
      "message": "resposta principal em texto",
      "confidence": 0.0-1.0,
      "sources": ["fonte1", "fonte2"],
      "visualizations": [chart_data],
      "actions": [suggested_actions],
      "suggestions": [cross_functional_suggestions],
      "predictions": [predictive_insights],
      "automations": [automation_recommendations]
    }
    `
  }
  
  /**
   * Validate user access based on permissions
   */
  private async validateAccess(
    userId: string, 
    clinicId: string, 
    requiredPermissions: string[]
  ): Promise<void> {
    if (!this.supabase) {
      throw new Error('Database connection not initialized')
    }
    
    // Implementation would check user permissions against required permissions
    // This integrates with existing RLS policies from previous epics
    const { data: userPermissions } = await this.supabase
      .from('user_permissions')
      .select('permissions')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single()
    
    if (!userPermissions) {
      throw new Error('Access denied: User permissions not found')
    }
    
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissions.permissions.includes(permission)
    )
    
    if (!hasRequiredPermissions) {
      throw new Error('Access denied: Insufficient permissions')
    }
  }
  
  /**
   * Validate AI response for compliance and accuracy
   */
  private async validateResponse(response: AIResponse, clinicId: string): Promise<AIResponse> {
    // Implement response validation logic
    // Check for compliance violations, sensitive data exposure, etc.
    return response
  }
  
  /**
   * Log AI interaction for audit trail
   */
  private async logAIInteraction(
    userId: string, 
    query: string, 
    response: AIResponse
  ): Promise<void> {
    if (!this.supabase) {
      console.warn('Database connection not available for logging')
      return
    }
    
    await this.supabase
      .from('ai_interaction_logs')
      .insert({
        user_id: userId,
        query,
        response: response.chatResponse.message,
        confidence: response.chatResponse.confidence,
        timestamp: new Date().toISOString(),
        sources_used: response.chatResponse.sources
      })
  }
  
  /**
   * Helper methods for context loading
   */
  private async loadFinancialContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    if (!this.isFinancialQuery(queryType)) return null
    
    // Load relevant financial data based on query type
    return {}
  }
  
  private async loadClinicalContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    if (!this.isClinicalQuery(queryType)) return null
    
    // Load relevant clinical data based on query type
    return {}
  }
  
  private async loadOperationalContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    if (!this.isOperationalQuery(queryType)) return null
    
    // Load relevant operational data based on query type
    return {}
  }
  
  private async loadComplianceContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    // Always load compliance context for audit purposes
    return {}
  }
  
  private mergeContexts(contexts: any[]): any {
    return contexts.reduce((merged, context) => ({ ...merged, ...context }), {})
  }
  
  private isFinancialQuery(queryType: QueryClassification): boolean {
    return queryType.epic === 'epic2' || queryType.affectedSystems.includes('financial')
  }
  
  private isClinicalQuery(queryType: QueryClassification): boolean {
    return queryType.epic === 'epic3' || queryType.affectedSystems.includes('clinical')
  }
  
  private isOperationalQuery(queryType: QueryClassification): boolean {
    return queryType.epic === 'epic1' || queryType.affectedSystems.includes('operational')
  }
  
  private calculateConfidence(response: AIResponse): number {
    return response.chatResponse.confidence
  }
  
  private getDataSources(context: EnrichedContext): string[] {
    const sources = []
    if (context.appointments) sources.push('appointments')
    if (context.financial) sources.push('financial')
    if (context.clinical) sources.push('clinical')
    if (context.businessIntelligence) sources.push('business_intelligence')
    return sources
  }
  
  private suggestNextActions(context: EnrichedContext, queryType: QueryClassification): string[] {
    // Generate contextual next action suggestions
    return []
  }
}

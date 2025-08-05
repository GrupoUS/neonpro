// NeonProAIChatEngine - Core AI Chat Processing Engine
// Implementation of Story 4.1: Universal AI Chat Assistant

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { 
  AIResponse, 
  UniversalChatContext, 
  QueryClassification, 
  EnrichedContext,
  AIRequest 
} from './types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

/**
 * NeonProAIChatEngine - Core AI Chat Processing Engine
 * Integrates OpenAI GPT-4 with NeonPro clinic data for intelligent assistance
 */
export class NeonProAIChatEngine {
  private openai: OpenAI
  private supabase: SupabaseClient | null = null
  
  constructor() {
    this.openai = openai
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
    
    return JSON.parse(classification.choices[0].message.content || '{}')
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
    
    const aiResponse = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      chatResponse: {
        message: aiResponse.message,
        confidence: aiResponse.confidence || 0.8,
        sources: aiResponse.sources || [],
        visualizations: aiResponse.visualizations || [],
        actions: aiResponse.actions || []
      },
      queryClassification: queryType,
      metadata: {
        confidenceScore: aiResponse.confidence || 0.8,
        processingTime: 0,
        dataSourcesUsed: [],
        nextActions: []
      }
    }
  }
  
  // Helper methods
  private async loadFinancialContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    // Implementation for loading financial context
    return {}
  }
  
  private async loadClinicalContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    // Implementation for loading clinical context
    return {}
  }
  
  private async loadOperationalContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    // Implementation for loading operational context
    return {}
  }
  
  private async loadComplianceContext(clinicId: string, queryType: QueryClassification): Promise<any> {
    // Implementation for loading compliance context
    return {}
  }
  
  private mergeContexts(contexts: any[]): any {
    // Implementation for merging contexts
    return contexts.reduce((merged, context) => ({ ...merged, ...context }), {})
  }
  
  private async validateAccess(userId: string, clinicId: string, permissions: string[]): Promise<void> {
    // Implementation for access validation
  }
  
  private async validateResponse(response: AIResponse, clinicId: string): Promise<AIResponse> {
    // Implementation for response validation
    return response
  }
  
  private async logAIInteraction(userId: string, query: string, response: AIResponse): Promise<void> {
    // Implementation for logging AI interactions
  }
  
  private calculateConfidence(response: AIResponse): number {
    // Implementation for confidence calculation
    return response.chatResponse.confidence
  }
  
  private getDataSources(context: EnrichedContext): string[] {
    // Implementation for getting data sources
    return []
  }
  
  private suggestNextActions(context: EnrichedContext, queryType: QueryClassification): string[] {
    // Implementation for suggesting next actions
    return queryType.suggestedActions
  }
  
  private buildSystemPrompt(queryType: QueryClassification, context: EnrichedContext): string {
    // Implementation for building system prompt
    return `Você é um assistente de IA especializado em clínicas médicas.`
  }
  
  private buildUserPrompt(query: string, context: EnrichedContext): string {
    // Implementation for building user prompt
    return query
  }
}

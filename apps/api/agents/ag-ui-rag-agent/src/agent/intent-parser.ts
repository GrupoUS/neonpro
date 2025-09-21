/**
 * Intent parser for healthcare queries
 * Uses AI models to understand natural language queries
 */

import { HealthcareLogger } from '../logging/healthcare-logger.js';

interface AIModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

interface IntentResult {
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

/**
 * Intent parser using AI models for natural language understanding
 */
export class IntentParser {
  private primaryModel: AIModelConfig;
  private fallbackModel?: AIModelConfig;
  private logger: HealthcareLogger;
  private isInitialized = false;

  constructor(aiModels: { primary: AIModelConfig; fallback?: AIModelConfig }) {
    this.primaryModel = aiModels.primary;
    this.fallbackModel = aiModels.fallback;
    this.logger = HealthcareLogger.getInstance();
  }

  /**
   * Initialize the intent parser
   */
  async initialize(): Promise<void> {
    try {
      // Validate API keys
      if (!this.primaryModel.apiKey) {
        throw new Error('Primary AI model API key is required');
      }

      this.isInitialized = true;
      this.logger.info('Intent parser initialized', {
        primaryProvider: this.primaryModel.provider,
        fallbackProvider: this.fallbackModel?.provider || 'none',
      });
    } catch (error) {
      this.logger.error('Failed to initialize intent parser', error);
      throw error;
    }
  }

  /**
   * Parse user query to extract intent and parameters
   */
  async parseIntent(query: string): Promise<IntentResult> {
    if (!this.isInitialized) {
      throw new Error('Intent parser not initialized');
    }

    try {
      // First try with primary model
      const result = await this.parseWithModel(query, this.primaryModel);
      
      this.logger.debug('Intent parsed successfully', {
        query: query.substring(0, 100),
        intent: result.intent,
        confidence: result.confidence,
        provider: this.primaryModel.provider,
      });

      return result;

    } catch (primaryError) {
      this.logger.warn('Primary model failed, trying fallback', {
        error: primaryError,
        provider: this.primaryModel.provider,
      });

      if (this.fallbackModel) {
        try {
          const result = await this.parseWithModel(query, this.fallbackModel);
          
          this.logger.info('Fallback model succeeded', {
            intent: result.intent,
            confidence: result.confidence,
            provider: this.fallbackModel.provider,
          });

          return result;
        } catch (fallbackError) {
          this.logger.error('Both primary and fallback models failed', {
            primaryError,
            fallbackError,
          });
        }
      }

      // Fallback to rule-based parsing
      return this.parseWithRules(query);
    }
  }

  /**
   * Parse intent using AI model
   */
  private async parseWithModel(query: string, model: AIModelConfig): Promise<IntentResult> {
    const systemPrompt = `Você é um assistente de análise de intenções para um sistema de saúde brasileiro.
Analise a consulta do usuário e identifique:
1. A intenção principal (intent)
2. Os parâmetros relevantes
3. O nível de confiança

Intenções suportadas:
- client_search: Busca por clientes/pacientes
- appointment_query: Consultas sobre agendamentos
- financial_summary: Relatórios financeiros
- general_help: Ajuda geral

Responda sempre em JSON com o formato:
{
  "intent": "intent_name",
  "parameters": { "param1": "value1" },
  "confidence": 0.95
}`;

    const userPrompt = `Consulta do usuário: "${query}"`;

    let response: any;

    if (model.provider === 'openai') {
      response = await this.callOpenAI(model, systemPrompt, userPrompt);
    } else if (model.provider === 'anthropic') {
      response = await this.callAnthropic(model, systemPrompt, userPrompt);
    } else {
      throw new Error(`Unsupported AI provider: ${model.provider}`);
    }

    try {
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent,
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response as JSON', { response, error });
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(model: AIModelConfig, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: model.maxTokens,
        temperature: model.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(model: AIModelConfig, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': model.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model.model,
        max_tokens: model.maxTokens,
        temperature: model.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  /**
   * Fallback rule-based intent parsing
   */
  private parseWithRules(query: string): IntentResult {
    const normalizedQuery = query.toLowerCase().trim();

    // Client search patterns
    if (this.matchesPatterns(normalizedQuery, [
      'cliente', 'paciente', 'buscar', 'procurar', 'nome', 'cadastrado'
    ])) {
      const nameMatch = normalizedQuery.match(/(?:cliente|paciente)\s+([a-záêç\s]+)/i);
      return {
        intent: 'client_search',
        parameters: {
          namePattern: nameMatch ? nameMatch[1].trim() : '',
        },
        confidence: 0.7,
      };
    }

    // Appointment patterns
    if (this.matchesPatterns(normalizedQuery, [
      'agendamento', 'consulta', 'próximo', 'agenda', 'marcado', 'horário'
    ])) {
      return {
        intent: 'appointment_query',
        parameters: this.extractDateParameters(normalizedQuery),
        confidence: 0.7,
      };
    }

    // Financial patterns
    if (this.matchesPatterns(normalizedQuery, [
      'financeiro', 'faturamento', 'pagamento', 'receita', 'valor', 'dinheiro'
    ])) {
      return {
        intent: 'financial_summary',
        parameters: this.extractDateParameters(normalizedQuery),
        confidence: 0.7,
      };
    }

    // Default to help
    return {
      intent: 'general_help',
      parameters: {},
      confidence: 0.5,
    };
  }

  /**
   * Check if query matches any of the patterns
   */
  private matchesPatterns(query: string, patterns: string[]): boolean {
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Extract date parameters from query
   */
  private extractDateParameters(query: string): Record<string, any> {
    const parameters: Record<string, any> = {};

    // Common date patterns
    if (query.includes('hoje')) {
      parameters.startDate = new Date().toISOString().split('T')[0];
      parameters.endDate = parameters.startDate;
    } else if (query.includes('amanhã')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      parameters.startDate = tomorrow.toISOString().split('T')[0];
      parameters.endDate = parameters.startDate;
    } else if (query.includes('próximos') || query.includes('próximo')) {
      parameters.startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      parameters.endDate = endDate.toISOString().split('T')[0];
    } else if (query.includes('mês')) {
      const now = new Date();
      parameters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      parameters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    return parameters;
  }

  /**
   * Shutdown the intent parser
   */
  async shutdown(): Promise<void> {
    this.isInitialized = false;
    this.logger.info('Intent parser shutdown complete');
  }
}
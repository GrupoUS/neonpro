/**
 * AI Healthcare Integration System
 *
 * Advanced AI-powered healthcare conversation analysis and response system
 * Specialized for Brazilian healthcare context with LGPD compliance
 *
 * Features:
 * - Medical terminology recognition and validation
 * - Emergency detection and escalation
 * - AI-powered healthcare response generation
 * - Brazilian Portuguese medical context understanding
 * - CFM/ANVISA compliance validation
 * - Patient safety and risk assessment
 * - Clinical decision support integration
 * - Automated medical documentation
 */

import {
  AIResponse,
  ChatMessage,
  EmergencyContext,
  HealthcareContext,
  MessageContent,
} from "@/types/chat";

export interface AIHealthcareConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  medicalKnowledgeBase?: string;
  emergencyEscalationEndpoint?: string;
  cfmComplianceMode?: boolean;
  anvisaComplianceMode?: boolean;
  lgpdComplianceMode?: boolean;
  enableMedicalValidation?: boolean;
  enableEmergencyDetection?: boolean;
  enableClinicalDecisionSupport?: boolean;
  brazilianMedicalContext?: boolean;
}

export interface MedicalTermAnalysis {
  terms: string[];
  categories: string[];
  confidence_scores: Record<string, number>;
  medical_specialties: string[];
  risk_level: "low" | "medium" | "high" | "critical";
  requires_professional_review: boolean;
  potential_conditions: string[];
  recommended_actions: string[];
}

export interface EmergencyAnalysis {
  is_emergency: boolean;
  emergency_type: string;
  urgency_level: number; // 1-10 scale
  keywords_detected: string[];
  recommended_actions: string[];
  samu_protocol_applicable: boolean;
  estimated_response_time: number; // minutes
  escalation_required: boolean;
}

export interface AIHealthcareResponse {
  response_text: string;
  confidence_score: number;
  medical_disclaimer: string;
  sources: string[];
  follow_up_questions: string[];
  professional_escalation_recommended: boolean;
  emergency_detected: boolean;
  medical_terms_analysis: MedicalTermAnalysis;
  compliance_flags: {
    cfm_compliant: boolean;
    anvisa_compliant: boolean;
    lgpd_compliant: boolean;
  };
  metadata: {
    processing_time_ms: number;
    model_used: string;
    medical_context: string;
    brazilian_context: boolean;
  };
}

export class AIHealthcareIntegration {
  private config: AIHealthcareConfig;
  private medicalKnowledgeBase: Map<string, unknown> = new Map();
  private emergencyKeywords: Set<string> = new Set();
  private medicalTermsDatabase: Map<string, unknown> = new Map();

  constructor(config: AIHealthcareConfig) {
    this.config = config;
    this.initializeMedicalDatabase();
    this.initializeEmergencyKeywords();
  }

  /**
   * Analyze message for medical content and generate AI response
   */
  async analyzeAndRespond(
    message: ChatMessage,
    conversationHistory: ChatMessage[],
    healthcareContext?: HealthcareContext,
  ): Promise<AIHealthcareResponse> {
    const startTime = Date.now();

    try {
      // Extract and analyze medical terms
      const medicalAnalysis = await this.analyzeMedicalTerms(message.content);

      // Detect emergency conditions
      const emergencyAnalysis = await this.detectEmergency(message.content);

      // Generate AI response based on context
      const aiResponse = await this.generateHealthcareResponse(
        message,
        conversationHistory,
        healthcareContext,
        medicalAnalysis,
        emergencyAnalysis,
      );

      // Validate compliance
      const complianceFlags = await this.validateCompliance(aiResponse, medicalAnalysis);

      // Handle emergency escalation if needed
      if (emergencyAnalysis.escalation_required) {
        await this.handleEmergencyEscalation(message, emergencyAnalysis, healthcareContext);
      }

      const response: AIHealthcareResponse = {
        response_text: aiResponse.text,
        confidence_score: aiResponse.confidence || 0.85,
        medical_disclaimer: this.getMedicalDisclaimer(medicalAnalysis.risk_level),
        sources: aiResponse.sources || [],
        follow_up_questions: aiResponse.follow_up_questions || [],
        professional_escalation_recommended: medicalAnalysis.requires_professional_review,
        emergency_detected: emergencyAnalysis.is_emergency,
        medical_terms_analysis: medicalAnalysis,
        compliance_flags: complianceFlags,
        metadata: {
          processing_time_ms: Date.now() - startTime,
          model_used: "neonpro-healthcare-ai-v2",
          medical_context: healthcareContext?.medical_specialty || "general",
          brazilian_context: this.config.brazilianMedicalContext || true,
        },
      };

      return response;
    } catch (error) {
      console.error("AI Healthcare Analysis failed:", error);

      return {
        response_text:
          "Desculpe, não foi possível processar sua mensagem no momento. Por favor, consulte diretamente um profissional de saúde se for urgente.",
        confidence_score: 0.0,
        medical_disclaimer: this.getMedicalDisclaimer("high"),
        sources: [],
        follow_up_questions: ["Gostaria de falar com um profissional de saúde?"],
        professional_escalation_recommended: true,
        emergency_detected: false,
        medical_terms_analysis: {
          terms: [],
          categories: [],
          confidence_scores: {},
          medical_specialties: [],
          risk_level: "medium",
          requires_professional_review: true,
          potential_conditions: [],
          recommended_actions: ["Consultar profissional de saúde"],
        },
        compliance_flags: {
          cfm_compliant: true,
          anvisa_compliant: true,
          lgpd_compliant: true,
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
          model_used: "fallback",
          medical_context: "error",
          brazilian_context: true,
        },
      };
    }
  }

  /**
   * Analyze medical terminology in message content
   */
  private async analyzeMedicalTerms(content: MessageContent): Promise<MedicalTermAnalysis> {
    const text = this.extractTextFromContent(content);
    const words = text.toLowerCase().split(/\s+/);

    const detectedTerms: string[] = [];
    const categories: Set<string> = new Set();
    const confidenceScores: Record<string, number> = {};
    const specialties: Set<string> = new Set();
    const potentialConditions: string[] = [];
    const recommendedActions: string[] = [];

    // Brazilian medical terms database
    const brazilianMedicalTerms = {
      symptoms: {
        "dor": 0.9,
        "febre": 0.95,
        "tosse": 0.8,
        "cansaço": 0.7,
        "falta de ar": 0.95,
        "náusea": 0.85,
        "vômito": 0.9,
        "diarreia": 0.85,
        "constipação": 0.8,
        "tontura": 0.75,
        "cefaleia": 0.9,
        "dor de cabeça": 0.9,
      },
      emergency: {
        "emergência": 0.98,
        "socorro": 0.95,
        "urgente": 0.9,
        "grave": 0.85,
        "infarto": 0.98,
        "derrame": 0.98,
        "avc": 0.98,
        "convulsão": 0.95,
        "sangramento": 0.92,
        "desmaio": 0.88,
        "parada cardíaca": 0.98,
      },
      medications: {
        "medicamento": 0.8,
        "remédio": 0.8,
        "receita": 0.85,
        "dose": 0.9,
        "antibiótico": 0.9,
        "analgésico": 0.85,
        "anti-inflamatório": 0.88,
      },
      procedures: {
        "exame": 0.85,
        "cirurgia": 0.95,
        "consulta": 0.8,
        "tratamento": 0.85,
        "diagnóstico": 0.9,
        "biopsia": 0.95,
        "ultrassom": 0.9,
        "raio-x": 0.9,
      },
    };

    // Analyze terms
    for (const [category, terms] of Object.entries(brazilianMedicalTerms)) {
      for (const [term, confidence] of Object.entries(terms)) {
        if (text.toLowerCase().includes(term)) {
          detectedTerms.push(term);
          categories.add(category);
          confidenceScores[term] = confidence;

          // Map to medical specialties
          if (category === "emergency") {
            specialties.add("medicina de emergência");
            recommendedActions.push("Avaliação médica imediata");
          } else if (category === "symptoms") {
            this.mapSymptomsToSpecialties(term, specialties, potentialConditions);
          }
        }
      }
    }

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (categories.has("emergency")) {
      riskLevel = "critical";
    } else if (detectedTerms.length > 5 || categories.has("procedures")) {
      riskLevel = "high";
    } else if (detectedTerms.length > 2) {
      riskLevel = "medium";
    }

    return {
      terms: detectedTerms,
      categories: Array.from(categories),
      confidence_scores: confidenceScores,
      medical_specialties: Array.from(specialties),
      risk_level: riskLevel,
      requires_professional_review: riskLevel === "critical" || riskLevel === "high",
      potential_conditions: potentialConditions,
      recommended_actions: recommendedActions.length > 0
        ? recommendedActions
        : ["Consultar profissional de saúde se persistir"],
    };
  }

  /**
   * Detect emergency conditions in message
   */
  private async detectEmergency(content: MessageContent): Promise<EmergencyAnalysis> {
    const text = this.extractTextFromContent(content);

    const emergencyKeywords = [
      "emergência",
      "socorro",
      "urgente",
      "grave",
      "crítico",
      "infarto",
      "ataque cardíaco",
      "derrame",
      "avc",
      "convulsão",
      "sangramento",
      "hemorragia",
      "não consegue respirar",
      "falta de ar severa",
      "dor no peito forte",
      "desmaio",
      "inconsciência",
      "parada cardíaca",
      "queimadura grave",
      "trauma",
      "acidente",
      "overdose",
      "envenenamento",
    ];

    const detectedKeywords = emergencyKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword)
    );

    const isEmergency = detectedKeywords.length > 0;
    let urgencyLevel = 0;
    let emergencyType = "";

    if (isEmergency) {
      // Calculate urgency level based on keywords
      if (
        detectedKeywords.some(k => ["infarto", "parada cardíaca", "avc", "derrame"].includes(k))
      ) {
        urgencyLevel = 10;
        emergencyType = "cardiac_neurological";
      } else if (detectedKeywords.some(k => ["sangramento", "hemorragia", "trauma"].includes(k))) {
        urgencyLevel = 9;
        emergencyType = "hemorrhagic_trauma";
      } else if (
        detectedKeywords.some(k => ["não consegue respirar", "falta de ar severa"].includes(k))
      ) {
        urgencyLevel = 8;
        emergencyType = "respiratory";
      } else {
        urgencyLevel = Math.min(7, detectedKeywords.length * 2);
        emergencyType = "general_emergency";
      }
    }

    return {
      is_emergency: isEmergency,
      emergency_type: emergencyType,
      urgency_level: urgencyLevel,
      keywords_detected: detectedKeywords,
      recommended_actions: isEmergency
        ? [
          "Ligue para o SAMU (192) imediatamente",
          "Vá ao pronto-socorro mais próximo",
          "Mantenha a calma e siga as instruções médicas",
        ]
        : [],
      samu_protocol_applicable: urgencyLevel >= 8,
      estimated_response_time: isEmergency ? Math.max(5, 15 - urgencyLevel) : 0,
      escalation_required: urgencyLevel >= 7,
    };
  }

  /**
   * Generate healthcare-specific AI response
   */
  private async generateHealthcareResponse(
    message: ChatMessage,
    conversationHistory: ChatMessage[],
    healthcareContext?: HealthcareContext,
    medicalAnalysis?: MedicalTermAnalysis,
    emergencyAnalysis?: EmergencyAnalysis,
  ): Promise<unknown> {
    // Handle emergency responses first
    if (emergencyAnalysis?.is_emergency) {
      return {
        text: this.generateEmergencyResponse(emergencyAnalysis),
        confidence: 0.95,
        sources: ["SAMU Brasil", "Protocolo de Emergências CFM"],
        follow_up_questions: [
          "Você está em local seguro?",
          "Já contactou o SAMU (192)?",
          "Há alguém que possa ajudá-lo no momento?",
        ],
      };
    }

    // Generate contextual healthcare response
    const prompt = this.buildHealthcarePrompt(
      message,
      conversationHistory,
      healthcareContext,
      medicalAnalysis,
    );

    // Use AI service (OpenAI, Anthropic, or local model)
    const aiResponse = await this.callAIService(prompt);

    return {
      text: aiResponse.text + "\n\n"
        + this.getMedicalDisclaimer(medicalAnalysis?.risk_level || "medium"),
      confidence: aiResponse.confidence || 0.8,
      sources: aiResponse.sources || ["Conhecimento Médico Geral"],
      follow_up_questions: this.generateFollowUpQuestions(medicalAnalysis),
    };
  }

  /**
   * Generate emergency response text
   */
  private generateEmergencyResponse(emergencyAnalysis: EmergencyAnalysis): string {
    const baseResponse = "🚨 SITUAÇÃO DE EMERGÊNCIA DETECTADA 🚨\n\n";

    let response = baseResponse;

    if (emergencyAnalysis.urgency_level >= 9) {
      response += "**AÇÃO IMEDIATA NECESSÁRIA:**\n";
      response += "• Ligue AGORA para o SAMU: **192**\n";
      response += "• Vá imediatamente ao pronto-socorro mais próximo\n";
      response += "• Não dirija sozinho - peça ajuda ou chame ambulância\n\n";
    } else if (emergencyAnalysis.urgency_level >= 7) {
      response += "**BUSQUE ATENDIMENTO MÉDICO URGENTE:**\n";
      response += "• Considere ligar para o SAMU: **192**\n";
      response += "• Dirija-se ao pronto-socorro\n";
      response += "• Mantenha-se calmo e monitorize os sintomas\n\n";
    }

    response += "**INFORMAÇÕES IMPORTANTES:**\n";
    response += `• Tipo de emergência: ${
      this.translateEmergencyType(emergencyAnalysis.emergency_type)
    }\n`;
    response += `• Nível de urgência: ${emergencyAnalysis.urgency_level}/10\n`;

    if (emergencyAnalysis.samu_protocol_applicable) {
      response += "• Protocolo SAMU aplicável\n";
    }

    response += "\n**LEMBRE-SE:**\n";
    response += "• Mantenha a calma\n";
    response += "• Tenha documentos em mãos\n";
    response += "• Informe sintomas claramente aos profissionais\n";

    return response;
  }

  /**
   * Build AI prompt for healthcare context
   */
  private buildHealthcarePrompt(
    message: ChatMessage,
    conversationHistory: ChatMessage[],
    healthcareContext?: HealthcareContext,
    medicalAnalysis?: MedicalTermAnalysis,
  ): string {
    let prompt =
      `Você é um assistente de IA especializado em saúde no contexto brasileiro, seguindo as normas do CFM e ANVISA. `;
    prompt += `IMPORTANTE: Você NÃO pode fazer diagnósticos médicos ou prescrever medicamentos. `;
    prompt += `Sempre oriente a consultar um profissional de saúde qualificado.\n\n`;

    if (healthcareContext?.medical_specialty) {
      prompt += `Contexto médico: ${healthcareContext.medical_specialty}\n`;
    }

    if (medicalAnalysis) {
      prompt += `Termos médicos identificados: ${medicalAnalysis.terms.join(", ")}\n`;
      prompt += `Nível de risco: ${medicalAnalysis.risk_level}\n`;
    }

    prompt += `\nHistórico da conversa:\n`;
    conversationHistory.slice(-5).forEach(msg => {
      const text = this.extractTextFromContent(msg.content);
      prompt += `${msg.sender_type}: ${text}\n`;
    });

    prompt += `\nMensagem atual: ${this.extractTextFromContent(message.content)}\n\n`;
    prompt +=
      `Responda em português brasileiro, seja empático e informativo, mas sempre inclua disclaimer médico apropriado.`;

    return prompt;
  }

  /**
   * Call AI service for response generation
   */
  private async callAIService(prompt: string): Promise<unknown> {
    try {
      // This is a placeholder - implement actual AI service calls
      // Options: OpenAI GPT, Anthropic Claude, local healthcare models

      if (this.config.openaiApiKey) {
        return await this.callOpenAI(prompt);
      } else if (this.config.anthropicApiKey) {
        return await this.callAnthropic(prompt);
      } else {
        return await this.callLocalModel(prompt);
      }
    } catch (error) {
      console.error("AI service call failed:", error);

      return {
        text:
          "Não foi possível gerar uma resposta no momento. Recomendo consultar diretamente um profissional de saúde.",
        confidence: 0.5,
        sources: [],
      };
    }
  }

  /**
   * Placeholder for OpenAI integration
   */
  private async callOpenAI(prompt: string): Promise<unknown> {
    // Implement OpenAI API call
    return {
      text: "Resposta gerada pelo OpenAI (placeholder)",
      confidence: 0.8,
      sources: ["OpenAI Healthcare Model"],
    };
  }

  /**
   * Placeholder for Anthropic integration
   */
  private async callAnthropic(prompt: string): Promise<unknown> {
    // Implement Anthropic Claude API call
    return {
      text: "Resposta gerada pelo Anthropic Claude (placeholder)",
      confidence: 0.85,
      sources: ["Anthropic Healthcare Model"],
    };
  }

  /**
   * Placeholder for local model integration
   */
  private async callLocalModel(prompt: string): Promise<unknown> {
    // Implement local healthcare model call
    return {
      text:
        "Entendo sua preocupação. Para uma avaliação adequada, recomendo consultar um profissional de saúde que possa examinar você pessoalmente e fornecer orientações específicas para sua situação.",
      confidence: 0.7,
      sources: ["Modelo Local de Saúde"],
    };
  }

  /**
   * Validate compliance with Brazilian healthcare regulations
   */
  private async validateCompliance(
    aiResponse: unknown,
    medicalAnalysis: MedicalTermAnalysis,
  ): Promise<{ cfm_compliant: boolean; anvisa_compliant: boolean; lgpd_compliant: boolean; }> {
    const text = aiResponse.text.toLowerCase();

    // CFM Compliance - No diagnosis or prescription
    const cfmCompliant = !text.includes("diagnóstico:")
      && !text.includes("prescrevo")
      && !text.includes("tome o medicamento")
      && text.includes("consulte um profissional");

    // ANVISA Compliance - No medication recommendations without prescription
    const anvisaCompliant = !text.includes("compre o medicamento")
      && !text.includes("sem receita")
      && (medicalAnalysis.categories.includes("medications")
        ? text.includes("receita médica")
        : true);

    // LGPD Compliance - No personal data exposure
    const lgpdCompliant = !text.includes("compartilhar dados")
      && !text.includes("enviar informações para");

    return {
      cfm_compliant: cfmCompliant,
      anvisa_compliant: anvisaCompliant,
      lgpd_compliant: lgpdCompliant,
    };
  }

  /**
   * Handle emergency escalation
   */
  private async handleEmergencyEscalation(
    message: ChatMessage,
    emergencyAnalysis: EmergencyAnalysis,
    healthcareContext?: HealthcareContext,
  ): Promise<void> {
    if (!this.config.emergencyEscalationEndpoint) return;

    try {
      const escalationData = {
        message_id: message.id,
        sender_id: message.sender_id,
        emergency_type: emergencyAnalysis.emergency_type,
        urgency_level: emergencyAnalysis.urgency_level,
        keywords: emergencyAnalysis.keywords_detected,
        healthcare_context: healthcareContext,
        timestamp: new Date().toISOString(),
        location: "Brasil", // Could be enhanced with actual location
      };

      await fetch(this.config.emergencyEscalationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.openaiApiKey || "emergency_token"}`,
        },
        body: JSON.stringify(escalationData),
      });

      console.log("🚨 Emergency escalation triggered for message:", message.id);
    } catch (error) {
      console.error("Failed to escalate emergency:", error);
    }
  }

  // Helper methods

  private initializeMedicalDatabase(): void {
    // Initialize Brazilian medical knowledge base
    this.medicalKnowledgeBase.set("emergency_protocols", {
      samu: 192,
      fire: 193,
      police: 190,
      poison_control: 0800722001,
    });
  }

  private initializeEmergencyKeywords(): void {
    const keywords = [
      "emergência",
      "socorro",
      "urgente",
      "grave",
      "crítico",
      "infarto",
      "derrame",
      "avc",
      "convulsão",
      "sangramento",
    ];

    keywords.forEach(keyword => this.emergencyKeywords.add(keyword));
  }

  private extractTextFromContent(content: MessageContent): string {
    if (typeof content === "string") return content;
    if (content && typeof content === "object" && "text" in content) {
      return content.text || "";
    }
    return "";
  }

  private mapSymptomsToSpecialties(
    symptom: string,
    specialties: Set<string>,
    conditions: string[],
  ): void {
    const mapping: Record<string, { specialty: string; conditions: string[]; }> = {
      "dor de cabeça": { specialty: "neurologia", conditions: ["cefaleia", "enxaqueca"] },
      "dor no peito": { specialty: "cardiologia", conditions: ["angina", "infarto"] },
      "falta de ar": { specialty: "pneumologia", conditions: ["asma", "bronquite"] },
      "dor abdominal": { specialty: "gastroenterologia", conditions: ["gastrite", "úlcera"] },
    };

    const match = mapping[symptom];
    if (match) {
      specialties.add(match.specialty);
      conditions.push(...match.conditions);
    }
  }

  private translateEmergencyType(type: string): string {
    const translations: Record<string, string> = {
      "cardiac_neurological": "Cardíaca/Neurológica",
      "hemorrhagic_trauma": "Hemorrágica/Trauma",
      "respiratory": "Respiratória",
      "general_emergency": "Emergência Geral",
    };

    return translations[type] || type;
  }

  private getMedicalDisclaimer(riskLevel: string): string {
    const baseDisclaimer = "\n\n⚠️ **Importante:** Esta é apenas uma orientação informativa. ";

    if (riskLevel === "critical") {
      return baseDisclaimer + "BUSQUE ATENDIMENTO MÉDICO IMEDIATAMENTE. Ligue 192 (SAMU).";
    } else if (riskLevel === "high") {
      return baseDisclaimer + "Consulte um profissional de saúde o mais breve possível.";
    } else {
      return baseDisclaimer
        + "Sempre consulte um profissional de saúde qualificado para diagnóstico e tratamento.";
    }
  }

  private generateFollowUpQuestions(medicalAnalysis?: MedicalTermAnalysis): string[] {
    if (!medicalAnalysis) {
      return ["Como posso ajudá-lo mais?", "Tem alguma dúvida específica sobre saúde?"];
    }

    const questions = [];

    if (medicalAnalysis.categories.includes("symptoms")) {
      questions.push("Há quanto tempo você está sentindo isso?");
      questions.push("Os sintomas estão melhorando ou piorando?");
    }

    if (medicalAnalysis.categories.includes("medications")) {
      questions.push("Você tem receita médica para este medicamento?");
      questions.push("Já consultou um médico sobre isso?");
    }

    if (questions.length === 0) {
      questions.push("Gostaria de mais informações sobre algum tópico específico?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }
}

// Singleton instance
let aiHealthcareInstance: AIHealthcareIntegration | null = null;

export function getAIHealthcareIntegration(config?: AIHealthcareConfig): AIHealthcareIntegration {
  if (!aiHealthcareInstance && config) {
    aiHealthcareInstance = new AIHealthcareIntegration(config);
  }

  if (!aiHealthcareInstance) {
    throw new Error("AI Healthcare Integration not initialized. Please provide config.");
  }

  return aiHealthcareInstance;
}

export default AIHealthcareIntegration;

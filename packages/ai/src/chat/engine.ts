/**
 * AI Chat Engine Integration with Vercel AI SDK
 * Healthcare-optimized streaming chat with Portuguese NLP
 * LGPD/ANVISA/CFM compliant implementation
 */

import { openai } from "@ai-sdk/openai";
import type {
	AppointmentContext,
	ChatAIInsights,
	ChatMessage,
	IntentAnalysis,
	MedicalAnalysis,
	SentimentAnalysis,
} from "@neonpro/types/ai-chat";
import { generateObject, generateText, streamText } from "ai";
import { z } from "zod";

// Healthcare AI Configuration
const HEALTHCARE_SYSTEM_PROMPT = `
Você é um assistente de IA especializado em saúde da NeonPro, projetado para clínicas brasileiras.

COMPETÊNCIAS PRINCIPAIS:
- Agendamento de consultas e gestão de horários
- Triagem inicial de sintomas (sem diagnóstico médico)
- Informações sobre serviços da clínica
- Orientações gerais de saúde pública
- Prevenção de no-show com lembretes inteligentes
- Suporte 24/7 para pacientes

CONFORMIDADE REGULATÓRIA:
- LGPD: Proteção rigorosa de dados pessoais
- ANVISA: Aderência às normas sanitárias
- CFM: Respeito às diretrizes do Conselho Federal de Medicina
- SUS: Integração com o Sistema Único de Saúde quando aplicável

LIMITAÇÕES IMPORTANTES:
- NÃO forneça diagnósticos médicos
- NÃO prescreva medicamentos
- NÃO substitua consulta médica presencial
- SEMPRE encaminhe casos urgentes para atendimento humano
- Mantenha tom profissional e empático

RECURSOS ESPECIAIS:
- Detecção automática de emergências
- Análise de sentimento para identificar ansiedade/urgência
- Prevenção proativa de faltas em consultas
- Suporte multilíngue (português brasileiro prioritário)

Responda sempre em português brasileiro, usando linguagem clara e acessível.
`;

const INTERNAL_SYSTEM_PROMPT = `
Você é um assistente interno para equipe médica da NeonPro.

FUNCIONALIDADES:
- Consultas sobre estoque e inventário
- Análise de performance da clínica
- Insights operacionais e recomendações
- Acesso a dados internos (respeitando hierarquia)
- Suporte administrativo avançado
- Relatórios em linguagem natural

ACESSO A DADOS:
- Métricas de performance
- Status de equipamentos
- Informações de pacientes (conforme permissão)
- Dados financeiros e operacionais

Mantenha sempre a confidencialidade e respeite os níveis de acesso da equipe.
`;

// Intent Analysis Schema
const IntentAnalysisSchema = z.object({
	primary_intent: z.string(),
	confidence: z.number().min(0).max(1),
	secondary_intents: z.array(
		z.object({
			intent: z.string(),
			confidence: z.number().min(0).max(1),
		}),
	),
	intent_category: z.enum([
		"appointment",
		"medical_query",
		"information",
		"emergency",
		"administrative",
	]),
	requires_human: z.boolean().optional(),
});

// Medical Analysis Schema
const MedicalAnalysisSchema = z.object({
	medical_terms_detected: z.array(z.string()),
	symptom_analysis: z.array(
		z.object({
			symptom: z.string(),
			severity: z.enum(["mild", "moderate", "severe"]),
		}),
	),
	urgency_assessment: z.enum(["routine", "urgent", "emergency"]),
	specialty_recommendation: z.string().optional(),
	triage_level: z.number().int().min(1).max(5).optional(),
	requires_immediate_attention: z.boolean().optional(),
});

// Appointment Analysis Schema
const AppointmentAnalysisSchema = z.object({
	appointment_type: z.string(),
	recommended_specialty: z.string(),
	urgency_level: z.enum(["routine", "urgent", "emergency"]),
	estimated_duration: z.number(),
	preferred_time_slots: z.array(z.string()),
	doctor_recommendations: z.array(z.string()).optional(),
});

export class HealthcareAIEngine {
	private readonly model = openai("gpt-4o-mini"); // Cost-effective for healthcare
	private readonly medicalModel = openai("gpt-4o"); // Premium for complex medical analysis

	constructor(
		private readonly interfaceType: "external" | "internal" = "external",
		readonly _clinicContext?: any,
	) {}

	/**
	 * Stream chat responses with healthcare optimizations
	 */
	async streamResponse(
		messages: ChatMessage[],
		sessionContext: any,
	): Promise<any> {
		const systemPrompt =
			this.interfaceType === "external"
				? HEALTHCARE_SYSTEM_PROMPT
				: INTERNAL_SYSTEM_PROMPT;

		const contextualPrompt = this.buildContextualPrompt(sessionContext);

		try {
			const result = await streamText({
				model: this.model,
				system: `${systemPrompt}\n\n${contextualPrompt}`,
				messages: messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				temperature: 0.7, // Balanced creativity for healthcare
				maxTokens: 1000,
				frequencyPenalty: 0.3, // Reduce repetition
				presencePenalty: 0.2,
			});

			return result;
		} catch (_error) {
			throw new Error("Falha na comunicação com o assistente de IA");
		}
	}

	/**
	 * Generate single response for non-streaming scenarios
	 */
	async generateResponse(
		messages: ChatMessage[],
		sessionContext: any,
	): Promise<string> {
		const systemPrompt =
			this.interfaceType === "external"
				? HEALTHCARE_SYSTEM_PROMPT
				: INTERNAL_SYSTEM_PROMPT;

		const contextualPrompt = this.buildContextualPrompt(sessionContext);

		try {
			const { text } = await generateText({
				model: this.model,
				system: `${systemPrompt}\n\n${contextualPrompt}`,
				messages: messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				temperature: 0.7,
				maxTokens: 1000,
			});

			return text;
		} catch (_error) {
			throw new Error("Falha na geração de resposta");
		}
	}

	/**
	 * Analyze user intent with healthcare-specific patterns
	 */
	async analyzeIntent(message: string): Promise<IntentAnalysis> {
		try {
			const { object } = await generateObject({
				model: this.model,
				schema: IntentAnalysisSchema,
				system: `
        Analise a intenção do usuário em uma mensagem de chat de saúde.
        Identifique padrões específicos de agendamentos, consultas médicas, emergências.
        
        Categorias principais:
        - appointment: Agendamento de consultas
        - medical_query: Dúvidas sobre saúde/sintomas  
        - information: Informações sobre clínica/serviços
        - emergency: Situações de emergência
        - administrative: Questões administrativas
        `,
				prompt: `Analise esta mensagem: "${message}"`,
			});

			return object;
		} catch (_error) {
			// Fallback intent analysis
			return {
				primary_intent: "general_inquiry",
				confidence: 0.5,
				secondary_intents: [],
				intent_category: "information",
				requires_human: false,
			};
		}
	}

	/**
	 * Perform medical context analysis
	 */
	async analyzeMedicalContext(
		message: string,
	): Promise<MedicalAnalysis | null> {
		// Only analyze if medical terms detected
		const medicalKeywords = [
			"dor",
			"sintoma",
			"febre",
			"tosse",
			"dor de cabeça",
			"mal estar",
			"consulta",
			"médico",
			"tratamento",
			"medicamento",
			"exame",
		];

		const hasmedicalContent = medicalKeywords.some((keyword) =>
			message.toLowerCase().includes(keyword),
		);

		if (!hasmedicalContent) {
			return null;
		}

		try {
			const { object } = await generateObject({
				model: this.medicalModel, // Use premium model for medical analysis
				schema: MedicalAnalysisSchema,
				system: `
        Você é um especialista em triagem médica. Analise sintomas e urgência.
        
        IMPORTANTE:
        - Não faça diagnósticos
        - Foque na urgência e necessidade de atendimento
        - Use níveis de triagem padrão: 1 (baixa) a 5 (emergência)
        - Identifique especialidades recomendadas
        `,
				prompt: `Analise esta descrição médica: "${message}"`,
			});

			return object;
		} catch (_error) {
			return null;
		}
	}

	/**
	 * Analyze appointment requirements
	 */
	async analyzeAppointmentContext(
		message: string,
	): Promise<AppointmentContext | null> {
		const appointmentKeywords = [
			"agendar",
			"consulta",
			"horário",
			"marcação",
			"agendamento",
		];

		const hasAppointmentContent = appointmentKeywords.some((keyword) =>
			message.toLowerCase().includes(keyword),
		);

		if (!hasAppointmentContent) {
			return null;
		}

		try {
			const { object } = await generateObject({
				model: this.model,
				schema: AppointmentAnalysisSchema,
				system: `
        Analise solicitações de agendamento médico.
        Extraia: tipo de consulta, especialidade, urgência, horários preferenciais.
        `,
				prompt: `Analise esta solicitação de agendamento: "${message}"`,
			});

			return {
				appointment_type: object.appointment_type,
				preferred_time: object.preferred_time_slots[0],
				doctor_preference: object.doctor_recommendations?.[0],
			};
		} catch (_error) {
			return null;
		}
	}

	/**
	 * Generate comprehensive AI insights for the session
	 */
	async generateInsights(
		messages: ChatMessage[],
		_sessionContext: any,
	): Promise<ChatAIInsights> {
		const lastMessage = messages.at(-1);

		if (!lastMessage || lastMessage.role !== "user") {
			throw new Error("No user message to analyze");
		}

		const [intentAnalysis, medicalAnalysis] = await Promise.all([
			this.analyzeIntent(lastMessage.content),
			this.analyzeMedicalContext(lastMessage.content),
		]);

		// Simple sentiment analysis
		const sentiment = this.analyzeSentiment(lastMessage.content);

		return {
			intent_analysis: intentAnalysis,
			sentiment_analysis: sentiment,
			medical_analysis: medicalAnalysis || undefined,
			recommendation_engine: {
				suggested_responses: [
					{
						text: "Como posso ajudá-lo com seu agendamento?",
						confidence: 0.8,
						priority: 1,
					},
				],
				next_actions: [
					{
						action: "schedule_appointment",
						priority:
							intentAnalysis.intent_category === "appointment" ? "high" : "low",
					},
				],
			},
			performance_metrics: {
				response_time: Date.now(), // Will be calculated by caller
				confidence_score: intentAnalysis.confidence,
			},
		};
	}

	/**
	 * Build contextual prompt based on session
	 */
	private buildContextualPrompt(sessionContext: any): string {
		let prompt = "";

		if (this.interfaceType === "external") {
			prompt += "CONTEXTO DO PACIENTE:\n";
			if (sessionContext?.patient_context) {
				prompt += `- Faixa etária: ${
					sessionContext.patient_context.age_group || "não informado"
				}\n`;
				prompt += `- Histórico: ${
					sessionContext.patient_context.medical_history_summary ||
					"não disponível"
				}\n`;
			}
		} else {
			prompt += "CONTEXTO INTERNO:\n";
			if (sessionContext?.staff_context) {
				prompt += `- Função: ${sessionContext.staff_context.role}\n`;
				prompt += `- Nível de acesso: ${sessionContext.staff_context.access_level}\n`;
			}
		}

		if (sessionContext?.clinic_context) {
			prompt += `CLÍNICA: ${sessionContext.clinic_context.clinic_name}\n`;
			prompt += `ESPECIALIDADES: ${sessionContext.clinic_context.specialties?.join(", ")}\n`;
			prompt += `HORÁRIO: ${sessionContext.clinic_context.operating_hours}\n`;
		}

		return prompt;
	}

	/**
	 * Simple sentiment analysis for healthcare context
	 */
	private analyzeSentiment(message: string): SentimentAnalysis {
		const urgentWords = [
			"urgente",
			"emergência",
			"dor forte",
			"não aguento",
			"socorro",
		];
		const negativeWords = ["mal", "dor", "ruim", "preocupado", "ansioso"];
		const positiveWords = ["obrigado", "ajuda", "melhor", "ótimo", "bom"];

		const hasUrgent = urgentWords.some((word) =>
			message.toLowerCase().includes(word),
		);
		const hasNegative = negativeWords.some((word) =>
			message.toLowerCase().includes(word),
		);
		const hasPositive = positiveWords.some((word) =>
			message.toLowerCase().includes(word),
		);

		let sentiment: "positive" | "neutral" | "negative" | "urgent" = "neutral";
		let confidence = 0.6;

		if (hasUrgent) {
			sentiment = "urgent";
			confidence = 0.9;
		} else if (hasNegative) {
			sentiment = "negative";
			confidence = 0.7;
		} else if (hasPositive) {
			sentiment = "positive";
			confidence = 0.7;
		}

		return {
			sentiment,
			confidence,
			emotion_indicators: [
				...(hasUrgent ? ["urgency"] : []),
				...(hasNegative ? ["concern"] : []),
				...(hasPositive ? ["satisfaction"] : []),
			],
			stress_level: hasUrgent ? "high" : hasNegative ? "medium" : "low",
		};
	}

	/**
	 * Detect emergency situations
	 */
	detectEmergency(message: string): boolean {
		const emergencyKeywords = [
			"emergência",
			"urgente",
			"socorro",
			"dor forte",
			"sangramento",
			"não consigo respirar",
			"peito apertado",
			"desmaiei",
			"acidente",
		];

		return emergencyKeywords.some((keyword) =>
			message.toLowerCase().includes(keyword),
		);
	}

	/**
	 * Check if human escalation is needed
	 */
	requiresHumanEscalation(insights: ChatAIInsights): boolean {
		return (
			insights.intent_analysis.requires_human ||
			insights.medical_analysis?.requires_immediate_attention ||
			insights.sentiment_analysis.sentiment === "urgent" ||
			insights.intent_analysis.intent_category === "emergency"
		);
	}
}

export default HealthcareAIEngine;

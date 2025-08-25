import { EnhancedServiceBase } from "@neonpro/core-services";
import type { ChatMessage, ChatResponse, ChatSession, ComplianceMetrics, HealthcareChatContext } from "../types";

interface ChatServiceInput {
	message: string;
	sessionId: string;
	userId: string;
	clinicId: string;
	context?: HealthcareChatContext;
	language?: "pt-BR" | "en";
}

interface ChatServiceOutput {
	response: string;
	messageId: string;
	sessionId: string;
	confidence: number;
	complianceFlags: ComplianceMetrics;
	suggestedActions: string[];
	escalationRequired: boolean;
}

export class UniversalChatService extends EnhancedServiceBase {
	protected serviceId = "universal-chat";
	protected version = "1.0.0";
	protected description = "AI-powered universal chat system for healthcare with Portuguese optimization";

	constructor() {
		super({
			serviceName: "universal-chat",
			version: "1.0.0",
			enableCache: true,
			enableAnalytics: true,
			enableSecurity: true,
			cacheOptions: {
				defaultTTL: 300, // 5 minutes for chat responses
				maxItems: 1000,
			},
			securityOptions: {
				auditLevel: "healthcare",
				encryptSensitiveData: true,
			},
		});
	}

	getServiceName(): string {
		return this.serviceId;
	}

	getServiceVersion(): string {
		return this.version;
	}

	async execute(input: ChatServiceInput): Promise<ChatServiceOutput> {
		const startTime = Date.now();

		try {
			// Input validation
			await this.validateInput(input);

			// Execute using base class patterns
			return await this.executeOperation(
				"chat-completion",
				async () => {
					return await this.processChat(input);
				},
				{
					userId: input.userId,
					clinicId: input.clinicId,
					patientId: input.context?.patientId,
				},
				{
					cacheKey: this.generateCacheKey(input),
					cacheTTL: 300,
					requiresAuth: true,
					sensitiveData: true,
				}
			);
		} catch (error) {
			throw new Error(`Universal Chat Service failed: ${error.message}`);
		}
	}

	private async processChat(input: ChatServiceInput): Promise<ChatServiceOutput> {
		// Load chat session context
		const session = await this.loadChatSession(input.sessionId, input.userId);

		// Prepare healthcare-optimized prompt
		const prompt = await this.buildHealthcarePrompt(input, session);

		// Call OpenAI API with healthcare specialization
		const aiResponse = await this.callOpenAI(prompt, input.language || "pt-BR");

		// Process response for healthcare compliance
		const processedResponse = await this.processHealthcareResponse(aiResponse, input);

		// Save conversation to database
		await this.saveConversation(input, processedResponse);

		// Update session context
		// Update session
		await this.updateChatSession(session, input, processedResponse);

		return processedResponse;
	}

	private generateCacheKey(input: ChatServiceInput): string {
		const keyData = {
			message: input.message,
			userId: input.userId,
			sessionId: input.sessionId,
			context: input.context,
		};
		return `chat:${Buffer.from(JSON.stringify(keyData)).toString("base64").slice(0, 32)}`;
	}

	private async validateInput(input: ChatServiceInput): Promise<void> {
		if (!input.message?.trim()) {
			throw new Error("CHAT_EMPTY_MESSAGE: Message cannot be empty");
		}

		if (input.message.length > 4000) {
			throw new Error("CHAT_MESSAGE_TOO_LONG: Message exceeds maximum length");
		}

		if (!(input.userId && input.clinicId)) {
			throw new Error("CHAT_MISSING_CONTEXT: User and clinic IDs are required");
		}

		// Healthcare-specific validation
		if (await this.containsSensitiveData(input.message)) {
			console.log("Sensitive data detected in message", {
				userId: input.userId,
				severity: "medium",
			});
		}
	}

	private async loadChatSession(sessionId: string, userId: string): Promise<ChatSession> {
		// Mock implementation - replace with actual database call
		return {
			id: sessionId,
			userId,
			startedAt: new Date(),
			status: "active",
			messageCount: 0,
			messages: [],
		};
	}

	private async buildHealthcarePrompt(input: ChatServiceInput, session: ChatSession): Promise<string> {
		const systemPrompt = `
    Você é um assistente inteligente especializado em saúde para clínicas brasileiras.
    
    CONTEXTO MÉDICO:
    - Sempre priorize a segurança do paciente
    - Nunca forneça diagnósticos médicos definitivos
    - Incentive consultas presenciais quando necessário
    - Seja empático e profissional
    - Siga rigorosamente as normas LGPD, ANVISA e CFM
    
    FUNCIONALIDADES:
    - Agendamento de consultas
    - Informações sobre procedimentos
    - Esclarecimento de dúvidas gerais
    - Orientações pré/pós-consulta
    - Informações sobre clínica e profissionais
    
    LIMITAÇÕES:
    - NÃO diagnostique doenças
    - NÃO prescreva medicamentos
    - NÃO substitua consulta médica
    - NÃO acesse dados médicos confidenciais sem autorização
    
    HISTÓRICO DA CONVERSA:
    ${session.messages.map((m) => `${m.role}: ${m.content}`).join("\n")}
    `;

		return `${systemPrompt}\n\nPaciente: ${input.message}`;
	}

	private async callOpenAI(prompt: string, language: string): Promise<string> {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "gpt-4-turbo-preview",
				messages: [{ role: "system", content: prompt }],
				temperature: 0.7,
				max_tokens: 1000,
				presence_penalty: 0.1,
				frequency_penalty: 0.1,
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}

	private async processHealthcareResponse(aiResponse: string, input: ChatServiceInput): Promise<ChatServiceOutput> {
		// Compliance checking
		const complianceFlags = await this.checkHealthcareCompliance(aiResponse);

		// Confidence scoring
		const confidence = await this.calculateResponseConfidence(aiResponse, input);

		// Escalation detection
		const escalationRequired = await this.detectEscalationNeed(aiResponse, input);

		// Action suggestions
		const suggestedActions = await this.generateSuggestedActions(aiResponse, input);

		return {
			response: aiResponse,
			messageId: this.generateId(),
			sessionId: input.sessionId,
			confidence,
			complianceFlags,
			suggestedActions,
			escalationRequired,
		};
	}

	private async checkHealthcareCompliance(response: string): Promise<ComplianceMetrics> {
		const flags: ComplianceMetrics = {
			lgpdCompliant: true,
			anvisaCompliant: true,
			cfmCompliant: true,
			riskLevel: "low",
			warnings: [],
		};

		// Check for medical diagnosis language
		if (/\b(diagnóstico|doença|patologia)\b/i.test(response)) {
			flags.cfmCompliant = false;
			flags.riskLevel = "high";
			flags.warnings.push("Potential medical diagnosis detected");
		}

		// Check for medication recommendations
		if (/\b(medicamento|remédio|prescrição|dose)\b/i.test(response)) {
			flags.cfmCompliant = false;
			flags.riskLevel = "high";
			flags.warnings.push("Medication recommendation detected");
		}

		// Check for personal data exposure
		if (/\b(CPF|RG|cartão|telefone|endereço)\b/i.test(response)) {
			flags.lgpdCompliant = false;
			flags.riskLevel = "medium";
			flags.warnings.push("Potential personal data exposure");
		}

		return flags;
	}

	private async saveConversation(input: ChatServiceInput, output: ChatServiceOutput): Promise<void> {
		// Mock implementation - replace with actual database call
		console.log("Saving conversation", {
			sessionId: input.sessionId,
			userId: input.userId,
			messageLength: input.message.length,
			responseLength: output.response.length,
		});
	}

	private async updateChatSession(
		session: ChatSession,
		input: ChatServiceInput,
		output: ChatServiceOutput
	): Promise<void> {
		// Mock implementation - replace with actual database call
		console.log("Updating chat session", {
			sessionId: session.id,
			messageCount: session.messageCount + 1,
		});
	}

	private async containsSensitiveData(message: string): Promise<boolean> {
		const sensitivePatterns = [
			/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
			/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ
			/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
			/\b(?:\d{11}|\d{10})\b/, // Phone numbers
		];

		return sensitivePatterns.some((pattern) => pattern.test(message));
	}

	private async calculateResponseConfidence(response: string, input: ChatServiceInput): Promise<number> {
		let confidence = 0.8; // Base confidence

		// Adjust based on response length and completeness
		if (response.length > 50) confidence += 0.1;
		if (response.includes("consulta presencial")) confidence += 0.1; // Appropriate medical guidance
		if (response.includes("não posso diagnosticar")) confidence += 0.1; // Proper boundaries

		return Math.min(confidence, 1.0);
	}

	private async detectEscalationNeed(response: string, input: ChatServiceInput): Promise<boolean> {
		const escalationKeywords = [
			"emergência",
			"urgente",
			"dor intensa",
			"sangramento",
			"falta de ar",
			"desmaio",
			"convulsão",
			"alergia grave",
		];

		return escalationKeywords.some(
			(keyword) => input.message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
		);
	}

	private async generateSuggestedActions(response: string, input: ChatServiceInput): Promise<string[]> {
		const actions: string[] = [];

		if (response.includes("agendar")) {
			actions.push("schedule_appointment");
		}

		if (response.includes("consulta presencial")) {
			actions.push("book_consultation");
		}

		if (await this.detectEscalationNeed(response, input)) {
			actions.push("escalate_to_professional");
		}

		actions.push("continue_conversation");

		return actions;
	}

	private async handleChatError(error: any, input: ChatServiceInput): Promise<void> {
		console.error("Chat service error", {
			error: error.message,
			userId: input.userId,
			clinicId: input.clinicId,
			sessionId: input.sessionId,
		});

		// Log compliance event if error relates to sensitive data
		if (error.message.includes("sensitive_data")) {
			console.log("Compliance event logged", {
				type: "chat_error_sensitive_data",
				userId: input.userId,
				severity: "high",
				details: error.message,
			});
		}
	}

	private generateId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

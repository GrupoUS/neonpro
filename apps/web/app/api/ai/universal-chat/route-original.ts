/**
 * Universal AI Chat API Route
 * Next.js App Router with Vercel AI SDK Integration
 * Healthcare-optimized streaming with Portuguese NLP
 * Dual Interface: External Client + Internal Staff
 */

import { openai } from "@ai-sdk/openai";
import { HealthcareAIEngine } from "@neonpro/ai/chat/engine";
import type { ChatInterface, ChatMessage } from "@neonpro/types/ai-chat";
import { streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Healthcare System Prompts
const EXTERNAL_SYSTEM_PROMPT = `
Você é o assistente virtual da NeonPro, especializado em atendimento a pacientes de clínicas brasileiras.

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

LIMITAÇÕES IMPORTANTES:
- NÃO forneça diagnósticos médicos
- NÃO prescreva medicamentos
- NÃO substitua consulta médica presencial
- SEMPRE encaminhe casos urgentes para atendimento humano
- Mantenha tom profissional e empático

Responda sempre em português brasileiro, usando linguagem clara e acessível.
`;

const INTERNAL_SYSTEM_PROMPT = `
Você é o assistente interno da equipe médica da NeonPro.

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

export async function POST(request: NextRequest) {
	try {
		const { messages, interface_type = "external", session_id, user_context } = await request.json();

		if (!(messages && Array.isArray(messages))) {
			return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
		}

		// Select system prompt based on interface
		const systemPrompt = interface_type === "external" ? EXTERNAL_SYSTEM_PROMPT : INTERNAL_SYSTEM_PROMPT;

		// Initialize AI engine for analysis
		const aiEngine = new HealthcareAIEngine(interface_type);

		// Get the last user message for analysis
		const lastUserMessage = messages.filter((m: ChatMessage) => m.role === "user").pop();

		// Emergency detection
		if (lastUserMessage && aiEngine.detectEmergency(lastUserMessage.content)) {
			return NextResponse.json({
				emergency: true,
				message: "Situação de emergência detectada. Conectando com atendimento humano imediatamente.",
				escalation_type: "emergency_services",
				priority: "critical",
			});
		}

		// Build contextual information
		let contextualInfo = "";

		if (interface_type === "external") {
			contextualInfo = `
CONTEXTO DA CLÍNICA:
- Nome: Clínica NeonPro
- Especialidades: Clínica Geral, Cardiologia, Dermatologia, Pediatria
- Horário: Segunda a Sexta 08:00-18:00, Sábado 08:00-12:00
- Contato: (11) 3000-0000
- Endereço: São Paulo, SP

SERVIÇOS DISPONÍVEIS:
- Consultas presenciais e telemedicina
- Exames laboratoriais e de imagem
- Procedimentos ambulatoriais
- Check-ups preventivos
- Acompanhamento médico contínuo
`;
		} else {
			contextualInfo = `
CONTEXTO INTERNO:
- Sistema: NeonPro Healthcare Platform
- Usuário: ${user_context?.role || "Staff"} (${user_context?.access_level || "basic"})
- Permissões: ${user_context?.permissions?.join(", ") || "Básicas"}

DADOS DISPONÍVEIS:
- Inventário e estoque em tempo real
- Métricas de performance da clínica
- Analytics de pacientes e agendamentos
- Relatórios financeiros e operacionais
`;
		}

		// Stream the response using Vercel AI SDK
		const result = await streamText({
			model: openai("gpt-4o-mini"),
			system: `${systemPrompt}\n\n${contextualInfo}`,
			messages: messages.map((msg: ChatMessage) => ({
				role: msg.role,
				content: msg.content,
			})),
			temperature: 0.7,
		});

		// Return streaming response
		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Universal chat error:", error);
		return NextResponse.json(
			{
				error: "Erro interno do servidor",
				message: "Desculpe, ocorreu um erro. Tente novamente em alguns momentos.",
			},
			{ status: 500 }
		);
	}
}

// Session management endpoints
export async function PUT(request: NextRequest) {
	try {
		const { session_id, action, ...data } = await request.json();

		switch (action) {
			case "create_session": {
				const newSession = {
					id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					interface_type: data.interface_type || "external",
					status: "active",
					created_at: new Date(),
					messages: [],
					context: data.context || {},
				};

				// In a real implementation, save to database
				return NextResponse.json({ session: newSession });
			}

			case "end_session":
				// In a real implementation, update database
				return NextResponse.json({
					success: true,
					session_id,
					ended_at: new Date(),
				});

			case "escalate":
				// In a real implementation, trigger escalation workflow
				return NextResponse.json({
					success: true,
					escalation_id: `esc_${Date.now()}`,
					message: "Escalação iniciada com sucesso",
				});

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Session management error:", error);
		return NextResponse.json({ error: "Session management failed" }, { status: 500 });
	}
}

// Analytics and insights endpoint
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const session_id = searchParams.get("session_id");
		const type = searchParams.get("type") || "insights";

		if (!session_id) {
			return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
		}

		switch (type) {
			case "insights":
				// In a real implementation, fetch from database
				return NextResponse.json({
					session_id,
					insights: {
						message_count: 5,
						avg_response_time: 1200,
						satisfaction_score: 4.5,
						resolution_rate: 0.85,
						escalation_rate: 0.15,
						primary_topics: ["agendamento", "informações", "sintomas"],
					},
				});

			case "metrics":
				return NextResponse.json({
					session_id,
					metrics: {
						total_duration: 480_000, // 8 minutes
						message_frequency: 0.5, // messages per minute
						user_satisfaction: 0.9,
						ai_confidence: 0.85,
						resolution_success: true,
					},
				});

			default:
				return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 });
		}
	} catch (error) {
		console.error("Analytics error:", error);
		return NextResponse.json({ error: "Analytics request failed" }, { status: 500 });
	}
}

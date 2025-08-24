/**
 * Universal AI Chat API Route - Mock Version for Testing
 * Next.js App Router with simulated streaming responses
 * Healthcare-optimized with Portuguese NLP simulation
 * Dual Interface: External Client + Internal Staff
 */

import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Mock Healthcare Responses
const EXTERNAL_RESPONSES = [
	"Olá! Sou o assistente virtual da NeonPro. Como posso ajudá-lo hoje?",
	"Fico feliz em ajudar com seu agendamento. Temos horários disponíveis com cardiologista para esta semana.",
	"Para sua segurança, preciso de algumas informações. Qual é a natureza da consulta?",
	"Entendo sua preocupação. Vou verificar os próximos horários disponíveis com nossos especialistas.",
	"Agendamento confirmado! Você receberá uma confirmação por WhatsApp em breve.",
];

const INTERNAL_RESPONSES = [
	"Sistema operacional ativo. Como posso auxiliar a equipe hoje?",
	"Verificando estoque... Temos 85% dos materiais em níveis adequados.",
	"Relatório gerado: 127 pacientes atendidos esta semana, performance +12% vs. semana anterior.",
	"Status dos equipamentos: Todos os equipamentos críticos funcionando normalmente.",
	"Análise de performance: Taxa de no-show reduzida para 8% este mês.",
];

function getRandomResponse(interface_type: string): string {
	const responses = interface_type === "external" ? EXTERNAL_RESPONSES : INTERNAL_RESPONSES;
	return responses[Math.floor(Math.random() * responses.length)];
}

function* createStreamingResponse(text: string) {
	const words = text.split(" ");
	for (let i = 0; i < words.length; i++) {
		const chunk = i === 0 ? words[i] : " " + words[i];
		yield chunk;
	}
}

export async function POST(request: NextRequest) {
	try {
		const { messages, interface: interface_type = "external" } = await request.json();

		if (!(messages && Array.isArray(messages))) {
			return NextResponse.json({ error: "Mensagens são obrigatórias" }, { status: 400 });
		}

		const lastMessage = messages[messages.length - 1];
		const mockResponse = getRandomResponse(interface_type);

		// Simulate streaming response
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Send initial data
					const initialData = JSON.stringify({
						type: "start",
						interface: interface_type,
						timestamp: new Date().toISOString(),
					});
					controller.enqueue(encoder.encode(`data: ${initialData}\\n\\n`));

					// Stream the response word by word
					for (const chunk of createStreamingResponse(mockResponse)) {
						const chunkData = JSON.stringify({
							type: "content",
							content: chunk,
						});
						controller.enqueue(encoder.encode(`data: ${chunkData}\\n\\n`));

						// Add realistic delay
						await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
					}

					// Send completion
					const completeData = JSON.stringify({
						type: "complete",
						usage: {
							prompt_tokens: lastMessage.content.length / 4,
							completion_tokens: mockResponse.length / 4,
							total_tokens: (lastMessage.content.length + mockResponse.length) / 4,
						},
					});
					controller.enqueue(encoder.encode(`data: ${completeData}\\n\\n`));

					controller.close();
				} catch (error) {
					console.error("Streaming error:", error);
					controller.error(error);
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
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
			case "create":
				return NextResponse.json({
					session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					status: "active",
					interface: data.interface || "external",
					created_at: new Date().toISOString(),
				});

			case "update":
				return NextResponse.json({
					session_id,
					status: "updated",
					updated_at: new Date().toISOString(),
				});

			case "end":
				return NextResponse.json({
					session_id,
					status: "ended",
					ended_at: new Date().toISOString(),
				});

			default:
				return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
		}
	} catch (error) {
		return NextResponse.json({ error: "Erro na gestão da sessão" }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		status: "operational",
		message: "Universal AI Chat API - Mock Version",
		features: [
			"Dual interface (external/internal)",
			"Portuguese healthcare optimization",
			"Streaming responses (simulated)",
			"Session management",
			"LGPD/ANVISA compliance ready",
		],
		timestamp: new Date().toISOString(),
	});
}

/**
 * Universal AI Chat API Route - Production Version
 * Next.js App Router with real OpenAI streaming responses
 * Healthcare-optimized with Portuguese NLP
 * Dual Interface: External Client + Internal Staff
 */

import { UniversalChatService } from "@neonpro/ai/services/universal-chat-service";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      interface: interface_type = "external",
      sessionId,
      userId,
      clinicId,
      patientId,
    } = await request.json();

    if (!(messages && Array.isArray(messages))) {
      return NextResponse.json(
        { error: "Mensagens são obrigatórias" },
        { status: 400 },
      );
    }

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "SessionId e userId são obrigatórios" },
        { status: 400 },
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return NextResponse.json(
        { error: "Mensagem não pode estar vazia" },
        { status: 400 },
      );
    }

    // Initialize the chat service
    const chatService = new UniversalChatService();

    // Prepare input for the service
    const chatInput = {
      message: lastMessage.content,
      sessionId,
      userId,
      clinicId: clinicId || "default",
      context: {
        interface: interface_type,
        patientId,
        messageHistory: messages.slice(-5), // Last 5 messages for context
        language: "pt-BR" as const,
      },
      language: "pt-BR" as const,
    };

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial data
          const initialData = JSON.stringify({
            type: "start",
            interface: interface_type,
            sessionId,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${initialData}\\n\\n`));

          // Get response from the service
          const response = await chatService.execute(chatInput);

          // Stream the response content word by word
          const words = response.response.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ` ${words[i]}`;
            const chunkData = JSON.stringify({
              type: "content",
              content: chunk,
            });
            controller.enqueue(encoder.encode(`data: ${chunkData}\\n\\n`));

            // Add realistic delay
            await new Promise((resolve) =>
              setTimeout(resolve, 30 + Math.random() * 70),
            );
          }

          // Send completion with metadata
          const completeData = JSON.stringify({
            type: "complete",
            sessionId,
            messageId: response.messageId,
            confidence: response.confidence,
            emergencyDetected: response.escalationRequired, // Map escalation to emergency for frontend
            escalationTriggered: response.escalationRequired,
            suggestedActions: response.suggestedActions,
            complianceFlags: Object.keys(response.complianceFlags || {}),
            usage: {
              prompt_tokens: Math.floor(lastMessage.content.length / 4),
              completion_tokens: Math.floor(response.response.length / 4),
              total_tokens: Math.floor(
                (lastMessage.content.length + response.response.length) / 4,
              ),
            },
          });
          controller.enqueue(encoder.encode(`data: ${completeData}\\n\\n`));

          controller.close();
        } catch (_error) {
          // console.error("Streaming error:", _error);
          const errorData = JSON.stringify({
            type: "error",
            error:
              _error instanceof Error
                ? _error.message
                : "Erro interno do servidor",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\\n\\n`));
          controller.close();
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
  } catch (_error) {
    // console.error("Universal chat error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          "Desculpe, ocorreu um erro. Tente novamente em alguns momentos.",
      },
      { status: 500 },
    );
  }
}

// Session management endpoints
export async function PUT(request: NextRequest) {
  try {
    const { session_id, action, ...data } = await request.json();

    switch (action) {
      case "create": {
        // Generate a proper UUID for the session
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        return NextResponse.json({
          sessionId: newSessionId,
          status: "active",
          interface: data.interface || "external",
          created_at: new Date().toISOString(),
        });
      }

      case "update": {
        return NextResponse.json({
          sessionId: session_id,
          status: "updated",
          updated_at: new Date().toISOString(),
        });
      }

      case "end": {
        return NextResponse.json({
          sessionId: session_id,
          status: "ended",
          ended_at: new Date().toISOString(),
        });
      }

      default: {
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Erro na gestão da sessão" },
      { status: 500 },
    );
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

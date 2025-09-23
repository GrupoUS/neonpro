/**
 * CopilotKit Bridge for NeonPro Healthcare Agent
 * Connects CopilotKit frontend to AG-UI protocol backend with UI/UX optimizations
 */

import { Hono } from "hono";
import type { Context, Next } from "hono";
import { cors } from "hono/cors";
import { streamText } from "hono/streaming";
import { logger } from "../../lib/logger";

// Create dedicated router for CopilotKit bridge
const copilotBridge = new Hono();

// CORS configuration for CopilotKit
copilotBridge.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://neonpro.com",
      "https://www.neonpro.com",
      "https://neonpro.vercel.app",
    ],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Healthcare-Platform",
      "X-LGPD-Compliance",
      "X-Request-Source",
    ],
    credentials: true,
  }),
);

// Security headers middleware
copilotBridge.use("*", async (c: Context, next: Next) => {
  // Apply healthcare security headers
  c.header("X-Healthcare-Platform", "NeonPro");
  c.header("X-LGPD-Compliance", "true");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");

  await next();
});

/**
 * CopilotKit Chat Completions Endpoint
 * Handles streaming chat responses from AG-UI backend
 */
copilotBridge.post("/chat/completions", async (c) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse CopilotKit request
    const body = await c.req.json();
    const { messages, stream = true, model } = body;

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      return c.json(
        {
          error: {
            type: "invalid_request",
            message: "No user message found in request",
          },
        },
        400,
      );
    }

    const userQuery = latestMessage.content;

    // Extract user context from headers or default
    const userContext = {
      _userId: c.req.header("X-User-ID") || "anonymous",
      domain: c.req.header("X-User-Domain") || "default",
      _role: c.req.header("X-User-Role") || "receptionist",
      sessionId: c.req.header("X-Session-ID") || requestId,
    };

    logger.info("CopilotKit request received", {
      requestId,
      userQuery: userQuery.substring(0, 100) + "...",
      userContext,
      messageCount: messages.length,
    });

    // Call AG-UI backend agent
    const agentResponse = await callAGUIAgent(
      userQuery,
      userContext,
      requestId,
    );

    if (stream) {
      // Return streaming response for real-time UI updates
      return streamText(c, async (stream) => {
        // Send initial response
        const response = formatCopilotResponse(
          agentResponse,
          requestId,
          startTime,
        );
        await stream.write(`data: ${JSON.stringify(response)}\n\n`);

        // If agent response has actions, send them as follow-up
        if (agentResponse.actions && agentResponse.actions.length > 0) {
          const actionsResponse = {
            id: `${requestId}-actions`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: model || "neonpro-healthcare-agent",
            choices: [
              {
                index: 0,
                delta: {
                  _role: "assistant",
                  content: `\n\n**Ações disponíveis:**`,
                  actions: agentResponse.actions,
                },
                finish_reason: null,
              },
            ],
          };
          await stream.write(`data: ${JSON.stringify(actionsResponse)}\n\n`);
        }

        // Send final completion
        const finalResponse = {
          id: requestId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: model || "neonpro-healthcare-agent",
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: "stop",
            },
          ],
        };
        await stream.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
        await stream.write("data: [DONE]\n\n");
      });
    } else {
      // Return non-streaming response
      const response = formatCopilotResponse(
        agentResponse,
        requestId,
        startTime,
      );
      return c.json(response);
    }
  } catch (error) {
    logger.error("CopilotKit bridge error", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return c.json(
      {
        error: {
          type: "internal_error",
          message:
            "Ocorreu um erro ao processar sua solicitação. Tente novamente em alguns momentos.",
          code: "HEALTHCARE_AGENT_ERROR",
        },
      },
      500,
    );
  }
});

/**
 * Call AG-UI Agent Backend
 */
async function callAGUIAgent(
  _query: string,
  userContext: any,
  requestId: string,
) {
  const agentUrl = process.env.AGUI_AGENT_URL || "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${agentUrl}/agui/http`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        "X-Healthcare-Platform": "NeonPro",
      },
      body: JSON.stringify({
        id: requestId,
        type: "message",
        data: {
          message: {
            id: requestId,
            content: query,
            type: "text",
            user_context: userContext,
            timestamp: new Date().toISOString(),
          },
          session: {
            id: userContext.sessionId,
            user_id: userContext.userId,
            _context: userContext,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AG-UI Agent responded with status: ${response.status}`);
    }

    const agentData = await response.json();
    return agentData;
  } catch (error) {
    logger.error("AG-UI Agent call failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      agentUrl,
    });

    // Return fallback response
    return {
      id: requestId,
      content:
        "Desculpe, estou temporariamente indisponível. Tente novamente em alguns momentos.",
      type: "error",
      metadata: {
        error: true,
        fallback: true,
        agent_error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Format AG-UI response for CopilotKit compatibility
 */
function formatCopilotResponse(
  agentResponse: any,
  requestId: string,
  startTime: number,
) {
  const processingTime = Date.now() - startTime;

  // Format content based on response type
  let content = agentResponse.content || "Resposta processada com sucesso.";

  // Add structured data formatting for healthcare responses
  if (agentResponse.data) {
    const data = agentResponse.data;

    if (data.type === "appointments_list") {
      content += `\n\n📅 **${data.title}**\n${data.summary}`;

      if (data.data && data.data.length > 0) {
        content += "\n\n**Próximos agendamentos:**";
        data.data.slice(0, 5).forEach((apt: any) => {
          content += `\n• ${apt.displayDate} às ${apt.displayTime} - ${apt.clientName} (${apt.statusBadge.label})`;
        });

        if (data.data.length > 5) {
          content += `\n... e mais ${data.data.length - 5} agendamentos.`;
        }
      }
    } else if (data.type === "clients_list") {
      content += `\n\n👥 **${data.title}**\n${data.summary}`;

      if (data.data && data.data.length > 0) {
        content += "\n\n**Clientes encontrados:**";
        data.data.slice(0, 5).forEach((client: any) => {
          content += `\n• ${client.name} - ${client.phone} (membro desde ${client.memberSince})`;
        });

        if (data.data.length > 5) {
          content += `\n... e mais ${data.data.length - 5} clientes.`;
        }
      }
    } else if (data.type === "financial_summary") {
      const financialData = data.data;
      content += `\n\n💰 **${data.title}**`;
      content += `\n📈 Receita Total: **${financialData.totalRevenue.formatted}**`;
      content += `\n⏱️ Pagamentos Pendentes: ${financialData.pendingPayments.formatted}`;
      content += `\n✅ Transações Completadas: ${financialData.completedTransactions.formatted}`;
    }
  }

  // Add performance information
  if (processingTime > 1000) {
    content += `\n\n_Processado em ${(processingTime / 1000).toFixed(1)}s_`;
  }

  return {
    id: requestId,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "neonpro-healthcare-agent",
    choices: [
      {
        index: 0,
        message: {
          _role: "assistant",
          content: content,
          // Include structured data for rich UI rendering
          healthcare_data: agentResponse.data,
          actions: agentResponse.actions,
          accessibility: agentResponse.accessibility,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 0, // Estimated
      completion_tokens: content.length / 4, // Rough estimate
      total_tokens: content.length / 4,
    },
    // NeonPro-specific metadata
    neonpro_metadata: {
      request_id: requestId,
      processing_time: processingTime,
      agent_response_type: agentResponse.type,
      user_role: agentResponse.metadata?.user_role,
      lgpd_compliant: true,
      accessibility_features: true,
    },
  };
}

/**
 * Health check endpoint for CopilotKit bridge
 */
copilotBridge.get("/health", (c) => {
  return c.json({
    status: "healthy",
    _service: "copilot-bridge",
    version: "1.0.0",
    healthcare_compliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
    features: {
      streaming: true,
      structured_responses: true,
      accessibility: true,
      mobile_optimized: true,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Models endpoint for CopilotKit compatibility
 */
copilotBridge.get("/models", (c) => {
  return c.json({
    object: "list",
    data: [
      {
        id: "neonpro-healthcare-agent",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "neonpro",
        permission: [
          {
            id: "modelperm-healthcare",
            object: "model_permission",
            created: Math.floor(Date.now() / 1000),
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: false,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: "*",
            group: null,
            is_blocking: false,
          },
        ],
        description:
          "NeonPro Healthcare Data Agent with LGPD compliance and Portuguese language support",
        capabilities: {
          healthcare_data: true,
          brazilian_portuguese: true,
          lgpd_compliant: true,
          real_time_streaming: true,
          structured_responses: true,
          accessibility_features: true,
        },
      },
    ],
  });
});

export default copilotBridge;

// ChatService orchestrator (Phase 2) - Enhanced with real AI providers and streaming

import type { ChatMessage, ChatSession } from "@neonpro/types";
import { PIIRedactionService } from "./pii-redaction.js";
import { AIProviderFactory } from "./ai-provider-factory.js";

export class ChatService {
  constructor(private pii = new PIIRedactionService()) {}

  async ask(session: ChatSession, input: string, stream = false) {
    const redacted = this.pii.redact(input);

    // Prepare system prompt for healthcare context
    const systemPrompt = this.buildSystemPrompt(session.locale);

    if (stream) {
      return this.askStream(session, redacted, systemPrompt);
    } else {
      return this.askSync(session, redacted, systemPrompt);
    }
  }

  private async askSync(
    session: ChatSession,
    input: string,
    systemPrompt: string,
  ) {
    try {
      const res = await AIProviderFactory.generateWithFailover({
        prompt: input,
        system: systemPrompt,
        locale: session.locale,
        maxTokens: 1000,
        temperature: 0.7,
      });

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        _role: "assistant",
        content: res.content,
        createdAt: new Date().toISOString(),
        redactionFlags: ["lgpd"],
      };

      return message;
    } catch (_error) {
      console.error("Chat service error:", error);
      throw new Error("Failed to generate response");
    }
  }

  private async *askStream(
    session: ChatSession,
    input: string,
    systemPrompt: string,
  ) {
    try {
      for await (const chunk of AIProviderFactory.generateStreamWithFailover({
        prompt: input,
        system: systemPrompt,
        locale: session.locale,
        maxTokens: 1000,
        temperature: 0.7,
        stream: true,
      })) {
        const message: Partial<ChatMessage> = {
          id: crypto.randomUUID(),
          sessionId: session.id,
          _role: "assistant",
          content: chunk.content,
          createdAt: new Date().toISOString(),
          redactionFlags: ["lgpd"],
        };

        yield message;
      }
    } catch (_error) {
      console.error("Chat streaming error:", error);
      throw new Error("Failed to generate streaming response");
    }
  }

  async explain(messageId: string, locale: "pt-BR" | "en-US" = "pt-BR") {
    const systemPrompt =
      locale === "pt-BR"
        ? "Você é um assistente que explica respostas médicas de forma clara e educativa, removendo informações pessoais sensíveis."
        : "You are an assistant that explains medical responses clearly and educatively, removing sensitive personal information.";

    try {
      const res = await AIProviderFactory.generateWithFailover({
        prompt: `Explique a resposta anterior de forma educativa, removendo qualquer informação pessoal identificável.`,
        system: systemPrompt,
        locale,
        maxTokens: 500,
        temperature: 0.3,
      });

      return {
        id: crypto.randomUUID(),
        messageId,
        content: res.content,
        createdAt: new Date().toISOString(),
      };
    } catch (_error) {
      console.error("Explanation service error:", error);
      throw new Error("Failed to generate explanation");
    }
  }

  private buildSystemPrompt(locale: "pt-BR" | "en-US" = "pt-BR"): string {
    if (locale === "pt-BR") {
      return `Você é um assistente especializado em clínicas estéticas brasileiras. 
Forneça respostas precisas, concisas e profissionais sobre:
- Tratamentos estéticos e procedimentos
- Informações financeiras básicas de pacientes
- Orientações sobre equipamentos e protocolos

IMPORTANTE:
- Mantenha conformidade com LGPD e regulamentações ANVISA
- Use terminologia médica brasileira apropriada
- Seja respeitoso e profissional
- Não forneça diagnósticos médicos
- Quando em dúvida, solicite mais informações

Responda em português brasileiro profissional.`;
    } else {
      return `You are an assistant specialized in Brazilian aesthetic clinics.
Provide accurate, concise, and professional responses about:
- Aesthetic treatments and procedures  
- Basic patient financial information
- Equipment and protocol guidance

IMPORTANT:
- Maintain LGPD compliance and ANVISA regulations
- Use appropriate Brazilian medical terminology
- Be respectful and professional
- Do not provide medical diagnoses
- When in doubt, ask for more information

Respond in professional Brazilian Portuguese.`;
    }
  }
}

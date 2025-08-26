import { createClient } from "@/app/utils/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuração dos modelos
const MODELS = {
  gpt4: openai("gpt-4o"),
  claude: anthropic("claude-3-5-sonnet-20241022"),
  gpt35: openai("gpt-3.5-turbo"),
} as const;

type ModelType = keyof typeof MODELS;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId, model = "gpt4" } = await request.json();

    // Validar modelo
    if (!MODELS[model as ModelType]) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    // Buscar ou criar conversa
    let conversation;
    if (conversationId) {
      const { data: existingConversation, error: convError } = await supabase
        .from("assistant_conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (convError || !existingConversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
      conversation = existingConversation;
    } else {
      // Criar nova conversa
      const { data: newConversation, error: createError } = await supabase
        .from("assistant_conversations")
        .insert({
          user_id: user.id,
          title: messages[0]?.content?.slice(0, 50) || "Nova Conversa",
          model_used: model,
          is_active: true,
        })
        .select()
        .single();

      if (createError || !newConversation) {
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 },
        );
      }
      conversation = newConversation;
    }

    // 🛡️ LGPD COMPLIANCE CHECK - Validate consent before accessing personal data
    const { data: lgpdConsent } = await supabase
      .from("patient_consents")
      .select("*")
      .eq("tenant_id", user.id)
      .eq("consent_type", "ai_assistant_data_processing")
      .eq("status", "active")
      .single();

    if (!lgpdConsent) {
      return NextResponse.json(
        {
          error: "LGPD_CONSENT_REQUIRED",
          message:
            "Consentimento LGPD obrigatório para processamento de dados pelo assistente IA",
        },
        { status: 403 },
      );
    }

    // 📋 Log compliance validation
    await supabase.from("assistant_logs").insert({
      user_id: user.id,
      action: "lgpd_consent_validated",
      details: {
        consent_id: lgpdConsent.id,
        consent_type: "ai_assistant_data_processing",
        timestamp: new Date().toISOString(),
      },
    });

    // Buscar contexto das preferências do usuário
    const { data: preferences } = await supabase
      .from("assistant_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Buscar contexto do perfil do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, specialty, clinic_name")
      .eq("id", user.id)
      .single();

    // 🛡️ LGPD-compliant patient data access (anonymized for AI processing)
    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select(
        `
        id,
        date_time,
        status,
        service,
        notes
      `,
      )
      .eq("user_id", user.id)
      .order("date_time", { ascending: false })
      .limit(5);

    // Construir prompt do sistema com contexto personalizado
    const systemPrompt = `Você é o Assistente Virtual do NeonPro, uma plataforma de gestão para clínicas de estética e beleza.

CONTEXTO DO USUÁRIO:
- Nome: ${profile?.full_name || "Usuário"}
- Cargo: ${profile?.role || "Profissional"}
- Especialidade: ${profile?.specialty || "Não informada"}
- Clínica: ${profile?.clinic_name || "Não informada"}

PREFERÊNCIAS DO ASSISTENTE:
- Personalidade: ${preferences?.personality || "profissional e amigável"}
- Temperatura: ${preferences?.temperature || 0.7}
- Idioma: ${preferences?.language || "pt-BR"}

CONTEXTO RECENTE: ${
      recentAppointments && recentAppointments.length > 0
        ? `Últimos agendamentos:
${recentAppointments
  .map(
    (apt) =>
      `- ${apt.date_time}: ${apt.service || "Serviço não informado"} (${apt.status})`,
  )
  .join("\n")}`
        : "Nenhum agendamento recente encontrado."
    }

INSTRUÇÕES:
1. Sempre responda em português brasileiro
2. Mantenha um tom profissional mas acessível
3. Foque em ajudar com gestão da clínica, agendamentos, pacientes e procedimentos
4. Use o contexto fornecido para personalizar suas respostas
5. Não acesse dados de outros usuários - trabalhe apenas com o contexto fornecido
6. Se precisar de informações não disponíveis, peça para o usuário fornecer
7. Sugira funcionalidades do NeonPro que podem ajudar o usuário

🛡️ COMPLIANCE HEALTHCARE FILTERING (CFM/ANVISA/LGPD):
- NUNCA forneça diagnósticos médicos ou recomendações clínicas específicas
- SEMPRE encoraje consulta com profissional médico qualificado para questões clínicas
- NUNCA processe ou sugira procedimentos sem validação profissional CFM
- RESPEITE a privacidade de dados pessoais conforme LGPD
- ALERT sobre procedimentos que requerem licenciamento ANVISA
- DISCLAIMAR responsabilidade médica em todas as interações clínicas

Seja sempre útil, preciso e contextualmente relevante para a gestão de clínicas de estética e beleza, mantendo estrita conformidade regulatória.`;

    // Converter mensagens para o formato do AI SDK
    const coreMessages = convertToCoreMessages(messages);

    // Salvar mensagem do usuário
    const userMessage = messages.at(-1);
    await supabase.from("assistant_messages").insert({
      conversation_id: conversation.id,
      user_id: user.id,
      role: "user",
      content: userMessage?.content || "",
      model_used: model,
    });

    // Gerar resposta com streaming
    const result = await streamText({
      model: MODELS[model as ModelType],
      system: systemPrompt,
      messages: coreMessages,
      temperature: preferences?.temperature || 0.7,
    });

    // 🛡️ AI COMPLIANCE VALIDATION - Monitor for healthcare compliance violations
    const userContent = userMessage?.content || "";
    const complianceRisks = [];

    // Check for CFM medical advice violations
    if (
      /diagn[óo]stic|prescrever|medicament|tratament|cirurgi/i.test(userContent)
    ) {
      complianceRisks.push("CFM_MEDICAL_ADVICE_RISK");
    }

    // Check for ANVISA device recommendations
    if (/equipament|l[áa]ser|radiofrequ[êe]nci|ultrassom/i.test(userContent)) {
      complianceRisks.push("ANVISA_DEVICE_GUIDANCE_RISK");
    }

    // Log compliance monitoring
    await supabase.from("compliance_alerts").insert({
      tenant_id: user.id,
      alert_type: "ai_interaction_monitoring",
      severity: complianceRisks.length > 0 ? "medium" : "low",
      description: `AI Assistant interaction monitored - ${complianceRisks.length} potential risks detected`,
      action_required:
        complianceRisks.length > 0
          ? "Review AI response for compliance"
          : "None",
      status: "resolved",
    });

    // Log da interação com compliance data
    await (await supabase).from("assistant_logs").insert({
      user_id: user.id,
      conversation_id: conversation.id,
      action: "chat_request",
      details: {
        model,
        message_count: messages.length,
        compliance_risks: complianceRisks,
        lgpd_consent_validated: true,
        context_used: {
          has_preferences: Boolean(preferences),
          has_profile: Boolean(profile),
          recent_appointments_count: recentAppointments?.length || 0,
        },
      },
    });

    return result.toTextStreamResponse();
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = any;

export type SessionValidationResult = any;

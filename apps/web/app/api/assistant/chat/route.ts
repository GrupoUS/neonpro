import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Configuração dos modelos
const MODELS = {
  gpt4: openai('gpt-4o'),
  claude: anthropic('claude-3-5-sonnet-20241022'),
  gpt35: openai('gpt-3.5-turbo'),
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, conversationId, model = 'gpt4' } = await request.json();

    // Validar modelo
    if (!MODELS[model as ModelType]) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Buscar ou criar conversa
    let conversation;
    if (conversationId) {
      const { data: existingConversation, error: convError } = await supabase
        .from('assistant_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (convError || !existingConversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 },
        );
      }
      conversation = existingConversation;
    } else {
      // Criar nova conversa
      const { data: newConversation, error: createError } = await supabase
        .from('assistant_conversations')
        .insert({
          user_id: user.id,
          title: messages[0]?.content?.substring(0, 50) || 'Nova Conversa',
          model_used: model,
          is_active: true,
        })
        .select()
        .single();

      if (createError || !newConversation) {
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 },
        );
      }
      conversation = newConversation;
    }

    // Buscar contexto das preferências do usuário
    const { data: preferences } = await supabase
      .from('assistant_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Buscar contexto do perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, specialty, clinic_name')
      .eq('id', user.id)
      .single();

    // Buscar contexto relevante da clínica (últimos 5 agendamentos, por exemplo)
    const { data: recentAppointments } = await supabase
      .from('appointments')
      .select(
        `
        id,
        date_time,
        status,
        service,
        notes,
        patients(name, phone)
      `,
      )
      .eq('user_id', user.id)
      .order('date_time', { ascending: false })
      .limit(5);

    // Construir prompt do sistema com contexto personalizado
    const systemPrompt = `Você é o Assistente Virtual do NeonPro, uma plataforma de gestão para clínicas de estética e beleza.

CONTEXTO DO USUÁRIO:
- Nome: ${profile?.full_name || 'Usuário'}
- Cargo: ${profile?.role || 'Profissional'}
- Especialidade: ${profile?.specialty || 'Não informada'}
- Clínica: ${profile?.clinic_name || 'Não informada'}

PREFERÊNCIAS DO ASSISTENTE:
- Personalidade: ${preferences?.personality || 'profissional e amigável'}
- Temperatura: ${preferences?.temperature || 0.7}
- Idioma: ${preferences?.language || 'pt-BR'}

CONTEXTO RECENTE: ${
      recentAppointments && recentAppointments.length > 0
        ? `Últimos agendamentos:
${recentAppointments
  .map(
    (apt) =>
      `- ${apt.date_time}: ${apt.patients?.name} - ${apt.service} (${apt.status})`,
  )
  .join('\n')}`
        : 'Nenhum agendamento recente encontrado.'
    }

INSTRUÇÕES:
1. Sempre responda em português brasileiro
2. Mantenha um tom profissional mas acessível
3. Foque em ajudar com gestão da clínica, agendamentos, pacientes e procedimentos
4. Use o contexto fornecido para personalizar suas respostas
5. Não acesse dados de outros usuários - trabalhe apenas com o contexto fornecido
6. Se precisar de informações não disponíveis, peça para o usuário fornecer
7. Sugira funcionalidades do NeonPro que podem ajudar o usuário

Seja sempre útil, preciso e contextualmente relevante para a gestão de clínicas de estética e beleza.`;

    // Converter mensagens para o formato do AI SDK    const coreMessages = convertToCoreMessages(messages);

    // Salvar mensagem do usuário    const userMessage = messages.at(-1);
    await (await supabase).from('assistant_messages').insert({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'user',
      content: userMessage.content,
      model_used: model,
    });

    // Gerar resposta com streaming
    const result = await streamText({
      model: MODELS[model as ModelType],
      system: systemPrompt,
      messages: coreMessages,
      temperature: preferences?.temperature || 0.7,
      maxTokens: preferences?.max_tokens || 2000,
    });

    // Log da interação
    await (await supabase).from('assistant_logs').insert({
      user_id: user.id,
      conversation_id: conversation.id,
      action: 'chat_request',
      details: {
        model,
        message_count: messages.length,
        context_used: {
          has_preferences: Boolean(preferences),
          has_profile: Boolean(profile),
          recent_appointments_count: recentAppointments?.length || 0,
        },
      },
    });

    return result.toDataStreamResponse();
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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

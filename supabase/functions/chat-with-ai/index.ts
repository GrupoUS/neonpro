
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, config, sessionId } = await req.json()
    
    if (!config?.openrouter_api_key) {
      return new Response(
        JSON.stringify({ error: 'API key do OpenRouter não configurada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configurar o contexto do NEON PRO
    const systemMessage = {
      role: 'system',
      content: `Você é o assistente AI do NEON PRO, um sistema completo para gestão de clínicas de estética. 
      
Seu papel é ajudar profissionais da área de estética a:
- Gerenciar agendamentos e clientes
- Organizar procedimentos e serviços
- Controlar finanças da clínica
- Acompanhar relatórios e métricas
- Otimizar operações diárias

Características importantes:
- Seja sempre profissional e prestativo
- Use linguagem clara e direta
- Forneça respostas práticas e acionáveis
- Mantenha foco na área de estética e gestão clínica
- Quando apropriado, sugira funcionalidades específicas do NEON PRO

Personalidade: ${config.personalidade?.descricao || 'Profissional, prestativo e especializado em estética'}`
    }

    // Preparar mensagens para OpenRouter
    const openRouterMessages = [
      systemMessage,
      ...messages.map((msg: any) => ({
        role: msg.tipo === 'user' ? 'user' : 'assistant',
        content: msg.conteudo
      }))
    ]

    // Fazer chamada para OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouter_api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://neon-pro.app',
        'X-Title': 'NEON PRO - Sistema de Gestão para Clínicas de Estética'
      },
      body: JSON.stringify({
        model: config.modelo_preferido || 'anthropic/claude-3-sonnet',
        messages: openRouterMessages,
        temperature: config.temperatura || 0.7,
        max_tokens: config.max_tokens || 2000,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Erro do OpenRouter:', errorData)
      throw new Error(`OpenRouter error: ${response.status}`)
    }

    const data = await response.json()
    
    // Registrar analytics
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (user) {
      await supabase.from('chatbot_analytics').insert({
        user_id: user.id,
        session_id: sessionId,
        evento: 'message_sent',
        dados: {
          model: config.modelo_preferido,
          tokens_used: data.usage?.total_tokens || 0,
          timestamp: new Date().toISOString()
        }
      })
    }

    return new Response(
      JSON.stringify({
        message: data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.',
        usage: data.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
